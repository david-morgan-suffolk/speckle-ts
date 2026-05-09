import { test, expect } from "bun:test";
import { Speckle } from "../../src/client.js";
import {
  applyProjectTemplate,
  ProjectTemplateError,
} from "../../src/workflows/projectTemplate.js";
import { SpeckleValidationError } from "../../src/transport/errors.js";
import type { ProjectTemplateSpec } from "../../src/types.js";

const SAMPLE_WORKSPACE = {
  id: "ws_1",
  name: "Acme",
  slug: "acme",
  description: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

type Call = { operationName: string; variables: Record<string, unknown> };

interface RouterOptions {
  workspaceFails?: boolean;
  modelFailsAt?: string;
  insightFailsAt?: string;
}

function makeFetch(opts: RouterOptions = {}): {
  fetch: typeof fetch;
  calls: Call[];
} {
  const calls: Call[] = [];
  let projectCounter = 0;
  let modelCounter = 0;
  let insightCounter = 0;
  let automationCounter = 0;

  const f = (async (_url: unknown, init?: RequestInit) => {
    const body = JSON.parse((init?.body as string) ?? "{}") as {
      query?: string;
      operationName?: string;
      variables?: Record<string, unknown>;
    };

    const opName =
      body.operationName ??
      body.query?.match(/(?:query|mutation)\s+(\w+)/)?.[1] ??
      "Unknown";
    calls.push({ operationName: opName, variables: body.variables ?? {} });

    const json = (data: unknown) =>
      new Response(JSON.stringify({ data }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });

    if (opName === "Workspace") {
      if (opts.workspaceFails) {
        return new Response(
          JSON.stringify({ data: { workspace: null }, errors: [{ message: "not found" }] }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }
      return json({ workspace: SAMPLE_WORKSPACE });
    }

    if (opName === "CreateWorkspaceProject") {
      projectCounter += 1;
      return json({
        workspaceMutations: {
          projects: {
            create: { id: `proj_${projectCounter}`, name: "n", visibility: "WORKSPACE", workspaceId: "ws_1" },
          },
        },
      });
    }

    if (opName === "CreateModel") {
      modelCounter += 1;
      const input = body.variables?.input as { name: string };
      if (opts.modelFailsAt && input.name === opts.modelFailsAt) {
        return new Response(
          JSON.stringify({ data: null, errors: [{ message: `model ${input.name} fails` }] }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }
      return json({ modelMutations: { create: { id: `model_${modelCounter}`, name: input.name } } });
    }

    if (opName === "CreateInsight") {
      insightCounter += 1;
      const input = body.variables?.input as { name: string };
      if (opts.insightFailsAt && input.name === opts.insightFailsAt) {
        return new Response(
          JSON.stringify({ data: null, errors: [{ message: `insight ${input.name} fails` }] }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }
      return json({
        insightMutations: {
          create: {
            id: `ins_${insightCounter}`,
            name: input.name,
            type: "x",
            version: 1,
            projectId: "proj_1",
            modelIds: [],
          },
        },
      });
    }

    if (opName === "CreateInsightFromTemplate") {
      insightCounter += 1;
      return json({
        insightMutations: {
          createFromTemplate: {
            id: `ins_${insightCounter}`,
            name: "from-tpl",
            type: "x",
            version: 1,
            templateVersion: 1,
            projectId: "proj_1",
            modelIds: [],
          },
        },
      });
    }

    if (opName === "CreateAutomation") {
      automationCounter += 1;
      const input = body.variables?.input as { name: string };
      return json({
        projectMutations: {
          automationMutations: { create: { id: `auto_${automationCounter}`, name: input.name } },
        },
      });
    }

    return new Response(JSON.stringify({ data: null, errors: [{ message: `unhandled op ${opName}` }] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as unknown as typeof fetch;

  return { fetch: f, calls };
}

const validSpec: ProjectTemplateSpec = {
  workspaceId: "ws_1",
  project: { name: "Alpha", visibility: "WORKSPACE" },
  models: [{ name: "site" }, { name: "structure" }],
  insights: [
    { kind: "fromTemplate", templateId: "tpl_1", modelRefs: ["structure"] },
    { kind: "inline", name: "Wall count", query: { filter: {}, compute: {} }, modelRefs: ["site", "structure"] },
  ],
  automations: [{ name: "Nightly", enabled: false }],
};

test("rejects invalid spec via SpeckleValidationError", async () => {
  const { fetch: f } = makeFetch();
  const sk = new Speckle({ fetch: f });
  await expect(
    applyProjectTemplate(sk, { workspaceId: "", project: { name: "" } } as ProjectTemplateSpec),
  ).rejects.toBeInstanceOf(SpeckleValidationError);
  await sk.dispose();
});

test("happy path: dispatches in order and returns wired IDs", async () => {
  const { fetch: f, calls } = makeFetch();
  const sk = new Speckle({ fetch: f });
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
  expect(result.modelIds.site).toBe("model_1");
  expect(result.modelIds.structure).toBe("model_2");
  expect(result.insightIds).toEqual(["ins_1", "ins_2"]);
  expect(result.automationIds).toEqual(["auto_1"]);
});

test("resolves modelRefs to created model ids on inline insight", async () => {
  const { fetch: f, calls } = makeFetch();
  const sk = new Speckle({ fetch: f });
  await applyProjectTemplate(sk, validSpec);
  await sk.dispose();

  const inlineCall = calls.find((c) => c.operationName === "CreateInsight")!;
  const input = inlineCall.variables.input as { modelIds?: string[] };
  expect(input.modelIds).toEqual(["model_1", "model_2"]);
});

test("workspace fetch failure throws ProjectTemplateError stage=verifyWorkspace", async () => {
  const { fetch: f } = makeFetch({ workspaceFails: true });
  const sk = new Speckle({ fetch: f });
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
  const { fetch: f } = makeFetch();
  const sk = new Speckle({ fetch: f });
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
  const { fetch: f } = makeFetch({ modelFailsAt: "structure" });
  const sk = new Speckle({ fetch: f });
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
