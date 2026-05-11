export interface ApqOptions {
  enabled: boolean;
}

interface ParsedRequest {
  query?: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

const NOT_FOUND_CODES = new Set([
  "PERSISTED_QUERY_NOT_FOUND",
  "PersistedQueryNotFound",
  "persisted_query_not_found",
]);

const NOT_SUPPORTED_CODES = new Set([
  "PERSISTED_QUERY_NOT_SUPPORTED",
  "PersistedQueryNotSupported",
  "persisted_query_not_supported",
]);

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  let hex = "";
  const view = new Uint8Array(digest);
  for (let i = 0; i < view.length; i++) {
    hex += view[i]!.toString(16).padStart(2, "0");
  }
  return hex;
}

const hashCache = new Map<string, string>();

async function cachedSha256(query: string): Promise<string> {
  const existing = hashCache.get(query);
  if (existing) return existing;
  const h = await sha256Hex(query);
  hashCache.set(query, h);
  return h;
}

export function wrapFetchWithApq(
  baseFetch: typeof fetch,
  opts: ApqOptions | undefined,
): typeof fetch {
  if (!opts || !opts.enabled) return baseFetch;
  let serverSupportsApq = true;

  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    if (!serverSupportsApq) return baseFetch(input, init);
    const body = init?.body;
    if (typeof body !== "string") return baseFetch(input, init);

    let parsed: ParsedRequest;
    try {
      parsed = JSON.parse(body) as ParsedRequest;
    } catch {
      return baseFetch(input, init);
    }
    if (!parsed.query) return baseFetch(input, init);

    const hash = await cachedSha256(parsed.query);

    const hashOnlyBody = JSON.stringify({
      ...(parsed.operationName ? { operationName: parsed.operationName } : {}),
      ...(parsed.variables ? { variables: parsed.variables } : {}),
      extensions: { persistedQuery: { version: 1, sha256Hash: hash } },
    });

    const first = await baseFetch(input, { ...init, body: hashOnlyBody });
    if (!first.ok) return first;

    const text = await first.clone().text();
    let json: { errors?: Array<{ message?: string; extensions?: { code?: string } }> };
    try {
      json = JSON.parse(text);
    } catch {
      return first;
    }

    const errs = json.errors ?? [];
    if (errs.length === 0) return first;

    const codes = errs.flatMap((e) =>
      [e.extensions?.code, e.message].filter((c): c is string => Boolean(c)),
    );

    if (codes.some((c) => NOT_SUPPORTED_CODES.has(c))) {
      serverSupportsApq = false;
      return baseFetch(input, init);
    }

    if (codes.some((c) => NOT_FOUND_CODES.has(c))) {
      const fullBody = JSON.stringify({
        ...parsed,
        extensions: { persistedQuery: { version: 1, sha256Hash: hash } },
      });
      return baseFetch(input, { ...init, body: fullBody });
    }

    return first;
  }) as unknown as typeof fetch;
}
