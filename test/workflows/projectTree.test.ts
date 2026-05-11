import { test, expect } from "bun:test";
import { extractProjectModelVersionsTree } from "../../src/workflows/projectTree.js";
import {
  mockSpeckle,
  modelsTreeItemFixture,
  versionFixture,
  type GraphQLHandler,
} from "../_helpers/index.js";

const treeFixture = () => [
  modelsTreeItemFixture("foo", null, [
    modelsTreeItemFixture("foo/a", "m_a"),
    modelsTreeItemFixture("foo/b", "m_b"),
  ]),
  modelsTreeItemFixture("solo", "m_solo"),
];

const versionPayload = (modelId: string) => ({
  totalCount: 1,
  cursor: null,
  items: [
    versionFixture(`v_${modelId}`, {
      message: `commit on ${modelId}`,
      sourceApplication: "rhino",
    }),
  ],
});

interface InflightTracker {
  wrap: (h: GraphQLHandler) => GraphQLHandler;
  peak: () => number;
}

function inflightTracker(delayMs = 5): InflightTracker {
  let inflight = 0;
  let peak = 0;
  return {
    peak: () => peak,
    wrap:
      (h) =>
      async (req) => {
        inflight++;
        if (inflight > peak) peak = inflight;
        try {
          await new Promise((r) => setTimeout(r, delayMs));
          return await h(req);
        } finally {
          inflight--;
        }
      },
  };
}

test("extractProjectModelVersionsTree fetches tree + versions, attaches by model id", async () => {
  const { sk, callsFor } = mockSpeckle(
    {
      GetProjectModelsTree: () => ({
        project: { modelsTree: { totalCount: 2, cursor: null, items: treeFixture() } },
      }),
      GetModelVersions: (req) => {
        const modelId = req.variables["modelId"] as string;
        return { project: { model: { versions: versionPayload(modelId) } } };
      },
    },
    { unhandled: "empty" },
  );
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

  expect(callsFor("GetProjectModelsTree")).toHaveLength(1);
  expect(callsFor("GetModelVersions")).toHaveLength(3);

  await sk.dispose();
});

test("extractProjectModelVersionsTree honors concurrency cap on full-pagination path", async () => {
  const tracker = inflightTracker(5);
  const { sk, callsFor } = mockSpeckle(
    {
      GetProjectModelsTree: tracker.wrap(() => ({
        project: { modelsTree: { totalCount: 2, cursor: null, items: treeFixture() } },
      })),
      GetModelVersions: tracker.wrap((req) => {
        const modelId = req.variables["modelId"] as string;
        return { project: { model: { versions: versionPayload(modelId) } } };
      }),
    },
    { unhandled: "empty" },
  );
  // Full-pagination path (no versionsLimit) keeps the per-model fan-out;
  // batching does not apply because each model walks its own cursor.
  await extractProjectModelVersionsTree(sk, "p1", { concurrency: 2 });
  expect(tracker.peak()).toBeLessThanOrEqual(2);
  expect(callsFor("GetModelVersions")).toHaveLength(3);
  await sk.dispose();
});

test("extractProjectModelVersionsTree with versionsLimit batches all models into one query", async () => {
  const { sk, callsFor } = mockSpeckle(
    {
      GetProjectModelsTree: () => ({
        project: { modelsTree: { totalCount: 2, cursor: null, items: treeFixture() } },
      }),
      BatchedModelVersions: (req) => {
        const project: Record<string, unknown> = {};
        for (let i = 0; i < 100; i++) {
          const modelId = req.variables[`modelId_${i}`] as string | undefined;
          if (!modelId) break;
          project[`m_${i}`] = { versions: versionPayload(modelId) };
        }
        return { project };
      },
    },
    { unhandled: "empty" },
  );
  await extractProjectModelVersionsTree(sk, "p1", { versionsLimit: 5 });

  const batched = callsFor("BatchedModelVersions");
  expect(batched).toHaveLength(1);
  // Three model aliases with limit_i = 5 each.
  for (let i = 0; i < 3; i++) {
    expect(batched[0]?.variables[`limit_${i}`]).toBe(5);
  }
  await sk.dispose();
});

test("extractProjectModelVersionsTree opts out of batching when batchVersions=false", async () => {
  const { sk, callsFor } = mockSpeckle(
    {
      GetProjectModelsTree: () => ({
        project: { modelsTree: { totalCount: 2, cursor: null, items: treeFixture() } },
      }),
      GetModelVersions: (req) => {
        const modelId = req.variables["modelId"] as string;
        return { project: { model: { versions: versionPayload(modelId) } } };
      },
    },
    { unhandled: "empty" },
  );
  await extractProjectModelVersionsTree(sk, "p1", {
    versionsLimit: 5,
    batchVersions: false,
  });
  expect(callsFor("GetModelVersions")).toHaveLength(3);
  await sk.dispose();
});
