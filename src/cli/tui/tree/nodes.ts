import type { ModelsTreeItem, VersionInfo } from "@/types.js";

export interface ProjectRow {
  id: string;
  name: string;
  visibility: string;
  role: string | null;
  updatedAt: string;
}

export interface ProjectNode {
  kind: "project";
  id: string;
  data: ProjectRow;
  children: TreeNode[] | undefined;
}

export interface ModelNode {
  kind: "model";
  id: string;
  fullName: string;
  data: ModelsTreeItem;
  children: TreeNode[] | undefined;
}

export interface VersionNode {
  kind: "version";
  id: string;
  data: VersionInfo;
}

export type TreeNode = ProjectNode | ModelNode | VersionNode;

export interface FlatRow {
  node: TreeNode;
  depth: number;
  parentProjectId: string;
  hasChildren: boolean;
  expanded: boolean;
}

export function modelTreeItemHasChildren(item: ModelsTreeItem): boolean {
  return item.hasChildren || item.children.length > 0 || item.model !== null;
}

export function projectNode(p: ProjectRow): ProjectNode {
  return { kind: "project", id: `p:${p.id}`, data: p, children: undefined };
}

export function modelNode(item: ModelsTreeItem): ModelNode {
  const children: TreeNode[] | undefined =
    item.children.length > 0 ? item.children.map(modelNode) : undefined;
  return {
    kind: "model",
    id: `m:${item.fullName}`,
    fullName: item.fullName,
    data: item,
    children,
  };
}

export function versionNode(v: VersionInfo, projectId: string, modelId: string): VersionNode {
  return { kind: "version", id: `v:${projectId}:${modelId}:${v.id}`, data: v };
}

export function flatten(
  roots: TreeNode[],
  expanded: ReadonlySet<string>,
): FlatRow[] {
  const out: FlatRow[] = [];
  for (const root of roots) {
    if (root.kind !== "project") continue;
    walk(root, root.data.id, 0, expanded, out);
  }
  return out;
}

function walk(
  node: TreeNode,
  parentProjectId: string,
  depth: number,
  expanded: ReadonlySet<string>,
  out: FlatRow[],
): void {
  const hasChildren = nodeHasChildren(node);
  const isExpanded = hasChildren && expanded.has(node.id);
  out.push({ node, depth, parentProjectId, hasChildren, expanded: isExpanded });
  if (!isExpanded) return;
  if (node.kind === "version") return;
  const children = node.children;
  if (!children) return;
  for (const child of children) {
    walk(child, parentProjectId, depth + 1, expanded, out);
  }
}

export function nodeHasChildren(node: TreeNode): boolean {
  if (node.kind === "version") return false;
  if (node.kind === "project") return true;
  if (node.children && node.children.length > 0) return true;
  return node.data.hasChildren || node.data.model !== null;
}

export function findRowIndex(rows: FlatRow[], id: string): number {
  return rows.findIndex((r) => r.node.id === id);
}
