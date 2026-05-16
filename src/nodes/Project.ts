import { Node } from "./Node.js";
import { Model } from "./Model.js";
import { Insight, listProjectInsights } from "./Insight.js";
import {
  Dashboard,
  iterateProjectDashboards,
  listAllProjectDashboards,
  listProjectDashboards,
  type ProjectDashboardsListOptions,
} from "./Dashboard.js";
import {
  Webhook,
  createWebhook,
  listWebhooks,
} from "./Webhook.js";
import {
  Issue,
  createIssue,
  iterateProjectIssues,
  listAllProjectIssues,
  listProjectIssues,
} from "./Issue.js";
import { deleteVersions } from "./Version.js";
import { listPendingFileImports } from "./FileImport.js";
import {
  receiveSpeckleObject,
  type ReceiveSpeckleObjectOptions,
  type ReceiveSpeckleObjectResult,
} from "../objects.js";
import {
  Automation,
  createAutomation,
  iterateProjectAutomations,
  listAllProjectAutomations,
  listProjectAutomations,
} from "./Automation.js";
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
  AutomationInfo,
  AutomationListOptions,
  CreateAutomationInput,
  CreateIssueInput,
  CreateWebhookInput,
  DashboardInfo,
  FileImportJob,
  InsightInfo,
  IssueInfo,
  IssuesFilter,
  ModelsTreeItem,
  PageInfo,
  ProjectInfo,
  ProjectModelsTreeFilterInput,
  WebhookInfo,
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

const PROJECT_AUTOMATIONS_UPDATED_SUB = /* GraphQL */ `
  subscription ProjectAutomationsUpdated($projectId: String!) {
    projectAutomationsUpdated(projectId: $projectId) {
      type
      automationId
      automation {
        id
        name
        enabled
      }
    }
  }
`;

const PROJECT_TRIGGERED_AUTOMATIONS_STATUS_SUB = /* GraphQL */ `
  subscription ProjectTriggeredAutomationsStatusUpdated($projectId: String!) {
    projectTriggeredAutomationsStatusUpdated(projectId: $projectId) {
      type
      version { id }
      model { id }
      project { id }
    }
  }
`;

