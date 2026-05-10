import { test, expect } from "bun:test";
import {
  mockSpeckle,
  mockSpeckleWithWs,
  flushMicrotasks,
  issueFixture,
  issueReplyFixture,
  projectIssuesHandler,
  issueHandler,
  issueRepliesHandler,
  createIssueHandler,
  createReplyHandler,
  updateIssueHandler,
  deleteIssueHandler,
  markIssueViewedHandler,
  sequence,
} from "../_helpers/index.js";
import { Issue } from "../../src/nodes/Issue.js";

async function settle(): Promise<void> {
  await flushMicrotasks(8);
  await new Promise((r) => setTimeout(r, 10));
}

test("Project.listIssues parses page + forwards filter", async () => {
  const { sk, callsFor } = mockSpeckle({
    GetProjectIssues: projectIssuesHandler({
      totalCount: 2,
      cursor: "next",
      items: [
        issueFixture({ id: "iss_a" }),
        issueFixture({ id: "iss_b", status: "resolved" }),
      ],
    }),
  });
  const page = await sk.project("p1").listIssues({ statuses: ["open", "resolved"], limit: 10 });
  expect(page.totalCount).toBe(2);
  expect(page.cursor).toBe("next");
  expect(page.items[1]?.status).toBe("resolved");
  expect(callsFor("GetProjectIssues")[0]?.variables).toMatchObject({
    projectId: "p1",
    input: { statuses: ["open", "resolved"], limit: 10 },
  });
  await sk.dispose();
});

test("Project.issues iterator pages through and stops early", async () => {
  const { sk, callsFor } = mockSpeckle({
    GetProjectIssues: sequence([
      projectIssuesHandler({
        totalCount: 3,
        cursor: "c1",
        items: [issueFixture({ id: "iss_a" })],
      }),
      projectIssuesHandler({
        totalCount: 3,
        cursor: "c2",
        items: [issueFixture({ id: "iss_b" })],
      }),
      projectIssuesHandler({
        totalCount: 3,
        cursor: null,
        items: [issueFixture({ id: "iss_c" })],
      }),
    ]),
  });

  const seen: string[] = [];
  for await (const it of sk.project("p1").issues()) {
    seen.push(it.id);
    if (seen.length === 2) break;
  }
  expect(seen).toEqual(["iss_a", "iss_b"]);
  expect(callsFor("GetProjectIssues")).toHaveLength(2);
  await sk.dispose();
});

test("Issue.get fetches single issue", async () => {
  const { sk, callsFor } = mockSpeckle({
    GetIssue: issueHandler(issueFixture({ id: "iss_x", title: "Found" })),
  });
  const got = await sk.project("p1").issue("iss_x").get;
  expect(got.title).toBe("Found");
  expect(callsFor("GetIssue")[0]?.variables).toEqual({ projectId: "p1", issueId: "iss_x" });
  await sk.dispose();
});

test("Issue.replies iterator pages through replies", async () => {
  const { sk, callsFor } = mockSpeckle({
    GetIssueReplies: sequence([
      issueRepliesHandler({
        totalCount: 3,
        cursor: "r1",
        items: [issueReplyFixture("rep_a")],
      }),
      issueRepliesHandler({
        totalCount: 3,
        cursor: null,
        items: [issueReplyFixture("rep_b"), issueReplyFixture("rep_c")],
      }),
    ]),
  });

  const seen: string[] = [];
  for await (const r of sk.project("p1").issue("iss_1").replies({ limit: 10 })) {
    seen.push(r.id);
  }
  expect(seen).toEqual(["rep_a", "rep_b", "rep_c"]);
  expect(callsFor("GetIssueReplies")).toHaveLength(2);
  await sk.dispose();
});

test("Project.createIssue posts projectId-injected input and returns Issue ref", async () => {
  const { sk, callsFor } = mockSpeckle({
    CreateIssue: createIssueHandler(issueFixture({ id: "iss_new", title: "New" })),
  });
  const issue = await sk.project("p1").createIssue({ title: "New", priority: "high" });
  expect(issue).toBeInstanceOf(Issue);
  expect(issue.id).toBe("iss_new");
  const input = callsFor("CreateIssue")[0]?.variables["input"] as {
    projectId: string;
    title: string;
    priority?: string;
  };
  expect(input).toEqual({ projectId: "p1", title: "New", priority: "high" });
  await sk.dispose();
});

test("Issue.reply posts projectId + issueId + description", async () => {
  const { sk, callsFor } = mockSpeckle({
    CreateIssueReply: createReplyHandler(
      issueReplyFixture("rep_new", { rawDescription: "hi" }),
    ),
  });
  const reply = await sk
    .project("p1")
    .issue("iss_1")
    .reply({ description: { type: "doc", content: [] } });
  expect(reply.id).toBe("rep_new");
  const input = callsFor("CreateIssueReply")[0]?.variables["input"] as {
    projectId: string;
    issueId: string;
    description: unknown;
  };
  expect(input.projectId).toBe("p1");
  expect(input.issueId).toBe("iss_1");
  expect(input.description).toEqual({ type: "doc", content: [] });
  await sk.dispose();
});

test("Issue.update posts patch with projectId + issueId", async () => {
  const { sk, callsFor } = mockSpeckle({
    UpdateIssue: updateIssueHandler(
      issueFixture({ id: "iss_1", status: "resolved" }),
    ),
  });
  const updated = await sk.project("p1").issue("iss_1").update({ status: "resolved" });
  expect(updated.status).toBe("resolved");
  const input = callsFor("UpdateIssue")[0]?.variables["input"] as {
    projectId: string;
    issueId: string;
    status?: string;
  };
  expect(input).toEqual({ projectId: "p1", issueId: "iss_1", status: "resolved" });
  await sk.dispose();
});

test("Issue.delete returns boolean from mutation", async () => {
  const { sk } = mockSpeckle({
    DeleteIssue: deleteIssueHandler(true),
  });
  const ok = await sk.project("p1").issue("iss_1").delete();
  expect(ok).toBe(true);
  await sk.dispose();
});

test("Issue.markViewed returns boolean from mutation", async () => {
  const { sk } = mockSpeckle({
    MarkIssueViewed: markIssueViewedHandler(true),
  });
  const ok = await sk.project("p1").issue("iss_1").markViewed();
  expect(ok).toBe(true);
  await sk.dispose();
});

test("Project.onIssuesUpdate registers a sub with viewer-tracking target", async () => {
  const { sk, ws } = mockSpeckleWithWs();
  const events: unknown[] = [];

  sk.project("p1").onIssuesUpdate(
    { resourceIdString: "m1@v1", loadedVersionsOnly: true },
    (e) => events.push(e),
  );
  await settle();

  const subs = ws.activeSubsFor("ProjectIssuesUpdated");
  expect(subs).toHaveLength(1);
  expect(subs[0]?.variables).toEqual({
    target: { projectId: "p1", resourceIdString: "m1@v1", loadedVersionsOnly: true },
  });

  ws.emit("ProjectIssuesUpdated", {
    projectIssuesUpdated: {
      id: "iss_1",
      type: "created",
      issue: { id: "iss_1", identifier: "PROJ-1", title: "x", status: "open", priority: "medium", updatedAt: "now" },
      reply: null,
    },
  });
  await settle();

  expect(events).toHaveLength(1);
  expect(events[0]).toMatchObject({ projectIssuesUpdated: { type: "created" } });

  await sk.dispose();
});
