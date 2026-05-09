import { SubscriptionClient } from "subscriptions-transport-ws";
import { SpeckleGraphQLError, SpeckleTransportError } from "./errors.js";
import { bearer } from "./auth.js";

export interface WsClientOptions {
  endpoint: string;
  token?: string | undefined;
  webSocketImpl?: unknown;
}

export type WsClient = SubscriptionClient;

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
): () => void {
  const observable = client.request({
    query: opts.query,
    ...(opts.variables ? { variables: opts.variables as Record<string, unknown> } : {}),
  });

  const subscription = observable.subscribe({
    next: (msg) => {
      if (msg.errors?.length) {
        onError?.(new SpeckleGraphQLError(msg.errors as never, opts.query));
        return;
      }
      if (msg.data) onNext(msg.data as TData);
    },
    error: (err) => onError?.(new SpeckleTransportError("WS subscription error", { cause: err })),
    complete: () => undefined,
  });

  return () => subscription.unsubscribe();
}

export async function disposeWsClient(client: WsClient): Promise<void> {
  client.close();
}
