import * as React from "react";
import type { FlatRow, TreeNode } from "../tree/nodes.js";
import { ICON, SPINNER_FRAMES } from "../tree/icons.js";

interface TreePanelProps {
  rows: FlatRow[];
  cursorIdx: number;
  loading: ReadonlySet<string>;
  focused: boolean;
  spinnerFrame: number;
}

const VIEWPORT_ROWS = 24;

function rowLabel(node: TreeNode): string {
  if (node.kind === "project") {
    const p = node.data;
    return `${p.name}  ·  ${p.visibility}  ·  ${p.role ?? "-"}`;
  }
  if (node.kind === "model") {
    return `${node.fullName}  ·  ${node.data.updatedAt}`;
  }
  const v = node.data;
  const id8 = v.id.slice(0, 8);
  const author = v.authorUser?.name ?? "-";
  const msg = v.message ?? "(no message)";
  return `${id8}  ·  ${msg}  ·  ${author}  ·  ${v.createdAt}`;
}

function rowGlyph(row: FlatRow, isLoading: boolean, spinnerFrame: number): string {
  if (isLoading) {
    return SPINNER_FRAMES[spinnerFrame % SPINNER_FRAMES.length]!;
  }
  if (row.node.kind === "version") return ICON.leaf;
  if (!row.hasChildren) return ICON.leaf;
  return row.expanded ? ICON.expanded : ICON.collapsed;
}

export function TreePanel({
  rows,
  cursorIdx,
  loading,
  focused,
  spinnerFrame,
}: TreePanelProps): React.ReactNode {
  const total = rows.length;
  let start = 0;
  if (total > VIEWPORT_ROWS) {
    const half = Math.floor(VIEWPORT_ROWS / 2);
    start = Math.max(0, Math.min(total - VIEWPORT_ROWS, cursorIdx - half));
  }
  const end = Math.min(total, start + VIEWPORT_ROWS);
  const slice = rows.slice(start, end);
  const title = `Tree (${total} rows)`;
  const titleSuffix = total > VIEWPORT_ROWS ? `  [${start + 1}-${end}/${total}]` : "";

  return (
    <box
      flexGrow={3}
      border
      borderColor={focused ? "cyan" : "gray"}
      padding={1}
      flexDirection="column"
    >
      <text>
        {title}
        {titleSuffix}
      </text>
      {slice.map((row, i) => {
        const absoluteIdx = start + i;
        const cursor = absoluteIdx === cursorIdx;
        const indent = "  ".repeat(row.depth);
        const cursorMark = cursor && focused ? `${ICON.cursor} ` : "  ";
        const glyph = rowGlyph(row, loading.has(row.node.id), spinnerFrame);
        const label = rowLabel(row.node);
        return (
          <text key={row.node.id}>
            {cursorMark}
            {indent}
            {glyph} {label}
          </text>
        );
      })}
      {total === 0 ? <text>(no projects)</text> : null}
    </box>
  );
}
