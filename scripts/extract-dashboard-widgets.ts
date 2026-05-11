import { resolve } from "node:path";
import { Speckle } from "../src/index.js";

const TOKEN = process.env.SPECKLE_TOKEN;
const SERVER = process.env.SPECKLE_SERVER ?? "https://app.speckle.systems";
const OUT_DIR = resolve(process.cwd(), process.env.SPECKLE_DASHBOARDS_OUT ?? "tmp");
const WORKSPACE_FILTER = process.env.SPECKLE_DASHBOARDS_WORKSPACE_ID;
const MAX_WORKSPACE_PAGES = Number(process.env.SPECKLE_DASHBOARDS_MAX_WS_PAGES ?? 5);
const SAMPLE_CAP = Number(process.env.SPECKLE_DASHBOARDS_SAMPLE_CAP ?? 5);
const MAX_STRING_LEN = 80;
const DISCRIMINATOR_CANDIDATES = [
  "componentId",
  "componentName",
  "widgetType",
  "kind",
  "type",
  "componentType",
  "_type",
] as const;
const WIDGET_ARRAY_NAMES = new Set(["items", "widgets", "tiles", "cells", "cards", "panels"]);

if (!TOKEN) {
  console.error("SPECKLE_TOKEN missing");
  process.exit(1);
}

interface WorkspaceRef {
  id: string;
  name: string;
  slug: string;
}

const LIST_WORKSPACES = /* GraphQL */ `
  query ProbeListWorkspaces($cursor: String) {
    activeUser {
      workspaces(cursor: $cursor, limit: 50) {
        cursor
        items {
          id
          name
          slug
        }
      }
    }
  }
`;

async function listAccessibleWorkspaces(sk: Speckle): Promise<WorkspaceRef[]> {
  if (WORKSPACE_FILTER) {
    return [{ id: WORKSPACE_FILTER, name: "<filtered>", slug: "" }];
  }
  const out: WorkspaceRef[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < MAX_WORKSPACE_PAGES; page++) {
    const data: { activeUser: { workspaces: { cursor: string | null; items: WorkspaceRef[] } } | null } =
      await sk.http.request(LIST_WORKSPACES, { cursor });
    const wp = data.activeUser?.workspaces;
    if (!wp) break;
    out.push(...wp.items);
    cursor = wp.cursor;
    if (!cursor) break;
  }
  return out;
}

interface DashboardSnapshot {
  id: string;
  name: string;
  workspaceId: string;
  workspaceSlug: string;
  state: unknown | null;
  parseError?: string;
}

interface FieldShape {
  occurrences: number;
  types: string[];
  samples: unknown[];
  arrayElementType?: string;
}

interface WidgetShape {
  count: number;
  fields: Record<string, FieldShape>;
}

interface WidgetShapeReport {
  capturedAt: string;
  server: string;
  workspaceCount: number;
  dashboardCount: number;
  dashboardsWithState: number;
  discriminatorField: string | null;
  discriminatorCandidates: Record<string, number>;
  /** Container array names (e.g., `items`, `widgets`) that hold widget objects. */
  widgetArrayPaths: string[];
  widgets: Record<string, WidgetShape>;
  /** componentId / componentName UUIDs are opaque — map to human titles when available. */
  kindLabels: Record<string, string[]>;
  unrecognizedNotes: string[];
}

function shortType(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

function truncate(v: unknown): unknown {
  if (typeof v === "string") {
    return v.length > MAX_STRING_LEN ? `${v.slice(0, MAX_STRING_LEN)}…` : v;
  }
  if (Array.isArray(v)) return `[array len=${v.length}]`;
  if (v !== null && typeof v === "object") return "[object]";
  return v;
}

function addSample(field: FieldShape, value: unknown): void {
  const t = shortType(value);
  if (!field.types.includes(t)) field.types.push(t);
  if (field.samples.length >= SAMPLE_CAP) return;
  const sample = truncate(value);
  if (field.samples.some((s) => JSON.stringify(s) === JSON.stringify(sample))) return;
  field.samples.push(sample);
}

function recordWidget(
  report: WidgetShapeReport,
  discriminator: string,
  obj: Record<string, unknown>,
): void {
  const kindRaw = obj[discriminator];
  const kind = typeof kindRaw === "string" ? kindRaw : `<non-string:${shortType(kindRaw)}>`;
  let widget = report.widgets[kind];
  if (!widget) {
    widget = { count: 0, fields: {} };
    report.widgets[kind] = widget;
  }
  widget.count += 1;
  for (const [k, v] of Object.entries(obj)) {
    let field = widget.fields[k];
    if (!field) {
      field = { occurrences: 0, types: [], samples: [] };
      widget.fields[k] = field;
    }
    field.occurrences += 1;
    addSample(field, v);
    if (Array.isArray(v) && v.length > 0) {
      const et = shortType(v[0]);
      if (!field.arrayElementType) field.arrayElementType = et;
      else if (field.arrayElementType !== et) field.arrayElementType = "mixed";
    }
  }
}

interface VisitContext {
  /** Name of the parent array this object lives in (if any). */
  arrayName: string | null;
}

function walk(
  node: unknown,
  visit: (obj: Record<string, unknown>, ctx: VisitContext) => void,
  ctx: VisitContext = { arrayName: null },
): void {
  if (node === null || node === undefined) return;
  if (Array.isArray(node)) {
    for (const x of node) walk(x, visit, ctx);
    return;
  }
  if (typeof node === "object") {
    visit(node as Record<string, unknown>, ctx);
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      const childCtx: VisitContext = Array.isArray(v) ? { arrayName: k } : { arrayName: null };
      walk(v, visit, childCtx);
    }
  }
}

