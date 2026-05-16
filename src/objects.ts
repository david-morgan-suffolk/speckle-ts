import type { Database } from "@speckle/objectloader2/core/interfaces";
import { ObjectLoader2 } from "@speckle/objectloader2/core/objectLoader2";
import {
  IndexedDatabase,
  type IndexedDatabaseOptions,
} from "@speckle/objectloader2/core/stages/indexedDatabase";
import { MemoryDatabase } from "@speckle/objectloader2/core/stages/memory/memoryDatabase";
import ServerDownloader, {
  type ServerDownloaderOptions,
} from "@speckle/objectloader2/core/stages/serverDownloader";
import { DefermentManager } from "@speckle/objectloader2/deferment/defermentManager";
import type {
  CustomLogger,
  Fetcher,
} from "@speckle/objectloader2/types/functions";
import type { Base as LoaderBase, Item } from "@speckle/objectloader2/types/types";
import {
  Base as SenderBase,
  send as objectsenderSend,
  type SendParams,
  type SendResult,
} from "@speckle/objectsender";
import type { Speckle } from "./client.js";
import { VersionInfoSchema } from "./schemas.js";
import type { PublishVersionInput, VersionInfo } from "./types.js";
import { parseOrThrow } from "./transport/validate.js";

const DEFAULT_PROGRESS_INTERVAL_MS = 2_000;
const DEFAULT_UPLOAD_RETRY_ATTEMPTS = 5;
const DEFAULT_UPLOAD_RETRY_BASE_DELAY_MS = 500;
const DEFAULT_UPLOAD_ATTEMPT_TIMEOUT_MS = 30_000;
const HYDRATE_ARRAY_BATCH_SIZE = 500;
const VERIFY_OBJECT_BATCH_SIZE = 10_000;
const VERIFY_OBJECT_ATTEMPTS = 24;
const VERIFY_OBJECT_DELAY_MS = 5_000;
const DIRECT_UPLOAD_DIFF_BATCH_SIZE = 10_000;
const DIRECT_UPLOAD_MAX_BATCH_BYTES = 200_000;
const OBJECT_UPLOAD_SUCCESS_STATUSES = new Set([200, 201]);
const noopSendLogger: NonNullable<SendParams["logger"]> = {
  log: () => {},
  error: () => {},
};

const PROJECT_VERSION_OBJECT_QUERY = /* GraphQL */ `
  query ResolveVersionObject($projectId: String!, $versionId: String!) {
    project(id: $projectId) {
      version(id: $versionId) {
        id
        referencedObject
        createdAt
      }
    }
  }
`;

const MODEL_LATEST_OBJECT_QUERY = /* GraphQL */ `
  query ResolveModelLatestObject($projectId: String!, $modelId: String!) {
    project(id: $projectId) {
      model(id: $modelId) {
        versions(limit: 1) {
          items {
            id
            referencedObject
            createdAt
          }
        }
      }
    }
  }
`;

const CREATE_SENT_VERSION_MUTATION = /* GraphQL */ `
  mutation CreateSentObjectVersion($input: CreateVersionInput!) {
    versionMutations {
      create(input: $input) {
        id
        message
        sourceApplication
        referencedObject
        createdAt
        authorUser { id name }
      }
    }
  }
`;

export type SpeckleBase = LoaderBase;
export type SpeckleObjectItem = Item;
export type SpeckleObjectLoader = ObjectLoader2;
export type SpeckleObjectSenderResult = SendResult;
export type SpeckleObjectSenderBase = SenderBase;
export type SpeckleObjectSender = (
  object: SenderBase,
  params: SendParams,
) => Promise<SendResult>;

export type SpeckleObjectCacheConfig =
  | { kind: "memory" }
  | { kind: "none" }
  | ({ kind: "indexeddb" } & IndexedDatabaseOptions);

export interface BuildSpeckleObjectLoaderParams {
  serverUrl: string;
  projectId: string;
  objectId: string;
  token?: string;
  headers?: Headers;
  fetch?: Fetcher;
  logger?: CustomLogger;
}

export interface SpeckleObjectLoadProgress {
  elapsedSeconds: number;
  done: number;
  total: number | null;
}

export interface ReceiveSpeckleObjectOptions {
  projectId: string;
  /** Speckle object id / referencedObject. Wins over versionId and modelId. */
  objectId?: string | null;
  /** Alias for objectId, kept for callers migrating from Big's refId naming. */
  refId?: string | null;
  versionId?: string | null;
  /** Used to resolve latest version when objectId/refId/versionId are absent. */
  modelId?: string | null;
  cache?: SpeckleObjectCacheConfig;
  fetch?: Fetcher;
  headers?: Headers;
  logger?: CustomLogger;
  signal?: AbortSignal;
  progressIntervalMs?: number;
  onProgress?: (progress: SpeckleObjectLoadProgress) => void;
  loaderFactory?: SpeckleObjectLoaderFactory;
}

