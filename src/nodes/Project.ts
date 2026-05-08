import { Node } from "./Node.js";
import { Model } from "./Model.js";
import { Insight, listProjectInsights } from "./Insight.js";
import { subscribe } from "../transport/ws.js";
import { parseOrThrow } from "../transport/validate.js";
import { ProjectInfoSchema } from "../schemas.js";
import type { Speckle } from "../client.js";
import type { InsightInfo, ProjectInfo } from "../types.js";

const PROJECT_QUERY = /* GraphQL */ `
  query Project($id: String!) {
    project(id: $id) {
      id
      name
      description
      visibility
      role
      createdAt
      updatedAt
      workspaceId
    }
  }
`;

const PROJECT_UPDATED_SUB = /* GraphQL */ `
  subscription ProjectUpdated($id: String!) {
    projectUpdated(id: $id) {
      id
      type
      project {
        id
        name
        description
        updatedAt
      }
    }
  }
`;

const PROJECT_MODELS_UPDATED_SUB = /* GraphQL */ `
  subscription ProjectModelsUpdated($id: String!) {
    projectModelsUpdated(id: $id) {
      id
      type
      model {
        id
        name
        updatedAt
      }
    }
  }
`;

const PROJECT_VERSIONS_UPDATED_SUB = /* GraphQL */ `
  subscription ProjectVersionsUpdated($id: String!) {
    projectVersionsUpdated(id: $id) {
      id
      type
      version {
        id
        message
        createdAt
      }
    }
  }
`;

export class Project extends Node<ProjectInfo> {
  readonly id: string;

  constructor(speckle: Speckle, id: string) {
    super(speckle, null);
    this.id = id;
  }

  model(id: string): Model {
    return new Model(this.speckle, this, id);
  }

  insight(id: string): Insight {
    return new Insight(this.speckle, this, id);
  }

  listInsights(type?: string): Promise<InsightInfo[]> {
    return listProjectInsights(this.speckle, this.id, type);
  }

  protected async fetch(): Promise<ProjectInfo> {
    const data = await this.speckle.http.request<{ project: unknown }, { id: string }>(PROJECT_QUERY, {
      id: this.id,
    });
    return parseOrThrow("Project", ProjectInfoSchema, data.project);
  }

  onUpdate(onNext: (event: unknown) => void, onError?: (err: unknown) => void): () => void {
    return subscribe(this.speckle.ws, { query: PROJECT_UPDATED_SUB, variables: { id: this.id } }, onNext, onError);
  }

  onModelsUpdate(onNext: (event: unknown) => void, onError?: (err: unknown) => void): () => void {
    return subscribe(
      this.speckle.ws,
      { query: PROJECT_MODELS_UPDATED_SUB, variables: { id: this.id } },
      onNext,
      onError,
    );
  }

  onVersionsUpdate(onNext: (event: unknown) => void, onError?: (err: unknown) => void): () => void {
    return subscribe(
      this.speckle.ws,
      { query: PROJECT_VERSIONS_UPDATED_SUB, variables: { id: this.id } },
      onNext,
      onError,
    );
  }
}
