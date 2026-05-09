import { test, expect } from "bun:test";
import { Speckle } from "../../src/client.js";
import { extractProjectModelVersionsTree } from "../../src/workflows/projectTree.js";

const M = (id: string, name: string) => ({
  id,
  name,
  description: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
});

const treeItem = (
  id: string,
  fullName: string,
  modelId: string | null,
  children: unknown[] = [],
) => ({
  id,
  name: fullName.split("/").pop()!,
  fullName,
  hasChildren: children.length > 0,
  updatedAt: "2026-01-01T00:00:00Z",
  model: modelId ? M(modelId, fullName.split("/").pop()!) : null,
  children,
});

const versionPayload = (modelId: string) => ({
  totalCount: 1,
  cursor: null,
  items: [
    {
      id: `v_${modelId}`,
      message: `commit on ${modelId}`,
      sourceApplication: "rhino",
      referencedObject: `obj_${modelId}`,
      createdAt: "2026-04-01T00:00:00Z",
      authorUser: { id: "u1", name: "alice" },
    },
  ],
});

interface Call {
  operationName: string;
  variables: Record<string, unknown>;
}

function makeFetch(): { fetch: typeof fetch; calls: Call[]; concurrent: () => number } {
  const calls: Call[] = [];
  let inflight = 0;
  let peak = 0;
  const f = (async (_url: unknown, init?: RequestInit) => {
    const body = JSON.parse((init?.body as string) ?? "{}") as {
      query?: string;
      variables?: Record<string, unknown>;
    };
    const opName = body.query?.match(/(?:query|mutation)\s+(\w+)/)?.[1] ?? "Unknown";
    calls.push({ operationName: opName, variables: body.variables ?? {} });

    inflight++;
    if (inflight > peak) peak = inflight;
    try {
      await new Promise((r) => setTimeout(r, 5));
      const json = (data: unknown) =>
        new Response(JSON.stringify({ data }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });

      if (opName === "GetProjectModelsTree") {
        return json({
          project: {
            modelsTree: {
              totalCount: 2,
              cursor: null,
              items: [
                treeItem("t_root", "foo", null, [
                  treeItem("t_a", "foo/a", "m_a"),
                  treeItem("t_b", "foo/b", "m_b"),
                ]),
                treeItem("t_solo", "solo", "m_solo"),
              ],
            },
          },
        });
      }
      if (opName === "GetModelVersions") {
        const modelId = (body.variables?.["modelId"] as string) ?? "?";
        return json({ project: { model: { versions: versionPayload(modelId) } } });
      }
      return json({});
    } finally {
      inflight--;
    }
  }) as unknown as typeof fetch;
  return { fetch: f, calls, concurrent: () => peak };
}

test("extractProjectModelVersionsTree fetches tree + versions, attaches by model id", async () => {
  const { fetch, calls } = makeFetch();
  const sk = new Speckle({ fetch });
  const tree = await extractProjectModelVersionsTree(sk, "p1");
  expect(tree).toHaveLength(2);

  const root = tree[0]!;
  expect(root.fullName).toBe("foo");
  expect(root.model).toBeNull();
  expect(root.versions).toEqual([]);
  expect(root.children).toHaveLength(2);
  expect(root.children[0]?.versions[0]?.id).toBe("v_m_a");
  expect(root.children[1]?.versions[0]?.id).toBe("v_m_b");

  const solo = tree[1]!;
  expect(solo.model?.id).toBe("m_solo");
  expect(solo.versions[0]?.id).toBe("v_m_solo");

  const treeCalls = calls.filter((c) => c.operationName === "GetProjectModelsTree");
  const versionCalls = calls.filter((c) => c.operationName === "GetModelVersions");
  expect(treeCalls).toHaveLength(1);
  expect(versionCalls).toHaveLength(3);

  await sk.dispose();
});

test("extractProjectModelVersionsTree honors concurrency cap", async () => {
  const { fetch, concurrent, calls } = makeFetch();
  const sk = new Speckle({ fetch });
  await extractProjectModelVersionsTree(sk, "p1", { concurrency: 2 });
  expect(concurrent()).toBeLessThanOrEqual(2);
  expect(calls.filter((c) => c.operationName === "GetModelVersions")).toHaveLength(3);
  await sk.dispose();
});

test("extractProjectModelVersionsTree with versionsLimit uses single page only", async () => {
  const { fetch, calls } = makeFetch();
  const sk = new Speckle({ fetch });
  await extractProjectModelVersionsTree(sk, "p1", { versionsLimit: 5 });
  for (const c of calls.filter((c) => c.operationName === "GetModelVersions")) {
    expect(c.variables["limit"]).toBe(5);
  }
  await sk.dispose();
});
