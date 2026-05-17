import { test, expect } from "bun:test";
import pkg from "../package.json";
import {
  hydrateSpeckleObject,
  receiveSpeckleObject,
  type SpeckleBase,
  type SpeckleObjectHandle,
  type SpeckleObjectItem,
  type SpeckleObjectLoaderLike,
  type SpeckleObjectSender,
} from "../src/objects.js";
import { mockSpeckle, versionFixture } from "./_helpers/index.js";

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
    if (object === undefined) throw new Error(`missing object ${id}`);
    return object;
  }

  async getTotalObjectCount(): Promise<number> {
    return this.objects.length;
  }

  async *getObjectIterator(): AsyncGenerator<SpeckleBase> {
    for (const object of this.objects) yield object;
  }
}

function base(
  id: string,
  overrides: Record<string, unknown> = {},
): SpeckleBase {
  return { id, speckle_type: "Objects.Data.DataObject", ...overrides } as SpeckleBase;
}

function handleFrom(objects: Record<string, SpeckleBase>, rootId = "root"): SpeckleObjectHandle {
  const root = objects[rootId];
  if (root === undefined) throw new Error(`missing root ${rootId}`);
  return {
    rootId,
    rootClosureSize: Object.keys(root.__closure ?? {}).length,
    objectIds: Object.keys(objects),
    getRoot: async () => root,
    getObject: async (id) => {
      const object = objects[id];
      if (object === undefined) throw new Error(`missing object ${id}`);
      return object;
    },
    getObjects: async (ids) => ids.map((id) => objects[id]),
  };
}

