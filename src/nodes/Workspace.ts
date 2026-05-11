import { Node } from "./Node.js";
import { InsightTemplate, listWorkspaceInsightTemplates } from "./InsightTemplate.js";
import {
  Dashboard,
  createDashboard,
  iterateWorkspaceDashboards,
  listAllWorkspaceDashboards,
  listWorkspaceDashboards,
  type CreateDashboardInput,
  type WorkspaceDashboardsListOptions,
} from "./Dashboard.js";
import { assertExists, parseOrThrow } from "../transport/validate.js";
import {
  WorkspaceInfoSchema,
  WorkspaceLimitsSchema,
  WorkspacePlanInfoSchema,
  WorkspacePlanUsageSchema,
  WorkspaceSubscriptionInfoSchema,
  WorkspaceSubscriptionSeatsSchema,
} from "../schemas.js";
import type { Speckle } from "../client.js";
import type {
  DashboardInfo,
  InsightTemplateInfo,
  PageInfo,
  WorkspaceInfo,
  WorkspaceLimits,
  WorkspacePlanInfo,
  WorkspacePlanUsage,
  WorkspaceSubscriptionInfo,
  WorkspaceSubscriptionSeats,
} from "../types.js";

const LIMITS_FIELDS = /* GraphQL */ `
  commentsHistoryInDays
  dashboardCount
  modelCount
  projectCount
  userCount
  versionCount
  versionsHistoryInDays
`;

const USAGE_FIELDS = /* GraphQL */ `
  dashboardCount
  projectCount
  sync {
    versionSyncsMonthly
    versionSyncsTotal
    versionsLoadedMonthly
    versionsLoadedTotal
    versionsPublishedMonthly
    versionsPublishedTotal
  }
  users {
    pendingUserCount
    userCount
  }
  versions {
    pendingVersionCount
    versionCount
  }
`;

const SEATS_FIELDS = /* GraphQL */ `
  editors {
    assigned
    available
  }
  viewers {
    assigned
    available
  }
`;

const PLAN_FIELDS = /* GraphQL */ `
  createdAt
  features
  limitOverrides
  limits {
    ${LIMITS_FIELDS}
  }
  name
  paymentMethod
  status
  usage {
    ${USAGE_FIELDS}
  }
  validUntil
`;

const SUBSCRIPTION_FIELDS = /* GraphQL */ `
  addOn {
    currentQuantity
  }
  billingInterval
  createdAt
  currency
  currentBillingCycleEnd
  seats {
    ${SEATS_FIELDS}
  }
  updatedAt
`;

const WORKSPACE_QUERY = /* GraphQL */ `
  query Workspace($id: String!) {
    workspace(id: $id) {
      id
      name
      slug
      description
      createdAt
      readOnly
    }
  }
`;

const WORKSPACE_PLAN_QUERY = /* GraphQL */ `
  query GetWorkspacePlan($id: String!) {
    workspace(id: $id) {
      plan {
        ${PLAN_FIELDS}
      }
    }
  }
`;

const WORKSPACE_LIMITS_QUERY = /* GraphQL */ `
  query GetWorkspaceLimits($id: String!) {
    workspace(id: $id) {
      plan {
        limits {
          ${LIMITS_FIELDS}
        }
      }
    }
  }
`;

const WORKSPACE_USAGE_QUERY = /* GraphQL */ `
  query GetWorkspaceUsage($id: String!) {
    workspace(id: $id) {
      plan {
        usage {
          ${USAGE_FIELDS}
        }
      }
    }
  }
`;

const WORKSPACE_SUBSCRIPTION_QUERY = /* GraphQL */ `
  query GetWorkspaceSubscription($id: String!) {
    workspace(id: $id) {
      subscription {
        ${SUBSCRIPTION_FIELDS}
      }
    }
  }
`;

const WORKSPACE_SEATS_QUERY = /* GraphQL */ `
  query GetWorkspaceSeats($id: String!) {
    workspace(id: $id) {
      seats {
        ${SEATS_FIELDS}
      }
    }
  }
`;

const WORKSPACE_BILLING_QUERY = /* GraphQL */ `
  query GetWorkspaceBilling($id: String!) {
    workspace(id: $id) {
      plan {
        ${PLAN_FIELDS}
      }
      subscription {
        ${SUBSCRIPTION_FIELDS}
      }
      seats {
        ${SEATS_FIELDS}
      }
    }
  }
`;

export interface WorkspaceBillingInfo {
  plan: WorkspacePlanInfo | null;
  subscription: WorkspaceSubscriptionInfo | null;
  seats: WorkspaceSubscriptionSeats | null;
}

export async function getWorkspacePlan(
  speckle: Speckle,
  id: string,
): Promise<WorkspacePlanInfo | null> {
  const data = await speckle.http.request<
    { workspace: { plan: unknown } | null },
    { id: string }
  >(WORKSPACE_PLAN_QUERY, { id });
  const ws = assertExists(data.workspace, "Workspace", id);
  if (ws.plan === null || ws.plan === undefined) return null;
  return parseOrThrow("WorkspacePlan", WorkspacePlanInfoSchema, ws.plan);
}

export async function getWorkspaceLimits(
  speckle: Speckle,
  id: string,
): Promise<WorkspaceLimits | null> {
  const data = await speckle.http.request<
    { workspace: { plan: { limits: unknown } | null } | null },
    { id: string }
  >(WORKSPACE_LIMITS_QUERY, { id });
  const ws = assertExists(data.workspace, "Workspace", id);
  if (ws.plan === null || ws.plan === undefined) return null;
  return parseOrThrow("WorkspaceLimits", WorkspaceLimitsSchema, ws.plan.limits);
}

