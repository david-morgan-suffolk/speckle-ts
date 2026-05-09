import { createHttpClient, type HttpClient } from "./transport/http.js";
import { createWsClient, disposeWsClient, type WsClient } from "./transport/ws.js";
import { Account } from "./nodes/Account.js";
import { Project } from "./nodes/Project.js";
import { User } from "./nodes/User.js";
import { Workspace } from "./nodes/Workspace.js";

export interface SpeckleOptions {
  server?: string;
  token?: string;
  fetch?: typeof fetch;
  webSocketImpl?: unknown;
}

const DEFAULT_SERVER = "https://app.speckle.systems";

function toHttpEndpoint(server: string): string {
  return `${server.replace(/\/$/, "")}/graphql`;
}

function toWsEndpoint(server: string): string {
  const trimmed = server.replace(/\/$/, "");
  if (trimmed.startsWith("https://")) return `wss://${trimmed.slice("https://".length)}/graphql`;
  if (trimmed.startsWith("http://")) return `ws://${trimmed.slice("http://".length)}/graphql`;
  return `${trimmed}/graphql`;
}

export class Speckle {
  readonly server: string;
  readonly token: string | undefined;
  readonly http: HttpClient;
  readonly ws: WsClient;

  constructor(opts: SpeckleOptions = {}) {
    this.server = opts.server ?? DEFAULT_SERVER;
    this.token = opts.token;
    this.http = createHttpClient({
      endpoint: toHttpEndpoint(this.server),
      token: this.token,
      ...(opts.fetch ? { fetch: opts.fetch } : {}),
    });
    this.ws = createWsClient({
      endpoint: toWsEndpoint(this.server),
      token: this.token,
      ...(opts.webSocketImpl ? { webSocketImpl: opts.webSocketImpl } : {}),
    });
  }

  project(id: string): Project {
    return new Project(this, id);
  }

  user(id: string): User {
    return User.byId(this, id);
  }

  workspace(id: string): Workspace {
    return new Workspace(this, id);
  }

  get activeUser(): User {
    return User.active(this);
  }

  get account(): Account {
    return new Account(this);
  }

  async dispose(): Promise<void> {
    await disposeWsClient(this.ws);
  }
}
