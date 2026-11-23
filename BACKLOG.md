# Auxide · Product backlog

Built from the Auxide prototype (phone, tablet, desktop). Written for a solo developer. The stack is decided (see `README.md`): Rust core, SvelteKit PWA on phone and tablet, Tauri desktop shell, SQLite in OPFS on every client, Actix Web + PostgreSQL server.

## How to read this

- **Epic** (E1, E2…) is a product area. **Feature** (F1.1, F1.2…) is one shippable piece with a user story and acceptance criteria (AC).
- **Release** tag on every feature: `MVP`, `v1.1` or `Later`.
- The MVP is large for one person, so it is split into **milestones**. Each milestone ends with something you can use yourself.
- **Status** line under every feature: `⬜ To do` · `🚧 In progress` · `✅ Done (YYYY-MM-DD)`. Each AC is a checkbox: `- [x]` once it is met with evidence (a test, a CI step, a manual check you ran). A feature is done when every AC box is ticked and the Definition of Done holds. `/verify-feature <id>` checks this and updates the boxes. Progress at a glance: `grep -A1 '^### F' BACKLOG.md`.

## Release plan

| Milestone | Goal | Epics |
|---|---|---|
| **M1 · Local core** | Track your own spending offline, tested in a desktop browser and on an Android phone over USB (no public hosting yet) | E0 (F0.1–F0.3, F0.4a–F0.4h, F0.9, F0.13, F0.14), E1.1, E2, E3, E4 (solo), E6, E8 |
| **M2 · Smart entry** | Entries categorise themselves | E7 |
| **M3 · Accounts & sync** | Same data on every device, with the app and server hosted over HTTPS | E0 (F0.5, F0.6, F0.11, F0.12, F0.15), E1 |
| **M4 · Shared pockets** | Split costs with friends | F0.6b, F0.7, E5 |
| **M5 · Big screens** | Tablet and desktop layouts, desktop app | E9, F0.10 |
| **M6 · Hardening** | Ready for other people | E10 |
| **v1.1** | Polish after first users | CSV export, social sign-in, second language |
| **Later** | Ideas outside the prototype | Listed at the end |

## Definition of Done (every feature)

- Works offline. Changes are saved locally first. Shared pockets are the exception: they stay readable offline but changes need a connection (F0.6b).
- Amounts are stored as integer cents and never as floats.
- Domain logic lives in the Rust `core` crate, not in Svelte components, and is covered by unit tests (totals, splits, rules, periods).
- Usable at phone width with tap targets of 44px or more, and reachable with a screen reader.
- All copy lives in the string files, not in the code.
- UI follows the `auxide-ui` skill (F0.4a): screens are built from `web/src/lib/ui` components, no dependency outside the library map, `check-ui.sh` and `svelte-autofixer` pass, and any new or changed component is in the gallery.

---

## E0 · Tech foundations

The architecture is described in `README.md`. In short: a pure Rust `core` crate holds all domain logic; the SvelteKit frontend (PWA on phone and tablet) calls it through a wasm crate that stores data in SQLite in OPFS; Tauri is only a desktop shell around the same build; an Actix Web server with PostgreSQL reuses the same `core` crate.

### F0.1 Workspace & stack setup — MVP
**Status:** 🚧 In progress
**Decided:** Rust core with hexagonal architecture; SvelteKit (Svelte 5, TypeScript, `adapter-static`, pnpm) for the whole UI; PWA on phone and tablet (no native mobile app, no Capacitor); Tauri 2 as a desktop shell only; SQLite in OPFS on every client; Actix Web + PostgreSQL on the server.
**Story:** As the developer, I want the monorepo and build pipeline in place, so that every target builds from one command.
**AC**
- [x] Monorepo with a Cargo workspace (`crates/core`, `api-types`, `storage-opfs`, `http-client`, `wasm`, `storage-pgsql`, `server`), `web/` and `tauri-shell/`.
- [x] `core` compiles for both `wasm32-unknown-unknown` and native, and has no dependency on `wasm-bindgen`, `web-sys`, Actix or `diesel` (checked in CI).
- [x] `wasm` is built with `wasm-pack` (or `wasm-bindgen-cli`) and consumed by `web/` as a local package; `pnpm dev` rebuilds it on change.
- [x] The wasm module runs in a dedicated Web Worker. `web/` talks to it through a typed TS facade (`AuxideApi`), never through raw `wasm-bindgen` exports.
- [x] A "hello pocket" build creates and lists a pocket in a desktop browser (Chrome and Firefox, `pnpm dev`), on an Android phone as an installed PWA served from the dev machine through `adb reverse tcp:5173 tcp:5173` (`localhost` counts as a secure context, which installing the PWA needs now, and the service worker (F0.9) and OPFS (F0.2) will need later), and in the Tauri shell on Linux.
- [x] CI runs `cargo fmt`, `cargo clippy`, `cargo test`, `pnpm check`, `pnpm test`, the UI checks (`check-ui.sh`, F0.4a), a wasm build of `core` and the `core` dependency check on every push to `develop` and on every pull request. CI checks only: it deploys nothing and builds no installers (see F0.12 and F0.10). Caching and build speed are in F0.13.
**Note:** the Tauri shell on Linux (EndeavourOS, WebKitGTK) is for personal use only, so if OPFS fails there the fix is a newer WebKitGTK or the PWA in a browser, not a separate storage path. Day-to-day testing happens in the browser; the shell is opened from time to time to check it still works.

### F0.2 Local data model & storage — MVP
**Status:** ⬜ To do
**Story:** As a user, I want my data saved on the device, so that the app works without a connection.
**AC**
- [ ] Entities in `core`: Pocket, Entry (spend / income / settle), Category, Rule, Member, Settings.
- [ ] Entries keep `amount` (cents, `i64`), `date`, `kind`, `categoryId?`, `pocketId`, `countsInEveryday`, `mandatory`, `paidBy`, and `split {mode, values}`.
- [ ] Ids are generated on the client (UUIDv7) so records can be created offline and synced without remapping.
- [ ] Every synced record carries `updatedAt`, a per-field version or HLC timestamp, `deletedAt?` (tombstone) and `deviceId`, as needed by F0.6.
- [ ] `core` defines repository ports (traits); `storage-opfs` implements them with SQLite in OPFS. Use cases are tested against an in-memory adapter.
- [ ] The app calls `navigator.storage.persist()` so the browser doesn't evict the database; the result is shown in Settings if refused.
- [ ] Writes are transactional: an entry and its effects are saved together or not at all.
- [ ] Data survives an app restart and a device reboot.
- [ ] One tab at a time: the Worker holds a Web Lock (`navigator.locks`) on the database while it is open, because OPFS sync access handles are exclusive. A second tab or window does not open the database and shows *Auxide is open in another tab* instead of failing. Several tabs at once comes later (see *Later*).
- [ ] Schema versioning is in place (embedded SQL migrations run at start-up), and a migration test runs from v1 to v2.

