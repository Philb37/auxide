# Auxide

Auxide is a personal and shared budgeting app. You track spendings and incomes in **pockets**. *Everyday* is the default monthly pocket, and other pockets cover a trip, a car or a shared flat. Shared pockets split costs between friends and show who owes whom. Categories carry monthly or one-off budgets, and rules categorise entries automatically from their name.

- **Local-first for your own data.** Personal pockets work fully offline and without an account. Every write goes to the device first and syncs later.
- **Online-first for shared pockets.** Changes to a shared pocket go straight to the server, so every member sees the same truth. Without a connection, a shared pocket stays readable from the local copy but can't be changed.
- **Optional account.** Signing in syncs your pockets across devices and lets you share pockets with other people.
- **One UI everywhere.** The same SvelteKit build runs as a PWA on phone and tablet and inside a Tauri shell on desktop. There is no native iOS or Android app.

Product scope and milestones are in [`Auxide Backlog.md`](Auxide%20Backlog.md). The visual language (tokens, components, brand) is in [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md).

## Architecture

All the business logic is written once, in Rust, in a pure `core` crate. Everything else is an adapter or a composition root around it (hexagonal architecture, also called ports and adapters).

```
                ┌──────────────────────────── client (browser / webview) ───────────────────────────┐
                │                                                                                   │
  Phone/tablet  │   SvelteKit UI (Svelte 5, TS, static adapter)                                     │
  = PWA         │        │  TS facade: AuxideApi                                                    │
                │        ▼                                                                          │
  Desktop       │   app-wasm  (wasm-bindgen, runs in a Web Worker)                                  │
  = Tauri shell │        ├── core            domain, use cases, port traits                         │
  serving the   │        ├── storage-opfs    SQLite compiled to wasm, database file in OPFS         │
  same build    │        └── sync-http       HTTP client to the server (reqwest → fetch)            │
                └────────────────────────────────────────────┬──────────────────────────────────────┘
                                                             │ HTTPS + JSON (api-types)
                                                             ▼
                                         server (Actix Web)
                                              ├── core            same domain rules
                                              ├── storage-pg      PostgreSQL via diesel-async
                                              └── auth            magic link, sessions
```

### The pieces

| Piece | Kind | Role |
|---|---|---|
| `crates/core` | Pure Rust library | Domain model (Pocket, Entry, Category, Rule, Member, Settings), money and periods, splits and balances, rule matching, sync merge rules, use cases. Defines the **ports** (traits) for storage, sync, clock and id generation. No I/O, no framework, no `wasm-bindgen`. |
| `crates/api-types` | Rust library | Request and response types for the HTTP API, shared by `sync-http` and `server` so the contract can't drift. |
| `crates/storage-opfs` | Adapter | Implements the core storage ports with SQLite compiled to wasm, keeping the database file in the browser's Origin Private File System. |
| `crates/sync-http` | Adapter | Implements two core ports. **Sync**: pushes queued changes of personal pockets and pulls remote ones. **Remote**: sends shared pocket changes straight to the server and waits for its answer. Uses `reqwest`, which uses `fetch` on the wasm target. |
| `crates/app-wasm` | Composition root | Wires `core` + `storage-opfs` + `sync-http` and exposes a small `wasm-bindgen` API to the frontend. Runs in a Web Worker, because OPFS sync access handles are only available in workers. |
| `web/` | SvelteKit frontend | The whole UI, for every screen size. Talks to the domain only through a typed TS facade (`AuxideApi`) that wraps the wasm module. Holds no business rules. |
| `src-tauri/` | Desktop shell | Packages the static `web/` build into a desktop app. No business logic and no database of its own: it uses the same wasm crate and OPFS as the browser. |
| `crates/server` | Composition root | Actix Web server. Wires `core` with `storage-pg` and auth. Runs the **same core rules** as the client, so validation, splits, balances and conflict resolution give identical results on both sides. |
| `crates/storage-pg` | Adapter | Implements the server-side storage ports on PostgreSQL with `diesel` and `diesel-async` (migrations with `diesel_migrations`). |

### Dependency rule

Dependencies only point inward:

```
web ──▶ app-wasm ──▶ storage-opfs ─┐
                └──▶ sync-http ────┼──▶ core
server ──▶ storage-pg ─────────────┘
sync-http, server ──▶ api-types
```

`core` depends on nothing in the workspace. Adapters depend on `core`. Only composition roots (`app-wasm`, `server`) know which adapters are in use.

### Why the frontend goes through a TS facade

`web/` never calls `wasm-bindgen` exports directly. It calls `AuxideApi`, a TypeScript interface implemented today by a wasm-backed client. This keeps Svelte code independent of how the domain is hosted, and makes it easy to mock in component tests.

### Two write paths

The `core` use cases pick the path from the pocket, so the UI never decides it:

| Pocket | Write path | Offline |
|---|---|---|
| Personal (Everyday, solo pockets) | Local-first: write to SQLite in OPFS and an outbox, then `sync()` pushes and pulls in the background. Last write wins per field across your own devices. | Fully usable. |
| Shared | Online-first: the change is sent to the server through the remote port. Only after the server accepts it is it written to the local copy. The server pushes other members' changes live. | Read-only from the local copy, with an *Offline · changes paused* notice. |

There is no offline queue for shared pockets, so members never have to resolve conflicting edits.

### Linux desktop

SQLite in OPFS needs `FileSystemSyncAccessHandle`. WebView2 (Windows) and WKWebView (macOS, Safari 17+) support it. Tauri on Linux uses the distro's WebKitGTK, and support there is unconfirmed. Linux desktop is not a target for other users, so there is no separate native storage path. It is checked during the first desktop build (F0.1). If it fails, the fix is a newer WebKitGTK, or using the PWA in a Chromium or Firefox browser.

## Repository layout

```
auxide/
├── Cargo.toml              # Rust workspace
├── crates/
│   ├── core/
│   ├── api-types/
│   ├── storage-opfs/
│   ├── sync-http/
│   ├── app-wasm/
│   ├── storage-pg/
│   └── server/
├── web/                    # SvelteKit app (pnpm)
├── src-tauri/              # Tauri desktop shell
└── design/                 # design system reference (tokens, components, guidelines)
```

## Tech stack

- **Domain:** Rust (stable), pure library, unit tested.
- **Frontend:** SvelteKit with Svelte 5 and TypeScript, `adapter-static` (SPA, no server rendering), Vite, pnpm. PWA with a service worker that caches the app shell.
- **Client storage:** SQLite compiled to wasm, database in OPFS, accessed from a Web Worker.
- **Desktop:** Tauri 2, serving the static frontend build.
- **Server:** Actix Web, PostgreSQL with `diesel` + `diesel-async`.
- **Sync:** personal pockets are local-first (outbox, last write wins per field, tombstones for deletes). Shared pockets are online-first (direct HTTPS calls, live updates from the server, read-only offline).
