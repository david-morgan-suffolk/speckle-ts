import { test, expect } from "bun:test";
import { partitionByVisibility, byWorkspace } from "../../src/transforms/project.js";
import type { ProjectInfo } from "../../src/types.js";

const p = (id: string, visibility: string, workspaceId: string | null): ProjectInfo => ({
  id,
  name: id,
  description: null,
  visibility,
  role: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  workspaceId,
});

test("partitionByVisibility splits PUBLIC vs PRIVATE", () => {
  const out = partitionByVisibility([p("a", "PUBLIC", null), p("b", "PRIVATE", null), p("c", "WORKSPACE", null)]);
  expect(out.public.map((x) => x.id)).toEqual(["a"]);
  expect(out.private.map((x) => x.id).sort()).toEqual(["b", "c"]);
});

test("byWorkspace groups null workspace as 'personal'", () => {
  const out = byWorkspace([p("a", "PRIVATE", "ws1"), p("b", "PRIVATE", null), p("c", "PRIVATE", "ws1")]);
  expect(out["ws1"]?.length).toBe(2);
  expect(out["personal"]?.length).toBe(1);
});
