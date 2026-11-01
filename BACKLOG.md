# Auxide · Product backlog

Built from the Auxide prototype (phone, tablet, desktop). Written for a solo developer. The stack is decided (see `README.md`): Rust core, SvelteKit PWA on phone and tablet, Tauri desktop shell, SQLite in OPFS on every client, Actix Web + PostgreSQL server.

## How to read this

- **Epic** (E1, E2…) is a product area. **Feature** (F1.1, F1.2…) is one shippable piece with a user story and acceptance criteria (AC).
- **Release** tag on every feature: `MVP`, `v1.1` or `Later`.
- The MVP is large for one person, so it is split into **milestones**. Each milestone ends with something you can use yourself.

## Release plan

| Milestone | Goal | Epics |
|---|---|---|
| **M1 · Local core** | Track your own spending offline on a phone (installed PWA) | E0 (F0.1–F0.4, F0.9), E1.1, E2, E3, E4 (solo), E6, E8 |
| **M2 · Smart entry** | Entries categorise themselves | E7 |
| **M3 · Accounts & sync** | Same data on every device | E0 (F0.5, F0.6, F0.11), E1 |
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

---

## E0 · Tech foundations

The architecture is described in `README.md`. In short: a pure Rust `core` crate holds all domain logic; the SvelteKit frontend (PWA on phone and tablet) calls it through a wasm crate that stores data in SQLite in OPFS; Tauri is only a desktop shell around the same build; an Actix Web server with PostgreSQL reuses the same `core` crate.

### F0.1 Workspace & stack setup — MVP
**Decided:** Rust core with hexagonal architecture; SvelteKit (Svelte 5, TypeScript, `adapter-static`, pnpm) for the whole UI; PWA on phone and tablet (no native mobile app, no Capacitor); Tauri 2 as a desktop shell only; SQLite in OPFS on every client; Actix Web + PostgreSQL on the server.
**Story:** As the developer, I want the monorepo and build pipeline in place, so that every target builds from one command.
**AC**
- Monorepo with a Cargo workspace (`crates/core`, `api-types`, `storage-opfs`, `sync-http`, `app-wasm`, `storage-pg`, `server`), `web/` and `src-tauri/`.
- `core` compiles for both `wasm32-unknown-unknown` and native, and has no dependency on `wasm-bindgen`, `web-sys`, Actix or `diesel` (checked in CI).
- `app-wasm` is built with `wasm-pack` (or `wasm-bindgen-cli`) and consumed by `web/` as a local package; `pnpm dev` rebuilds it on change.
- The wasm module runs in a dedicated Web Worker. `web/` talks to it through a typed TS facade (`AuxideApi`), never through raw `wasm-bindgen` exports.
- A "hello pocket" build creates and lists a pocket on a phone (installed PWA), in a desktop browser and in the Tauri app on Windows and macOS.
- The Tauri app is also checked on the developer's Linux (EndeavourOS, WebKitGTK). Linux desktop is for personal use only, so if OPFS fails there the fix is a newer WebKitGTK or the PWA in a browser, not a separate storage path.
- CI runs `cargo fmt`, `cargo clippy`, `cargo test`, `pnpm check`, `pnpm test` and a wasm build on every push.

### F0.2 Local data model & storage — MVP
**Story:** As a user, I want my data saved on the device, so that the app works without a connection.
**AC**
- Entities in `core`: Pocket, Entry (spend / income / settle), Category, Rule, Member, Settings.
- Entries keep `amount` (cents, `i64`), `date`, `kind`, `categoryId?`, `pocketId`, `countsInEveryday`, `mandatory`, `paidBy`, and `split {mode, values}`.
- Ids are generated on the client (UUIDv7) so records can be created offline and synced without remapping.
- Every synced record carries `updatedAt`, a per-field version or HLC timestamp, `deletedAt?` (tombstone) and `deviceId`, as needed by F0.6.
- `core` defines repository ports (traits); `storage-opfs` implements them with SQLite in OPFS. Use cases are tested against an in-memory adapter.
- The app calls `navigator.storage.persist()` so the browser doesn't evict the database; the result is shown in Settings if refused.
- Writes are transactional: an entry and its effects are saved together or not at all.
- Data survives an app restart and a device reboot.
- Schema versioning is in place (embedded SQL migrations run at start-up), and a migration test runs from v1 to v2.

