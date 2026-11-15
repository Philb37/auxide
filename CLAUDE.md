# Auxide — project rules

Budgeting app: Rust domain written once, SvelteKit UI everywhere (PWA on phone/tablet, Tauri shell on desktop), Actix server for sync and shared pockets. Product scope: `BACKLOG.md`. Visual language: `design-system/DESIGN-SYSTEM.md`.

## Who writes what

- **Rust (`crates/**`, `tauri-shell/`) is written by the user.** Do not edit Rust files unless explicitly asked. Review, explain and suggest instead (`rust-reviewer`).
- **The Svelte UI (`web/`) is mostly written by Claude**, following the `auxide-ui` skill.
- If a UI task needs something the Rust side does not expose yet, stop and say exactly what is missing (use case, `AuxideApi` method, type). Never work around it in TypeScript.

## Architecture (hexagonal + DDD) — non-negotiable

Crates (real names):

| Crate | Role | May depend on (workspace) |
|---|---|---|
| `auxide-core` (`crates/core`) | Domain + use cases + ports. Pure: no I/O, no framework, no infra crate | nothing |
| `auxide-api-types` (`crates/api-types`) | HTTP contract (request/response DTOs) | nothing |
| `auxide-storage-opfs` (`crates/storage-opfs`) | Adapter: SQLite in OPFS | core |
| `auxide-storage-pgsql` (`crates/storage-pgsql`) | Adapter: PostgreSQL (diesel-async) | core |
| `auxide-http-client` (`crates/http-client`) | Adapter: sync + remote ports over HTTP | core, api-types |
| `auxide-wasm` (`crates/wasm`) | Composition root for the client: wiring + `wasm-bindgen` exports only | core, storage-opfs, http-client, api-types |
| `auxide-server` (`crates/server`) | Composition root for the server: wiring + Actix handlers only | core, storage-pgsql, api-types |
| `auxide-tauri-shell` (`tauri-shell/`) | Desktop window around the static `web/` build | no auxide crate |

- Dependencies point inward, to `core`. Only composition roots know which adapters exist.
- **No domain logic outside `core`**: not in `wasm` (it maps types and forwards calls), not in `server` handlers (they parse, call a use case, map the result), not in adapters (they translate), not in `web/` (it displays), not in `tauri-shell` (it is only a shell: no commands, no storage, no business logic).
- `web/` reaches the domain only through the TypeScript facade `AuxideApi` (`web/src/lib/api/`). Only that folder imports `auxide-wasm`. Svelte components never compute totals, splits, balances, periods or rule matches.
- Time, randomness and ids enter `core` only through ports (`Clock`/HLC, `IdGenerator`). `core` never calls `SystemTime::now`, `Uuid::now_v7`, `rand`.
- Money is integer cents (`i64`) everywhere, never floats, including across the wasm and HTTP boundaries.

Checked automatically by `bash .claude/skills/auxide-core/scripts/check-architecture.sh` (dependency graph, forbidden crates in `core`, clock/random calls in `core`, `auxide-wasm` imports in `web/`, Tauri commands/IPC). Details and the why: `auxide-core` skill.

## Skills, agents, workflows

| Kind | Name | Use |
|---|---|---|
| Skill | `auxide-core` | Rules for `crates/**`: hexagonal + DDD, domain rules (cents, HLC, tombstones, write paths) |
| Skill | `auxide-ui` | Rules for `web/`: library map, tokens, porting, `check-ui.sh` |
| Skill (global) | `rust-best-practices`, `svelte-core-bestpractices`, `svelte-code-writer` | Language-level guidance |
| Agent | `svelte-file-editor` | Writes/edits Svelte files (project version: + `auxide-ui`) |
| Agent | `verifier` | Runs the CI checks locally, reports failures only |
| Agent | `ui-reviewer`, `rust-reviewer`, `contract-reviewer` | Read-only reviews |
| Workflow | `/review [ref]` | Diff → matching reviewers in parallel + verifier → one report |
| Workflow | `/verify-feature <backlog id>` | `/review` + every acceptance criterion checked with evidence |
| Workflow | `/feature-ui <backlog id>` | Build the UI of a backlog item on top of the existing `AuxideApi` |
| Workflow | `/port-components <group>` | Port design-system components to Svelte in parallel (F0.4f) |

## Commands

- Rust: `cargo fmt --all --check` · `cargo clippy --workspace --all-targets -- -D warnings` · `cargo test --workspace` · `cargo check -p auxide-core --target wasm32-unknown-unknown`
- Wasm: `wasm-pack build crates/wasm --dev --target web --out-dir pkg`
- Web (in `web/`): `pnpm check` · `pnpm test`
- Guardrails: `bash .claude/skills/auxide-core/scripts/check-architecture.sh` · `bash .claude/skills/auxide-ui/scripts/check-ui.sh`
