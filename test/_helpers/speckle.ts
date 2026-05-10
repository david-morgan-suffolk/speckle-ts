import { Speckle } from "../../src/client.js";
import {
  makeGraphQLFetch,
  type GraphQLHandler,
  type RecordedCall,
} from "./graphql.js";
import { WsController, makeMockWebSocketImpl } from "./ws.js";
import type { SpeckleHooks } from "../../src/transport/hooks.js";

export interface MockSpeckleOptions {
  server?: string;
  token?: string;
  unhandled?: "throw" | "empty";
  hooks?: SpeckleHooks;
}

export interface MockSpeckle {
  sk: Speckle;
  calls: RecordedCall[];
  callsFor: (operationName: string) => RecordedCall[];
}

export interface MockSpeckleWithWs extends MockSpeckle {
  ws: WsController;
}

function buildHttp(
  handlers: Record<string, GraphQLHandler>,
  opts: MockSpeckleOptions,
): { fetch: typeof fetch; calls: RecordedCall[] } {
  return makeGraphQLFetch(handlers, {
    ...(opts.unhandled !== undefined ? { unhandled: opts.unhandled } : {}),
  });
}

export function mockSpeckle(
  handlers: Record<string, GraphQLHandler>,
  opts: MockSpeckleOptions = {},
): MockSpeckle {
  const { fetch, calls } = buildHttp(handlers, opts);
  const sk = new Speckle({
    server: opts.server ?? "https://app.speckle.systems",
    token: opts.token ?? "test-token",
    fetch,
    ...(opts.hooks ? { hooks: opts.hooks } : {}),
  });
  return {
    sk,
    calls,
    callsFor: (operationName: string) =>
      calls.filter((c) => c.operationName === operationName),
  };
}

export function mockSpeckleWithWs(
  handlers: Record<string, GraphQLHandler> = {},
  opts: MockSpeckleOptions = {},
): MockSpeckleWithWs {
  const { fetch, calls } = buildHttp(handlers, opts);
  const ws = new WsController();
  const webSocketImpl = makeMockWebSocketImpl(ws);
  const sk = new Speckle({
    server: opts.server ?? "https://app.speckle.systems",
    token: opts.token ?? "test-token",
    fetch,
    webSocketImpl,
    ...(opts.hooks ? { hooks: opts.hooks } : {}),
  });
  return {
    sk,
    calls,
    callsFor: (operationName: string) =>
      calls.filter((c) => c.operationName === operationName),
    ws,
  };
}