export type SpeckleObjectLoaderFactory = (
  params: BuildSpeckleObjectLoaderParams,
  cache: SpeckleObjectCacheConfig,
) => SpeckleObjectLoaderLike;

export interface SpeckleObjectLoaderLike {
  disposeAsync(): Promise<void>;
  getRootObject(): Promise<Item | undefined>;
  getObject(params: { id: string }): Promise<LoaderBase>;
  getTotalObjectCount(): Promise<number>;
  getObjectIterator(): AsyncGenerator<LoaderBase>;
}

export interface SpeckleObjectHandle {
  readonly rootId: string;
  readonly rootClosureSize: number;
  readonly objectIds: readonly string[];
  getObject(id: string): Promise<LoaderBase>;
  getObjects(ids: readonly string[]): Promise<Array<LoaderBase | undefined>>;
  getRoot(): Promise<LoaderBase>;
}

export interface ReceiveSpeckleObjectResult {
  handle: SpeckleObjectHandle;
  objectId: string;
  /** Alias for objectId, kept for Big interop. */
  refId: string;
  versionId: string | null;
  createdAt: string | null;
  dispose(): Promise<void>;
}

export interface SpeckleObjectUploadRetryOptions {
  attempts?: number;
  baseDelayMs?: number;
  attemptTimeoutMs?: number;
}

export interface SpeckleObjectUploadRetryEvent {
  attempt: number;
  attempts: number;
  delayMs: number;
  error: unknown;
}

export interface SendSpeckleObjectOptions {
  projectId: string;
  modelId: string;
  handle: SpeckleObjectHandle;
  message?: string;
  sourceApplication?: string;
  parents?: string[];
  /** Defaults to `handle.rootClosureSize`, which matches Speckle closure count. */
  totalChildrenCount?: number;
  token?: string;
  logger?: SendParams["logger"];
  sender?: SpeckleObjectSender;
  retry?: false | SpeckleObjectUploadRetryOptions;
  onUploadRetry?: (event: SpeckleObjectUploadRetryEvent) => void;
}

export interface SendSpeckleObjectResult {
  projectId: string;
  modelId: string;
  versionId: string;
  objectId: string;
  /** Alias for objectId, kept for Big interop. */
  refId: string;
  version: VersionInfo;
  send: SendResult;
}

export class SpeckleObjectLoadError extends Error {}
export class SpeckleObjectSendError extends Error {}

interface VersionObjectMetadata {
  id: string;
  referencedObject: string | null;
  createdAt: string | null;
}

interface ReceiveCounter {
  done: number;
  total: number | null;
}

interface StreamObjectIdsResult {
  rootClosureSize: number;
  objectIds: string[];
  objects: Map<string, LoaderBase>;
}

interface SourceObjectFetchContext {
  serverUrl: string;
  projectId: string;
  token?: string;
  headers?: Headers;
  fetch?: Fetcher;
}

export function buildSpeckleObjectLoader(
  params: BuildSpeckleObjectLoaderParams,
  cache: SpeckleObjectCacheConfig = { kind: "memory" },
): ObjectLoader2 {
  const logger: CustomLogger = params.logger ?? (() => {});
  const downloaderOptions: ServerDownloaderOptions = {
    serverUrl: normalizeServerUrl(params.serverUrl),
    streamId: params.projectId,
    objectId: params.objectId,
    logger,
  };
  if (params.token !== undefined) downloaderOptions.token = params.token;
  if (params.headers !== undefined) downloaderOptions.headers = params.headers;
  if (params.fetch !== undefined) downloaderOptions.fetch = params.fetch;

  return new ObjectLoader2({
    rootId: params.objectId,
    deferments: new DefermentManager(logger),
    downloader: new ServerDownloader(downloaderOptions),
    database: createDatabase(cache),
    logger,
  });
}