### F0.3 Money, dates & periods library — MVP
**Status:** ⬜ To do
**Story:** As the developer, I want one tested module for money and periods, so that totals are always the same on every screen.
**AC**
- [ ] Lives in `core`, so the client and server compute identical totals.
- [ ] Formats money in the user's currency and locale. Negative amounts and decimals are only shown when needed. (Formatting for display may use `Intl` in `web/`; parsing and arithmetic stay in `core`.)
- [ ] Period helpers cover day, week (respecting the week-start setting), month and year: contains, previous, next, and label.
- [ ] Split helper: fair / % / € gives each member's share, and rounding never loses or creates a cent.
- [ ] 100% unit test coverage on this module, plus property tests for splits (`proptest`).

### F0.4 Port the design system to Svelte — MVP
**Status:** ⬜ To do
**Already done:** `design-system/` (`DESIGN-SYSTEM.md`, `tokens/`, `components/`, `guidelines/`) defines the tokens (colours, category hues, type, spacing, radii, shadows, motion), 35 reference components with props, and specimen cards. It is a React/HTML reference made in Claude Design, not production code. `styles.css`, `_ds/loader.js` and `ui_kits/auxide-app/` (the phone click-through) are referenced but were not committed, so the `.card.html` previews don't open yet.
**Story:** As the developer, I want the design system rebuilt as Svelte components, so that every screen uses the same parts.
**Decided (2026-11-15):** the look comes from our tokens, behaviour from a small set of headless libraries. Bits UI for accessible primitives (no Tailwind, no shadcn-svelte), vaul-svelte for the phone bottom sheet, svelte-sonner for toasts, `@number-flow/svelte` for amounts the app computes. No decorative component libraries (Magic UI, Aceternity…), no icon set. The rules, the component → library map and the checks live in the project skill `.claude/skills/auxide-ui/`. F0.4 is split into F0.4a–F0.4h, done in that order.

### F0.4a UI tooling & guardrails — MVP (M1)
**Status:** ⬜ To do
**Story:** As the developer, I want the UI rules written down and checked automatically, so that no screen reinvents a component or drifts from the design system.
**AC**
- [ ] The `auxide-ui` skill (`.claude/skills/auxide-ui/`) is the reference for all UI work: workflow, library map (`references/library-map.md`), porting guide (`references/porting.md`) and checks (`scripts/check-ui.sh` at the repo root, shared with CI).
- [ ] The Svelte skills `svelte-core-bestpractices` and `svelte-code-writer` (`sveltejs/ai-tools`) are installed, and `npx @sveltejs/mcp svelte-autofixer` is allowed in the global Claude Code settings (`~/.claude/settings.json`), like the skills themselves. The project `.claude/settings.json` allows `check-ui.sh`, which lives in the repo.
- [ ] CI runs `bash scripts/check-ui.sh` on every push, next to `pnpm check` and `pnpm test` (F0.1).
- [ ] Only the dependencies in the library map are installed: `bits-ui`, `vaul-svelte` (pinned to exactly `1.0.0-next.7`, a prerelease), `svelte-sonner`, `@number-flow/svelte`, `@fontsource/fredoka`, `@fontsource/figtree`. `@tanstack/svelte-virtual` comes with F10.2. Adding anything else means updating the map first.
- [ ] `styles.css`, `_ds/loader.js` and `ui_kits/auxide-app/` are retrieved from the Claude Design project so the reference cards open locally, or their mentions are removed from `DESIGN-SYSTEM.md`.
- [ ] Copy lives in string files from the first screen (one plain TS module per area until F10.3 picks the localisation approach), so the Definition of Done rule holds from M1.

### F0.4b Tokens, fonts & global styles — MVP (M1)
**Status:** ⬜ To do
**AC**
- [ ] `design-system/tokens/*.css` stay the single source and are imported as-is from the root layout (no copy in `web/`). Vite is allowed to read `design-system/`.
- [ ] CI runs when only tokens change: in `build.yml`, `design-system/tokens/**` is re-included in `paths`, as a line after the `!design-system/**` exclusion (a later positive pattern wins over an earlier `!` one), for both `push` and `pull_request`.
- [ ] Fredoka (600) and Figtree (500, 600) come from `@fontsource`, and the Google Fonts `@import` in `tokens/fonts.css` is replaced, so fonts work offline and are precached by the service worker (F0.9).
- [ ] `base.css` applies to the app: cream background, Figtree body, box sizing.
- [ ] Hue colours (tint / mid / avatar / deep) are derived in one place from a `--hue` value, in CSS and in `web/src/lib/ui/hue.ts`.
- [ ] A token missing during the port is added to `tokens/` rather than inlined (for example the soft button text colour).

### F0.4c Helpers & component gallery — MVP (M1)
**Status:** ⬜ To do
**AC**
- [ ] Components live in `web/src/lib/ui/<group>/` (same groups as the reference: controls, display, forms, lists, feedback, overlays, entry, navigation) and are exported from `web/src/lib/ui/index.ts`.
- [ ] `hueColors` / `tint` / `deep` / `mid` (`hue.ts`) and `keypadInput` (`keypad.ts`) are plain TypeScript with unit tests. Amount formatting comes from the money library (F0.3), not from a component.
- [ ] A gallery route (`/gallery`, dev builds only) shows every component, variant and state, and replaces the `.card.html` previews.

### F0.4d Interactive primitives (Bits UI) — MVP (M1)
**Status:** ⬜ To do
**Story:** As a keyboard or screen-reader user, I want every control to behave like a real control, so that the app is usable without touch.
**AC**
- [ ] Built on Bits UI and styled only with tokens through its `data-*` state attributes: Toggle (`Switch`), SegmentedControl and ChipGroup (`ToggleGroup`), ChoiceCard and HuePicker (`RadioGroup`), ProgressBar (`Progress` / `Meter`), pickers with ▾ (`Select`), ••• menus (`DropdownMenu`), ConfirmDialog (`AlertDialog`).
- [ ] Each one exposes its role and state to screen readers and works with the keyboard (F10.1). The reference's clickable `<span>`s are gone.
- [ ] Every icon-only control has an accessible label.

