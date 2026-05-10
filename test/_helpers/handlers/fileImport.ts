import type { GraphQLHandler } from "../graphql.js";
import type { FileImportJob, UploadUrl } from "../../../src/types.js";

export const fileImportFixture = (
  overrides: Partial<FileImportJob> = {},
): FileImportJob => ({
  id: "fi_1",
  projectId: "p1",
  modelId: "m1",
  modelName: "main",
  fileName: "model.ifc",
  fileType: "ifc",
  fileSize: 1024,
  convertedStatus: 0,
  convertedMessage: null,
  convertedCommitId: null,
  convertedVersionId: null,
  uploadComplete: true,
  uploadDate: "2026-05-01T00:00:00Z",
  updatedAt: "2026-05-01T00:00:00Z",
  userId: "u_1",
  ...overrides,
});

export const uploadUrlFixture = (
  overrides: Partial<UploadUrl> = {},
): UploadUrl => ({
  url: "https://blob.example/upload-target",
  fileId: "blob_1",
  additionalRequestHeaders: [{ header: "x-amz-acl", value: "private" }],
  ...overrides,
});

export const generateUploadUrlHandler =
  (upload: UploadUrl): GraphQLHandler =>
  () => ({ fileUploadMutations: { generateUploadUrl: upload } });

export const finalizeFileImportHandler =
  (job: FileImportJob): GraphQLHandler =>
  () => ({ fileUploadMutations: { startFileImport: job } });

export const pendingFileImportsHandler =
  (jobs: FileImportJob[]): GraphQLHandler =>
  () => ({ project: { pendingImportedModels: jobs } });
