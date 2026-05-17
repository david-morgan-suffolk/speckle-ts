# Engineering Guide

## Commands

Use Bun for local development.

- `bun install` - install dependencies from `bun.lock`.
- `bun run typecheck` - run `tsc --noEmit` against `src/**/*`, `test/**/*`, and `codegen.ts`.
- `bun run lint` - run `biome lint src test scripts codegen.ts`.
- `bun run lint:fix` - run `biome lint --write src test scripts codegen.ts`.
- `bun run format` - run `biome format --write src test scripts codegen.ts`.
- `bun test` - run Bun tests under `test/`; live tests skip unless `SPECKLE_TOKEN` is present.
- `bun run build` - build `dist/` with `tsconfig.build.json` and `tsc-alias`.
- `SPECKLE_SERVER=https://app.speckle.systems bun run codegen` - regenerate schema, introspection, and SDK from GraphQL documents.
- `bun run codegen:watch` - watch GraphQL documents during operation authoring.
- `bun run cli -- <args>` - run the CLI entrypoint from source.
- `bun run snapshot:insights` - run the live insights snapshot test; requires Speckle credentials and network access.
- `bun run account:info` - run the local account-info helper; requires Speckle credentials.
- `bun run template:new` - run the template creation helper.

Do not overstate command scope. `bun test` is not proof that codegen, build output, or package install from GitHub works unless those were run separately. If `SPECKLE_TOKEN` was absent, it is not proof that live tests passed.

## Releases

- Package name is `@suffolk/speckle`.
- `package.json` is private; releases are GitHub tags/releases, not npm publications.
- Releases are branch-driven stable semver tags.
- The first release tags the current `package.json` version.
- Pushes to `stage` create patch releases.
- Pushes to `main` create minor releases.
- Manual workflow dispatch can choose `major`, `minor`, or `patch`.
- The release workflow runs lint, typecheck, tests, and build before versioning.
- The release workflow updates `package.json`, refreshes `bun.lock`, commits `chore(release): vX.Y.Z` for bumped releases, tags the release commit, and creates a GitHub release.
- Do not add `CHANGELOG.md` automation unless explicitly requested; GitHub Releases are the release log.

## TypeScript

Detected TS config:

- `tsconfig.json` targets `ESNext`, uses `module: preserve`, `moduleResolution: bundler`, `jsxImportSource: @opentui/react`, `strict`, `noUncheckedIndexedAccess`, and `noImplicitOverride`.
- `tsconfig.build.json` emits ESM, declarations, declaration maps, source maps, and `dist/` from `src/` only.

Style rules:

- Prefer small, direct functions over new abstractions unless reuse is clear.
- Keep naming clean, explicit, and aligned with Speckle domain terms.
- Use `type` imports/exports when importing types only.
- Keep public exports intentional and mirrored in `src/index.ts` when part of the package API.
- Preserve existing import style: relative imports include runtime `.js`; root barrel exports use `@/*` where already established.
- Avoid defaulting to `any`. Parse unknown external data with schemas or narrow it locally.
- Keep `src/generated/` generated. Change `src/operations/**/*.graphql` or codegen config instead of hand editing generated output.
- Keep functions single-purpose: load, mutate, subscribe, validate, format, or transform. Do not mix unrelated responsibilities.
- Add comments only for non-obvious protocol constraints, generated-code boundaries, credential safety, or tricky data-shape behavior.

## Testing Patterns

- Use `bun:test`.
- Prefer unit tests with mocked `fetch` or helpers from `test/_helpers/`.
- Put reusable GraphQL mocks in `test/_helpers/handlers/<domain>.ts`.
- Assert lazy behavior by checking no fetch calls before `.get`, list helpers, mutation helpers, or subscription setup.
- For pagination helpers, test multi-page behavior and exhaustion/error behavior.
- For transport hooks, assert request/response/error event shape without leaking auth headers.
- For CLI auth changes, test config permissions and token handling without committing real tokens.
- Live tests should stay explicit in filename or script naming, stay gated with `test.skipIf(!TOKEN)`, and not be required for normal unit validation.

## Boundaries

- Keep external boundary parsing close to env readers, CLI args, file readers, Speckle HTTP/WS transport, and generated SDK calls.
- Keep library code independent from CLI-only optional peers.
- Keep CLI/TUI imports from forcing optional peer deps into root library imports.
- Keep transforms pure and deterministic.
- Keep Speckle protocol quirks documented near the relevant transport or operation.
- Treat changes to node method names, return types, exports, auth behavior, and generated SDK types as contract changes.

## Safety

- Do not read `.env`; use `.env.example` only for variable names.
- Do not copy, log, or commit `SPECKLE_TOKEN`, bearer headers, profile tokens, database URLs, DSNs, AWS secrets, or local credential values.
- Treat `~/.speckle/config.json` like `~/.netrc`; it is secret-bearing.
- Avoid full request/response dumps in tests and docs when headers, tokens, or user data may be present.
- Preserve unrelated dirty work. Never revert files you did not intentionally change.
- Do not edit `dist/` unless the task explicitly needs build artifacts.

## Detected Configs

- Package manager lockfile: `bun.lock`.
- Patched dependencies: `@speckle/objectloader2@2.28.0` via `patches/@speckle%2Fobjectloader2@2.28.0.patch`.
- Object graph send dependency: `@speckle/objectsender@1.0.1`.
- Runtime/package type: ESM via `"type": "module"`.
- TypeScript configs: `tsconfig.json`, `tsconfig.build.json`.
- Codegen config: `codegen.ts`.
- Formatter/linter config: `biome.json`.
- Env names: `.env.example`; do not read `.env`.

## Context Maintenance

- Keep `AGENTS.md` compact and operational.
- Put durable architecture, decisions, and caveats in `.context/`.
- Update this guide when scripts, TS config, test layout, generated paths, or secret boundaries change.