### F0.3 Money, dates & periods library — MVP
**Story:** As the developer, I want one tested module for money and periods, so that totals are always the same on every screen.
**AC**
- Lives in `core`, so the client and server compute identical totals.
- Formats money in the user's currency and locale. Negative amounts and decimals are only shown when needed. (Formatting for display may use `Intl` in `web/`; parsing and arithmetic stay in `core`.)
- Period helpers cover day, week (respecting the week-start setting), month and year: contains, previous, next, and label.
- Split helper: fair / % / € gives each member's share, and rounding never loses or creates a cent.
- 100% unit test coverage on this module, plus property tests for splits (`proptest`).

### F0.4 Port the design system to Svelte — MVP
**Already done:** the design system in this project (`DESIGN-SYSTEM.md`, `tokens/`, `components/`, `ui_kits/auxide-app/`) defines the tokens (colours, category hues, type, spacing, radii, shadows, motion), the 32 reference components with props, and a phone click-through. It is a React/HTML reference, not production code.
**Story:** As the developer, I want the design system rebuilt as Svelte components, so that every screen uses the same parts.
**AC**
- `tokens/*.css` are imported as-is (they are already CSS custom properties) from the root layout, and components read `var(--…)` instead of hard-coded values.
- Fredoka and Figtree are bundled with the app (local `.woff2` or `@fontsource`, no Google Fonts request), so they work offline.
- Each component in `components/` has a `.svelte` equivalent: props from its `.d.ts` become typed `$props()`, `children` becomes a snippet, and callbacks keep their names (`onChange`, `onClick`).
- Hue helpers (`hueColors`, `tint`, `deep`, `mid`) and `keypadInput` move to plain TypeScript modules with unit tests.
- A component gallery page (or Storybook) shows every component and variant, replacing the `.card.html` previews.
- Sheet uses native gestures: swipe down to close on phone, Esc on desktop, focus trapped while open.
- Keypad, Toggle, SegmentedControl and Chip expose their role and state to screen readers (F10.1).
- Press and hover states are defined. The prototype has none, so they are a new design decision to review.

### F0.5 Auth service — MVP (M3)
**Story:** As a user, I want a secure account, so that only I can see my pockets.
**AC**
- Email magic link sign-in, handled by the Actix server. Links are single-use and expire after 15 minutes.
- Short-lived access token plus a rotating refresh token. In the PWA they are kept out of reach of page scripts where possible (HttpOnly cookie for the refresh token); in Tauri the same web flow is used.
- Sessions refresh silently, and logging out revokes the refresh token and clears tokens but keeps local data.
- Rate limiting on the sign-in endpoint.
- Auth works the same on phone, tablet and desktop.

### F0.6 Sync engine — MVP (M3)
**Story:** As a user with several devices, I want changes to my personal pockets to appear everywhere, so that I can log a spending on my phone and see it on my laptop.
**Scope:** personal pockets (Everyday and solo pockets). Shared pockets use F0.6b.
**AC**
- Local-first: writes go to SQLite in OPFS and to an outbox table, then `sync-http` uploads them.
- Protocol (types in `api-types`): `push` sends outbox changes; `pull` returns everything changed since the client's last server cursor. Both are idempotent (change ids), so retries are safe.
- Merge rules live in `core` and run on both sides: last write wins per field (HLC timestamps), and a tombstone always wins over an edit, so a deleted entry stays deleted.
- Changes from other devices arrive within a few seconds while the app is open (the same live channel as F0.6b, or polling).
- Sync runs on start, on reconnect (`online` event), after local writes (debounced) and on a timer; only one tab or window syncs at a time (Web Locks API).
- The sync status shows *Synced*, *Syncing* or *Offline* (header chip / sidebar).
- Going offline and back online loses no data (tested with 100 queued edits, and with two devices editing the same entry).

