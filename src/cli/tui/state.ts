import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Speckle } from "@/client.js";
import { getSdk } from "@/generated/sdk.js";
import { loadCredentials } from "@/cli/auth.js";
import type { BuildSpeckleOptions } from "@/cli/client.js";
import {
  flatten,
  modelNode,
  nodeHasChildren,
  projectNode,
  versionNode,
  type FlatRow,
  type ModelNode,
  type ProjectNode,
  type TreeNode,
} from "./tree/nodes.js";
import {
  SubscriptionManager,
  type CommentTarget,
  type WsStatus,
} from "./subs/manager.js";
import { EventLog, type DashboardEvent, type SubChannel } from "./subs/events.js";
import {
  getModelChildrenTree,
  listAllProjectModelsTree,
} from "@/nodes/Project.js";
import { listModelVersions } from "@/nodes/Model.js";
import type { PreviewTarget } from "./viewer/preview.js";

export type Focus = "tree" | "events";

export interface AccountSummary {
  name: string;
  role: string | null;
}

export interface UseDashboard {
  speckle: Speckle | null;
  server: string;
  token: string | undefined;
  account: AccountSummary | null;
  error: unknown;
  rows: FlatRow[];
  cursorId: string | null;
  cursorIdx: number;
  expanded: ReadonlySet<string>;
  loading: ReadonlySet<string>;
  events: DashboardEvent[];
  wsStatus: WsStatus;
  subs: Record<SubChannel, boolean>;
  focused: Focus;
  scrollOffset: number;
  viewerOpen: boolean;
  selectedVersion: PreviewTarget | null;
  toggleExpand: () => Promise<void>;
  collapse: () => void;
  expandOnly: () => Promise<void>;
  moveCursor: (delta: number) => void;
  jumpCursor: (target: "top" | "bottom") => void;
  toggleFocus: () => void;
  setFocus: (f: Focus) => void;
  toggleSub: (channel: SubChannel) => void;
  scrollEvents: (delta: number) => void;
  jumpEvents: (target: "top" | "bottom") => void;
  clearEvents: () => void;
  toggleViewer: () => void;
  dispose: () => Promise<void>;
}

