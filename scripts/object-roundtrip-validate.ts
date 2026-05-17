import { Speckle } from "../src/client.js";
import { buildSpeckleUrl } from "../src/url.js";
import type { ReceiveSpeckleObjectResult, SpeckleBase } from "../src/objects.js";
import type { VersionInfo } from "../src/types.js";

const TOKEN = process.env.SPECKLE_TOKEN ?? "";
const SERVER = process.env.SPECKLE_SERVER ?? "https://app.speckle.systems";
const SOURCE_PROJECT_ID = process.env.SPECKLE_OBJECT_SOURCE_PROJECT_ID ?? "99f2e54226";
const SOURCE_MODEL_ID = process.env.SPECKLE_OBJECT_SOURCE_MODEL_ID ?? "75ca627877";
const TARGET_PROJECT_ID = process.env.SPECKLE_OBJECT_TARGET_PROJECT_ID ?? "61ae2ba25d";
const TARGET_MODEL_ID = process.env.SPECKLE_OBJECT_TARGET_MODEL_ID ?? "3a716dc9c4";
const LIVE_SEND = process.env.SPECKLE_OBJECT_SEND_LIVE === "1";
const EXISTING_TARGET_VERSION_ID = process.env.SPECKLE_OBJECT_EXISTING_TARGET_VERSION_ID ?? "";
const BATCH_SIZE = positiveIntEnv("SPECKLE_OBJECT_COMPARE_BATCH_SIZE", 500);
const PREVIOUS_LIMIT = positiveIntEnv("SPECKLE_OBJECT_COMPARE_PREVIOUS_LIMIT", 10);
const STRICT_PREVIOUS = process.env.SPECKLE_OBJECT_COMPARE_PREVIOUS_STRICT === "1";

interface ExactCompareResult {
  pass: boolean;
  sameIdSet: boolean;
  compared: number;
  missing: string[];
  extra: string[];
  mismatched: Array<Record<string, unknown>>;
}

interface CanonicalCompareResult {
  pass: boolean;
  leftObjects: number;
  rightObjects: number;
  missingSignatures: Array<Record<string, unknown>>;
  extraSignatures: Array<Record<string, unknown>>;
  leftTypes: Record<string, number>;
  rightTypes: Record<string, number>;
}

interface CompareResult {
  label: string;
  pass: boolean;
  exact: ExactCompareResult;
  canonical: CanonicalCompareResult | null;
}

interface MultisetBuildResult {
  count: number;
  signatures: Map<string, number>;
  types: Map<string, number>;
}

function positiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : fallback;
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

function normalizeIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeIds);
  if (value === null || typeof value !== "object") return value;

  const object = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(object).sort()) {
    const child = object[key];
    if (key === "id" && typeof child === "string") {
      out[key] = "<object-id>";
      continue;
    }
    if (key === "referencedId" && typeof child === "string") {
      out[key] = "<object-id>";
      continue;
    }
    if (key === "totalChildrenCount" && child === null) {
      continue;
    }
    if (key === "__closure" && child !== null && typeof child === "object" && !Array.isArray(child)) {
      const closure = child as Record<string, unknown>;
      out[key] = Object.values(closure).map(normalizeIds).sort((a, b) => sortedJson(a).localeCompare(sortedJson(b)));
      continue;
    }
    out[key] = normalizeIds(child);
  }
  return out;
}

function idSummary(ids: readonly string[]): Record<string, unknown> {
  const sorted = [...ids].sort();
  return {
    count: sorted.length,
    first: sorted[0] ?? null,
    last: sorted.at(-1) ?? null,
  };
}