### F0.4e Sheet & toasts — MVP (M1)
**Status:** ⬜ To do
**AC**
- [ ] One `Sheet` component with one API. On phone it is a vaul-svelte drawer: swipe down or a backdrop tap closes it (F9.1). On tablet it is a right drawer (≈440px, F9.2) and on desktop a centred modal (≈520px, F9.3), both on Bits UI `Dialog`. The variant follows the breakpoint (F9.6).
- [ ] Focus is trapped while open, `Esc` closes the top sheet (F9.7), timings and scrim come from the motion tokens (`--dur-sheet`, `--ease-sheet`, `--scrim`), and the close waits `--dur-close` before unmounting.
- [ ] vaul-svelte is used only inside `Sheet`, so it can be swapped for Bits UI `Dialog` plus a small swipe gesture without touching any screen.
- [ ] Toasts use svelte-sonner with our `Toast` markup, auto-hide after `--toast-ms` (4.5s) and support an action button, used by the *Undo* toasts (F2.9, F4.4, F7.6).

### F0.4f Presentational & entry components — MVP (M1)
**Status:** ⬜ To do
**AC**
- [ ] Own Svelte components, ported from the reference `.jsx` (props from the `.d.ts` become typed `$props()`, `children` becomes a snippet, callbacks keep their names): Button, IconButton, Chip, Amount, Avatar, AvatarStack, Badge, StatusChip, StripBar, Card, HeroCard, CategoryTile, Logo / LogoMark, Icon, FieldCard, AmountInput, MoneyInput, ListRow, SettingsList / SettingsRow, ToggleRow, Banner, EmptyState, Keypad, BottomNav, SidebarNav / NavItem, PeriodStepper.
- [ ] Clickable things are `<button>` or `<a>` (Keypad keys, *Done*, navigating rows). Nav items mark the current page with `aria-current`.
- [ ] `Icon` keeps the reference SVG paths. No icon library.
- [ ] Each component matches its reference card (sizes, radii, fonts, colours) and passes `check-ui.sh` and `svelte-autofixer`.

### F0.4g Animated amounts — MVP (M1)
**Status:** ⬜ To do
**Story:** As a user, I want totals to visibly update when something changes, so that I notice the effect of what I just did.
**AC**
- [ ] Amounts the app computes animate with `@number-flow/svelte`: pocket balances and totals, spent / income in the hero (F3.2), *left* / *over* (F3.2, F3.3, F4.1), *Left to allocate* (F6.4), balances and settle-up totals (F5.4, F5.5).
- [ ] Amounts the user types or entered stay static: entry rows (F4.6), amount fields and keypad (F2.3), budgets, split values being edited (F5.3).
- [ ] The animated amount is formatted exactly like `Amount` (same formatter from F0.3: `€` prefix, decimals only when needed, true minus `−`, `+` for income), and it does not animate when *reduce motion* is on (F10.1).

### F0.4h Press, hover & focus states — MVP (M1)
**Status:** ⬜ To do
**AC**
- [ ] Press and hover states are defined. The prototype has none, so they are a new design decision, reviewed before they are applied (`DESIGN-SYSTEM.md` allows a subtle shadow lift at most).
- [ ] A visible focus style is defined for every control (needed by F9.7 and F10.1), built from the existing ring tokens.
- [ ] The decision is written into `DESIGN-SYSTEM.md` and applied to all components in the gallery.

### F0.5 Auth service — MVP (M3)
**Status:** ⬜ To do
**Story:** As a user, I want a secure account, so that only I can see my pockets.
**AC**
- [ ] Email magic link sign-in, handled by the Actix server. Links are single-use and expire after 15 minutes.
- [ ] Short-lived access token plus a rotating refresh token. In the PWA they are kept out of reach of page scripts where possible (HttpOnly cookie for the refresh token); in Tauri the same web flow is used.
- [ ] Sessions refresh silently, and logging out revokes the refresh token and clears tokens but keeps local data.
- [ ] Rate limiting on the sign-in endpoint.
- [ ] Auth works the same on phone, tablet and desktop.

### F0.6 Sync engine — MVP (M3)
**Status:** ⬜ To do
**Story:** As a user with several devices, I want changes to my personal pockets to appear everywhere, so that I can log a spending on my phone and see it on my laptop.
**Scope:** personal pockets (Everyday and solo pockets). Shared pockets use F0.6b.
**AC**
- [ ] Local-first: writes go to SQLite in OPFS and to an outbox table, then `sync-http` uploads them.
- [ ] Protocol (types in `api-types`): `push` sends outbox changes; `pull` returns everything changed since the client's last server cursor. Both are idempotent (change ids), so retries are safe.
- [ ] Merge rules live in `core` and run on both sides: last write wins per field (HLC timestamps), and a tombstone always wins over an edit, so a deleted entry stays deleted.
- [ ] Sync runs in the background and never blocks editing. Merging is order-independent and idempotent: the same changes merged in any order, any number of times, give the same result on every device (tested by shuffling and replaying a set of changes).
- [ ] A pulled change is always merged field by field, never written over the local record.
- [ ] Saves write and stamp only the fields the user changed, never the whole record as it was loaded, so a stale snapshot can't erase fields a pull brought in meanwhile (tested: pull lands between opening and saving an edit).
- [ ] Fields that must stay consistent together are merged as one unit with a single timestamp (the list is decided per aggregate, for example category + mandatory flag when a rule sets both).
- [ ] Concurrent edits of the same field on two offline devices resolve to the same winner on every device (HLC, then device id).
- [ ] HLC: a device never stamps a change below the latest timestamp it has received, and a remote timestamp far in the future is clamped (tested with a device clock several minutes behind).
- [ ] Changes from other devices arrive within a few seconds while the app is open (the same live channel as F0.6b, or polling).
- [ ] Sync runs on start, on reconnect (`online` event), after local writes (debounced) and on a timer; only one tab or window syncs at a time (Web Locks API).
- [ ] The sync status shows *Synced*, *Syncing* or *Offline* (header chip / sidebar).
- [ ] Going offline and back online loses no data (tested with 100 queued edits, and with two devices editing the same entry).

