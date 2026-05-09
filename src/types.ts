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
  InsightInfoSchema,
  InsightTemplateInfoSchema,
  InsightResultSchema,
  InsightDataSourceLinkSchema,
  InsightQuerySchema,
  InsightComputeSchema,
  InsightRuleSchema,
  InsightFilterClauseSchema,
  TemplateModelSchema,
  TemplateInsightSchema,
  TemplateAutomationSchema,
  ProjectTemplateSpecSchema,
  ProjectTemplateResultSchema,
} from "@/schemas.js";

export type ProjectInfo = z.infer<typeof ProjectInfoSchema>;
export type ModelInfo = z.infer<typeof ModelInfoSchema>;
export type VersionInfo = z.infer<typeof VersionInfoSchema>;
export type UserInfo = z.infer<typeof UserInfoSchema>;
export type AccountInfo = z.infer<typeof AccountInfoSchema>;
export type AccountPermissions = z.infer<typeof AccountPermissionsSchema>;
export type PermissionCheck = z.infer<typeof PermissionCheckSchema>;
export type WorkspaceInfo = z.infer<typeof WorkspaceInfoSchema>;
export type InsightInfo = z.infer<typeof InsightInfoSchema>;
export type InsightTemplateInfo = z.infer<typeof InsightTemplateInfoSchema>;
export type InsightResult = z.infer<typeof InsightResultSchema>;
export type InsightDataSourceLink = z.infer<typeof InsightDataSourceLinkSchema>;
export type InsightQuery = z.infer<typeof InsightQuerySchema>;
export type InsightCompute = z.infer<typeof InsightComputeSchema>;
export type InsightRule = z.infer<typeof InsightRuleSchema>;
export type InsightFilterClause = z.infer<typeof InsightFilterClauseSchema>;

export type TemplateModel = z.infer<typeof TemplateModelSchema>;
export type TemplateInsight = z.infer<typeof TemplateInsightSchema>;
export type TemplateAutomation = z.infer<typeof TemplateAutomationSchema>;
export type ProjectTemplateSpec = z.infer<typeof ProjectTemplateSpecSchema>;
export type ProjectTemplateResult = z.infer<typeof ProjectTemplateResultSchema>;

export interface PageInfo<T> {
  totalCount: number;
  cursor: string | null;
  items: ReadonlyArray<T>;
}
