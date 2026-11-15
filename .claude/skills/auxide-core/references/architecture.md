# Architecture: hexagonal + DDD

## Hexagon

```
            driving side                                   driven side
  web/ ─▶ AuxideApi ─▶ auxide-wasm ─┐                ┌─▶ storage-opfs   (SQLite in OPFS)
                                    ├─▶  core  ◀─────┼─▶ storage-pgsql  (PostgreSQL)
  HTTP ─▶ auxide-server handlers ───┘  use cases     └─▶ http-client    (sync + remote)
                                       domain
                                       ports (traits)
```

- **Driving adapters** (`wasm` exports, `server` handlers) call use cases.
- **Driven adapters** (`storage-*`, `http-client`) implement the ports `core` defines.
- **Composition roots** (`wasm`, `server`) pick the adapters and wire them. They are the only crates that know more than one adapter.

## Dependency rule (enforced by `check-architecture.sh`)

| Crate | Allowed workspace deps |
|---|---|
| `auxide-core` | — |
| `auxide-api-types` | — |
| `auxide-storage-opfs` | core |
| `auxide-storage-pgsql` | core |
| `auxide-http-client` | core, api-types |
| `auxide-wasm` | core, storage-opfs, http-client, api-types |
| `auxide-server` | core, storage-pgsql, api-types |
| `auxide-tauri-shell` | — (no Auxide crate at all) |

A new crate must be added to this table and to the script before it is used.

**Forbidden in `core`, even transitively:** `wasm-bindgen`, `web-sys`, `js-sys`, `gloo*`, `actix*`, `diesel*`, `sqlx`, `rusqlite`, `sqlite*`, `tokio`, `async-std`, `reqwest`, `hyper`, `tauri*`, `serde_json`, `getrandom`, `rand`. Allowed when useful: `thiserror` (domain errors), `uuid` as a *type* (without generating), `proptest` as a dev-dependency.

**Open decision — `serde` in `core`.** Recommended: no. The domain should not know its wire format; `api-types` is the contract and the composition roots map domain ↔ DTO. If the user decides otherwise, record it here.

## DDD building blocks (suggested model — the user decides)

| Block | In Auxide |
|---|---|
| **Value objects** (immutable, compared by value, validated on creation) | `Money` (cents + currency), `Currency`, `Period` (day/week/month/year), `Split` (mode + values), `Hue`, `RuleMatcher` (contains / starts with / is exactly + text), `EntryKind` (spending / income / settlement), `Budget` (recurring monthly or one-off total), id newtypes (`PocketId`, `EntryId`…), `Hlc` timestamp |
| **Entities / aggregates** (identity + invariants, changed only through methods) | `Pocket` (name, hue, solo/shared, members, default split, optional budget, archived), `Entry` (amount, date, kind, category, pocket, mandatory, paid by, split, counts in Everyday), `Category` (kind, hue, recurring, mandatory default, budget), `Rule`, `Settings` |
| **Domain services** (logic spanning several aggregates) | Totals and *left/over* for a period, balances and settle-up suggestions, rule matching (most recent wins), split allocation, sync merge |
| **Use cases** (application layer: orchestrate ports + domain, one per user intention) | `AddEntry`, `EditEntry`, `DeleteEntry`, `CreatePocket`, `ArchivePocket`, `SettleUp`, `CreateRule` (+ apply to past), `Sync`… named after the backlog stories |
| **Ports** (traits owned by `core`) | Repositories per aggregate, `Outbox`, `SyncPort` (push/pull personal pockets), `RemotePort` (shared pocket writes), `Clock` (HLC), `IdGenerator`, `UnitOfWork` (transactional writes, F0.2) |

Guidelines:

- Aggregates reference each other **by id**, never by holding another aggregate.
- Invariants live in the aggregate (a shared pocket has ≥ 2 members, a % split totals 100%), not in the use case and never in the UI.
- One use case = one transaction through `UnitOfWork` (an entry and its effects are saved together or not at all).
- Use cases return domain results or typed errors; they never format text for display.

## Suggested layout of `crates/core/src`

```
lib.rs
domain/        money.rs, period.rs, split.rs, hlc.rs, pocket/, entry/, category/, rule/, member/, balance.rs, merge.rs
application/   ports.rs (or ports/), use_cases/ (add_entry.rs, …), errors.rs
testing/       in-memory adapters + port contract tests   (#[cfg(any(test, feature = "testing"))])
```

`domain/` never imports from `application/`. If the user's code uses another layout, follow theirs.

## Errors

- `core`: one error enum per area with `thiserror` (`EntryError::AmountMustBePositive`, `SplitError::PercentagesDontAddUp { total }`). They are the vocabulary the UI maps to copy.
- Ports return their own error type; adapters convert infra errors (SQLite, HTTP) into it and never leak them into `core`.
- No `unwrap`/`expect`/`panic!` outside tests. `anyhow` only in binaries (`server` `main`), never in libraries.
- Consider enabling `clippy::unwrap_used`, `clippy::expect_used`, `clippy::float_arithmetic` (for `core`) in `[workspace.lints.clippy]` — currently empty.

## Async

Ports that do I/O are `async fn` in traits (stable Rust, no runtime dependency in `core`). Things to keep in mind: the wasm client is single-threaded (futures are not `Send`), and Actix runs handlers on per-worker single-threaded runtimes, so `Send` bounds are probably not needed — confirm when the server is wired. `core` must not pick an executor.

## Testing

- Use cases are tested against in-memory adapters (F0.2). Each port has a **contract test suite** in `core::testing` that every adapter (`storage-opfs`, `storage-pgsql`, in-memory) runs, so all implementations behave the same.
- Money and periods: 100% coverage (`cargo llvm-cov`, F0.3). Splits: `proptest` — the shares always sum to the total, never negative, deterministic order.
- Merge rules: tests for concurrent edits on two devices, tombstone vs edit, out-of-order arrival (F0.6).
- Test names describe behaviour: `add_entry_should_reject_zero_amount`.
