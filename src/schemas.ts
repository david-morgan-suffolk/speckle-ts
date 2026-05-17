import { z } from "zod";
import type { ModelsTreeItem } from "./types.js";

export const ProjectInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  visibility: z.string(),
  role: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  workspaceId: z.string().nullable(),
});

export const ModelInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const VersionInfoSchema = z.object({
  id: z.string(),
  message: z.string().nullable(),
  sourceApplication: z.string().nullable(),
  referencedObject: z.string(),
  previewUrl: z.string().nullable().optional(),
  createdAt: z.string(),
  authorUser: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
});

export const UserInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  bio: z.string().nullable(),
  company: z.string().nullable(),
  avatar: z.string().nullable(),
  createdAt: z.string(),
});

export const PermissionCheckSchema = z.object({
  authorized: z.boolean(),
  code: z.string(),
  message: z.string(),
});

export const AccountPermissionsSchema = z.object({
  canAccessServerAdminPanel: PermissionCheckSchema,
  canCreatePersonalProject: PermissionCheckSchema,
  canCreateWorkspace: PermissionCheckSchema,
  canManageServerRegions: PermissionCheckSchema,
  canManageServerUsers: PermissionCheckSchema,
  canManageServerWorkspaces: PermissionCheckSchema,
  canSupportServerUsers: PermissionCheckSchema,
  canUpdateServerSettings: PermissionCheckSchema,
  canUsePowerTools: PermissionCheckSchema,
});

export const AccountInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  role: z.string().nullable(),
  verified: z.boolean().nullable(),
  hasPendingVerification: z.boolean().nullable(),
  isOnboardingFinished: z.boolean().nullable(),
  permissions: AccountPermissionsSchema,
});

export const WorkspaceInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  readOnly: z.boolean(),
});

export const WorkspaceLimitsSchema = z.object({
  commentsHistoryInDays: z.number().nullable(),
  dashboardCount: z.number().nullable(),
  modelCount: z.number().nullable(),
  projectCount: z.number().nullable(),
  userCount: z.number().nullable(),
  versionCount: z.number().nullable(),
  versionsHistoryInDays: z.number().nullable(),
});

export const WorkspaceSyncUsageSchema = z.object({
  versionSyncsMonthly: z.number(),
  versionSyncsTotal: z.number(),
  versionsLoadedMonthly: z.number(),
  versionsLoadedTotal: z.number(),
  versionsPublishedMonthly: z.number(),
  versionsPublishedTotal: z.number(),
});

export const WorkspaceUserCountSchema = z.object({
  pendingUserCount: z.number(),
  userCount: z.number(),
});

export const WorkspaceVersionCountSchema = z.object({
  pendingVersionCount: z.number(),
  versionCount: z.number(),
});

export const WorkspacePlanUsageSchema = z.object({
  dashboardCount: z.number(),
  projectCount: z.number(),
  sync: WorkspaceSyncUsageSchema,
  users: WorkspaceUserCountSchema,
  versions: WorkspaceVersionCountSchema,
});

export const WorkspacePlanInfoSchema = z.object({
  createdAt: z.string(),
  features: z.array(z.string()),
  limitOverrides: z.record(z.string(), z.unknown()).nullable(),
  limits: WorkspaceLimitsSchema,
  name: z.string(),
  paymentMethod: z.string(),
  status: z.string(),
  usage: WorkspacePlanUsageSchema,
  validUntil: z.string().nullable(),
});

export const WorkspaceSubscriptionSeatCountSchema = z.object({
  assigned: z.number(),
  available: z.number(),
});

export const WorkspaceSubscriptionSeatsSchema = z.object({
  editors: WorkspaceSubscriptionSeatCountSchema,
  viewers: WorkspaceSubscriptionSeatCountSchema,
});

export const WorkspaceSubscriptionAddOnSchema = z.object({
  currentQuantity: z.number(),
});

export const WorkspaceSubscriptionInfoSchema = z.object({
  addOn: WorkspaceSubscriptionAddOnSchema,
  billingInterval: z.string(),
  createdAt: z.string(),
  currency: z.string(),
  currentBillingCycleEnd: z.string(),
  seats: WorkspaceSubscriptionSeatsSchema,
  updatedAt: z.string(),
});

