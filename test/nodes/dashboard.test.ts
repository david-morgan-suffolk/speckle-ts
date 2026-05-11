import { test, expect } from "bun:test";
import { mockSpeckle } from "../_helpers/index.js";

const dashboardBody = {
  id: "dash_1",
  name: "Exec",
  state: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  projects: [{ id: "proj_1", name: "Alpha" }],
  workspace: { id: "ws_1", name: "Acme", slug: "acme" },
  createdBy: null,
};

test("workspace.dashboard(id).get fetches a dashboard", async () => {
  const { sk, callsFor } = mockSpeckle({
    GetDashboard: () => ({ dashboard: dashboardBody }),
  });
  const info = await sk.workspace("ws_1").dashboard("dash_1").get;
  await sk.dispose();
  expect(info.id).toBe("dash_1");
  expect(info.projects).toEqual([{ id: "proj_1", name: "Alpha" }]);
  expect(callsFor("GetDashboard")[0]!.variables["id"]).toBe("dash_1");
});

test("workspace.createDashboard sends workspace identifier", async () => {
  const { sk, callsFor } = mockSpeckle({
    CreateDashboard: () => ({
      dashboardMutations: { create: dashboardBody },
    }),
  });
  const dash = await sk.workspace("ws_1").createDashboard({ name: "Exec" });
  await sk.dispose();
  expect(dash.id).toBe("dash_1");
  const call = callsFor("CreateDashboard")[0]!;
  expect(call.variables["workspace"]).toEqual({ id: "ws_1" });
  expect(call.variables["input"]).toEqual({ name: "Exec" });
});

test("dashboard.update flattens projectLinks → dashboardProjectLinks", async () => {
  const { sk, callsFor } = mockSpeckle({
    UpdateDashboard: () => ({
      dashboardMutations: { update: dashboardBody },
    }),
  });
  await sk
    .workspace("ws_1")
    .dashboard("dash_1")
    .update({
      name: "Renamed",
      projectLinks: [{ projectId: "proj_1", automationId: "auto_1" }],
    });
  await sk.dispose();
  const input = callsFor("UpdateDashboard")[0]!.variables["input"] as {
    id: string;
    name: string;
    dashboardProjectLinks: { projectId: string; automationId?: string }[];
  };
  expect(input.id).toBe("dash_1");
  expect(input.name).toBe("Renamed");
  expect(input.dashboardProjectLinks).toEqual([
    { projectId: "proj_1", automationId: "auto_1" },
  ]);
});

test("dashboard.duplicate returns a new node", async () => {
  const { sk, callsFor } = mockSpeckle({
    DuplicateDashboard: () => ({
      dashboardMutations: {
        duplicate: { ...dashboardBody, id: "dash_2", name: "Copy" },
      },
    }),
  });
  const copy = await sk
    .workspace("ws_1")
    .dashboard("dash_1")
    .duplicate("Copy");
  await sk.dispose();
  expect(copy.id).toBe("dash_2");
  expect(callsFor("DuplicateDashboard")[0]!.variables["name"]).toBe("Copy");
});

test("project.listDashboards returns a page", async () => {
  const { sk } = mockSpeckle({
    ListProjectDashboards: () => ({
      project: {
        dashboards: { totalCount: 1, cursor: null, items: [dashboardBody] },
      },
    }),
  });
  const page = await sk.project("proj_1").listDashboards({ limit: 50 });
  await sk.dispose();
  expect(page.totalCount).toBe(1);
  expect(page.items[0]!.id).toBe("dash_1");
});

test("workspace.dashboards iterates across pages", async () => {
  let call = 0;
  const { sk } = mockSpeckle({
    ListWorkspaceDashboards: () => {
      call += 1;
      if (call === 1) {
        return {
          workspace: {
            dashboards: {
              totalCount: 2,
              cursor: "c1",
              items: [{ ...dashboardBody, id: "dash_a" }],
            },
          },
        };
      }
      return {
        workspace: {
          dashboards: {
            totalCount: 2,
            cursor: null,
            items: [{ ...dashboardBody, id: "dash_b" }],
          },
        },
      };
    },
  });
  const ids: string[] = [];
  for await (const d of sk.workspace("ws_1").dashboards()) {
    ids.push(d.id);
  }
  await sk.dispose();
  expect(ids).toEqual(["dash_a", "dash_b"]);
});
