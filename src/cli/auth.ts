import { homedir } from "node:os";
import { join } from "node:path";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  unlinkSync,
  chmodSync,
} from "node:fs";

const DEFAULT_SERVER = "https://app.speckle.systems";

export interface ProfileEntry {
  server: string;
  token: string;
}

export interface ConfigFile {
  default?: string;
  profiles: Record<string, ProfileEntry>;
}

export interface ResolvedCredentials {
  server: string;
  token: string;
  source: "env" | "config";
  profile?: string;
}

export interface SaveCredentialsArgs {
  profile?: string;
  server?: string;
  token: string;
  setDefault?: boolean;
}

function paths(home: string = homedir()): { dir: string; file: string } {
  const dir = join(home, ".speckle");
  return { dir, file: join(dir, "config.json") };
}

function readConfig(file: string): ConfigFile {
  if (!existsSync(file)) return { profiles: {} };
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as Partial<ConfigFile>;
    return { default: parsed.default, profiles: parsed.profiles ?? {} };
  } catch {
    return { profiles: {} };
  }
}

function writeConfig(dir: string, file: string, cfg: ConfigFile): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o700 });
  writeFileSync(file, JSON.stringify(cfg, null, 2) + "\n", { mode: 0o600 });
  try {
    chmodSync(file, 0o600);
    chmodSync(dir, 0o700);
  } catch {
    // best-effort on non-POSIX
  }
}

export function loadCredentials(profile?: string, home?: string): ResolvedCredentials {
  const envToken = process.env["SPECKLE_TOKEN"];
  const envServer = process.env["SPECKLE_SERVER"];
  if (envToken) {
    return { server: envServer ?? DEFAULT_SERVER, token: envToken, source: "env" };
  }
  const { file } = paths(home);
  const cfg = readConfig(file);
  const name = profile ?? cfg.default;
  if (!name || !cfg.profiles[name]) {
    throw new Error(
      profile
        ? `No credentials for profile "${profile}". Run: speckle login --profile ${profile} --token <t>`
        : "No SPECKLE_TOKEN env var and no default profile. Run: speckle login --token <t>",
    );
  }
  const entry = cfg.profiles[name];
  return { server: entry.server, token: entry.token, source: "config", profile: name };
}

export function saveCredentials(
  args: SaveCredentialsArgs,
  home?: string,
): { profile: string; configFile: string } {
  const { dir, file } = paths(home);
  const cfg = readConfig(file);
  const profile = args.profile ?? "default";
  cfg.profiles[profile] = { server: args.server ?? DEFAULT_SERVER, token: args.token };
  if (args.setDefault || !cfg.default || Object.keys(cfg.profiles).length === 1) {
    cfg.default = profile;
  }
  writeConfig(dir, file, cfg);
  return { profile, configFile: file };
}

export function clearCredentials(
  profile?: string,
  home?: string,
): { removed: string | null; configFile: string } {
  const { dir, file } = paths(home);
  if (!existsSync(file)) return { removed: null, configFile: file };
  const cfg = readConfig(file);
  const name = profile ?? cfg.default;
  if (!name || !cfg.profiles[name]) return { removed: null, configFile: file };
  delete cfg.profiles[name];
  if (cfg.default === name) {
    const remaining = Object.keys(cfg.profiles);
    cfg.default = remaining[0];
  }
  if (Object.keys(cfg.profiles).length === 0) {
    unlinkSync(file);
  } else {
    writeConfig(dir, file, cfg);
  }
  return { removed: name, configFile: file };
}

export function listProfiles(home?: string): { default: string | undefined; profiles: string[] } {
  const { file } = paths(home);
  const cfg = readConfig(file);
  return { default: cfg.default, profiles: Object.keys(cfg.profiles) };
}

export { DEFAULT_SERVER };
