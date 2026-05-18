# @suffolk/speckle

TypeScript client for the [Speckle](https://speckle.systems) GraphQL API.

Carries forward the lazy-node design from `sasakiassociates/speckle` and updates to the modern Speckle naming (Project / Model / Version). Covers queries, mutations, and subscriptions.

## Install

This package is distributed via GitHub, not npm. Install from the repo:

```bash
# bun
bun add graphql github:david-morgan-suffolk/speckle-ts

# pin a specific commit / tag / branch
bun add github:david-morgan-suffolk/speckle-ts#v0.1.0
bun add github:david-morgan-suffolk/speckle-ts#main
```

`graphql` is a peer dependency. Object loading uses Bun `patchedDependencies`
for `@speckle/objectloader2`, so Bun is the supported install path. npm users
must apply the equivalent patch or use a prepatched/forked objectloader2 package.
The package's `prepare` script builds `dist/` from source on install.

## Use

```ts
import { Speckle } from "@suffolk/speckle";

const sk = new Speckle({
  server: "https://app.speckle.systems",
  token: process.env.SPECKLE_TOKEN!,
});

// Lazy refs — no network until `.get`
const me = await sk.activeUser.get;

const proj = sk.project("PROJECT_ID");
const info = await proj.get;
const refreshed = await proj.refresh();

const version = await sk.project("PROJECT_ID").model("MODEL_ID").version("VERSION_ID").get;

// Subscriptions
const unsub = proj.onVersionsUpdate((evt) => console.log("new version", evt));
// later: unsub();

await sk.dispose();
```

### Object Loading

`@suffolk/speckle` can load Speckle object graphs through
`@speckle/objectloader2` and send loaded graphs through Speckle object upload.
The returned load handle keeps the underlying loader alive, so call `dispose()`
when done.

```ts
const result = await sk.project("PROJECT_ID").model("MODEL_ID").loadLatestObject();

try {
  const root = await result.handle.getRoot();
  const child = await result.handle.getObject(result.handle.objectIds[1]!);
  console.log(root.speckle_type, child.speckle_type);

  const sent = await sk.project("TARGET_PROJECT_ID").model("TARGET_MODEL_ID").sendObject(
    result.handle,
    { message: "Sent from @suffolk/speckle" },
  );
  console.log(sent.versionId, sent.refId);
} finally {
  await result.dispose();
}
```

Available entrypoints include `receiveSpeckleObject(sk, ...)`,
`project.loadObject(objectId)`, `project.loadVersionObject(versionId)`,
`model.loadLatestObject()`, `model.loadVersionObject(versionId)`,
`model.loadObject(objectId)`, `model.sendObject(handle)`, and
`version.loadObject()`.

`model.sendObject(handle)` uploads the object graph, verifies that the root and
closure objects persisted, then creates a new model version with
`CreateVersionInput.objectId` set to the sent `refId`. Hash-id loaded handles are
copied directly; synthetic handles fall back to `@speckle/objectsender`.

Load cache defaults to in-memory. Use `cache: { kind: "custom", database }` to
back the loader with SQLite, DuckDB, or another data-processing store. The
custom database must preserve `getAll(ids)` order and upsert `putAll(batch)` by
`baseId`. Custom database disposal is caller-owned by default; pass
`dispose: true` only when the loader should close it.

```ts
import type { SpeckleObjectDatabase } from "@suffolk/speckle";

const database: SpeckleObjectDatabase = {
  async getAll(ids) {
    return ids.map((id) => loadSpeckleItemFromSqlite(id));
  },
  async putAll(batch) {
    await upsertSpeckleItemsIntoSqlite(batch);
  },
};

const result = await sk.project("PROJECT_ID").model("MODEL_ID").loadLatestObject({
  cache: { kind: "custom", database },
});
```

DuckDB support is exposed as an optional subpath so normal clients do not load
native DuckDB bindings. The cache adapter stores raw loader items; the graph
indexer builds structural tables for property/display/proxy queries.

```ts
import { DuckDBConnection } from "@duckdb/node-api";
import {
  createDuckDbObjectDatabase,
  indexSpeckleObjectGraph,
} from "@suffolk/speckle/duckdb";

const connection = await DuckDBConnection.create();
const database = createDuckDbObjectDatabase({ connection });
const result = await sk.project("PROJECT_ID").model("MODEL_ID").loadLatestObject({
  cache: { kind: "custom", database },
});

try {
  await indexSpeckleObjectGraph({
    connection,
    handle: result.handle,
    projectId: "PROJECT_ID",
    modelId: "MODEL_ID",
    versionId: result.versionId,
  });
} finally {
  await result.dispose();
}
```

To create an inspectable DuckDB file from `test/source-examples.json`:

```bash
bun add -d @duckdb/node-api
SPECKLE_TOKEN=... bun run duckdb:index
```

The script writes `tmp/speckle.duckdb` by default. Override with
`SPECKLE_DUCKDB_PATH=path/to/file.duckdb`. Index only one manifest source with
`SPECKLE_DUCKDB_SOURCE_INDEX=0`.

Inspect from the DuckDB CLI:

```bash
brew install duckdb
duckdb -readonly tmp/speckle.duckdb
.read scripts/duckdb-inspect.sql
```

Or run the canned inspection directly:

```bash
bun run duckdb:inspect
```

### Transforms

Pure data reshapers — zero I/O. Imported separately from loaders.

```ts
import { transforms } from "@suffolk/speckle";

const sorted = transforms.version.sortByCreatedAtDesc(versions);
const grouped = transforms.project.byWorkspace(projects);
```

### Typed SDK escape hatch

For full coverage of every Speckle operation defined in `src/operations/`, use the generated SDK directly:

```ts
import { Speckle, getSdk } from "@suffolk/speckle";

const sk = new Speckle({ token: "..." });
const sdk = getSdk(sk.http);

const { project } = await sdk.GetProject({ id: "PROJECT_ID" });
```

## Codegen

`src/operations/**/*.graphql` is the typed surface. Run:

```bash
SPECKLE_SERVER=https://app.speckle.systems bun run codegen
```

Outputs to `src/generated/`:
- `schema.graphql` — full SDL
- `introspection.json` — minified introspection blob
- `sdk.ts` — typed `getSdk(client)` wrapper + every operation, input, and object type

Add new ops by dropping `.graphql` files into `src/operations/<domain>/{queries,mutations,subscriptions}.graphql` and re-running codegen.

## CLI (optional)

An opt-in CLI + TUI ships as a subpath export at `@suffolk/speckle/cli`. It
is **not** wired to a `bin` entry — install the optional peers and either
invoke the dist file directly or alias it yourself.

```bash
# Add the CLI/TUI peer deps
bun add citty
# Add the TUI peers (optional, only needed for `speckle tui`)
bun add @opentui/core @opentui/react react

# Run from the installed package
node node_modules/@suffolk/speckle/dist/cli/index.js account info
# or alias it
alias speckle="node $(node -p "require.resolve('@suffolk/speckle/cli')")"
speckle account info
```

### Auth

Credentials resolve in this order:

1. `SPECKLE_TOKEN` + `SPECKLE_SERVER` env vars (matches the library)
2. `~/.speckle/config.json`, populated by `speckle auth login`

```bash
speckle auth login --token <PAT> --profile dev --setDefault
speckle auth list
speckle auth logout --profile dev
```

The config file is written `0600` and contains your token — treat it like
`~/.netrc`.

### Commands

```bash
speckle account info                        # account + permissions matrix
speckle project ls [--workspace ID]         # list active user's projects
speckle project show <id>                   # project details
speckle model ls <projectId>                # models in a project
speckle model show <projectId> <modelId>    # model details
speckle version ls <projectId> <modelId>    # versions of a model
speckle insight ls <projectId>              # insights on a project
speckle insight results <projectId> <insightId> [--model id [--version id]]
speckle template apply spec.json|spec.yaml  # run applyProjectTemplate workflow
speckle tui                                 # interactive opentui browser
```

Add `--json` to any read command for pipe-friendly JSON. Pass
`--profile <name>` / `--server <url>` / `--token <t>` on any command to
override credentials.

## Architecture

```
transport (HTTP + WS)  →  generated SDK  →  nodes (lazy refs) / object loader  →  transforms (pure)
```

- **`src/transport/`** — HTTP via `graphql-request`, subs via `subscriptions-transport-ws` (Speckle's WS server speaks the legacy `graphql-ws` subprotocol; the modern `graphql-ws` lib is incompatible).
- **`src/generated/`** — codegen output. Do not edit.
- **`src/nodes/`** — `Speckle → Project → Model → Version` lazy classes; `User`, `Workspace` siblings.
- **`src/objects.ts`** — object graph loading through patched `@speckle/objectloader2`.
- **`src/transforms/`** — pure data reshapers; never load.

Rule: **commands either load or transform — never both.**

## Scripts

- `bun run codegen` — regenerate SDK + types
- `bun run lint` — run Biome checks over source, tests, scripts, and codegen config
- `bun run typecheck` — `tsc --noEmit`
- `bun test` — unit tests
- `bun run build` — emit `dist/` (multi-file ESM + `.d.ts`) via `tsc -p tsconfig.build.json`
- `bun run prepare` — runs automatically when consumers install from git
- `SPECKLE_OBJECT_SEND_LIVE=1 bun test test/objects.live.test.ts -t send` — opt-in live source-to-target object send; writes a target model version

## Releasing

Releases are branch-driven stable semver tags:

- First release tags current `package.json` version, such as `v0.2.0`.
- Push to `stage` creates a patch release, such as `v0.2.1`.
- Push to `main` creates a minor release, such as `v0.3.0`.
- Manual workflow dispatch can choose `major`, `minor`, or `patch`.

The release workflow runs lint, typecheck, tests, and build; updates
`package.json` and `bun.lock` for bumped releases; commits
`chore(release): vX.Y.Z`; creates the tag; and creates a GitHub Release.
`CHANGELOG.md` is not generated; GitHub Releases are the release log.

Consumers pin via release tags:

```bash
bun add github:david-morgan-suffolk/speckle-ts#v0.2.0
```

## License

MIT
