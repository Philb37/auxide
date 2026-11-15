---
name: verify-feature
description: Check that an Auxide backlog item is really done - run the /review workflow on its changes, then go through every acceptance criterion and the Definition of Done with evidence (test, file:line, command output, or "manual check needed"). Use when the user runs /verify-feature with a backlog id.
argument-hint: "<backlog id, e.g. F2.3> [git ref or range]"
disable-model-invocation: true
---

# /verify-feature

Answer one question with evidence: *is this backlog item done?* Works the same whether the user or Claude wrote the code. Do not fix anything unless asked afterwards; never edit Rust.

## 1. Load the item

- Find the section in `BACKLOG.md` whose heading starts with `### <id> ` and read it up to the next heading: story, AC, notes, release/milestone.
- Read the **Definition of Done** section too.
- Unknown id → list the closest ids and stop.

## 2. Review the changes

Run the `/review` workflow (`.claude/skills/review/SKILL.md`) on the given range (default: same as `/review`), passing the AC to every reviewer so they can say what they cover.

## 3. Check every acceptance criterion

For each AC bullet, decide:

| Status | Meaning |
|---|---|
| ✓ met | Evidence found: a test that exercises it (name + file), code at `file:line`, a passing command |
| ✗ not met | Missing, wrong, or contradicted by the code / a failing test |
| ? untested | Implemented but no test covers it — say which test would |
| 👁 manual | Needs a human or a device (Android PWA, Tauri window, swipe gesture, screen reader): give the exact steps to check it |

Find evidence by reading the code and tests (`crates/**/tests`, `#[cfg(test)]`, `web/src/**/*.spec.ts`), not by assuming. Business rules must be proven on the Rust side (DoD: domain logic in `core`, tested).

## 4. Definition of Done

Go through each DoD bullet (offline first, cents, logic in core with tests, phone width and 44px targets, screen reader, copy in string files, `auxide-ui` rules) with the same statuses.

## 5. Report

1. Verdict: **done** / **done except manual checks** / **not done**.
2. AC table: criterion · status · evidence.
3. DoD table.
4. Review findings (from step 2), must-fix first.
5. Next steps: what is missing, who does it (Rust → the user, UI → Claude can do it), and the manual checks to run.
