import type { GraphQLHandler } from "../graphql.js";
import type {
  WorkspaceInfo,
  WorkspacePlanInfo,
  WorkspaceLimits,
  WorkspacePlanUsage,
  WorkspaceSubscriptionInfo,
  WorkspaceSubscriptionSeats,
} from "../../../src/types.js";

export const workspaceFixture = (overrides: Partial<WorkspaceInfo> = {}): WorkspaceInfo => ({
  id: "ws_1",
  name: "Acme",
  slug: "acme",
  description: null,
  createdAt: "2026-01-01T00:00:00Z",
  readOnly: false,
  ...overrides,
});

export const workspaceHandler =
  (workspace: WorkspaceInfo | null): GraphQLHandler =>
  () => ({ workspace });

export const workspacePlanHandler =
  (plan: WorkspacePlanInfo | null): GraphQLHandler =>
  () => ({ workspace: { plan } });

export const workspaceLimitsHandler =
  (limits: WorkspaceLimits | null): GraphQLHandler =>
  () => ({ workspace: { plan: limits === null ? null : { limits } } });

export const workspaceUsageHandler =
  (usage: WorkspacePlanUsage | null): GraphQLHandler =>
  () => ({ workspace: { plan: usage === null ? null : { usage } } });

export const workspaceSubscriptionHandler =
  (subscription: WorkspaceSubscriptionInfo | null): GraphQLHandler =>
  () => ({ workspace: { subscription } });

export const workspaceSeatsHandler =
  (seats: WorkspaceSubscriptionSeats | null): GraphQLHandler =>
  () => ({ workspace: { seats } });

export interface WorkspaceBillingPayload {
  plan: WorkspacePlanInfo | null;
  subscription: WorkspaceSubscriptionInfo | null;
  seats: WorkspaceSubscriptionSeats | null;
}

export const workspaceBillingHandler =
  (payload: WorkspaceBillingPayload): GraphQLHandler =>
  () => ({ workspace: payload });
