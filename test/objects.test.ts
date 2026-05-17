import { test, expect } from "bun:test";
import {
  buildSpeckleObjectLoader,
  receiveSpeckleObject,
  type BuildSpeckleObjectLoaderParams,
  type SpeckleBase,
  type SpeckleObjectCacheConfig,
  type SpeckleObjectDatabase,
  type SpeckleObjectItem,
  type SpeckleObjectLoaderFactory,
  type SpeckleObjectLoaderLike,
} from "../src/objects.js";
import { mockSpeckle } from "./_helpers/index.js";

class FakeObjectLoader implements SpeckleObjectLoaderLike {
  disposed = false;

  constructor(
    private readonly rootId: string,
    private readonly objects: readonly SpeckleBase[],
  ) {}

  async disposeAsync(): Promise<void> {
    this.disposed = true;
  }

  async getRootObject(): Promise<SpeckleObjectItem | undefined> {
    const root = this.objects.find((object) => object.id === this.rootId);
    return root === undefined ? undefined : { baseId: root.id, base: root, size: 0 };
  }

  async getObject({ id }: { id: string }): Promise<SpeckleBase> {
    const object = this.objects.find((candidate) => candidate.id === id);
    if (object === undefined) throw new Error(`unknown object ${id}`);
    return object;
  }

  async getTotalObjectCount(): Promise<number> {
    const root = await this.getRootObject();
    return Object.keys(root?.base?.__closure ?? {}).length + 1;
  }

  async *getObjectIterator(): AsyncGenerator<SpeckleBase> {
    for (const object of this.objects) yield object;
  }
}

function base(
  id: string,
  overrides: Partial<SpeckleBase> = {},
): SpeckleBase {
  return { id, speckle_type: "Objects.Data.DataObject", ...overrides };
}

function captureFactory(loader: SpeckleObjectLoaderLike): {
  factory: SpeckleObjectLoaderFactory;
  calls: Array<{
    params: BuildSpeckleObjectLoaderParams;
    cache: SpeckleObjectCacheConfig;
  }>;
} {
  const calls: Array<{
    params: BuildSpeckleObjectLoaderParams;
    cache: SpeckleObjectCacheConfig;
  }> = [];
  return {
    calls,
    factory: (params, cache) => {
      calls.push({ params, cache });
      return loader;
    },
  };
}

test("receiveSpeckleObject resolves latest model version and streams object ids", async () => {
  const root = base("obj_root", {
    speckle_type: "Speckle.Core.Models.Collections.Collection",
    __closure: { obj_child: 1 },
  });
  const child = base("obj_child");
  const loader = new FakeObjectLoader(root.id, [root, child]);
  const { factory, calls } = captureFactory(loader);
  const { sk, callsFor } = mockSpeckle({
    ResolveModelLatestObject: () => ({
      project: {
        model: {
          versions: {
            items: [
              {
                id: "v_head",
                referencedObject: root.id,
                createdAt: "2026-05-01T00:00:00Z",
              },
            ],
          },
        },
      },
    }),
  });

  const result = await receiveSpeckleObject(sk, {
    projectId: "p1",
    modelId: "m1",
    loaderFactory: factory,
  });

  expect(result.objectId).toBe(root.id);
  expect(result.refId).toBe(root.id);
  expect(result.versionId).toBe("v_head");
  expect(result.createdAt).toBe("2026-05-01T00:00:00Z");
  expect(result.handle.rootClosureSize).toBe(1);
  expect(result.handle.objectIds).toEqual(["obj_root", "obj_child"]);
  expect(await result.handle.getRoot()).toBe(root);
  expect(await result.handle.getObject("obj_child")).toBe(child);
  expect(callsFor("ResolveModelLatestObject")[0]?.variables).toEqual({
    projectId: "p1",
    modelId: "m1",
  });
  expect(calls[0]?.params).toMatchObject({
    serverUrl: "https://app.speckle.systems",
    projectId: "p1",
    objectId: root.id,
    token: "test-token",
  });
  expect(calls[0]?.cache).toEqual({ kind: "memory" });

  await result.dispose();
  expect(loader.disposed).toBe(true);
  await sk.dispose();
});

