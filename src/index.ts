export { Speckle } from "./client.js";
export type { SpeckleOptions } from "./client.js";

export { Node } from "./nodes/Node.js";
export { Project } from "./nodes/Project.js";
export { Model } from "./nodes/Model.js";
export { Version } from "./nodes/Version.js";
export { User } from "./nodes/User.js";
export { Workspace } from "./nodes/Workspace.js";

export type {
  ProjectInfo,
  ModelInfo,
  VersionInfo,
  UserInfo,
  WorkspaceInfo,
  PageInfo,
} from "./types.js";

export { SpeckleGraphQLError, SpeckleTransportError } from "./transport/errors.js";
export type { GraphQLErrorPayload } from "./transport/errors.js";

export * as transforms from "./transforms/index.js";

export { getSdk } from "./generated/sdk.js";
export type { Sdk } from "./generated/sdk.js";
