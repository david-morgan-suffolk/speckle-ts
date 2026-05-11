import type { Speckle } from "@/client.js";
import { Project } from "@/nodes/Project.js";
import { lifecycleEvents, subscribe } from "@/transport/ws.js";
import type { DashboardEvent, SubChannel } from "./events.js";

export type WsStatus = "idle" | "connecting" | "open" | "error";

export interface CommentTarget {
  modelId: string;
  versionId: string;
}

export interface SubContext {
  projectId: string;
  commentTarget?: CommentTarget;
}

const COMMENTS_SUB = /* GraphQL */ `
  subscription DashboardComments($target: ViewerUpdateTrackingTarget!) {
    projectCommentsUpdated(target: $target) {
      id
      type
      comment {
        id
        rawText
        createdAt
      }
    }
  }
`;

type Unsubscribe = () => void;

export class SubscriptionManager {
  private ctx: SubContext | null = null;
  private enabled = new Set<SubChannel>(["project", "models", "versions"]);
  private active = new Map<string, Unsubscribe>();
  private wsHooks: Unsubscribe[] = [];

  constructor(
    private speckle: Speckle,
    private onEvent: (e: DashboardEvent) => void,
    private onStatus: (s: WsStatus) => void,
    private onError: (err: unknown) => void,
  ) {
    this.installWsHooks();
  }

  private installWsHooks(): void {
    const events = lifecycleEvents(this.speckle.ws);
    this.wsHooks.push(events.onConnecting(() => this.onStatus("connecting")));
    this.wsHooks.push(events.onReconnecting(() => this.onStatus("connecting")));
    this.wsHooks.push(events.onConnected(() => this.onStatus("open")));
    this.wsHooks.push(events.onReconnected(() => this.onStatus("open")));
    this.wsHooks.push(events.onDisconnected(() => this.onStatus("idle")));
    this.wsHooks.push(
      events.onError((err) => {
        this.onStatus("error");
        this.onError(err);
      }),
    );
  }

  setContext(ctx: SubContext | null): void {
    const prevProject = this.ctx?.projectId;
    const prevTarget = this.ctx?.commentTarget;
    this.ctx = ctx;

    if (prevProject !== ctx?.projectId) {
      this.tearDownChannel("project");
      this.tearDownChannel("models");
      this.tearDownChannel("versions");
    }
    const targetChanged =
      prevTarget?.modelId !== ctx?.commentTarget?.modelId ||
      prevTarget?.versionId !== ctx?.commentTarget?.versionId;
    if (targetChanged) this.tearDownChannel("comments");

    this.reconcile();
  }

  setEnabled(channel: SubChannel, on: boolean): void {
    if (on) this.enabled.add(channel);
    else {
      this.enabled.delete(channel);
      this.tearDownChannel(channel);
    }
    this.reconcile();
  }

  isEnabled(channel: SubChannel): boolean {
    return this.enabled.has(channel);
  }

  enabledChannels(): ReadonlySet<SubChannel> {
    return this.enabled;
  }

  toggle(channel: SubChannel): void {
    this.setEnabled(channel, !this.enabled.has(channel));
  }

  disposeAll(): void {
    for (const fn of this.active.values()) fn();
    this.active.clear();
    for (const fn of this.wsHooks) fn();
    this.wsHooks.length = 0;
  }

  private reconcile(): void {
    if (!this.ctx) return;
    for (const channel of this.enabled) {
      if (this.active.has(this.keyFor(channel))) continue;
      this.startChannel(channel);
    }
  }

  private keyFor(channel: SubChannel): string {
    if (channel === "comments") {
      const t = this.ctx?.commentTarget;
      return `comments:${this.ctx?.projectId ?? ""}:${t?.modelId ?? ""}:${t?.versionId ?? ""}`;
    }
    return `${channel}:${this.ctx?.projectId ?? ""}`;
  }

  private tearDownChannel(channel: SubChannel): void {
    for (const [key, unsub] of this.active.entries()) {
      if (key.startsWith(`${channel}:`)) {
        unsub();
        this.active.delete(key);
      }
    }
  }

  private startChannel(channel: SubChannel): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const project = new Project(this.speckle, ctx.projectId);
    const projectId = ctx.projectId;
    const key = this.keyFor(channel);
    let unsub: Unsubscribe | null = null;

    if (channel === "project") {
      unsub = project.onUpdate(
        (data) => this.emitProject(projectId, data),
        (err) => this.onError(err),
      );
    } else if (channel === "models") {
      unsub = project.onModelsUpdate(
        (data) => this.emitModels(projectId, data),
        (err) => this.onError(err),
      );
    } else if (channel === "versions") {
      unsub = project.onVersionsUpdate(
        (data) => this.emitVersions(projectId, data),
        (err) => this.onError(err),
      );
    } else if (channel === "comments") {
      const target = ctx.commentTarget;
      if (!target) return;
      const resourceIdString = `${target.modelId}@${target.versionId}`;
      unsub = subscribe(
        this.speckle.ws,
        {
          query: COMMENTS_SUB,
          variables: { target: { projectId, resourceIdString, loadedVersionsOnly: true } },
        },
        (data) => this.emitComments(projectId, data),
        (err) => this.onError(err),
        this.speckle.hooks,
      );
    }

    if (unsub) this.active.set(key, unsub);
  }

  private emitProject(projectId: string, data: unknown): void {
    const msg = (data as { projectUpdated?: { type?: string; project?: { name?: string } } })
      ?.projectUpdated;
    this.onEvent({
      ts: Date.now(),
      projectId,
      channel: "project",
      type: msg?.type ?? "update",
      summary: msg?.project?.name ?? "",
      raw: data,
    });
  }

  private emitModels(projectId: string, data: unknown): void {
    const msg = (data as { projectModelsUpdated?: { type?: string; model?: { name?: string } } })
      ?.projectModelsUpdated;
    this.onEvent({
      ts: Date.now(),
      projectId,
      channel: "models",
      type: msg?.type ?? "update",
      summary: msg?.model?.name ?? "",
      raw: data,
    });
  }

  private emitVersions(projectId: string, data: unknown): void {
    const msg = (data as {
      projectVersionsUpdated?: { type?: string; version?: { id?: string; message?: string | null } };
    })?.projectVersionsUpdated;
    const id = msg?.version?.id ? msg.version.id.slice(0, 8) : "";
    const text = msg?.version?.message ?? "";
    this.onEvent({
      ts: Date.now(),
      projectId,
      channel: "versions",
      type: msg?.type ?? "update",
      summary: [id, text].filter(Boolean).join(" · "),
      raw: data,
    });
  }

  private emitComments(projectId: string, data: unknown): void {
    const msg = (data as {
      projectCommentsUpdated?: { type?: string; comment?: { rawText?: string | null } };
    })?.projectCommentsUpdated;
    this.onEvent({
      ts: Date.now(),
      projectId,
      channel: "comments",
      type: msg?.type ?? "update",
      summary: (msg?.comment?.rawText ?? "").slice(0, 80),
      raw: data,
    });
  }
}
