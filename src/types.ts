import type { z } from "zod";
import type {
  ProjectInfoSchema,
  ModelInfoSchema,
  VersionInfoSchema,
  UserInfoSchema,
  AccountInfoSchema,
  AccountPermissionsSchema,
  PermissionCheckSchema,
  WorkspaceInfoSchema,
  WorkspaceLimitsSchema,
  WorkspaceSyncUsageSchema,
  WorkspaceUserCountSchema,
  WorkspaceVersionCountSchema,
  WorkspacePlanUsageSchema,
  WorkspacePlanInfoSchema,
  WorkspaceSubscriptionSeatCountSchema,
  WorkspaceSubscriptionSeatsSchema,
  WorkspaceSubscriptionAddOnSchema,
  WorkspaceSubscriptionInfoSchema,
  InsightInfoSchema,
  InsightTemplateInfoSchema,
  InsightResultSchema,
  InsightDataSourceLinkSchema,
  InsightQuerySchema,
  InsightComputeSchema,
  InsightRuleSchema,
  InsightFilterClauseSchema,
  DashboardInfoSchema,
  TemplateModelSchema,
  TemplateInsightSchema,
  TemplateAutomationSchema,
  TemplateDashboardSchema,
  ProjectTemplateSpecSchema,
  ProjectTemplateResultSchema,
  WebhookInfoSchema,
  WebhookEventInfoSchema,
  IssueInfoSchema,
  IssueReplyInfoSchema,
  IssueParticipantInfoSchema,
  IssueStatusSchema,
  FileImportJobSchema,
  UploadUrlSchema,
  AutomationInfoSchema,
  AutomateRunInfoSchema,
  AutomateFunctionRunInfoSchema,
  AutomateRunStatusSchema,
} from "@/schemas.js";

export type ProjectInfo = z.infer<typeof ProjectInfoSchema>;
export type ModelInfo = z.infer<typeof ModelInfoSchema>;
export type VersionInfo = z.infer<typeof VersionInfoSchema>;
export type UserInfo = z.infer<typeof UserInfoSchema>;
export type AccountInfo = z.infer<typeof AccountInfoSchema>;
export type AccountPermissions = z.infer<typeof AccountPermissionsSchema>;
export type PermissionCheck = z.infer<typeof PermissionCheckSchema>;
export type WorkspaceInfo = z.infer<typeof WorkspaceInfoSchema>;
export type WorkspaceLimits = z.infer<typeof WorkspaceLimitsSchema>;
export type WorkspaceSyncUsage = z.infer<typeof WorkspaceSyncUsageSchema>;
export type WorkspaceUserCount = z.infer<typeof WorkspaceUserCountSchema>;
export type WorkspaceVersionCount = z.infer<typeof WorkspaceVersionCountSchema>;
export type WorkspacePlanUsage = z.infer<typeof WorkspacePlanUsageSchema>;
export type WorkspacePlanInfo = z.infer<typeof WorkspacePlanInfoSchema>;
export type WorkspaceSubscriptionSeatCount = z.infer<typeof WorkspaceSubscriptionSeatCountSchema>;
export type WorkspaceSubscriptionSeats = z.infer<typeof WorkspaceSubscriptionSeatsSchema>;
export type WorkspaceSubscriptionAddOn = z.infer<typeof WorkspaceSubscriptionAddOnSchema>;
export type WorkspaceSubscriptionInfo = z.infer<typeof WorkspaceSubscriptionInfoSchema>;
export type InsightInfo = z.infer<typeof InsightInfoSchema>;
export type InsightTemplateInfo = z.infer<typeof InsightTemplateInfoSchema>;
export type InsightResult = z.infer<typeof InsightResultSchema>;
export type InsightDataSourceLink = z.infer<typeof InsightDataSourceLinkSchema>;
export type InsightQuery = z.infer<typeof InsightQuerySchema>;
export type InsightCompute = z.infer<typeof InsightComputeSchema>;
export type InsightRule = z.infer<typeof InsightRuleSchema>;
export type InsightFilterClause = z.infer<typeof InsightFilterClauseSchema>;

export type DashboardInfo = z.infer<typeof DashboardInfoSchema>;

