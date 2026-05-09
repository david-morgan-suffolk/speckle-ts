import type { ArgsDef } from "citty";

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
