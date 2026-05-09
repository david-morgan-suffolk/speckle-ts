import { test, expect } from "bun:test";
import { Speckle } from "../../src/client.js";

const v = (id: string, msg: string | null = null) => ({
  id,
  message: msg,
  sourceApplication: "rhino",
  referencedObject: `obj_${id}`,
  createdAt: "2026-04-01T00:00:00Z",
  authorUser: { id: "u1", name: "alice" },
});

test("Model.listVersions parses page", async () => {
  const fakeFetch = (async () =>
    new Response(
      JSON.stringify({
        data: {
          project: {
            model: {
              versions: { totalCount: 2, cursor: null, items: [v("v1"), v("v2", "tweak")] },
            },
          },
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    )) as unknown as typeof fetch;
  const sk = new Speckle({ fetch: fakeFetch });
  const page = await sk.project("p1").model("m1").listVersions({ limit: 50 });
  expect(page.totalCount).toBe(2);
  expect(page.cursor).toBeNull();
  expect(page.items[1]?.message).toBe("tweak");
  await sk.dispose();
});

test("Model.listAllVersions pages until cursor null", async () => {
  const pages = [
    { totalCount: 4, cursor: "c1", items: [v("a"), v("b")] },
    { totalCount: 4, cursor: "c2", items: [v("c")] },
    { totalCount: 4, cursor: null, items: [v("d")] },
  ];
  let i = 0;
  const fakeFetch = (async () =>
    new Response(
      JSON.stringify({ data: { project: { model: { versions: pages[i++] } } } }),
      { status: 200, headers: { "content-type": "application/json" } },
    )) as unknown as typeof fetch;
  const sk = new Speckle({ fetch: fakeFetch });
  const items = await sk.project("p1").model("m1").listAllVersions();
  expect(items.map((x) => x.id)).toEqual(["a", "b", "c", "d"]);
  expect(i).toBe(3);
  await sk.dispose();
});
