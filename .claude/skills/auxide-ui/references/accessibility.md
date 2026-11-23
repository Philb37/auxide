# Accessibility rules

Target: **WCAG 2.1 AA** on every screen, at phone width first. The Definition of Done adds two project rules on top of AA: tap targets of 44px or more, and a UI reachable with a screen reader. F10.1 closes the gaps that remain.

Follow these rules while building, and use them as the checklist when reviewing. Each rule cites the WCAG criterion it comes from. A rule marked **project rule** goes beyond AA: report a miss as a project-rule failure, not an AA failure.

## Structure and semantics (1.3.1, 2.4.2, 2.4.6, 4.1.2)

- Native elements first: a clickable thing is a `<button>` (it acts) or an `<a href>` (it navigates), never a `<div>` or `<span>` with `onclick`. `check-ui.sh` flags clickable divs.
- Each screen has one `<h1>`, and headings go down in order without skipping a level.
- Use landmarks: `<main>`, `<nav>` (BottomNav, SidebarNav) and `<header>` where they apply.
- Lists are `<ul>`/`<ol>`. Tabular data is a `<table>` with `<th scope>`.
- Every page sets a `<title>` naming the screen (2.4.2).
- Use ARIA only when no native element or Bits UI primitive does the job. Never add a role an element already has natively.

## Names, labels and state (1.1.1, 2.5.3, 3.3.2, 4.1.2)

- Every input has a visible `<label>` (a placeholder is not a label). Related inputs sit in a `<fieldset>` with a `<legend>`.
- An icon-only control has an accessible name (`IconButton`'s `label` prop).
- A control with visible text has an accessible name that contains that text, so voice control users can say what they see (2.5.3).
- State is exposed, not only drawn:
  - `aria-pressed` on Chip;
  - `aria-current="page"` on the active nav item;
  - `aria-expanded` on disclosures;
  - checked and selected on toggles and segmented controls. Bits UI does this; don't break it.
- Meaningful images and icons have alt text. Decorative ones have `alt=""` or `aria-hidden="true"`.
- Amounts are read the way they are shown: `€` prefix, true minus `−`. Bars and charts (StripBar, ProgressBar) also have a text summary.

## Keyboard and focus (2.1.1, 2.1.2, 2.4.3, 2.4.7, 3.2.1, 3.2.2)

- Everything works from the keyboard, and focus moves in reading order. Never use a positive `tabindex`.
- Focus is always visible. Use the ring tokens from `design-system/tokens/effects.css`, and never write `outline: none` without a replacement.
  - The rings are box-shadows, which forced-colours mode (Windows high contrast) removes. Pair them with `outline: 2px solid transparent`, which forced-colours mode turns into a visible outline.
- Overlays (Sheet, Dialog):
  - focus moves into the overlay when it opens and stays there;
  - Escape closes it;
  - focus goes back to the control that opened it.
  - Bits UI and vaul-svelte handle this. Don't override it.
- Focusing a control never triggers anything by itself (3.2.1).
- Changing a field's value never navigates or submits by itself. An explicit action does (3.2.2).

## Async states and messages (2.2.1, 3.3.1, 3.3.3, 4.1.3)

- A message that appears after an action goes in a live region: `role="status"` for progress and success, `role="alert"` for errors. The region must already be in the DOM before its text changes, or screen readers miss it. This is what meets 4.1.3.
- Toasts go through svelte-sonner, which announces them.
- A toast with an action (Undo hides after 4.5s, `DESIGN-SYSTEM.md`) stays open while it is hovered or focused, and it can be reached from the keyboard before it hides (2.2.1).
- An error says what went wrong and how to fix it, in plain copy (3.3.1, 3.3.3).
  - Put it next to the field it concerns and link it with `aria-describedby`.
  - Never show a raw error code to the user.
- **House pattern:** a region that is loading or refreshing gets `aria-busy="true"` while it is pending.
  - This is not required by 4.1.3, and some screen readers hold back updates inside a busy region.
  - Use it only on the region whose content is being replaced. Never put it on a live region that announces the result.

## Contrast, colour and zoom (1.4.1, 1.4.3, 1.4.4, 1.4.10, 1.4.11, 1.4.12)

- **Contrast:** text has at least 4.5:1 (3:1 for large text). Controls, focus rings and the meaningful parts of graphics have at least 3:1.
  - Known exception: the muted labels and the chips (BACKLOG F10.1; `DESIGN-SYSTEM.md`, *Known gaps*, lists the muted labels). They stay as they are until F10.1 fixes the tokens.
  - Never fix contrast in a single component.
- **Colour:** colour is never the only signal. Spending vs income, over budget and errors also carry a sign, an icon or words.
- **Zoom:** text scales to 200% (system font size, browser zoom) without clipping or overlapping, amounts included. At 320px width there is no horizontal scroll.
- **Text spacing:** no fixed heights on text containers. Let them grow with the text, so user text-spacing overrides (1.4.12) and larger fonts never cut text off.

## Touch targets and motion (2.2.2, 2.3.1, project rules)

- **Project rule** (Definition of Done, based on 2.5.5 AAA): tap targets are at least 44×44px on touch devices, counting the padding around small icons.
- **Project rule** (F10.1, based on 2.3.3 AAA): only the motion defined in `DESIGN-SYSTEM.md` is used, and all of it respects `prefers-reduced-motion`.
  - Covered: the sheet slide, the scrim fade, the modal rise, toasts and NumberFlow digits.
  - With reduced motion, these appear without moving.
- Nothing flashes more than three times a second (2.3.1).
- Nothing moves, blinks or scrolls by itself for more than 5 seconds unless it can be paused (2.2.2).

## How to check

When building (step 4 of the skill):

1. **Keyboard pass:** tab through the screen, open and close every overlay, and submit every form with Enter.
2. **Screen reader pass** (Orca on Linux, TalkBack on Android): every control announces its name, role and state, and async messages are announced.
3. **Zoom pass:** zoom to 200%, then check at 320px width.
4. **Motion pass:** turn on *reduce motion* in the OS.

For a full audit of a finished screen, for example before closing a backlog item (`/verify-feature`), run the global `design:accessibility-review` skill if it is installed. It produces a WCAG 2.1 AA report with contrast, keyboard and screen-reader tables.

That audit complements these rules and does not replace them:
- it doesn't know Auxide's components, tokens or the exceptions above;
- it comes from a user-level plugin, so not every session has it.