### F0.6b Shared pockets online-first — MVP (M4)
**Status:** ⬜ To do
**Story:** As a member of a shared pocket, I want every change to go through the server, so that all members always see the same data and nobody has to resolve conflicts.
**AC**
- [ ] The `core` use cases choose the path from the pocket: shared pocket writes go through the remote port (`sync-http`) as direct HTTP calls, never through the outbox.
- [ ] The local copy is updated only after the server accepts the change. On failure, nothing changes locally and the panel shows the error, keeping what the user typed.
- [ ] The server sends other members' changes over a live channel (WebSocket or Server-Sent Events from Actix), and the client writes them to the local copy.
- [ ] Offline (or server unreachable): the shared pocket stays readable from the local copy, every create / edit / delete / settle control is disabled, and a banner reads *Offline · changes to shared pockets are paused*.
- [ ] Entry panel: picking a shared pocket while offline disables *Save* with the same reason.
- [ ] My share of shared spendings still counts in Everyday offline, using the local copy (F2.7).
- [ ] Requests carry an idempotency key, so a retry after a timeout never adds an entry twice.
- [ ] Optimistic concurrency: edits send the version they started from. If someone else changed the entry first, the server refuses it and the panel reloads the latest version.

### F0.7 Shared data permissions — MVP (M4)
**Status:** ⬜ To do
**Story:** As a member of a shared pocket, I want only members to see it, so that my friends' data stays private.
**AC**
- [ ] Server rules: only members can read or write a pocket and its entries. Checked in the server use cases, not only in SQL.
- [ ] `pull` only returns pockets the user is a member of.
- [ ] Removing a member revokes their access on the next sync, and their client drops that pocket's data.

### F0.8 Crash & error reporting — MVP (M6)
**Status:** ⬜ To do
**AC**
- [ ] Crashes (including wasm panics, via `console_error_panic_hook`) and sync failures are reported with no personal amounts or names.
- [ ] The user can opt out in Settings.

### F0.9 PWA install & offline shell — MVP (M1)
**Status:** ⬜ To do
**Story:** As a phone or tablet user, I want to install Auxide from the browser, so that it feels like an app and opens offline.
**AC**
- [ ] Web app manifest (name, icons from the logo, theme colours, `display: standalone`).
- [ ] Service worker precaches the app shell, the wasm module, the worker and the fonts; the app opens with no connection.
- [ ] A new version shows *Update available · Reload* instead of reloading silently mid-entry.
- [ ] Tested as an installed app on Android Chrome in M1 (served from the dev machine through `adb reverse`, see F0.1).
- [ ] Tested as an installed app on iOS Safari once the app is served over HTTPS (F0.12, M3). Note: iOS may clear data of a site that is not installed, so onboarding suggests *Add to Home Screen*.

### F0.10 Desktop shell — MVP (M5)
**Status:** ⬜ To do
**Story:** As a desktop user, I want a real desktop app, so that Auxide lives in my dock or start menu.
**AC**
- [ ] Tauri 2 loads the static `web/` build; it holds no business logic.
- [ ] Installers for Windows (MSI / NSIS) and Linux (AppImage / deb). macOS is Later.
- [ ] Checked on Windows (WebView2) on a real machine or VM.
- [ ] Installers are built in CI on Windows and Linux runners when a version tag is pushed, added to the release pipeline from F0.12.
- [ ] Auto-update through the Tauri updater.
- [ ] The Content Security Policy allows the wasm module, the worker and calls to the sync server only.

### F0.11 Server — MVP (M3)
**Status:** ⬜ To do
**Story:** As the developer, I want the server easy to run and test, so that sync is reliable.
**AC**
- [ ] `crates/server` (Actix Web) exposes auth, `push` / `pull` (personal pockets), shared pocket endpoints with a live channel, and pocket membership endpoints, all typed with `api-types`.
- [ ] PostgreSQL through `diesel` + `diesel-async` (with `deadpool` or `bb8` pooling). Schema managed by `diesel_migrations`, embedded and run at start-up; `schema.rs` generated by the Diesel CLI and checked in.
- [ ] Configuration through environment variables; a `docker compose` file runs the server and Postgres locally.
- [ ] Health (liveness) and readiness (Postgres reachable) endpoints. Logs, traces and metrics follow F0.15.
- [ ] Integration tests run the server against a real Postgres in CI.

### F0.12 Hosting & release pipeline — MVP (M3)
**Status:** ⬜ To do
**Story:** As the developer, I want the app and the server reachable over HTTPS, so that my devices can sync and the PWA installs on any phone.
**Deferred on purpose:** nothing is hosted before M3. Until then, testing uses `pnpm dev` in a desktop browser, Android through `adb reverse` and the Tauri shell on Linux (F0.1).
**AC**
- [ ] The static `web/build` is served over HTTPS on a domain, from a static host or from the Actix server (decided at the time).
- [ ] The server and Postgres run on a chosen host (VPS or container platform) with TLS and environment-based configuration (F0.11).
- [ ] Nightly database backups, and a restore has been tested at least once.
- [ ] Pushing a version tag builds and deploys the PWA and the server. F0.10 adds the desktop installers to the same pipeline in M5.
- [ ] iOS Safari is tested as an installed PWA once HTTPS is in place (F0.9).

### F0.13 Build caching & wasm size — MVP (M1)
**Status:** ⬜ To do
**Story:** As the developer, I want CI runs to stay fast and the wasm module to stay small, so that I get quick feedback on every push and the app loads fast on a phone.
**AC**
*CI caching*
- Rust jobs install the toolchain with `actions-rust-lang/setup-rust-toolchain`, which reads `rust-toolchain.toml` (channel, components, `wasm32-unknown-unknown`) and caches the cargo registry and `target/` through its built-in `Swatinem/rust-cache`.
- Each job (`rust`, `wasm`) keeps its own cache, because they build for different targets and features.
- Caches are saved from `main` only. Other branches restore them but don't save, so they don't push useful caches out of GitHub's 10 GB limit.
- The pnpm store is cached (`actions/setup-node` with `cache: pnpm`).
- CLI tools (`wasm-pack`, `cargo-deny`, `cargo-llvm-cov`) are installed as prebuilt binaries (`taiki-e/install-action`), never compiled with `cargo install`.
- A warm run (cache hit, no dependency change) finishes in under 5 minutes.

