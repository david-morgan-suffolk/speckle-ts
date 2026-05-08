export { Speckle } from "@/client.js";
export type { SpeckleOptions } from "@/client.js";

export { Node } from "@/nodes/Node.js";
export { Project } from "@/nodes/Project.js";
export { Model } from "@/nodes/Model.js";
export { Version } from "@/nodes/Version.js";
export { User } from "@/nodes/User.js";
export { Workspace } from "@/nodes/Workspace.js";
export { Insight } from "@/nodes/Insight.js";
export { InsightTemplate } from "@/nodes/InsightTemplate.js";

export type {
  ProjectInfo,
  ModelInfo,
  VersionInfo,
  UserInfo,
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
} from "@/schemas.js";

export * as transforms from "@/transforms/index.js";

export { getSdk } from "@/generated/sdk.js";
export type { Sdk } from "@/generated/sdk.js";
