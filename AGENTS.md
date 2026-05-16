# Agent Guide

## Project Context

`@suffolk/speckle` is a TypeScript client for the Speckle GraphQL API. It exposes lazy node refs for Speckle resources, typed GraphQL access, pure transforms, workflows, and an optional CLI/TUI.

Additional durable context lives in `.context/`:

- `.context/project-context.md` - purpose, architecture, ownership, current state, and deferred work.
- `.context/engineering-guide.md` - commands, TypeScript style, testing patterns, boundaries, and safety rules.
- `.context/roadmap-notes.md` - durable decisions, milestones, accepted debt, and staged work.

## Repo Shape

| Path | Owns |
|------|------|
| `src/client.ts` | Root `Speckle` client, server/token config, lazy node factories, URL refs. |
| `src/transport/` | HTTP, WebSocket subscriptions, auth headers, hooks, APQ, validation, errors. |
| `src/objects.ts` | Speckle object graph loading/sending via patched `@speckle/objectloader2` and `@speckle/objectsender`; dispose load handles. |
| `src/nodes/` | Lazy Speckle resource classes and entity operations. |
| `src/operations/` | Source GraphQL documents for codegen. |
| `src/generated/` | Generated schema, introspection, and typed SDK. Do not hand edit. |
| `src/transforms/` | Pure data reshapers. No network I/O. |
| `src/workflows/` | Higher-level orchestration built from nodes and generated operations. |
| `src/cli/` | Optional command-line and OpenTUI surfaces. |
| `test/` | Bun unit tests, GraphQL mock handlers, fixtures, and live-test entrypoints. |

## Commands

Use Bun for local development.

- `bun install` - install deps from `bun.lock`.
- `bun run typecheck` - run `tsc --noEmit`.
- `bun test` - run Bun tests; live tests skip unless `SPECKLE_TOKEN` is present.
- `bun run build` - emit `dist/` with `tsc -p tsconfig.build.json` and `tsc-alias`.
- `SPECKLE_SERVER=https://app.speckle.systems bun run codegen` - regenerate `src/generated/` from `src/operations/**/*.graphql`.
- `bun run cli -- <args>` - run the optional CLI from source.
- `bun run snapshot:insights` - run the live insights snapshot test; requires Speckle credentials.

Command scope rule: cite exact scope only. Do not claim live tests, codegen, or release validation ran unless they did.

## TypeScript Standards

- TypeScript is strict with `noUncheckedIndexedAccess` and `noImplicitOverride` enabled.
- Project is ESM. Use explicit `.js` extensions on relative runtime imports from source files.
- Use `@/*` imports for public-ish source exports where existing files do; otherwise follow local relative style.
- Keep exported API changes deliberate. Update `src/index.ts`, tests, README, and generated declarations expectations together.
- Keep lazy node refs lazy: constructors and chain methods must not fetch. Fetch only on `.get`, `refresh()`, explicit list/mutation helpers, or subscriptions.
- Object graph handles keep ObjectLoader2 state alive; callers must dispose them after use. Sending creates a new model version from the objectsender hash.
- Commands either load or transform, never both. Keep `src/transforms/` pure and zero I/O.
- Keep comments concise and only when they explain non-obvious API, protocol, or safety behavior.

## Testing

- Add or update Bun tests next to the relevant area in `test/`.
- Prefer mocked GraphQL handlers in `test/_helpers/handlers/` over live Speckle calls.
- Live tests must stay gated with `test.skipIf(!TOKEN)` and document required env vars. Use named scripts or file paths for intentional live runs.
- For transport and subscription changes, cover cleanup/dispose behavior and error paths.
- For generated GraphQL changes, update `src/operations/`, run codegen, and do not hand edit generated output.

## Safety

- Do not read or copy `.env`; use `.env.example` only for variable names.
- Treat `SPECKLE_TOKEN`, auth headers, profile config in `~/.speckle/config.json`, server-specific payload dumps, database URLs, DSNs, and local credential values as secrets.
- Do not log tokens, bearer headers, or full request headers in hooks, CLI output, test failures, or docs.
- Preserve unrelated dirty work. Never revert files you did not intentionally change.
- Keep generated files and `dist/` changes out of normal edits unless the task is codegen/build output.

## Where To Edit

- Start with `.context/project-context.md` for architecture and ownership.
- Start with `.context/engineering-guide.md` for commands, tests, style, and safety.
- Keep root guidance compact. Move durable detail into `.context/`.
- Update `.context/roadmap-notes.md` for durable decisions, accepted debt, and staged work.

## Maintenance

- Update this file when commands, package ownership, or safety boundaries change.
- Do not use this file as a task log; use issues, PRs, or `.context/current-focus.md` for short-lived operational notes.