export async function receiveSpeckleObject(
  speckle: Speckle,
  opts: ReceiveSpeckleObjectOptions,
): Promise<ReceiveSpeckleObjectResult> {
  throwIfAborted(opts.signal);
  const resolved = await resolveObjectReference(speckle, opts);
  throwIfAborted(opts.signal);

  const cache = opts.cache ?? { kind: "memory" };
  const loader = (opts.loaderFactory ?? buildSpeckleObjectLoader)(
    {
      serverUrl: speckle.server,
      projectId: opts.projectId,
      objectId: resolved.objectId,
      ...(speckle.token !== undefined ? { token: speckle.token } : {}),
      ...(opts.headers !== undefined ? { headers: opts.headers } : {}),
      ...(opts.fetch !== undefined ? { fetch: opts.fetch } : {}),
      ...(opts.logger !== undefined ? { logger: opts.logger } : {}),
    },
    cache,
  );

  let disposed = false;
  const dispose = async (): Promise<void> => {
    if (disposed) return;
    disposed = true;
    await loader.disposeAsync();
  };

  try {
    const counter: ReceiveCounter = { done: 0, total: null };
    const fetched = await runWithProgress(
      () => streamObjectIds(loader, resolved.objectId, counter, opts.signal),
      counter,
      opts.onProgress,
      opts.progressIntervalMs ?? DEFAULT_PROGRESS_INTERVAL_MS,
    );
    const sourceContext: SourceObjectFetchContext = {
      serverUrl: normalizeServerUrl(speckle.server),
      projectId: opts.projectId,
      ...(speckle.token !== undefined ? { token: speckle.token } : {}),
      ...(opts.headers !== undefined ? { headers: opts.headers } : {}),
      ...(opts.fetch !== undefined ? { fetch: opts.fetch } : {}),
    };
    const handle: SpeckleObjectHandle = {
      rootId: resolved.objectId,
      rootClosureSize: fetched.rootClosureSize,
      objectIds: fetched.objectIds,
      getObject: (id) => getObject(loader, id, resolved.objectId, fetched.objects, sourceContext),
      getObjects: (ids) => getObjects(loader, ids, resolved.objectId, fetched.objects, sourceContext),
      getRoot: () => getRootBase(loader, resolved.objectId, fetched.objects),
    };
    return {
      handle,
      objectId: resolved.objectId,
      refId: resolved.objectId,
      versionId: resolved.versionId,
      createdAt: resolved.createdAt,
      dispose,
    };
  } catch (err) {
    await dispose();
    throw err;
  }
}

export async function sendSpeckleObject(
  speckle: Speckle,
  opts: SendSpeckleObjectOptions,
): Promise<SendSpeckleObjectResult> {
  const token = opts.token ?? speckle.token;
  if (!token) {
    throw new SpeckleObjectSendError("sendSpeckleObject requires a Speckle token");
  }

  const serverUrl = normalizeServerUrl(speckle.server);
  const send = opts.sender === undefined && canUploadHandleObjectsDirectly(opts.handle)
    ? await sendLoadedObjectGraphDirectly(serverUrl, opts, token)
    : await sendWithObjectSender(serverUrl, opts, token);
  if (!send.hash) {
    throw new SpeckleObjectSendError("ObjectSender returned no root object hash");
  }
  if (opts.sender === undefined) {
    await verifyUploadedObjects(
      serverUrl,
      opts.projectId,
      sentObjectIds(send),
      token,
      opts.retry,
    );
  }

  const versionInput = createVersionInputFromSend(opts, send.hash);
  const version = await createSentModelVersion(
    speckle,
    opts.projectId,
    opts.modelId,
    versionInput,
  );
  if (version.referencedObject !== send.hash) {
    throw new SpeckleObjectSendError(
      `Created version '${version.id}' referencedObject did not match sent refId`,
    );
  }

  return {
    projectId: opts.projectId,
    modelId: opts.modelId,
    versionId: version.id,
    objectId: send.hash,
    refId: send.hash,
    version,
    send,
  };
}

export async function hydrateSpeckleObject(
  handle: SpeckleObjectHandle,
): Promise<SenderBase> {
  const seen = new Map<string, SenderBase>();
  const pending = new Map<string, Promise<SenderBase>>();
  const root = await handle.getRoot();
  return hydrateBase(root as unknown as Record<string, unknown>, handle, seen, pending);
}

async function sendWithObjectSender(
  serverUrl: string,
  opts: SendSpeckleObjectOptions,
  token: string,
): Promise<SendResult> {
  const root = await hydrateSpeckleObject(opts.handle);
  const sender = opts.sender ?? objectsenderSend;
  const sendParams: SendParams = {
    serverUrl,
    projectId: opts.projectId,
    token,
    logger: opts.logger ?? noopSendLogger,
  };
  return withSpeckleObjectUploadRetry(
    () => sender(root, sendParams),
    opts.retry,
    opts.onUploadRetry,
  );
}

async function sendLoadedObjectGraphDirectly(
  serverUrl: string,
  opts: SendSpeckleObjectOptions,
  token: string,
): Promise<SendResult> {
  const objects = await loadHandleObjects(opts.handle);
  await withSpeckleObjectUploadRetry(
    () => uploadLoadedObjects(serverUrl, opts.projectId, objects, token),
    opts.retry,
    opts.onUploadRetry,
  );
  const root = objects.get(opts.handle.rootId);
  if (root === undefined) {
    throw new SpeckleObjectSendError(`Handle root object '${opts.handle.rootId}' was not loaded`);
  }
  return {
    hash: opts.handle.rootId,
    traversed: root as unknown as Record<string, unknown>,
  } as SendResult;
}

