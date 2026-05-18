import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { Speckle } from "../src/index.js";
import {
  createDuckDbObjectDatabase,
  indexSpeckleObjectGraph,
  type DuckDbConnectionLike,
} from "../src/duckdb.js";
import type { SpeckleObjectLoadProgress } from "../src/objects.js";
import sourceExamples from "../test/source-examples.json";

const TOKEN = process.env.SPECKLE_TOKEN;
if (!TOKEN) {
  console.error("SPECKLE_TOKEN missing");
  process.exit(1);
}

const SERVER = process.env.SPECKLE_SERVER ?? "https://app.speckle.systems";
const OUTPUT = process.env.SPECKLE_DUCKDB_PATH ?? "tmp/speckle.duckdb";
const SOURCE_INDEX = positiveIntEnv("SPECKLE_DUCKDB_SOURCE_INDEX");

interface DuckDbInstanceLike {
  connect(): Promise<DuckDbConnectionLike>;
  closeSync?(): void;
}

interface DuckDbModuleLike {
  DuckDBInstance: {
    create(path?: string, options?: Record<string, string>): Promise<DuckDbInstanceLike>;
  };
}

async function main(): Promise<void> {
  const duckdb = await loadDuckDbModule();
  await mkdir(dirname(OUTPUT), { recursive: true });

  const instance = await duckdb.DuckDBInstance.create(OUTPUT);
  const connection = await instance.connect();
  const speckle = new Speckle({ server: SERVER, token: TOKEN });
  const sources = SOURCE_INDEX === null
    ? sourceExamples.sources
    : sourceExamples.sources.slice(SOURCE_INDEX, SOURCE_INDEX + 1);

  if (sources.length === 0) {
    throw new Error(`No source example at SPECKLE_DUCKDB_SOURCE_INDEX=${SOURCE_INDEX}`);
  }

  try {
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      if (source === undefined) continue;
      console.log(`[duckdb:index] loading ${i + 1}/${sources.length} ${source.projectId}/${source.modelId}`);
      const database = createDuckDbObjectDatabase({
        connection,
        namespace: `${source.projectId}:${source.modelId}`,
      });
      const result = await speckle.project(source.projectId).model(source.modelId).loadLatestObject({
        cache: { kind: "custom", database },
        onProgress: (progress: SpeckleObjectLoadProgress) => {
          if (progress.total === null) return;
          console.log(`[duckdb:index]   ${progress.done}/${progress.total}`);
        },
      });

      try {
        const indexed = await indexSpeckleObjectGraph({
          connection,
          handle: result.handle,
          projectId: source.projectId,
          modelId: source.modelId,
          versionId: result.versionId,
          rootId: result.objectId,
        });
        console.log(
          `[duckdb:index]   graph=${indexed.graphId} objects=${indexed.objectCount} edges=${indexed.edgeCount} properties=${indexed.propertyCount} proxies=${indexed.proxyMembershipCount}`,
        );
      } finally {
        await result.dispose();
      }
    }
  } finally {
    await speckle.dispose();
    connection.closeSync?.();
    instance.closeSync?.();
  }

  console.log(`[duckdb:index] wrote ${OUTPUT}`);
  console.log(`Inspect: duckdb -readonly ${OUTPUT}`);
  console.log(`Then run: .read scripts/duckdb-inspect.sql`);
}

async function loadDuckDbModule(): Promise<DuckDbModuleLike> {
  try {
    const dynamicImport = new Function("specifier", "return import(specifier)") as (
      specifier: string,
    ) => Promise<unknown>;
    return await dynamicImport("@duckdb/node-api") as DuckDbModuleLike;
  } catch (err) {
    throw new Error(
      "@duckdb/node-api is required for duckdb:index. Install it with `bun add -d @duckdb/node-api`.",
      { cause: err },
    );
  }
}

function positiveIntEnv(name: string): number | null {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
  return value;
}

main().catch((err) => {
  console.error("[duckdb:index] failed", err);
  process.exit(1);
});
