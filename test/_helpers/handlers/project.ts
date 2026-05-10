import type { GraphQLHandler } from "../graphql.js";
import type { ModelsTreeItem, ProjectInfo } from "../../../src/types.js";

export interface PageEnvelope<T> {
  totalCount: number;
  cursor: string | null;
  items: ReadonlyArray<T>;
}

export const projectInfoFixture = (overrides: Partial<ProjectInfo> = {}): ProjectInfo => ({
  id: "p1",
  name: "Demo",
  description: null,
  visibility: "PUBLIC",
  role: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  workspaceId: null,
  ...overrides,
});

export const modelsTreeItemFixture = (
  fullName: string,
  modelId: string | null,
  children: ModelsTreeItem[] = [],
): ModelsTreeItem => ({
  id: `t_${fullName}`,
  name: fullName.split("/").pop() ?? fullName,
  fullName,
  hasChildren: children.length > 0,
  updatedAt: "2026-01-01T00:00:00Z",
  model: modelId
    ? {
        id: modelId,
        name: fullName.split("/").pop() ?? fullName,
        description: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      }
    : null,
  children,
});

export const projectHandler =
  (project: ProjectInfo): GraphQLHandler =>
  () => ({ project });

export const projectModelsTreeHandler =
  (page: PageEnvelope<ModelsTreeItem>): GraphQLHandler =>
  () => ({ project: { modelsTree: page } });

export const modelChildrenTreeHandler =
  (children: ModelsTreeItem[]): GraphQLHandler =>
  () => ({ project: { modelChildrenTree: children } });