### F0.6b Shared pockets online-first — MVP (M4)
**Story:** As a member of a shared pocket, I want every change to go through the server, so that all members always see the same data and nobody has to resolve conflicts.
**AC**
- The `core` use cases choose the path from the pocket: shared pocket writes go through the remote port (`sync-http`) as direct HTTP calls, never through the outbox.
- The local copy is updated only after the server accepts the change. On failure, nothing changes locally and the panel shows the error, keeping what the user typed.
- The server sends other members' changes over a live channel (WebSocket or Server-Sent Events from Actix), and the client writes them to the local copy.
- Offline (or server unreachable): the shared pocket stays readable from the local copy, every create / edit / delete / settle control is disabled, and a banner reads *Offline · changes to shared pockets are paused*.
- Entry panel: picking a shared pocket while offline disables *Save* with the same reason.
- My share of shared spendings still counts in Everyday offline, using the local copy (F2.7).
- Requests carry an idempotency key, so a retry after a timeout never adds an entry twice.
- Optimistic concurrency: edits send the version they started from. If someone else changed the entry first, the server refuses it and the panel reloads the latest version.

### F0.7 Shared data permissions — MVP (M4)
**Story:** As a member of a shared pocket, I want only members to see it, so that my friends' data stays private.
**AC**
- Server rules: only members can read or write a pocket and its entries. Checked in the server use cases, not only in SQL.
- `pull` only returns pockets the user is a member of.
- Removing a member revokes their access on the next sync, and their client drops that pocket's data.

### F0.8 Crash & error reporting — MVP (M6)
**AC**
- Crashes (including wasm panics, via `console_error_panic_hook`) and sync failures are reported with no personal amounts or names.
- The user can opt out in Settings.

### F0.9 PWA install & offline shell — MVP (M1)
**Story:** As a phone or tablet user, I want to install Auxide from the browser, so that it feels like an app and opens offline.
**AC**
- Web app manifest (name, icons from the logo, theme colours, `display: standalone`).
- Service worker precaches the app shell, the wasm module, the worker and the fonts; the app opens with no connection.
- A new version shows *Update available · Reload* instead of reloading silently mid-entry.
- Tested as an installed app on iOS Safari and Android Chrome. Note: iOS may clear data of a site that is not installed, so onboarding suggests *Add to Home Screen*.

### F0.10 Desktop shell — MVP (M5)
**Story:** As a desktop user, I want a real desktop app, so that Auxide lives in my dock or start menu.
**AC**
- Tauri 2 loads the static `web/` build; it holds no business logic.
- Installers for Windows (MSI / NSIS), macOS (DMG, signed and notarised) and Linux (AppImage / deb).
- Auto-update through the Tauri updater.
- The Content Security Policy allows the wasm module, the worker and calls to the sync server only.

### F0.11 Server & deployment — MVP (M3)
**Story:** As the developer, I want the server easy to run and deploy, so that sync is reliable.
**AC**
- `crates/server` (Actix Web) exposes auth, `push` / `pull` (personal pockets), shared pocket endpoints with a live channel, and pocket membership endpoints, all typed with `api-types`.
- PostgreSQL through `diesel` + `diesel-async` (with `deadpool` or `bb8` pooling). Schema managed by `diesel_migrations`, embedded and run at start-up; `schema.rs` generated by the Diesel CLI and checked in.
- Configuration through environment variables; a `docker compose` file runs the server and Postgres locally.
- Health endpoint, structured logs (`tracing`), and nightly database backups.
- Integration tests run the server against a real Postgres in CI.

---

## E1 · Onboarding & account