export function PageInfoSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    totalCount: z.number(),
    cursor: z.string().nullable(),
    items: z.array(item).readonly(),
  });
}

export const ModelsTreeItemSchema: z.ZodType<ModelsTreeItem> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    fullName: z.string(),
    hasChildren: z.boolean(),
    updatedAt: z.string(),
    model: ModelInfoSchema.nullable(),
    children: z.array(ModelsTreeItemSchema).optional().default([]),
  }),
);

export const ModelsTreeItemPageSchema = PageInfoSchema(ModelsTreeItemSchema);

export const ModelVersionsPageSchema = PageInfoSchema(VersionInfoSchema);

export const InsightFilterClauseSchema: z.ZodType<{
  op: string;
  path: string;
  value?: unknown;
}> = z.object({
  op: z.string(),
  path: z.string(),
  value: z.unknown().optional(),
});

export const InsightRuleSchema = z.object({
  name: z.string(),
  check: InsightFilterClauseSchema,
  scope: z.array(InsightFilterClauseSchema).optional().default([]),
});

export const InsightComputeSchema = z
  .object({
    type: z.string(),
    rules: z.array(InsightRuleSchema).optional(),
  })
  .loose();

export const InsightQuerySchema = z
  .object({
    filter: InsightFilterClauseSchema,
    compute: InsightComputeSchema,
  })
  .loose();

export const InsightResultSchema = z.object({
  id: z.string(),
  insightId: z.string().optional(),
  modelId: z.string().nullable(),
  versionId: z.string().nullable(),
  timestamp: z.string(),
  summary: z.record(z.string(), z.unknown()),
  result: z.record(z.string(), z.unknown()),
});

export const InsightDataSourceLinkSchema = z.object({
  alias: z.string(),
  dataSourceId: z.string(),
  insightId: z.string(),
});

export const InsightInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  trigger: z.string(),
  version: z.number(),
  templateVersion: z.number().nullable(),
  customized: z.boolean(),
  derivedPackageCount: z.number(),
  modelIds: z.array(z.string()),
  projectId: z.string(),
  metadata: z.record(z.string(), z.unknown()),
  query: InsightQuerySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string(),
  updatedBy: z.string().nullable(),
  latestResults: z.array(InsightResultSchema).optional(),
  dataSources: z.array(InsightDataSourceLinkSchema).optional(),
});

export const InsightTemplateInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  description: z.string().nullable(),
  version: z.number(),
  workspaceId: z.string(),
  metadata: z.record(z.string(), z.unknown()),
  query: InsightQuerySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string(),
  updatedBy: z.string().nullable(),
});

export const DashboardProjectRefSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const DashboardInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  state: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  projects: z.array(DashboardProjectRefSchema),
  workspace: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  }),
  createdBy: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
});

export const DashboardsPageSchema = PageInfoSchema(DashboardInfoSchema);

export const TemplateModelSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const TemplateInsightFromTemplateSchema = z.object({
  kind: z.literal("fromTemplate"),
  templateId: z.string().min(1),
  modelRefs: z.array(z.string()).optional(),
  name: z.string().optional(),
});

const TemplateInsightInlineSchema = z.object({
  kind: z.literal("inline"),
  name: z.string().min(1),
  type: z.string().optional(),
  trigger: z.string().optional(),
  query: z.record(z.string(), z.unknown()),
  metadata: z.record(z.string(), z.unknown()).optional(),
  modelRefs: z.array(z.string()).optional(),
});

export const TemplateInsightSchema = z.discriminatedUnion("kind", [
  TemplateInsightFromTemplateSchema,
  TemplateInsightInlineSchema,
]);

export const TemplateAutomationSchema = z.object({
  name: z.string().min(1),
  enabled: z.boolean().default(false),
  isTestAutomation: z.boolean().optional(),
});

export const TemplateDashboardSchema = z.object({
  name: z.string().min(1),
  fromDashboardId: z.string().min(1),
  automationRef: z.string().optional(),
});

