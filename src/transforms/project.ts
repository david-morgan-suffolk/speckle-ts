import type { ProjectInfo } from "../types.js";

export function partitionByVisibility(
  projects: ReadonlyArray<ProjectInfo>,
): { readonly public: ReadonlyArray<ProjectInfo>; readonly private: ReadonlyArray<ProjectInfo> } {
  const pub: ProjectInfo[] = [];
  const priv: ProjectInfo[] = [];
  for (const p of projects) {
    (p.visibility === "PUBLIC" ? pub : priv).push(p);
  }
  return { public: pub, private: priv };
}

export function byWorkspace(
  projects: ReadonlyArray<ProjectInfo>,
): Record<string, ReadonlyArray<ProjectInfo>> {
  const out: Record<string, ProjectInfo[]> = {};
  for (const p of projects) {
    const key = p.workspaceId ?? "personal";
    (out[key] ??= []).push(p);
  }
  return out;
}
