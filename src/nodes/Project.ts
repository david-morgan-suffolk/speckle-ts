import { Node } from "./Node.js";
import { Model } from "./Model.js";
import { Insight, listProjectInsights } from "./Insight.js";
import { subscribe } from "../transport/ws.js";
import { parseOrThrow } from "../transport/validate.js";
import {
  ProjectInfoSchema,
  ModelsTreeItemSchema,
  ModelsTreeItemPageSchema,
} from "../schemas.js";
import { z } from "zod";
import type { Speckle } from "../client.js";
import type {
  InsightInfo,
  ModelsTreeItem,
  PageInfo,
  ProjectInfo,
  ProjectModelsTreeFilterInput,
} from "../types.js";

const PROJECT_QUERY = /* GraphQL */ `
  query Project($id: String!) {
    project(id: $id) {
      id
      name
      description
      visibility
      role
      createdAt
      updatedAt
      workspaceId
    }
  }
`;

const PROJECT_UPDATED_SUB = /* GraphQL */ `
  subscription ProjectUpdated($id: String!) {
    projectUpdated(id: $id) {
      id
      type
      project {
        id
        name
        description
        updatedAt
      }
    }
  }
`;

const PROJECT_MODELS_UPDATED_SUB = /* GraphQL */ `
  subscription ProjectModelsUpdated($id: String!) {
    projectModelsUpdated(id: $id) {
      id
      type
      model {
        id
        name
        updatedAt
      }
    }
  }
`;

const PROJECT_VERSIONS_UPDATED_SUB = /* GraphQL */ `
  subscription ProjectVersionsUpdated($id: String!) {
    projectVersionsUpdated(id: $id) {
      id
      type
      version {
        id
        message
        createdAt
      }
    }
  }
`;

const MODELS_TREE_ITEM_FRAGMENT = /* GraphQL */ `
  fragment ModelsTreeItemFields on ModelsTreeItem {
    id
    name
    fullName
    hasChildren
    updatedAt
    model {
      id
      name
      description
      createdAt
      updatedAt
    }
    children {
      id
      name
      fullName
      hasChildren
      updatedAt
      model {
        id
        name
        description
        createdAt
        updatedAt
      }
      children {
        id
        name
        fullName
        hasChildren
        updatedAt
        model {
          id
          name
          description
          createdAt
          updatedAt
        }
      }
    }
  }
`;

const PROJECT_MODELS_TREE_QUERY = /* GraphQL */ `
  query GetProjectModelsTree(
    $projectId: String!
    $cursor: String
    $limit: Int
    $filter: ProjectModelsTreeFilter
  ) {
    project(id: $projectId) {
      modelsTree(cursor: $cursor, limit: $limit, filter: $filter) {
        totalCount
        cursor
        items {
          ...ModelsTreeItemFields
        }
      }
    }
  }
  ${MODELS_TREE_ITEM_FRAGMENT}
`;

const MODEL_CHILDREN_TREE_QUERY = /* GraphQL */ `
  query GetModelChildrenTree($projectId: String!, $fullName: String!) {
    project(id: $projectId) {
      modelChildrenTree(fullName: $fullName) {
        ...ModelsTreeItemFields
      }
    }
  }
  ${MODELS_TREE_ITEM_FRAGMENT}
`;

export interface ProjectModelsTreeOptions {
  cursor?: string | null;
  limit?: number;
  filter?: ProjectModelsTreeFilterInput;
}

export interface ListAllProjectModelsTreeOptions {
  pageSize?: number;
  filter?: ProjectModelsTreeFilterInput;
}

function treeVariables(
  projectId: string,
  opts?: ProjectModelsTreeOptions,
): Record<string, unknown> {
  const vars: Record<string, unknown> = { projectId };
  if (opts?.cursor !== undefined && opts.cursor !== null) vars["cursor"] = opts.cursor;
  if (opts?.limit !== undefined) vars["limit"] = opts.limit;
  if (opts?.filter !== undefined) vars["filter"] = opts.filter;
  return vars;
}

