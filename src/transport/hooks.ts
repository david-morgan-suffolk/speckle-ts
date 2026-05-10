export interface RequestEvent {
  operationName: string;
  variables: Record<string, unknown>;
  startedAt: number;
}

export interface ResponseEvent {
  operationName: string;
  variables: Record<string, unknown>;
  durationMs: number;
  status: number;
}

export interface ErrorEvent {
  operationName: string;
  variables: Record<string, unknown>;
  durationMs: number;
  error: unknown;
}

export type SubscriptionEventKind = "started" | "data" | "error" | "complete";

export interface SubscriptionEvent {
  operationName: string;
  variables: Record<string, unknown>;
  kind: SubscriptionEventKind;
  payload?: unknown;
}

export interface SpeckleHooks {
  /** Fires before each HTTP request (transport layer). */
  onRequest?: (event: RequestEvent) => void;
  /** Fires after a successful HTTP response — including GraphQL-error responses (status 200 with errors). */
  onResponse?: (event: ResponseEvent) => void;
  /** Fires only on transport-level failures (network down, abort, etc). GraphQL errors do not trigger this. */
  onError?: (event: ErrorEvent) => void;
  /** Fires on subscription lifecycle: started, each data event, errors, complete. */
  onSubscriptionEvent?: (event: SubscriptionEvent) => void;
}

const OP_NAME_RE = /(?:query|mutation|subscription)\s+(\w+)/;

interface ParsedOperation {
  operationName: string;
  variables: Record<string, unknown>;
}

function parseOperation(body: BodyInit | null | undefined): ParsedOperation {
  if (typeof body !== "string") return { operationName: "Unknown", variables: {} };
  try {
    const parsed = JSON.parse(body) as {
      operationName?: string;
      query?: string;
      variables?: Record<string, unknown>;
    };
    const operationName =
      parsed.operationName ??
      parsed.query?.match(OP_NAME_RE)?.[1] ??
      "Unknown";
    return { operationName, variables: parsed.variables ?? {} };
  } catch {
    return { operationName: "Unknown", variables: {} };
  }
}

function safeFire<T>(cb: ((e: T) => void) | undefined, event: T): void {
  if (!cb) return;
  try {
    cb(event);
  } catch {
    // Swallow hook errors — observability must never break the request path.
  }
}

export function wrapFetchWithHooks(
  baseFetch: typeof fetch,
  hooks: SpeckleHooks | undefined,
): typeof fetch {
  if (!hooks || (!hooks.onRequest && !hooks.onResponse && !hooks.onError)) {
    return baseFetch;
  }
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const op = parseOperation(init?.body ?? null);
    const start =
      typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
    safeFire(hooks.onRequest, {
      operationName: op.operationName,
      variables: op.variables,
      startedAt: Date.now(),
    });
    try {
      const res = await baseFetch(input, init);
      const durationMs =
        (typeof performance !== "undefined" && performance.now ? performance.now() : Date.now()) -
        start;
      safeFire(hooks.onResponse, {
        operationName: op.operationName,
        variables: op.variables,
        durationMs,
        status: res.status,
      });
      return res;
    } catch (err) {
      const durationMs =
        (typeof performance !== "undefined" && performance.now ? performance.now() : Date.now()) -
        start;
      safeFire(hooks.onError, {
        operationName: op.operationName,
        variables: op.variables,
        durationMs,
        error: err,
      });
      throw err;
    }
  }) as unknown as typeof fetch;
}

export function operationNameFromQuery(query: string): string {
  return query.match(OP_NAME_RE)?.[1] ?? "Unknown";
}

export { safeFire };