async function loadHandleObjects(
  handle: SpeckleObjectHandle,
): Promise<Map<string, LoaderBase>> {
  const objects = new Map<string, LoaderBase>();
  for (let i = 0; i < handle.objectIds.length; i += DIRECT_UPLOAD_DIFF_BATCH_SIZE) {
    const ids = handle.objectIds.slice(i, i + DIRECT_UPLOAD_DIFF_BATCH_SIZE);
    const batch = await handle.getObjects(ids);
    for (let j = 0; j < ids.length; j++) {
      const id = ids[j];
      if (id === undefined) continue;
      const object = batch[j];
      if (object === undefined) {
        throw new SpeckleObjectSendError(`Handle object '${id}' was not loaded`);
      }
      objects.set(id, object);
    }
  }
  return objects;
}

async function uploadLoadedObjects(
  serverUrl: string,
  projectId: string,
  objects: ReadonlyMap<string, LoaderBase>,
  token: string,
): Promise<void> {
  const ids = [...objects.keys()];
  for (let i = 0; i < ids.length; i += DIRECT_UPLOAD_DIFF_BATCH_SIZE) {
    const diffIds = ids.slice(i, i + DIRECT_UPLOAD_DIFF_BATCH_SIZE);
    const exists = await diffObjectsExist(serverUrl, projectId, diffIds, token);
    const missing = diffIds.filter((id) => exists[id] !== true);
    await uploadSerializedObjects(serverUrl, projectId, missing, objects, token);
  }
}

async function uploadSerializedObjects(
  serverUrl: string,
  projectId: string,
  ids: readonly string[],
  objects: ReadonlyMap<string, LoaderBase>,
  token: string,
): Promise<void> {
  let batch: string[] = [];
  let size = 2;
  for (const id of ids) {
    const object = objects.get(id);
    if (object === undefined) continue;
    const serialized = JSON.stringify(object);
    const nextSize = size + serialized.length + (batch.length === 0 ? 0 : 1);
    if (batch.length > 0 && nextSize > DIRECT_UPLOAD_MAX_BATCH_BYTES) {
      await uploadObjectJsonBatch(serverUrl, projectId, batch, token);
      batch = [];
      size = 2;
    }
    batch.push(serialized);
    size += serialized.length + (batch.length === 1 ? 0 : 1);
  }
  if (batch.length > 0) await uploadObjectJsonBatch(serverUrl, projectId, batch, token);
}

async function uploadObjectJsonBatch(
  serverUrl: string,
  projectId: string,
  serializedObjects: readonly string[],
  token: string,
): Promise<void> {
  const form = new FormData();
  form.append(
    "batch-0",
    new Blob([`[${serializedObjects.join(",")}]`], { type: "application/json" }),
    "batch-0",
  );
  const response = await fetch(new URL(`/objects/${projectId}`, serverUrl), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!OBJECT_UPLOAD_SUCCESS_STATUSES.has(response.status)) {
    const body = await response.text();
    throw new SpeckleObjectSendError(
      `Object upload failed: ${response.status} ${response.statusText}: ${body}`,
    );
  }
}

function canUploadHandleObjectsDirectly(handle: SpeckleObjectHandle): boolean {
  return handle.objectIds.length > 0 && handle.objectIds.every(isSpeckleObjectHash);
}

function isSpeckleObjectHash(id: string): boolean {
  return /^[a-f0-9]{32}$/i.test(id);
}

function createVersionInputFromSend(
  opts: SendSpeckleObjectOptions,
  objectId: string,
): PublishVersionInput {
  const input: PublishVersionInput = { objectId };
  if (opts.message !== undefined) input.message = opts.message;
  if (opts.sourceApplication !== undefined) {
    input.sourceApplication = opts.sourceApplication;
  }
  if (opts.parents !== undefined) input.parents = opts.parents;
  input.totalChildrenCount = opts.totalChildrenCount ?? opts.handle.rootClosureSize;
  return input;
}

async function hydrateBase(
  raw: Record<string, unknown>,
  handle: SpeckleObjectHandle,
  seen: Map<string, SenderBase>,
  pending: Map<string, Promise<SenderBase>>,
): Promise<SenderBase> {
  const id = typeof raw.id === "string" ? raw.id : null;
  if (id !== null) {
    const existing = seen.get(id);
    if (existing !== undefined) return existing;
    const inFlight = pending.get(id);
    if (inFlight !== undefined) return inFlight;
  }

  if (id === null) return hydrateBaseFresh(raw, handle, seen, pending, id);
  const hydrated = Promise.resolve().then(() =>
    hydrateBaseFresh(raw, handle, seen, pending, id)
  );
  pending.set(id, hydrated);
  try {
    return await hydrated;
  } finally {
    pending.delete(id);
  }
}

async function hydrateBaseFresh(
  raw: Record<string, unknown>,
  handle: SpeckleObjectHandle,
  seen: Map<string, SenderBase>,
  pending: Map<string, Promise<SenderBase>>,
  id: string | null,
): Promise<SenderBase> {
  const props: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key === "id" || key === "__closure" || key === "totalChildrenCount") {
      continue;
    }
    const resolved = await hydrateValue(value, handle, seen, pending);
    const outKey = shouldDetachField(value) && !key.startsWith("@") ? `@${key}` : key;
    props[outKey] = resolved;
  }

  const base = new SenderBase(props);
  if (id !== null) {
    base.id = id;
    seen.set(id, base);
  }
  return base;
}

