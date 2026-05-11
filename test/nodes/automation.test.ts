import { test, expect } from "bun:test";
import {
  mockSpeckle,
  mockSpeckleWithWs,
  flushMicrotasks,
  automationFixture,
  automateRunFixture,
  automateFunctionRunFixture,
  listAutomationsHandler,
  getAutomationHandler,
  listAutomationRunsHandler,
  createAutomationHandler,
  updateAutomationHandler,
  deleteAutomationHandler,
  triggerAutomationHandler,
  sequence,
} from "../_helpers/index.js";
import { Automation } from "../../src/nodes/Automation.js";

async function settle(): Promise<void> {
  await flushMicrotasks(8);
  await new Promise((r) => setTimeout(r, 10));
}

test("Project.listAutomations parses page + forwards cursor/limit", async () => {
  const { sk, callsFor } = mockSpeckle({
    ListProjectAutomations: listAutomationsHandler({
      totalCount: 2,
      cursor: "next",
      items: [automationFixture({ id: "auto_a" }), automationFixture({ id: "auto_b" })],
    }),
  });
  const page = await sk.project("p1").listAutomations({ limit: 5 });
  expect(page.totalCount).toBe(2);
  expect(page.cursor).toBe("next");
  expect(page.items.map((a) => a.id)).toEqual(["auto_a", "auto_b"]);
  expect(callsFor("ListProjectAutomations")[0]?.variables).toEqual({
    projectId: "p1",
    limit: 5,
  });
  await sk.dispose();
});

test("Project.automations iterator pages through and stops early", async () => {
  const { sk, callsFor } = mockSpeckle({
    ListProjectAutomations: sequence([
      listAutomationsHandler({
        totalCount: 3,
        cursor: "c1",
        items: [automationFixture({ id: "a1" })],
      }),
      listAutomationsHandler({
        totalCount: 3,
        cursor: "c2",
        items: [automationFixture({ id: "a2" })],
      }),
      listAutomationsHandler({
        totalCount: 3,
        cursor: null,
        items: [automationFixture({ id: "a3" })],
      }),
    ]),
  });

  const seen: string[] = [];
  for await (const a of sk.project("p1").automations()) {
    seen.push(a.id);
    if (seen.length === 2) break;
  }
  expect(seen).toEqual(["a1", "a2"]);
  expect(callsFor("ListProjectAutomations")).toHaveLength(2);
  await sk.dispose();
});

test("Automation.get fetches single automation", async () => {
  const { sk, callsFor } = mockSpeckle({
    GetAutomation: getAutomationHandler(
      automationFixture({ id: "auto_x", name: "Found" }),
    ),
  });
  const got = await sk.project("p1").automation("auto_x").get;
  expect(got.name).toBe("Found");
  expect(callsFor("GetAutomation")[0]?.variables).toEqual({
    projectId: "p1",
    automationId: "auto_x",
  });
  await sk.dispose();
});

test("Automation.runs iterator yields function runs across pages", async () => {
  const { sk, callsFor } = mockSpeckle({
    ListAutomationRuns: sequence([
      listAutomationRunsHandler({
        totalCount: 3,
        cursor: "r1",
        items: [
          automateRunFixture("run_a", {
            functionRuns: [
              automateFunctionRunFixture("fr_a", { status: "SUCCEEDED" }),
            ],
          }),
        ],
      }),
      listAutomationRunsHandler({
        totalCount: 3,
        cursor: null,
        items: [
          automateRunFixture("run_b", { status: "RUNNING" }),
          automateRunFixture("run_c", { status: "FAILED" }),
        ],
      }),
    ]),
  });

  const seen: string[] = [];
  for await (const r of sk.project("p1").automation("auto_1").runs({ limit: 50 })) {
    seen.push(r.id);
  }
  expect(seen).toEqual(["run_a", "run_b", "run_c"]);
  expect(callsFor("ListAutomationRuns")).toHaveLength(2);
  await sk.dispose();
});