### F1.1 First launch choice — MVP
**Story:** As a new user, I want to choose between using the app locally or with an account, so that I can start without signing up.
**AC**
- The screen offers two options: *On this [device] only* and *With an account*, plus a *Log in* link.
- The label adapts to phone / tablet / computer.
- *Continue* with local goes straight to Home, with seed categories and the Everyday pocket created.
- The choice can be changed later in Settings.

### F1.2 Create account / log in — MVP (M3)
**Story:** As a user, I want to create an account with my email, so that my budget syncs.
**AC**
- The email field validates the format, and *Send me a link* is disabled until it is valid.
- *Keep using it offline* returns to the app in local mode.
- Opened from Settings, it returns to Settings after sign-in. Otherwise it goes to Home.
- A toast confirms *Signed in · your pockets now sync*.

### F1.3 Move local data to account — MVP (M3)
**Story:** As a local user who signs up, I want my existing pockets moved to my account, so that I don't lose anything.
**AC**
- All local pockets, entries, categories and rules are uploaded on the first sign-in.
- If the account already has data, the user chooses *Merge* or *Keep account data*.
- Nothing is deleted locally until the upload is confirmed.

### F1.4 Log out — MVP (M3)
**AC**
- Logs out and keeps the data on this device in local mode.
- A toast reads *Logged out · data kept on this [device]*.

### F1.5 Sign in with Apple / Google — v1.1
**AC**
- Both buttons work in the PWA and the desktop app (web OAuth flow on the server), and the account links to the same email.

---

## E2 · Entries (spendings & incomes)

### F2.1 Add spending — MVP
**Story:** As a user, I want to log a spending in a few taps, so that tracking doesn't feel like work.
**AC**
- Opens from the + button (phone) or *Add entry* (tablet/desktop).
- Fields: amount, name, date, category, mandatory, pocket. Shared pockets also get *paid by* and *split*.
- The pocket defaults to the one being viewed (Home pocket or open pocket), otherwise Everyday.
- *Save* is disabled until the amount is above 0 and the split is valid.
- After saving, the panel closes and a toast reads *Spending added to [pocket]*.

### F2.2 Add income — MVP
**AC**
- A Spending / Income switch sits at the top of the same panel.
- Income only offers income categories, and the amount is shown in green.
- Income has no mandatory toggle and no split.

### F2.3 Amount keypad — MVP
**Story:** As a phone or tablet user, I want a big numeric keypad, so that entering amounts is fast.
**AC**
- Tapping the amount opens the keypad, and *Done* or tapping the name closes it.
- Rules: one decimal separator, two decimals at most, 8 characters at most, and a leading 0 is replaced.
- Desktop shows no keypad. The field accepts typing and pasting with `,` or `.`.
- Setting: whether the keypad opens automatically on a new entry.

### F2.4 Date picker — MVP
**AC**
- *Today* and *Yesterday* quick chips, plus *Other date…* that opens the native date picker.
- The selected chip shows the chosen date label.

### F2.5 Category on entry — MVP
**AC**
- Chips show the categories of the current kind, plus *+ New* to create one inline (F6.2).
- Picking a category sets the mandatory flag to that category's default.
- Once the user picks a category manually, rules no longer change it for this entry.

### F2.6 Pocket picker on entry — MVP
**AC**
- The pocket chip at the top left opens *Choose a pocket*. Archived pockets are hidden.
- Changing the pocket resets *paid by* to me and the split to that pocket's default.
- *New pocket* is available from the picker.

### F2.7 Also count in Everyday — MVP
**Story:** As a user, I want spendings in other pockets to optionally count in my Everyday dashboard, so that my monthly view is complete.
**AC**
- The toggle shows when the pocket isn't Everyday. It is on by default.
- In shared pockets, only my share counts in Everyday, and the helper text shows the amount.

### F2.8 Edit entry — MVP
**AC**
- Tapping any entry row opens the same panel prefilled.
- *Save* updates the entry, with the toast *Changes saved*.

### F2.9 Delete entry — MVP
**AC**
- *Delete* on an existing entry asks for confirmation and states the name, amount and pocket. Shared pockets add "for everyone".
- After deleting, a toast with *Undo* restores the entry in place.

