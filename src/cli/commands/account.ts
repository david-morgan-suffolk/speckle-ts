import { defineCommand } from "citty";
import { authArgs, output, withSpeckle } from "@/cli/commands/_shared.js";
import { renderAccount, emit } from "@/cli/format.js";

const info = defineCommand({
  meta: { name: "info", description: "Show authenticated account + permissions" },
  args: authArgs,
  async run({ args }) {
    await withSpeckle(args, async ({ speckle, credentials }) => {
      const account = await speckle.account.get;
      if (output(args) === "json") {
        emit({ server: credentials.server, account }, "json");
      } else {
        emit(renderAccount(account, credentials.server), "text");
      }
    });
  },
});

export default defineCommand({
  meta: { name: "account", description: "Account commands" },
  subCommands: { info },
});

export { info };
