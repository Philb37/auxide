---
name: port-components
description: Port Auxide design-system reference components (design-system/components, React) to Svelte 5 in web/src/lib/ui, one svelte-file-editor agent per component in parallel, then integrate (index, gallery), verify and review the batch. Use when the user runs /port-components with a group or component names (backlog F0.4d–F0.4f).
argument-hint: "<group: controls|display|forms|lists|feedback|overlays|entry|navigation|all> or <Component names…>"
disable-model-invocation: true
---

# /port-components

## 1. Scope

- Resolve the argument to a list of components from `design-system/components/<group>/*.jsx` (`all` = every group).
- Skip components that already exist in `web/src/lib/ui/<group>/` (say so; offer to re-check them against the reference instead).

## 2. Prerequisites (stop if missing, and say which backlog item provides it)

- Approved dependencies installed for the batch (`bits-ui`, `vaul-svelte`, `svelte-sonner`, `@number-flow/svelte`) — F0.4a.
- Tokens and fonts wired in the root layout, `hue.ts` present — F0.4b / F0.4c.
- Gallery route and `web/src/lib/ui/index.ts` exist — F0.4c.
- Dependencies between components: port the ones others import first (`Icon` before `Button`, `Amount` before `HeroCard`, `Switch`-based `Toggle` before `ToggleRow`). Order the batch in waves accordingly.

## 3. Fan out

For each wave, start one `svelte-file-editor` agent per component **in the same message** (at most 6 at a time). Give each:

- the reference files: `design-system/components/<group>/<Name>.jsx`, `.d.ts`, `.prompt.md`, and the group card `<group>.card.html`;
- the target path `web/src/lib/ui/<group>/<Name>.svelte`;
- its row from `.claude/skills/auxide-ui/references/library-map.md` and a pointer to `references/porting.md`;
- the rule: **do not edit `index.ts`, the gallery, or any other component**; report missing tokens instead of inlining values; report props or behaviours the reference leaves unclear.

## 4. Integrate (you, after each wave)

- Add the exports to `web/src/lib/ui/index.ts`.
- Add gallery sections showing every variant and state from each `.d.ts`.
- Add tokens the agents reported as missing to `design-system/tokens/` (list them in the final report).
- Move pure logic they flagged (hue helpers, `keypadInput`) into the `.ts` helpers with tests if not done yet.

## 5. Verify and review

- `verifier` with scope `web`.
- `ui-reviewer` on the whole batch (consistency across components matters more than any single one).
- Fix the must-fix findings, re-run the verifier.

## 6. Report

Components ported (per wave), tokens added, design questions raised (hover/press states, unclear reference behaviour), review verdict, and which backlog AC of F0.4d–F0.4f are now covered.