---

## E3 · Home dashboard

### F3.1 Period switcher & navigation — MVP
**AC**
- Day / Week / Month / Year segmented control, with ‹ › to move between periods.
- The label formats as *Sun 18 Oct 2026*, *12 Oct – 18 Oct*, *October 2026*, *2026*.
- It defaults to the current month on launch.

### F3.2 Spent summary — MVP
**AC**
- The hero shows spent so far, and income when there is any.
- For Everyday in Month or Year, it shows *of [budget]* and *[x] left* or *[x] over*.
- The year budget is 12 × the recurring budgets, plus one-off budgets only when something was spent in them.
- Chips show *Mandatory €x* and *Flexible €y*.
- A strip bar shows category proportions.

### F3.3 Category breakdown — MVP
**AC**
- Each row shows the category, mandatory badge, spent, and a progress bar against its budget, or relative to the top category when it has no budget.
- Over-budget rows turn red.
- An *All / Mandatory* filter is available.
- Spending with no category appears as *Uncategorised*.

### F3.4 Drill into category — MVP
**AC**
- Tapping a category opens the pocket entries filtered to that category, with a removable filter chip.

### F3.5 Home pocket switcher — MVP
**AC**
- Tapping the pocket name opens the pocket picker, and Home then shows that pocket.
- If the pocket has no entries in the current period, the view jumps to its latest entry date.

### F3.6 Latest entries (tablet/desktop) — MVP (M5)
**AC**
- The right column lists the last 9 entries in the period, and *See all* opens the pocket entries.

### F3.7 Empty states — MVP
**AC**
- *Nothing spent in [period] yet.* shows when there are no entries in the period.

---

## E4 · Pockets

### F4.1 Pockets list — MVP
**AC**
- *New pocket* stays visible at the top without scrolling.
- Everyday is pinned first, showing this month's spending against the recurring budget.
- Other pockets show the name, Solo or Shared · N people, dates, spent / budget, the members' avatars and a sync chip.
- Archived pockets sit in a collapsible *Archived · N* group, each with *Restore*.

### F4.2 Create pocket — MVP
**Story:** As a user, I want separate pockets for trips or projects, so that they don't blur my monthly budget.
**AC**
- Fields: name (required), colour, Solo / Shared, and an optional total budget.
- Shared requires an account. Without one, the form shows an explanation and *Create an account*.
- After saving, the new pocket opens, with the toast *Pocket "[name]" created*.

### F4.3 Edit pocket — MVP
**AC**
- Available from the pocket ••• menu, and all creation fields are editable.

### F4.4 Archive / restore pocket — MVP
**AC**
- Archive hides the pocket from the list and pickers but keeps its history, and the toast offers *Undo*.
- If it was the Home pocket, Home falls back to Everyday.
- Restore is available from the archived group and the pocket menu.

### F4.5 Delete pocket — MVP
**AC**
- The confirmation states how many entries will be removed for everyone and suggests archiving instead.
- Deleting returns to the Pockets list.
- Everyday can't be archived or deleted.

### F4.6 Pocket entries — MVP
**AC**
- Entries are grouped by day (*Today*, *Yesterday*, *Fri 16 Oct*), newest first.
- Each row shows the name, category, *paid by* (shared pockets), the source pocket (Everyday view) and the amount. Income is shown in green with +.
- Tablet/desktop: one list card with day headers and day totals.

### F4.7 Solo pocket overview — MVP
**AC**
- An *Overview* tab with spending by category, sorted by amount, with bars.

---

## E5 · Shared pockets & splitting

### F5.1 Invite members — MVP (M4)
**Story:** As a pocket creator, I want to invite friends by link, so that we track the trip together.
**AC**
- *Invite by link* copies a unique link.
- Opening the link (logged in) adds that person to the pocket, and the others see them on the next sync.
- Existing contacts can be toggled on or off as members.
- A shared pocket can't be saved with fewer than 2 members.

