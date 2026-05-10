export interface ActiveSub {
  id: string;
  operationName: string;
  variables: Record<string, unknown>;
}

interface SocketLike {
  readyState: number;
  protocol: string;
  onopen: (() => void) | null;
  onmessage: ((e: { data: string }) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onclose: (() => void) | null;
  _push(msg: unknown): void;
}

interface ClientMessage {
  type: string;
  id?: string;
  payload?: {
    query?: string;
    variables?: Record<string, unknown>;
    operationName?: string;
  };
}

const OP_NAME_RE = /(?:query|mutation|subscription)\s+(\w+)/;

function parseOperationName(payload: ClientMessage["payload"]): string {
  if (payload?.operationName) return payload.operationName;
  const m = payload?.query?.match(OP_NAME_RE);
  return m?.[1] ?? "Unknown";
}

export class WsController {
  private socket: SocketLike | null = null;
  private subs = new Map<string, ActiveSub>();

  attach(socket: SocketLike): void {
    this.socket = socket;
  }

  handleClientMessage(msg: ClientMessage, socket: SocketLike): void {
    if (msg.type === "connection_init") {
      socket._push({ type: "connection_ack" });
      return;
    }
    if (msg.type === "start" && msg.id) {
      const operationName = parseOperationName(msg.payload);
      this.subs.set(msg.id, {
        id: msg.id,
        operationName,
        variables: msg.payload?.variables ?? {},
      });
      return;
    }
    if (msg.type === "stop" && msg.id) {
      this.subs.delete(msg.id);
      return;
    }
    if (msg.type === "connection_terminate") {
      socket.onclose?.();
      return;
    }
  }

  emit(
    operationName: string,
    data: unknown,
    match?: (vars: Record<string, unknown>) => boolean,
  ): number {
    if (!this.socket) throw new Error("WsController.emit: no attached socket");
    let dispatched = 0;
    for (const sub of this.subs.values()) {
      if (sub.operationName !== operationName) continue;
      if (match && !match(sub.variables)) continue;
      this.socket._push({ type: "data", id: sub.id, payload: { data } });
      dispatched++;
    }
    return dispatched;
  }

  emitGraphQLErrors(
    operationName: string,
    errors: ReadonlyArray<{ message: string }>,
  ): number {
    if (!this.socket) throw new Error("WsController.emitGraphQLErrors: no attached socket");
    let dispatched = 0;
    for (const sub of this.subs.values()) {
      if (sub.operationName !== operationName) continue;
      this.socket._push({ type: "data", id: sub.id, payload: { errors } });
      dispatched++;
    }
    return dispatched;
  }

  complete(operationName: string): void {
    if (!this.socket) return;
    for (const [id, sub] of this.subs.entries()) {
      if (sub.operationName !== operationName) continue;
      this.socket._push({ type: "complete", id });
      this.subs.delete(id);
    }
  }

  activeSubs(): ReadonlyArray<ActiveSub> {
    return [...this.subs.values()];
  }

  activeSubsFor(operationName: string): ReadonlyArray<ActiveSub> {
    return [...this.subs.values()].filter((s) => s.operationName === operationName);
  }
}

export function makeMockWebSocketImpl(controller: WsController): unknown {
  return class MockWebSocket implements SocketLike {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;

    readyState = 0;
    protocol = "";
    url: string;
    onopen: (() => void) | null = null;
    onmessage: ((e: { data: string }) => void) | null = null;
    onerror: ((e: unknown) => void) | null = null;
    onclose: (() => void) | null = null;

    constructor(url: string, protocols?: string | string[]) {
      this.url = url;
      if (typeof protocols === "string") this.protocol = protocols;
      else if (Array.isArray(protocols) && protocols[0]) this.protocol = protocols[0];
      controller.attach(this);
      queueMicrotask(() => {
        this.readyState = 1;
        this.onopen?.();
      });
    }

    send(data: string): void {
      const msg = JSON.parse(data) as ClientMessage;
      controller.handleClientMessage(msg, this);
    }

    close(): void {
      if (this.readyState === 3) return;
      this.readyState = 3;
      this.onclose?.();
    }

    _push(msg: unknown): void {
      this.onmessage?.({ data: JSON.stringify(msg) });
    }
  };
}

export async function flushMicrotasks(turns = 4): Promise<void> {
  for (let i = 0; i < turns; i++) await Promise.resolve();
}