async function hydrateValue(
  value: unknown,
  handle: SpeckleObjectHandle,
  seen: Map<string, SenderBase>,
  pending: Map<string, Promise<SenderBase>>,
): Promise<unknown> {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    const out: unknown[] = [];
    for (let i = 0; i < value.length; i += HYDRATE_ARRAY_BATCH_SIZE) {
      const batch = value.slice(i, i + HYDRATE_ARRAY_BATCH_SIZE);
      out.push(...(await Promise.all(
        batch.map((item) => hydrateValue(item, handle, seen, pending)),
      )));
    }
    return out;
  }
  if (typeof value !== "object") return value;

  const obj = value as Record<string, unknown>;
  const referencedId = obj.referencedId;
  if (isReference(obj) && typeof referencedId === "string") {
    const fetched = await handle.getObject(referencedId);
    return hydrateBase(fetched as unknown as Record<string, unknown>, handle, seen, pending);
  }

  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(obj)) {
    out[key] = await hydrateValue(child, handle, seen, pending);
  }
  return out;
}

function shouldDetachField(value: unknown): boolean {
  if (isReference(value)) return true;
  if (Array.isArray(value)) {
    for (const item of value) if (shouldDetachField(item)) return true;
  }
  return false;
}

function isReference(value: unknown): boolean {
  if (value === null || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  const speckleType = obj.speckle_type ?? obj.speckleType;
  return typeof speckleType === "string" && speckleType.toLowerCase() === "reference";
}

function createDatabase(cache: SpeckleObjectCacheConfig): Database {
  switch (cache.kind) {
    case "indexeddb":
      return new IndexedDatabase(cache);
    case "memory":
    case "none":
      return new MemoryDatabase({ items: new Map<string, LoaderBase>() });
  }
}

async function resolveObjectReference(
  speckle: Speckle,
  opts: ReceiveSpeckleObjectOptions,
): Promise<{ objectId: string; versionId: string | null; createdAt: string | null }> {
  const directObjectId = opts.objectId ?? opts.refId ?? null;
  if (directObjectId !== null) {
    if (opts.versionId === undefined || opts.versionId === null) {
      return { objectId: directObjectId, versionId: null, createdAt: null };
    }
    try {
      const version = await getProjectVersionObject(speckle, opts.projectId, opts.versionId);
      return {
        objectId: directObjectId,
        versionId: version.id,
        createdAt: version.createdAt,
      };
    } catch {
      return { objectId: directObjectId, versionId: opts.versionId, createdAt: null };
    }
  }

  if (opts.versionId !== undefined && opts.versionId !== null) {
    const version = await getProjectVersionObject(speckle, opts.projectId, opts.versionId);
    return {
      objectId: requireReferencedObject(version, `version '${opts.versionId}'`),
      versionId: version.id,
      createdAt: version.createdAt,
    };
  }

  if (opts.modelId !== undefined && opts.modelId !== null) {
    const version = await getLatestModelVersionObject(speckle, opts.projectId, opts.modelId);
    return {
      objectId: requireReferencedObject(version, `latest version for model '${opts.modelId}'`),
      versionId: version.id,
      createdAt: version.createdAt,
    };
  }

  throw new SpeckleObjectLoadError(
    "receiveSpeckleObject requires objectId/refId, versionId, or modelId",
  );
}

async function getProjectVersionObject(
  speckle: Speckle,
  projectId: string,
  versionId: string,
): Promise<VersionObjectMetadata> {
  const data = await speckle.http.request<{
    project: { version: VersionObjectMetadata | null } | null;
  }>(PROJECT_VERSION_OBJECT_QUERY, { projectId, versionId });
  const version = data.project?.version ?? null;
  if (version === null) {
    throw new SpeckleObjectLoadError(
      `Version '${versionId}' not found in project '${projectId}'`,
    );
  }
  return version;
}

async function getLatestModelVersionObject(
  speckle: Speckle,
  projectId: string,
  modelId: string,
): Promise<VersionObjectMetadata> {
  const data = await speckle.http.request<{
    project: {
      model: { versions: { items: VersionObjectMetadata[] } } | null;
    } | null;
  }>(MODEL_LATEST_OBJECT_QUERY, { projectId, modelId });
  const model = data.project?.model ?? null;
  if (model === null) {
    throw new SpeckleObjectLoadError(
      `Model '${modelId}' not found in project '${projectId}'`,
    );
  }
  const version = model.versions.items[0];
  if (version === undefined) {
    throw new SpeckleObjectLoadError(
      `Model '${modelId}' has no versions in project '${projectId}'`,
    );
  }
  return version;
}

async function createSentModelVersion(
  speckle: Speckle,
  projectId: string,
  modelId: string,
  input: PublishVersionInput,
): Promise<VersionInfo> {
  const data = await speckle.http.request<
    { versionMutations: { create: unknown } },
    { input: PublishVersionInput & { projectId: string; modelId: string } }
  >(CREATE_SENT_VERSION_MUTATION, {
    input: { projectId, modelId, ...input },
  });
  return parseOrThrow(
    "CreateSentObjectVersion",
    VersionInfoSchema,
    data.versionMutations.create,
  );
}

async function withSpeckleObjectUploadRetry<T>(
  body: () => Promise<T>,
  retry: false | SpeckleObjectUploadRetryOptions | undefined,
  onRetry: ((event: SpeckleObjectUploadRetryEvent) => void) | undefined,
): Promise<T> {
  const attempts = retry === false
    ? 1
    : Math.max(1, retry?.attempts ?? DEFAULT_UPLOAD_RETRY_ATTEMPTS);
  const baseDelayMs = retry === false
    ? 0
    : retry?.baseDelayMs ?? DEFAULT_UPLOAD_RETRY_BASE_DELAY_MS;
  const attemptTimeoutMs = retry === false
    ? DEFAULT_UPLOAD_ATTEMPT_TIMEOUT_MS
    : retry?.attemptTimeoutMs ?? DEFAULT_UPLOAD_ATTEMPT_TIMEOUT_MS;
  const original = globalThis.fetch;
  let chain: Promise<unknown> = Promise.resolve();

  const wrapped = ((
    input: Parameters<typeof fetch>[0],
    init?: Parameters<typeof fetch>[1],
  ) => {
    const next = chain.then(async () => {
      let lastErr: unknown;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        const controller = new AbortController();
        const timeout = setTimeout(
          () => controller.abort(new Error("Speckle object upload timed out")),
          attemptTimeoutMs,
        );
        try {
          const requestInit = withMergedSignal(init, controller.signal);
          const uploadRequest = isObjectBatchUpload(input, requestInit);
          const response = await original(
            input,
            normalizeObjectUploadRequest(input, requestInit),
          );
          clearTimeout(timeout);
          if (uploadRequest && !OBJECT_UPLOAD_SUCCESS_STATUSES.has(response.status)) {
            const body = await response.clone().text();
            throw new SpeckleObjectSendError(
              `Object upload failed: ${response.status} ${response.statusText}: ${body}`,
            );
          }
          if (uploadRequest && response.status === 200) {
            return new Response(response.body, {
              status: 201,
              statusText: "Created",
              headers: response.headers,
            });
          }
          return response;
        } catch (err) {
          clearTimeout(timeout);
          lastErr = err;
          if (!isTransientFetchError(err) || attempt === attempts) throw err;
          const delayMs = baseDelayMs * 2 ** (attempt - 1);
          onRetry?.({ attempt, attempts, delayMs, error: err });
          await delay(delayMs);
        }
      }
      throw lastErr;
    });
    chain = next.catch(() => undefined);
    return next as Promise<Response>;
  }) as typeof fetch;

  globalThis.fetch = wrapped;
  try {
    return await body();
  } finally {
    globalThis.fetch = original;
  }
}