const PROJECT_ISSUES_UPDATED_SUB = /* GraphQL */ `
  subscription ProjectIssuesUpdated($target: ViewerUpdateTrackingTarget!) {
    projectIssuesUpdated(target: $target) {
      id
      type
      issue {
        id
        identifier
        title
        status
        priority
        updatedAt
      }
      reply {
        id
        issueId
        rawDescription
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

export type ProjectObjectLoadOptions = Omit<
  ReceiveSpeckleObjectOptions,
  "projectId" | "objectId" | "refId" | "versionId" | "modelId"
>;

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

export async function* iterateProjectModelsTree(
  speckle: Speckle,
  projectId: string,
  opts?: ListAllProjectModelsTreeOptions,
): AsyncIterable<ModelsTreeItem> {
  let cursor: string | null | undefined = undefined;
  while (true) {
    const page = await listProjectModelsTree(speckle, projectId, {
      ...(cursor !== undefined ? { cursor } : {}),
      ...(opts?.pageSize !== undefined ? { limit: opts.pageSize } : {}),
      ...(opts?.filter !== undefined ? { filter: opts.filter } : {}),
    });
    for (const item of page.items) yield item;
    if (!page.cursor) break;
    cursor = page.cursor;
  }
}

export async function listAllProjectModelsTree(
  speckle: Speckle,
  projectId: string,
  opts?: ListAllProjectModelsTreeOptions,
): Promise<ModelsTreeItem[]> {
  const items: ModelsTreeItem[] = [];
  for await (const item of iterateProjectModelsTree(speckle, projectId, opts)) {
    items.push(item);
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

  loadObject(
    objectId: string,
    opts?: ProjectObjectLoadOptions,
  ): Promise<ReceiveSpeckleObjectResult> {
    return receiveSpeckleObject(this.speckle, {
      ...opts,
      projectId: this.id,
      objectId,
    });
  }

  loadVersionObject(
    versionId: string,
    opts?: ProjectObjectLoadOptions,
  ): Promise<ReceiveSpeckleObjectResult> {
    return receiveSpeckleObject(this.speckle, {
      ...opts,
      projectId: this.id,
      versionId,
    });
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

  modelsTree(opts?: ListAllProjectModelsTreeOptions): AsyncIterable<ModelsTreeItem> {
    return iterateProjectModelsTree(this.speckle, this.id, opts);
  }

  modelChildrenTree(fullName: string): Promise<ModelsTreeItem[]> {
    return getModelChildrenTree(this.speckle, this.id, fullName);
  }

  webhooks(): Promise<WebhookInfo[]> {
    return listWebhooks(this.speckle, this.id);
  }

  webhook(id: string): Webhook {
    return new Webhook(this.speckle, this, id);
  }

  async createWebhook(input: CreateWebhookInput): Promise<Webhook> {
    const id = await createWebhook(this.speckle, this.id, input);
    return new Webhook(this.speckle, this, id);
  }

  issue(id: string): Issue {
    return new Issue(this.speckle, this, id);
  }

  listIssues(filter?: IssuesFilter): Promise<PageInfo<IssueInfo>> {
    return listProjectIssues(this.speckle, this.id, filter);
  }

  listAllIssues(filter?: Omit<IssuesFilter, "cursor">): Promise<IssueInfo[]> {
    return listAllProjectIssues(this.speckle, this.id, filter);
  }

  issues(filter?: Omit<IssuesFilter, "cursor">): AsyncIterable<IssueInfo> {
    return iterateProjectIssues(this.speckle, this.id, filter);
  }

  async createIssue(input: CreateIssueInput): Promise<Issue> {
    const created = await createIssue(this.speckle, this.id, input);
    return new Issue(this.speckle, this, created.id);
  }

  deleteVersions(versionIds: ReadonlyArray<string>): Promise<boolean> {
    return deleteVersions(this.speckle, this.id, versionIds);
  }

  pendingFileImports(): Promise<FileImportJob[]> {
    return listPendingFileImports(this.speckle, this.id);
  }

  automation(id: string): Automation {
    return new Automation(this.speckle, this, id);
  }

  listAutomations(opts?: AutomationListOptions): Promise<PageInfo<AutomationInfo>> {
    return listProjectAutomations(this.speckle, this.id, opts);
  }

  listAllAutomations(
    opts?: Omit<AutomationListOptions, "cursor">,
  ): Promise<AutomationInfo[]> {
    return listAllProjectAutomations(this.speckle, this.id, opts);
  }

  automations(
    opts?: Omit<AutomationListOptions, "cursor">,
  ): AsyncIterable<AutomationInfo> {
    return iterateProjectAutomations(this.speckle, this.id, opts);
  }

  async createAutomation(input: CreateAutomationInput): Promise<Automation> {
    const created = await createAutomation(this.speckle, this.id, input);
    return new Automation(this.speckle, this, created.id);
  }

  dashboard(id: string): Dashboard {
    return new Dashboard(this.speckle, id);
  }

  listDashboards(
    opts?: ProjectDashboardsListOptions,
  ): Promise<PageInfo<DashboardInfo>> {
    return listProjectDashboards(this.speckle, this.id, opts);
  }

  listAllDashboards(
    opts?: Omit<ProjectDashboardsListOptions, "cursor">,
  ): Promise<DashboardInfo[]> {
    return listAllProjectDashboards(this.speckle, this.id, opts);
  }

  dashboards(
    opts?: Omit<ProjectDashboardsListOptions, "cursor">,
  ): AsyncIterable<DashboardInfo> {
    return iterateProjectDashboards(this.speckle, this.id, opts);
  }

  onAutomationsUpdate(
    onNext: (event: unknown) => void,
    onError?: (err: unknown) => void,
  ): () => void {
    return subscribe(
      this.speckle.ws,
      { query: PROJECT_AUTOMATIONS_UPDATED_SUB, variables: { projectId: this.id } },
      onNext,
      onError,
      this.speckle.hooks,
    );
  }

  onTriggeredAutomationsStatusUpdate(
    onNext: (event: unknown) => void,
    onError?: (err: unknown) => void,
  ): () => void {
    return subscribe(
      this.speckle.ws,
      {
        query: PROJECT_TRIGGERED_AUTOMATIONS_STATUS_SUB,
        variables: { projectId: this.id },
      },
      onNext,
      onError,
      this.speckle.hooks,
    );
  }

  onIssuesUpdate(
    target: { resourceIdString?: string; loadedVersionsOnly?: boolean },
    onNext: (event: unknown) => void,
    onError?: (err: unknown) => void,
  ): () => void {
    const variables = {
      target: {
        projectId: this.id,
        ...(target.resourceIdString !== undefined
          ? { resourceIdString: target.resourceIdString }
          : {}),
        ...(target.loadedVersionsOnly !== undefined
          ? { loadedVersionsOnly: target.loadedVersionsOnly }
          : {}),
      },
    };
    return subscribe(
      this.speckle.ws,
      { query: PROJECT_ISSUES_UPDATED_SUB, variables },
      onNext,
      onError,
      this.speckle.hooks,
    );
  }

  protected async fetch(): Promise<ProjectInfo> {
    const data = await this.speckle.http.request<{ project: unknown }, { id: string }>(PROJECT_QUERY, {
      id: this.id,
    });
    return parseOrThrow("Project", ProjectInfoSchema, data.project);
  }

  onUpdate(onNext: (event: unknown) => void, onError?: (err: unknown) => void): () => void {
    return subscribe(
      this.speckle.ws,
      { query: PROJECT_UPDATED_SUB, variables: { id: this.id } },
      onNext,
      onError,
      this.speckle.hooks,
    );
  }

  onModelsUpdate(onNext: (event: unknown) => void, onError?: (err: unknown) => void): () => void {
    return subscribe(
      this.speckle.ws,
      { query: PROJECT_MODELS_UPDATED_SUB, variables: { id: this.id } },
      onNext,
      onError,
      this.speckle.hooks,
    );
  }

  onVersionsUpdate(onNext: (event: unknown) => void, onError?: (err: unknown) => void): () => void {
    return subscribe(
      this.speckle.ws,
      { query: PROJECT_VERSIONS_UPDATED_SUB, variables: { id: this.id } },
      onNext,
      onError,
      this.speckle.hooks,
    );
  }
}
