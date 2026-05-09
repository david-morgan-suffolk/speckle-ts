import * as React from "react";
import { ICON } from "../tree/icons.js";
import type { AccountSummary } from "../state.js";
import type { WsStatus } from "../subs/manager.js";
import type { Focus } from "../state.js";

interface HeaderProps {
  server: string;
  account: AccountSummary | null;
  wsStatus: WsStatus;
  focused: Focus;
}

function wsGlyph(s: WsStatus): string {
  if (s === "open") return ICON.wsOpen;
  if (s === "connecting") return ICON.wsConnecting;
  if (s === "error") return ICON.wsError;
  return ICON.wsConnecting;
}

export function Header({ server, account, wsStatus, focused }: HeaderProps): React.ReactNode {
  const acct = account ? `${account.name}${account.role ? ` (${account.role})` : ""}` : "...";
  const focusTag = focused === "tree" ? "[tree]" : "[events]";
  const left = `speckle — ${server} · ${acct} · ws:${wsGlyph(wsStatus)} ${focusTag}`;
  const right = "tab focus  ↑/↓ nav  ⏎ expand  ← collapse  v viewer  c clear  q quit";
  return (
    <box paddingLeft={1} paddingRight={1}>
      <text>
        {left}    {right}
      </text>
    </box>
  );
}
