import type {
  SpeckleBase,
  SpeckleObjectDatabase,
  SpeckleObjectHandle,
  SpeckleObjectItem,
} from "./objects.js";

export type DuckDbQueryParams = readonly unknown[] | Record<string, unknown>;

export interface DuckDbResultReaderLike {
  getRowObjectsJson?(): Array<Record<string, unknown>>;
  getRowObjects?(): Array<Record<string, unknown>>;
}

export interface DuckDbConnectionLike {
  run(sql: string, values?: DuckDbQueryParams): Promise<unknown>;
  runAndReadAll(sql: string, values?: DuckDbQueryParams): Promise<DuckDbResultReaderLike>;
  closeSync?(): void;
  disconnectSync?(): void;
}

export interface DuckDbObjectDatabaseOptions {
  connection: DuckDbConnectionLike;
  namespace?: string;
  tableName?: string;
  selectChunkSize?: number;
  disposeConnection?: boolean;
}

export interface DuckDbGraphIndexOptions {
  connection: DuckDbConnectionLike;
  handle: SpeckleObjectHandle;
  graphId?: string;
  projectId?: string;
  modelId?: string;
  versionId?: string | null;
  rootId?: string;
  tablePrefix?: string;
  batchSize?: number;
  maxPropertyArrayItems?: number;
  loadedAt?: Date | string;
  disposeConnection?: boolean;
}

export interface DuckDbGraphTableNames {
  objects: string;
  edges: string;
  properties: string;
  proxyMemberships: string;
}

export interface DuckDbGraphIndexResult {
  graphId: string;
  objectCount: number;
  edgeCount: number;
  propertyCount: number;
  proxyMembershipCount: number;
  tables: DuckDbGraphTableNames;
}

interface DuckDbGraphObjectRow {
  graphId: string;
  projectId: string | null;
  modelId: string | null;
  versionId: string | null;
  rootId: string;
  objectId: string;
  applicationId: string | null;
  speckleType: string | null;
  name: string | null;
  hasProperties: boolean;
  hasDisplayValue: boolean;
  hasElements: boolean;
  objectJson: string;
  loadedAt: string;
}

interface DuckDbGraphEdgeRow {
  graphId: string;
  fromId: string;
  toId: string;
  edgeKind: string;
  path: string;
  parentPath: string | null;
  key: string | null;
  ordinal: number | null;
}

interface DuckDbGraphPropertyRow {
  graphId: string;
  objectId: string;
  path: string;
  key: string | null;
  keyNorm: string | null;
  valueType: string;
  valueText: string | null;
  valueNum: number | null;
  valueBool: boolean | null;
  valueJson: string;
}

interface DuckDbGraphProxyMembershipRow {
  graphId: string;
  proxyId: string;
  proxyApplicationId: string | null;
  proxyType: string;
  proxyName: string | null;
  targetApplicationId: string;
  targetObjectId: string | null;
  path: string;
}

const DEFAULT_CACHE_TABLE = "speckle_object_cache";
const DEFAULT_GRAPH_TABLE_PREFIX = "speckle_graph";
const DEFAULT_NAMESPACE = "default";
const DEFAULT_BATCH_SIZE = 500;
const DEFAULT_PROPERTY_ARRAY_LIMIT = 200;
const IDENTIFIER_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
const SCALAR_ARRAY_JSON_KEYS = new Set(["transform"]);
const HEAVY_PROPERTY_KEYS = new Set([
  "__closure",
  "displayValue",
  "@displayValue",
  "vertices",
  "faces",
  "colors",
  "normals",
  "textureCoordinates",
]);

