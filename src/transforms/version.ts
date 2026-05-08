import type { VersionInfo } from "../types.js";

export function sortByCreatedAtDesc(versions: ReadonlyArray<VersionInfo>): ReadonlyArray<VersionInfo> {
  return [...versions].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function groupBySourceApplication(
  versions: ReadonlyArray<VersionInfo>,
): Record<string, ReadonlyArray<VersionInfo>> {
  const out: Record<string, VersionInfo[]> = {};
  for (const v of versions) {
    const key = v.sourceApplication ?? "unknown";
    (out[key] ??= []).push(v);
  }
  return out;
}

export function authorIds(versions: ReadonlyArray<VersionInfo>): ReadonlyArray<string> {
  const seen = new Set<string>();
  for (const v of versions) if (v.authorUser?.id) seen.add(v.authorUser.id);
  return [...seen];
}
