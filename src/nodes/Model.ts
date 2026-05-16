import { Node } from "./Node.js";
import { Version } from "./Version.js";
import { uploadFileToModel, type UploadFileToModelOptions } from "./FileImport.js";
import {
  receiveSpeckleObject,
  sendSpeckleObject,
  type ReceiveSpeckleObjectOptions,
  type ReceiveSpeckleObjectResult,
  type SendSpeckleObjectOptions,
  type SendSpeckleObjectResult,
  type SpeckleObjectHandle,
} from "../objects.js";
import { parseOrThrow } from "../transport/validate.js";
import { ModelInfoSchema, ModelVersionsPageSchema, VersionInfoSchema } from "../schemas.js";
import type { Project } from "./Project.js";
import type { Speckle } from "../client.js";
import type {
  FileImportJob,
  ModelInfo,
  PageInfo,
  PublishVersionInput,
  VersionInfo,
} from "../types.js";

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

const CREATE_VERSION_MUTATION = /* GraphQL */ `
  mutation CreateVersion($input: CreateVersionInput!) {
    versionMutations {
      create(input: $input) {
        id
        message
        sourceApplication
        referencedObject
        createdAt
        authorUser { id name }
      }
    }
  }
`;

const MODEL_VERSIONS_QUERY = /* GraphQL */ `
  query GetModelVersions($projectId: String!, $modelId: String!, $cursor: String, $limit: Int) {
    project(id: $projectId) {
      model(id: $modelId) {
        versions(cursor: $cursor, limit: $limit) {
          totalCount
          cursor
          items {
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
  }
`;

export interface ModelVersionsOptions {
  cursor?: string | null;
  limit?: number;
}

export interface ListAllModelVersionsOptions {
  pageSize?: number;
}

export type ModelObjectLoadOptions = Omit<
  ReceiveSpeckleObjectOptions,
  "projectId" | "modelId" | "versionId" | "objectId" | "refId"
>;

export type ModelObjectSendOptions = Omit<
  SendSpeckleObjectOptions,
  "projectId" | "modelId" | "handle"
>;

function versionsVariables(
  projectId: string,
  modelId: string,
  opts?: ModelVersionsOptions,
): Record<string, unknown> {
  const vars: Record<string, unknown> = { projectId, modelId };
  if (opts?.cursor !== undefined && opts.cursor !== null) vars["cursor"] = opts.cursor;
  if (opts?.limit !== undefined) vars["limit"] = opts.limit;
  return vars;
}

export async function listModelVersions(
  speckle: Speckle,
  projectId: string,
  modelId: string,
  opts?: ModelVersionsOptions,
): Promise<PageInfo<VersionInfo>> {
  const data = await speckle.http.request<
    { project: { model: { versions: unknown } } },
    Record<string, unknown>
  >(MODEL_VERSIONS_QUERY, versionsVariables(projectId, modelId, opts));
  return parseOrThrow(
    "ModelVersions",
    ModelVersionsPageSchema,
    data.project.model.versions,
  );
}

export async function* iterateModelVersions(
  speckle: Speckle,
  projectId: string,
  modelId: string,
  opts?: ListAllModelVersionsOptions,
): AsyncIterable<VersionInfo> {
  let cursor: string | null | undefined = undefined;
  while (true) {
    const page = await listModelVersions(speckle, projectId, modelId, {
      ...(cursor !== undefined ? { cursor } : {}),
      ...(opts?.pageSize !== undefined ? { limit: opts.pageSize } : {}),
    });
    for (const item of page.items) yield item;
    if (!page.cursor) break;
    cursor = page.cursor;
  }
}

export async function publishVersion(
  speckle: Speckle,
  projectId: string,
  modelId: string,
  input: PublishVersionInput,
): Promise<VersionInfo> {
  const data = await speckle.http.request<
    { versionMutations: { create: unknown } },
    { input: PublishVersionInput & { projectId: string; modelId: string } }
  >(CREATE_VERSION_MUTATION, {
    input: { projectId, modelId, ...input },
  });
  return parseOrThrow("CreateVersion", VersionInfoSchema, data.versionMutations.create);
}

export async function listAllModelVersions(
  speckle: Speckle,
  projectId: string,
  modelId: string,
  opts?: ListAllModelVersionsOptions,
): Promise<VersionInfo[]> {
  const items: VersionInfo[] = [];
  for await (const item of iterateModelVersions(speckle, projectId, modelId, opts)) {
    items.push(item);
  }
  return items;
}

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

  listVersions(opts?: ModelVersionsOptions): Promise<PageInfo<VersionInfo>> {
    return listModelVersions(this.speckle, this.project.id, this.id, opts);
  }

  listAllVersions(opts?: ListAllModelVersionsOptions): Promise<VersionInfo[]> {
    return listAllModelVersions(this.speckle, this.project.id, this.id, opts);
  }

  versions(opts?: ListAllModelVersionsOptions): AsyncIterable<VersionInfo> {
    return iterateModelVersions(this.speckle, this.project.id, this.id, opts);
  }

  async publish(input: PublishVersionInput): Promise<Version> {
    const created = await publishVersion(this.speckle, this.project.id, this.id, input);
    return new Version(this.speckle, this, created.id);
  }

  loadLatestObject(opts?: ModelObjectLoadOptions): Promise<ReceiveSpeckleObjectResult> {
    return receiveSpeckleObject(this.speckle, {
      ...opts,
      projectId: this.project.id,
      modelId: this.id,
    });
  }

  loadVersionObject(
    versionId: string,
    opts?: ModelObjectLoadOptions,
  ): Promise<ReceiveSpeckleObjectResult> {
    return receiveSpeckleObject(this.speckle, {
      ...opts,
      projectId: this.project.id,
      modelId: this.id,
      versionId,
    });
  }

  loadObject(
    objectId: string,
    opts?: ModelObjectLoadOptions,
  ): Promise<ReceiveSpeckleObjectResult> {
    return receiveSpeckleObject(this.speckle, {
      ...opts,
      projectId: this.project.id,
      modelId: this.id,
      objectId,
    });
  }

  sendObject(
    handle: SpeckleObjectHandle,
    opts?: ModelObjectSendOptions,
  ): Promise<SendSpeckleObjectResult> {
    return sendSpeckleObject(this.speckle, {
      ...opts,
      projectId: this.project.id,
      modelId: this.id,
      handle,
    });
  }

  uploadFile(opts: UploadFileToModelOptions): Promise<FileImportJob> {
    return uploadFileToModel(this.speckle, this.project.id, this.id, opts);
  }

  protected async fetch(): Promise<ModelInfo> {
    const data = await this.speckle.http.request<
      { project: { model: unknown } },
      { projectId: string; modelId: string }
    >(MODEL_QUERY, { projectId: this.project.id, modelId: this.id });
    return parseOrThrow("Model", ModelInfoSchema, data.project.model);
  }
}
