# Project Context

## What This Repo Is

`@suffolk/speckle` is a TypeScript client for the Speckle GraphQL API. It carries forward the lazy-node design from `sasakiassociates/speckle` while using modern Speckle naming: Project, Model, Version, Workspace, Account, Insight, Automation, Dashboard, Webhook, Issue, and FileImport.

The package is distributed from GitHub rather than npm. Consumers install the repo and use the built `dist/` ESM package plus `.d.ts` declarations.

## Architecture

```text
consumer code / CLI
  -> Speckle client
  -> HTTP + WS transports
  -> generated SDK or node-local GraphQL operations
  -> lazy nodes, object graph loader, workflows, pure transforms
```

Core rules:

- `Speckle` owns server, token, HTTP client, WS client, hooks, APQ, and lazy resource factories.
- Node classes model Speckle resources. They can create refs without I/O and fetch on `.get`, `refresh()`, list helpers, mutations, or subscriptions.
- `src/objects.ts` loads object graphs through patched `@speckle/objectloader2` and returns explicit-dispose handles.
- Transforms are pure data reshapers and must never load from Speckle.
- GraphQL documents in `src/operations/` are the source for `src/generated/`.
- The CLI and TUI are optional package surfaces. They should not force optional peer deps on library consumers.

## Ownership Map

| Area | Owns |
|------|------|
| `src/client.ts` | Public client construction, lazy refs, URL-derived refs, dispose. |
| `src/transport/http.ts` | GraphQL HTTP client, auth headers, fetch hooks, APQ wrapping. |
| `src/transport/ws.ts` | Speckle subscriptions over the legacy `graphql-ws` subprotocol used by `subscriptions-transport-ws`. |
| `src/transport/validate.ts` and `src/schemas.ts` | Runtime validation of Speckle responses with Zod. |
| `src/objects.ts` | ObjectLoader2 construction, object-id/version/model-head resolution, streamed object handles, disposal. |
| `src/nodes/` | Resource-specific queries, mutations, subscriptions, and lazy chaining. |
| `src/operations/` | Codegen source documents grouped by Speckle domain. |
| `src/generated/` | Generated schema, introspection, typed SDK. |
| `src/transforms/` | Pure helpers for grouping, sorting, filtering, and reshaping data. |
| `src/workflows/` | Multi-step orchestration such as project templates and project trees. |
| `src/cli/` | Optional CLI commands, auth profile handling, formatting, fuzzy search, TUI. |
| `test/` | Unit tests, mock GraphQL server helpers, fixtures, and live-test files. |

## Current Product State

- Public package name is `@suffolk/speckle`.
- Package is private to npm and released through GitHub tags/releases.
- Package is ESM and exposes root library API plus `@suffolk/speckle/cli`.
- `graphql` is a peer dependency.
- `@speckle/objectloader2` is a runtime dependency and is patched via Bun `patchedDependencies` to expose loader internals.
- `@speckle/objectsender` is a runtime dependency for sending hydrated object graphs before creating model versions.
- Optional CLI/TUI peers include `citty`, `yaml`, `fuse.js`, `picocolors`, `react`, `@opentui/core`, and `@opentui/react`.
- `prepare` runs `bun run clean && bun run build` for git installs.
- CI/release workflows run Biome lint, TypeScript typecheck, Bun tests, and build.
- Default server is `https://app.speckle.systems`.
- `SPECKLE_TOKEN` and `SPECKLE_SERVER` env vars are the library/CLI auth baseline.
- CLI auth can read/write `~/.speckle/config.json`; treat it as secret-bearing.

## External Integrations

- Speckle GraphQL HTTP endpoint at `<server>/graphql`.
- Speckle WebSocket subscription endpoint derived from the configured server.
- GraphQL Code Generator reads the configured Speckle schema via `SPECKLE_SERVER`.
- Object graph loading uses Speckle REST object endpoints via `@speckle/objectloader2`.
- Object graph sending uses `@speckle/objectsender`, then `versionMutations.create` with the returned hash as `CreateVersionInput.objectId`.
- Optional OpenTUI React TUI surface depends on terminal capabilities and optional peer deps.

## Deferred Work

- Keep generated Speckle coverage aligned with `src/operations/**/*.graphql` as API coverage expands.
- Keep optional CLI/TUI dependencies optional for library-only consumers.
- Keep live tests isolated from the default unit test path unless credentials and network access are intentional.

## Non-Goals

- This repo should not become a Speckle server implementation.
- This repo should not own persistence beyond local CLI auth profile config.
- Transforms should not become loaders or hide network calls.
