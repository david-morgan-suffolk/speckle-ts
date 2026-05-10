import type { GraphQLHandler } from "../graphql.js";
import type {
  AutomationInfo,
  AutomateRunInfo,
  AutomateFunctionRunInfo,
} from "../../../src/types.js";
import type { PageEnvelope } from "./project.js";

export const automationFixture = (
  overrides: Partial<AutomationInfo> = {},
): AutomationInfo => ({
  id: "auto_1",
  name: "Nightly check",
  enabled: true,
  isTestAutomation: false,
  createdAt: "2026-05-01T00:00:00Z",
  updatedAt: "2026-05-01T00:00:00Z",
  ...overrides,
});

export const automateFunctionRunFixture = (
  id: string,
  overrides: Partial<AutomateFunctionRunInfo> = {},
): AutomateFunctionRunInfo => ({
  id,
  functionId: "fn_1",
  functionReleaseId: "rel_1",
  status: "SUCCEEDED",
  statusMessage: null,
  contextView: null,
  elapsed: 1.2,
  results: null,
  createdAt: "2026-05-01T00:00:00Z",
  updatedAt: "2026-05-01T00:00:01Z",
  ...overrides,
});

export const automateRunFixture = (
  id: string,
  overrides: Partial<AutomateRunInfo> = {},
): AutomateRunInfo => ({
  id,
  automationId: "auto_1",
  automationRevisionId: "rev_1",
  status: "PENDING",
  createdAt: "2026-05-01T00:00:00Z",
  updatedAt: "2026-05-01T00:00:00Z",
  functionRuns: [],
  ...overrides,
});

export const listAutomationsHandler =
  (page: PageEnvelope<AutomationInfo>): GraphQLHandler =>
  () => ({ project: { automations: page } });

export const getAutomationHandler =
  (automation: AutomationInfo): GraphQLHandler =>
  () => ({ project: { automation } });

export const listAutomationRunsHandler =
  (page: PageEnvelope<AutomateRunInfo>): GraphQLHandler =>
  () => ({ project: { automation: { runs: page } } });

export const createAutomationHandler =
  (automation: AutomationInfo): GraphQLHandler =>
  () => ({
    projectMutations: { automationMutations: { create: automation } },
  });

export const updateAutomationHandler =
  (automation: AutomationInfo): GraphQLHandler =>
  () => ({
    projectMutations: { automationMutations: { update: automation } },
  });

export const deleteAutomationHandler =
  (success = true): GraphQLHandler =>
  () => ({
    projectMutations: { automationMutations: { delete: success } },
  });

export const triggerAutomationHandler =
  (runId: string): GraphQLHandler =>
  () => ({
    projectMutations: { automationMutations: { trigger: runId } },
  });