async function withGlobalFetch<T>(fetchFn: typeof fetch, work: () => Promise<T>): Promise<T> {
  const original = globalThis.fetch;
  globalThis.fetch = fetchFn;
  try {
    return await work();
  } finally {
    globalThis.fetch = original;
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function urlFromFetchInput(input: Parameters<typeof fetch>[0]): URL {
  if (typeof input === "string" || input instanceof URL) return new URL(input);
  return new URL(input.url);
}

function diffIds(init: RequestInit | undefined): string[] {
  const body = JSON.parse(String(init?.body ?? "{}")) as { objects?: string };
  return JSON.parse(body.objects ?? "[]") as string[];
}

async function readObjectBatch(init: RequestInit | undefined): Promise<{
  fieldName: string;
  fileName: string | undefined;
  objects: Array<Record<string, unknown>>;
}> {
  expect(init?.body).toBeInstanceOf(FormData);
  const form = init?.body as FormData;
  const entries = Array.from(form.entries());
  expect(entries).toHaveLength(1);
  const entry = entries[0];
  if (entry === undefined) throw new Error("missing object batch");
  const [fieldName, value] = entry;
  if (typeof value === "string") throw new Error("object batch must be a file");
  expect(value).toBeInstanceOf(Blob);
  const blob = value as Blob & { name?: string };
  const objects = JSON.parse(await blob.text()) as Array<Record<string, unknown>>;
  return { fieldName, fileName: blob.name, objects };
}

test("hydrateSpeckleObject restores detached reference fields for objectsender", async () => {
  const handle = handleFrom({
    root: base("root", {
      speckle_type: "Speckle.Core.Models.Collections.Collection",
      elements: [{ speckle_type: "reference", referencedId: "child" }],
      __closure: { child: 1 },
      totalChildrenCount: 99,
    }),
    child: base("child", { category: "Walls" }),
  });

  const hydrated = await hydrateSpeckleObject(handle);

  expect(hydrated.id).toBe("root");
  expect(hydrated.elements).toBeUndefined();
  expect(hydrated.totalChildrenCount).toBeUndefined();
  const elements = hydrated["@elements"] as Array<Record<string, unknown>>;
  expect(elements).toHaveLength(1);
  expect(elements[0]?.id).toBe("child");
  expect(elements[0]?.category).toBe("Walls");
});

test("Model.sendObject filters existing objects, uploads batch-0, and verifies refId", async () => {
  const handle = handleFrom({
    root: base("root", {
      speckle_type: "Speckle.Core.Models.Collections.Collection",
      elements: [{ speckle_type: "reference", referencedId: "child" }],
      __closure: { child: 1 },
    }),
    child: base("child", { category: "Walls" }),
  });
  const uploadedIds = new Set<string>();
  const existingIds = new Set<string>();
  const diffCalls: string[][] = [];
  const uploadFields: Array<{ fieldName: string; fileName: string | undefined }> = [];
  const uploadedBatches: Array<Array<Record<string, unknown>>> = [];
  const objectFetch = (async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    const url = urlFromFetchInput(input);
    if (url.pathname === "/api/diff/target_project") {
      const ids = diffIds(init);
      diffCalls.push(ids);
      if (diffCalls.length === 1 && ids[0] !== undefined) existingIds.add(ids[0]);
      return jsonResponse(
        Object.fromEntries(ids.map((id) => [id, uploadedIds.has(id) || existingIds.has(id)])),
      );
    }
    if (url.pathname === "/objects/target_project") {
      const batch = await readObjectBatch(init);
      uploadFields.push({ fieldName: batch.fieldName, fileName: batch.fileName });
      uploadedBatches.push(batch.objects);
      for (const object of batch.objects) {
        if (typeof object.id === "string") uploadedIds.add(object.id);
      }
      return new Response(null, { status: 201 });
    }
    throw new Error(`unexpected object fetch ${url.pathname}`);
  }) as typeof fetch;
  const { sk, callsFor } = mockSpeckle({
    CreateSentObjectVersion: (req) => {
      const input = req.variables["input"] as { objectId: string };
      return {
        versionMutations: {
          create: versionFixture("v_uploaded", { referencedObject: input.objectId }),
        },
      };
    },
  });

  await withGlobalFetch(objectFetch, async () => {
    const result = await sk.project("target_project").model("target_model").sendObject(handle, {
      retry: false,
    });

    expect(result.refId).toBeTruthy();
    expect(uploadedIds.has(result.refId) || existingIds.has(result.refId)).toBe(true);
    const verifiedIds = diffCalls.at(-1) ?? [];
    expect(verifiedIds).toContain(result.refId);
    expect(verifiedIds.every((id) => uploadedIds.has(id) || existingIds.has(id))).toBe(true);
    expect(uploadFields).toEqual([{ fieldName: "batch-0", fileName: "batch-0" }]);
    expect(uploadedBatches).toHaveLength(1);
    expect(uploadedBatches[0]?.some((object) => existingIds.has(String(object.id)))).toBe(false);
    expect(callsFor("CreateSentObjectVersion")[0]?.variables["input"]).toMatchObject({
      projectId: "target_project",
      modelId: "target_model",
      objectId: result.refId,
      totalChildrenCount: 1,
    });
  });

  await sk.dispose();
});

test("Model.sendObject rejects before version create when upload verification fails", async () => {
  const handle = handleFrom({ root: base("root") });
  const objectFetch = (async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    const url = urlFromFetchInput(input);
    if (url.pathname === "/api/diff/target_project") {
      const ids = diffIds(init);
      return jsonResponse(Object.fromEntries(ids.map((id) => [id, false])));
    }
    if (url.pathname === "/objects/target_project") {
      await readObjectBatch(init);
      return new Response(null, { status: 201 });
    }
    throw new Error(`unexpected object fetch ${url.pathname}`);
  }) as typeof fetch;
  const { sk, callsFor } = mockSpeckle({
    CreateSentObjectVersion: () => {
      throw new Error("version create should not run");
    },
  });

  await withGlobalFetch(objectFetch, async () => {
    await expect(
      sk.project("target_project").model("target_model").sendObject(handle, {
        retry: false,
      }),
    ).rejects.toThrow(/did not persist/);
  });
  expect(callsFor("CreateSentObjectVersion")).toHaveLength(0);
  await sk.dispose();
});

