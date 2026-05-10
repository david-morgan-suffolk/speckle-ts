import { test, expect, mock } from "bun:test";
import { Speckle } from "../../src/client.js";
import { InsightInfoSchema, InsightQuerySchema } from "../../src/schemas.js";
import { mockSpeckle, insightHandler } from "../_helpers/index.js";
import type { InsightInfo } from "../../src/types.js";

const SAMPLE_INSIGHT: InsightInfo = {
  id: "ins_1",
  name: "Validate level value",
  type: "model_validation",
  trigger: "onVersion",
  version: 1,
  templateVersion: null,
  customized: false,
  derivedPackageCount: 0,
  modelIds: ["m1", "m2"],
  projectId: "p1",
  metadata: {
    description: "Checks default level values",
    displayConfig: {
      ruleSeverity: {},
      passThreshold: 0.9,
      rulePassThreshold: {},
      ruleWarningThreshold: {},
    },
    sourceRulesetId: "rs_1",
  },
  query: {
    filter: { op: "contains", path: "speckle_type", value: "DataObject" },
    compute: {
      type: "validate",
      rules: [
        {
          name: "Level exists and is not default",
          check: { op: "neq", path: "level", value: "No Level" },
          scope: [{ op: "exists", path: "level" }],
        },
      ],
    },
  },
  createdAt: "2026-05-08T14:16:49.710Z",
  updatedAt: "2026-05-08T14:16:49.710Z",
  createdBy: "u_1",
  updatedBy: null,
  latestResults: [],
  dataSources: [],
};

test("InsightQuerySchema parses filter + compute + rules", () => {
  const parsed = InsightQuerySchema.parse(SAMPLE_INSIGHT.query);
  expect(parsed.filter.op).toBe("contains");
  expect(parsed.compute.type).toBe("validate");
  expect(parsed.compute.rules?.[0]?.name).toBe("Level exists and is not default");
  expect(parsed.compute.rules?.[0]?.check.op).toBe("neq");
  expect(parsed.compute.rules?.[0]?.scope?.[0]?.op).toBe("exists");
});

test("InsightInfoSchema parses full insight payload", () => {
  const parsed = InsightInfoSchema.parse(SAMPLE_INSIGHT);
  expect(parsed.id).toBe("ins_1");
  expect(parsed.modelIds).toHaveLength(2);
  expect(parsed.metadata["description"]).toBe("Checks default level values");
});

test("Project.insight() and Workspace.insightTemplate() chain without fetching", () => {
  const fakeFetch = mock(async () => new Response("{}", { status: 200 }));
  const sk = new Speckle({ fetch: fakeFetch as unknown as typeof fetch });
  const ins = sk.project("p1").insight("i1");
  expect(ins.id).toBe("i1");
  expect(ins.project.id).toBe("p1");
  const tpl = sk.workspace("w1").insightTemplate("t1");
  expect(tpl.id).toBe("t1");
  expect(tpl.workspace.id).toBe("w1");
  expect(fakeFetch).not.toHaveBeenCalled();
});

test("Insight.get fetches and validates", async () => {
  const { sk, callsFor } = mockSpeckle({
    Insight: insightHandler(SAMPLE_INSIGHT),
  });
  const ins = sk.project("p1").insight("ins_1");
  const info = await ins.get;
  expect(info.name).toBe("Validate level value");
  expect(info.query.compute.rules?.[0]?.check.value).toBe("No Level");
  expect(callsFor("Insight")).toHaveLength(1);
  expect(callsFor("Insight")[0]?.variables).toMatchObject({ projectId: "p1", id: "ins_1" });
  await sk.dispose();
});
