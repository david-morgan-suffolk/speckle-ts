import { defineCommand } from "citty";
import { authArgs, output, withSpeckle } from "@/cli/commands/_shared.js";
import { emit, table } from "@/cli/format.js";
import { getSdk } from "@/generated/sdk.js";

const ls = defineCommand({
  meta: { name: "ls", description: "List versions of a model" },
  args: {
    ...authArgs,
    projectId: { type: "positional", description: "Project ID", required: true },
    modelId: { type: "positional", description: "Model ID", required: true },
    limit: { type: "string", description: "Max results", default: "25" },
    cursor: { type: "string", description: "Pagination cursor" },
  },
  async run({ args }) {
    await withSpeckle(args, async ({ speckle }) => {
      const sdk = getSdk(speckle.http);
      const limit = Number(args.limit);
      const data = await sdk.GetModelVersions({
        projectId: args.projectId,
        modelId: args.modelId,
        limit,
        ...(args.cursor ? { cursor: args.cursor } : {}),
      });
      const { items, totalCount, cursor } = data.project.model.versions;
      if (output(args) === "json") {
        emit({ totalCount, cursor, items }, "json");
      } else {
        emit(
          table(items, [
            { header: "ID", get: (r) => r.id },
            { header: "MESSAGE", get: (r) => r.message ?? "" },
            { header: "AUTHOR", get: (r) => r.authorUser?.name ?? "" },
            { header: "SOURCE", get: (r) => r.sourceApplication ?? "" },
            { header: "CREATED", get: (r) => r.createdAt },
          ]),
          "text",
        );
        emit(`\n${items.length} of ${totalCount}${cursor ? ` (next cursor: ${cursor})` : ""}`, "text");
      }
    });
  },
});

export default defineCommand({
  meta: { name: "version", description: "Version commands" },
  subCommands: { ls },
});

export { ls };