export function createDuckDbObjectDatabase(
  opts: DuckDbObjectDatabaseOptions,
): SpeckleObjectDatabase {
  const tableName = quoteIdentifier(opts.tableName ?? DEFAULT_CACHE_TABLE);
  const namespace = opts.namespace ?? DEFAULT_NAMESPACE;
  const selectChunkSize = opts.selectChunkSize ?? DEFAULT_BATCH_SIZE;
  let initialized: Promise<void> | null = null;

  const ensureTable = (): Promise<void> => {
    initialized ??= opts.connection.run(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        namespace VARCHAR NOT NULL,
        base_id VARCHAR NOT NULL,
        item_json JSON NOT NULL,
        object_json JSON,
        speckle_type VARCHAR,
        size UBIGINT,
        updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
        PRIMARY KEY (namespace, base_id)
      )
    `).then(() => undefined);
    return initialized;
  };

  return {
    async getAll(ids) {
      await ensureTable();
      if (ids.length === 0) return [];

      const found = new Map<string, SpeckleObjectItem>();
      for (let i = 0; i < ids.length; i += selectChunkSize) {
        const batch = ids.slice(i, i + selectChunkSize);
        const params: Record<string, unknown> = { namespace };
        const placeholders = batch.map((id, index) => {
          const key = `id${index}`;
          params[key] = id;
          return `$${key}`;
        });
        const reader = await opts.connection.runAndReadAll(
          `
            SELECT base_id, CAST(item_json AS VARCHAR) AS item_json
            FROM ${tableName}
            WHERE namespace = $namespace AND base_id IN (${placeholders.join(", ")})
          `,
          params,
        );

        for (const row of readDuckDbRows(reader)) {
          const baseId = stringValue(row["base_id"]);
          if (baseId === null) continue;
          found.set(baseId, parseSpeckleObjectItem(row["item_json"]));
        }
      }

      return ids.map((id) => found.get(id));
    },
    async putAll(batch) {
      await ensureTable();
      if (batch.length === 0) return;

      await withDuckDbTransaction(opts.connection, async () => {
        for (const item of batch) {
          if (!item.baseId) throw new Error("Speckle DuckDB cache item missing baseId");
          await opts.connection.run(
            `
              INSERT OR REPLACE INTO ${tableName}
                (namespace, base_id, item_json, object_json, speckle_type, size, updated_at)
              VALUES
                (
                  $namespace,
                  $base_id,
                  CAST($item_json AS JSON),
                  CAST($object_json AS JSON),
                  $speckle_type,
                  $size,
                  current_timestamp
                )
            `,
            {
              namespace,
              base_id: item.baseId,
              item_json: JSON.stringify(item),
              object_json: JSON.stringify(item.base ?? null),
              speckle_type: stringField(item.base, "speckle_type"),
              size: typeof item.size === "number" ? item.size : null,
            },
          );
        }
      });
    },
    dispose() {
      if (opts.disposeConnection === true) closeDuckDbConnection(opts.connection);
    },
  };
}

export function duckDbGraphTableNames(
  tablePrefix = DEFAULT_GRAPH_TABLE_PREFIX,
): DuckDbGraphTableNames {
  const prefix = validateIdentifier(tablePrefix);
  return {
    objects: quoteIdentifier(`${prefix}_objects`),
    edges: quoteIdentifier(`${prefix}_edges`),
    properties: quoteIdentifier(`${prefix}_properties`),
    proxyMemberships: quoteIdentifier(`${prefix}_proxy_memberships`),
  };
}

export async function indexSpeckleObjectGraph(
  opts: DuckDbGraphIndexOptions,
): Promise<DuckDbGraphIndexResult> {
  const rootId = opts.rootId ?? opts.handle.rootId;
  const graphId = opts.graphId ?? defaultGraphId(opts.projectId, opts.modelId, opts.versionId, rootId);
  const tables = duckDbGraphTableNames(opts.tablePrefix);
  const loadedAt = (opts.loadedAt instanceof Date ? opts.loadedAt : new Date(opts.loadedAt ?? Date.now()))
    .toISOString();
  const objects = await loadHandleObjects(opts.handle, opts.batchSize ?? DEFAULT_BATCH_SIZE);
  const root = objects.get(rootId) ?? (await opts.handle.getRoot());
  objects.set(root.id, root);

  const objectRows = createObjectRows(objects, {
    graphId,
    projectId: opts.projectId ?? null,
    modelId: opts.modelId ?? null,
    versionId: opts.versionId ?? null,
    rootId,
    loadedAt,
  });
  const edgeRows = createEdgeRows(objects, graphId);
  const propertyRows = createPropertyRows(
    objects,
    graphId,
    opts.maxPropertyArrayItems ?? DEFAULT_PROPERTY_ARRAY_LIMIT,
  );
  const proxyMembershipRows = createProxyMembershipRows(objects, rootId, graphId);

  await createGraphTables(opts.connection, tables);
  await withDuckDbTransaction(opts.connection, async () => {
    await clearGraphRows(opts.connection, tables, graphId);
    for (const row of objectRows) await insertObjectRow(opts.connection, tables.objects, row);
    for (const row of edgeRows) await insertEdgeRow(opts.connection, tables.edges, row);
    for (const row of propertyRows) {
      await insertPropertyRow(opts.connection, tables.properties, row);
    }
    for (const row of proxyMembershipRows) {
      await insertProxyMembershipRow(opts.connection, tables.proxyMemberships, row);
    }
  });

  if (opts.disposeConnection === true) closeDuckDbConnection(opts.connection);

  return {
    graphId,
    objectCount: objectRows.length,
    edgeCount: edgeRows.length,
    propertyCount: propertyRows.length,
    proxyMembershipCount: proxyMembershipRows.length,
    tables,
  };
}

function createObjectRows(
  objects: ReadonlyMap<string, SpeckleBase>,
  context: Pick<
    DuckDbGraphObjectRow,
    "graphId" | "projectId" | "modelId" | "versionId" | "rootId" | "loadedAt"
  >,
): DuckDbGraphObjectRow[] {
  return [...objects.values()].map((object) => {
    const record = object as unknown as Record<string, unknown>;
    return {
      ...context,
      objectId: object.id,
      applicationId: stringField(object, "applicationId"),
      speckleType: stringField(object, "speckle_type"),
      name: stringField(object, "name"),
      hasProperties: isRecord(record["properties"]),
      hasDisplayValue: hasOwnValue(record, "displayValue") || hasOwnValue(record, "@displayValue"),
      hasElements: Array.isArray(record["elements"]),
      objectJson: JSON.stringify(object),
    };
  });
}

function createEdgeRows(
  objects: ReadonlyMap<string, SpeckleBase>,
  graphId: string,
): DuckDbGraphEdgeRow[] {
  const rows: DuckDbGraphEdgeRow[] = [];
  const seen = new Set<string>();
  for (const object of objects.values()) {
    collectEdges(object.id, object, rows, seen, graphId, "$", null, null, null, new WeakSet());
  }
  return rows;
}

function createPropertyRows(
  objects: ReadonlyMap<string, SpeckleBase>,
  graphId: string,
  maxArrayItems: number,
): DuckDbGraphPropertyRow[] {
  const rows: DuckDbGraphPropertyRow[] = [];
  for (const object of objects.values()) {
    collectProperties(object.id, object, rows, graphId, "$", null, maxArrayItems, new WeakSet());
  }
  return rows;
}

function createProxyMembershipRows(
  objects: ReadonlyMap<string, SpeckleBase>,
  rootId: string,
  graphId: string,
): DuckDbGraphProxyMembershipRow[] {
  const rows: DuckDbGraphProxyMembershipRow[] = [];
  const objectIdsByApplicationId = new Map<string, string>();
  for (const object of objects.values()) {
    const applicationId = stringField(object, "applicationId");
    if (applicationId !== null && !objectIdsByApplicationId.has(applicationId)) {
      objectIdsByApplicationId.set(applicationId, object.id);
    }
  }

  const root = objects.get(rootId);
  if (root === undefined) return rows;
  collectProxyMemberships(
    root,
    rows,
    objectIdsByApplicationId,
    graphId,
    "$",
    new WeakSet(),
  );
  return rows;
}

async function createGraphTables(
  connection: DuckDbConnectionLike,
  tables: DuckDbGraphTableNames,
): Promise<void> {
  await connection.run(`
    CREATE TABLE IF NOT EXISTS ${tables.objects} (
      graph_id VARCHAR NOT NULL,
      project_id VARCHAR,
      model_id VARCHAR,
      version_id VARCHAR,
      root_id VARCHAR NOT NULL,
      object_id VARCHAR NOT NULL,
      application_id VARCHAR,
      speckle_type VARCHAR,
      name VARCHAR,
      has_properties BOOLEAN NOT NULL,
      has_display_value BOOLEAN NOT NULL,
      has_elements BOOLEAN NOT NULL,
      object_json JSON NOT NULL,
      loaded_at TIMESTAMP NOT NULL,
      PRIMARY KEY (graph_id, object_id)
    )
  `);
  await connection.run(`
    CREATE TABLE IF NOT EXISTS ${tables.edges} (
      graph_id VARCHAR NOT NULL,
      from_id VARCHAR NOT NULL,
      to_id VARCHAR NOT NULL,
      edge_kind VARCHAR NOT NULL,
      path VARCHAR NOT NULL,
      parent_path VARCHAR,
      key VARCHAR,
      ordinal INTEGER
    )
  `);
  await connection.run(`
    CREATE TABLE IF NOT EXISTS ${tables.properties} (
      graph_id VARCHAR NOT NULL,
      object_id VARCHAR NOT NULL,
      path VARCHAR NOT NULL,
      key VARCHAR,
      key_norm VARCHAR,
      value_type VARCHAR NOT NULL,
      value_text VARCHAR,
      value_num DOUBLE,
      value_bool BOOLEAN,
      value_json JSON NOT NULL
    )
  `);
  await connection.run(`
    CREATE TABLE IF NOT EXISTS ${tables.proxyMemberships} (
      graph_id VARCHAR NOT NULL,
      proxy_id VARCHAR NOT NULL,
      proxy_application_id VARCHAR,
      proxy_type VARCHAR NOT NULL,
      proxy_name VARCHAR,
      target_application_id VARCHAR NOT NULL,
      target_object_id VARCHAR,
      path VARCHAR NOT NULL
    )
  `);
}

async function clearGraphRows(
  connection: DuckDbConnectionLike,
  tables: DuckDbGraphTableNames,
  graphId: string,
): Promise<void> {
  const values = { graph_id: graphId };
  await connection.run(`DELETE FROM ${tables.proxyMemberships} WHERE graph_id = $graph_id`, values);
  await connection.run(`DELETE FROM ${tables.properties} WHERE graph_id = $graph_id`, values);
  await connection.run(`DELETE FROM ${tables.edges} WHERE graph_id = $graph_id`, values);
  await connection.run(`DELETE FROM ${tables.objects} WHERE graph_id = $graph_id`, values);
}

async function insertObjectRow(
  connection: DuckDbConnectionLike,
  table: string,
  row: DuckDbGraphObjectRow,
): Promise<void> {
  await connection.run(
    `
      INSERT OR REPLACE INTO ${table}
        (
          graph_id,
          project_id,
          model_id,
          version_id,
          root_id,
          object_id,
          application_id,
          speckle_type,
          name,
          has_properties,
          has_display_value,
          has_elements,
          object_json,
          loaded_at
        )
      VALUES
        (
          $graph_id,
          $project_id,
          $model_id,
          $version_id,
          $root_id,
          $object_id,
          $application_id,
          $speckle_type,
          $name,
          $has_properties,
          $has_display_value,
          $has_elements,
          CAST($object_json AS JSON),
          $loaded_at
        )
    `,
    objectRowParams(row),
  );
}

async function insertEdgeRow(
  connection: DuckDbConnectionLike,
  table: string,
  row: DuckDbGraphEdgeRow,
): Promise<void> {
  await connection.run(
    `
      INSERT INTO ${table}
        (graph_id, from_id, to_id, edge_kind, path, parent_path, key, ordinal)
      VALUES
        ($graph_id, $from_id, $to_id, $edge_kind, $path, $parent_path, $key, $ordinal)
    `,
    {
      graph_id: row.graphId,
      from_id: row.fromId,
      to_id: row.toId,
      edge_kind: row.edgeKind,
      path: row.path,
      parent_path: row.parentPath,
      key: row.key,
      ordinal: row.ordinal,
    },
  );
}

async function insertPropertyRow(
  connection: DuckDbConnectionLike,
  table: string,
  row: DuckDbGraphPropertyRow,
): Promise<void> {
  await connection.run(
    `
      INSERT INTO ${table}
        (
          graph_id,
          object_id,
          path,
          key,
          key_norm,
          value_type,
          value_text,
          value_num,
          value_bool,
          value_json
        )
      VALUES
        (
          $graph_id,
          $object_id,
          $path,
          $key,
          $key_norm,
          $value_type,
          $value_text,
          $value_num,
          $value_bool,
          CAST($value_json AS JSON)
        )
    `,
    {
      graph_id: row.graphId,
      object_id: row.objectId,
      path: row.path,
      key: row.key,
      key_norm: row.keyNorm,
      value_type: row.valueType,
      value_text: row.valueText,
      value_num: row.valueNum,
      value_bool: row.valueBool,
      value_json: row.valueJson,
    },
  );
}

async function insertProxyMembershipRow(
  connection: DuckDbConnectionLike,
  table: string,
  row: DuckDbGraphProxyMembershipRow,
): Promise<void> {
  await connection.run(
    `
      INSERT INTO ${table}
        (
          graph_id,
          proxy_id,
          proxy_application_id,
          proxy_type,
          proxy_name,
          target_application_id,
          target_object_id,
          path
        )
      VALUES
        (
          $graph_id,
          $proxy_id,
          $proxy_application_id,
          $proxy_type,
          $proxy_name,
          $target_application_id,
          $target_object_id,
          $path
        )
    `,
    {
      graph_id: row.graphId,
      proxy_id: row.proxyId,
      proxy_application_id: row.proxyApplicationId,
      proxy_type: row.proxyType,
      proxy_name: row.proxyName,
      target_application_id: row.targetApplicationId,
      target_object_id: row.targetObjectId,
      path: row.path,
    },
  );
}

async function loadHandleObjects(
  handle: SpeckleObjectHandle,
  batchSize: number,
): Promise<Map<string, SpeckleBase>> {
  const objects = new Map<string, SpeckleBase>();
  const root = await handle.getRoot();
  objects.set(root.id, root);
  for (let i = 0; i < handle.objectIds.length; i += batchSize) {
    const ids = handle.objectIds.slice(i, i + batchSize);
    const batch = await handle.getObjects(ids);
    for (const object of batch) {
      if (object !== undefined) objects.set(object.id, object);
    }
  }
  return objects;
}

function collectEdges(
  fromId: string,
  value: unknown,
  rows: DuckDbGraphEdgeRow[],
  seen: Set<string>,
  graphId: string,
  path: string,
  parentPath: string | null,
  key: string | null,
  ordinal: number | null,
  visited: WeakSet<object>,
): void {
  if (value === null || typeof value !== "object") {
    if (typeof value === "string" && key?.startsWith("@")) {
      pushEdge(rows, seen, {
        graphId,
        fromId,
        toId: value,
        edgeKind: "detached_reference",
        path,
        parentPath,
        key,
        ordinal,
      });
    }
    return;
  }

  if (visited.has(value)) return;
  visited.add(value);

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      collectEdges(
        fromId,
        value[i],
        rows,
        seen,
        graphId,
        appendArrayPath(path, i),
        path,
        key,
        i,
        visited,
      );
    }
    return;
  }

  const record = value as Record<string, unknown>;
  const referencedId = referencedObjectId(record);
  if (referencedId !== null) {
    pushEdge(rows, seen, {
      graphId,
      fromId,
      toId: referencedId,
      edgeKind: referenceEdgeKindFor(key, ordinal),
      path,
      parentPath,
      key,
      ordinal,
    });
    return;
  }

  const childId = stringField(record, "id");
  if (childId !== null && childId !== fromId && stringField(record, "speckle_type") !== null) {
    pushEdge(rows, seen, {
      graphId,
      fromId,
      toId: childId,
      edgeKind: edgeKindFor(key, ordinal),
      path,
      parentPath,
      key,
      ordinal,
    });
  }

  for (const [childKey, child] of Object.entries(record)) {
    collectEdges(
      fromId,
      child,
      rows,
      seen,
      graphId,
      appendObjectPath(path, childKey),
      path,
      childKey,
      null,
      visited,
    );
  }
}

function collectProperties(
  objectId: string,
  value: unknown,
  rows: DuckDbGraphPropertyRow[],
  graphId: string,
  path: string,
  key: string | null,
  maxArrayItems: number,
  visited: WeakSet<object>,
): void {
  if (isScalar(value)) {
    rows.push(createPropertyRow(graphId, objectId, path, key, value));
    return;
  }

  if (value === null || typeof value !== "object") return;
  if (visited.has(value)) return;
  visited.add(value);

  if (key !== null && HEAVY_PROPERTY_KEYS.has(key)) return;

  if (Array.isArray(value)) {
    if (key !== null && SCALAR_ARRAY_JSON_KEYS.has(key)) {
      rows.push(createJsonPropertyRow(graphId, objectId, path, key, "array", value));
      return;
    }
    if (value.length > maxArrayItems && value.every(isScalar)) {
      rows.push(createJsonPropertyRow(graphId, objectId, path, key, "array", value));
      return;
    }
    const limit = Math.min(value.length, maxArrayItems);
    for (let i = 0; i < limit; i++) {
      collectProperties(
        objectId,
        value[i],
        rows,
        graphId,
        appendArrayPath(path, i),
        key,
        maxArrayItems,
        visited,
      );
    }
    return;
  }

  for (const [childKey, child] of Object.entries(value)) {
    collectProperties(
      objectId,
      child,
      rows,
      graphId,
      appendObjectPath(path, childKey),
      childKey,
      maxArrayItems,
      visited,
    );
  }
}

function collectProxyMemberships(
  value: unknown,
  rows: DuckDbGraphProxyMembershipRow[],
  objectIdsByApplicationId: ReadonlyMap<string, string>,
  graphId: string,
  path: string,
  visited: WeakSet<object>,
): void {
  if (value === null || typeof value !== "object") return;
  if (visited.has(value)) return;
  visited.add(value);

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      collectProxyMemberships(
        value[i],
        rows,
        objectIdsByApplicationId,
        graphId,
        appendArrayPath(path, i),
        visited,
      );
    }
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    const childPath = appendObjectPath(path, key);
    if (isProxyCollectionKey(key) && Array.isArray(child)) {
      for (let i = 0; i < child.length; i++) {
        const proxy = child[i];
        if (!isRecord(proxy)) continue;
        const objects = proxy["objects"];
        if (!Array.isArray(objects)) continue;
        const proxyPath = appendArrayPath(childPath, i);
        const proxyApplicationId = stringField(proxy, "applicationId");
        const proxyId = proxyApplicationId ?? stringField(proxy, "id") ?? `${key}:${i}`;
        const proxyType = stringField(proxy, "speckle_type") ?? key;
        const proxyName = stringField(proxy, "name") ?? nestedStringField(proxy, "value", "name");
        for (const applicationId of objects) {
          if (typeof applicationId !== "string") continue;
          rows.push({
            graphId,
            proxyId,
            proxyApplicationId,
            proxyType,
            proxyName,
            targetApplicationId: applicationId,
            targetObjectId: objectIdsByApplicationId.get(applicationId) ?? null,
            path: proxyPath,
          });
        }
      }
    }

    collectProxyMemberships(child, rows, objectIdsByApplicationId, graphId, childPath, visited);
  }
}

function pushEdge(
  rows: DuckDbGraphEdgeRow[],
  seen: Set<string>,
  row: DuckDbGraphEdgeRow,
): void {
  const signature = [row.graphId, row.fromId, row.toId, row.edgeKind, row.path].join("\u0000");
  if (seen.has(signature)) return;
  seen.add(signature);
  rows.push(row);
}

function createPropertyRow(
  graphId: string,
  objectId: string,
  path: string,
  key: string | null,
  value: string | number | boolean | null,
): DuckDbGraphPropertyRow {
  const valueType = value === null ? "null" : typeof value;
  return {
    graphId,
    objectId,
    path,
    key,
    keyNorm: key === null ? null : normalizePropertyKey(key),
    valueType,
    valueText: value === null ? null : String(value),
    valueNum: typeof value === "number" && Number.isFinite(value) ? value : null,
    valueBool: typeof value === "boolean" ? value : null,
    valueJson: JSON.stringify(value),
  };
}

function createJsonPropertyRow(
  graphId: string,
  objectId: string,
  path: string,
  key: string | null,
  valueType: string,
  value: unknown,
): DuckDbGraphPropertyRow {
  return {
    graphId,
    objectId,
    path,
    key,
    keyNorm: key === null ? null : normalizePropertyKey(key),
    valueType,
    valueText: null,
    valueNum: null,
    valueBool: null,
    valueJson: JSON.stringify(value),
  };
}

async function withDuckDbTransaction(
  connection: DuckDbConnectionLike,
  work: () => Promise<void>,
): Promise<void> {
  await connection.run("BEGIN TRANSACTION");
  try {
    await work();
    await connection.run("COMMIT");
  } catch (err) {
    try {
      await connection.run("ROLLBACK");
    } catch {
      // Preserve the original failure.
    }
    throw err;
  }
}

function objectRowParams(row: DuckDbGraphObjectRow): Record<string, unknown> {
  return {
    graph_id: row.graphId,
    project_id: row.projectId,
    model_id: row.modelId,
    version_id: row.versionId,
    root_id: row.rootId,
    object_id: row.objectId,
    application_id: row.applicationId,
    speckle_type: row.speckleType,
    name: row.name,
    has_properties: row.hasProperties,
    has_display_value: row.hasDisplayValue,
    has_elements: row.hasElements,
    object_json: row.objectJson,
    loaded_at: row.loadedAt,
  };
}

function readDuckDbRows(reader: DuckDbResultReaderLike): Array<Record<string, unknown>> {
  if (reader.getRowObjectsJson !== undefined) return reader.getRowObjectsJson();
  if (reader.getRowObjects !== undefined) return reader.getRowObjects();
  throw new Error("DuckDB reader does not expose row objects");
}

function parseSpeckleObjectItem(value: unknown): SpeckleObjectItem {
  if (typeof value === "string") return JSON.parse(value) as SpeckleObjectItem;
  if (isRecord(value)) return value as unknown as SpeckleObjectItem;
  throw new Error("DuckDB object cache row did not include item_json");
}

function defaultGraphId(
  projectId: string | undefined,
  modelId: string | undefined,
  versionId: string | null | undefined,
  rootId: string,
): string {
  return [projectId, modelId, versionId, rootId].filter((part) => !!part).join(":") || rootId;
}

function quoteIdentifier(identifier: string): string {
  return `"${validateIdentifier(identifier)}"`;
}

function validateIdentifier(identifier: string): string {
  if (!IDENTIFIER_RE.test(identifier)) {
    throw new Error(`Invalid DuckDB identifier '${identifier}'`);
  }
  return identifier;
}

function closeDuckDbConnection(connection: DuckDbConnectionLike): void {
  if (connection.closeSync !== undefined) {
    connection.closeSync();
    return;
  }
  connection.disconnectSync?.();
}

function appendObjectPath(path: string, key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
    ? `${path}.${key}`
    : `${path}[${JSON.stringify(key)}]`;
}

function appendArrayPath(path: string, index: number): string {
  return `${path}[${index}]`;
}

function normalizePropertyKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function edgeKindFor(key: string | null, ordinal: number | null): string {
  if (key === "elements") return "elements";
  if (key === "displayValue" || key === "@displayValue") return "display_value";
  if (key?.startsWith("@")) return "detached_reference";
  return ordinal === null ? "property_object" : "array_object";
}

function referenceEdgeKindFor(key: string | null, ordinal: number | null): string {
  const structuralKind = edgeKindFor(key, ordinal);
  return structuralKind === "property_object" || structuralKind === "array_object"
    ? "reference"
    : structuralKind;
}

function referencedObjectId(record: Record<string, unknown>): string | null {
  const referencedId = stringField(record, "referencedId");
  if (referencedId === null) return null;
  const speckleType = stringField(record, "speckle_type") ?? stringField(record, "speckleType");
  if (speckleType === null) return null;
  return speckleType.toLowerCase() === "reference" || speckleType.includes("ObjectReference")
    ? referencedId
    : null;
}

function isProxyCollectionKey(key: string): boolean {
  return key.toLowerCase().endsWith("proxies");
}

function hasOwnValue(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key) && record[key] !== undefined;
}

function stringField(record: unknown, key: string): string | null {
  if (!isRecord(record)) return null;
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function nestedStringField(record: Record<string, unknown>, key: string, nestedKey: string): string | null {
  const value = record[key];
  return stringField(value, nestedKey);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isScalar(value: unknown): value is string | number | boolean | null {
  return value === null || typeof value === "string" || typeof value === "number" ||
    typeof value === "boolean";
}