export async function listProjectModelsTree(
  speckle: Speckle,
  projectId: string,
  opts?: ProjectModelsTreeOptions,
): Promise<PageInfo<ModelsTreeItem>> {
  const data = await speckle.http.request<
    { project: { modelsTree: unknown } },
    Record<string, unknown>
  >(PROJECT_MODELS_TREE_QUERY, treeVariables(projectId, opts));
  return parseOrThrow(
    "ProjectModelsTree",
    ModelsTreeItemPageSchema,
    data.project.modelsTree,
  );
}

export async function listAllProjectModelsTree(
  speckle: Speckle,
  projectId: string,
  opts?: ListAllProjectModelsTreeOptions,
): Promise<ModelsTreeItem[]> {
  const items: ModelsTreeItem[] = [];
  let cursor: string | null | undefined = undefined;
  while (true) {
    const page = await listProjectModelsTree(speckle, projectId, {
      ...(cursor !== undefined ? { cursor } : {}),
      ...(opts?.pageSize !== undefined ? { limit: opts.pageSize } : {}),
      ...(opts?.filter !== undefined ? { filter: opts.filter } : {}),
    });
    items.push(...page.items);
    if (!page.cursor) break;
    cursor = page.cursor;
  }
  return items;
}

export async function getModelChildrenTree(
  speckle: Speckle,
  projectId: string,
  fullName: string,
): Promise<ModelsTreeItem[]> {
  const data = await speckle.http.request<
    { project: { modelChildrenTree: unknown } },
    { projectId: string; fullName: string }
  >(MODEL_CHILDREN_TREE_QUERY, { projectId, fullName });
  return parseOrThrow(
    "ModelChildrenTree",
    z.array(ModelsTreeItemSchema),
    data.project.modelChildrenTree,
  );
}

export class Project extends Node<ProjectInfo> {
  readonly id: string;

  constructor(speckle: Speckle, id: string) {
    super(speckle, null);
    this.id = id;
  }

  model(id: string): Model {
    return new Model(this.speckle, this, id);
  }

  insight(id: string): Insight {
    return new Insight(this.speckle, this, id);
  }

  listInsights(type?: string): Promise<InsightInfo[]> {
    return listProjectInsights(this.speckle, this.id, type);
  }

  listModelsTree(opts?: ProjectModelsTreeOptions): Promise<PageInfo<ModelsTreeItem>> {
    return listProjectModelsTree(this.speckle, this.id, opts);
  }

  listAllModelsTree(opts?: ListAllProjectModelsTreeOptions): Promise<ModelsTreeItem[]> {
    return listAllProjectModelsTree(this.speckle, this.id, opts);
  }

  modelChildrenTree(fullName: string): Promise<ModelsTreeItem[]> {
    return getModelChildrenTree(this.speckle, this.id, fullName);
  }

  protected async fetch(): Promise<ProjectInfo> {
    const data = await this.speckle.http.request<{ project: unknown }, { id: string }>(PROJECT_QUERY, {
      id: this.id,
    });
    return parseOrThrow("Project", ProjectInfoSchema, data.project);
  }

  onUpdate(onNext: (event: unknown) => void, onError?: (err: unknown) => void): () => void {
    return subscribe(this.speckle.ws, { query: PROJECT_UPDATED_SUB, variables: { id: this.id } }, onNext, onError);
  }

  onModelsUpdate(onNext: (event: unknown) => void, onError?: (err: unknown) => void): () => void {
    return subscribe(
      this.speckle.ws,
      { query: PROJECT_MODELS_UPDATED_SUB, variables: { id: this.id } },
      onNext,
      onError,
    );
  }

  onVersionsUpdate(onNext: (event: unknown) => void, onError?: (err: unknown) => void): () => void {
    return subscribe(
      this.speckle.ws,
      { query: PROJECT_VERSIONS_UPDATED_SUB, variables: { id: this.id } },
      onNext,
      onError,
    );
  }
}
