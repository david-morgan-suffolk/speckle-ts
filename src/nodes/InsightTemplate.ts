import { Node } from "./Node.js";
import { assertExists, parseOrThrow } from "../transport/validate.js";
import { InsightTemplateInfoSchema } from "../schemas.js";
import { z } from "zod";
import type { Workspace } from "./Workspace.js";
import type { Speckle } from "../client.js";
import type { InsightTemplateInfo } from "../types.js";

const TEMPLATE_FIELDS = /* GraphQL */ `
  id
  name
  type
  description
  version
  workspaceId
  metadata
  query
  createdAt
  updatedAt
  createdBy
  updatedBy
`;

const TEMPLATE_QUERY = /* GraphQL */ `
  query InsightTemplate($workspaceId: String!, $id: String!) {
    insightTemplate(workspaceId: $workspaceId, id: $id) {
      ${TEMPLATE_FIELDS}
    }
  }
`;

const WORKSPACE_TEMPLATES_QUERY = /* GraphQL */ `
  query WorkspaceInsightTemplates($workspaceId: String!, $type: String) {
    workspaceInsightTemplates(workspaceId: $workspaceId, type: $type) {
      ${TEMPLATE_FIELDS}
    }
  }
`;

export class InsightTemplate extends Node<InsightTemplateInfo> {
  readonly id: string;
  readonly workspace: Workspace;

  constructor(speckle: Speckle, workspace: Workspace, id: string) {
    super(speckle, workspace);
    this.workspace = workspace;
    this.id = id;
  }

  protected async fetch(): Promise<InsightTemplateInfo> {
    const data = await this.speckle.http.request<
      { insightTemplate: unknown },
      { workspaceId: string; id: string }
    >(TEMPLATE_QUERY, { workspaceId: this.workspace.id, id: this.id });
    const template = assertExists(data.insightTemplate, "InsightTemplate", this.id);
    return parseOrThrow("InsightTemplate", InsightTemplateInfoSchema, template);
  }
}

export async function listWorkspaceInsightTemplates(
  speckle: Speckle,
  workspaceId: string,
  type?: string,
): Promise<InsightTemplateInfo[]> {
  const data = await speckle.http.request<
    { workspaceInsightTemplates: unknown[] },
    { workspaceId: string; type?: string }
  >(WORKSPACE_TEMPLATES_QUERY, {
    workspaceId,
    ...(type !== undefined ? { type } : {}),
  });
  return parseOrThrow(
    "WorkspaceInsightTemplates",
    z.array(InsightTemplateInfoSchema),
    data.workspaceInsightTemplates,
  );
}
