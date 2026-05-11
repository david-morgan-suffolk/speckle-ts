import {
  DASHBOARD_WIDGET_CONTAINER,
  DASHBOARD_WIDGET_DISCRIMINATOR,
  DashboardStateSchema,
  DashboardWidgetSchema,
  type DashboardState,
  type DashboardWidget,
} from "../generated/dashboardWidgets.js";

export interface ExtractWidgetsOptions {
  /**
   * When true, items that fail Zod validation are skipped (with a
   * `console.warn`) instead of throwing. Default: false.
   */
  allowUnknownWidgets?: boolean;
}

/**
 * JSON-parse a dashboard `state` string. Returns `null` for null/empty input.
 * Throws on malformed JSON.
 */
export function parseDashboardState(state: string | null | undefined): unknown {
  if (state === null || state === undefined || state === "") return null;
  try {
    return JSON.parse(state);
  } catch (err) {
    throw new Error(`Invalid dashboard state JSON: ${(err as Error).message}`);
  }
}

/**
 * Parse + validate dashboard state against `DashboardStateSchema`. Unknown
 * fields are preserved (loose schema). Use this when you want the typed shape.
 *
 * Returns `null` for null/empty input. Throws if the JSON is malformed or the
 * top-level structure doesn't match.
 */
export function parseTypedDashboardState(
  state: string | null | undefined,
): DashboardState | null {
  const raw = parseDashboardState(state);
  if (raw === null) return null;
  const result = DashboardStateSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid dashboard state shape: ${result.error.message}`);
  }
  return result.data;
}

/** Stringify a dashboard state object back to JSON. */
export function serializeDashboardState(state: unknown): string {
  return JSON.stringify(state);
}

/**
 * Validate a single value as a `DashboardWidget`. Returns the parsed widget,
 * or `null` if it fails and `allowUnknownWidgets` is set.
 */
export function validateWidget(
  value: unknown,
  opts: ExtractWidgetsOptions = {},
): DashboardWidget | null {
  const result = DashboardWidgetSchema.safeParse(value);
  if (result.success) return result.data;
  if (opts.allowUnknownWidgets) {
    const id =
      value !== null && typeof value === "object"
        ? (value as Record<string, unknown>)[DASHBOARD_WIDGET_DISCRIMINATOR]
        : null;
    console.warn(
      `[speckle] skipping unrecognized dashboard widget (componentId=${String(id)}): ${
        result.error.message
      }`,
    );
    return null;
  }
  throw new Error(`Invalid dashboard widget: ${result.error.message}`);
}

/**
 * Pull widgets from the canonical `state.items[]` container. This is the
 * shape observed in real Speckle dashboards. If `state` is not the expected
 * shape, falls back to `extractWidgetsDeep` (recursive walk).
 */
export function extractWidgets(
  state: unknown,
  opts: ExtractWidgetsOptions = {},
): DashboardWidget[] {
  if (
    state !== null &&
    typeof state === "object" &&
    Array.isArray((state as Record<string, unknown>)[DASHBOARD_WIDGET_CONTAINER])
  ) {
    const items = (state as Record<string, unknown>)[DASHBOARD_WIDGET_CONTAINER] as unknown[];
    const out: DashboardWidget[] = [];
    for (const item of items) {
      const w = validateWidget(item, opts);
      if (w) out.push(w);
    }
    return out;
  }
  return extractWidgetsDeep(state, opts);
}

/**
 * Fallback: recursive walk that collects every object matching the widget
 * shape, anywhere in the tree. Useful when the top-level state schema differs
 * from what was observed (e.g., older or experimental dashboards).
 */
export function extractWidgetsDeep(
  state: unknown,
  opts: ExtractWidgetsOptions = {},
): DashboardWidget[] {
  const out: DashboardWidget[] = [];
  function visit(node: unknown): void {
    if (node === null || node === undefined) return;
    if (Array.isArray(node)) {
      for (const x of node) visit(x);
      return;
    }
    if (typeof node === "object") {
      const obj = node as Record<string, unknown>;
      if (typeof obj[DASHBOARD_WIDGET_DISCRIMINATOR] === "string") {
        const w = validateWidget(obj, opts);
        if (w) out.push(w);
      }
      for (const v of Object.values(obj)) visit(v);
    }
  }
  visit(state);
  return out;
}

export type {
  DashboardDataSource,
  DashboardGridInfo,
  DashboardState,
  DashboardWidget,
} from "../generated/dashboardWidgets.js";
export {
  DASHBOARD_WIDGET_CONTAINER,
  DASHBOARD_WIDGET_DISCRIMINATOR,
  DashboardDataSourceSchema,
  DashboardGridInfoSchema,
  DashboardStateSchema,
  DashboardWidgetSchema,
  KNOWN_WIDGET_COMPONENTS,
  labelForComponentId,
} from "../generated/dashboardWidgets.js";
