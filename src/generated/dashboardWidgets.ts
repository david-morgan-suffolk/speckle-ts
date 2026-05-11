// Reverse-engineered dashboard state + widget schemas.
//
// Authoritative widget types are NOT in the open-source `speckle-server` repo —
// the dashboards UI runs in a separate app at runtime config `dashboardsOrigin`
// (see `packages/frontend-2/pages/workspaces/[slug]/dashboards/[id].vue:113-140`).
// Server-side, `state` is a nullable text column with the comment
// `// TODO: Anything other than this` (`packages/server/modules/dashboards/domain/types.ts:9`).
//
// These schemas are inferred by `scripts/extract-dashboard-widgets.ts` from
// real dashboards. Treat as best-effort, regenerate when widget shapes drift.
//
// Pinned references:
//   - speckle-server commit: d3854d45a23649b50d3a2ce3c4868de211769bda (no widget defs found)
//   - probe artifact: tmp/widget-shapes.json
//
// Top-level dashboard state shape (observed):
//   {
//     id: string,
//     name: string,
//     modifiedAt: number,          // ms epoch
//     version: string,             // "1" so far
//     items: Widget[],             // widgets here
//     themeName: string,
//     customTheme: unknown | null,
//     dataSources: DataSourceRef[],
//     extraStorage: Record<string, unknown>,
//   }
//
// Widget objects: keyed by `componentId` (UUID-ish string). Each widget has
// its own nested `state` whose shape varies by component — kept as a loose
// passthrough object so round-trips are safe.

import { z } from "zod";

/** Discriminator field on every widget. */
export const DASHBOARD_WIDGET_DISCRIMINATOR = "componentId" as const;

/** Top-level state property holding the widget list. */
export const DASHBOARD_WIDGET_CONTAINER = "items" as const;

/**
 * Human-readable labels for `componentId` UUIDs observed in the wild. The
 * dashboards app maps these to specific widget kinds (Model viewer, Element
 * table, etc.). Values come from `tmp/widget-shapes.json`.
 *
 * Treat as a hint, not a contract — the upstream app owns the mapping and
 * can add/rename kinds without notice.
 */
export const KNOWN_WIDGET_COMPONENTS: Record<string, string> = {
  "A7F8D92E-4B1C-4E2F-9A3D-5C6B8E7F9A1B": "Model viewer",
  "B8E9C03F-5C2D-4F3E-8B4E-6D7C9F8E0A2C": "Element table",
  "31C1F5B4-1CE2-45FC-A45A-D2880D906FFD": "Section",
  "D6F7E81B-3E0F-2B1G-6D2G-4F5E7B6F8C0E": "Element count",
  "E1B2F36C-8F5A-7C6B-1E7B-9A0F2C1B3D5A": "Levels",
  "A1B2C3D4-E5F6-7890-ABCD-EF1234567890": "Property checker",
  "B4E5C69F-1C8D-0F9E-4B0E-2D3C5F4E6A8C": "Material stats",
  "C5F6D70A-2D9E-1A0F-5C1F-3E4D6A5F7B9D": "Material map",
  "C9D8E7F6-1A2B-3C4D-5E6F-7A8B9C0D1E2F": "Pivot table",
  "F2C3D4E5-9A6B-7C8D-2E9F-3A4B5C6D7E8F": "Render Genie",
  "C4R8O2N-4B1C-4E2F-9A3D-5C6B8E7F9A1X": "Embodied Carbon",
  "c5a34b90-ae15-47aa-b1c0-ffd0309682ad": "Area by Name",
  "c5a34b90-ae15-47aa-b1c0-ffd0309682af": "Area by Level",
  "F1C2D36E-9F8A-7B6C-2E8D-5A9F3C2E4B7D": "Map",
  "B5E5C69F-9C8D-0F9E-4B0E-2D3C5F4E6A8C": "Material quantities over time",
  "A3B4C5D6-1E2F-3A4B-5C6D-7E8F9A0B1C2D": "Embed",
  "54584d7f-256c-4324-ac87-8c27196627e3": "Families",
  "E5F6A7B8-9C0D-1E2F-3A4B-5C6D7E8F9A0B": "Weight by profile",
  "E1B2F36D-8F5A-7C6B-1E7B-9A0F2C1B3D5F": "Uniformat Groups",
  "F2G3H4I5-J6K7-8901-LMNO-PQ2345678901": "Model Validation",
  "ba9b4b00-8696-4d4e-b6ae-e3f5edc63ef8": "Model structure",
  "E1B2F36D-8F5A-7C6B-1E7B-9A0F2XXX1B3D5F": "Total property value",
  "E1B2F36D-8XXA-7C6B-1E7B-WE-SHOULD_GENPROP_GUIDs": "Categories",
  "C9F0D14A-6D3E-5A4F-9C5F-7E8D0A9F1B3D": "Text / Markdown",
  "D0A1E25B-7E4F-6B5A-0D6A-8F9E1B0A2C4E": "Image",
  "30FCD6C0-0F8A-4DAA-8EA0-92A898B72E42": "Ratio value",
  "5E4A12ED-E06B-4CFE-9686-32A40CAB0355": "Ratio value by property",
  "C2A0F73E-52C8-4D76-9E3A-9F11FEE2A0C1": "Distinct values count",
  // Same UUID family as Uniformat Groups / Categories — observed with user
  // title "level by category". Likely a generic property-grouping widget kind
  // shipped with placeholder dev UUIDs.
  "E1B2F36D-8XXA-7C6B-1E7B-9A0F2C1B3D5F": "Property grouping",
};

