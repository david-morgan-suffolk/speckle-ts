import { Node } from "./Node.js";
import { assertExists, parseOrThrow } from "../transport/validate.js";
import { DashboardInfoSchema, DashboardsPageSchema } from "../schemas.js";
import {
  extractWidgets,
  parseDashboardState,
  serializeDashboardState,
  type DashboardWidget,
  type ExtractWidgetsOptions,
} from "../dashboards/state.js";
import type { Speckle } from "../client.js";
import type {
  DashboardInfo,
  DashboardListOptions,
  PageInfo,
  ProjectDashboardsFilter,
  UpdateDashboardInput,
  WorkspaceDashboardsFilter,
} from "../types.js";

const DASHBOARD_FIELDS = /* GraphQL */ `
  id
  name
  state
  createdAt
  updatedAt
  projects {
    id
    name
  }
  workspace {
    id
    name
    slug
  }
  createdBy {
    id
    name
  }
`;

const GET_DASHBOARD_QUERY = /* GraphQL */ `
  query GetDashboard($id: String!) {
    dashboard(id: $id) {
      ${DASHBOARD_FIELDS}
    }
  }
`;

const LIST_WORKSPACE_DASHBOARDS_QUERY = /* GraphQL */ `
  query ListWorkspaceDashboards(
    $workspaceId: String!
    $cursor: String
    $limit: Int! = 50
    $filter: WorkspaceDashboardsFilter
  ) {
    workspace(id: $workspaceId) {
      dashboards(cursor: $cursor, limit: $limit, filter: $filter) {
        totalCount
        cursor
        items { ${DASHBOARD_FIELDS} }
      }
    }
  }
`;

const LIST_PROJECT_DASHBOARDS_QUERY = /* GraphQL */ `
  query ListProjectDashboards(
    $projectId: String!
    $cursor: String
    $limit: Int! = 50
    $filter: ProjectDashboardsFilter
  ) {
    project(id: $projectId) {
      dashboards(cursor: $cursor, limit: $limit, filter: $filter) {
        totalCount
        cursor
        items { ${DASHBOARD_FIELDS} }
      }
    }
  }
`;

const CREATE_DASHBOARD_MUTATION = /* GraphQL */ `
  mutation CreateDashboard(
    $input: DashboardCreateInput!
    $workspace: WorkspaceIdentifier!
  ) {
    dashboardMutations {
      create(input: $input, workspace: $workspace) { ${DASHBOARD_FIELDS} }
    }
  }
`;

const UPDATE_DASHBOARD_MUTATION = /* GraphQL */ `
  mutation UpdateDashboard($input: DashboardUpdateInput!) {
    dashboardMutations {
      update(input: $input) { ${DASHBOARD_FIELDS} }
    }
  }
`;

const DELETE_DASHBOARD_MUTATION = /* GraphQL */ `
  mutation DeleteDashboard($id: String!) {
    dashboardMutations {
      delete(id: $id)
    }
  }
`;

const DUPLICATE_DASHBOARD_MUTATION = /* GraphQL */ `
  mutation DuplicateDashboard($id: String!, $name: String) {
    dashboardMutations {
      duplicate(id: $id, name: $name) { ${DASHBOARD_FIELDS} }
    }
  }
`;

export interface WorkspaceDashboardsListOptions extends DashboardListOptions {
  filter?: WorkspaceDashboardsFilter;
}

export interface ProjectDashboardsListOptions extends DashboardListOptions {
  filter?: ProjectDashboardsFilter;
}

export interface CreateDashboardInput {
  name: string;
  projectId?: string;
}

function workspaceListVars(
  workspaceId: string,
  opts?: WorkspaceDashboardsListOptions,
): Record<string, unknown> {
  const out: Record<string, unknown> = { workspaceId };
  if (opts?.cursor !== undefined && opts.cursor !== null) out["cursor"] = opts.cursor;
  if (opts?.limit !== undefined) out["limit"] = opts.limit;
  if (opts?.filter !== undefined) out["filter"] = opts.filter;
  return out;
}

function projectListVars(
  projectId: string,
  opts?: ProjectDashboardsListOptions,
): Record<string, unknown> {
  const out: Record<string, unknown> = { projectId };
  if (opts?.cursor !== undefined && opts.cursor !== null) out["cursor"] = opts.cursor;
  if (opts?.limit !== undefined) out["limit"] = opts.limit;
  if (opts?.filter !== undefined) out["filter"] = opts.filter;
  return out;
}

export async function getDashboard(
  speckle: Speckle,
  id: string,
): Promise<DashboardInfo> {
  const data = await speckle.http.request<
    { dashboard: unknown | null },
    { id: string }
  >(GET_DASHBOARD_QUERY, { id });
  const dashboard = assertExists(data.dashboard, "Dashboard", id);
  return parseOrThrow("Dashboard", DashboardInfoSchema, dashboard);
}

export async function listWorkspaceDashboards(
  speckle: Speckle,
  workspaceId: string,
  opts?: WorkspaceDashboardsListOptions,
): Promise<PageInfo<DashboardInfo>> {
  const data = await speckle.http.request<
    { workspace: { dashboards: unknown } | null },
    Record<string, unknown>
  >(LIST_WORKSPACE_DASHBOARDS_QUERY, workspaceListVars(workspaceId, opts));
  const ws = assertExists(data.workspace, "Workspace", workspaceId);
  return parseOrThrow("WorkspaceDashboards", DashboardsPageSchema, ws.dashboards);
}