test("Model.sendObject copies hash-id loaded objects without reserializing", async () => {
  const rootId = "11111111111111111111111111111111";
  const childId = "22222222222222222222222222222222";
  const handle = handleFrom({
    [rootId]: base(rootId, {
      speckle_type: "Speckle.Core.Models.Collections.Collection",
      elements: [{ speckle_type: "reference", referencedId: childId }],
      __closure: { [childId]: 1 },
    }),
    [childId]: base(childId, { category: "Walls" }),
  }, rootId);
  const uploadedIds = new Set<string>();
  const uploadedBatches: Array<Array<Record<string, unknown>>> = [];
  const objectFetch = (async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    const url = urlFromFetchInput(input);
    if (url.pathname === "/api/diff/target_project") {
      const ids = diffIds(init);
      return jsonResponse(Object.fromEntries(ids.map((id) => [id, uploadedIds.has(id)])));
    }
    if (url.pathname === "/objects/target_project") {
      const batch = await readObjectBatch(init);
      expect(batch.fieldName).toBe("batch-0");
      expect(batch.fileName).toBe("batch-0");
      uploadedBatches.push(batch.objects);
      for (const object of batch.objects) {
        if (typeof object.id === "string") uploadedIds.add(object.id);
      }
      return new Response(null, { status: 201 });
    }
    throw new Error(`unexpected object fetch ${url.pathname}`);
  }) as typeof fetch;
  const { sk, callsFor } = mockSpeckle({
    CreateSentObjectVersion: (req) => {
      const input = req.variables["input"] as { objectId: string };
      return {
        versionMutations: {
          create: versionFixture("v_copied", { referencedObject: input.objectId }),
        },
      };
    },
  });

  await withGlobalFetch(objectFetch, async () => {
    const result = await sk.project("target_project").model("target_model").sendObject(handle, {
      retry: false,
    });

    expect(result.refId).toBe(rootId);
    expect(uploadedIds).toEqual(new Set([rootId, childId]));
    expect(uploadedBatches.flat().map((object) => object.id).sort()).toEqual([
      rootId,
      childId,
    ]);
    expect(callsFor("CreateSentObjectVersion")[0]?.variables["input"]).toMatchObject({
      objectId: rootId,
      totalChildrenCount: 1,
    });
  });

  await sk.dispose();
});

test("concurrent direct object sends do not replace global fetch", async () => {
  const firstRoot = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const firstChild = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  const secondRoot = "cccccccccccccccccccccccccccccccc";
  const secondChild = "dddddddddddddddddddddddddddddddd";
  const firstHandle = handleFrom({
    [firstRoot]: base(firstRoot, { __closure: { [firstChild]: 1 } }),
    [firstChild]: base(firstChild),
  }, firstRoot);
  const secondHandle = handleFrom({
    [secondRoot]: base(secondRoot, { __closure: { [secondChild]: 1 } }),
    [secondChild]: base(secondChild),
  }, secondRoot);
  const uploadedIds = new Set<string>();
  const objectFetch = (async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    expect(globalThis.fetch).toBe(objectFetch);
    const url = urlFromFetchInput(input);
    if (url.pathname === "/api/diff/target_project") {
      const ids = diffIds(init);
      return jsonResponse(Object.fromEntries(ids.map((id) => [id, uploadedIds.has(id)])));
    }
    if (url.pathname === "/objects/target_project") {
      const batch = await readObjectBatch(init);
      for (const object of batch.objects) {
        if (typeof object.id === "string") uploadedIds.add(object.id);
      }
      return new Response(null, { status: 201 });
    }
    throw new Error(`unexpected object fetch ${url.pathname}`);
  }) as typeof fetch;
  const { sk } = mockSpeckle({
    CreateSentObjectVersion: (req) => {
      const input = req.variables["input"] as { objectId: string };
      return {
        versionMutations: {
          create: versionFixture(`v_${input.objectId.slice(0, 4)}`, {
            referencedObject: input.objectId,
          }),
        },
      };
    },
  });

  await withGlobalFetch(objectFetch, async () => {
    const [first, second] = await Promise.all([
      sk.project("target_project").model("target_model").sendObject(firstHandle, {
        retry: false,
      }),
      sk.project("target_project").model("target_model").sendObject(secondHandle, {
        retry: false,
      }),
    ]);
    expect(first.refId).toBe(firstRoot);
    expect(second.refId).toBe(secondRoot);
    expect(uploadedIds).toEqual(new Set([firstRoot, firstChild, secondRoot, secondChild]));
  });

  await sk.dispose();
});

test("package includes patches needed by patchedDependencies", () => {
  expect(pkg.files).toContain("patches");
  expect(pkg.patchedDependencies["@speckle/objectloader2@2.28.0"]).toBe(
    "patches/@speckle%2Fobjectloader2@2.28.0.patch",
  );
});