/** Convenience: human label for a componentId, or the id itself if unknown. */
export function labelForComponentId(componentId: string): string {
  return KNOWN_WIDGET_COMPONENTS[componentId] ?? componentId;
}

/** Grid position + size for a widget tile. */
export const DashboardGridInfoSchema = z.looseObject({
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
});
export type DashboardGridInfo = z.infer<typeof DashboardGridInfoSchema>;

/**
 * Top-level widget shape. Each widget carries:
 *   - `id`           unique widget instance id (UUID)
 *   - `componentId`  widget kind discriminator
 *   - `title`        display title
 *   - `gridInfo`     position + size
 *   - `state`        kind-specific config (opaque to this SDK; passthrough)
 *   - `locked`       optional, observed on Section / Property checker kinds
 *
 * Kind-specific schemas can be added later as additional Zod validators that
 * narrow the `state` field per `componentId`.
 */
export const DashboardWidgetSchema = z.looseObject({
  id: z.string(),
  componentId: z.string(),
  title: z.string(),
  gridInfo: DashboardGridInfoSchema,
  state: z.looseObject({}),
  locked: z.boolean().optional(),
});
export type DashboardWidget = z.infer<typeof DashboardWidgetSchema>;

/** Reference to a model/version used as a data source by widgets. */
export const DashboardDataSourceSchema = z.looseObject({
  guid: z.string(),
  projectId: z.string(),
  modelId: z.string(),
  versionId: z.string().optional(),
  pinnedVersion: z.boolean().optional(),
  modelName: z.string().optional(),
});
export type DashboardDataSource = z.infer<typeof DashboardDataSourceSchema>;

/** Full parsed dashboard state. */
export const DashboardStateSchema = z.looseObject({
  id: z.string().optional(),
  name: z.string().optional(),
  modifiedAt: z.number().optional(),
  version: z.string().optional(),
  items: z.array(DashboardWidgetSchema),
  themeName: z.string().optional(),
  customTheme: z.unknown().optional(),
  dataSources: z.array(DashboardDataSourceSchema).optional(),
  extraStorage: z.record(z.string(), z.unknown()).optional(),
});
export type DashboardState = z.infer<typeof DashboardStateSchema>;
