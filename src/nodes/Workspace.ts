import { Node } from "./Node.js";
import type { Speckle } from "../client.js";
import type { WorkspaceInfo } from "../types.js";

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

  protected async fetch(): Promise<WorkspaceInfo> {
    const data = await this.speckle.http.request<{ workspace: WorkspaceInfo }, { id: string }>(WORKSPACE_QUERY, {
      id: this.id,
    });
    return data.workspace;
  }
}
