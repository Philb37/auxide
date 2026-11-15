---
name: auxide-core
description: Auxide's Rust rulebook — hexagonal architecture + DDD, a core free of every infrastructure dependency, and the domain rules (money in cents, ids, HLC timestamps, tombstones, the two write paths, splits). Load it before writing, reviewing or explaining anything in crates/** or tauri-shell/, before touching a boundary (wasm exports, AuxideApi, api-types, server handlers), and whenever the UI needs a domain operation.
---

# Auxide core

The user writes the Rust. Use this skill to **review, explain and suggest**, not to rewrite their code (see `CLAUDE.md`). Pair it with the global `rust-best-practices` skill for language-level idioms; this one covers what is specific to Auxide.

When the code already in `crates/` contradicts a recommendation here, the code wins: point out the difference, do not "fix" it silently.

## Map

| Topic | Reference |
|---|---|
| Layers, crates, dependency rule, DDD building blocks, ports, errors, async, testing | [references/architecture.md](references/architecture.md) |
| Money, ids, time & HLC, tombstones, sync merge, write paths, splits, periods | [references/domain-rules.md](references/domain-rules.md) |
| Boundaries: wasm exports ↔ `AuxideApi`, `api-types` ↔ server/client | [references/boundaries.md](references/boundaries.md) |
| Automated check | `bash .claude/skills/auxide-core/scripts/check-architecture.sh` |

## The rules in one screen

1. **`core` is pure.** Domain model, use cases and port traits. No I/O, no framework, no database, no HTTP, no async runtime, no `wasm-bindgen`, no serialization format. It compiles for `wasm32-unknown-unknown` and native.
2. **Dependencies point inward.** Adapters depend on `core`; composition roots (`wasm`, `server`) wire adapters; `core` and `api-types` depend on no workspace crate; `tauri-shell` depends on no Auxide crate.
3. **No domain logic outside `core`.** `wasm` maps and forwards, `server` handlers parse → call a use case → map, adapters translate, `web/` displays, `tauri-shell` hosts a window. If a rule (validation, total, split, balance, period, match, merge) appears anywhere else, it is a bug.
4. **Ubiquitous language.** Types and functions use the product words: Pocket, Entry (spending / income / settlement), Category, Budget, Rule, Member, Split, Balance, Settle up, *left* / *over*, Everyday, Mandatory / Flexible. Not Transaction, Expense, Account, Wallet.
5. **Make illegal states unrepresentable.** Newtype ids (`PocketId`), `Money` value object, smart constructors returning `Result`, enums over boolean flags, private fields with methods that keep invariants.
6. **Side effects through ports.** Storage, outbox, sync, remote (shared pockets), clock/HLC, id generation, unit of work. `core` never reads the clock, generates randomness or ids by itself.
7. **Money is `i64` cents** end to end. Splits never lose or create a cent.
8. **Every synced record** carries its HLC timestamps, `deleted_at` tombstone and device id; merge rules live in `core` and run identically on client and server.
9. **The use case picks the write path** (personal = local-first via outbox, shared = online-first via the remote port). The UI never decides.
10. **Tests**: use cases against in-memory adapters, money/periods at 100% coverage, splits with `proptest`, migrations v1→v2.

## When reviewing Rust

Report, per finding: `file:line`, the rule broken (number above or reference section), why it matters for Auxide (one sentence), and a suggested direction (not a full rewrite). Separate **architecture/domain violations** (must fix) from **idiom suggestions** (`rust-best-practices`, nice to have). Mention what is good too when it illustrates a rule well — the user is building this by hand and the review should help them learn.

## When the UI needs something

Check `crates/wasm` exports and `web/src/lib/api/` for the operation. If it is missing, do not implement it in TypeScript: describe the missing use case, its input/output types and which port it needs, so the user can write it.
