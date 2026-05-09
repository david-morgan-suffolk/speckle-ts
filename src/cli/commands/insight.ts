import { defineCommand } from "citty";
import { authArgs, output } from "@/cli/commands/_shared.js";
import { buildSpeckle } from "@/cli/client.js";
import { emit, table } from "@/cli/format.js";

const ls = defineCommand({
  meta: { name: "ls", description: "List insights on a project" },
  args: {
    ...authArgs,
    projectId: { type: "positional", description: "Project ID", required: true },
    type: { type: "string", description: "Filter by insight type" },
  },
  async run({ args }) {
    const { speckle } = buildSpeckle({
      profile: args.profile,
      server: args.server,
      token: args.token,
    });
    try {
      const insights = await speckle.project(args.projectId).listInsights(args.type);
      if (output(args) === "json") {
        emit(insights, "json");
      } else {
        emit(
          table(insights, [
            { header: "ID", get: (r) => r.id },
            { header: "NAME", get: (r) => r.name },
            { header: "TYPE", get: (r) => r.type ?? "" },
            { header: "CUSTOMIZED", get: (r) => String(r.customized) },
            { header: "UPDATED", get: (r) => r.updatedAt },
          ]),
          "text",
        );
      }
    } finally {
      await speckle.dispose();
    }
  },
});

const results = defineCommand({
  meta: {
    name: "results",
    description: "Fetch insight results — supply --model + --version, --model alone, or neither for aggregate",
  },
  args: {
    ...authArgs,
    projectId: { type: "positional", description: "Project ID", required: true },
    insightId: { type: "positional", description: "Insight ID", required: true },
    model: { type: "string", description: "Model ID (required for model/version results)" },
    version: { type: "string", description: "Version ID (paired with --model)" },
    limit: { type: "string", description: "Max results (model + aggregate modes)" },
  },
  async run({ args }) {
    const { speckle } = buildSpeckle({
      profile: args.profile,
      server: args.server,
      token: args.token,
    });
    try {
      const insight = speckle.project(args.projectId).insight(args.insightId);
      const limit = args.limit ? Number(args.limit) : undefined;
      let payload;
      if (args.version) {
        if (!args.model) {
          throw new Error("--version requires --model");
        }
        payload = await insight.versionResults(args.model, args.version);
      } else if (args.model) {
        payload = await insight.modelResults(args.model, limit);
      } else {
        payload = await insight.aggregateResults(limit);
      }
      if (output(args) === "json") {
        emit(payload, "json");
      } else {
        emit(
          table(payload, [
            { header: "ID", get: (r) => r.id },
            { header: "MODEL", get: (r) => r.modelId ?? "" },
            { header: "VERSION", get: (r) => r.versionId ?? "" },
            { header: "SUMMARY", get: (r) => (r.summary ? JSON.stringify(r.summary) : "") },
            { header: "TIMESTAMP", get: (r) => r.timestamp },
          ]),
          "text",
        );
      }
    } finally {
      await speckle.dispose();
    }
  },
});

export default defineCommand({
  meta: { name: "insight", description: "Insight commands" },
  subCommands: { ls, results },
});

export { ls, results };
