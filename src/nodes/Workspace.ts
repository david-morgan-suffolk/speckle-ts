import { Node } from "./Node.js";
import { InsightTemplate, listWorkspaceInsightTemplates } from "./InsightTemplate.js";
import { parseOrThrow } from "../transport/validate.js";
import { WorkspaceInfoSchema } from "../schemas.js";
import type { Speckle } from "../client.js";
import type { InsightTemplateInfo, WorkspaceInfo } from "../types.js";

const WORKSPACE_QUERY = /* GraphQL */ `
  query Workspace($id: String!) {
    workspace(id: $id) {
      id
      name
      slug
      description
      createdAt
    }
  }
`;

export class Workspace extends Node<WorkspaceInfo> {
  readonly id: string;

  constructor(speckle: Speckle, id: string) {
    super(speckle, null);
    this.id = id;
  }

  insightTemplate(id: string): InsightTemplate {
    return new InsightTemplate(this.speckle, this, id);
  }

  listInsightTemplates(type?: string): Promise<InsightTemplateInfo[]> {
    return listWorkspaceInsightTemplates(this.speckle, this.id, type);
  }

  protected async fetch(): Promise<WorkspaceInfo> {
    const data = await this.speckle.http.request<{ workspace: unknown }, { id: string }>(WORKSPACE_QUERY, {
      id: this.id,
    });
    return parseOrThrow("Workspace", WorkspaceInfoSchema, data.workspace);
  }
}
