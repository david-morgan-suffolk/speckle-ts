import { test, expect } from "bun:test";
import { fuzzyFind } from "../../src/cli/fuzzy.js";

const projects = [
  { id: "p1", name: "Houses Pilot" },
  { id: "p2", name: "Bridges" },
  { id: "p3", name: "Hospital Tower" },
  { id: "p4", name: "Warehouse Floor" },
];

test("fuzzyFind returns matches sorted by score (ascending = better first)", () => {
  const results = fuzzyFind(projects, "house", { keys: ["name"] });
  expect(results.length).toBeGreaterThan(0);
  expect(results[0]!.item.id).toBe("p1");
  for (let i = 1; i < results.length; i++) {
    expect(results[i]!.score).toBeGreaterThanOrEqual(results[i - 1]!.score);
  }
});

test("fuzzyFind respects the limit option", () => {
  const results = fuzzyFind(projects, "o", { keys: ["name"], limit: 2 });
  expect(results.length).toBeLessThanOrEqual(2);
});

test("fuzzyFind threshold filters out poor matches", () => {
  const strict = fuzzyFind(projects, "zzz", { keys: ["name"], threshold: 0.1 });
  expect(strict.length).toBe(0);
});

test("fuzzyFind empty query returns no results", () => {
  expect(fuzzyFind(projects, "", { keys: ["name"] })).toEqual([]);
});

test("fuzzyFind matches against multiple keys", () => {
  const items = [
    { id: "a", name: "Alpha", path: "buildings/north" },
    { id: "b", name: "Beta", path: "buildings/south" },
  ];
  const byName = fuzzyFind(items, "alpha", { keys: ["name"] });
  const byPath = fuzzyFind(items, "north", { keys: ["path"] });
  expect(byName[0]!.item.id).toBe("a");
  expect(byPath[0]!.item.id).toBe("a");
});
