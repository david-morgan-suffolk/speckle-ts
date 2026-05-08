import { Node } from "./Node.js";
import { parseOrThrow } from "../transport/validate.js";
import { VersionInfoSchema } from "../schemas.js";
import type { Model } from "./Model.js";
import type { Speckle } from "../client.js";
import type { VersionInfo } from "../types.js";

const VERSION_QUERY = /* GraphQL */ `
  query Version($projectId: String!, $modelId: String!, $versionId: String!) {
    project(id: $projectId) {
      model(id: $modelId) {
        version(id: $versionId) {
          id
          message
          sourceApplication
          referencedObject
          createdAt
          authorUser {
            id
            name
          }
        }
      }
    }
  }
`;

export class Version extends Node<VersionInfo> {
  readonly id: string;
  readonly model: Model;

  constructor(speckle: Speckle, model: Model, id: string) {
    super(speckle, model);
    this.model = model;
    this.id = id;
  }

  protected async fetch(): Promise<VersionInfo> {
    const data = await this.speckle.http.request<
      { project: { model: { version: unknown } } },
      { projectId: string; modelId: string; versionId: string }
    >(VERSION_QUERY, {
      projectId: this.model.project.id,
      modelId: this.model.id,
      versionId: this.id,
    });
    return parseOrThrow("Version", VersionInfoSchema, data.project.model.version);
  }
}
