import { defineCommand } from "citty";
import { authArgs, output } from "@/cli/commands/_shared.js";
import { buildSpeckle } from "@/cli/client.js";
import { emit, table } from "@/cli/format.js";
import { getSdk } from "@/generated/sdk.js";

const ls = defineCommand({
  meta: { name: "ls", description: "List models in a project" },
  args: {
    ...authArgs,
    projectId: { type: "positional", description: "Project ID", required: true },
    limit: { type: "string", description: "Max results", default: "25" },
    cursor: { type: "string", description: "Pagination cursor" },
  },
  async run({ args }) {
    const { speckle } = buildSpeckle({
      profile: args.profile,
      server: args.server,
      token: args.token,
    });
    try {
      const sdk = getSdk(speckle.http);
      const limit = Number(args.limit);
      const data = await sdk.GetProjectModels({
        projectId: args.projectId,
        limit,
        ...(args.cursor ? { cursor: args.cursor } : {}),
      });
      const { items, totalCount, cursor } = data.project.models;
      if (output(args) === "json") {
        emit({ totalCount, cursor, items }, "json");
      } else {
        emit(
          table(items, [
            { header: "ID", get: (r) => r.id },
            { header: "NAME", get: (r) => r.name },
            { header: "DESCRIPTION", get: (r) => r.description ?? "" },
            { header: "UPDATED", get: (r) => r.updatedAt },
          ]),
          "text",
        );
        emit(`\n${items.length} of ${totalCount}${cursor ? ` (next cursor: ${cursor})` : ""}`, "text");
      }
    } finally {
      await speckle.dispose();
    }
  },
});

const show = defineCommand({
  meta: { name: "show", description: "Show model details" },
  args: {
    ...authArgs,
    projectId: { type: "positional", description: "Project ID", required: true },
    modelId: { type: "positional", description: "Model ID", required: true },
  },
  async run({ args }) {
    const { speckle } = buildSpeckle({
      profile: args.profile,
      server: args.server,
      token: args.token,
    });
    try {
      const model = await speckle.project(args.projectId).model(args.modelId).get;
      if (output(args) === "json") {
        emit(model, "json");
      } else {
        const lines = [
          `id:          ${model.id}`,
          `name:        ${model.name}`,
          `description: ${model.description ?? "(none)"}`,
          `created:     ${model.createdAt}`,
          `updated:     ${model.updatedAt}`,
        ];
        emit(lines.join("\n"), "text");
      }
    } finally {
      await speckle.dispose();
    }
  },
});

export default defineCommand({
  meta: { name: "model", description: "Model commands" },
  subCommands: { ls, show },
});

export { ls, show };
