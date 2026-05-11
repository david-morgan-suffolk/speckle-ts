import { createHttpClient, type HttpClient } from "./transport/http.js";
import { createWsClient, disposeWsClient, type WsClient } from "./transport/ws.js";
import { toHttpEndpoint, toWsEndpoint } from "./transport/url.js";
import { Account } from "./nodes/Account.js";
import { Project } from "./nodes/Project.js";
import { ActiveUser, User } from "./nodes/User.js";
import { Workspace } from "./nodes/Workspace.js";
import { Model } from "./nodes/Model.js";
import { Version } from "./nodes/Version.js";
import { parseSpeckleUrl, SpeckleUrlError, type ModelRef } from "./url.js";
import type { SpeckleHooks } from "./transport/hooks.js";
import type { ApqOptions } from "./transport/apq.js";

export interface SpeckleOptions {
  server?: string;
  token?: string;
  fetch?: typeof fetch;
  webSocketImpl?: unknown;
  hooks?: SpeckleHooks;
  apq?: ApqOptions;
}

export interface UrlRefEntry {
  modelId: string;
  versionId: string | undefined;
  model: Model;
  version: Version | null;
}

export interface UrlRefs {
  projectId: string;
  project: Project;
  entries: UrlRefEntry[];
  /** First entry's model, if the URL had any /models segment. */
  model: Model | null;
  /** First entry's version, if the URL had a versionId. */
  version: Version | null;
}

const DEFAULT_SERVER = "https://app.speckle.systems";

export class Speckle {
  readonly server: string;
  readonly token: string | undefined;
  readonly http: HttpClient;
  readonly ws: WsClient;
  readonly hooks: SpeckleHooks | undefined;

  constructor(opts: SpeckleOptions = {}) {
    this.server = opts.server ?? DEFAULT_SERVER;
    this.token = opts.token;
    this.hooks = opts.hooks;
    this.http = createHttpClient({
      endpoint: toHttpEndpoint(this.server),
      token: this.token,
      ...(opts.fetch ? { fetch: opts.fetch } : {}),
      ...(opts.hooks ? { hooks: opts.hooks } : {}),
      ...(opts.apq ? { apq: opts.apq } : {}),
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
    return new User(this, id);
  }

  workspace(id: string): Workspace {
    return new Workspace(this, id);
  }

  get activeUser(): ActiveUser {
    return new ActiveUser(this);
  }

  get account(): Account {
    return new Account(this);
  }

  /** Close the WS transport. In-flight subscriptions are dropped without a final event. */
  async dispose(): Promise<void> {
    await disposeWsClient(this.ws);
  }

  fromUrl(input: string): UrlRefs {
    const parsed = parseSpeckleUrl(input);
    if (normalizeServer(parsed.server) !== normalizeServer(this.server)) {
      throw new SpeckleUrlError(
        `URL server "${parsed.server}" does not match client server "${this.server}"`,
      );
    }
    return resolveRefs(this, parsed.projectId, parsed.modelRefs);
  }

  static fromUrl(
    input: string,
    opts: Omit<SpeckleOptions, "server"> = {},
  ): { speckle: Speckle; refs: UrlRefs } {
    const parsed = parseSpeckleUrl(input);
    const speckle = new Speckle({ ...opts, server: parsed.server });
    const refs = resolveRefs(speckle, parsed.projectId, parsed.modelRefs);
    return { speckle, refs };
  }
}

function normalizeServer(server: string): string {
  return server.replace(/\/$/, "").toLowerCase();
}

function resolveRefs(
  speckle: Speckle,
  projectId: string,
  modelRefs: ReadonlyArray<ModelRef>,
): UrlRefs {
  const project = speckle.project(projectId);
  const entries: UrlRefEntry[] = modelRefs.map((ref) => {
    const model = project.model(ref.modelId);
    return {
      modelId: ref.modelId,
      versionId: ref.versionId,
      model,
      version: ref.versionId ? model.version(ref.versionId) : null,
    };
  });
  return {
    projectId,
    project,
    entries,
    model: entries[0]?.model ?? null,
    version: entries[0]?.version ?? null,
  };
}
