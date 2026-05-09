import * as React from "react";
import { ICON } from "../tree/icons.js";
import { formatTs, type DashboardEvent, type SubChannel } from "../subs/events.js";

interface EventsPanelProps {
  events: DashboardEvent[];
  subs: Record<SubChannel, boolean>;
  scrollOffset: number;
  focused: boolean;
}

const VIEWPORT_ROWS = 14;

function subLabel(channel: SubChannel, on: boolean): string {
  const glyph = on ? ICON.subOn : ICON.subOff;
  return `${glyph} ${channel}`;
}

export function EventsPanel({
  events,
  subs,
  scrollOffset,
  focused,
}: EventsPanelProps): React.ReactNode {
  const total = events.length;
  const end = Math.max(0, total - scrollOffset);
  const start = Math.max(0, end - VIEWPORT_ROWS);
  const slice = events.slice(start, end);

  const subsLine = (["project", "models", "versions", "comments"] as SubChannel[])
    .map((c) => subLabel(c, subs[c]))
    .join("   ");

  const headerSuffix =
    total > VIEWPORT_ROWS ? `  [${start + 1}-${end}/${total}${scrollOffset > 0 ? " ↑" : ""}]` : "";

  return (
    <box
      flexGrow={2}
      border
      borderColor={focused ? "cyan" : "gray"}
      padding={1}
      flexDirection="column"
    >
      <text>
        Events ({total}){headerSuffix}
      </text>
      <text>Subs: {subsLine}</text>
      <text>{"─".repeat(40)}</text>
      {slice.map((e, i) => (
        <text key={`${e.ts}-${start + i}`}>
          {formatTs(e.ts)}  {e.channel}.{e.type}  {e.summary}
        </text>
      ))}
      {total === 0 ? <text>(awaiting events…)</text> : null}
    </box>
  );
}
