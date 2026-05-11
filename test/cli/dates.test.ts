import { test, expect } from "bun:test";
import { parseDate, withinRange } from "../../src/cli/dates.js";

const NOW = new Date("2026-05-11T12:00:00Z");

test("parseDate parses ISO 8601 date", () => {
  const d = parseDate("2026-01-15", NOW);
  expect(d.toISOString().startsWith("2026-01-15")).toBe(true);
});

test("parseDate parses ISO 8601 datetime", () => {
  const d = parseDate("2026-01-15T10:30:00Z", NOW);
  expect(d.toISOString()).toBe("2026-01-15T10:30:00.000Z");
});

test("parseDate handles 'now'", () => {
  expect(parseDate("now", NOW).getTime()).toBe(NOW.getTime());
});

test("parseDate handles 'today' (start of day)", () => {
  const d = parseDate("today", NOW);
  expect(d.getHours()).toBe(0);
  expect(d.getMinutes()).toBe(0);
  expect(d.getSeconds()).toBe(0);
});

test("parseDate handles 'yesterday' (start of prior day)", () => {
  const today = parseDate("today", NOW);
  const yesterday = parseDate("yesterday", NOW);
  expect(today.getTime() - yesterday.getTime()).toBe(86_400_000);
});

test("parseDate handles relative days '7d'", () => {
  const d = parseDate("7d", NOW);
  expect(NOW.getTime() - d.getTime()).toBe(7 * 86_400_000);
});

test("parseDate handles relative weeks '2w'", () => {
  const d = parseDate("2w", NOW);
  expect(NOW.getTime() - d.getTime()).toBe(14 * 86_400_000);
});

test("parseDate handles relative months '1m'", () => {
  const d = parseDate("1m", NOW);
  expect(d.getUTCMonth()).toBe(3); // May -> April
});

test("parseDate handles relative years '1y'", () => {
  const d = parseDate("1y", NOW);
  expect(d.getUTCFullYear()).toBe(2025);
});

test("parseDate is case-insensitive for keywords + relative units", () => {
  expect(parseDate("TODAY", NOW).getTime()).toBe(parseDate("today", NOW).getTime());
  expect(parseDate("7D", NOW).getTime()).toBe(parseDate("7d", NOW).getTime());
});

test("parseDate throws on garbage", () => {
  expect(() => parseDate("not-a-date", NOW)).toThrow(/invalid date/);
  expect(() => parseDate("", NOW)).toThrow(/invalid date/);
});

test("withinRange respects both bounds", () => {
  const since = new Date("2026-01-01T00:00:00Z");
  const until = new Date("2026-02-01T00:00:00Z");
  expect(withinRange("2026-01-15T00:00:00Z", since, until)).toBe(true);
  expect(withinRange("2025-12-31T00:00:00Z", since, until)).toBe(false);
  expect(withinRange("2026-02-02T00:00:00Z", since, until)).toBe(false);
});

test("withinRange treats null bounds as open", () => {
  expect(withinRange("2026-01-15T00:00:00Z", null, null)).toBe(true);
});

test("withinRange returns false for invalid ISO", () => {
  expect(withinRange("garbage", null, null)).toBe(false);
});
