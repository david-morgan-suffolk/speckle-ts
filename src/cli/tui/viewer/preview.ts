export interface PreviewTarget {
  streamId: string;
  versionId: string;
}

export async function fetchVersionPreview(
  server: string,
  token: string | undefined,
  target: PreviewTarget,
  signal?: AbortSignal,
): Promise<Buffer> {
  const url = new URL(
    `/preview/${encodeURIComponent(target.streamId)}/commits/${encodeURIComponent(target.versionId)}`,
    server,
  );
  const headers: Record<string, string> = { Accept: "image/png" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { headers, signal });
  if (!res.ok) {
    throw new Error(`preview fetch ${res.status} ${res.statusText} (${url})`);
  }
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}
