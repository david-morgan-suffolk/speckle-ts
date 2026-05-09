#!/usr/bin/env node
import { defineCommand, runCommand, showUsage } from "citty";
import { fileURLToPath } from "node:url";
import auth from "@/cli/commands/auth.js";
import account from "@/cli/commands/account.js";
import project from "@/cli/commands/project.js";
import model from "@/cli/commands/model.js";
import version from "@/cli/commands/version.js";
import insight from "@/cli/commands/insight.js";
import template from "@/cli/commands/template.js";
import { authArgs } from "@/cli/commands/_shared.js";
import { emitError } from "@/cli/format.js";

const tui = defineCommand({
  meta: { name: "tui", description: "Launch interactive terminal UI (requires opentui)" },
  args: authArgs,
  async run({ args }) {
    let mod: typeof import("@/cli/tui/index.js");
    try {
      mod = await import("@/cli/tui/index.js");
    } catch (err) {
      throw new Error(
        "TUI dependencies not installed. Install: bun add @opentui/core @opentui/react react",
        { cause: err },
      );
    }
    await mod.run({
      profile: args.profile,
      server: args.server,
      token: args.token,
    });
  },
});

export const main = defineCommand({
  meta: {
    name: "speckle",
    version: "0.1.0",
    description: "Speckle CLI — interact with the Speckle GraphQL API from the terminal",
  },
  subCommands: { auth, account, project, model, version, insight, template, tui },
});

export default main;

const isEntry =
  typeof process !== "undefined" &&
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isEntry) {
  const rawArgs = process.argv.slice(2);
  const isJson = rawArgs.includes("--json");
  (async () => {
    if (rawArgs.includes("--help") || rawArgs.includes("-h")) {
      await showUsage(main);
      return;
    }
    if (rawArgs.length === 1 && rawArgs[0] === "--version") {
      process.stdout.write((main.meta as { version?: string }).version + "\n");
      return;
    }
    await runCommand(main, { rawArgs });
  })().catch((err) => {
    emitError(err, isJson ? "json" : "text");
    process.exit(1);
  });
}
