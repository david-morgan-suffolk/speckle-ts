import { defineCommand } from "citty";
import { authArgs, output, withSpeckle } from "@/cli/commands/_shared.js";
import { emit, table } from "@/cli/format.js";
import { fuzzyFind } from "@/cli/fuzzy.js";
import { getSdk } from "@/generated/sdk.js";
import { listAllProjectModelsTree } from "@/nodes/Project.js";
import { expandHiddenChildren } from "@/workflows/projectTree.js";
import type { Speckle } from "@/client.js";
import type { ModelsTreeItem } from "@/types.js";

const ls = defineCommand({
  meta: { name: "ls", description: "List models in a project" },
  args: {
    ...authArgs,
    projectId: { type: "positional", description: "Project ID", required: true },
    limit: { type: "string", description: "Max results", default: "25" },
    cursor: { type: "string", description: "Pagination cursor" },
  },
  async run({ args }) {
    await withSpeckle(args, async ({ speckle }) => {
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
    });
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
    await withSpeckle(args, async ({ speckle }) => {
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
    });
  },
});

interface FlatModel {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  updatedAt: string;
}

function flattenModels(items: ReadonlyArray<ModelsTreeItem>, out: FlatModel[]): void {
  for (const item of items) {
    if (item.model) {
      out.push({
        id: item.model.id,
        name: item.model.name,
        fullName: item.fullName,
        description: item.model.description,
        updatedAt: item.model.updatedAt,
      });
    }
    if (item.children.length > 0) {
      flattenModels(item.children, out);
    }
  }
}

async function loadModels(
  speckle: Speckle,
  projectId: string,
  fullTree: boolean,
): Promise<FlatModel[]> {
  let items = await listAllProjectModelsTree(speckle, projectId);
  if (fullTree) {
    items = await Promise.all(items.map((it) => expandHiddenChildren(speckle, projectId, it)));
  }
  const flat: FlatModel[] = [];
  flattenModels(items, flat);
  return flat;
}

const find = defineCommand({
  meta: {
    name: "find",
    description: "Fuzzy-find models in a project by name (or --path for full path)",
  },
  args: {
    ...authArgs,
    projectId: { type: "positional", description: "Project ID", required: true },
    query: { type: "positional", description: "Search query", required: true },
    path: { type: "boolean", description: "Match against full model path instead of name", default: false },
    limit: { type: "string", description: "Max results to return", default: "25" },
    threshold: { type: "string", description: "Fuzzy score cutoff (0..1)", default: "0.4" },
    fullTree: { type: "boolean", description: "Expand hidden children (slower, more thorough)", default: false },
  },
  async run({ args }) {
    await withSpeckle(args, async ({ speckle }) => {
      const limit = Number(args.limit);
      const threshold = Number(args.threshold);
      const models = await loadModels(speckle, args.projectId, args.fullTree);

      const matches = fuzzyFind(models, args.query, {
        keys: args.path ? ["fullName"] : ["name"],
        threshold,
        limit,
      });

      if (output(args) === "json") {
        emit({ scanned: models.length, matches }, "json");
      } else {
        emit(
          table(matches, [
            { header: "ID", get: (r) => r.item.id },
            { header: "NAME", get: (r) => r.item.name },
            { header: "PATH", get: (r) => r.item.fullName },
            { header: "UPDATED", get: (r) => r.item.updatedAt },
            { header: "SCORE", get: (r) => r.score.toFixed(3) },
          ]),
          "text",
        );
        emit(`\n${matches.length} match${matches.length === 1 ? "" : "es"} from ${models.length} scanned`, "text");
      }
    });
  },
});

export default defineCommand({
  meta: { name: "model", description: "Model commands" },
  subCommands: { ls, show, find },
});

export { ls, show, find };