export async function getWorkspaceUsage(
  speckle: Speckle,
  id: string,
): Promise<WorkspacePlanUsage | null> {
  const data = await speckle.http.request<
    { workspace: { plan: { usage: unknown } | null } | null },
    { id: string }
  >(WORKSPACE_USAGE_QUERY, { id });
  const ws = assertExists(data.workspace, "Workspace", id);
  if (ws.plan === null || ws.plan === undefined) return null;
  return parseOrThrow("WorkspacePlanUsage", WorkspacePlanUsageSchema, ws.plan.usage);
}

export async function getWorkspaceSubscription(
  speckle: Speckle,
  id: string,
): Promise<WorkspaceSubscriptionInfo | null> {
  const data = await speckle.http.request<
    { workspace: { subscription: unknown } | null },
    { id: string }
  >(WORKSPACE_SUBSCRIPTION_QUERY, { id });
  const ws = assertExists(data.workspace, "Workspace", id);
  if (ws.subscription === null || ws.subscription === undefined) return null;
  return parseOrThrow(
    "WorkspaceSubscription",
    WorkspaceSubscriptionInfoSchema,
    ws.subscription,
  );
}

export async function getWorkspaceSeats(
  speckle: Speckle,
  id: string,
): Promise<WorkspaceSubscriptionSeats | null> {
  const data = await speckle.http.request<
    { workspace: { seats: unknown } | null },
    { id: string }
  >(WORKSPACE_SEATS_QUERY, { id });
  const ws = assertExists(data.workspace, "Workspace", id);
  if (ws.seats === null || ws.seats === undefined) return null;
  return parseOrThrow("WorkspaceSeats", WorkspaceSubscriptionSeatsSchema, ws.seats);
}

export async function getWorkspaceBilling(
  speckle: Speckle,
  id: string,
): Promise<WorkspaceBillingInfo> {
  const data = await speckle.http.request<
    {
      workspace: {
        plan: unknown;
        subscription: unknown;
        seats: unknown;
      } | null;
    },
    { id: string }
  >(WORKSPACE_BILLING_QUERY, { id });
  const ws = assertExists(data.workspace, "Workspace", id);
  return {
    plan:
      ws.plan === null || ws.plan === undefined
        ? null
        : parseOrThrow("WorkspacePlan", WorkspacePlanInfoSchema, ws.plan),
    subscription:
      ws.subscription === null || ws.subscription === undefined
        ? null
        : parseOrThrow(
            "WorkspaceSubscription",
            WorkspaceSubscriptionInfoSchema,
            ws.subscription,
          ),
    seats:
      ws.seats === null || ws.seats === undefined
        ? null
        : parseOrThrow(
            "WorkspaceSeats",
            WorkspaceSubscriptionSeatsSchema,
            ws.seats,
          ),
  };
}

export class Workspace extends Node<WorkspaceInfo> {
  readonly id: string;

  constructor(speckle: Speckle, id: string) {
    super(speckle, null);
    this.id = id;
  }

  insightTemplate(id: string): InsightTemplate {
    return new InsightTemplate(this.speckle, this, id);
  }

  listInsightTemplates(type?: string): Promise<InsightTemplateInfo[]> {
    return listWorkspaceInsightTemplates(this.speckle, this.id, type);
  }

  dashboard(id: string): Dashboard {
    return new Dashboard(this.speckle, id);
  }

  listDashboards(
    opts?: WorkspaceDashboardsListOptions,
  ): Promise<PageInfo<DashboardInfo>> {
    return listWorkspaceDashboards(this.speckle, this.id, opts);
  }

  listAllDashboards(
    opts?: Omit<WorkspaceDashboardsListOptions, "cursor">,
  ): Promise<DashboardInfo[]> {
    return listAllWorkspaceDashboards(this.speckle, this.id, opts);
  }

  dashboards(
    opts?: Omit<WorkspaceDashboardsListOptions, "cursor">,
  ): AsyncIterable<DashboardInfo> {
    return iterateWorkspaceDashboards(this.speckle, this.id, opts);
  }

  async createDashboard(input: CreateDashboardInput): Promise<Dashboard> {
    const created = await createDashboard(this.speckle, { id: this.id }, input);
    return new Dashboard(this.speckle, created.id);
  }

  plan(): Promise<WorkspacePlanInfo | null> {
    return getWorkspacePlan(this.speckle, this.id);
  }

  limits(): Promise<WorkspaceLimits | null> {
    return getWorkspaceLimits(this.speckle, this.id);
  }

  usage(): Promise<WorkspacePlanUsage | null> {
    return getWorkspaceUsage(this.speckle, this.id);
  }

  subscription(): Promise<WorkspaceSubscriptionInfo | null> {
    return getWorkspaceSubscription(this.speckle, this.id);
  }

  seats(): Promise<WorkspaceSubscriptionSeats | null> {
    return getWorkspaceSeats(this.speckle, this.id);
  }

  billing(): Promise<WorkspaceBillingInfo> {
    return getWorkspaceBilling(this.speckle, this.id);
  }

  protected async fetch(): Promise<WorkspaceInfo> {
    const data = await this.speckle.http.request<{ workspace: unknown }, { id: string }>(WORKSPACE_QUERY, {
      id: this.id,
    });
    return parseOrThrow("Workspace", WorkspaceInfoSchema, data.workspace);
  }
}