interface DiscriminatorTally {
  total: number;
  /** Hits where the object lives directly inside a widget-named array. */
  inWidgetArray: number;
  /** Distinct values for this discriminator. */
  distinctValues: Set<string>;
}

function emptyTally(): DiscriminatorTally {
  return { total: 0, inWidgetArray: 0, distinctValues: new Set() };
}

function tallyDiscriminator(state: unknown): Record<string, DiscriminatorTally> {
  const tallies: Record<string, DiscriminatorTally> = Object.fromEntries(
    DISCRIMINATOR_CANDIDATES.map((c) => [c, emptyTally()]),
  );
  walk(state, (obj, ctx) => {
    for (const c of DISCRIMINATOR_CANDIDATES) {
      const v = obj[c];
      if (typeof v === "string") {
        const t = tallies[c]!;
        t.total += 1;
        t.distinctValues.add(v);
        if (ctx.arrayName && WIDGET_ARRAY_NAMES.has(ctx.arrayName)) {
          t.inWidgetArray += 1;
        }
      }
    }
  });
  return tallies;
}

function pickDiscriminator(
  totals: Record<string, DiscriminatorTally>,
): string | null {
  let best: { field: string; score: number } | null = null;
  for (const [k, t] of Object.entries(totals)) {
    if (t.total === 0) continue;
    // Score: prefer discriminators that appear inside widget-named arrays.
    // Tie-break on distinct values (more variety = more likely to be a real kind).
    const score = t.inWidgetArray * 1000 + t.distinctValues.size;
    if (!best || score > best.score) best = { field: k, score };
  }
  return best?.field ?? null;
}

function renderMarkdown(report: WidgetShapeReport): string {
  const lines: string[] = [];
  lines.push(`# Dashboard widget shapes`);
  lines.push("");
  lines.push(`- captured: ${report.capturedAt}`);
  lines.push(`- server: ${report.server}`);
  lines.push(`- workspaces: ${report.workspaceCount}`);
  lines.push(`- dashboards: ${report.dashboardCount} (${report.dashboardsWithState} with non-null state)`);
  lines.push(`- chosen discriminator: \`${report.discriminatorField ?? "<none>"}\``);
  lines.push(
    `- widget container arrays: ${
      report.widgetArrayPaths.length === 0 ? "_none_" : report.widgetArrayPaths.map((p) => `\`${p}[]\``).join(", ")
    }`,
  );
  lines.push("");
  lines.push(`## Discriminator candidates`);
  lines.push("");
  lines.push(`| field | hits |`);
  lines.push(`|-------|-----:|`);
  for (const [k, v] of Object.entries(report.discriminatorCandidates).sort((a, b) => b[1] - a[1])) {
    lines.push(`| \`${k}\` | ${v} |`);
  }
  lines.push("");

  const kinds = Object.entries(report.widgets).sort((a, b) => b[1].count - a[1].count);
  if (kinds.length === 0) {
    lines.push(`_No widget-like objects discovered. Either dashboards are empty, the chosen discriminator field is wrong, or state shape differs from assumed convention. See \`dashboard-states.raw.json\`._`);
  } else {
    lines.push(`## Widget kinds (${kinds.length})`);
    lines.push("");
    for (const [kind, shape] of kinds) {
      const labels = report.kindLabels[kind] ?? [];
      const labelLine = labels.length > 0 ? ` — observed titles: ${labels.map((l) => `"${l}"`).join(", ")}` : "";
      lines.push(`### \`${kind}\` (count: ${shape.count})${labelLine}`);
      lines.push("");
      lines.push(`| field | occurs | types | sample |`);
      lines.push(`|-------|-------:|-------|--------|`);
      const fieldRows = Object.entries(shape.fields).sort(
        (a, b) => b[1].occurrences - a[1].occurrences,
      );
      for (const [name, f] of fieldRows) {
        const types = f.arrayElementType ? `array<${f.arrayElementType}>` : f.types.join("|");
        const sampleStr = f.samples.length === 0 ? "" : JSON.stringify(f.samples[0]);
        lines.push(`| \`${name}\` | ${f.occurrences}/${shape.count} | ${types} | ${sampleStr.replace(/\|/g, "\\|")} |`);
      }
      lines.push("");
    }
  }

  if (report.unrecognizedNotes.length > 0) {
    lines.push(`## Notes`);
    lines.push("");
    for (const n of report.unrecognizedNotes) lines.push(`- ${n}`);
    lines.push("");
  }

  lines.push(`## Source pinning`);
  lines.push("");
  lines.push(`Frontend cross-check (manual step): clone \`specklesystems/speckle-server\` and look under`);
  lines.push(`\`packages/frontend-2\` for widget definitions. Pin SHA here once verified:`);
  lines.push("");
  lines.push(`- speckle-server commit: \`<pending>\``);
  lines.push(`- files inspected: \`<pending>\``);
  lines.push("");
  return lines.join("\n");
}