test("receiveSpeckleObject accepts direct objectId without metadata lookup", async () => {
  const root = base("obj_direct");
  const loader = new FakeObjectLoader(root.id, [root]);
  let rootCacheReads = 0;
  loader.getObject = async ({ id }) => {
    if (id === root.id) {
      rootCacheReads++;
      throw new Error("root should be read from getRootObject");
    }
    throw new Error(`unknown object ${id}`);
  };
  const { factory } = captureFactory(loader);
  const { sk, calls } = mockSpeckle({});

  const result = await receiveSpeckleObject(sk, {
    projectId: "p1",
    objectId: root.id,
    cache: { kind: "none" },
    loaderFactory: factory,
  });

  expect(calls).toHaveLength(0);
  expect(result.versionId).toBeNull();
  expect(result.handle.rootClosureSize).toBe(0);
  expect(result.handle.objectIds).toEqual([root.id]);
  expect(await result.handle.getRoot()).toBe(root);
  expect(await result.handle.getObject(root.id)).toBe(root);
  expect(await result.handle.getObjects([root.id])).toEqual([root]);
  expect(rootCacheReads).toBe(0);

  await result.dispose();
  await sk.dispose();
});

test("Project and Version helpers pass resolved ids into receive loader", async () => {
  const root = base("obj_version");
  const loader = new FakeObjectLoader(root.id, [root]);
  const { factory, calls } = captureFactory(loader);
  const { sk, callsFor } = mockSpeckle({
    ResolveVersionObject: () => ({
      project: {
        version: {
          id: "v1",
          referencedObject: root.id,
          createdAt: "2026-05-02T00:00:00Z",
        },
      },
    }),
  });

  const result = await sk.project("p1").model("m1").version("v1").loadObject({
    loaderFactory: factory,
  });

  expect(result.objectId).toBe(root.id);
  expect(callsFor("ResolveVersionObject")[0]?.variables).toEqual({
    projectId: "p1",
    versionId: "v1",
  });
  expect(calls[0]?.params.projectId).toBe("p1");
  expect(calls[0]?.params.objectId).toBe(root.id);

  await result.dispose();
  await sk.dispose();
});

test("receiveSpeckleObject disposes loader when root object is missing", async () => {
  const loader = new FakeObjectLoader("missing", []);
  const { factory } = captureFactory(loader);
  const { sk } = mockSpeckle({});

  await expect(
    receiveSpeckleObject(sk, {
      projectId: "p1",
      objectId: "missing",
      loaderFactory: factory,
    }),
  ).rejects.toThrow(/no root object/);
  expect(loader.disposed).toBe(true);
  await sk.dispose();
});

test("buildSpeckleObjectLoader reads from custom object database", async () => {
  const root = base("obj_custom");
  const getAllCalls: string[][] = [];
  const putAllCalls: SpeckleObjectItem[][] = [];
  const database: SpeckleObjectDatabase = {
    getAll: async (ids) => {
      getAllCalls.push([...ids]);
      return ids.map((id) => id === root.id ? { baseId: root.id, base: root } : undefined);
    },
    putAll: async (batch) => {
      putAllCalls.push([...batch]);
    },
  };
  const loader = buildSpeckleObjectLoader({
    serverUrl: "https://example.com",
    projectId: "p1",
    objectId: root.id,
  }, { kind: "custom", database });

  await expect(loader.getRootObject()).resolves.toEqual({ baseId: root.id, base: root });
  const objects: SpeckleBase[] = [];
  for await (const object of loader.getObjectIterator()) objects.push(object);
  expect(objects).toEqual([root]);
  expect(getAllCalls).toEqual([[root.id]]);
  expect(putAllCalls).toEqual([]);

  await loader.disposeAsync();
});

test("custom object database disposal is caller-owned by default", async () => {
  let disposeCalls = 0;
  const database: SpeckleObjectDatabase = {
    getAll: async (ids) => ids.map(() => undefined),
    putAll: async () => {},
    dispose: () => {
      disposeCalls++;
    },
  };
  const loader = buildSpeckleObjectLoader({
    serverUrl: "https://example.com",
    projectId: "p1",
    objectId: "missing",
  }, { kind: "custom", database });

  await loader.disposeAsync();
  await loader.disposeAsync();

  expect(disposeCalls).toBe(0);
});

test("custom object database can be disposed by loader", async () => {
  let disposeCalls = 0;
  const database: SpeckleObjectDatabase = {
    getAll: async (ids) => ids.map(() => undefined),
    putAll: async () => {},
    dispose: async () => {
      disposeCalls++;
    },
  };
  const loader = buildSpeckleObjectLoader({
    serverUrl: "https://example.com",
    projectId: "p1",
    objectId: "missing",
  }, { kind: "custom", database, dispose: true });

  await loader.disposeAsync();
  await loader.disposeAsync();

  expect(disposeCalls).toBe(1);
});
