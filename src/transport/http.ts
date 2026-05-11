import { GraphQLClient } from "graphql-request";
import { SpeckleTransportError } from "./errors.js";
import { bearer } from "./auth.js";
import { wrapFetchWithHooks, type SpeckleHooks } from "./hooks.js";
import { wrapFetchWithApq, type ApqOptions } from "./apq.js";

export interface HttpClientOptions {
  endpoint: string;
  token?: string | undefined;
  headers?: Record<string, string>;
  fetch?: typeof fetch;
  hooks?: SpeckleHooks;
  apq?: ApqOptions;
}

export type HttpClient = GraphQLClient;

export function createHttpClient(opts: HttpClientOptions): HttpClient {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(opts.headers ?? {}),
  };
  const auth = bearer(opts.token);
  if (auth) headers["authorization"] = auth;

  const baseFetch = opts.fetch ?? fetch;
  const withApq = wrapFetchWithApq(baseFetch, opts.apq);
  const wrapped = wrapFetchWithHooks(withApq, opts.hooks);

  try {
    return new GraphQLClient(opts.endpoint, {
      headers,
      fetch: wrapped,
    });
  } catch (cause) {
    throw new SpeckleTransportError("Failed to create HTTP client", { cause });
  }
}
