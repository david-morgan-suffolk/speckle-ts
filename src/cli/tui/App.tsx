import * as React from "react";
import { useKeyboard } from "@opentui/react";
import { formatError } from "@/cli/format.js";
import type { BuildSpeckleOptions } from "@/cli/client.js";
import { useDashboard } from "./state.js";
import { Header } from "./panels/Header.js";
import { TreePanel } from "./panels/TreePanel.js";
import { EventsPanel } from "./panels/EventsPanel.js";
import { useSpinner } from "./hooks/useSpinner.js";
import { ViewerPanel } from "./panels/ViewerPanel.js";
import type { SubChannel } from "./subs/events.js";

const SUB_KEYS: Record<string, SubChannel> = {
  p: "project",
  m: "models",
  V: "versions",
  o: "comments",
};

export function App(props: BuildSpeckleOptions): React.ReactNode {
  const dash = useDashboard(props);
  const spinnerFrame = useSpinner(dash.loading.size > 0);

  useKeyboard(async (key) => {
    if (key.name === "q") {
      await dash.dispose();
      process.exit(0);
    }
    if (key.name === "tab") {
      dash.toggleFocus();
      return;
    }
    if (key.name === "1") {
      dash.setFocus("tree");
      return;
    }
    if (key.name === "2") {
      dash.setFocus("events");
      return;
    }
    if (key.name === "c") {
      dash.clearEvents();
      return;
    }
    if (key.name === "v") {
      dash.toggleViewer();
      return;
    }
    if (dash.focused === "tree") {
      if (key.name === "up" || key.name === "k") return dash.moveCursor(-1);
      if (key.name === "down" || key.name === "j") return dash.moveCursor(1);
      if (key.name === "g") return dash.jumpCursor("top");
      if (key.name === "G") return dash.jumpCursor("bottom");
      if (key.name === "return" || key.name === "enter" || key.name === "right" || key.name === "l") {
        await dash.toggleExpand();
        return;
      }
      if (key.name === "left" || key.name === "h") {
        dash.collapse();
        return;
      }
      const ch = SUB_KEYS[key.name];
      if (ch) dash.toggleSub(ch);
      return;
    }
    if (dash.focused === "events") {
      if (key.name === "up" || key.name === "k") return dash.scrollEvents(1);
      if (key.name === "down" || key.name === "j") return dash.scrollEvents(-1);
      if (key.name === "g") return dash.jumpEvents("top");
      if (key.name === "G") return dash.jumpEvents("bottom");
      const ch = SUB_KEYS[key.name];
      if (ch) dash.toggleSub(ch);
    }
  });

  if (dash.error) {
    const f = formatError(dash.error);
    return (
      <box border padding={1} flexDirection="column">
        <text>
          {f.name}: {f.message}
        </text>
        {f.cause ? (
          <text>
            caused by: {f.cause.name}: {f.cause.message}
          </text>
        ) : null}
        <text>(press q to quit)</text>
      </box>
    );
  }

  return (
    <box flexDirection="column">
      <Header
        server={dash.server}
        account={dash.account}
        wsStatus={dash.wsStatus}
        focused={dash.focused}
      />
      <TreePanel
        rows={dash.rows}
        cursorIdx={dash.cursorIdx}
        loading={dash.loading}
        focused={dash.focused === "tree"}
        spinnerFrame={spinnerFrame}
      />
      <EventsPanel
        events={dash.events}
        subs={dash.subs}
        scrollOffset={dash.scrollOffset}
        focused={dash.focused === "events"}
      />
      {dash.viewerOpen ? (
        <ViewerPanel
          target={dash.selectedVersion}
          server={dash.server}
          token={dash.token}
          focused={false}
        />
      ) : null}
    </box>
  );
}
