import { Node } from "./Node.js";
import { Version } from "./Version.js";
import type { Project } from "./Project.js";
import type { Speckle } from "../client.js";
import type { ModelInfo } from "../types.js";

const MODEL_QUERY = /* GraphQL */ `
  query Model($projectId: String!, $modelId: String!) {
    project(id: $projectId) {
      model(id: $modelId) {
        id
        name
        description
        createdAt
        updatedAt
      }
    }
  }
`;

export class Model extends Node<ModelInfo> {
  readonly id: string;
  readonly project: Project;

  constructor(speckle: Speckle, project: Project, id: string) {
    super(speckle, project);
    this.project = project;
    this.id = id;
  }

  version(id: string): Version {
    return new Version(this.speckle, this, id);
  }

  protected async fetch(): Promise<ModelInfo> {
    const data = await this.speckle.http.request<
      { project: { model: ModelInfo } },
      { projectId: string; modelId: string }
    >(MODEL_QUERY, { projectId: this.project.id, modelId: this.id });
    return data.project.model;
  }
}
