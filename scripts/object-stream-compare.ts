import { Speckle } from "../src/client.js";
import { buildSpeckleUrl } from "../src/url.js";
import type { VersionInfo } from "../src/types.js";

const TOKEN = process.env.SPECKLE_TOKEN ?? "";
const SERVER = process.env.SPECKLE_SERVER ?? "https://app.speckle.systems";
const SOURCE_PROJECT_ID = process.env.SPECKLE_OBJECT_SOURCE_PROJECT_ID ?? "99f2e54226";
const SOURCE_MODEL_ID = process.env.SPECKLE_OBJECT_SOURCE_MODEL_ID ?? "75ca627877";
const TARGET_PROJECT_ID = process.env.SPECKLE_OBJECT_TARGET_PROJECT_ID ?? "61ae2ba25d";
const TARGET_MODEL_ID = process.env.SPECKLE_OBJECT_TARGET_MODEL_ID ?? "3a716dc9c4";
const TARGET_VERSION_ID = process.env.SPECKLE_OBJECT_EXISTING_TARGET_VERSION_ID ?? "";
const BATCH_SIZE = positiveIntEnv("SPECKLE_OBJECT_COMPARE_BATCH_SIZE", 500);
const PREVIOUS_LIMIT = positiveIntEnv("SPECKLE_OBJECT_COMPARE_PREVIOUS_LIMIT", 10);
const RETRY_ATTEMPTS = positiveIntEnv("SPECKLE_OBJECT_COMPARE_RETRY_ATTEMPTS", 4);
const SKIP_SOURCE_COMPARE = process.env.SPECKLE_OBJECT_SKIP_SOURCE_COMPARE === "1";

interface GraphSnapshot {
  projectId: string;
  rootId: string;
  objectIds: string[];
  rootClosureSize: number;
  objects: Map<string, Record<string, unknown>>;
  types: Map<string, number>;
}

interface GraphCompareResult {
  label: string;
  pass: boolean;
  sameIdSet: boolean;
  exactPass: boolean;
  normalizedPass: boolean;
  idNormalized: IdNormalizedCompareResult | null;
  leftCount: number;
  rightCount: number;
  missing: string[];
  extra: string[];
  exactMismatches: Array<Record<string, unknown>>;
  normalizedMismatches: Array<Record<string, unknown>>;
  leftTypes: Record<string, number>;
  rightTypes: Record<string, number>;
}

interface IdNormalizedCompareResult {
  pass: boolean;
  missingSignatures: Array<Record<string, unknown>>;
  extraSignatures: Array<Record<string, unknown>>;
}

function positiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sortedJson(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value === null || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(value as Record<string, unknown>).sort()) {
    out[key] = sortValue((value as Record<string, unknown>)[key]);
  }
  return out;
}

function normalizeTransportVariance(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeTransportVariance);
  if (value === null || typeof value !== "object") return value;
  const input = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(input).sort()) {
    const child = input[key];
    if (key === "totalChildrenCount" && child === null) continue;
    out[key] = normalizeTransportVariance(child);
  }
  return out;
}

function normalizeObjectIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeObjectIds);
  if (value === null || typeof value !== "object") return value;
  const input = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(input).sort()) {
    const child = input[key];
    if ((key === "id" || key === "referencedId") && typeof child === "string") {
      out[key] = "<object-id>";
      continue;
    }
    if (key === "totalChildrenCount" && child === null) continue;
    if (key === "__closure" && child !== null && typeof child === "object" && !Array.isArray(child)) {
      out[key] = Object.values(child as Record<string, unknown>)
        .map(normalizeObjectIds)
        .sort((a, b) => sortedJson(a).localeCompare(sortedJson(b)));
      continue;
    }
    out[key] = normalizeObjectIds(child);
  }
  return out;
}

function typeOfObject(object: Record<string, unknown>): string {
  const type = object["speckle_type"];
  return typeof type === "string" ? type : "<unknown>";
}

