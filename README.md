# @suffolk/speckle

TypeScript client for the [Speckle](https://speckle.systems) GraphQL API.

Carries forward the lazy-node design from `sasakiassociates/speckle` and updates to the modern Speckle naming (Project / Model / Version). Covers queries, mutations, and subscriptions.

## Install

This package is distributed via GitHub, not npm. Install from the repo:

```bash
# npm
npm install graphql github:david-morgan-suffolk/speckle-ts

# bun
bun add graphql github:david-morgan-suffolk/speckle-ts

# pin a specific commit / tag / branch
npm install github:david-morgan-suffolk/speckle-ts#v0.1.0
npm install github:david-morgan-suffolk/speckle-ts#main
```

`graphql` is a peer dependency. The package's `prepare` script builds `dist/` from source on install (uses TypeScript from devDeps; no bundler required).

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

## Architecture

```
transport (HTTP + WS)  →  generated SDK  →  nodes (lazy refs)  →  transforms (pure)
```

- **`src/transport/`** — HTTP via `graphql-request`, subs via `subscriptions-transport-ws` (Speckle's WS server speaks the legacy `graphql-ws` subprotocol; the modern `graphql-ws` lib is incompatible).
- **`src/generated/`** — codegen output. Do not edit.
- **`src/nodes/`** — `Speckle → Project → Model → Version` lazy classes; `User`, `Workspace` siblings.
- **`src/transforms/`** — pure data reshapers; never load.

Rule: **commands either load or transform — never both.**

## Scripts

- `bun run codegen` — regenerate SDK + types
- `bun run typecheck` — `tsc --noEmit`
- `bun test` — unit tests
- `npm run build` — emit `dist/` (multi-file ESM + `.d.ts`) via `tsc -p tsconfig.build.json`
- `npm run prepare` — runs automatically when consumers `npm install` from git

## Releasing

Tag a release on GitHub for stable installs:

```bash
git tag v0.1.0
git push --tags
```

Consumers then pin via `github:david-morgan-suffolk/speckle-ts#v0.1.0`.

## License

MIT
