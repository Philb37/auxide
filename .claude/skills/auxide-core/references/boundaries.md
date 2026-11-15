# Boundaries (contracts between layers)

Most cross-layer bugs come from two sides of a boundary drifting apart. Check both sides together.

## 1. `core` ↔ `auxide-wasm` ↔ `AuxideApi` (TypeScript) ↔ Svelte

- `auxide-wasm` exports are thin: convert JS-friendly DTOs to domain types, call a use case, convert the result back. No rule, no computation.
- The wasm module runs in a Web Worker (OPFS sync access handles need it). `AuxideApi` in `web/src/lib/api/` hides the worker messaging and the raw `wasm-bindgen` exports; nothing else in `web/` imports `auxide-wasm`.
- **Cents across the boundary:** `wasm-bindgen` maps `i64` to a JS `BigInt`. Decide once, in one place: either the facade converts to `number` (safe: cents stay far below 2^53) or the UI works with `bigint`. Never let floats in.
- Errors cross as **typed codes** (an enum / discriminated union), not message strings, so the UI picks the copy from the string files.
- Every `AuxideApi` method has a matching wasm export, the same parameter and result shapes, and a mock implementation for component tests.

## 2. `api-types` ↔ `http-client` ↔ `server`

- `api-types` is the only definition of the HTTP contract; both sides use it, so the shapes cannot drift at compile time. What can still drift: semantics (units, optional fields, error codes) and versions.
- Old clients exist: a phone offline for a week will push with the old contract after the server was updated. Changes must be additive (new optional fields), or versioned.
- `push`/`pull` are idempotent (change ids); shared pocket writes carry an idempotency key and the version they started from (F0.6, F0.6b).
- Money is integer cents in JSON too.

## 3. `server` handlers ↔ `core`

Handlers parse the request, authenticate, call a use case, map the result to an `api-types` response. Permission rules (only members read/write a pocket, F0.7) are checked in the use cases, not only in SQL or in the handler.

## 4. `tauri-shell` ↔ `web/`

There is no contract: the shell only loads the static build. No `#[tauri::command]`, no `@tauri-apps/api` calls from `web/`. A future exception (for example the Tauri updater in F0.10, or a native save dialog for CSV export in F8.4) is a decision to record in `CLAUDE.md` first.
