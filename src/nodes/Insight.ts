import { Node } from "./Node.js";
import { assertExists, parseOrThrow } from "../transport/validate.js";
import { InsightInfoSchema, InsightResultSchema } from "../schemas.js";
import { z } from "zod";
import type { Project } from "./Project.js";
import type { Speckle } from "../client.js";
import type { InsightInfo, InsightResult } from "../types.js";

const INSIGHT_FIELDS = /* GraphQL */ `
  id
  name
  type
  trigger
  version
  templateVersion
  customized
  derivedPackageCount
  modelIds
  projectId
  metadata
  query
  createdAt
  updatedAt
  createdBy
  updatedBy
  latestResults {
    id
    insightId
    modelId
    versionId
    timestamp
    summary
    result
  }
  dataSources {
    alias
    dataSourceId
    insightId
  }
`;

const INSIGHT_QUERY = /* GraphQL */ `
  query Insight($projectId: String!, $id: String!) {
    insight(projectId: $projectId, id: $id) {
      ${INSIGHT_FIELDS}
    }
  }
`;

const INSIGHT_MODEL_RESULTS_QUERY = /* GraphQL */ `
  query InsightModelResults($projectId: String!, $id: String!, $modelId: String!, $limit: Int) {
    insight(projectId: $projectId, id: $id) {
      modelResults(modelId: $modelId, limit: $limit) {
        id
        insightId
        modelId
        versionId
        timestamp
        summary
        result
      }
    }
  }
`;

const INSIGHT_VERSION_RESULTS_QUERY = /* GraphQL */ `
  query InsightVersionResults($projectId: String!, $id: String!, $modelId: String!, $versionId: String!) {
    insight(projectId: $projectId, id: $id) {
      versionResults(modelId: $modelId, versionId: $versionId) {
        id
        insightId
        modelId
        versionId
        timestamp
        summary
        result
      }
    }
  }
`;

const INSIGHT_AGGREGATE_RESULTS_QUERY = /* GraphQL */ `
  query InsightAggregateResults($projectId: String!, $id: String!, $limit: Int) {
    insight(projectId: $projectId, id: $id) {
      aggregateResults(limit: $limit) {
        id
        insightId
        modelId
        versionId
        timestamp
        summary
        result
      }
    }
  }
`;

const ResultListSchema = z.array(InsightResultSchema);

export class Insight extends Node<InsightInfo> {
  readonly id: string;
  readonly project: Project;

  constructor(speckle: Speckle, project: Project, id: string) {
    super(speckle, project);
    this.project = project;
    this.id = id;
  }

  protected async fetch(): Promise<InsightInfo> {
    const data = await this.speckle.http.request<
      { insight: unknown },
      { projectId: string; id: string }
    >(INSIGHT_QUERY, { projectId: this.project.id, id: this.id });
    const insight = assertExists(data.insight, "Insight", this.id);
    return parseOrThrow("Insight", InsightInfoSchema, insight);
  }

  async modelResults(modelId: string, limit?: number): Promise<InsightResult[]> {
    const data = await this.speckle.http.request<
      { insight: { modelResults: unknown[] } | null },
      { projectId: string; id: string; modelId: string; limit?: number }
    >(INSIGHT_MODEL_RESULTS_QUERY, {
      projectId: this.project.id,
      id: this.id,
      modelId,
      ...(limit !== undefined ? { limit } : {}),
    });
    const insight = assertExists(data.insight, "Insight", this.id);
    return parseOrThrow("InsightModelResults", ResultListSchema, insight.modelResults);
  }

  async versionResults(modelId: string, versionId: string): Promise<InsightResult[]> {
    const data = await this.speckle.http.request<
      { insight: { versionResults: unknown[] } | null },
      { projectId: string; id: string; modelId: string; versionId: string }
    >(INSIGHT_VERSION_RESULTS_QUERY, {
      projectId: this.project.id,
      id: this.id,
      modelId,
      versionId,
    });
    const insight = assertExists(data.insight, "Insight", this.id);
    return parseOrThrow("InsightVersionResults", ResultListSchema, insight.versionResults);
  }

  async aggregateResults(limit?: number): Promise<InsightResult[]> {
    const data = await this.speckle.http.request<
      { insight: { aggregateResults: unknown[] } | null },
      { projectId: string; id: string; limit?: number }
    >(INSIGHT_AGGREGATE_RESULTS_QUERY, {
      projectId: this.project.id,
      id: this.id,
      ...(limit !== undefined ? { limit } : {}),
    });
    const insight = assertExists(data.insight, "Insight", this.id);
    return parseOrThrow("InsightAggregateResults", ResultListSchema, insight.aggregateResults);
  }
}

const PROJECT_INSIGHTS_QUERY = /* GraphQL */ `
  query ProjectInsights($projectId: String!, $type: String) {
    projectInsights(projectId: $projectId, type: $type) {
      ${INSIGHT_FIELDS}
    }
  }
`;

export async function listProjectInsights(
  speckle: Speckle,
  projectId: string,
  type?: string,
): Promise<InsightInfo[]> {
  const data = await speckle.http.request<
    { projectInsights: unknown[] },
    { projectId: string; type?: string }
  >(PROJECT_INSIGHTS_QUERY, {
    projectId,
    ...(type !== undefined ? { type } : {}),
  });
  return parseOrThrow(
    "ProjectInsights",
    z.array(InsightInfoSchema),
    data.projectInsights,
  );
}