*Wasm size*
- Release builds of `app-wasm` run binaryen's `wasm-opt` on the `.wasm` file after `wasm-bindgen` (wasm in, smaller and faster wasm out). `wasm-pack` does this automatically in release mode; flags are set in `[package.metadata.wasm-pack.profile.release]` (start with `-Oz` for size, compare with `-O3` for speed).
- Size settings for `app-wasm` (`opt-level` `"s"` / `"z"` vs `3`, LTO) are chosen by measuring, not guessing. Settings that would also change the server build go in a dedicated profile or a per-package override.
- Dev builds (`pnpm dev`) skip `wasm-opt` so rebuilds stay fast.
- CI reports the raw and compressed (gzip or brotli) size of the release `.wasm` on every push. A size budget is set after the first measurement (SQLite alone is a large part of it), and CI fails if a change goes over it.
- `twiggy` (or similar) is used to find what takes space when the budget is exceeded.

### F0.14 Architecture checks in CI — MVP (M1)
**Status:** 🚧 In progress
**Story:** As the developer, I want CI to enforce the architecture rules from `CLAUDE.md`, so that a shortcut (domain logic in a shell, an infra crate in `core`) can't slip in unnoticed.
**Context:** `scripts/check-architecture.sh` checks the workspace dependency graph, infrastructure crates in `core` (a superset of the current inline `grep` in `build.yml`), clock / random / I/O calls and floats in `core`, Tauri commands in the shell, Tauri APIs and `auxide-wasm` imports in `web/`. It runs in CI since F0.1 (wasm job). It does not see Tauri plugins yet: `tauri-plugin-opener` (from the template, unused by `web/`) still gives the webview IPC commands through `opener:default`.
**AC**
- [x] The Tauri template code is removed from `tauri-shell/src/lib.rs`: the `greet` command and the `invoke_handler`. The shell only hosts the `web/` build.
- [ ] The template's `tauri-plugin-opener` is removed: the dependency in `tauri-shell/Cargo.toml` (and `[workspace.dependencies]`), the `.plugin(tauri_plugin_opener::init())` line and the `opener:default` permission in `tauri-shell/capabilities/default.json`. The shell exposes no IPC command at all.
- [ ] The `.expect(...)` on the Tauri builder is replaced by proper error handling (or kept with `#[expect(clippy::expect_used, reason = "…")]`), and `expect_used = "warn"` is enabled in `[workspace.lints.clippy]` (commented out until then). The `.expect` in `DeterministicIdGenerator::generate` (`core::testing`) gets `#[expect(clippy::expect_used, reason = "test double: a missing then_return is a bug in the test")]` at the same time: it is compiled outside `#[cfg(test)]` whenever the `testing` feature is on, so `allow-expect-in-tests` does not cover it.
- [ ] `check-architecture.sh` also fails on any Tauri plugin in the shell (`.plugin(` in `tauri-shell/src/`, a `tauri-plugin-*` dependency) and on any capability permission other than `core:default` in `tauri-shell/capabilities/`.
- [x] `check-architecture.sh` passes locally.
- [x] In `build.yml`, the wasm job's *Core must stay clean of infrastructure dependencies* step is replaced by `bash scripts/check-architecture.sh` (the runner already has `cargo` and `python3`).
- [ ] A deliberate violation (for example `auxide-storage-opfs` depending on `auxide-server`) makes CI fail, then is reverted.

### F0.15 Observability: logs, traces & metrics — MVP (M3)
**Status:** ⬜ To do
**Story:** As the developer, I want logs, traces and metrics from the server and the clients in one place, so that I can see why a sync failed or a request was slow without asking the user.
**Context:** Today the wasm crate only writes internal errors to the Worker console (F0.1). The monitoring backend is not chosen yet, so all telemetry goes out over OpenTelemetry (OTLP), and an OTel Collector keeps the backend swappable. F0.8 (crash & error reporting) uses the same client pipeline and adds the opt-out.
**Decided (2026-11-24):** `core` uses the `tracing` facade (macros and `#[instrument]` only), because they do no I/O; the subscriber picked by the composition root does. `tracing` is the only observability crate allowed in `core`: no `log`, no `tracing-subscriber`, no `opentelemetry*`. The rules are in the `auxide-core` skill (`references/architecture.md`), and `scripts/check-architecture.sh` enforces the crate list.

**AC**
- [ ] **Rust crates:** every crate instruments with `tracing`: spans for use cases, adapter calls and HTTP handlers, and events for errors. Subscribers and exporters are set up only in the composition roots (`server`, `wasm`). `scripts/check-architecture.sh` and the `auxide-core` skill enforce the decision above (already in place).
- [ ] **Server output:** `tracing-subscriber` writes JSON logs to stdout. Traces, metrics and logs are exported over OTLP (`opentelemetry-otlp`) only when `OTEL_EXPORTER_OTLP_ENDPOINT` is set. The standard `OTEL_*` environment variables configure the service name, sampling and resource attributes.
- [ ] **Trace propagation:** `http-client` sends a W3C `traceparent` header and the server continues that trace, so one sync is one trace from the device to Postgres.
- [ ] **Server metrics:** request rate, latency and errors per route; sync push / pull duration and payload size; database pool usage.
- [ ] **Client (wasm Worker):**
  - In development, `tracing` output goes to the browser console, with a level filter.
  - In production, with F0.8 and its opt-out, errors and sync spans are batched and sent over OTLP/HTTP (to the server or the collector).
  - Exporting never blocks the UI or a write.
- [ ] **Privacy:** no amounts, entry or pocket names, notes, emails or tokens in any log message, span attribute or metric label. Only ids, error codes, counts and durations. A test or a review rule checks this (F10.4).
- [ ] **Local stack:** the `docker compose` file from F0.11 can also start an OTel Collector and a local backend (for example `grafana/otel-lgtm`), so traces from `pnpm dev` and the local server can be inspected.
- [ ] **Hosted backend:** chosen and wired with F0.12, with log retention set and an alert on server errors and on failed syncs.

---

## E1 · Onboarding & account

### F1.1 First launch choice — MVP
**Status:** ⬜ To do
**Story:** As a new user, I want to choose between using the app locally or with an account, so that I can start without signing up.
**AC**
- [ ] The screen offers two options: *On this [device] only* and *With an account*, plus a *Log in* link.
- [ ] The label adapts to phone / tablet / computer.
- [ ] *Continue* with local goes straight to Home, with seed categories and the Everyday pocket created.
- [ ] The choice can be changed later in Settings.

### F1.2 Create account / log in — MVP (M3)
**Status:** ⬜ To do
**Story:** As a user, I want to create an account with my email, so that my budget syncs.
**AC**
- [ ] The email field validates the format, and *Send me a link* is disabled until it is valid.
- [ ] *Keep using it offline* returns to the app in local mode.
- [ ] Opened from Settings, it returns to Settings after sign-in. Otherwise it goes to Home.
- [ ] A toast confirms *Signed in · your pockets now sync*.

