import { defineCommand } from "citty";
import { Speckle } from "@/client.js";
import { saveCredentials, clearCredentials, listProfiles } from "@/cli/auth.js";

const login = defineCommand({
  meta: { name: "login", description: "Save a Speckle token to ~/.speckle/config.json" },
  args: {
    token: { type: "string", description: "Personal access token", required: true },
    server: { type: "string", description: "Server URL", default: "https://app.speckle.systems" },
    profile: { type: "string", description: "Profile name", default: "default" },
    setDefault: { type: "boolean", description: "Mark this profile as default", default: false },
    skipVerify: { type: "boolean", description: "Skip token validation", default: false },
  },
  async run({ args }) {
    if (!args.skipVerify) {
      const sk = new Speckle({ server: args.server, token: args.token });
      try {
        const account = await sk.account.get;
        console.log(`✓ token valid (account: ${account.name})`);
      } catch (err) {
        console.error("✗ token validation failed:", (err as Error).message);
        await sk.dispose();
        process.exit(1);
      }
      await sk.dispose();
    }
    const result = saveCredentials({
      profile: args.profile,
      server: args.server,
      token: args.token,
      setDefault: args.setDefault,
    });
    console.log(`✓ saved profile "${result.profile}" → ${result.configFile}`);
  },
});

const logout = defineCommand({
  meta: { name: "logout", description: "Remove a saved profile" },
  args: {
    profile: { type: "string", description: "Profile name (default: current default)" },
  },
  async run({ args }) {
    const result = clearCredentials(args.profile);
    if (result.removed) {
      console.log(`✓ removed profile "${result.removed}"`);
    } else {
      console.log("nothing to remove");
    }
  },
});

const list = defineCommand({
  meta: { name: "list", description: "List saved profiles" },
  async run() {
    const { default: def, profiles } = listProfiles();
    if (profiles.length === 0) {
      console.log("no profiles saved");
      return;
    }
    for (const name of profiles) {
      console.log(`${name === def ? "* " : "  "}${name}`);
    }
  },
});

export default defineCommand({
  meta: { name: "auth", description: "Manage Speckle credentials" },
  subCommands: { login, logout, list },
});

export { login, logout, list };
