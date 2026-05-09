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
    children: z.array(ModelsTreeItemSchema),
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
});

export const ProjectTemplateResultSchema = z.object({
  projectId: z.string(),
  modelIds: z.record(z.string(), z.string()),
  insightIds: z.array(z.string()),
  automationIds: z.array(z.string()),
});
