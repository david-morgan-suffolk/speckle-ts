import { parseOrThrow } from "./transport/validate.js";
import { ModelVersionsPageSchema } from "./schemas.js";
import type { Speckle } from "./client.js";
import type { PageInfo, VersionInfo } from "./types.js";

export interface ModelVersionsLoadOptions {
  cursor?: string | null;
  limit?: number;
}

export interface ModelVersionsLoaderOptions {
  /**
   * Microtask deferral window. 0 (default) flushes after the current
   * synchronous tick via queueMicrotask — same-tick parallel awaits get
   * coalesced. Use a small ms value to widen the batching window across
   * back-to-back async hops.
   */
  windowMs?: number;
  /** Max aliased entries per outbound query. Defaults to 25. */
  maxBatchSize?: number;
}

interface PendingEntry {
  projectId: string;
  modelId: string;
  cursor: string | null;
  limit: number | null;
  resolve: (result: PageInfo<VersionInfo>) => void;
  reject: (err: unknown) => void;
}

const VERSION_FIELDS = /* GraphQL */ `
  id
  message
  sourceApplication
  referencedObject
  createdAt
  authorUser { id name }
`;

function buildSingleProjectQuery(projectId: string, batch: PendingEntry[]): {
  query: string;
  variables: Record<string, unknown>;
} {
  const varDecls = ["$projectId: String!"];
  const variables: Record<string, unknown> = { projectId };
  const modelSelections: string[] = [];

  for (let i = 0; i < batch.length; i++) {
    const e = batch[i]!;
    const modelVar = `modelId_${i}`;
    const cursorVar = `cursor_${i}`;
    const limitVar = `limit_${i}`;
    varDecls.push(`$${modelVar}: String!`, `$${cursorVar}: String`, `$${limitVar}: Int`);
    variables[modelVar] = e.modelId;
    variables[cursorVar] = e.cursor;
    variables[limitVar] = e.limit;
    modelSelections.push(
      `m_${i}: model(id: $${modelVar}) { versions(cursor: $${cursorVar}, limit: $${limitVar}) { totalCount cursor items { ${VERSION_FIELDS} } } }`,
    );
  }

  const query = `query BatchedModelVersions(${varDecls.join(", ")}) {
  project(id: $projectId) {
    ${modelSelections.join("\n    ")}
  }
}`;

  return { query, variables };
}

function buildMultiProjectQuery(batch: PendingEntry[]): {
  query: string;
  variables: Record<string, unknown>;
} {
  const varDecls: string[] = [];
  const variables: Record<string, unknown> = {};
  const projectSelections: string[] = [];

  for (let i = 0; i < batch.length; i++) {
    const e = batch[i]!;
    const projectVar = `projectId_${i}`;
    const modelVar = `modelId_${i}`;
    const cursorVar = `cursor_${i}`;
    const limitVar = `limit_${i}`;
    varDecls.push(
      `$${projectVar}: String!`,
      `$${modelVar}: String!`,
      `$${cursorVar}: String`,
      `$${limitVar}: Int`,
    );
    variables[projectVar] = e.projectId;
    variables[modelVar] = e.modelId;
    variables[cursorVar] = e.cursor;
    variables[limitVar] = e.limit;
    projectSelections.push(
      `p_${i}: project(id: $${projectVar}) { model(id: $${modelVar}) { versions(cursor: $${cursorVar}, limit: $${limitVar}) { totalCount cursor items { ${VERSION_FIELDS} } } } }`,
    );
  }

  const query = `query BatchedModelVersions(${varDecls.join(", ")}) {
  ${projectSelections.join("\n  ")}
}`;

  return { query, variables };
}

export class ModelVersionsLoader {
  private pending: PendingEntry[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private microtaskScheduled = false;
  private readonly windowMs: number;
  private readonly maxBatchSize: number;

  constructor(
    private readonly speckle: Speckle,
    opts: ModelVersionsLoaderOptions = {},
  ) {
    this.windowMs = opts.windowMs ?? 0;
    this.maxBatchSize = Math.max(1, opts.maxBatchSize ?? 25);
  }

  load(
    projectId: string,
    modelId: string,
    opts?: ModelVersionsLoadOptions,
  ): Promise<PageInfo<VersionInfo>> {
    return new Promise((resolve, reject) => {
      this.pending.push({
        projectId,
        modelId,
        cursor: opts?.cursor ?? null,
        limit: opts?.limit ?? null,
        resolve,
        reject,
      });
      if (this.pending.length >= this.maxBatchSize) {
        this.cancelTimers();
        this.flush();
        return;
      }
      this.schedule();
    });
  }

  private schedule(): void {
    if (this.windowMs > 0) {
      if (this.timer === null) {
        this.timer = setTimeout(() => {
          this.timer = null;
          this.flush();
        }, this.windowMs);
      }
      return;
    }
    if (!this.microtaskScheduled) {
      this.microtaskScheduled = true;
      queueMicrotask(() => {
        this.microtaskScheduled = false;
        this.flush();
      });
    }
  }

  private cancelTimers(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private async flush(): Promise<void> {
    if (this.pending.length === 0) return;

    const batch = this.pending.splice(0, this.maxBatchSize);
    if (this.pending.length > 0) this.schedule();

    const projectIds = new Set(batch.map((e) => e.projectId));
    const single = projectIds.size === 1;
    const { query, variables } = single
      ? buildSingleProjectQuery(batch[0]!.projectId, batch)
      : buildMultiProjectQuery(batch);

    let data: Record<string, unknown>;
    try {
      data = await this.speckle.http.request<Record<string, unknown>, Record<string, unknown>>(
        query,
        variables,
      );
    } catch (err) {
      for (const e of batch) e.reject(err);
      return;
    }

    if (single) {
      const project = (data as { project?: Record<string, unknown> }).project;
      if (!project) {
        for (const e of batch) {
          e.reject(new Error(`BatchedModelVersions: project not found: ${batch[0]!.projectId}`));
        }
        return;
      }
      for (let i = 0; i < batch.length; i++) {
        const slice = (project as Record<string, unknown>)[`m_${i}`] as
          | { versions: unknown }
          | null
          | undefined;
        const entry = batch[i]!;
        if (!slice || slice.versions === undefined || slice.versions === null) {
          entry.reject(
            new Error(`BatchedModelVersions: model not found: ${entry.modelId}`),
          );
          continue;
        }
        try {
          entry.resolve(parseOrThrow("ModelVersions", ModelVersionsPageSchema, slice.versions));
        } catch (err) {
          entry.reject(err);
        }
      }
      return;
    }

    for (let i = 0; i < batch.length; i++) {
      const entry = batch[i]!;
      const slot = (data as Record<string, unknown>)[`p_${i}`] as
        | { model?: { versions: unknown } | null }
        | null
        | undefined;
      if (!slot || !slot.model || slot.model.versions === undefined || slot.model.versions === null) {
        entry.reject(
          new Error(
            `BatchedModelVersions: project/model not found: ${entry.projectId}/${entry.modelId}`,
          ),
        );
        continue;
      }
      try {
        entry.resolve(
          parseOrThrow("ModelVersions", ModelVersionsPageSchema, slot.model.versions),
        );
      } catch (err) {
        entry.reject(err);
      }
    }
  }
}

export function createModelVersionsLoader(
  speckle: Speckle,
  opts?: ModelVersionsLoaderOptions,
): ModelVersionsLoader {
  return new ModelVersionsLoader(speckle, opts);
}
