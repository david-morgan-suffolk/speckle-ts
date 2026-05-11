import { defineCommand } from "citty";
import { authArgs, output, withSpeckle } from "@/cli/commands/_shared.js";
import { emit, table } from "@/cli/format.js";
import { fuzzyFind } from "@/cli/fuzzy.js";
import { getSdk } from "@/generated/sdk.js";

const ls = defineCommand({
  meta: { name: "ls", description: "List projects accessible to the active user" },
  args: {
    ...authArgs,
    workspace: { type: "string", description: "Filter by workspace ID" },
    limit: { type: "string", description: "Max results", default: "25" },
    cursor: { type: "string", description: "Pagination cursor" },
  },
  async run({ args }) {
    await withSpeckle(args, async ({ speckle }) => {
      const sdk = getSdk(speckle.http);
      const limit = Number(args.limit);
      const variables: Parameters<typeof sdk.SearchProjects>[0] = {
        limit,
        ...(args.cursor ? { cursor: args.cursor } : {}),
        ...(args.workspace ? { filter: { workspaceId: args.workspace } } : {}),
      };
      const data = await sdk.SearchProjects(variables);
      const items = data.activeUser?.projects.items ?? [];
      const totalCount = data.activeUser?.projects.totalCount ?? 0;
      const cursor = data.activeUser?.projects.cursor ?? null;
      if (output(args) === "json") {
        emit({ totalCount, cursor, items }, "json");
      } else {
        emit(
          table(items, [
            { header: "ID", get: (r) => r.id },
            { header: "NAME", get: (r) => r.name },
            { header: "VISIBILITY", get: (r) => r.visibility },
            { header: "ROLE", get: (r) => r.role ?? "" },
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
  meta: { name: "show", description: "Show project details" },
  args: {
    ...authArgs,
    id: { type: "positional", description: "Project ID", required: true },
  },
  async run({ args }) {
    await withSpeckle(args, async ({ speckle }) => {
      const project = await speckle.project(args.id).get;
      if (output(args) === "json") {
        emit(project, "json");
      } else {
        const lines = [
          `id:          ${project.id}`,
          `name:        ${project.name}`,
          `description: ${project.description ?? "(none)"}`,
          `visibility:  ${project.visibility}`,
          `role:        ${project.role ?? "(none)"}`,
          `workspace:   ${project.workspaceId ?? "(none)"}`,
          `created:     ${project.createdAt}`,
          `updated:     ${project.updatedAt}`,
        ];
        emit(lines.join("\n"), "text");
      }
    });
  },
});

const FIND_PAGE_SIZE = 100;
const FIND_MAX_PAGES = 20;

const find = defineCommand({
  meta: {
    name: "find",
    description: "Fuzzy-find projects by name",
  },
  args: {
    ...authArgs,
    query: { type: "positional", description: "Search query", required: true },
    workspace: { type: "string", description: "Filter by workspace ID" },
    limit: { type: "string", description: "Max results to return", default: "25" },
    threshold: { type: "string", description: "Fuzzy score cutoff (0..1)", default: "0.4" },
    all: { type: "boolean", description: "Paginate through every project before scoring", default: false },
  },
  async run({ args }) {
    await withSpeckle(args, async ({ speckle }) => {
      const sdk = getSdk(speckle.http);
      const limit = Number(args.limit);
      const threshold = Number(args.threshold);

      type ProjectItem = NonNullable<
        Awaited<ReturnType<typeof sdk.SearchProjects>>["activeUser"]
      >["projects"]["items"][number];

      const collected: ProjectItem[] = [];
      let cursor: string | null = null;
      let pages = 0;
      const targetMin = args.all ? Infinity : limit * 4;

      while (true) {
        const variables: Parameters<typeof sdk.SearchProjects>[0] = {
          limit: FIND_PAGE_SIZE,
          ...(cursor ? { cursor } : {}),
          ...(args.workspace ? { filter: { workspaceId: args.workspace } } : {}),
        };
        const data = await sdk.SearchProjects(variables);
        const page = data.activeUser?.projects;
        if (!page) break;
        collected.push(...page.items);
        pages += 1;
        if (!page.cursor) break;
        if (collected.length >= targetMin) break;
        if (pages >= FIND_MAX_PAGES) break;
        cursor = page.cursor;
      }

      const matches = fuzzyFind(collected, args.query, {
        keys: ["name"],
        threshold,
        limit,
      });

      if (output(args) === "json") {
        emit({ scanned: collected.length, matches }, "json");
      } else {
        emit(
          table(matches, [
            { header: "ID", get: (r) => r.item.id },
            { header: "NAME", get: (r) => r.item.name },
            { header: "ROLE", get: (r) => r.item.role ?? "" },
            { header: "UPDATED", get: (r) => r.item.updatedAt },
            { header: "SCORE", get: (r) => r.score.toFixed(3) },
          ]),
          "text",
        );
        emit(`\n${matches.length} match${matches.length === 1 ? "" : "es"} from ${collected.length} scanned`, "text");
      }
    });
  },
});

export default defineCommand({
  meta: { name: "project", description: "Project commands" },
  subCommands: { ls, show, find },
});

export { ls, show, find };
