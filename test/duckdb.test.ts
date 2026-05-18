import { expect, test } from "bun:test";
import {
  createDuckDbObjectDatabase,
  duckDbGraphTableNames,
  indexSpeckleObjectGraph,
  type DuckDbConnectionLike,
  type DuckDbQueryParams,
  type DuckDbResultReaderLike,
} from "../src/duckdb.js";
import type { SpeckleBase, SpeckleObjectHandle, SpeckleObjectItem } from "../src/objects.js";

class FakeDuckDbConnection implements DuckDbConnectionLike {
  readonly cache = new Map<string, SpeckleObjectItem>();
  readonly objectRows: Array<Record<string, unknown>> = [];
  readonly edgeRows: Array<Record<string, unknown>> = [];
  readonly propertyRows: Array<Record<string, unknown>> = [];
  readonly proxyMembershipRows: Array<Record<string, unknown>> = [];
  closeCalls = 0;

  async run(sql: string, values?: DuckDbQueryParams): Promise<unknown> {
    const normalized = sql.toLowerCase();
    const row = paramsRecord(values);

    if (normalized.includes("insert or replace into") && row["item_json"] !== undefined) {
      const namespace = String(row["namespace"]);
      const baseId = String(row["base_id"]);
      this.cache.set(`${namespace}:${baseId}`, JSON.parse(String(row["item_json"])));
      return undefined;
    }

    if (normalized.includes("delete from")) {
      this.clearRowsForSql(normalized);
      return undefined;
    }

    if (normalized.includes("insert or replace into") && normalized.includes("speckle_graph_objects")) {
      this.objectRows.push(row);
      return undefined;
    }
    if (normalized.includes("insert into") && normalized.includes("speckle_graph_edges")) {
      this.edgeRows.push(row);
      return undefined;
    }
    if (normalized.includes("insert into") && normalized.includes("speckle_graph_properties")) {
      this.propertyRows.push(row);
      return undefined;
    }
    if (normalized.includes("insert into") && normalized.includes("speckle_graph_proxy_memberships")) {
      this.proxyMembershipRows.push(row);
      return undefined;
    }

    return undefined;
  }

  async runAndReadAll(_sql: string, values?: DuckDbQueryParams): Promise<DuckDbResultReaderLike> {
    const params = paramsRecord(values);
    const namespace = String(params["namespace"]);
    const ids = Object.keys(params)
      .filter((key) => key.startsWith("id"))
      .sort((a, b) => Number(a.slice(2)) - Number(b.slice(2)))
      .map((key) => String(params[key]));
    const rows = ids.flatMap((id) => {
      const item = this.cache.get(`${namespace}:${id}`);
      return item === undefined ? [] : [{ base_id: id, item_json: JSON.stringify(item) }];
    });
    return { getRowObjectsJson: () => rows };
  }

  closeSync(): void {
    this.closeCalls++;
  }

  private clearRowsForSql(sql: string): void {
    if (sql.includes("speckle_graph_objects")) this.objectRows.length = 0;
    if (sql.includes("speckle_graph_edges")) this.edgeRows.length = 0;
    if (sql.includes("speckle_graph_properties")) this.propertyRows.length = 0;
    if (sql.includes("speckle_graph_proxy_memberships")) this.proxyMembershipRows.length = 0;
  }
}

function paramsRecord(values: DuckDbQueryParams | undefined): Record<string, unknown> {
  return values !== undefined && !Array.isArray(values) ? values as Record<string, unknown> : {};
}

function base(id: string, overrides: Record<string, unknown> = {}): SpeckleBase {
  return { id, speckle_type: "Objects.Data.DataObject", ...overrides } as SpeckleBase;
}

function handleFrom(objects: Record<string, SpeckleBase>, rootId = "root"): SpeckleObjectHandle {
  const root = objects[rootId];
  if (root === undefined) throw new Error(`Missing root object '${rootId}'`);
  return {
    rootId,
    rootClosureSize: Object.keys(root.__closure ?? {}).length,
    objectIds: Object.keys(objects),
    getObject: async (id) => {
      const object = objects[id];
      if (object === undefined) throw new Error(`Missing object '${id}'`);
      return object;
    },
    getObjects: async (ids) => ids.map((id) => objects[id]),
    getRoot: async () => root,
  };
}