### F1.3 Move local data to account — MVP (M3)
**Status:** ⬜ To do
**Story:** As a local user who signs up, I want my existing pockets moved to my account, so that I don't lose anything.
**AC**
- [ ] All local pockets, entries, categories and rules are uploaded on the first sign-in.
- [ ] If the account already has data, the user chooses *Merge* or *Keep account data*.
- [ ] Nothing is deleted locally until the upload is confirmed.

### F1.4 Log out — MVP (M3)
**Status:** ⬜ To do
**AC**
- [ ] Logs out and keeps the data on this device in local mode.
- [ ] A toast reads *Logged out · data kept on this [device]*.

### F1.5 Sign in with Apple / Google — v1.1
**Status:** ⬜ To do
**AC**
- [ ] Both buttons work in the PWA and the desktop app (web OAuth flow on the server), and the account links to the same email.

---

## E2 · Entries (spendings & incomes)

### F2.1 Add spending — MVP
**Status:** ⬜ To do
**Story:** As a user, I want to log a spending in a few taps, so that tracking doesn't feel like work.
**AC**
- [ ] Opens from the + button (phone) or *Add entry* (tablet/desktop).
- [ ] Fields: amount, name, date, category, mandatory, pocket. Shared pockets also get *paid by* and *split*.
- [ ] The pocket defaults to the one being viewed (Home pocket or open pocket), otherwise Everyday.
- [ ] *Save* is disabled until the amount is above 0 and the split is valid.
- [ ] After saving, the panel closes and a toast reads *Spending added to [pocket]*.

### F2.2 Add income — MVP
**Status:** ⬜ To do
**AC**
- [ ] A Spending / Income switch sits at the top of the same panel.
- [ ] Income only offers income categories, and the amount is shown in green.
- [ ] Income has no mandatory toggle and no split.

### F2.3 Amount keypad — MVP
**Status:** ⬜ To do
**Story:** As a phone or tablet user, I want a big numeric keypad, so that entering amounts is fast.
**AC**
- [ ] Tapping the amount opens the keypad, and *Done* or tapping the name closes it.
- [ ] Rules: one decimal separator, two decimals at most, 8 characters at most, and a leading 0 is replaced.
- [ ] Desktop shows no keypad. The field accepts typing and pasting with `,` or `.`.
- [ ] Setting: whether the keypad opens automatically on a new entry.

### F2.4 Date picker — MVP
**Status:** ⬜ To do
**AC**
- [ ] *Today* and *Yesterday* quick chips, plus *Other date…* that opens the native date picker.
- [ ] The selected chip shows the chosen date label.

### F2.5 Category on entry — MVP
**Status:** ⬜ To do
**AC**
- [ ] Chips show the categories of the current kind, plus *+ New* to create one inline (F6.2).
- [ ] Picking a category sets the mandatory flag to that category's default.
- [ ] Once the user picks a category manually, rules no longer change it for this entry.

### F2.6 Pocket picker on entry — MVP
**Status:** ⬜ To do
**AC**
- [ ] The pocket chip at the top left opens *Choose a pocket*. Archived pockets are hidden.
- [ ] Changing the pocket resets *paid by* to me and the split to that pocket's default.
- [ ] *New pocket* is available from the picker.

### F2.7 Also count in Everyday — MVP
**Status:** ⬜ To do
**Story:** As a user, I want spendings in other pockets to optionally count in my Everyday dashboard, so that my monthly view is complete.
**AC**
- [ ] The toggle shows when the pocket isn't Everyday. It is on by default.
- [ ] In shared pockets, only my share counts in Everyday, and the helper text shows the amount.

### F2.8 Edit entry — MVP
**Status:** ⬜ To do
**AC**
- [ ] Tapping any entry row opens the same panel prefilled.
- [ ] *Save* updates the entry, with the toast *Changes saved*.
- [ ] Only the fields the user changed are saved (F0.6). If a sync updates the entry while the panel is open, the fields the user touched keep their typed values and the others show the synced values.

### F2.9 Delete entry — MVP
**Status:** ⬜ To do
**AC**
- [ ] *Delete* on an existing entry asks for confirmation and states the name, amount and pocket. Shared pockets add "for everyone".
- [ ] After deleting, a toast with *Undo* restores the entry in place.
- [ ] *Undo* has to fit the rule "a tombstone always wins" (F0.6). Decide how before building it, for example: undo removes the local tombstone only while it has not been pushed yet, or undo creates a new write that explicitly revives the entry.

---

## E3 · Home dashboard

### F3.1 Period switcher & navigation — MVP
**Status:** ⬜ To do
**AC**
- [ ] Day / Week / Month / Year segmented control, with ‹ › to move between periods.
- [ ] The label formats as *Sun 18 Oct 2026*, *12 Oct – 18 Oct*, *October 2026*, *2026*.
- [ ] It defaults to the current month on launch.

### F3.2 Spent summary — MVP
**Status:** ⬜ To do
**AC**
- [ ] The hero shows spent so far, and income when there is any.
- [ ] For Everyday in Month or Year, it shows *of [budget]* and *[x] left* or *[x] over*.
- [ ] The year budget is 12 × the recurring budgets, plus one-off budgets only when something was spent in them.
- [ ] Chips show *Mandatory €x* and *Flexible €y*.
- [ ] A strip bar shows category proportions.

### F3.3 Category breakdown — MVP
**Status:** ⬜ To do
**AC**
- [ ] Each row shows the category, mandatory badge, spent, and a progress bar against its budget, or relative to the top category when it has no budget.
- [ ] Over-budget rows turn red.
- [ ] An *All / Mandatory* filter is available.
- [ ] Spending with no category appears as *Uncategorised*.

### F3.4 Drill into category — MVP
**Status:** ⬜ To do
**AC**
- [ ] Tapping a category opens the pocket entries filtered to that category, with a removable filter chip.

### F3.5 Home pocket switcher — MVP
**Status:** ⬜ To do
**AC**
- [ ] Tapping the pocket name opens the pocket picker, and Home then shows that pocket.
- [ ] If the pocket has no entries in the current period, the view jumps to its latest entry date.

### F3.6 Latest entries (tablet/desktop) — MVP (M5)
**Status:** ⬜ To do
**AC**
- [ ] The right column lists the last 9 entries in the period, and *See all* opens the pocket entries.

### F3.7 Empty states — MVP
**Status:** ⬜ To do
**AC**
- [ ] *Nothing spent in [period] yet.* shows when there are no entries in the period.