function mapToObject(map: ReadonlyMap<string, number>): Record<string, number> {
  return Object.fromEntries([...map.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function signatureExample(signature: string, count: number): Record<string, unknown> {
  return {
    hash: hashString(signature),
    count,
    sample: signature.slice(0, 240),
  };
}

function hashString(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function objectType(object: SpeckleBase): string {
  const type = (object as unknown as Record<string, unknown>)["speckle_type"];
  return typeof type === "string" ? type : "<unknown>";
}

async function compareExactById(
  label: string,
  left: ReceiveSpeckleObjectResult,
  right: ReceiveSpeckleObjectResult,
): Promise<ExactCompareResult> {
  const leftIds = [...left.handle.objectIds].sort();
  const rightIds = [...right.handle.objectIds].sort();
  const leftSet = new Set(leftIds);
  const rightSet = new Set(rightIds);
  const missing = leftIds.filter((id) => !rightSet.has(id)).slice(0, 10);
  const extra = rightIds.filter((id) => !leftSet.has(id)).slice(0, 10);
  const common = leftIds.filter((id) => rightSet.has(id));
  const mismatched: Array<Record<string, unknown>> = [];
  let compared = 0;
  let nextLog = Date.now() + 30_000;

  for (let i = 0; i < common.length; i += BATCH_SIZE) {
    const batch = common.slice(i, i + BATCH_SIZE);
    const [leftObjects, rightObjects] = await Promise.all([
      left.handle.getObjects(batch),
      right.handle.getObjects(batch),
    ]);

    for (let j = 0; j < batch.length; j++) {
      const id = batch[j] ?? "<unknown>";
      const leftObject = leftObjects[j];
      const rightObject = rightObjects[j];
      compared++;
      if (leftObject === undefined || rightObject === undefined) {
        if (mismatched.length < 5) mismatched.push({ id, reason: "handle returned missing object" });
        continue;
      }
      const leftJson = sortedJson(leftObject);
      const rightJson = sortedJson(rightObject);
      if (leftJson !== rightJson && mismatched.length < 5) {
        mismatched.push({
          id,
          reason: "stable JSON mismatch",
          leftLength: leftJson.length,
          rightLength: rightJson.length,
        });
      }
    }

    if (Date.now() >= nextLog) {
      console.log(`[compare-exact] ${label} ${compared}/${common.length}`);
      nextLog = Date.now() + 30_000;
    }
  }

  return {
    pass: leftIds.length === rightIds.length && missing.length === 0 && extra.length === 0 && mismatched.length === 0,
    sameIdSet: leftIds.length === rightIds.length && missing.length === 0 && extra.length === 0,
    compared,
    missing,
    extra,
    mismatched,
  };
}

async function buildCanonicalMultiset(
  label: string,
  result: ReceiveSpeckleObjectResult,
): Promise<MultisetBuildResult> {
  const ids = [...result.handle.objectIds].sort();
  const signatures = new Map<string, number>();
  const types = new Map<string, number>();
  let count = 0;
  let nextLog = Date.now() + 30_000;

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const objects = await result.handle.getObjects(batch);
    for (let j = 0; j < batch.length; j++) {
      const object = objects[j];
      if (object === undefined) continue;
      const signature = sortedJson(normalizeIds(object));
      signatures.set(signature, (signatures.get(signature) ?? 0) + 1);
      const type = objectType(object);
      types.set(type, (types.get(type) ?? 0) + 1);
      count++;
    }
    if (Date.now() >= nextLog) {
      console.log(`[compare-canonical] ${label} ${count}/${ids.length}`);
      nextLog = Date.now() + 30_000;
    }
  }

  return { count, signatures, types };
}

async function compareCanonical(
  label: string,
  left: ReceiveSpeckleObjectResult,
  right: ReceiveSpeckleObjectResult,
): Promise<CanonicalCompareResult> {
  const [leftSet, rightSet] = await Promise.all([
    buildCanonicalMultiset(`${label}:left`, left),
    buildCanonicalMultiset(`${label}:right`, right),
  ]);
  const missingSignatures: Array<Record<string, unknown>> = [];
  const extraSignatures: Array<Record<string, unknown>> = [];

  for (const [signature, leftCount] of leftSet.signatures) {
    const rightCount = rightSet.signatures.get(signature) ?? 0;
    if (leftCount > rightCount && missingSignatures.length < 5) {
      missingSignatures.push(signatureExample(signature, leftCount - rightCount));
    }
  }
  for (const [signature, rightCount] of rightSet.signatures) {
    const leftCount = leftSet.signatures.get(signature) ?? 0;
    if (rightCount > leftCount && extraSignatures.length < 5) {
      extraSignatures.push(signatureExample(signature, rightCount - leftCount));
    }
  }

  return {
    pass: leftSet.count === rightSet.count && missingSignatures.length === 0 && extraSignatures.length === 0,
    leftObjects: leftSet.count,
    rightObjects: rightSet.count,
    missingSignatures,
    extraSignatures,
    leftTypes: mapToObject(leftSet.types),
    rightTypes: mapToObject(rightSet.types),
  };
}

async function compareHandles(
  label: string,
  left: ReceiveSpeckleObjectResult,
  right: ReceiveSpeckleObjectResult,
): Promise<CompareResult> {
  const exact = await compareExactById(label, left, right);
  const canonical = exact.pass ? null : await compareCanonical(label, left, right);
  return {
    label,
    pass: exact.pass || canonical?.pass === true,
    exact,
    canonical,
  };
}

function logHandle(label: string, result: ReceiveSpeckleObjectResult, root: SpeckleBase): void {
  console.log(
    `[${label}] version=${result.versionId ?? "null"} ref=${result.refId} objects=${result.handle.objectIds.length} closure=${result.handle.rootClosureSize} rootType=${objectType(root)}`,
  );
  console.log(`[${label}] ids=${JSON.stringify(idSummary(result.handle.objectIds))}`);
}

function logPrevious(version: VersionInfo): void {
  console.log(
    `[target-before] version=${version.id} ref=${version.referencedObject ?? "null"} createdAt=${version.createdAt}`,
  );
}

async function main(): Promise<void> {
  if (!TOKEN) throw new Error("SPECKLE_TOKEN is required");
  if (!LIVE_SEND && !EXISTING_TARGET_VERSION_ID) {
    throw new Error(
      "Set SPECKLE_OBJECT_SEND_LIVE=1 to create a live target version or SPECKLE_OBJECT_EXISTING_TARGET_VERSION_ID to compare an existing version",
    );
  }

  const speckle = new Speckle({ server: SERVER, token: TOKEN });
  let source: ReceiveSpeckleObjectResult | null = null;
  let fresh: ReceiveSpeckleObjectResult | null = null;
  const previousResults: Array<Record<string, unknown>> = [];

  try {
    const sourceModel = speckle.project(SOURCE_PROJECT_ID).model(SOURCE_MODEL_ID);
    const targetProject = speckle.project(TARGET_PROJECT_ID);
    const targetModel = targetProject.model(TARGET_MODEL_ID);

    console.log(`[env] server=${SERVER}`);
    console.log(`[source] project=${SOURCE_PROJECT_ID} model=${SOURCE_MODEL_ID}`);
    console.log(`[target] project=${TARGET_PROJECT_ID} model=${TARGET_MODEL_ID}`);
    console.log(`[options] batchSize=${BATCH_SIZE} previousLimit=${PREVIOUS_LIMIT} strictPrevious=${STRICT_PREVIOUS} existingTargetVersion=${EXISTING_TARGET_VERSION_ID || "none"}`);

    const beforePage = await targetModel.listVersions({ limit: PREVIOUS_LIMIT });
    const beforeVersions = beforePage.items;
    console.log(`[target-before] listed=${beforeVersions.length} total=${beforePage.totalCount}`);
    beforeVersions.forEach(logPrevious);

    source = await sourceModel.loadLatestObject();
    logHandle("receive-source", source, await source.handle.getRoot());

    let targetVersionId = EXISTING_TARGET_VERSION_ID;
    let targetRef: string;

    if (targetVersionId) {
      const versionUrl = buildSpeckleUrl({
        server: SERVER,
        projectId: TARGET_PROJECT_ID,
        modelRefs: [{ modelId: TARGET_MODEL_ID, versionId: targetVersionId }],
      });
      console.log(`[send] skipped existingVersion=${targetVersionId}`);
      console.log(`[send] url=${versionUrl}`);
    } else {
      const sendResult = await targetModel.sendObject(source.handle, {
        message: `@suffolk/speckle E2E validation ${new Date().toISOString()}`,
        sourceApplication: "suffolk-speckle-ts-validation",
      });
      targetVersionId = sendResult.versionId;
      targetRef = sendResult.refId;
      const sentVersionUrl = buildSpeckleUrl({
        server: SERVER,
        projectId: TARGET_PROJECT_ID,
        modelRefs: [{ modelId: TARGET_MODEL_ID, versionId: targetVersionId }],
      });
      console.log(`[send] version=${targetVersionId} ref=${targetRef} referencedObject=${sendResult.version.referencedObject}`);
      console.log(`[send] url=${sentVersionUrl}`);
      if (sendResult.version.referencedObject !== targetRef) {
        throw new Error(`Created version referencedObject ${sendResult.version.referencedObject} != sent ref ${targetRef}`);
      }
    }

    fresh = await targetProject.loadVersionObject(targetVersionId);
    targetRef = fresh.refId;
    logHandle("receive-fresh", fresh, await fresh.handle.getRoot());

    const sourceFresh = await compareHandles("source-vs-fresh", source, fresh);
    console.log(`[compare-source-fresh] ${JSON.stringify(sourceFresh, null, 2)}`);
    if (!sourceFresh.pass) throw new Error("source-vs-fresh compare failed");

    for (const version of beforeVersions) {
      const summary: Record<string, unknown> = {
        versionId: version.id,
        referencedObject: version.referencedObject,
      };
      if (version.id === targetVersionId) {
        summary["status"] = "skipped";
        summary["reason"] = "fresh target version under validation";
        previousResults.push(summary);
        continue;
      }
      if (!version.referencedObject) {
        summary["status"] = "skipped";
        summary["reason"] = "previous version has no referencedObject";
        previousResults.push(summary);
        continue;
      }
      if (version.referencedObject === fresh.refId) {
        summary["status"] = "pass";
        summary["reason"] = "same referencedObject/root hash as fresh version";
        summary["objects"] = fresh.handle.objectIds.length;
        previousResults.push(summary);
        continue;
      }

      let previous: ReceiveSpeckleObjectResult | null = null;
      try {
        previous = await targetProject.loadVersionObject(version.id);
        const comparison = await compareHandles(`fresh-vs-previous-${version.id}`, fresh, previous);
        summary["status"] = comparison.pass ? "pass" : "diff";
        summary["comparison"] = comparison;
      } catch (err) {
        summary["status"] = "error";
        summary["error"] = err instanceof Error ? err.message : String(err);
      } finally {
        await previous?.dispose();
      }
      previousResults.push(summary);
    }

    console.log(`[previous-compare] ${JSON.stringify(previousResults, null, 2)}`);
    if (STRICT_PREVIOUS && previousResults.some((result) => result["status"] !== "pass" && result["status"] !== "skipped")) {
      throw new Error("previous version compare failed strict mode");
    }

    const afterPage = await targetModel.listVersions({ limit: 3 });
    console.log(`[target-after] listed=${afterPage.items.length} total=${afterPage.totalCount}`);
    afterPage.items.forEach((version) => {
      console.log(`[target-after] version=${version.id} ref=${version.referencedObject ?? "null"} createdAt=${version.createdAt}`);
    });
    console.log(`[validation-pass] source=${source.refId} fresh=${targetRef} version=${targetVersionId}`);
  } finally {
    await fresh?.dispose();
    await source?.dispose();
    await speckle.dispose();
  }
}

await main();
