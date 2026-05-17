# Roadmap Notes

This file keeps durable project knowledge. It is not a task tracker.

## Completed Milestones

### Initial Speckle TypeScript Client

Delivered:

- Lazy-node client model for Speckle resources.
- HTTP GraphQL transport and WS subscription transport.
- Generated TypeScript SDK from Speckle GraphQL documents.
- Pure transforms under `src/transforms/`.
- Bun tests with mocked GraphQL handlers.

### Optional CLI And TUI Surface

Delivered:

- `@suffolk/speckle/cli` subpath export.
- Auth profile commands using `~/.speckle/config.json`.
- Project, model, version, account, insight, and template command surfaces.
- Optional OpenTUI browser surface.

### Agent Context Baseline

Delivered 2026-05-15:

- Canonical root `AGENTS.md`.
- Singular `AGENT.md` compatibility shim.
- `.context/project-context.md`, `.context/engineering-guide.md`, and `.context/roadmap-notes.md`.

## Durable Decisions

- Use `AGENTS.md` as the canonical agent entrypoint.
- Keep `.context/` for larger durable context split by purpose.
- Use Bun for local install, tests, scripts, and build commands.
- Keep node refs lazy; no network during resource chaining.
- Keep transforms pure and zero I/O.
- Keep GraphQL operation documents as source and generated output as derived.
- Keep CLI/TUI deps optional for library consumers.
- Require Bun patching for `@speckle/objectloader2@2.28.0` until upstream exports loader internals or this package switches to a fork.
- Object loading accepts caller-provided cache databases for SQLite/DuckDB-backed data processing; custom DB disposal remains caller-owned unless explicitly opted in.
- Do not read, copy, log, or commit Speckle tokens or local auth profile values.

## Accepted Tech Debt

- Some GraphQL exists inline in node files while codegen documents also exist under `src/operations/`.
- `src/generated/` is committed source-adjacent generated output and must be regenerated carefully.
- Live tests exist and require explicit credentials/network handling.
- Optional CLI/TUI package surfaces share the repo with the core client, so import boundaries need active review.

## Staged Work

- Object send path: `model.sendObject(handle)` hydrates Big-compatible detach boundaries, calls `@speckle/objectsender`, then creates a version with `CreateVersionInput.objectId = send.hash`, optional `parents`, `message`, `sourceApplication`, and `totalChildrenCount`.
- Live send validation target: receive source project `99f2e54226` model `75ca627877`, send into target project `61ae2ba25d` model `3a716dc9c4`, gated by `SPECKLE_TOKEN` plus `SPECKLE_OBJECT_SEND_LIVE=1` because it writes a target version.
- Accepted send caveat: ObjectLoader2 streaming can hang if Speckle closes an object-stream socket mid-batch; live send test is opt-in until loader retry/abort handling is hardened.
- Expand operation coverage by adding `.graphql` documents, regenerating SDK output, and adding focused tests.
- Tighten CLI/TUI optional dependency boundaries as command surfaces grow.
- Keep README examples aligned with exported API and auth behavior.
- Revisit context files when package scripts, generated paths, or Speckle auth flows change.

## Refresh Checklist

- Commands still match `package.json`.
- Public exports still match README examples and generated declarations.
- Generated output still matches `src/operations/**/*.graphql` and `codegen.ts`.
- Safety rules still cover Speckle token, bearer header, and CLI profile handling.