---

## E4 · Pockets

### F4.1 Pockets list — MVP
**Status:** ⬜ To do
**AC**
- [ ] *New pocket* stays visible at the top without scrolling.
- [ ] Everyday is pinned first, showing this month's spending against the recurring budget.
- [ ] Other pockets show the name, Solo or Shared · N people, dates, spent / budget, the members' avatars and a sync chip.
- [ ] Archived pockets sit in a collapsible *Archived · N* group, each with *Restore*.

### F4.2 Create pocket — MVP
**Status:** ⬜ To do
**Story:** As a user, I want separate pockets for trips or projects, so that they don't blur my monthly budget.
**AC**
- [ ] Fields: name (required), colour, Solo / Shared, and an optional total budget.
- [ ] Shared requires an account. Without one, the form shows an explanation and *Create an account*.
- [ ] After saving, the new pocket opens, with the toast *Pocket "[name]" created*.

### F4.3 Edit pocket — MVP
**Status:** ⬜ To do
**AC**
- [ ] Available from the pocket ••• menu, and all creation fields are editable.

### F4.4 Archive / restore pocket — MVP
**Status:** ⬜ To do
**AC**
- [ ] Archive hides the pocket from the list and pickers but keeps its history, and the toast offers *Undo*.
- [ ] If it was the Home pocket, Home falls back to Everyday.
- [ ] Restore is available from the archived group and the pocket menu.

### F4.5 Delete pocket — MVP
**Status:** ⬜ To do
**AC**
- [ ] The confirmation states how many entries will be removed for everyone and suggests archiving instead.
- [ ] Deleting returns to the Pockets list.
- [ ] Everyday can't be archived or deleted.

### F4.6 Pocket entries — MVP
**Status:** ⬜ To do
**AC**
- [ ] Entries are grouped by day (*Today*, *Yesterday*, *Fri 16 Oct*), newest first.
- [ ] Each row shows the name, category, *paid by* (shared pockets), the source pocket (Everyday view) and the amount. Income is shown in green with +.
- [ ] Tablet/desktop: one list card with day headers and day totals.

### F4.7 Solo pocket overview — MVP
**Status:** ⬜ To do
**AC**
- [ ] An *Overview* tab with spending by category, sorted by amount, with bars.

---

## E5 · Shared pockets & splitting

### F5.1 Invite members — MVP (M4)
**Status:** ⬜ To do
**Story:** As a pocket creator, I want to invite friends by link, so that we track the trip together.
**AC**
- [ ] *Invite by link* copies a unique link.
- [ ] Opening the link (logged in) adds that person to the pocket, and the others see them on the next sync.
- [ ] Existing contacts can be toggled on or off as members.
- [ ] A shared pocket can't be saved with fewer than 2 members.

### F5.2 Default split — MVP (M4)
**Status:** ⬜ To do
**AC**
- [ ] Fair / % / € can be set on the pocket and changed from the Balances tab.
- [ ] New spendings in the pocket start with the default split.

### F5.3 Paid by & split per entry — MVP (M4)
**Status:** ⬜ To do
**AC**
- [ ] A *Paid by* chip appears for each member.
- [ ] Split modes: Fair (1/N), % (must total 100%) and € (must total the amount), with live per-member amounts.
- [ ] A status line reads *€96 split equally between 3*, or *80% of 100% assigned* in red, which blocks saving.
- [ ] Switching mode pre-fills an even split.

### F5.4 Balances — MVP (M4)
**Status:** ⬜ To do
**AC**
- [ ] *Who pays what* shows each member's share %, share amount, amount paid, and a balance chip (+ green / − red).
- [ ] Balances include settlements.
- [ ] Tablet/desktop show *Your balance* in the pocket header summary.

### F5.5 Settle up — MVP (M4)
**Status:** ⬜ To do
**AC**
- [ ] Suggests the minimum number of transfers (*Léa → You €120*).
- [ ] *Mark paid* records a settlement entry, updates balances and shows a toast.
- [ ] Tapping a settlement row offers *Remove*, which restores the previous balances.
- [ ] *Everyone is settled up.* shows when the balances are all zero.

### F5.6 Live updates for members — MVP (M4)
**Status:** ⬜ To do
**AC**
- [ ] Built on F0.6b: changes go through the server and come back to members over the live channel.
- [ ] Entries added by one member appear for the others without a manual refresh.
- [ ] Deleting an entry or pocket in a shared pocket applies for everyone.

---

## E6 · Categories & budgets

### F6.1 Category list — MVP
**Status:** ⬜ To do
**AC**
- [ ] Budgets tab with a Spending / Income filter.
- [ ] Each row shows the name, *Recurring* or *One-off*, a *Mandatory* badge, and the budget (*€450 /mo*, *€400 total* or *No budget*).
- [ ] Seed categories are created on first launch.

### F6.2 Create / edit category — MVP
**Status:** ⬜ To do
**AC**
- [ ] Fields: name (required), Spending / Income (on create only), colour, Recurring.
- [ ] Spending only: *Mandatory by default*, and *Set a budget* with a clear **Optional** label (per month if recurring, in total if one-off).
- [ ] Can be created inline from the entry panel, and is then selected on that entry.

### F6.3 Delete category — MVP
**Status:** ⬜ To do
**AC**
- [ ] The confirmation states how many entries become *Uncategorised* and that rules using the category are removed.

### F6.4 Left to allocate — MVP
**Status:** ⬜ To do
**AC**
- [ ] The hero shows this month's income minus the recurring budgets. The title switches to *Over-allocated* when negative.
- [ ] A strip shows each budget's share.

---

## E7 · Rules (auto-categorise)

### F7.1 Rule list — MVP (M2)
**Status:** ⬜ To do
**AC**
- [ ] Rows show *Name contains / starts with / is exactly "text" → Category*, a mandatory badge, and *N entries match*.
- [ ] An empty state explains rules and offers *Create a rule*.
- [ ] Tablet/desktop: a single list card, with *+ New rule* opening a panel.

### F7.2 Create rule — MVP (M2)
**Status:** ⬜ To do
**AC**
- [ ] Builder: *When the name [contains ▾] [text] put it in [category]*, plus *Also flag as mandatory*.
- [ ] Matching is case-insensitive and ignores spaces at either end.
- [ ] *Create rule* is disabled until there is text and a category.