export async function* iterateWorkspaceDashboards(
  speckle: Speckle,
  workspaceId: string,
  opts?: Omit<WorkspaceDashboardsListOptions, "cursor">,
): AsyncIterable<DashboardInfo> {
  let cursor: string | null | undefined = undefined;
  while (true) {
    const page = await listWorkspaceDashboards(speckle, workspaceId, {
      ...(opts ?? {}),
      ...(cursor !== undefined && cursor !== null ? { cursor } : {}),
    });
    for (const item of page.items) yield item;
    if (!page.cursor) break;
    cursor = page.cursor;
  }
}

export async function listAllWorkspaceDashboards(
  speckle: Speckle,
  workspaceId: string,
  opts?: Omit<WorkspaceDashboardsListOptions, "cursor">,
): Promise<DashboardInfo[]> {
  const out: DashboardInfo[] = [];
  for await (const d of iterateWorkspaceDashboards(speckle, workspaceId, opts)) {
    out.push(d);
  }
  return out;
}

export async function listProjectDashboards(
  speckle: Speckle,
  projectId: string,
  opts?: ProjectDashboardsListOptions,
): Promise<PageInfo<DashboardInfo>> {
  const data = await speckle.http.request<
    { project: { dashboards: unknown } | null },
    Record<string, unknown>
  >(LIST_PROJECT_DASHBOARDS_QUERY, projectListVars(projectId, opts));
  const project = assertExists(data.project, "Project", projectId);
  return parseOrThrow("ProjectDashboards", DashboardsPageSchema, project.dashboards);
}

export async function* iterateProjectDashboards(
  speckle: Speckle,
  projectId: string,
  opts?: Omit<ProjectDashboardsListOptions, "cursor">,
): AsyncIterable<DashboardInfo> {
  let cursor: string | null | undefined = undefined;
  while (true) {
    const page = await listProjectDashboards(speckle, projectId, {
      ...(opts ?? {}),
      ...(cursor !== undefined && cursor !== null ? { cursor } : {}),
    });
    for (const item of page.items) yield item;
    if (!page.cursor) break;
    cursor = page.cursor;
  }
}

export async function listAllProjectDashboards(
  speckle: Speckle,
  projectId: string,
  opts?: Omit<ProjectDashboardsListOptions, "cursor">,
): Promise<DashboardInfo[]> {
  const out: DashboardInfo[] = [];
  for await (const d of iterateProjectDashboards(speckle, projectId, opts)) {
    out.push(d);
  }
  return out;
}

export async function createDashboard(
  speckle: Speckle,
  workspace: { id?: string; slug?: string },
  input: CreateDashboardInput,
): Promise<DashboardInfo> {
  const data = await speckle.http.request<
    { dashboardMutations: { create: unknown } },
    { input: CreateDashboardInput; workspace: { id?: string; slug?: string } }
  >(CREATE_DASHBOARD_MUTATION, { input, workspace });
  return parseOrThrow(
    "CreateDashboard",
    DashboardInfoSchema,
    data.dashboardMutations.create,
  );
}

export async function updateDashboard(
  speckle: Speckle,
  id: string,
  patch: UpdateDashboardInput,
): Promise<DashboardInfo> {
  const input: Record<string, unknown> = { id };
  if (patch.name !== undefined) input["name"] = patch.name;
  if (patch.state !== undefined) input["state"] = patch.state;
  if (patch.projectLinks !== undefined) {
    input["dashboardProjectLinks"] = patch.projectLinks.map((link) => ({
      projectId: link.projectId,
      ...(link.automationId !== undefined ? { automationId: link.automationId } : {}),
    }));
  }
  const data = await speckle.http.request<
    { dashboardMutations: { update: unknown } },
    { input: Record<string, unknown> }
  >(UPDATE_DASHBOARD_MUTATION, { input });
  return parseOrThrow(
    "UpdateDashboard",
    DashboardInfoSchema,
    data.dashboardMutations.update,
  );
}

export async function deleteDashboard(speckle: Speckle, id: string): Promise<boolean> {
  const data = await speckle.http.request<
    { dashboardMutations: { delete: boolean } },
    { id: string }
  >(DELETE_DASHBOARD_MUTATION, { id });
  return data.dashboardMutations.delete;
}

export async function duplicateDashboard(
  speckle: Speckle,
  id: string,
  name?: string,
): Promise<DashboardInfo> {
  const data = await speckle.http.request<
    { dashboardMutations: { duplicate: unknown } },
    { id: string; name?: string | null }
  >(DUPLICATE_DASHBOARD_MUTATION, { id, name: name ?? null });
  return parseOrThrow(
    "DuplicateDashboard",
    DashboardInfoSchema,
    data.dashboardMutations.duplicate,
  );
}

export class Dashboard extends Node<DashboardInfo> {
  readonly id: string;

  constructor(speckle: Speckle, id: string) {
    super(speckle, null);
    this.id = id;
  }

  protected fetch(): Promise<DashboardInfo> {
    return getDashboard(this.speckle, this.id);
  }

  update(patch: UpdateDashboardInput): Promise<DashboardInfo> {
    return updateDashboard(this.speckle, this.id, patch);
  }

  delete(): Promise<boolean> {
    return deleteDashboard(this.speckle, this.id);
  }

  async duplicate(name?: string): Promise<Dashboard> {
    const created = await duplicateDashboard(this.speckle, this.id, name);
    return new Dashboard(this.speckle, created.id);
  }

  async parseState(): Promise<unknown> {
    const info = await this.get;
    return parseDashboardState(info.state);
  }

  async extractWidgets(opts?: ExtractWidgetsOptions): Promise<DashboardWidget[]> {
    const state = await this.parseState();
    return extractWidgets(state, opts);
  }

  updateState(state: unknown): Promise<DashboardInfo> {
    return this.update({ state: serializeDashboardState(state) });
  }
}
