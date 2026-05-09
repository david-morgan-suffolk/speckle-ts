import { Node } from "./Node.js";
import { Version } from "./Version.js";
import { parseOrThrow } from "../transport/validate.js";
import { ModelInfoSchema, ModelVersionsPageSchema } from "../schemas.js";
import type { Project } from "./Project.js";
import type { Speckle } from "../client.js";
import type { ModelInfo, PageInfo, VersionInfo } from "../types.js";

const MODEL_QUERY = /* GraphQL */ `
  query Model($projectId: String!, $modelId: String!) {
    project(id: $projectId) {
      model(id: $modelId) {
        id
        name
        description
        createdAt
        updatedAt
      }
    }
  }
`;

const MODEL_VERSIONS_QUERY = /* GraphQL */ `
  query GetModelVersions($projectId: String!, $modelId: String!, $cursor: String, $limit: Int) {
    project(id: $projectId) {
      model(id: $modelId) {
        versions(cursor: $cursor, limit: $limit) {
          totalCount
          cursor
          items {
            id
            message
            sourceApplication
            referencedObject
            createdAt
            authorUser {
              id
              name
            }
          }
        }
      }
    }
  }
`;

export interface ModelVersionsOptions {
  cursor?: string | null;
  limit?: number;
}

export interface ListAllModelVersionsOptions {
  pageSize?: number;
}

function versionsVariables(
  projectId: string,
  modelId: string,
  opts?: ModelVersionsOptions,
): Record<string, unknown> {
  const vars: Record<string, unknown> = { projectId, modelId };
  if (opts?.cursor !== undefined && opts.cursor !== null) vars["cursor"] = opts.cursor;
  if (opts?.limit !== undefined) vars["limit"] = opts.limit;
  return vars;
}

export async function listModelVersions(
  speckle: Speckle,
  projectId: string,
  modelId: string,
  opts?: ModelVersionsOptions,
): Promise<PageInfo<VersionInfo>> {
  const data = await speckle.http.request<
    { project: { model: { versions: unknown } } },
    Record<string, unknown>
  >(MODEL_VERSIONS_QUERY, versionsVariables(projectId, modelId, opts));
  return parseOrThrow(
    "ModelVersions",
    ModelVersionsPageSchema,
    data.project.model.versions,
  );
}

export async function listAllModelVersions(
  speckle: Speckle,
  projectId: string,
  modelId: string,
  opts?: ListAllModelVersionsOptions,
): Promise<VersionInfo[]> {
  const items: VersionInfo[] = [];
  let cursor: string | null | undefined = undefined;
  while (true) {
    const page = await listModelVersions(speckle, projectId, modelId, {
      ...(cursor !== undefined ? { cursor } : {}),
      ...(opts?.pageSize !== undefined ? { limit: opts.pageSize } : {}),
    });
    items.push(...page.items);
    if (!page.cursor) break;
    cursor = page.cursor;
  }
  return items;
}

export class Model extends Node<ModelInfo> {
  readonly id: string;
  readonly project: Project;

  constructor(speckle: Speckle, project: Project, id: string) {
    super(speckle, project);
    this.project = project;
    this.id = id;
  }

  version(id: string): Version {
    return new Version(this.speckle, this, id);
  }

  listVersions(opts?: ModelVersionsOptions): Promise<PageInfo<VersionInfo>> {
    return listModelVersions(this.speckle, this.project.id, this.id, opts);
  }

  listAllVersions(opts?: ListAllModelVersionsOptions): Promise<VersionInfo[]> {
    return listAllModelVersions(this.speckle, this.project.id, this.id, opts);
  }

  protected async fetch(): Promise<ModelInfo> {
    const data = await this.speckle.http.request<
      { project: { model: unknown } },
      { projectId: string; modelId: string }
    >(MODEL_QUERY, { projectId: this.project.id, modelId: this.id });
    return parseOrThrow("Model", ModelInfoSchema, data.project.model);
  }
}