test("Model.sendObject creates a version from the sender hash", async () => {
  const handle = handleFrom({
    root: base("root", {
      speckle_type: "Speckle.Core.Models.Collections.Collection",
      elements: [{ speckle_type: "reference", referencedId: "child" }],
      __closure: { child: 1 },
    }),
    child: base("child"),
  });
  const senderCalls: Array<{
    objectId: unknown;
    projectId: string;
    token: string;
    serverUrl: string | undefined;
  }> = [];
  const originalFetch = globalThis.fetch;
  const sender: SpeckleObjectSender = async (object, params) => {
    expect(globalThis.fetch).toBe(originalFetch);
    senderCalls.push({
      objectId: object.id,
      projectId: params.projectId,
      token: params.token,
      serverUrl: params.serverUrl,
    });
    return { hash: "sent_hash", traversed: {} };
  };
  const { sk, callsFor } = mockSpeckle({
    CreateSentObjectVersion: () => ({
      versionMutations: {
        create: versionFixture("v_sent", {
          referencedObject: "sent_hash",
          message: "round trip",
          sourceApplication: "@suffolk/speckle",
        }),
      },
    }),
  });

  const result = await sk.project("target_project").model("target_model").sendObject(handle, {
    message: "round trip",
    sourceApplication: "@suffolk/speckle",
    parents: ["v_parent"],
    sender,
    retry: false,
  });

  expect(result.objectId).toBe("sent_hash");
  expect(result.refId).toBe("sent_hash");
  expect(result.versionId).toBe("v_sent");
  expect(result.version.referencedObject).toBe("sent_hash");
  expect(globalThis.fetch).toBe(originalFetch);
  expect(senderCalls).toEqual([
    {
      objectId: "root",
      projectId: "target_project",
      token: "test-token",
      serverUrl: "https://app.speckle.systems",
    },
  ]);
  expect(callsFor("CreateSentObjectVersion")[0]?.variables["input"]).toEqual({
    projectId: "target_project",
    modelId: "target_model",
    objectId: "sent_hash",
    message: "round trip",
    sourceApplication: "@suffolk/speckle",
    parents: ["v_parent"],
    totalChildrenCount: 1,
  });

  await sk.dispose();
});

test("receive handle can be sent with the sender refId as version objectId", async () => {
  const root = base("source_root", {
    speckle_type: "Speckle.Core.Models.Collections.Collection",
    elements: [{ speckle_type: "reference", referencedId: "source_child" }],
    __closure: { source_child: 1 },
  });
  const child = base("source_child", { category: "Walls" });
  const loader = new FakeObjectLoader(root.id, [root, child]);
  const sender: SpeckleObjectSender = async (object, params) => {
    expect(object.id).toBe(root.id);
    expect(params.projectId).toBe("target_project");
    return {
      hash: "target_ref_id",
      traversed: { id: "target_ref_id", speckle_type: object.speckle_type },
    };
  };
  const { sk, callsFor } = mockSpeckle({
    ResolveModelLatestObject: () => ({
      project: {
        model: {
          versions: {
            items: [
              {
                id: "source_version",
                referencedObject: root.id,
                createdAt: "2026-05-01T00:00:00Z",
              },
            ],
          },
        },
      },
    }),
    CreateSentObjectVersion: () => ({
      versionMutations: {
        create: versionFixture("target_version", {
          referencedObject: "target_ref_id",
          message: "receive-send cycle",
          sourceApplication: "SpeckleSharp-style-cycle",
        }),
      },
    }),
  });

  const received = await receiveSpeckleObject(sk, {
    projectId: "source_project",
    modelId: "source_model",
    loaderFactory: () => loader,
  });
  try {
    const sent = await sk.project("target_project").model("target_model").sendObject(
      received.handle,
      {
        message: "receive-send cycle",
        sourceApplication: "SpeckleSharp-style-cycle",
        sender,
        retry: false,
      },
    );

    expect(sent.refId).toBe("target_ref_id");
    expect(sent.objectId).toBe(sent.refId);
    expect(sent.version.referencedObject).toBe(sent.refId);
    expect(callsFor("ResolveModelLatestObject")[0]?.variables).toEqual({
      projectId: "source_project",
      modelId: "source_model",
    });
    expect(callsFor("CreateSentObjectVersion")[0]?.variables["input"]).toEqual({
      projectId: "target_project",
      modelId: "target_model",
      objectId: "target_ref_id",
      message: "receive-send cycle",
      sourceApplication: "SpeckleSharp-style-cycle",
      totalChildrenCount: 1,
    });
  } finally {
    await received.dispose();
    await sk.dispose();
  }
});

test("Model.sendObject rejects a version that does not reference the sent refId", async () => {
  const handle = handleFrom({ root: base("root") });
  const sender: SpeckleObjectSender = async () => ({ hash: "sent_ref", traversed: {} });
  const { sk } = mockSpeckle({
    CreateSentObjectVersion: () => ({
      versionMutations: {
        create: versionFixture("v_bad", { referencedObject: "other_ref" }),
      },
    }),
  });

  await expect(
    sk.project("p1").model("m1").sendObject(handle, { sender, retry: false }),
  ).rejects.toThrow(/referencedObject did not match sent refId/);
  await sk.dispose();
});
