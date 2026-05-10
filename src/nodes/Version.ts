import { Node } from "./Node.js";
import { parseOrThrow } from "../transport/validate.js";
import { VersionInfoSchema } from "../schemas.js";
import type { Model } from "./Model.js";
import type { Speckle } from "../client.js";
import type {
  MarkVersionReceivedInput,
  UpdateVersionPatch,
  VersionInfo,
} from "../types.js";

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

const VERSION_FIELDS_FRAGMENT = /* GraphQL */ `
  id
  message
  sourceApplication
  referencedObject
  createdAt
  authorUser { id name }
`;

const UPDATE_VERSION_MUTATION = /* GraphQL */ `
  mutation UpdateVersion($input: UpdateVersionInput!) {
    versionMutations {
      update(input: $input) { ${VERSION_FIELDS_FRAGMENT} }
    }
  }
`;

const DELETE_VERSIONS_MUTATION = /* GraphQL */ `
  mutation DeleteVersions($input: DeleteVersionsInput!) {
    versionMutations {
      delete(input: $input)
    }
  }
`;

const MARK_VERSION_RECEIVED_MUTATION = /* GraphQL */ `
  mutation MarkVersionReceived($input: MarkReceivedVersionInput!) {
    versionMutations {
      markReceived(input: $input)
    }
  }
`;

export async function updateVersion(
  speckle: Speckle,
  projectId: string,
  versionId: string,
  patch: UpdateVersionPatch,
): Promise<VersionInfo> {
  const data = await speckle.http.request<
    { versionMutations: { update: unknown } },
    { input: UpdateVersionPatch & { projectId: string; versionId: string } }
  >(UPDATE_VERSION_MUTATION, {
    input: { projectId, versionId, ...patch },
  });
  return parseOrThrow("UpdateVersion", VersionInfoSchema, data.versionMutations.update);
}

export async function deleteVersions(
  speckle: Speckle,
  projectId: string,
  versionIds: ReadonlyArray<string>,
): Promise<boolean> {
  const data = await speckle.http.request<
    { versionMutations: { delete: boolean } },
    { input: { projectId: string; versionIds: ReadonlyArray<string> } }
  >(DELETE_VERSIONS_MUTATION, { input: { projectId, versionIds } });
  return data.versionMutations.delete;
}

export async function markVersionReceived(
  speckle: Speckle,
  projectId: string,
  versionId: string,
  input: MarkVersionReceivedInput,
): Promise<boolean> {
  const data = await speckle.http.request<
    { versionMutations: { markReceived: boolean } },
    {
      input: MarkVersionReceivedInput & {
        projectId: string;
        versionId: string;
      };
    }
  >(MARK_VERSION_RECEIVED_MUTATION, {
    input: { projectId, versionId, ...input },
  });
  return data.versionMutations.markReceived;
}

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

  update(patch: UpdateVersionPatch): Promise<VersionInfo> {
    return updateVersion(this.speckle, this.model.project.id, this.id, patch);
  }

  delete(): Promise<boolean> {
    return deleteVersions(this.speckle, this.model.project.id, [this.id]);
  }

  markReceived(input: MarkVersionReceivedInput): Promise<boolean> {
    return markVersionReceived(this.speckle, this.model.project.id, this.id, input);
  }
}