### F5.2 Default split — MVP (M4)
**AC**
- Fair / % / € can be set on the pocket and changed from the Balances tab.
- New spendings in the pocket start with the default split.

### F5.3 Paid by & split per entry — MVP (M4)
**AC**
- A *Paid by* chip appears for each member.
- Split modes: Fair (1/N), % (must total 100%) and € (must total the amount), with live per-member amounts.
- A status line reads *€96 split equally between 3*, or *80% of 100% assigned* in red, which blocks saving.
- Switching mode pre-fills an even split.

### F5.4 Balances — MVP (M4)
**AC**
- *Who pays what* shows each member's share %, share amount, amount paid, and a balance chip (+ green / − red).
- Balances include settlements.
- Tablet/desktop show *Your balance* in the pocket header summary.

### F5.5 Settle up — MVP (M4)
**AC**
- Suggests the minimum number of transfers (*Léa → You €120*).
- *Mark paid* records a settlement entry, updates balances and shows a toast.
- Tapping a settlement row offers *Remove*, which restores the previous balances.
- *Everyone is settled up.* shows when the balances are all zero.

### F5.6 Live updates for members — MVP (M4)
**AC**
- Built on F0.6b: changes go through the server and come back to members over the live channel.
- Entries added by one member appear for the others without a manual refresh.
- Deleting an entry or pocket in a shared pocket applies for everyone.

---

## E6 · Categories & budgets

### F6.1 Category list — MVP
**AC**
- Budgets tab with a Spending / Income filter.
- Each row shows the name, *Recurring* or *One-off*, a *Mandatory* badge, and the budget (*€450 /mo*, *€400 total* or *No budget*).
- Seed categories are created on first launch.

### F6.2 Create / edit category — MVP
**AC**
- Fields: name (required), Spending / Income (on create only), colour, Recurring.
- Spending only: *Mandatory by default*, and *Set a budget* with a clear **Optional** label (per month if recurring, in total if one-off).
- Can be created inline from the entry panel, and is then selected on that entry.

### F6.3 Delete category — MVP
**AC**
- The confirmation states how many entries become *Uncategorised* and that rules using the category are removed.

### F6.4 Left to allocate — MVP
**AC**
- The hero shows this month's income minus the recurring budgets. The title switches to *Over-allocated* when negative.
- A strip shows each budget's share.

---

## E7 · Rules (auto-categorise)

### F7.1 Rule list — MVP (M2)
**AC**
- Rows show *Name contains / starts with / is exactly "text" → Category*, a mandatory badge, and *N entries match*.
- An empty state explains rules and offers *Create a rule*.
- Tablet/desktop: a single list card, with *+ New rule* opening a panel.

### F7.2 Create rule — MVP (M2)
**AC**
- Builder: *When the name [contains ▾] [text] put it in [category]*, plus *Also flag as mandatory*.
- Matching is case-insensitive and ignores spaces at either end.
- *Create rule* is disabled until there is text and a category.

### F7.3 Apply to past entries — MVP (M2)
**Story:** As a user, I want a new rule to fix my old entries too, so that my history is consistent.
**AC**
- The toggle shows the live count (*Apply to 6 past entries*).
- When on, matching entries are re-categorised on creation, with the toast *Rule created · N past entries updated*.

### F7.4 Auto-fill while typing — MVP (M2)
**AC**
- Typing a name that matches a rule sets the category and mandatory flag, unless the user already picked a category.
- A green banner reads *Auto-categorised as X · Rule: name contains "Y"*.
- When several rules match, the most recently created one wins.

### F7.5 Rule from an entry — MVP (M2)
**AC**
- When no rule matches and a category is set, the panel suggests *Always put "Uber" in Transport?* with *Create rule*.
- The rule panel opens prefilled, with *Apply to past entries* on.

### F7.6 Delete rule — MVP (M2)
**AC**
- ✕ deletes the rule straight away, and the toast offers *Undo*.
- Already categorised entries are not changed.

---

