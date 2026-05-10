import type { GraphQLHandler } from "../graphql.js";
import type { VersionInfo } from "../../../src/types.js";
import type { PageEnvelope } from "./project.js";

export const versionFixture = (
  id: string,
  overrides: Partial<VersionInfo> = {},
): VersionInfo => ({
  id,
  message: null,
  sourceApplication: "rhino",
  referencedObject: `obj_${id}`,
  createdAt: "2026-04-01T00:00:00Z",
  authorUser: { id: "u1", name: "alice" },
  ...overrides,
});

export const modelVersionsHandler =
  (page: PageEnvelope<VersionInfo>): GraphQLHandler =>
  () => ({ project: { model: { versions: page } } });
