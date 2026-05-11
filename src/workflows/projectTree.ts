import type { Speckle } from "../client.js";
import {
  listAllProjectModelsTree,
  getModelChildrenTree,
} from "../nodes/Project.js";
import { listAllModelVersions, listModelVersions } from "../nodes/Model.js";
import { createModelVersionsLoader } from "../loaders.js";
import type {
  ModelsTreeItem,
  ProjectModelsTreeFilterInput,
  VersionInfo,
} from "../types.js";

export interface ProjectModelVersionsTreeNode extends Omit<ModelsTreeItem, "children"> {
  versions: VersionInfo[];
  children: ProjectModelVersionsTreeNode[];
}

export interface ExtractProjectTreeOptions {
  concurrency?: number;
  versionsLimit?: number;
  expandFullTree?: boolean;
  treeFilter?: ProjectModelsTreeFilterInput;
  /**
   * When versionsLimit is set, batch all per-model version fetches into a
   * single aliased GraphQL query. Default true. Disable to revert to the
   * fan-out path for debugging or to dodge query-complexity caps.
   */
  batchVersions?: boolean;
  /** Max aliases per batched request when batchVersions is on. Default 25. */
  batchSize?: number;
}

const DEFAULT_CONCURRENCY = 8;

async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number,
): Promise<T[]> {
  const limit = Math.max(1, concurrency);
  const results: T[] = new Array(tasks.length);
  let next = 0;
  const workers: Array<Promise<void>> = [];
  for (let w = 0; w < Math.min(limit, tasks.length); w++) {
    workers.push(
      (async () => {
        while (true) {
          const i = next++;
          if (i >= tasks.length) return;
          results[i] = await tasks[i]!();
        }
      })(),
    );
  }
  await Promise.all(workers);
  return results;
}

interface FetchVersionsOptions {
  versionsLimit?: number;
  concurrency: number;
  batchVersions: boolean;
  batchSize?: number;
}

async function fetchVersionsForModels(
  speckle: Speckle,
  projectId: string,
  modelIds: string[],
  opts: FetchVersionsOptions,
): Promise<ReadonlyArray<readonly [string, VersionInfo[]]>> {
  if (opts.versionsLimit !== undefined && opts.batchVersions) {
    const loader = createModelVersionsLoader(speckle, {
      ...(opts.batchSize !== undefined ? { maxBatchSize: opts.batchSize } : {}),
    });
    const tasks = modelIds.map(
      (modelId) => async () => {
        const page = await loader.load(projectId, modelId, {
          limit: opts.versionsLimit!,
        });
        return [modelId, page.items.slice()] as const;
      },
    );
    return runWithConcurrency(tasks, modelIds.length);
  }

  const tasks = modelIds.map(
    (modelId) => async () => {
      if (opts.versionsLimit !== undefined) {
        const page = await listModelVersions(speckle, projectId, modelId, {
          limit: opts.versionsLimit,
        });
        return [modelId, page.items.slice()] as const;
      }
      const versions = await listAllModelVersions(speckle, projectId, modelId);
      return [modelId, versions] as const;
    },
  );
  return runWithConcurrency(tasks, opts.concurrency);
}

export async function expandHiddenChildren(
  speckle: Speckle,
  projectId: string,
  item: ModelsTreeItem,
): Promise<ModelsTreeItem> {
  if (!item.hasChildren || item.children.length > 0) {
    const expandedChildren = await Promise.all(
      item.children.map((c) => expandHiddenChildren(speckle, projectId, c)),
    );
    return { ...item, children: expandedChildren };
  }
  const fetched = await getModelChildrenTree(speckle, projectId, item.fullName);
  const expandedChildren = await Promise.all(
    fetched.map((c) => expandHiddenChildren(speckle, projectId, c)),
  );
  return { ...item, children: expandedChildren };
}

function collectModelIds(items: ReadonlyArray<ModelsTreeItem>, out: string[]): void {
  for (const item of items) {
    if (item.model) out.push(item.model.id);
    collectModelIds(item.children, out);
  }
}

function attachVersions(
  items: ReadonlyArray<ModelsTreeItem>,
  versionsByModelId: Map<string, VersionInfo[]>,
): ProjectModelVersionsTreeNode[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    fullName: item.fullName,
    hasChildren: item.hasChildren,
    updatedAt: item.updatedAt,
    model: item.model,
    versions: item.model ? (versionsByModelId.get(item.model.id) ?? []) : [],
    children: attachVersions(item.children, versionsByModelId),
  }));
}

export async function extractProjectModelVersionsTree(
  speckle: Speckle,
  projectId: string,
  opts?: ExtractProjectTreeOptions,
): Promise<ProjectModelVersionsTreeNode[]> {
  const concurrency = opts?.concurrency ?? DEFAULT_CONCURRENCY;
  const expand = opts?.expandFullTree ?? false;

  let items = await listAllProjectModelsTree(speckle, projectId, {
    ...(opts?.treeFilter !== undefined ? { filter: opts.treeFilter } : {}),
  });

  if (expand) {
    items = await Promise.all(
      items.map((item) => expandHiddenChildren(speckle, projectId, item)),
    );
  }

  const modelIds: string[] = [];
  collectModelIds(items, modelIds);

  const fetched = await fetchVersionsForModels(
    speckle,
    projectId,
    modelIds,
    {
      ...(opts?.versionsLimit !== undefined ? { versionsLimit: opts.versionsLimit } : {}),
      concurrency,
      batchVersions: opts?.batchVersions ?? true,
      ...(opts?.batchSize !== undefined ? { batchSize: opts.batchSize } : {}),
    },
  );
  const versionsByModelId = new Map<string, VersionInfo[]>();
  for (const [modelId, versions] of fetched) {
    versionsByModelId.set(modelId, [...versions]);
  }

  return attachVersions(items, versionsByModelId);
}
