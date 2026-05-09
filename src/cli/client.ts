import { Speckle } from "@/client.js";
import { loadCredentials, type ResolvedCredentials } from "@/cli/auth.js";

export interface BuildSpeckleOptions {
  profile?: string;
  server?: string;
  token?: string;
}

export interface BuiltSpeckle {
  speckle: Speckle;
  credentials: ResolvedCredentials;
}

export function buildSpeckle(opts: BuildSpeckleOptions = {}): BuiltSpeckle {
  let credentials: ResolvedCredentials;
  if (opts.token) {
    credentials = {
      server: opts.server ?? process.env["SPECKLE_SERVER"] ?? "https://app.speckle.systems",
      token: opts.token,
      source: "env",
    };
  } else {
    credentials = loadCredentials(opts.profile);
    if (opts.server) credentials = { ...credentials, server: opts.server };
  }
  const speckle = new Speckle({ server: credentials.server, token: credentials.token });
  return { speckle, credentials };
}