export type TemplateModel = z.infer<typeof TemplateModelSchema>;
export type TemplateInsight = z.infer<typeof TemplateInsightSchema>;
export type TemplateAutomation = z.infer<typeof TemplateAutomationSchema>;
export type TemplateDashboard = z.infer<typeof TemplateDashboardSchema>;
export type ProjectTemplateSpec = z.infer<typeof ProjectTemplateSpecSchema>;
export type ProjectTemplateResult = z.infer<typeof ProjectTemplateResultSchema>;

export interface DashboardListOptions {
  cursor?: string | null;
  limit?: number;
}

export interface WorkspaceDashboardsFilter {
  projectIds?: string[];
  search?: string;
}

export interface ProjectDashboardsFilter {
  search?: string;
}

export interface UpdateDashboardInput {
  name?: string;
  state?: string;
  projectLinks?: ReadonlyArray<{ projectId: string; automationId?: string }>;
}

export type WebhookInfo = z.infer<typeof WebhookInfoSchema>;
export type WebhookEventInfo = z.infer<typeof WebhookEventInfoSchema>;

export interface CreateWebhookInput {
  url: string;
  triggers: string[];
  enabled?: boolean;
  secret?: string;
  description?: string;
}

export interface UpdateWebhookInput {
  url?: string;
  triggers?: string[];
  enabled?: boolean;
  secret?: string;
  description?: string;
}

export type IssueStatus = z.infer<typeof IssueStatusSchema>;
export type IssueParticipantInfo = z.infer<typeof IssueParticipantInfoSchema>;
export type IssueInfo = z.infer<typeof IssueInfoSchema>;
export type IssueReplyInfo = z.infer<typeof IssueReplyInfoSchema>;

export interface IssuesFilter {
  resourceIdString?: string;
  search?: string;
  statuses?: IssueStatus[];
  loadedVersionsOnly?: boolean;
  cursor?: string;
  limit?: number;
}

export interface CreateIssueInput {
  title: string;
  description?: Record<string, unknown>;
  status?: IssueStatus;
  priority?: string;
  resourceIdString?: string;
  assigneeId?: string;
}

export interface UpdateIssueInput {
  title?: string;
  description?: Record<string, unknown>;
  status?: IssueStatus;
  priority?: string;
  resourceIdString?: string;
  assigneeId?: string;
  dueDate?: string;
}

export interface CreateIssueReplyInput {
  description: Record<string, unknown>;
}

export interface PublishVersionInput {
  objectId: string;
  message?: string;
  sourceApplication?: string;
  parents?: string[];
  totalChildrenCount?: number;
}

export interface UpdateVersionPatch {
  message?: string;
}

export interface MarkVersionReceivedInput {
  sourceApplication: string;
  message?: string;
  isEmbed?: boolean;
  withSharedToken?: boolean;
}

export type FileImportJob = z.infer<typeof FileImportJobSchema>;
export type UploadUrl = z.infer<typeof UploadUrlSchema>;

export type FileImportConvertedStatus =
  | "queued" // 0
  | "processing" // 1
  | "success" // 2
  | "error"; // 3

export interface UploadFileInput {
  fileName: string;
  data: Blob | ArrayBuffer | Uint8Array;
}

export type AutomateRunStatus = z.infer<typeof AutomateRunStatusSchema>;
export type AutomateFunctionRunInfo = z.infer<typeof AutomateFunctionRunInfoSchema>;
export type AutomateRunInfo = z.infer<typeof AutomateRunInfoSchema>;
export type AutomationInfo = z.infer<typeof AutomationInfoSchema>;

export interface CreateAutomationInput {
  name: string;
  enabled: boolean;
  isTestAutomation?: boolean;
}

export interface UpdateAutomationInput {
  name?: string;
  enabled?: boolean;
}

export interface AutomationListOptions {
  cursor?: string | null;
  limit?: number;
}

export interface AutomationRunsOptions {
  cursor?: string | null;
  limit?: number;
}

export interface PageInfo<T> {
  totalCount: number;
  cursor: string | null;
  items: ReadonlyArray<T>;
}

export interface ModelsTreeItem {
  id: string;
  name: string;
  fullName: string;
  hasChildren: boolean;
  updatedAt: string;
  model: ModelInfo | null;
  children: ModelsTreeItem[];
}

export interface ProjectModelsTreeFilterInput {
  contributors?: string[];
  search?: string;
  sourceApps?: string[];
}
