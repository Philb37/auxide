---
name: auxide-ui
description: Auxide's UI rulebook for the Svelte frontend. Load it before creating, editing or reviewing any component, screen, route layout or style in web/ — it decides whether to reuse an existing Auxide component, wire an approved library (Bits UI, vaul-svelte, svelte-sonner, NumberFlow) or build from the design-system reference, and ends with a verification pass so nothing is reinvented or drifts off the design system.
---

# Auxide UI

Auxide already has a finished design system (`design-system/`). The look comes from **our tokens**; behaviour (focus, keyboard, screen readers, gestures) comes from **a small set of approved libraries**. Never the other way round: no library styling, no generic "AI app" look.

Load the Svelte skills alongside this one: `svelte-core-bestpractices` (how to write it) and `svelte-code-writer` (docs lookup + `svelte-autofixer`). This skill decides *what* to build and *from what*; those decide *how* to write it.

## Sources of truth

| What | Where |
|---|---|
| Voice, casing, numbers, dates, colour use, corners, motion, layout | `design-system/DESIGN-SYSTEM.md` |
| Tokens (CSS custom properties) | `design-system/tokens/*.css` — single source, imported by `web/`, never copied |
| Reference components (React, not production) | `design-system/components/<group>/<Name>.jsx` + `.d.ts` (props) + `.prompt.md` (usage) |
| Production Svelte components | `web/src/lib/ui/<group>/<Name>.svelte` (same groups as the reference) |
| Pure helpers (hue colours, keypad input) | `web/src/lib/ui/*.ts`, with unit tests |
| Component gallery | `web/src/routes/gallery/` |
| Which library does what | [references/library-map.md](references/library-map.md) |
| Translating a reference `.jsx` to Svelte | [references/porting.md](references/porting.md) |
| Accessibility rules (WCAG 2.1 AA) and how to check them | [references/accessibility.md](references/accessibility.md) |

If `web/src/lib/ui/` does not exist yet, the design-system port (backlog F0.4) has not started: create it with the layout above.

## Workflow

### 1. Look before building

Run these, in order, and stop at the first hit:

1. **Already in Svelte?** `ls web/src/lib/ui/*/` and grep for the concept (`grep -ril "sheet\|drawer" web/src/lib/ui`). If it exists, use it. If it is close but missing a variant, extend it, do not fork it.
2. **In the design-system reference?** Check `design-system/components/` (index in `DESIGN-SYSTEM.md`). If yes, port it (step 2) instead of designing a new one.
3. **Composable from existing parts?** Most screens are `Card` + `ListRow` + `Amount` + `CategoryTile`. A new component is the last resort.
4. **Truly new?** It must still use only tokens and follow `DESIGN-SYSTEM.md`. Say so explicitly in your reply ("new component, not in the design system") so the user can review it as a design decision.

### 2. Pick the source

Open [references/library-map.md](references/library-map.md). Every reference component is mapped to one of:

- **Bits UI** primitive — anything with interactive state, focus or keyboard rules (switch, toggle group, radio group, dialog, alert dialog, select, dropdown menu, progress).
- **vaul-svelte** — phone bottom sheet only, wrapped inside our `Sheet`.
- **svelte-sonner** — toast queue only, rendered with our own `Toast` markup.
- **@number-flow/svelte** — app-computed amounts only (see the NumberFlow rule).
- **Own code** — presentational pieces and Auxide-specific inputs (Button, Card, Amount, Keypad…).

Anything **not** on the map (a new dependency, a component library, an icon set, an animation library) needs the user's approval first. Do not install it on your own. Banned outright: React libraries, Tailwind and shadcn-svelte, Melt / Ark UI (we chose Bits UI), Magic UI / Aceternity / RareUI or their Svelte ports, Lucide or any icon set, motion/animation libraries.

### 3. Build

- **Tokens only.** Colours, shadows, rings, radii, durations come from `var(--…)`. If the reference `.jsx` has a literal (`'#fff'`, `'oklch(0.36 0.09 40)'`), map it to an existing token; if none fits, add a token to `design-system/tokens/` and mention it. Never inline the literal.
- **Hue colours** (tint / mid / avatar / deep) are derived in one place (`web/src/lib/ui/hue.ts` + the matching CSS vars) — components pass a `--hue` and read the derived vars.
- **Style Bits UI parts** through their `data-*` state attributes (`[data-state="checked"]`, `[data-disabled]`) with the `class` prop + scoped `:global(...)`, or render our own element through the `child` snippet. Never fight library CSS — Bits UI ships none.
- **Native elements first:** a clickable thing is a `<button>` or `<a>`, never a `<div>`/`<span>` with `onclick`. The React reference does this in places (Toggle, Keypad): fix it while porting.
- **Copy** comes from the string files (Definition of Done), and follows the voice rules: sentence case, middle-dot status lines, `€` prefix, true minus sign `−`, no emoji.
- **Motion:** only what `DESIGN-SYSTEM.md` defines (sheet slide, scrim fade, modal rise, toast, NumberFlow digits). Everything respects `prefers-reduced-motion`. No bounces, no decorative effects.
- **Hover / press:** not defined by the design system yet. Do not invent colours; a subtle shadow lift at most, and flag it as a decision to review.

### 4. Verify (before saying "done")

1. `bash scripts/check-ui.sh` — hard-coded colours, gradients, banned imports, clickable divs, legacy Svelte syntax, duplicated design-system components. Fix every hit or justify it in the reply.
2. `npx @sveltejs/mcp svelte-autofixer <file> --svelte-version <version from web/package.json>` on every `.svelte` file you touched (from `svelte-code-writer`).
3. `cd web && pnpm check && pnpm test`.
4. The component appears in the gallery with every variant and state from its `.d.ts`.
5. Accessibility: WCAG 2.1 AA, following every rule in `references/accessibility.md` (structure and semantics, names labels and state, keyboard and focus, async states and messages, contrast colour and zoom, touch targets and motion), plus the project rules it marks (44px targets, reduced motion), checked with its keyboard, screen-reader, 200% zoom and reduced-motion passes.
6. Compare against the reference card (`design-system/components/<group>/<group>.card.html`) or the `.jsx` values: sizes, radii, fonts, colours match.

## The NumberFlow rule

Animate a number with `@number-flow/svelte` **only if the app computes it**, never if the user typed it.

| Animated (NumberFlow) | Static (plain `Amount`) |
|---|---|
| Pocket balance / total spent / income total | Amount of a spending or income in a list row |
| *Left* / *over* per category and per pocket | The amount being typed (AmountInput, MoneyInput, Keypad) |
| *Left to allocate* | A budget amount the user entered |
| Who owes whom, settle-up totals | Split amounts the user is editing |

Formatting must match `Amount` exactly (`€` prefix, decimals only when needed, true minus `−`, `+` for income): pass the same formatter options from the money library (F0.3) rather than writing new ones. NumberFlow must honour reduced motion.

## Red flags — stop and re-check

- You are about to write a dialog, popover, menu, select, switch or radio group by hand → Bits UI.
- You are about to write a toast queue or timer → svelte-sonner.
- You are about to write swipe-to-close logic → it lives in `Sheet` (vaul-svelte); reuse `Sheet`.
- You typed a hex, `rgb(`, `oklch(` or `gradient(` in a component.
- You created `Button2.svelte`, `MyCard.svelte` or a route-local copy of a design-system component.
- You need an icon that is not in `Icon` → ask; the brand has no icon set on purpose.
