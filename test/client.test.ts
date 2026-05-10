import { test, expect, mock } from "bun:test";
import { Speckle } from "../src/client.js";
import { mockSpeckle } from "./_helpers/index.js";
import { projectHandler, projectInfoFixture } from "./_helpers/handlers/project.js";

test("Speckle defaults to app.speckle.systems", () => {
  const sk = new Speckle();
  expect(sk.server).toBe("https://app.speckle.systems");
  expect(sk.token).toBeUndefined();
});

test("Speckle accepts custom server + token", () => {
  const sk = new Speckle({ server: "https://example.com", token: "abc" });
  expect(sk.server).toBe("https://example.com");
  expect(sk.token).toBe("abc");
});

test("Speckle.project / .user / .workspace return node refs without fetching", () => {
  const fakeFetch = mock(async () => new Response("{}", { status: 200 }));
  const sk = new Speckle({ token: "t", fetch: fakeFetch as unknown as typeof fetch });
  const proj = sk.project("p1");
  const user = sk.user("u1");
  const ws = sk.workspace("w1");
  expect(proj.id).toBe("p1");
  expect(user.id).toBe("u1");
  expect(ws.id).toBe("w1");
  expect(fakeFetch).not.toHaveBeenCalled();
});

test("Project.model().version() chains without fetching", () => {
  const fakeFetch = mock(async () => new Response("{}", { status: 200 }));
  const sk = new Speckle({ fetch: fakeFetch as unknown as typeof fetch });
  const v = sk.project("p").model("m").version("v");
  expect(v.id).toBe("v");
  expect(v.model.id).toBe("m");
  expect(v.model.project.id).toBe("p");
  expect(fakeFetch).not.toHaveBeenCalled();
});

test("Node.get fetches once and caches; refresh re-fetches", async () => {
  const { sk, callsFor } = mockSpeckle({
    Project: projectHandler(projectInfoFixture({ id: "p1", name: "Demo" })),
  });
  const proj = sk.project("p1");
  const a = await proj.get;
  const b = await proj.get;
  expect(a).toBe(b);
  expect(callsFor("Project")).toHaveLength(1);
  await proj.refresh();
  expect(callsFor("Project")).toHaveLength(2);
  await sk.dispose();
});