function withMergedSignal(
  init: RequestInit | undefined,
  signal: AbortSignal,
): RequestInit {
  if (init === undefined) return { signal };
  if (init.signal === undefined) return { ...init, signal };
  const signals = [init.signal, signal].filter(
    (candidate): candidate is AbortSignal => candidate !== null,
  );
  return { ...init, signal: anyAbortSignal(signals) };
}

function normalizeObjectUploadRequest(
  input: Parameters<typeof fetch>[0],
  init: RequestInit,
): RequestInit {
  if (!isObjectBatchUpload(input, init) || !(init.body instanceof FormData)) {
    return init;
  }

  const next = new FormData();
  let batchIndex = 0;
  for (const [key, value] of init.body.entries()) {
    if (key === "object-batch" && isBlob(value)) {
      const name = `batch-${batchIndex++}`;
      next.append(name, value, name);
    } else if (isBlob(value)) {
      next.append(key, value, blobName(value) ?? "blob");
    } else {
      next.append(key, value);
    }
  }
  return { ...init, body: next };
}

function isObjectBatchUpload(
  input: Parameters<typeof fetch>[0],
  init: RequestInit,
): boolean {
  if (init.method?.toUpperCase() !== "POST") return false;
  const rawUrl = typeof input === "string" || input instanceof URL
    ? input.toString()
    : input instanceof Request
      ? input.url
      : "";
  if (!rawUrl) return false;
  try {
    const url = new URL(rawUrl);
    return /^\/objects\/[^/]+\/?$/.test(url.pathname);
  } catch {
    return false;
  }
}

function isBlob(value: unknown): value is Blob {
  return typeof Blob !== "undefined" && value instanceof Blob;
}

