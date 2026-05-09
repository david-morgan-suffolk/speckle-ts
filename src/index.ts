export { Speckle } from "@/client.js";
export type { SpeckleOptions } from "@/client.js";

export { Node } from "@/nodes/Node.js";
export { Project } from "@/nodes/Project.js";
export { Model } from "@/nodes/Model.js";
export { Version } from "@/nodes/Version.js";
export { User } from "@/nodes/User.js";
export { Account } from "@/nodes/Account.js";
export { Workspace } from "@/nodes/Workspace.js";
export { Insight } from "@/nodes/Insight.js";
export { InsightTemplate } from "@/nodes/InsightTemplate.js";

export type {
  ProjectInfo,
  ModelInfo,
  VersionInfo,
  UserInfo,
  AccountInfo,
  AccountPermissions,
  PermissionCheck,
  WorkspaceInfo,
  InsightInfo,
  InsightTemplateInfo,
  InsightResult,
  InsightDataSourceLink,
  InsightQuery,
  InsightCompute,
  InsightRule,
  InsightFilterClause,
  PageInfo,
  ModelsTreeItem,
  ProjectModelsTreeFilterInput,
  TemplateModel,
  TemplateInsight,
  TemplateAutomation,
  ProjectTemplateSpec,
  ProjectTemplateResult,
} from "@/types.js";

export {
  SpeckleGraphQLError,
  SpeckleTransportError,
  SpeckleValidationError,
} from "@/transport/errors.js";
export type { GraphQLErrorPayload } from "@/transport/errors.js";

export {
  ProjectInfoSchema,
  ModelInfoSchema,
  VersionInfoSchema,
  UserInfoSchema,
  AccountInfoSchema,
  AccountPermissionsSchema,
  PermissionCheckSchema,
  WorkspaceInfoSchema,
  InsightInfoSchema,
  InsightTemplateInfoSchema,
  InsightResultSchema,
  InsightDataSourceLinkSchema,
  InsightQuerySchema,
  InsightComputeSchema,
  InsightRuleSchema,
  InsightFilterClauseSchema,
  PageInfoSchema,
  ModelsTreeItemSchema,
  ModelsTreeItemPageSchema,
  ModelVersionsPageSchema,
  TemplateModelSchema,
  TemplateInsightSchema,
  TemplateAutomationSchema,
  ProjectTemplateSpecSchema,
  ProjectTemplateResultSchema,
} from "@/schemas.js";

export * as transforms from "@/transforms/index.js";

export {
  applyProjectTemplate,
  ProjectTemplateError,
  type ProjectTemplateStage,
  extractProjectModelVersionsTree,
  type ExtractProjectTreeOptions,
  type ProjectModelVersionsTreeNode,
} from "@/workflows/index.js";

export { getSdk } from "@/generated/sdk.js";
export type { Sdk } from "@/generated/sdk.js";
