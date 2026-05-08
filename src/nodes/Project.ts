import { Node } from "./Node.js";
import { Model } from "./Model.js";
import { subscribe } from "../transport/ws.js";
import type { Speckle } from "../client.js";
import type { ProjectInfo } from "../types.js";

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

  protected async fetch(): Promise<ProjectInfo> {
    const data = await this.speckle.http.request<{ project: ProjectInfo }, { id: string }>(PROJECT_QUERY, {
      id: this.id,
    });
    return data.project;
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
