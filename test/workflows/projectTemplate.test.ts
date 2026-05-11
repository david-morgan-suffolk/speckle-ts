import { test, expect } from "bun:test";
import {
  applyProjectTemplate,
  ProjectTemplateError,
} from "../../src/workflows/projectTemplate.js";
import { SpeckleValidationError } from "../../src/transport/errors.js";
import type { ProjectTemplateSpec } from "../../src/types.js";
import { mockSpeckle, templateRouter } from "../_helpers/index.js";

const validSpec: ProjectTemplateSpec = {
  workspaceId: "ws_1",
  project: { name: "Alpha", visibility: "WORKSPACE" },
  models: [{ name: "site" }, { name: "structure" }],
  insights: [
    { kind: "fromTemplate", templateId: "tpl_1", modelRefs: ["structure"] },
    {
      kind: "inline",
      name: "Wall count",
      query: { filter: {}, compute: {} },
      modelRefs: ["site", "structure"],
    },
  ],
  automations: [{ name: "Nightly", enabled: false }],
};

test("rejects invalid spec via SpeckleValidationError", async () => {
  const { sk } = mockSpeckle(templateRouter().handlers);
  await expect(
    applyProjectTemplate(sk, { workspaceId: "", project: { name: "" } } as ProjectTemplateSpec),
  ).rejects.toBeInstanceOf(SpeckleValidationError);
  await sk.dispose();
});

test("happy path: dispatches in order and returns wired IDs", async () => {
  const { sk, calls } = mockSpeckle(templateRouter().handlers);
  const result = await applyProjectTemplate(sk, validSpec);
  await sk.dispose();

  const ops = calls.map((c) => c.operationName);
  expect(ops[0]).toBe("Workspace");
  expect(ops[1]).toBe("CreateWorkspaceProject");
  expect(ops[2]).toBe("CreateModel");
  expect(ops[3]).toBe("CreateModel");
  expect(ops[4]).toBe("CreateInsightFromTemplate");
  expect(ops[5]).toBe("CreateInsight");
  expect(ops[6]).toBe("CreateAutomation");

  expect(result.projectId).toBe("proj_1");
  expect(result.modelIds["site"]).toBe("model_1");
  expect(result.modelIds["structure"]).toBe("model_2");
  expect(result.insightIds).toEqual(["ins_1", "ins_2"]);
  expect(result.automationIds).toEqual(["auto_1"]);
});

test("resolves modelRefs to created model ids on inline insight", async () => {
  const { sk, callsFor } = mockSpeckle(templateRouter().handlers);
  await applyProjectTemplate(sk, validSpec);
  await sk.dispose();

  const inlineCall = callsFor("CreateInsight")[0];
  expect(inlineCall).toBeDefined();
  const input = inlineCall!.variables["input"] as { modelIds?: string[] };
  expect(input.modelIds).toEqual(["model_1", "model_2"]);
});

test("workspace fetch failure throws ProjectTemplateError stage=verifyWorkspace", async () => {
  const { sk } = mockSpeckle(templateRouter({ workspaceFails: true }).handlers);
  let caught: unknown;
  try {
    await applyProjectTemplate(sk, validSpec);
  } catch (e) {
    caught = e;
  }
  await sk.dispose();
  expect(caught).toBeInstanceOf(ProjectTemplateError);
  expect((caught as ProjectTemplateError).stage).toBe("verifyWorkspace");
  expect((caught as ProjectTemplateError).partial.projectId).toBeUndefined();
});

test("unknown modelRef throws ProjectTemplateError stage=createInsight with projectId in partial", async () => {
  const { sk } = mockSpeckle(templateRouter().handlers);
  const badSpec: ProjectTemplateSpec = {
    workspaceId: "ws_1",
    project: { name: "Alpha" },
    models: [{ name: "site" }],
    insights: [{ kind: "inline", name: "Bad ref", query: {}, modelRefs: ["nope"] }],
  };
  let caught: unknown;
  try {
    await applyProjectTemplate(sk, badSpec);
  } catch (e) {
    caught = e;
  }
  await sk.dispose();
  expect(caught).toBeInstanceOf(ProjectTemplateError);
  const err = caught as ProjectTemplateError;
  expect(err.stage).toBe("createInsight");
  expect(err.partial.projectId).toBe("proj_1");
  expect(err.partial.modelIds).toEqual({ site: "model_1" });
});

test("model creation failure surfaces partial with projectId only", async () => {
  const { sk } = mockSpeckle(templateRouter({ modelFailsAt: "structure" }).handlers);
  let caught: unknown;
  try {
    await applyProjectTemplate(sk, validSpec);
  } catch (e) {
    caught = e;
  }
  await sk.dispose();
  expect(caught).toBeInstanceOf(ProjectTemplateError);
  const err = caught as ProjectTemplateError;
  expect(err.stage).toBe("createModel");
  expect(err.partial.projectId).toBe("proj_1");
  expect(err.partial.modelIds).toEqual({ site: "model_1" });
  expect(err.partial.insightIds).toBeUndefined();
});
