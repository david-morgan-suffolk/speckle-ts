import type { ArgsDef } from "citty";
import type { Speckle } from "@/client.js";
import type { ResolvedCredentials } from "@/cli/auth.js";
import { buildSpeckle } from "@/cli/client.js";

export const authArgs = {
  profile: {
    type: "string",
    description: "Credentials profile name from ~/.speckle/config.json",
  },
  server: {
    type: "string",
    description: "Speckle server URL (overrides env + config)",
  },
  token: {
    type: "string",
    description: "Bearer token (overrides env + config)",
  },
  json: {
    type: "boolean",
    description: "Emit JSON instead of formatted text",
    default: false,
  },
} as const satisfies ArgsDef;

export type AuthArgs = {
  profile?: string;
  server?: string;
  token?: string;
  json?: boolean;
};

export function output(args: { json?: boolean }): "text" | "json" {
  return args.json ? "json" : "text";
}

export interface SpeckleContext {
  speckle: Speckle;
  credentials: ResolvedCredentials;
}

export async function withSpeckle<T>(
  args: AuthArgs,
  handler: (ctx: SpeckleContext) => Promise<T>,
): Promise<T> {
  const built = buildSpeckle({
    profile: args.profile,
    server: args.server,
    token: args.token,
  });
  try {
    return await handler(built);
  } finally {
    await built.speckle.dispose();
  }
}