## E8 · Settings

### F8.1 Account panel — MVP
**AC**
- Local mode shows a card with *Create an account*.
- Account mode shows the email, *Synced on N devices* and *Log out*.

### F8.2 Preferences — MVP
**AC**
- Currency, Week starts on (Monday/Sunday) and Default pocket. Each change applies across the app immediately.

### F8.3 Archived pockets shortcut — MVP
**AC**
- Shows the archived count and opens Pockets with the archived group expanded.

### F8.4 Export to CSV — v1.1
**AC**
- Exports every entry (date, pocket, name, category, kind, amount, mandatory, paid by, my share) to a file, generated in `core` and saved with a browser download (PWA) or a save dialog (Tauri).

---

## E9 · Platform layouts

### F9.1 Phone layout — MVP
**AC**
- Bottom nav: Home / Pockets / + / Categories / Settings.
- Panels open as bottom sheets that close on swipe down or a backdrop tap.

### F9.2 Tablet layout — MVP (M5)
**AC**
- Left sidebar (≈212px) with the logo, *Add entry*, navigation and the sync status.
- Panels open as a right-side drawer (≈440px). The keypad stays.
- Pocket view: summary, then Entries / Balances tabs.
- Home: two columns (dashboard + latest entries).

### F9.3 Desktop layout — MVP (M5)
**AC**
- The sidebar (≈256px) adds a Pockets list with *+*.
- Panels open as a centred modal (≈520px), with no keypad.
- Pocket view shows Entries and Balances side by side.
- Categories and Settings use the full width (grids, two-column settings).

### F9.4 Sticky pocket header — MVP (M5)
**AC**
- On scroll, the header stays pinned and compacts (smaller title, sub-line hidden, 12px top padding).
- The scroll position resets when switching screen or pocket.

### F9.5 Contextual add button — MVP (M5)
**AC**
- The sidebar button reads *Add to [pocket]* on a pocket page, or on Home with a non-Everyday pocket. Otherwise it reads *Add entry*. Long names are truncated.

### F9.6 Breakpoints & resizing — MVP (M5)
**AC**
- Layout switches: below 768px is phone, 768–1199px is tablet, and 1200px or more is desktop.
- Resizing a desktop window keeps the state and any open panel.

### F9.7 Keyboard support (desktop) — MVP (M5)
**AC**
- `N` opens a new entry, `Esc` closes the top panel, and `Enter` saves when valid.
- Every control is reachable with Tab and has a visible focus ring.

---

## E10 · Non-functional

### F10.1 Accessibility — MVP (M6)
**AC**
- Text contrast is at least 4.5:1, including chips and muted labels.
- Tap targets are at least 44px on touch devices.
- Every icon-only control has an accessible label (‹, •••, ✕, keypad keys).
- Toggles and segmented controls expose their state to screen readers.
- Text follows the system font size up to 200% without clipping amounts.
- Motion respects *reduce motion*.

### F10.2 Performance — MVP (M6)
**AC**
- Cold start to Home in under 2s on a mid-range phone with 5,000 entries.
- Long entry lists are virtualised and scroll at 60fps.
- Totals are recomputed incrementally, with no full rescan on every keystroke.

### F10.3 Localisation — MVP (M6) / v1.1
**AC**
- MVP: all strings are externalised, and dates, numbers and currency use the device locale.
- v1.1: French translation (the seed data already uses French merchants).

### F10.4 Privacy & data rights — MVP (M6)
**AC**
- A privacy policy is linked from Settings.
- *Delete my account* removes server data, and shared pockets stay with the remaining members.
- No amounts or entry names are sent to analytics.

### F10.5 Reliability — MVP (M6)
**AC**
- Every destructive action has a confirmation or an undo.
- No data is lost if the app is killed mid-save.

---

## Later (not in the prototype)

- Recurring entry templates (rent and salary added automatically each month).
- Receipt photo on an entry.
- Notifications when a budget reaches 80%.
- Multiple currencies inside one pocket.
