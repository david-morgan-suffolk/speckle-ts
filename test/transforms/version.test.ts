import { test, expect } from "bun:test";
import { sortByCreatedAtDesc, groupBySourceApplication, authorIds } from "../../src/transforms/version.js";
import type { VersionInfo } from "../../src/types.js";

const v = (id: string, createdAt: string, app: string | null, authorId: string | null): VersionInfo => ({
  id,
  message: null,
  sourceApplication: app,
  referencedObject: "obj",
  createdAt,
  authorUser: authorId ? { id: authorId, name: `u-${authorId}` } : null,
});

test("sortByCreatedAtDesc returns newest first", () => {
  const a = v("a", "2024-01-01T00:00:00Z", "Rhino", "u1");
  const b = v("b", "2024-06-01T00:00:00Z", "Rhino", "u2");
  const c = v("c", "2024-03-01T00:00:00Z", "Revit", "u1");
  const out = sortByCreatedAtDesc([a, b, c]);
  expect(out.map((x) => x.id)).toEqual(["b", "c", "a"]);
});

test("sortByCreatedAtDesc does not mutate input", () => {
  const arr = [v("a", "2024-01-01T00:00:00Z", null, null), v("b", "2024-02-01T00:00:00Z", null, null)];
  const before = arr.map((x) => x.id);
  sortByCreatedAtDesc(arr);
  expect(arr.map((x) => x.id)).toEqual(before);
});

test("groupBySourceApplication groups null as 'unknown'", () => {
  const out = groupBySourceApplication([
    v("a", "2024-01-01T00:00:00Z", "Rhino", null),
    v("b", "2024-01-01T00:00:00Z", null, null),
    v("c", "2024-01-01T00:00:00Z", "Rhino", null),
  ]);
  expect(out["Rhino"]?.length).toBe(2);
  expect(out["unknown"]?.length).toBe(1);
});

test("authorIds returns unique non-null authors", () => {
  const out = authorIds([
    v("a", "2024-01-01T00:00:00Z", null, "u1"),
    v("b", "2024-01-01T00:00:00Z", null, "u1"),
    v("c", "2024-01-01T00:00:00Z", null, "u2"),
    v("d", "2024-01-01T00:00:00Z", null, null),
  ]);
  expect([...out].sort()).toEqual(["u1", "u2"]);
});