function blobName(value: Blob): string | undefined {
  const name = (value as { name?: unknown }).name;
  return typeof name === "string" && name.length > 0 ? name : undefined;
}

function anyAbortSignal(signals: AbortSignal[]): AbortSignal {
  if (typeof AbortSignal.any === "function") return AbortSignal.any(signals);
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener(
      "abort",
      () => controller.abort(signal.reason),
      { once: true },
    );
  }
  return controller.signal;
}

function isTransientFetchError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const code = (err as { code?: unknown }).code;
  if (
    code === "ECONNRESET" ||
    code === "EPIPE" ||
    code === "UND_ERR_SOCKET" ||
    code === "SocketError"
  ) {
    return true;
  }
  const message = `${err.message} ${err.cause instanceof Error ? err.cause.message : ""}`;
  if (/fetch failed|socket.*closed|other side closed|econnreset|epipe|terminated/i.test(message)) {
    return true;
  }
  return err.cause instanceof Error && isTransientFetchError(err.cause);
}

async function verifyUploadedObjects(
  serverUrl: string,
  projectId: string,
  objectIds: readonly string[],
  token: string,
  retry: false | SpeckleObjectUploadRetryOptions | undefined,
): Promise<void> {
  const attempts = retry === false ? 1 : VERIFY_OBJECT_ATTEMPTS;
  let missing: string[] = [];
  for (let attempt = 1; attempt <= attempts; attempt++) {
    missing = await missingUploadedObjects(serverUrl, projectId, objectIds, token);
    if (missing.length === 0) return;
    if (attempt < attempts) await delay(VERIFY_OBJECT_DELAY_MS);
  }
  throw new SpeckleObjectSendError(
    `Object upload did not persist ${missing.length} object(s); first missing '${missing[0]}'`,
  );
}

async function missingUploadedObjects(
  serverUrl: string,
  projectId: string,
  objectIds: readonly string[],
  token: string,
): Promise<string[]> {
  const missing: string[] = [];
  for (let i = 0; i < objectIds.length; i += VERIFY_OBJECT_BATCH_SIZE) {
    const batch = objectIds.slice(i, i + VERIFY_OBJECT_BATCH_SIZE);
    const exists = await diffObjectsExist(serverUrl, projectId, batch, token);
    for (const objectId of batch) {
      if (exists[objectId] !== true) missing.push(objectId);
    }
  }
  return missing;
}

async function diffObjectsExist(
  serverUrl: string,
  projectId: string,
  objectIds: readonly string[],
  token: string,
): Promise<Record<string, boolean>> {
  const url = new URL(`/api/diff/${projectId}`, serverUrl);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ objects: JSON.stringify(objectIds) }),
  });
  const body = await response.text();
  if (!response.ok) {
    throw new SpeckleObjectSendError(
      `Object upload verification failed: ${response.status} ${response.statusText}: ${body}`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body) as unknown;
  } catch (cause) {
    throw new SpeckleObjectSendError("Object upload verification returned invalid JSON", {
      cause,
    });
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new SpeckleObjectSendError("Object upload verification returned invalid payload");
  }
  const result: Record<string, boolean> = {};
  for (const [objectId, exists] of Object.entries(parsed)) {
    result[objectId] = exists === true;
  }
  return result;
}