function mapToObject(map: ReadonlyMap<string, number>): Record<string, number> {
  return Object.fromEntries([...map.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function hashString(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function signatureExample(signature: string, count: number): Record<string, unknown> {
  return { hash: hashString(signature), count, sample: signature.slice(0, 240) };
}

function urlFor(versionId: string): string {
  return buildSpeckleUrl({
    server: SERVER,
    projectId: TARGET_PROJECT_ID,
    modelRefs: [{ modelId: TARGET_MODEL_ID, versionId }],
  });
}

function isTransientStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

async function fetchObjectBatch(
  projectId: string,
  ids: readonly string[],
): Promise<Map<string, Record<string, unknown>>> {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(new URL(`/api/v2/projects/${projectId}/object-stream/`, SERVER), {
        method: "POST",
        headers: {
          Accept: "text/plain",
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ objectIds: ids }),
      });
      const text = await response.text();
      if (!response.ok) {
        if (attempt < RETRY_ATTEMPTS && isTransientStatus(response.status)) {
          lastError = new Error(`${response.status} ${response.statusText}: ${text.slice(0, 200)}`);
          await sleep(500 * attempt);
          continue;
        }
        throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 500)}`);
      }

      const objects = new Map<string, Record<string, unknown>>();
      for (const line of text.split("\n")) {
        if (!line) continue;
        const tab = line.indexOf("\t");
        if (tab < 0) throw new Error("Invalid object-stream line");
        const id = line.slice(0, tab);
        objects.set(id, JSON.parse(line.slice(tab + 1)) as Record<string, unknown>);
      }
      return objects;
    } catch (err) {
      lastError = err;
      if (attempt < RETRY_ATTEMPTS) {
        await sleep(500 * attempt);
        continue;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function loadGraph(projectId: string, rootId: string, label: string): Promise<GraphSnapshot> {
  const rootBatch = await fetchObjectBatch(projectId, [rootId]);
  const root = rootBatch.get(rootId);
  if (root === undefined) throw new Error(`missing root object ${rootId}`);
  const closure = root["__closure"];
  const closureIds = closure !== null && typeof closure === "object" && !Array.isArray(closure)
    ? Object.keys(closure as Record<string, unknown>)
    : [];
  const objectIds = closureIds.length > 0 ? [rootId, ...closureIds] : [rootId];
  const objects = new Map<string, Record<string, unknown>>([[rootId, root]]);
  const types = new Map<string, number>();
  let nextLog = Date.now() + 30_000;

  for (let i = 0; i < objectIds.length; i += BATCH_SIZE) {
    const batch = objectIds.slice(i, i + BATCH_SIZE);
    const fetched = await fetchObjectBatch(projectId, batch);
    for (const id of batch) {
      const object = fetched.get(id);
      if (object === undefined) throw new Error(`missing object ${id}`);
      objects.set(id, object);
      const type = typeOfObject(object);
      types.set(type, (types.get(type) ?? 0) + 1);
    }
    if (Date.now() >= nextLog) {
      console.log(`[load-graph] ${label} ${objects.size}/${objectIds.length}`);
      nextLog = Date.now() + 30_000;
    }
  }

  return { projectId, rootId, objectIds, rootClosureSize: closureIds.length, objects, types };
}

function buildIdNormalizedMultiset(graph: GraphSnapshot): Map<string, number> {
  const signatures = new Map<string, number>();
  for (const id of graph.objectIds) {
    const object = graph.objects.get(id);
    if (object === undefined) continue;
    const signature = sortedJson(normalizeObjectIds(object));
    signatures.set(signature, (signatures.get(signature) ?? 0) + 1);
  }
  return signatures;
}

function compareIdNormalized(left: GraphSnapshot, right: GraphSnapshot): IdNormalizedCompareResult {
  const leftSet = buildIdNormalizedMultiset(left);
  const rightSet = buildIdNormalizedMultiset(right);
  const missingSignatures: Array<Record<string, unknown>> = [];
  const extraSignatures: Array<Record<string, unknown>> = [];

  for (const [signature, leftCount] of leftSet) {
    const rightCount = rightSet.get(signature) ?? 0;
    if (leftCount > rightCount && missingSignatures.length < 5) {
      missingSignatures.push(signatureExample(signature, leftCount - rightCount));
    }
  }
  for (const [signature, rightCount] of rightSet) {
    const leftCount = leftSet.get(signature) ?? 0;
    if (rightCount > leftCount && extraSignatures.length < 5) {
      extraSignatures.push(signatureExample(signature, rightCount - leftCount));
    }
  }

  return {
    pass: left.objectIds.length === right.objectIds.length && missingSignatures.length === 0 && extraSignatures.length === 0,
    missingSignatures,
    extraSignatures,
  };
}

function compareGraphs(label: string, left: GraphSnapshot, right: GraphSnapshot): GraphCompareResult {
  const leftIds = [...left.objectIds].sort();
  const rightIds = [...right.objectIds].sort();
  const leftSet = new Set(leftIds);
  const rightSet = new Set(rightIds);
  const common = leftIds.filter((id) => rightSet.has(id));
  const missing = leftIds.filter((id) => !rightSet.has(id)).slice(0, 10);
  const extra = rightIds.filter((id) => !leftSet.has(id)).slice(0, 10);
  const exactMismatches: Array<Record<string, unknown>> = [];
  const normalizedMismatches: Array<Record<string, unknown>> = [];

  for (const id of common) {
    const leftObject = left.objects.get(id);
    const rightObject = right.objects.get(id);
    if (leftObject === undefined || rightObject === undefined) {
      if (exactMismatches.length < 5) exactMismatches.push({ id, reason: "missing object" });
      if (normalizedMismatches.length < 5) normalizedMismatches.push({ id, reason: "missing object" });
      continue;
    }
    const leftExact = sortedJson(leftObject);
    const rightExact = sortedJson(rightObject);
    if (leftExact !== rightExact && exactMismatches.length < 5) {
      exactMismatches.push({ id, reason: "stable JSON mismatch", leftLength: leftExact.length, rightLength: rightExact.length });
    }

    const leftNormalized = sortedJson(normalizeTransportVariance(leftObject));
    const rightNormalized = sortedJson(normalizeTransportVariance(rightObject));
    if (leftNormalized !== rightNormalized && normalizedMismatches.length < 5) {
      normalizedMismatches.push({ id, reason: "normalized JSON mismatch", leftLength: leftNormalized.length, rightLength: rightNormalized.length });
    }
  }

  const sameIdSet = leftIds.length === rightIds.length && missing.length === 0 && extra.length === 0;
  const exactPass = sameIdSet && exactMismatches.length === 0;
  const normalizedPass = sameIdSet && normalizedMismatches.length === 0;
  const idNormalized = normalizedPass ? null : compareIdNormalized(left, right);
  return {
    label,
    pass: exactPass || normalizedPass || idNormalized?.pass === true,
    sameIdSet,
    exactPass,
    normalizedPass,
    idNormalized,
    leftCount: leftIds.length,
    rightCount: rightIds.length,
    missing,
    extra,
    exactMismatches,
    normalizedMismatches,
    leftTypes: mapToObject(left.types),
    rightTypes: mapToObject(right.types),
  };
}

async function sourceLatestVersion(speckle: Speckle): Promise<VersionInfo> {
  const page = await speckle.project(SOURCE_PROJECT_ID).model(SOURCE_MODEL_ID).listVersions({ limit: 1 });
  const version = page.items[0];
  if (version === undefined || !version.referencedObject) throw new Error("source model has no latest referencedObject");
  return version;
}

async function targetVersions(speckle: Speckle): Promise<VersionInfo[]> {
  const page = await speckle.project(TARGET_PROJECT_ID).model(TARGET_MODEL_ID).listVersions({ limit: PREVIOUS_LIMIT });
  console.log(`[target] listed=${page.items.length} total=${page.totalCount}`);
  return [...page.items];
}

async function main(): Promise<void> {
  if (!TOKEN) throw new Error("SPECKLE_TOKEN is required");
  if (!TARGET_VERSION_ID) throw new Error("SPECKLE_OBJECT_EXISTING_TARGET_VERSION_ID is required");

  const speckle = new Speckle({ server: SERVER, token: TOKEN });
  try {
    console.log(`[env] server=${SERVER}`);
    console.log(`[source] project=${SOURCE_PROJECT_ID} model=${SOURCE_MODEL_ID}`);
    console.log(`[target] project=${TARGET_PROJECT_ID} model=${TARGET_MODEL_ID} version=${TARGET_VERSION_ID}`);
    console.log(`[target] url=${urlFor(TARGET_VERSION_ID)}`);
    console.log(`[options] batchSize=${BATCH_SIZE} previousLimit=${PREVIOUS_LIMIT} skipSourceCompare=${SKIP_SOURCE_COMPARE}`);

    const versionsPromise = targetVersions(speckle);
    const sourceVersion = SKIP_SOURCE_COMPARE ? null : await sourceLatestVersion(speckle);
    const versions = await versionsPromise;
    const freshVersion = versions.find((version) => version.id === TARGET_VERSION_ID);
    const freshRef = freshVersion?.referencedObject;
    if (!freshRef) throw new Error(`target version ${TARGET_VERSION_ID} has no referencedObject`);

    if (sourceVersion !== null) {
      console.log(`[source-latest] version=${sourceVersion.id} ref=${sourceVersion.referencedObject}`);
    }
    console.log(`[fresh] version=${TARGET_VERSION_ID} ref=${freshRef}`);

    const sourceGraphPromise = sourceVersion === null
      ? null
      : loadGraph(SOURCE_PROJECT_ID, sourceVersion.referencedObject, "source");
    const freshGraph = await loadGraph(TARGET_PROJECT_ID, freshRef, "fresh");
    const sourceGraph = sourceGraphPromise === null ? null : await sourceGraphPromise;
    if (sourceGraph !== null) {
      console.log(`[source-graph] objects=${sourceGraph.objectIds.length} closure=${sourceGraph.rootClosureSize}`);
    }
    console.log(`[fresh-graph] objects=${freshGraph.objectIds.length} closure=${freshGraph.rootClosureSize}`);

    if (sourceGraph !== null) {
      const sourceFresh = compareGraphs("source-vs-fresh", sourceGraph, freshGraph);
      console.log(`[compare-source-fresh] ${JSON.stringify(sourceFresh, null, 2)}`);
      if (!sourceFresh.pass) throw new Error("source-vs-fresh graph compare failed");
    } else {
      console.log("[compare-source-fresh] skipped by SPECKLE_OBJECT_SKIP_SOURCE_COMPARE=1");
    }

    const previous: Array<Record<string, unknown>> = [];
    const targetGraphCache = new Map<string, GraphSnapshot>([[freshRef, freshGraph]]);
    for (const version of versions) {
      const summary: Record<string, unknown> = {
        versionId: version.id,
        referencedObject: version.referencedObject,
      };
      if (version.id === TARGET_VERSION_ID) {
        summary["status"] = "skipped";
        summary["reason"] = "fresh target version under validation";
      } else if (!version.referencedObject) {
        summary["status"] = "skipped";
        summary["reason"] = "no referencedObject";
      } else if (version.referencedObject === freshRef) {
        summary["status"] = "pass";
        summary["reason"] = "same referencedObject/root hash as fresh version";
        summary["objects"] = freshGraph.objectIds.length;
      } else {
        try {
          let graph = targetGraphCache.get(version.referencedObject);
          if (graph === undefined) {
            graph = await loadGraph(TARGET_PROJECT_ID, version.referencedObject, `previous-${version.id}`);
            targetGraphCache.set(version.referencedObject, graph);
          }
          summary["status"] = "compared";
          summary["comparison"] = compareGraphs(`fresh-vs-previous-${version.id}`, freshGraph, graph);
        } catch (err) {
          summary["status"] = "error";
          summary["error"] = err instanceof Error ? err.message : String(err);
        }
      }
      previous.push(summary);
    }
    console.log(`[previous-compare] ${JSON.stringify(previous, null, 2)}`);
    console.log(`[validation-pass] version=${TARGET_VERSION_ID} ref=${freshRef}`);
  } finally {
    await speckle.dispose();
  }
}

await main();
