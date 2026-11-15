---
name: review
description: Review the current changes of Auxide with the specialised reviewers in parallel (ui-reviewer, rust-reviewer, contract-reviewer, picked from what the diff touches), run the verifier, and merge everything into one ranked report. Use when the user runs /review, optionally with a git ref or range.
argument-hint: "[git ref or range — default: uncommitted changes + commits not on origin]"
disable-model-invocation: true
---

# /review

Review what changed, with the right specialists, and report once. Do not fix anything unless the user asks afterwards — and never edit Rust (`CLAUDE.md`).

## 1. Collect the changes

- Argument given (`develop`, `HEAD~3`, `main...HEAD`): `git diff --name-only <arg>` (a single ref means `<ref>...HEAD` plus uncommitted changes).
- No argument: uncommitted changes (`git diff --name-only HEAD`, plus untracked files from `git status --porcelain`) and commits not pushed (`git diff --name-only @{upstream}...HEAD` when an upstream exists).
- Nothing changed → say so and stop.

## 2. Pick the reviewers

| Changed paths | Agent |
|---|---|
| `web/**`, `design-system/tokens/**` | `ui-reviewer` |
| `crates/**`, `Cargo.toml`, `tauri-shell/**` | `rust-reviewer` |
| `crates/wasm/**`, `crates/api-types/**`, `crates/http-client/**`, `crates/server/**`, `web/src/lib/api/**` | `contract-reviewer` |
| always | `verifier` (scope = the changed files) |

## 3. Run them in parallel

Start every selected agent **in the same message**. Give each one: the list of changed files relevant to it, the diff command to see the changes (`git diff <range> -- <paths>`), and the acceptance criteria if the caller provided them (`/verify-feature`). Ask each for its standard report.

## 4. Merge into one report

- Deduplicate (the same `file:line` raised by two reviewers → keep one, mention both angles).
- Rank: **must fix** (broken rules, failing checks, bugs, accessibility failures, contract mismatches) → **should fix** → **nits / suggestions**. Verifier failures go first, with their condensed output.
- Group Rust findings separately and phrase them as suggestions for the user to apply.
- Keep each finding to `file:line` — what — why — direction.
- End with: overall verdict (ready / ready after must-fix items / not ready), and offer to fix the UI findings.

For deep correctness bug hunting, the built-in `/code-review` complements this review; mention it when the diff touches tricky logic.