function sentObjectIds(send: SendResult): string[] {
  const ids = new Set<string>();
  if (send.hash) ids.add(send.hash);
  const traversed = send.traversed as { __closure?: unknown } | undefined;
  const closure = traversed?.__closure;
  if (closure !== null && typeof closure === "object" && !Array.isArray(closure)) {
    for (const id of Object.keys(closure)) ids.add(id);
  }
  return [...ids];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requireReferencedObject(version: VersionObjectMetadata, label: string): string {
  if (!version.referencedObject) {
    throw new SpeckleObjectLoadError(`${label} has no referencedObject`);
  }
  return version.referencedObject;
}

async function streamObjectIds(
  loader: SpeckleObjectLoaderLike,
  rootId: string,
  counter: ReceiveCounter,
  signal: AbortSignal | undefined,
): Promise<StreamObjectIdsResult> {
  const rootItem = await loader.getRootObject();
  if (rootItem?.base === undefined) {
    throw new SpeckleObjectLoadError(`Speckle returned no root object for id '${rootId}'`);
  }
  counter.total = await loader.getTotalObjectCount();
  const rootClosureSize = Object.keys(rootItem.base.__closure ?? {}).length;
  const yieldedIds: string[] = [];
  const objects = new Map<string, LoaderBase>();
  for await (const object of loader.getObjectIterator()) {
    throwIfAborted(signal);
    yieldedIds.push(object.id);
    objects.set(object.id, object);
    counter.done++;
  }
  const closureIds = Object.keys(rootItem.base.__closure ?? {});
  const objectIds = closureIds.length > 0 ? [rootId, ...closureIds] : yieldedIds;
  return { rootClosureSize, objectIds, objects };
}

async function getObject(
  loader: SpeckleObjectLoaderLike,
  id: string,
  rootId: string,
  objects: Map<string, LoaderBase>,
  source: SourceObjectFetchContext,
): Promise<LoaderBase> {
  const object = objects.get(id);
  if (object !== undefined) return object;
  if (id === rootId) return getRootBase(loader, rootId);
  const downloaded = await downloadSourceObjects(source, [id]);
  const sourceObject = downloaded.get(id);
  if (sourceObject !== undefined) {
    objects.set(id, sourceObject);
    return sourceObject;
  }
  return loader.getObject({ id });
}

async function getObjects(
  loader: SpeckleObjectLoaderLike,
  ids: readonly string[],
  rootId: string,
  objects: Map<string, LoaderBase>,
  source: SourceObjectFetchContext,
): Promise<Array<LoaderBase | undefined>> {
  const out = new Array<LoaderBase | undefined>(ids.length);
  const missing: string[] = [];
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    if (id === undefined) continue;
    const object = objects.get(id);
    if (object !== undefined) {
      out[i] = object;
    } else if (id === rootId) {
      out[i] = await getRootBase(loader, rootId, objects);
    } else {
      missing.push(id);
    }
  }
  if (missing.length > 0) {
    const downloaded = await downloadSourceObjects(source, missing);
    for (const [id, object] of downloaded) objects.set(id, object);
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (id !== undefined && out[i] === undefined) out[i] = objects.get(id);
    }
  }
  const stillMissing = ids.filter((id, i) => out[i] === undefined && id !== rootId);
  if (stillMissing.length === 0) return out;
  const loaded = await Promise.all(stillMissing.map((id) => loader.getObject({ id })));
  for (let i = 0; i < stillMissing.length; i++) {
    const id = stillMissing[i];
    const object = loaded[i];
    if (id !== undefined && object !== undefined) objects.set(id, object);
  }
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    if (id !== undefined && out[i] === undefined) out[i] = objects.get(id);
  }
  return out;
}

async function downloadSourceObjects(
  source: SourceObjectFetchContext,
  ids: readonly string[],
): Promise<Map<string, LoaderBase>> {
  if (ids.length === 0) return new Map();
  const headers: Record<string, string> = {
    Accept: "text/plain",
    "Content-Type": "application/json",
  };
  if (source.headers !== undefined) {
    source.headers.forEach((value, key) => {
      headers[key] = value;
    });
  }
  if (source.token !== undefined) headers["Authorization"] = `Bearer ${source.token}`;
  const fetcher = source.fetch ?? fetch;
  const response = await fetcher(
    new URL(`/api/v2/projects/${source.projectId}/object-stream/`, source.serverUrl),
    {
      method: "POST",
      headers,
      body: JSON.stringify({ objectIds: ids }),
    },
  );
  const text = await response.text();
  if (!response.ok) {
    throw new SpeckleObjectLoadError(
      `Failed to fetch source objects: ${response.status} ${response.statusText}: ${text}`,
    );
  }

  const objects = new Map<string, LoaderBase>();
  for (const line of text.split("\n")) {
    if (line.length === 0) continue;
    const tab = line.indexOf("\t");
    if (tab < 0) throw new SpeckleObjectLoadError("Invalid source object stream line");
    const id = line.slice(0, tab);
    const raw = line.slice(tab + 1);
    objects.set(id, JSON.parse(raw) as LoaderBase);
  }
  return objects;
}

async function getRootBase(
  loader: SpeckleObjectLoaderLike,
  rootId: string,
  objects?: ReadonlyMap<string, LoaderBase>,
): Promise<LoaderBase> {
  const root = objects?.get(rootId);
  if (root !== undefined) return root;
  const rootItem = await loader.getRootObject();
  if (rootItem?.base === undefined) {
    throw new SpeckleObjectLoadError(`Speckle returned no root object for id '${rootId}'`);
  }
  return rootItem.base;
}

async function runWithProgress<T>(
  work: () => Promise<T>,
  counter: ReceiveCounter,
  onProgress: ((progress: SpeckleObjectLoadProgress) => void) | undefined,
  intervalMs: number,
): Promise<T> {
  if (onProgress === undefined) return work();
  const startedAt = performance.now();
  const emit = (): void => {
    onProgress({
      elapsedSeconds: (performance.now() - startedAt) / 1_000,
      done: counter.done,
      total: counter.total,
    });
  };
  const timer = setInterval(emit, intervalMs);
  try {
    const result = await work();
    emit();
    return result;
  } finally {
    clearInterval(timer);
  }
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) {
    throw new SpeckleObjectLoadError("receiveSpeckleObject aborted");
  }
}

function normalizeServerUrl(serverUrl: string): string {
  return serverUrl.replace(/\/+$/, "");
}
