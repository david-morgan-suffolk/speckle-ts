import { test, expect, spyOn } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  extractWidgets,
  extractWidgetsDeep,
  KNOWN_WIDGET_COMPONENTS,
  labelForComponentId,
  parseDashboardState,
  parseTypedDashboardState,
  serializeDashboardState,
  validateWidget,
} from "../../src/dashboards/state.js";
import { mockSpeckle } from "../_helpers/index.js";

const SYNTHETIC_PATH = resolve(
  __dirname,
  "../_helpers/fixtures/dashboard-states/synthetic.json",
);
const SYNTHETIC = JSON.parse(readFileSync(SYNTHETIC_PATH, "utf8"));

test("parseDashboardState: returns null for null/empty inputs", () => {
  expect(parseDashboardState(null)).toBeNull();
  expect(parseDashboardState(undefined)).toBeNull();
  expect(parseDashboardState("")).toBeNull();
});

test("parseDashboardState: parses a valid JSON string", () => {
  expect(parseDashboardState(JSON.stringify(SYNTHETIC))).toEqual(SYNTHETIC);
});

test("parseDashboardState: throws on malformed JSON", () => {
  expect(() => parseDashboardState("{not json")).toThrow(/Invalid dashboard state JSON/);
});

test("serializeDashboardState: round-trips", () => {
  expect(JSON.parse(serializeDashboardState(SYNTHETIC))).toEqual(SYNTHETIC);
});

test("parseTypedDashboardState: returns the typed state with widgets", () => {
  const typed = parseTypedDashboardState(JSON.stringify(SYNTHETIC));
  expect(typed).not.toBeNull();
  expect(typed!.items).toHaveLength(3);
  expect(typed!.items[0]!.title).toBe("Model viewer");
  expect(typed!.dataSources![0]!.guid).toBe("ae0c0cba-b0c0-4432-810f-93252284df25");
});

test("parseTypedDashboardState: throws when items is missing", () => {
  expect(() => parseTypedDashboardState(JSON.stringify({ name: "x" }))).toThrow(
    /Invalid dashboard state shape/,
  );
});

test("extractWidgets: pulls every item under state.items[]", () => {
  const widgets = extractWidgets(SYNTHETIC);
  expect(widgets).toHaveLength(3);
  expect(widgets.map((w) => w.componentId)).toEqual([
    "A7F8D92E-4B1C-4E2F-9A3D-5C6B8E7F9A1B",
    "B8E9C03F-5C2D-4F3E-8B4E-6D7C9F8E0A2C",
    "B4E5C69F-1C8D-0F9E-4B0E-2D3C5F4E6A8C",
  ]);
  expect(widgets[2]!.locked).toBe(true);
});

test("extractWidgets: ignores nested type:string column metadata (no false positives)", () => {
  // Element table widget has displayProperties[] with { type: 'string' } objects.
  // The OLD deep-walk-by-`type` would match those. New canonical extractor walks
  // only state.items[] and matches on componentId, so we get exactly 3.
  const widgets = extractWidgets(SYNTHETIC);
  expect(widgets).toHaveLength(3);
});

test("extractWidgets: falls back to deep walk when items[] is absent", () => {
  const oddState = {
    panels: [
      { id: "p1", componentId: "X", title: "T", gridInfo: { x: 0, y: 0, w: 1, h: 1 }, state: {} },
    ],
  };
  const widgets = extractWidgets(oddState);
  expect(widgets).toHaveLength(1);
  expect(widgets[0]!.componentId).toBe("X");
});

test("extractWidgetsDeep: collects widgets nested anywhere", () => {
  const nested = {
    rows: [
      {
        cells: [
          { id: "a", componentId: "k1", title: "A", gridInfo: { x: 0, y: 0, w: 1, h: 1 }, state: {} },
          { id: "b", componentId: "k1", title: "B", gridInfo: { x: 0, y: 0, w: 1, h: 1 }, state: {} },
        ],
      },
    ],
  };
  const widgets = extractWidgetsDeep(nested);
  expect(widgets.map((w) => w.id)).toEqual(["a", "b"]);
});

test("validateWidget: enforces required shape", () => {
  expect(() => validateWidget({ id: "x", componentId: "k" })).toThrow(/Invalid dashboard widget/);
});

test("validateWidget: returns null + warns with allowUnknownWidgets", () => {
  const warn = spyOn(console, "warn").mockImplementation(() => {});
  const result = validateWidget(
    { id: "x", componentId: "k" },
    { allowUnknownWidgets: true },
  );
  expect(result).toBeNull();
  expect(warn).toHaveBeenCalled();
  warn.mockRestore();
});

test("labelForComponentId: known UUID resolves to human label", () => {
  expect(labelForComponentId("A7F8D92E-4B1C-4E2F-9A3D-5C6B8E7F9A1B")).toBe("Model viewer");
});

test("labelForComponentId: unknown UUID returns itself", () => {
  expect(labelForComponentId("nope")).toBe("nope");
});

test("KNOWN_WIDGET_COMPONENTS contains all probe-discovered kinds", () => {
  // Sanity check that the catalog is non-empty and covers core kinds.
  expect(Object.keys(KNOWN_WIDGET_COMPONENTS).length).toBeGreaterThanOrEqual(25);
  expect(KNOWN_WIDGET_COMPONENTS["B8E9C03F-5C2D-4F3E-8B4E-6D7C9F8E0A2C"]).toBe("Element table");
});

test("Dashboard.extractWidgets pulls widgets from a fetched dashboard", async () => {
  const { sk } = mockSpeckle({
    GetDashboard: () => ({
      dashboard: {
        id: "dash_1",
        name: "D",
        state: JSON.stringify(SYNTHETIC),
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        projects: [],
        workspace: { id: "ws_1", name: "Acme", slug: "acme" },
        createdBy: null,
      },
    }),
  });
  const widgets = await sk.workspace("ws_1").dashboard("dash_1").extractWidgets();
  await sk.dispose();
  expect(widgets.map((w) => w.title)).toEqual(["Model viewer", "Element table", "Material stats"]);
});

test("Dashboard.updateState serializes and dispatches UpdateDashboard", async () => {
  const { sk, callsFor } = mockSpeckle({
    UpdateDashboard: () => ({
      dashboardMutations: {
        update: {
          id: "dash_1",
          name: "D",
          state: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          projects: [],
          workspace: { id: "ws_1", name: "Acme", slug: "acme" },
          createdBy: null,
        },
      },
    }),
  });
  await sk.workspace("ws_1").dashboard("dash_1").updateState(SYNTHETIC);
  await sk.dispose();
  const input = callsFor("UpdateDashboard")[0]!.variables["input"] as {
    id: string;
    state: string;
  };
  expect(input.id).toBe("dash_1");
  expect(JSON.parse(input.state)).toEqual(SYNTHETIC);
});