test("DuckDB object database preserves getAll order", async () => {
  const connection = new FakeDuckDbConnection();
  const database = createDuckDbObjectDatabase({ connection, disposeConnection: true });
  const root = base("root");
  const item: SpeckleObjectItem = { baseId: root.id, base: root, size: 1 };

  await database.putAll([item]);

  await expect(database.getAll(["missing", root.id])).resolves.toEqual([undefined, item]);
  await database.dispose?.();
  expect(connection.closeCalls).toBe(1);
});

test("DuckDB table identifiers are validated", () => {
  expect(() => duckDbGraphTableNames("speckle_graph")).not.toThrow();
  expect(() => duckDbGraphTableNames("speckle-graph")).toThrow(/Invalid DuckDB identifier/);
  expect(() => createDuckDbObjectDatabase({
    connection: new FakeDuckDbConnection(),
    tableName: "bad;drop",
  })).toThrow(/Invalid DuckDB identifier/);
});

test("DuckDB graph index captures structural matching data", async () => {
  const root = base("root", {
    speckle_type: "Speckle.Core.Models.Collections.Collection",
    __closure: { wall_1: 1, mesh_1: 2 },
    elements: [{ speckle_type: "reference", referencedId: "wall_1" }],
    levelProxies: [
      {
        speckle_type: "Objects.BuiltElements.Level",
        applicationId: "level-app",
        name: "Level 1",
        value: { name: "Level 1" },
        objects: ["wall-app"],
      },
    ],
  });
  const wall = base("wall_1", {
    applicationId: "wall-app",
    name: "Basic Wall - 200mm",
    properties: {
      category: "Walls",
      Parameters: {
        "Identity Data": {
          Mark: { value: "W-101" },
        },
      },
    },
    displayValue: [{ speckle_type: "reference", referencedId: "mesh_1" }],
  });
  const mesh = base("mesh_1", {
    speckle_type: "Objects.Geometry.Mesh",
    vertices: [0, 0, 0, 1, 0, 0, 1, 1, 0],
    faces: [3, 0, 1, 2],
  });
  const connection = new FakeDuckDbConnection();

  const result = await indexSpeckleObjectGraph({
    connection,
    handle: handleFrom({ root, wall_1: wall, mesh_1: mesh }),
    graphId: "graph-1",
    projectId: "project-1",
    modelId: "model-1",
    versionId: "version-1",
  });

  expect(result.objectCount).toBe(3);
  expect(result.edgeCount).toBeGreaterThanOrEqual(2);
  expect(result.propertyCount).toBeGreaterThan(0);
  expect(result.proxyMembershipCount).toBe(1);
  expect(connection.objectRows).toContainEqual(
    expect.objectContaining({
      object_id: "wall_1",
      application_id: "wall-app",
      has_properties: true,
      has_display_value: true,
    }),
  );
  expect(connection.edgeRows).toContainEqual(
    expect.objectContaining({
      from_id: "root",
      to_id: "wall_1",
      edge_kind: "elements",
      path: "$.elements[0]",
    }),
  );
  expect(connection.edgeRows).toContainEqual(
    expect.objectContaining({
      from_id: "wall_1",
      to_id: "mesh_1",
      edge_kind: "display_value",
      path: "$.displayValue[0]",
    }),
  );
  expect(connection.propertyRows).toContainEqual(
    expect.objectContaining({
      object_id: "wall_1",
      key: "category",
      key_norm: "category",
      value_text: "Walls",
    }),
  );
  expect(connection.proxyMembershipRows).toEqual([
    expect.objectContaining({
      proxy_id: "level-app",
      proxy_type: "Objects.BuiltElements.Level",
      proxy_name: "Level 1",
      target_application_id: "wall-app",
      target_object_id: "wall_1",
    }),
  ]);
});
