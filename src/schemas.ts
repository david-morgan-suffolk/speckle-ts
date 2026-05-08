import { z } from "zod";

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
