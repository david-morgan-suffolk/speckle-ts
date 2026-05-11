import { SubscriptionClient } from "subscriptions-transport-ws";
import { SpeckleGraphQLError, SpeckleTransportError } from "./errors.js";
import { bearer } from "./auth.js";
import { operationNameFromQuery, safeFire, type SpeckleHooks } from "./hooks.js";

export interface WsClientOptions {
  endpoint: string;
  token?: string | undefined;
  webSocketImpl?: unknown;
}

export type WsClient = SubscriptionClient;

export interface WsLifecycleEvents {
  onConnecting(cb: () => void): () => void;
  onConnected(cb: () => void): () => void;
  onReconnecting(cb: () => void): () => void;
  onReconnected(cb: () => void): () => void;
  onDisconnected(cb: () => void): () => void;
  onError(cb: (err: unknown) => void): () => void;
}

export function lifecycleEvents(client: WsClient): WsLifecycleEvents {
  return {
    onConnecting: (cb) => client.onConnecting(cb) as () => void,
    onConnected: (cb) => client.onConnected(cb) as () => void,
    onReconnecting: (cb) => client.onReconnecting(cb) as () => void,
    onReconnected: (cb) => client.onReconnected(cb) as () => void,
    onDisconnected: (cb) => client.onDisconnected(cb) as () => void,
    onError: (cb) => client.onError((err: unknown) => cb(err)) as () => void,
  };
}

export function createWsClient(opts: WsClientOptions): WsClient {
  const auth = bearer(opts.token);
  const params = auth ? { Authorization: auth, headers: { Authorization: auth } } : {};
  const Impl = (opts.webSocketImpl ?? globalThis.WebSocket) as unknown as new (
    url: string,
    protocols?: string | string[],
  ) => WebSocket;

  return new SubscriptionClient(
    opts.endpoint,
    {
      reconnect: true,
      lazy: true,
      connectionParams: params,
    },
    Impl as never,
  );
}

export interface SubscribeOptions<TVars> {
  query: string;
  variables?: TVars;
}

export function subscribe<TData, TVars = Record<string, unknown>>(
  client: WsClient,
  opts: SubscribeOptions<TVars>,
  onNext: (data: TData) => void,
  onError?: (err: unknown) => void,
  hooks?: SpeckleHooks,
): () => void {
  const observable = client.request({
    query: opts.query,
    ...(opts.variables ? { variables: opts.variables as Record<string, unknown> } : {}),
  });

  const operationName = operationNameFromQuery(opts.query);
  const variables = (opts.variables as Record<string, unknown> | undefined) ?? {};
  safeFire(hooks?.onSubscriptionEvent, {
    operationName,
    variables,
    kind: "started",
  });

  const subscription = observable.subscribe({
    next: (msg) => {
      if (msg.errors?.length) {
        const err = new SpeckleGraphQLError(msg.errors as never, opts.query);
        safeFire(hooks?.onSubscriptionEvent, {
          operationName,
          variables,
          kind: "error",
          payload: err,
        });
        onError?.(err);
        return;
      }
      if (msg.data) {
        safeFire(hooks?.onSubscriptionEvent, {
          operationName,
          variables,
          kind: "data",
          payload: msg.data,
        });
        onNext(msg.data as TData);
      }
    },
    error: (err) => {
      const wrapped = new SpeckleTransportError("WS subscription error", { cause: err });
      safeFire(hooks?.onSubscriptionEvent, {
        operationName,
        variables,
        kind: "error",
        payload: wrapped,
      });
      onError?.(wrapped);
    },
    complete: () => {
      safeFire(hooks?.onSubscriptionEvent, {
        operationName,
        variables,
        kind: "complete",
      });
    },
  });

  return () => subscription.unsubscribe();
}

export async function disposeWsClient(client: WsClient): Promise<void> {
  client.close();
}
