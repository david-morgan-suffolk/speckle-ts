import type { GraphQLHandler } from "../graphql.js";
import type { VersionInfo } from "../../../src/types.js";

export const createVersionHandler =
  (version: VersionInfo): GraphQLHandler =>
  () => ({ versionMutations: { create: version } });

export const updateVersionHandler =
  (version: VersionInfo): GraphQLHandler =>
  () => ({ versionMutations: { update: version } });

export const deleteVersionsHandler =
  (success = true): GraphQLHandler =>
  () => ({ versionMutations: { delete: success } });

export const markVersionReceivedHandler =
  (success = true): GraphQLHandler =>
  () => ({ versionMutations: { markReceived: success } });
