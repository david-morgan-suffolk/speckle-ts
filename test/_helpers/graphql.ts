export interface GraphQLRequestBody {
  query: string;
  variables: Record<string, unknown>;
  operationName?: string;
}

export interface RecordedCall {
  operationName: string;
  variables: Record<string, unknown>;
}

export interface GraphQLError {
  message: string;
  path?: ReadonlyArray<string | number>;
  extensions?: Record<string, unknown>;
}

const ERROR_MARK = Symbol.for("@suffolk/speckle.test.gqlError");
const HTTP_ERROR_MARK = Symbol.for("@suffolk/speckle.test.httpError");

interface MarkedErrors {
  [ERROR_MARK]: true;
  errors: ReadonlyArray<GraphQLError>;
}

interface MarkedHttpError {
  [HTTP_ERROR_MARK]: true;
  status: number;
  body: unknown;
}

export function gqlError(...errors: GraphQLError[]): MarkedErrors {
  return { [ERROR_MARK]: true, errors };
}

export function httpError(status: number, body: unknown = {}): MarkedHttpError {
  return { [HTTP_ERROR_MARK]: true, status, body };
}

export type GraphQLHandler = (
  req: GraphQLRequestBody,
) => unknown | Promise<unknown>;

export interface MockFetchOptions {
  unhandled?: "throw" | "empty";
  onCall?: (call: RecordedCall) => void;
}

export interface MockFetchResult {
  fetch: typeof fetch;
  calls: RecordedCall[];
}

const OP_NAME_RE = /(?:query|mutation|subscription)\s+(\w+)/;

function parseOperationName(body: GraphQLRequestBody): string {
  if (body.operationName) return body.operationName;
  const m = body.query.match(OP_NAME_RE);
  return m?.[1] ?? "Unknown";
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function makeGraphQLFetch(
  handlers: Record<string, GraphQLHandler>,
  opts: MockFetchOptions = {},
): MockFetchResult {
  const calls: RecordedCall[] = [];
  const fetchFn = (async (_url: unknown, init?: RequestInit) => {
    const raw = (init?.body as string | undefined) ?? "{}";
    const body = JSON.parse(raw) as GraphQLRequestBody;
    const operationName = parseOperationName(body);
    const variables = body.variables ?? {};
    const call: RecordedCall = { operationName, variables };
    calls.push(call);
    opts.onCall?.(call);

    const handler = handlers[operationName];
    if (!handler) {
      if (opts.unhandled === "empty") return jsonResponse({ data: {} });
      throw new Error(
        `mockGraphQL: no handler for "${operationName}". Variables: ${JSON.stringify(variables)}`,
      );
    }

    const result = await handler(body);
    if (isMarkedHttpError(result)) {
      return jsonResponse(result.body, result.status);
    }
    if (isMarkedErrors(result)) {
      return jsonResponse({ data: null, errors: result.errors });
    }
    return jsonResponse({ data: result });
  }) as unknown as typeof fetch;

  return { fetch: fetchFn, calls };
}

function isMarkedErrors(x: unknown): x is MarkedErrors {
  return typeof x === "object" && x !== null && (x as MarkedErrors)[ERROR_MARK] === true;
}

function isMarkedHttpError(x: unknown): x is MarkedHttpError {
  return typeof x === "object" && x !== null && (x as MarkedHttpError)[HTTP_ERROR_MARK] === true;
}

export function paged<T>(pages: ReadonlyArray<T>): GraphQLHandler {
  let i = 0;
  return () => {
    if (i >= pages.length) {
      throw new Error(`paged: exhausted after ${pages.length} pages`);
    }
    return pages[i++];
  };
}

export function sequence(handlers: ReadonlyArray<GraphQLHandler>): GraphQLHandler {
  let i = 0;
  return (req) => {
    if (i >= handlers.length) {
      throw new Error(`sequence: exhausted after ${handlers.length} calls`);
    }
    return handlers[i++]!(req);
  };
}

export function once<T>(value: T): GraphQLHandler {
  let used = false;
  return () => {
    if (used) throw new Error("once: handler invoked more than once");
    used = true;
    return value;
  };
}
