import type { BuildSpeckleOptions } from "@/cli/client.js";

export async function run(opts: BuildSpeckleOptions): Promise<void> {
  const core = await import("@opentui/core");
  const react = await import("react");
  const reactRenderer = await import("@opentui/react");
  const { App } = await import("@/cli/tui/App.js");
  const renderer = await core.createCliRenderer();
  reactRenderer.createRoot(renderer).render(react.createElement(App, opts));
}
