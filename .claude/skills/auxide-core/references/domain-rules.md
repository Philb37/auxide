# Domain rules

Sources: `BACKLOG.md` (Definition of Done, F0.2, F0.3, F0.6, F0.6b, E5) and `README.md` (two write paths).

## Money — integer cents

- Stored and computed as `i64` cents: €11.20 is `1120`. Never `f32`/`f64`, in `core`, in storage, in `api-types`, across wasm.
- Why: binary floats cannot represent most decimal cents (`0.1 + 0.2 = 0.30000000000000004`). Over thousands of entries totals drift, and client and server could disagree.
- A `Money` value object pairs cents with a currency. Adding two currencies is an error, not a conversion. Arithmetic uses checked operations (`checked_add`) and returns an error on overflow.
- Parsing user input (`"11,20"`, `"11.2"`, `"€11"`) happens in `core` (F0.3). Display formatting may use `Intl` in `web/`.

## Splits

- Modes: Fair (1/N), % (must total 100%), € (must total the amount). Validation lives in `core` and blocks saving (F5.3).
- Rounding never loses or creates a cent: allocate the floor of each share, then distribute the remaining cents one by one in a **deterministic order** (for example member order), so client and server give the same result. €100 fair between 3 → `3334, 3333, 3333`.
- Property tests: shares sum to the total, none negative, same input → same output.

## Ids

- UUIDv7, generated on the client through the `IdGenerator` port, so records can be created offline and synced without remapping (F0.2).
- Each aggregate has its own newtype (`PocketId(Uuid)`), so an `EntryId` can never be passed where a `PocketId` is expected.

## Time and HLC timestamps

Sync is *last write wins per field*. "Last" cannot be decided with the device clock, because device clocks drift: a phone 2 minutes behind would lose against an older edit from the laptop.

A **Hybrid Logical Clock** timestamp is `(wall_ms, counter, device_id)`, compared in that order. Each device keeps its last timestamp `(l, c)`:

- **Local write** (pt = physical clock now): `l' = max(l, pt)`. If `l'` equals the previous `l`, `c += 1`, else `c = 0`.
- **Receiving a remote timestamp** `(lm, cm)` during a pull: `l' = max(l, lm, pt)`, and the counter becomes one more than the largest counter among the timestamps that share `l'` (or 0 if only `pt` reached it).

Effect: once a device has *seen* an edit, everything it writes afterwards is ordered after that edit, whatever its own clock says. The clock never goes backwards. The device id breaks exact ties.

What HLC guarantees and what it does not:

- Edits made **after syncing** are correctly ordered, even with a wrong device clock.
- Two edits made **offline on both devices**, without syncing in between, are truly concurrent: nobody saw the other. HLC then falls back to wall time (then device id) to pick a winner. That is acceptable: the result is deterministic and identical on every device. A clock that is very wrong (hours) can make one device win those concurrent cases; clamping a remote `lm` far in the future is a possible safeguard.

The `Clock` port gives `core` the physical time; the HLC logic itself is domain code in `core` (pure, testable with a fake clock).

## Tombstones

- Deleting a synced record does not remove the row: it sets `deleted_at` (an HLC timestamp). The row is hidden everywhere.
- Why: sync only exchanges *changes*. If the row simply disappeared, a device that was offline still has it and cannot tell "deleted" from "never existed" — on its next push the entry would come back.
- Merge rule (F0.6): **a tombstone always wins over an edit**, so a deleted entry stays deleted.
- *Undo* after delete (F2.9) is a new write that clears the tombstone with a newer timestamp — decide explicitly how this interacts with "tombstone always wins" (for example: only the device that deleted can undo, before the next push).
- Purging old tombstones is possible once every device has synced past them (later).

## Merge in practice (why sync can stay in the background)

Sync never blocks editing. Per-field last-write-wins with HLC is order-independent: merging the same set of changes in any order, any number of times, gives the same result on every device. A pull that arrives late is merged, never applied as a blind overwrite. Blocking would not help anyway: an offline device cannot sync, and another device can edit one second after a sync. What the code must get right instead:

1. **Write only the fields the user changed.** A save stamps and writes the *dirty* fields, never the whole record as the panel loaded it. Otherwise a stale snapshot, stamped with a fresh timestamp, would silently erase fields a pull brought in meanwhile. This is the main trap.
2. **Fields that must stay consistent merge as one unit.** Per-field merge can mix two consistent versions into an inconsistent one (amount from one device, split from the other). Group such fields into one LWW unit with a single timestamp. Splits only exist in shared pockets, which are online-first (no merge), so for personal pockets this mainly concerns pairs like category + mandatory flag set together by a rule — decide case by case.
3. **Concurrent edits of the same field** (both devices offline, neither saw the other) resolve to one winner, deterministically. Accepted, not a bug.
4. **Edit vs delete:** the tombstone wins (F0.6), so an edit on a device that had not seen the delete is dropped.
5. **Open panels:** if a pull changes the entry being edited, the panel keeps the user's typed values for the fields they touched (rule 1 keeps the rest correct). Showing a hint is optional.

## Synced record fields

Every synced record carries: HLC timestamp per field (or per record + per field version), `deleted_at?`, `device_id`, `updated_at` (F0.2). Merge rules live in `core` and run identically on client and server.

## Two write paths (decided by the use case, never by the UI)

| Pocket | Path | Offline |
|---|---|---|
| Personal (Everyday, solo) | Local-first: write to storage **and** the outbox in one `UnitOfWork`, then `SyncPort` pushes (idempotent change ids) and pulls since the last cursor | Fully usable |
| Shared | Online-first: `RemotePort` call with an idempotency key and the version the edit started from (optimistic concurrency). Local copy updated only after the server accepts | Read-only; writes return a typed "offline" error the UI turns into *Offline · changes to shared pockets are paused* |

My share of shared spendings still counts in Everyday offline, computed from the local copy (F2.7).

## Periods

Day, week (respects the week-start setting), month, year: `contains`, `previous`, `next` (F0.3). The year budget is 12 × recurring budgets plus one-off budgets that have spending (F3.2). Labels shown to the user follow the copy rules in `DESIGN-SYSTEM.md`.