export function useDashboard(opts: BuildSpeckleOptions): UseDashboard {
  const [speckle, setSpeckle] = useState<Speckle | null>(null);
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [server, setServer] = useState<string>("");
  const [token, setToken] = useState<string | undefined>(undefined);
  const [viewerOpen, setViewerOpen] = useState(false);

  const treeRef = useRef<TreeNode[]>([]);
  const [tick, setTick] = useState(0);
  const force = useCallback(() => setTick((t) => t + 1), []);

  const expandedRef = useRef<Set<string>>(new Set());
  const loadingRef = useRef<Set<string>>(new Set());
  const [, setExpandedTick] = useState(0);
  const bumpExpanded = useCallback(() => setExpandedTick((t) => t + 1), []);
  const [, setLoadingTick] = useState(0);
  const bumpLoading = useCallback(() => setLoadingTick((t) => t + 1), []);

  const [cursorId, setCursorId] = useState<string | null>(null);
  const [focused, setFocused] = useState<Focus>("tree");
  const [scrollOffset, setScrollOffset] = useState(0);

  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const eventLogRef = useRef(new EventLog());
  const [wsStatus, setWsStatus] = useState<WsStatus>("idle");
  const [subs, setSubs] = useState<Record<SubChannel, boolean>>({
    project: true,
    models: true,
    versions: true,
    comments: false,
  });
  const subMgrRef = useRef<SubscriptionManager | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const creds = opts.token
          ? {
              server: opts.server ?? "https://app.speckle.systems",
              token: opts.token,
            }
          : loadCredentials(opts.profile);
        const sk = new Speckle({ server: creds.server, token: creds.token });
        if (!active) {
          await sk.dispose();
          return;
        }
        setSpeckle(sk);
        setServer(creds.server);
        setToken(creds.token);

        const mgr = new SubscriptionManager(
          sk,
          (e) => {
            eventLogRef.current.push(e);
            setEvents(eventLogRef.current.snapshot());
          },
          (s) => setWsStatus(s),
          (err) => setError(err),
        );
        subMgrRef.current = mgr;

        const acct = await sk.account.get;
        if (!active) return;
        setAccount({ name: acct.name, role: acct.role ?? null });

        const sdk = getSdk(sk.http);
        const data = await sdk.SearchProjects({ limit: 50 });
        if (!active) return;
        const items = data.activeUser?.projects.items ?? [];
        treeRef.current = items.map((p) =>
          projectNode({
            id: p.id,
            name: p.name,
            visibility: p.visibility,
            role: p.role,
            updatedAt: p.updatedAt,
          }),
        );
        if (treeRef.current[0]) setCursorId(treeRef.current[0].id);
        force();
      } catch (err) {
        if (active) setError(err);
      }
    })();
    return () => {
      active = false;
    };
  }, [opts.profile, opts.server, opts.token, force]);

  const rows = useMemo<FlatRow[]>(() => {
    void tick;
    return flatten(treeRef.current, expandedRef.current);
  }, [tick]);

  const cursorIdx = useMemo(() => {
    if (!cursorId) return -1;
    return rows.findIndex((r) => r.node.id === cursorId);
  }, [rows, cursorId]);

  const currentRow = cursorIdx >= 0 ? rows[cursorIdx] : null;

  useEffect(() => {
    const mgr = subMgrRef.current;
    if (!mgr || !currentRow) return;
    const target = commentTargetFor(currentRow, rows);
    mgr.setContext({
      projectId: currentRow.parentProjectId,
      ...(target ? { commentTarget: target } : {}),
    });
  }, [currentRow, rows]);

  useEffect(() => {
    const mgr = subMgrRef.current;
    if (!mgr) return;
    (Object.keys(subs) as SubChannel[]).forEach((ch) => mgr.setEnabled(ch, subs[ch]));
  }, [subs]);

  const toggleExpand = useCallback(async () => {
    if (!currentRow || !speckle) return;
    const node = currentRow.node;
    if (node.kind === "version") return;
    const id = node.id;
    if (expandedRef.current.has(id)) {
      expandedRef.current.delete(id);
      bumpExpanded();
      force();
      return;
    }
    if (needsLoad(node)) {
      if (loadingRef.current.has(id)) return;
      loadingRef.current.add(id);
      bumpLoading();
      try {
        await loadChildren(speckle, node, currentRow.parentProjectId);
      } catch (err) {
        setError(err);
        loadingRef.current.delete(id);
        bumpLoading();
        return;
      }
      loadingRef.current.delete(id);
      bumpLoading();
    }
    expandedRef.current.add(id);
    bumpExpanded();
    force();
  }, [currentRow, speckle, bumpExpanded, bumpLoading, force]);

  const collapse = useCallback(() => {
    if (!currentRow) return;
    if (expandedRef.current.has(currentRow.node.id)) {
      expandedRef.current.delete(currentRow.node.id);
      bumpExpanded();
      force();
    }
  }, [currentRow, bumpExpanded, force]);

  const expandOnly = useCallback(async () => {
    if (!currentRow || !speckle) return;
    const node = currentRow.node;
    if (node.kind === "version" || expandedRef.current.has(node.id)) return;
    if (needsLoad(node)) {
      const id = node.id;
      if (loadingRef.current.has(id)) return;
      loadingRef.current.add(id);
      bumpLoading();
      try {
        await loadChildren(speckle, node, currentRow.parentProjectId);
      } catch (err) {
        setError(err);
        loadingRef.current.delete(id);
        bumpLoading();
        return;
      }
      loadingRef.current.delete(id);
      bumpLoading();
    }
    expandedRef.current.add(node.id);
    bumpExpanded();
    force();
  }, [currentRow, speckle, bumpExpanded, bumpLoading, force]);

  const moveCursor = useCallback(
    (delta: number) => {
      if (rows.length === 0) return;
      const cur = cursorIdx < 0 ? 0 : cursorIdx;
      const next = Math.max(0, Math.min(rows.length - 1, cur + delta));
      const row = rows[next];
      if (row) setCursorId(row.node.id);
    },
    [rows, cursorIdx],
  );

  const jumpCursor = useCallback(
    (target: "top" | "bottom") => {
      if (rows.length === 0) return;
      const idx = target === "top" ? 0 : rows.length - 1;
      const row = rows[idx];
      if (row) setCursorId(row.node.id);
    },
    [rows],
  );

  const toggleFocus = useCallback(() => {
    setFocused((f) => (f === "tree" ? "events" : "tree"));
  }, []);

  const setFocus = useCallback((f: Focus) => setFocused(f), []);

  const toggleSub = useCallback((channel: SubChannel) => {
    setSubs((s) => ({ ...s, [channel]: !s[channel] }));
  }, []);

  const scrollEvents = useCallback(
    (delta: number) => {
      setScrollOffset((o) => Math.max(0, Math.min(eventLogRef.current.snapshot().length, o + delta)));
    },
    [],
  );

  const jumpEvents = useCallback((target: "top" | "bottom") => {
    if (target === "bottom") setScrollOffset(0);
    else setScrollOffset(eventLogRef.current.snapshot().length);
  }, []);

  const clearEvents = useCallback(() => {
    eventLogRef.current.clear();
    setEvents([]);
    setScrollOffset(0);
  }, []);

  const toggleViewer = useCallback(() => {
    setViewerOpen((v) => !v);
  }, []);

  const selectedVersion = useMemo<PreviewTarget | null>(() => {
    if (!currentRow) return null;
    if (currentRow.node.kind !== "version") return null;
    const parts = currentRow.node.id.split(":");
    if (parts.length < 4) return null;
    return { streamId: currentRow.parentProjectId, versionId: parts[3]! };
  }, [currentRow]);

  const dispose = useCallback(async () => {
    subMgrRef.current?.disposeAll();
    subMgrRef.current = null;
    if (speckle) await speckle.dispose();
  }, [speckle]);

  return {
    speckle,
    server,
    token,
    account,
    error,
    rows,
    cursorId,
    cursorIdx,
    expanded: expandedRef.current,
    loading: loadingRef.current,
    events,
    wsStatus,
    subs,
    focused,
    scrollOffset,
    viewerOpen,
    selectedVersion,
    toggleExpand,
    collapse,
    expandOnly,
    moveCursor,
    jumpCursor,
    toggleFocus,
    setFocus,
    toggleSub,
    scrollEvents,
    jumpEvents,
    clearEvents,
    toggleViewer,
    dispose,
  };
}

