import { test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync, existsSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  loadCredentials,
  saveCredentials,
  clearCredentials,
  listProfiles,
} from "../../src/cli/auth.js";

let HOME: string;

beforeEach(() => {
  HOME = mkdtempSync(join(tmpdir(), "speckle-cli-test-"));
  delete process.env.SPECKLE_TOKEN;
  delete process.env.SPECKLE_SERVER;
});

afterEach(() => {
  rmSync(HOME, { recursive: true, force: true });
});

test("loadCredentials throws when no env and no config", () => {
  expect(() => loadCredentials(undefined, HOME)).toThrow(/No SPECKLE_TOKEN/);
});

test("loadCredentials prefers env over config", () => {
  saveCredentials({ token: "from-config", server: "https://config.example" }, HOME);
  process.env.SPECKLE_TOKEN = "from-env";
  process.env.SPECKLE_SERVER = "https://env.example";
  const creds = loadCredentials(undefined, HOME);
  expect(creds.source).toBe("env");
  expect(creds.token).toBe("from-env");
  expect(creds.server).toBe("https://env.example");
});

test("saveCredentials + loadCredentials round-trip with profile", () => {
  saveCredentials(
    { token: "t1", server: "https://example.com", profile: "dev" },
    HOME,
  );
  const creds = loadCredentials("dev", HOME);
  expect(creds.source).toBe("config");
  expect(creds.token).toBe("t1");
  expect(creds.server).toBe("https://example.com");
  expect(creds.profile).toBe("dev");
});

test("first saved profile becomes default", () => {
  saveCredentials({ token: "t1", profile: "alpha" }, HOME);
  const { default: def, profiles } = listProfiles(HOME);
  expect(def).toBe("alpha");
  expect(profiles).toEqual(["alpha"]);
});

test("setDefault flag re-points the default", () => {
  saveCredentials({ token: "t1", profile: "alpha" }, HOME);
  saveCredentials({ token: "t2", profile: "beta", setDefault: true }, HOME);
  const { default: def } = listProfiles(HOME);
  expect(def).toBe("beta");
});

test("clearCredentials removes the profile and unlinks file when empty", () => {
  saveCredentials({ token: "t1", profile: "only" }, HOME);
  const file = join(HOME, ".speckle", "config.json");
  expect(existsSync(file)).toBe(true);
  const removed = clearCredentials("only", HOME);
  expect(removed.removed).toBe("only");
  expect(existsSync(file)).toBe(false);
});

test("clearCredentials retains other profiles and re-points default", () => {
  saveCredentials({ token: "t1", profile: "alpha" }, HOME);
  saveCredentials({ token: "t2", profile: "beta" }, HOME);
  clearCredentials("alpha", HOME);
  const { default: def, profiles } = listProfiles(HOME);
  expect(profiles).toEqual(["beta"]);
  expect(def).toBe("beta");
});

test("config file is written with 0600 perms (POSIX only)", () => {
  if (process.platform === "win32") return;
  saveCredentials({ token: "t1" }, HOME);
  const file = join(HOME, ".speckle", "config.json");
  const mode = statSync(file).mode & 0o777;
  expect(mode).toBe(0o600);
});

test("config file contains a token", () => {
  saveCredentials({ token: "secret-token", profile: "p" }, HOME);
  const file = join(HOME, ".speckle", "config.json");
  const raw = readFileSync(file, "utf8");
  expect(raw).toContain("secret-token");
});
