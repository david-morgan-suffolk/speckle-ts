import { defineCommand } from "citty";
import { authArgs, output, withSpeckle } from "@/cli/commands/_shared.js";
import { parseDate, withinRange } from "@/cli/dates.js";
import { emit, table } from "@/cli/format.js";
import { fuzzyFind } from "@/cli/fuzzy.js";
import { getSdk } from "@/generated/sdk.js";
import { listAllModelVersions, listModelVersions } from "@/nodes/Model.js";
import type { VersionInfo } from "@/types.js";

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

const FIND_PAGE_SIZE = 100;

const find = defineCommand({
  meta: {
    name: "find",
    description: "Filter versions by date range and/or fuzzy-match commit message",
  },
  args: {
    ...authArgs,
    projectId: { type: "positional", description: "Project ID", required: true },
    modelId: { type: "positional", description: "Model ID", required: true },
    since: { type: "string", description: "Lower date bound (ISO, today, yesterday, now, or Nd/Nw/Nm/Ny)" },
    until: { type: "string", description: "Upper date bound (same formats as --since)" },
    query: { type: "string", description: "Fuzzy-match commit message" },
    limit: { type: "string", description: "Max results to return", default: "25" },
    threshold: { type: "string", description: "Fuzzy score cutoff (0..1)", default: "0.4" },
    all: { type: "boolean", description: "Paginate through every version before filtering", default: false },
  },
  async run({ args }) {
    await withSpeckle(args, async ({ speckle }) => {
      const limit = Number(args.limit);
      const threshold = Number(args.threshold);
      const since = args.since ? parseDate(args.since) : null;
      const until = args.until ? parseDate(args.until) : null;
      const hasDateFilter = since !== null || until !== null;
      const fetchAll = args.all || hasDateFilter;

      let versions: VersionInfo[];
      if (fetchAll) {
        versions = await listAllModelVersions(speckle, args.projectId, args.modelId);
      } else {
        const page = await listModelVersions(speckle, args.projectId, args.modelId, {
          limit: Math.max(FIND_PAGE_SIZE, limit * 4),
        });
        versions = [...page.items];
      }

      const filtered = hasDateFilter
        ? versions.filter((v) => withinRange(v.createdAt, since, until))
        : versions;

      const scored = args.query
        ? fuzzyFind(filtered, args.query, { keys: ["message"], threshold, limit })
        : filtered.slice(0, limit).map((v) => ({ item: v, score: 0 }));

      if (output(args) === "json") {
        emit({ scanned: versions.length, matched: filtered.length, results: scored }, "json");
      } else {
        const columns = [
          { header: "ID", get: (r: { item: VersionInfo; score: number }) => r.item.id },
          { header: "MESSAGE", get: (r: { item: VersionInfo; score: number }) => r.item.message ?? "" },
          { header: "AUTHOR", get: (r: { item: VersionInfo; score: number }) => r.item.authorUser?.name ?? "" },
          { header: "SOURCE", get: (r: { item: VersionInfo; score: number }) => r.item.sourceApplication ?? "" },
          { header: "CREATED", get: (r: { item: VersionInfo; score: number }) => r.item.createdAt },
        ];
        if (args.query) {
          columns.push({
            header: "SCORE",
            get: (r: { item: VersionInfo; score: number }) => r.score.toFixed(3),
          });
        }
        emit(table(scored, columns), "text");
        emit(
          `\n${scored.length} of ${filtered.length} matched (${versions.length} scanned)`,
          "text",
        );
      }
    });
  },
});

export default defineCommand({
  meta: { name: "version", description: "Version commands" },
  subCommands: { ls, find },
});

export { ls, find };
