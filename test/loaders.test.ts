import { test, expect } from "bun:test";
import { createModelVersionsLoader } from "../src/loaders.js";
import {
  mockSpeckle,
  versionFixture,
  type GraphQLRequestBody,
} from "./_helpers/index.js";

function emptyVersionsPage(modelId: string, limit?: number) {
  return {
    totalCount: 0,
    cursor: null,
    items: [versionFixture(`v_${modelId}`)],
    _limit: limit,
  };
}

function batchedSingleProject(req: GraphQLRequestBody): unknown {
  const project: Record<string, unknown> = {};
  for (let i = 0; i < 100; i++) {
    const modelId = req.variables[`modelId_${i}`] as string | undefined;
    if (!modelId) break;
    project[`m_${i}`] = {
      versions: {
        totalCount: 1,
        cursor: null,
        items: [versionFixture(`v_${modelId}`, { message: `m=${modelId}` })],
      },
    };
  }
  return { project };
}

function batchedMultiProject(req: GraphQLRequestBody): unknown {
  const out: Record<string, unknown> = {};
  for (let i = 0; i < 100; i++) {
    const projectId = req.variables[`projectId_${i}`] as string | undefined;
    const modelId = req.variables[`modelId_${i}`] as string | undefined;
    if (!projectId || !modelId) break;
    out[`p_${i}`] = {
      model: {
        versions: {
          totalCount: 1,
          cursor: null,
          items: [
            versionFixture(`v_${projectId}_${modelId}`, {
              message: `${projectId}/${modelId}`,
            }),
          ],
        },
      },
    };
  }
  return out;
}

test("single load issues one BatchedModelVersions query", async () => {
  const { sk, callsFor } = mockSpeckle({
    BatchedModelVersions: batchedSingleProject,
  });
  const loader = createModelVersionsLoader(sk);
  const page = await loader.load("p1", "m_a", { limit: 5 });
  expect(page.items[0]?.id).toBe("v_m_a");
  expect(callsFor("BatchedModelVersions")).toHaveLength(1);
  await sk.dispose();
});

test("parallel loads in same tick coalesce into one batched query", async () => {
  const { sk, callsFor } = mockSpeckle({
    BatchedModelVersions: batchedSingleProject,
  });
  const loader = createModelVersionsLoader(sk);

  const [a, b, c] = await Promise.all([
    loader.load("p1", "m_a", { limit: 50 }),
    loader.load("p1", "m_b", { limit: 50 }),
    loader.load("p1", "m_c", { limit: 50 }),
  ]);

  expect(a.items[0]?.id).toBe("v_m_a");
  expect(b.items[0]?.id).toBe("v_m_b");
  expect(c.items[0]?.id).toBe("v_m_c");
  expect(callsFor("BatchedModelVersions")).toHaveLength(1);
  await sk.dispose();
});

test("loads exceeding maxBatchSize split into multiple queries", async () => {
  const { sk, callsFor } = mockSpeckle({
    BatchedModelVersions: batchedSingleProject,
  });
  const loader = createModelVersionsLoader(sk, { maxBatchSize: 2 });

  const ids = ["m1", "m2", "m3", "m4", "m5"];
  const results = await Promise.all(
    ids.map((id) => loader.load("p1", id)),
  );

  expect(results.map((r) => r.items[0]?.id)).toEqual(ids.map((id) => `v_${id}`));
  // 5 entries / 2 per batch → 3 calls (2, 2, 1)
  expect(callsFor("BatchedModelVersions")).toHaveLength(3);
  await sk.dispose();
});

test("mixed projects fall back to multi-root project aliasing", async () => {
  const { sk, callsFor } = mockSpeckle({
    BatchedModelVersions: batchedMultiProject,
  });
  const loader = createModelVersionsLoader(sk);

  const [a, b] = await Promise.all([
    loader.load("p1", "m_x"),
    loader.load("p2", "m_y"),
  ]);

  expect(a.items[0]?.id).toBe("v_p1_m_x");
  expect(b.items[0]?.id).toBe("v_p2_m_y");
  // Single batched query, multi-project shape.
  expect(callsFor("BatchedModelVersions")).toHaveLength(1);
  // Variables include projectId_0 and projectId_1.
  const vars = callsFor("BatchedModelVersions")[0]?.variables;
  expect(vars?.["projectId_0"]).toBe("p1");
  expect(vars?.["projectId_1"]).toBe("p2");
  await sk.dispose();
});

test("loader rejects each entry whose alias slot is missing the model", async () => {
  const { sk } = mockSpeckle({
    BatchedModelVersions: () => ({
      project: {
        m_0: { versions: { totalCount: 0, cursor: null, items: [] } },
        m_1: null,
        m_2: { versions: { totalCount: 0, cursor: null, items: [] } },
      },
    }),
  });
  const loader = createModelVersionsLoader(sk);

  const results = await Promise.allSettled([
    loader.load("p1", "m_a"),
    loader.load("p1", "m_b"),
    loader.load("p1", "m_c"),
  ]);

  expect(results[0]?.status).toBe("fulfilled");
  expect(results[1]?.status).toBe("rejected");
  if (results[1]?.status === "rejected") {
    expect(String(results[1].reason)).toMatch(/model not found: m_b/);
  }
  expect(results[2]?.status).toBe("fulfilled");
  await sk.dispose();
});

test("loader windowMs widens the batching window across async hops", async () => {
  const { sk, callsFor } = mockSpeckle({
    BatchedModelVersions: batchedSingleProject,
  });
  const loader = createModelVersionsLoader(sk, { windowMs: 30 });

  const a = loader.load("p1", "m_a");
  // Yield through a microtask + a short timer that's still inside the window.
  await new Promise((r) => setTimeout(r, 10));
  const b = loader.load("p1", "m_b");

  await Promise.all([a, b]);
  expect(callsFor("BatchedModelVersions")).toHaveLength(1);
  await sk.dispose();
});
