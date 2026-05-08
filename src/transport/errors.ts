export interface GraphQLErrorPayload {
  message: string;
  path?: ReadonlyArray<string | number>;
  extensions?: Record<string, unknown>;
}

export class SpeckleGraphQLError extends Error {
  override readonly name = "SpeckleGraphQLError";
  readonly errors: ReadonlyArray<GraphQLErrorPayload>;
  readonly query: string | undefined;

  constructor(errors: ReadonlyArray<GraphQLErrorPayload>, query?: string) {
    super(errors.map((e) => e.message).join("; ") || "GraphQL error");
    this.errors = errors;
    this.query = query;
  }
}

export class SpeckleTransportError extends Error {
  override readonly name = "SpeckleTransportError";
  readonly status: number | undefined;
  override readonly cause: unknown;

  constructor(message: string, opts: { status?: number; cause?: unknown } = {}) {
    super(message);
    this.status = opts.status;
    this.cause = opts.cause;
  }
}
