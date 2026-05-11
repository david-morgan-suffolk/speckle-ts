export class SpeckleUrlError extends Error {
  override readonly name = "SpeckleUrlError";
}

export interface ModelRef {
  modelId: string;
  versionId?: string;
}

export interface ParsedSpeckleUrl {
  server: string;
  projectId: string;
  modelRefs: ModelRef[];
}

export interface BuildSpeckleUrlInput {
  server: string;
  projectId: string;
  modelRefs?: ReadonlyArray<ModelRef>;
}

export function parseResourceIdString(input: string): ModelRef[] {
  if (!input || input.trim().length === 0) return [];
  return input.split(",").map((piece) => {
    const trimmed = piece.trim();
    if (!trimmed) {
      throw new SpeckleUrlError(`Empty segment in resource id string: "${input}"`);
    }
    const parts = trimmed.split("@");
    if (parts.length > 2) {
      throw new SpeckleUrlError(`Invalid model ref "${trimmed}" — expected modelId or modelId@versionId`);
    }
    const modelId = parts[0];
    const versionId = parts[1];
    if (!modelId) {
      throw new SpeckleUrlError(`Missing modelId in "${trimmed}"`);
    }
    if (parts.length === 2 && !versionId) {
      throw new SpeckleUrlError(`Missing versionId after "@" in "${trimmed}"`);
    }
    return versionId ? { modelId, versionId } : { modelId };
  });
}

export function buildResourceIdString(refs: ReadonlyArray<ModelRef>): string {
  return refs
    .map((r) => (r.versionId ? `${r.modelId}@${r.versionId}` : r.modelId))
    .join(",");
}

export function parseSpeckleUrl(input: string): ParsedSpeckleUrl {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new SpeckleUrlError(`Invalid URL: ${input}`);
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const projectsIdx = segments.indexOf("projects");
  if (projectsIdx < 0 || !segments[projectsIdx + 1]) {
    throw new SpeckleUrlError(
      `URL does not contain /projects/{id}: ${input}`,
    );
  }
  const projectId = segments[projectsIdx + 1]!;
  const server = `${url.protocol}//${url.host}`;

  const modelsIdx = segments.indexOf("models", projectsIdx + 2);
  if (modelsIdx < 0) {
    return { server, projectId, modelRefs: [] };
  }
  const ref = segments[modelsIdx + 1];
  if (!ref) {
    return { server, projectId, modelRefs: [] };
  }
  return {
    server,
    projectId,
    modelRefs: parseResourceIdString(decodeURIComponent(ref)),
  };
}

export function buildSpeckleUrl(parts: BuildSpeckleUrlInput): string {
  const base = parts.server.replace(/\/$/, "");
  let path = `/projects/${encodeURIComponent(parts.projectId)}`;
  if (parts.modelRefs && parts.modelRefs.length > 0) {
    path += `/models/${buildResourceIdString(parts.modelRefs)}`;
  }
  return base + path;
}
