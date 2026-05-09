import { defineCommand } from "citty";
import { authArgs, output, withSpeckle } from "@/cli/commands/_shared.js";
import { emit, table } from "@/cli/format.js";
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

export default defineCommand({
  meta: { name: "project", description: "Project commands" },
  subCommands: { ls, show },
});

export { ls, show };
