import { parseOrThrow } from "../transport/validate.js";
import {
  FileImportJobSchema,
  UploadUrlSchema,
} from "../schemas.js";
import { SpeckleTransportError } from "../transport/errors.js";
import { z } from "zod";
import type { Speckle } from "../client.js";
import type {
  FileImportConvertedStatus,
  FileImportJob,
  UploadFileInput,
  UploadUrl,
} from "../types.js";

const FILE_IMPORT_FIELDS = /* GraphQL */ `
  id
  projectId
  modelId
  modelName
  fileName
  fileType
  fileSize
  convertedStatus
  convertedMessage
  convertedCommitId
  convertedVersionId
  uploadComplete
  uploadDate
  updatedAt
  userId
`;

const GENERATE_UPLOAD_URL_MUTATION = /* GraphQL */ `
  mutation StartFileImport($input: GenerateFileUploadUrlInput!) {
    fileUploadMutations {
      generateUploadUrl(input: $input) {
        url
        fileId
        additionalRequestHeaders {
          header
          value
        }
      }
    }
  }
`;

const FINALIZE_FILE_IMPORT_MUTATION = /* GraphQL */ `
  mutation FinalizeFileImport($input: StartFileImportInput!) {
    fileUploadMutations {
      startFileImport(input: $input) {
        ${FILE_IMPORT_FIELDS}
      }
    }
  }
`;

const LIST_PENDING_IMPORTS_QUERY = /* GraphQL */ `
  query ListProjectFileImports($projectId: String!) {
    project(id: $projectId) {
      pendingImportedModels {
        ${FILE_IMPORT_FIELDS}
      }
    }
  }
`;

export function convertedStatusToString(code: number): FileImportConvertedStatus {
  switch (code) {
    case 0:
      return "queued";
    case 1:
      return "processing";
    case 2:
      return "success";
    case 3:
      return "error";
    default:
      return "queued";
  }
}

export async function generateUploadUrl(
  speckle: Speckle,
  projectId: string,
  fileName: string,
): Promise<UploadUrl> {
  const data = await speckle.http.request<
    { fileUploadMutations: { generateUploadUrl: unknown } },
    { input: { projectId: string; fileName: string } }
  >(GENERATE_UPLOAD_URL_MUTATION, { input: { projectId, fileName } });
  return parseOrThrow(
    "GenerateUploadUrl",
    UploadUrlSchema,
    data.fileUploadMutations.generateUploadUrl,
  );
}

export interface FinalizeFileImportInput {
  fileId: string;
  modelId: string;
  etag: string;
}

export async function finalizeFileImport(
  speckle: Speckle,
  projectId: string,
  input: FinalizeFileImportInput,
): Promise<FileImportJob> {
  const data = await speckle.http.request<
    { fileUploadMutations: { startFileImport: unknown } },
    {
      input: FinalizeFileImportInput & { projectId: string };
    }
  >(FINALIZE_FILE_IMPORT_MUTATION, {
    input: { projectId, ...input },
  });
  return parseOrThrow(
    "FinalizeFileImport",
    FileImportJobSchema,
    data.fileUploadMutations.startFileImport,
  );
}

export async function listPendingFileImports(
  speckle: Speckle,
  projectId: string,
): Promise<FileImportJob[]> {
  const data = await speckle.http.request<
    { project: { pendingImportedModels: unknown[] } | null },
    { projectId: string }
  >(LIST_PENDING_IMPORTS_QUERY, { projectId });
  if (!data.project) {
    throw new SpeckleTransportError(`Project not found: ${projectId}`);
  }
  return parseOrThrow(
    "PendingFileImports",
    z.array(FileImportJobSchema),
    data.project.pendingImportedModels,
  );
}

export interface PutBlobOptions {
  url: string;
  body: BodyInit;
  headers: Record<string, string>;
  fetch?: typeof fetch;
  signal?: AbortSignal;
}

export interface PutBlobResult {
  etag: string;
  status: number;
}

function stripQuotes(s: string): string {
  return s.replace(/^"+|"+$/g, "");
}

export async function putBlob(opts: PutBlobOptions): Promise<PutBlobResult> {
  const fetchFn = opts.fetch ?? fetch;
  const res = await fetchFn(opts.url, {
    method: "PUT",
    headers: opts.headers,
    body: opts.body,
    ...(opts.signal ? { signal: opts.signal } : {}),
  });
  if (!res.ok) {
    throw new SpeckleTransportError(
      `Blob upload failed: ${res.status} ${res.statusText}`,
      { status: res.status },
    );
  }
  const rawEtag = res.headers.get("etag") ?? res.headers.get("ETag") ?? "";
  if (!rawEtag) {
    throw new SpeckleTransportError(
      "Blob upload succeeded but server returned no ETag header",
      { status: res.status },
    );
  }
  return { etag: stripQuotes(rawEtag), status: res.status };
}

export interface UploadFileToModelOptions extends UploadFileInput {
  /** Override the fetch used for the blob PUT. Defaults to the global fetch. */
  uploadFetch?: typeof fetch;
  signal?: AbortSignal;
}

export async function uploadFileToModel(
  speckle: Speckle,
  projectId: string,
  modelId: string,
  opts: UploadFileToModelOptions,
): Promise<FileImportJob> {
  const upload = await generateUploadUrl(speckle, projectId, opts.fileName);
  const headers: Record<string, string> = {};
  for (const h of upload.additionalRequestHeaders) headers[h.header] = h.value;
  const { etag } = await putBlob({
    url: upload.url,
    body: opts.data as BodyInit,
    headers,
    ...(opts.uploadFetch ? { fetch: opts.uploadFetch } : {}),
    ...(opts.signal ? { signal: opts.signal } : {}),
  });
  return finalizeFileImport(speckle, projectId, {
    fileId: upload.fileId,
    modelId,
    etag,
  });
}