test("Project.createAutomation posts ProjectAutomationCreateInput and returns Automation ref", async () => {
  const { sk, callsFor } = mockSpeckle({
    CreateProjectAutomation: createAutomationHandler(
      automationFixture({ id: "auto_new", name: "New", enabled: false }),
    ),
  });
  const created = await sk.project("p1").createAutomation({
    name: "New",
    enabled: false,
    isTestAutomation: false,
  });
  expect(created).toBeInstanceOf(Automation);
  expect(created.id).toBe("auto_new");

  const vars = callsFor("CreateProjectAutomation")[0]?.variables as {
    projectId: string;
    input: { name: string; enabled: boolean; isTestAutomation?: boolean };
  };
  expect(vars.projectId).toBe("p1");
  expect(vars.input).toEqual({ name: "New", enabled: false, isTestAutomation: false });
  await sk.dispose();
});

test("Automation.update sends id-injected patch in input", async () => {
  const { sk, callsFor } = mockSpeckle({
    UpdateProjectAutomation: updateAutomationHandler(
      automationFixture({ id: "auto_1", enabled: false }),
    ),
  });
  const updated = await sk.project("p1").automation("auto_1").update({ enabled: false });
  expect(updated.enabled).toBe(false);

  const vars = callsFor("UpdateProjectAutomation")[0]?.variables as {
    projectId: string;
    input: { id: string; enabled?: boolean };
  };
  expect(vars.input).toEqual({ id: "auto_1", enabled: false });
  await sk.dispose();
});

test("Automation.delete sends projectId + automationId", async () => {
  const { sk, callsFor } = mockSpeckle({
    DeleteProjectAutomation: deleteAutomationHandler(true),
  });
  const ok = await sk.project("p1").automation("auto_1").delete();
  expect(ok).toBe(true);
  expect(callsFor("DeleteProjectAutomation")[0]?.variables).toEqual({
    projectId: "p1",
    automationId: "auto_1",
  });
  await sk.dispose();
});

test("Automation.trigger returns runId; passes versionId when supplied", async () => {
  const { sk, callsFor } = mockSpeckle({
    TriggerProjectAutomation: triggerAutomationHandler("run_42"),
  });
  const runId = await sk.project("p1").automation("auto_1").trigger("v_99");
  expect(runId).toBe("run_42");
  expect(callsFor("TriggerProjectAutomation")[0]?.variables).toEqual({
    projectId: "p1",
    automationId: "auto_1",
    versionId: "v_99",
  });
  await sk.dispose();
});

test("Automation.trigger sends null versionId when omitted", async () => {
  const { sk, callsFor } = mockSpeckle({
    TriggerProjectAutomation: triggerAutomationHandler("run_43"),
  });
  await sk.project("p1").automation("auto_1").trigger();
  expect(callsFor("TriggerProjectAutomation")[0]?.variables).toEqual({
    projectId: "p1",
    automationId: "auto_1",
    versionId: null,
  });
  await sk.dispose();
});

test("Project.onAutomationsUpdate registers a sub and dispatches events", async () => {
  const { sk, ws } = mockSpeckleWithWs();
  const events: unknown[] = [];

  sk.project("p1").onAutomationsUpdate((e) => events.push(e));
  await settle();

  const subs = ws.activeSubsFor("ProjectAutomationsUpdated");
  expect(subs).toHaveLength(1);
  expect(subs[0]?.variables).toEqual({ projectId: "p1" });

  ws.emit("ProjectAutomationsUpdated", {
    projectAutomationsUpdated: {
      type: "CREATED",
      automationId: "auto_1",
      automation: { id: "auto_1", name: "X", enabled: true },
    },
  });
  await settle();

  expect(events).toHaveLength(1);
  await sk.dispose();
});

test("Project.onTriggeredAutomationsStatusUpdate registers status sub", async () => {
  const { sk, ws } = mockSpeckleWithWs();
  sk.project("p1").onTriggeredAutomationsStatusUpdate(() => undefined);
  await settle();

  const subs = ws.activeSubsFor("ProjectTriggeredAutomationsStatusUpdated");
  expect(subs).toHaveLength(1);
  expect(subs[0]?.variables).toEqual({ projectId: "p1" });

  await sk.dispose();
});
