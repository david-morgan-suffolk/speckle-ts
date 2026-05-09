import { defineCommand } from "citty";
import { authArgs, output } from "@/cli/commands/_shared.js";
import { buildSpeckle } from "@/cli/client.js";
import { renderAccount, emit } from "@/cli/format.js";

const info = defineCommand({
  meta: { name: "info", description: "Show authenticated account + permissions" },
  args: authArgs,
  async run({ args }) {
    const { speckle, credentials } = buildSpeckle({
      profile: args.profile,
      server: args.server,
      token: args.token,
    });
    try {
      const account = await speckle.account.get;
      if (output(args) === "json") {
        emit({ server: credentials.server, account }, "json");
      } else {
        emit(renderAccount(account, credentials.server), "text");
      }
    } finally {
      await speckle.dispose();
    }
  },
});

export default defineCommand({
  meta: { name: "account", description: "Account commands" },
  subCommands: { info },
});

export { info };