async function main(): Promise<void> {
  const sk = new Speckle({ server: SERVER, token: TOKEN });
  try {
    const workspaces = await listAccessibleWorkspaces(sk);
    console.log(`workspaces accessible: ${workspaces.length}`);

    const dashboards: DashboardSnapshot[] = [];
    for (const ws of workspaces) {
      try {
        for await (const d of sk.workspace(ws.id).dashboards()) {
          let parsedState: unknown | null = null;
          let parseError: string | undefined;
          if (d.state) {
            try {
              parsedState = JSON.parse(d.state);
            } catch (err) {
              parseError = (err as Error).message;
            }
          }
          const snap: DashboardSnapshot = {
            id: d.id,
            name: d.name,
            workspaceId: ws.id,
            workspaceSlug: ws.slug,
            state: parsedState,
            ...(parseError !== undefined ? { parseError } : {}),
          };
          dashboards.push(snap);
        }
      } catch (err) {
        console.warn(`workspace ${ws.id} dashboards listing failed: ${(err as Error).message}`);
      }
    }
    console.log(`dashboards discovered: ${dashboards.length}`);

    const rawPath = resolve(OUT_DIR, "dashboard-states.raw.json");
    await Bun.write(
      rawPath,
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          server: SERVER,
          dashboards,
        },
        null,
        2,
      ),
    );
    console.log(`wrote ${rawPath}`);

    const discriminatorTallies: Record<string, DiscriminatorTally> = Object.fromEntries(
      DISCRIMINATOR_CANDIDATES.map((c) => [c, emptyTally()]),
    );
    for (const d of dashboards) {
      if (!d.state) continue;
      const tally = tallyDiscriminator(d.state);
      for (const [k, v] of Object.entries(tally)) {
        const dest = discriminatorTallies[k]!;
        dest.total += v.total;
        dest.inWidgetArray += v.inWidgetArray;
        for (const dv of v.distinctValues) dest.distinctValues.add(dv);
      }
    }

    const discriminator = pickDiscriminator(discriminatorTallies);
    const widgetArrayPathsSet = new Set<string>();
    const report: WidgetShapeReport = {
      capturedAt: new Date().toISOString(),
      server: SERVER,
      workspaceCount: workspaces.length,
      dashboardCount: dashboards.length,
      dashboardsWithState: dashboards.filter((d) => d.state !== null).length,
      discriminatorField: discriminator,
      discriminatorCandidates: Object.fromEntries(
        Object.entries(discriminatorTallies).map(([k, t]) => [
          k,
          t.total,
        ]),
      ),
      widgetArrayPaths: [],
      widgets: {},
      kindLabels: {},
      unrecognizedNotes: [],
    };

    if (discriminator) {
      for (const d of dashboards) {
        if (!d.state) continue;
        walk(d.state, (obj, ctx) => {
          if (typeof obj[discriminator] !== "string") return;
          if (ctx.arrayName && WIDGET_ARRAY_NAMES.has(ctx.arrayName)) {
            widgetArrayPathsSet.add(ctx.arrayName);
            recordWidget(report, discriminator, obj);
            const kindRaw = obj[discriminator] as string;
            const title = obj["title"];
            if (typeof title === "string" && title.length > 0) {
              const labels = report.kindLabels[kindRaw] ?? [];
              if (!labels.includes(title)) labels.push(title);
              report.kindLabels[kindRaw] = labels;
            }
          }
        });
      }
      report.widgetArrayPaths = [...widgetArrayPathsSet].sort();
    } else if (report.dashboardsWithState > 0) {
      report.unrecognizedNotes.push(
        `No common discriminator field found among candidates: ${DISCRIMINATOR_CANDIDATES.join(", ")}. Inspect dashboard-states.raw.json manually.`,
      );
    }

    const shapesJsonPath = resolve(OUT_DIR, "widget-shapes.json");
    await Bun.write(shapesJsonPath, JSON.stringify(report, null, 2));
    console.log(`wrote ${shapesJsonPath}`);

    const shapesMdPath = resolve(OUT_DIR, "widget-shapes.md");
    await Bun.write(shapesMdPath, renderMarkdown(report));
    console.log(`wrote ${shapesMdPath}`);

    const kinds = Object.keys(report.widgets);
    console.log(
      `summary: ${kinds.length} widget kinds via \`${discriminator ?? "<none>"}\` — ${kinds.slice(0, 8).join(", ")}${kinds.length > 8 ? ", …" : ""}`,
    );
  } finally {
    await sk.dispose();
  }
}

main().catch((err) => {
  console.error("✗ extract-dashboard-widgets failed:", err);
  process.exit(1);
});
