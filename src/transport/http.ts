import { GraphQLClient } from "graphql-request";
import { SpeckleTransportError } from "./errors.js";
import { bearer } from "./auth.js";

export interface HttpClientOptions {
  endpoint: string;
  token?: string | undefined;
  headers?: Record<string, string>;
  fetch?: typeof fetch;
}

export type HttpClient = GraphQLClient;

export function createHttpClient(opts: HttpClientOptions): HttpClient {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(opts.headers ?? {}),
  };
  const auth = bearer(opts.token);
  if (auth) headers["authorization"] = auth;

  try {
    return new GraphQLClient(opts.endpoint, {
      headers,
      fetch: opts.fetch ?? fetch,
    });
  } catch (cause) {
    throw new SpeckleTransportError("Failed to create HTTP client", { cause });
  }
}
