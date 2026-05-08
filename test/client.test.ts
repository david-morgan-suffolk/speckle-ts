import { test, expect, mock } from "bun:test";
import { Speckle } from "../src/client.js";

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
  let calls = 0;
  const fakeFetch = (async (_url: string | URL | Request, _init?: RequestInit) => {
    calls += 1;
    return new Response(
      JSON.stringify({
        data: {
          project: {
            id: "p1",
            name: "Demo",
            description: null,
            visibility: "PUBLIC",
            role: null,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
            workspaceId: null,
          },
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as unknown as typeof fetch;
  const sk = new Speckle({ fetch: fakeFetch });
  const proj = sk.project("p1");
  const a = await proj.get;
  const b = await proj.get;
  expect(a).toBe(b);
  expect(calls).toBe(1);
  await proj.refresh();
  expect(calls).toBe(2);
  await sk.dispose();
});
