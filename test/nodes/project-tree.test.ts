import { test, expect, mock } from "bun:test";
import { Speckle } from "../../src/client.js";
import {
  ModelsTreeItemSchema,
  ModelsTreeItemPageSchema,
} from "../../src/schemas.js";

const M = (id: string, name: string) => ({
  id,
  name,
  description: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
});

const treeItem = (
  id: string,
  fullName: string,
  modelId: string | null,
  children: unknown[] = [],
) => ({
  id,
  name: fullName.split("/").pop()!,
  fullName,
  hasChildren: children.length > 0,
  updatedAt: "2026-01-01T00:00:00Z",
  model: modelId ? M(modelId, fullName.split("/").pop()!) : null,
  children,
});

test("ModelsTreeItemSchema parses recursive shape with synthetic parents", () => {
  const sample = treeItem("t1", "foo", null, [
    treeItem("t2", "foo/bar", "m_bar"),
    treeItem("t3", "foo/baz", "m_baz", [treeItem("t4", "foo/baz/qux", "m_qux")]),
  ]);
  const parsed = ModelsTreeItemSchema.parse(sample);
  expect(parsed.fullName).toBe("foo");
  expect(parsed.model).toBeNull();
  expect(parsed.children).toHaveLength(2);
  expect(parsed.children[1]?.children[0]?.model?.id).toBe("m_qux");
});

test("ModelsTreeItemPageSchema parses collection envelope", () => {
  const page = {
    totalCount: 3,
    cursor: "next",
    items: [treeItem("t1", "alpha", "m1"), treeItem("t2", "beta", "m2")],
  };
  const parsed = ModelsTreeItemPageSchema.parse(page);
  expect(parsed.totalCount).toBe(3);
  expect(parsed.cursor).toBe("next");
  expect(parsed.items).toHaveLength(2);
});

test("Project.listModelsTree fetches and validates one page", async () => {
  let calls = 0;
  const fakeFetch = (async () => {
    calls += 1;
    return new Response(
      JSON.stringify({
        data: {
          project: {
            modelsTree: {
              totalCount: 1,
              cursor: null,
              items: [treeItem("t1", "alpha", "m1")],
            },
          },
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as unknown as typeof fetch;
  const sk = new Speckle({ fetch: fakeFetch });
  const page = await sk.project("p1").listModelsTree();
  expect(calls).toBe(1);
  expect(page.totalCount).toBe(1);
  expect(page.items[0]?.model?.id).toBe("m1");
  await sk.dispose();
});

test("Project.listAllModelsTree pages until cursor is null", async () => {
  const pages = [
    {
      totalCount: 3,
      cursor: "c1",
      items: [treeItem("t1", "a", "m1")],
    },
    {
      totalCount: 3,
      cursor: "c2",
      items: [treeItem("t2", "b", "m2")],
    },
    {
      totalCount: 3,
      cursor: null,
      items: [treeItem("t3", "c", "m3")],
    },
  ];
  let i = 0;
  const fakeFetch = (async () => {
    const body = { data: { project: { modelsTree: pages[i++] } } };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as unknown as typeof fetch;
  const sk = new Speckle({ fetch: fakeFetch });
  const items = await sk.project("p1").listAllModelsTree();
  expect(items).toHaveLength(3);
  expect(i).toBe(3);
  await sk.dispose();
});

test("Project.listModelsTree is lazy — no fetch on construction", () => {
  const fakeFetch = mock(async () => new Response("{}", { status: 200 }));
  const sk = new Speckle({ fetch: fakeFetch as unknown as typeof fetch });
  sk.project("p1");
  expect(fakeFetch).not.toHaveBeenCalled();
});

test("Project.modelChildrenTree fetches subtree for fullName", async () => {
  let capturedBody: unknown = null;
  const fakeFetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    capturedBody = init?.body ? JSON.parse(init.body as string) : null;
    return new Response(
      JSON.stringify({
        data: {
          project: {
            modelChildrenTree: [treeItem("c1", "foo/bar", "m_bar")],
          },
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as unknown as typeof fetch;
  const sk = new Speckle({ fetch: fakeFetch });
  const children = await sk.project("p1").modelChildrenTree("foo");
  expect(children).toHaveLength(1);
  expect(children[0]?.fullName).toBe("foo/bar");
  expect((capturedBody as { variables: { fullName: string } }).variables.fullName).toBe(
    "foo",
  );
  await sk.dispose();
});
