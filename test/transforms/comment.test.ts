import { test, expect } from "bun:test";
import { threadComments, type FlatComment } from "../../src/transforms/comment.js";

const c = (id: string, parentId: string | null): FlatComment => ({
  id,
  parentId,
  authorId: "u",
  text: id,
  createdAt: "2024-01-01T00:00:00Z",
});

test("threadComments builds tree from flat list", () => {
  const tree = threadComments([c("1", null), c("2", "1"), c("3", "1"), c("4", "2"), c("5", null)]);
  expect(tree.length).toBe(2);
  const root1 = tree.find((n) => n.id === "1")!;
  expect(root1.replies.map((r) => r.id).sort()).toEqual(["2", "3"]);
  const reply2 = root1.replies.find((r) => r.id === "2")!;
  expect(reply2.replies.map((r) => r.id)).toEqual(["4"]);
});

test("threadComments treats unknown parentId as root", () => {
  const tree = threadComments([c("1", "missing")]);
  expect(tree.length).toBe(1);
  expect(tree[0]?.id).toBe("1");
});
