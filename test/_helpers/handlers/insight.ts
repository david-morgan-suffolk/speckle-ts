import type { GraphQLHandler } from "../graphql.js";
import type { InsightInfo, InsightResult } from "../../../src/types.js";

export const insightFixture = (overrides: Partial<InsightInfo> = {}): InsightInfo => ({
  id: "ins_1",
  name: "Sample insight",
  type: "model_validation",
  trigger: "onVersion",
  version: 1,
  templateVersion: null,
  customized: false,
  derivedPackageCount: 0,
  modelIds: [],
  projectId: "p1",
  metadata: {},
  query: {
    filter: { op: "exists", path: "level" },
    compute: { type: "validate" },
  },
  createdAt: "2026-05-01T00:00:00Z",
  updatedAt: "2026-05-01T00:00:00Z",
  createdBy: "u_1",
  updatedBy: null,
  latestResults: [],
  dataSources: [],
  ...overrides,
});

export const insightResultFixture = (
  id: string,
  overrides: Partial<InsightResult> = {},
): InsightResult => ({
  id,
  insightId: "ins_1",
  modelId: "m1",
  versionId: "v1",
  timestamp: "2026-05-01T00:00:00Z",
  summary: {},
  result: {},
  ...overrides,
});

export const insightHandler =
  (insight: InsightInfo): GraphQLHandler =>
  () => ({ insight });

export const projectInsightsHandler =
  (insights: InsightInfo[]): GraphQLHandler =>
  () => ({ projectInsights: insights });

export const insightModelResultsHandler =
  (results: InsightResult[]): GraphQLHandler =>
  () => ({ insight: { modelResults: results } });

export const insightVersionResultsHandler =
  (results: InsightResult[]): GraphQLHandler =>
  () => ({ insight: { versionResults: results } });

export const insightAggregateResultsHandler =
  (results: InsightResult[]): GraphQLHandler =>
  () => ({ insight: { aggregateResults: results } });
