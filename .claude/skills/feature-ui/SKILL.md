---
name: feature-ui
description: Build the UI part of an Auxide backlog item on top of the Rust domain the user wrote - read the acceptance criteria, check that AuxideApi exposes what the screen needs (stop and list what is missing otherwise), build the screens from existing components following auxide-ui, then run /verify-feature. Use when the user runs /feature-ui with a backlog id.
argument-hint: "<backlog id, e.g. F2.3>"
disable-model-invocation: true
---

# /feature-ui

The user writes the domain in Rust; Claude builds the UI that uses it. Never edit `crates/**` or `tauri-shell/**`, never put business rules in TypeScript.

## 1. Understand the item

- Read the `### <id> ` section of `BACKLOG.md` (story, AC) and the Definition of Done. Note the UI-visible criteria (screens, states, copy, toasts, confirmations, empty states, layouts per breakpoint).
- Read related items it references (for example F2.1 → F2.3, F2.4, F2.5).

## 2. Check the domain side exists

- List the operations and data the screens need (queries and commands).
- Look for each one in `web/src/lib/api/` (`AuxideApi` + mock) and in the `crates/wasm` exports.
- **Anything missing → stop here.** Report, for each missing piece: the operation name, inputs and outputs (with cents as integers), the error cases the UI must show, and which backlog AC needs it. The user implements it in Rust; `/feature-ui` is re-run afterwards. Do not mock around it in screens.
- If the wasm export exists but the TypeScript facade does not, adding the facade method + its mock is UI-side work and allowed (follow `auxide-core` → `references/boundaries.md`).

## 3. Plan with auxide-ui

Load `auxide-ui`. For each screen or panel: which existing `web/src/lib/ui` components compose it, which are missing (port from the design-system reference first), which strings are needed, which amounts follow the NumberFlow rule. Show the plan in a few lines; ask only if a real design decision is open (new component, behaviour not in `DESIGN-SYSTEM.md`).

## 4. Build

- Missing design-system components: port them first (as `/port-components` does, one `svelte-file-editor` per component when there are several).
- Screens and routes: build them (directly or through `svelte-file-editor`), strings in the string files, data only through `AuxideApi`.
- Component tests use the `AuxideApi` mock; cover the states from the AC (empty, error, offline for shared pockets, disabled Save…).
- New or changed components appear in the gallery.

## 5. Verify

Run `/verify-feature <id>` (`.claude/skills/verify-feature/SKILL.md`). Fix the UI findings it raises, re-run the checks, and report: what was built, AC status, manual checks left (device, gestures), and anything the Rust side still needs.