### F7.3 Apply to past entries — MVP (M2)
**Status:** ⬜ To do
**Story:** As a user, I want a new rule to fix my old entries too, so that my history is consistent.
**AC**
- [ ] The toggle shows the live count (*Apply to 6 past entries*).
- [ ] When on, matching entries are re-categorised on creation, with the toast *Rule created · N past entries updated*.

### F7.4 Auto-fill while typing — MVP (M2)
**Status:** ⬜ To do
**AC**
- [ ] Typing a name that matches a rule sets the category and mandatory flag, unless the user already picked a category.
- [ ] A green banner reads *Auto-categorised as X · Rule: name contains "Y"*.
- [ ] When several rules match, the most recently created one wins.

### F7.5 Rule from an entry — MVP (M2)
**Status:** ⬜ To do
**AC**
- [ ] When no rule matches and a category is set, the panel suggests *Always put "Uber" in Transport?* with *Create rule*.
- [ ] The rule panel opens prefilled, with *Apply to past entries* on.

### F7.6 Delete rule — MVP (M2)
**Status:** ⬜ To do
**AC**
- [ ] ✕ deletes the rule straight away, and the toast offers *Undo*.
- [ ] Already categorised entries are not changed.

---

## E8 · Settings

### F8.1 Account panel — MVP
**Status:** ⬜ To do
**AC**
- [ ] Local mode shows a card with *Create an account*.
- [ ] Account mode shows the email, *Synced on N devices* and *Log out*.

### F8.2 Preferences — MVP
**Status:** ⬜ To do
**AC**
- [ ] Currency, Week starts on (Monday/Sunday) and Default pocket. Each change applies across the app immediately.

### F8.3 Archived pockets shortcut — MVP
**Status:** ⬜ To do
**AC**
- [ ] Shows the archived count and opens Pockets with the archived group expanded.

### F8.4 Export to CSV — v1.1
**Status:** ⬜ To do
**AC**
- [ ] Exports every entry (date, pocket, name, category, kind, amount, mandatory, paid by, my share) to a file, generated in `core` and saved with a browser download (PWA) or a save dialog (Tauri).

---

## E9 · Platform layouts

### F9.1 Phone layout — MVP
**Status:** ⬜ To do
**AC**
- [ ] Bottom nav: Home / Pockets / + / Categories / Settings.
- [ ] Panels open as bottom sheets that close on swipe down or a backdrop tap.

### F9.2 Tablet layout — MVP (M5)
**Status:** ⬜ To do
**AC**
- [ ] Left sidebar (≈212px) with the logo, *Add entry*, navigation and the sync status.
- [ ] Panels open as a right-side drawer (≈440px). The keypad stays.
- [ ] Pocket view: summary, then Entries / Balances tabs.
- [ ] Home: two columns (dashboard + latest entries).

### F9.3 Desktop layout — MVP (M5)
**Status:** ⬜ To do
**AC**
- [ ] The sidebar (≈256px) adds a Pockets list with *+*.
- [ ] Panels open as a centred modal (≈520px), with no keypad.
- [ ] Pocket view shows Entries and Balances side by side.
- [ ] Categories and Settings use the full width (grids, two-column settings).

### F9.4 Sticky pocket header — MVP (M5)
**Status:** ⬜ To do
**AC**
- [ ] On scroll, the header stays pinned and compacts (smaller title, sub-line hidden, 12px top padding).
- [ ] The scroll position resets when switching screen or pocket.

### F9.5 Contextual add button — MVP (M5)
**Status:** ⬜ To do
**AC**
- [ ] The sidebar button reads *Add to [pocket]* on a pocket page, or on Home with a non-Everyday pocket. Otherwise it reads *Add entry*. Long names are truncated.

### F9.6 Breakpoints & resizing — MVP (M5)
**Status:** ⬜ To do
**AC**
- [ ] Layout switches: below 768px is phone, 768–1199px is tablet, and 1200px or more is desktop.
- [ ] Resizing a desktop window keeps the state and any open panel.

### F9.7 Keyboard support (desktop) — MVP (M5)
**Status:** ⬜ To do
**AC**
- [ ] `N` opens a new entry, `Esc` closes the top panel, and `Enter` saves when valid.
- [ ] Every control is reachable with Tab and has a visible focus ring (style defined in F0.4h).

---

## E10 · Non-functional

### F10.1 Accessibility — MVP (M6)
**Status:** ⬜ To do
**AC**
- [ ] Text contrast is at least 4.5:1, including chips and muted labels. The fix is a change to the tokens in `design-system/tokens/`, not per-component overrides.
- [ ] Tap targets are at least 44px on touch devices.
- [ ] Every icon-only control has an accessible label (‹, •••, ✕, keypad keys).
- [ ] Toggles and segmented controls expose their state to screen readers.
- [ ] Text follows the system font size up to 200% without clipping amounts.
- [ ] Motion respects *reduce motion*: sheets, toasts and animated amounts (F0.4e, F0.4g).

### F10.2 Performance — MVP (M6)
**Status:** ⬜ To do
**AC**
- [ ] Cold start to Home in under 2s on a mid-range phone with 5,000 entries.
- [ ] Long entry lists are virtualised with `@tanstack/svelte-virtual` (library map) and scroll at 60fps.
- [ ] Totals are recomputed incrementally, with no full rescan on every keystroke.

### F10.3 Localisation — MVP (M6) / v1.1
**Status:** ⬜ To do
**AC**
- [ ] MVP: all strings are externalised, and dates, numbers and currency use the device locale.
- [ ] v1.1: French translation (the seed data already uses French merchants).

### F10.4 Privacy & data rights — MVP (M6)
**Status:** ⬜ To do
**AC**
- [ ] A privacy policy is linked from Settings.
- [ ] *Delete my account* removes server data, and shared pockets stay with the remaining members.
- [ ] No amounts or entry names are sent to analytics.

### F10.5 Reliability — MVP (M6)
**Status:** ⬜ To do
**AC**
- [ ] Every destructive action has a confirmation or an undo.
- [ ] No data is lost if the app is killed mid-save.

---

## Later (not in the prototype)

- Recurring entry templates (rent and salary added automatically each month).
- Receipt photo on an entry.
- Notifications when a budget reaches 80%.
- Multiple currencies inside one pocket.
- Several tabs or windows open at once: one tab owns the database (leader, elected with Web Locks) and the others send their calls to it (for example over a `BroadcastChannel`); when the leader closes, another tab takes over. Replaces the one-tab rule of F0.2.
- macOS desktop app: Tauri build on WKWebView, DMG installer signed and notarised (needs an Apple Developer account and a macOS build machine or CI runner).