function needsLoad(node: TreeNode): boolean {
  if (node.kind === "version") return false;
  if (node.kind === "project") return node.children === undefined;
  if (node.children === undefined) return true;
  return false;
}

async function loadChildren(
  speckle: Speckle,
  node: ProjectNode | ModelNode,
  projectId: string,
): Promise<void> {
  if (node.kind === "project") {
    const items = await listAllProjectModelsTree(speckle, projectId);
    node.children = items.map(modelNode);
    return;
  }
  const item = node.data;
  if (item.model) {
    const page = await listModelVersions(speckle, projectId, item.model.id, { limit: 50 });
    node.children = page.items.map((v) => versionNode(v, projectId, item.model!.id));
    return;
  }
  if (item.hasChildren) {
    const fetched = await getModelChildrenTree(speckle, projectId, item.fullName);
    node.children = fetched.map(modelNode);
    return;
  }
  node.children = [];
}

function commentTargetFor(row: FlatRow, _rows: FlatRow[]): CommentTarget | undefined {
  const node = row.node;
  if (node.kind !== "version") return undefined;
  const parts = node.id.split(":");
  if (parts.length < 4) return undefined;
  return { modelId: parts[2]!, versionId: parts[3]! };
}

export function rowHasChildren(row: FlatRow): boolean {
  return nodeHasChildren(row.node);
}