export const ProjectTemplateSpecSchema = z.object({
  workspaceId: z.string().min(1),
  project: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    visibility: z.enum(["PUBLIC", "PRIVATE", "WORKSPACE"]).optional(),
  }),
  models: z.array(TemplateModelSchema).optional(),
  insights: z.array(TemplateInsightSchema).optional(),
  automations: z.array(TemplateAutomationSchema).optional(),
  dashboards: z.array(TemplateDashboardSchema).optional(),
});

export const ProjectTemplateResultSchema = z.object({
  projectId: z.string(),
  modelIds: z.record(z.string(), z.string()),
  insightIds: z.array(z.string()),
  automationIds: z.array(z.string()),
  dashboardIds: z.array(z.string()),
});

export const WebhookInfoSchema = z.object({
  id: z.string(),
  url: z.string(),
  triggers: z.array(z.string()),
  enabled: z.boolean().nullable(),
  description: z.string().nullable(),
});

export const WebhookEventInfoSchema = z.object({
  id: z.string(),
  webhookId: z.string(),
  payload: z.string(),
  status: z.number(),
  statusInfo: z.string(),
  lastUpdate: z.string(),
  retryCount: z.number(),
});

export const IssueStatusSchema = z.enum(["open", "readyForReview", "resolved"]);

export const IssuePrioritySchema = z.string();

export const IssueParticipantInfoSchema = z.object({
  id: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

export const IssueInfoSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  number: z.number(),
  projectId: z.string(),
  title: z.string().nullable(),
  rawDescription: z.string().nullable(),
  status: IssueStatusSchema,
  priority: IssuePrioritySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  dueDate: z.string().nullable(),
  viewedAt: z.string().nullable(),
  resourceIdString: z.string().nullable(),
  author: IssueParticipantInfoSchema.nullable(),
  assignee: IssueParticipantInfoSchema.nullable(),
});

export const IssueReplyInfoSchema = z.object({
  id: z.string(),
  issueId: z.string(),
  projectId: z.string(),
  rawDescription: z.string().nullable(),
  createdAt: z.string(),
  author: IssueParticipantInfoSchema.nullable(),
});

export const IssuesPageSchema = PageInfoSchema(IssueInfoSchema);
export const IssueRepliesPageSchema = PageInfoSchema(IssueReplyInfoSchema);

export const AutomateRunStatusSchema = z.enum([
  "CANCELED",
  "EXCEPTION",
  "FAILED",
  "INITIALIZING",
  "PENDING",
  "RUNNING",
  "SUCCEEDED",
  "TIMEOUT",
]);

export const AutomateFunctionRunInfoSchema = z.object({
  id: z.string(),
  functionId: z.string().nullable(),
  functionReleaseId: z.string().nullable(),
  status: AutomateRunStatusSchema,
  statusMessage: z.string().nullable(),
  contextView: z.string().nullable(),
  elapsed: z.number(),
  results: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AutomateRunInfoSchema = z.object({
  id: z.string(),
  automationId: z.string(),
  automationRevisionId: z.string(),
  status: AutomateRunStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  functionRuns: z.array(AutomateFunctionRunInfoSchema).optional().default([]),
});

export const AutomationInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  isTestAutomation: z.boolean().optional().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AutomationsPageSchema = PageInfoSchema(AutomationInfoSchema);
export const AutomateRunsPageSchema = PageInfoSchema(AutomateRunInfoSchema);

export const FileImportJobSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  modelId: z.string().nullable(),
  modelName: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  convertedStatus: z.number(),
  convertedMessage: z.string().nullable(),
  convertedCommitId: z.string().nullable(),
  convertedVersionId: z.string().nullable(),
  uploadComplete: z.boolean(),
  uploadDate: z.string(),
  updatedAt: z.string(),
  userId: z.string(),
});

export const UploadUrlSchema = z.object({
  url: z.string(),
  fileId: z.string(),
  additionalRequestHeaders: z.array(
    z.object({ header: z.string(), value: z.string() }),
  ),
});
