# Auxide Design System

Auxide is a personal and shared budgeting app. You track spendings and incomes in **pockets**: *Everyday* is the default monthly pocket, other pockets cover trips, a car or a shared flat. Shared pockets split costs between friends and show who owes whom. Categories carry monthly or one-off budgets, and **rules** categorise entries automatically from their name. The app runs on phone, tablet and desktop, locally or with an account that syncs.

## Sources

- `Auxide Prototype.dc.html` (this project) — the interactive prototype for phone, tablet and desktop. Every token and component here was read from its inline styles and logic (`tint`, `deep`, `mid`, `seg`, `tog`, `geo` helpers).
- `Auxide Backlog.md` (this project) — product backlog; F0.4 now points at this system.
- No Figma file, codebase, logo file or font binaries were provided. The logo was designed in `Auxide Logo Concepts.dc.html` (concept 5a).

## Index

- `styles.css` — entry point, `@import`s only.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css` (spacing, radii, sizes, breakpoints), `effects.css` (shadows, rings, motion), `base.css`.
- `guidelines/` — 17 foundation specimen cards (colours, type, spacing, radii, shadows, rings, brand, glyphs, motion).
- `components/` — React primitives, each with `.jsx`, `.d.ts`, `.prompt.md`, plus one `*.card.html` per folder:
  - `controls/` Button, IconButton, SegmentedControl, Toggle, Chip, ChipGroup
  - `display/` Logo (+ `LogoMark`), CategoryTile (+ `hueColors`), Avatar, AvatarStack, Badge, StatusChip, ProgressBar, StripBar, Card, HeroCard
  - `forms/` FieldCard, AmountInput, MoneyInput, ChoiceCard, HuePicker
  - `lists/` ListRow, SettingsList (+ SettingsRow), ToggleRow
  - `feedback/` Toast, Banner, EmptyState
  - `overlays/` Sheet (sheet / drawer / modal), ConfirmDialog
  - `entry/` Keypad (+ `keypadInput`)
  - `navigation/` BottomNav, SidebarNav (+ NavItem), PeriodStepper
- `ui_kits/auxide-app/` — phone click-through built from the components.
- `_ds/loader.js` — preview-only helper that loads the `.jsx` files into `window.AuxideDS` for the cards and UI kit.
- `SKILL.md` — Agent Skill wrapper.

## Content fundamentals

- **Voice:** plain, friendly, short. Second person ("Your budget stays on this device"), first-person only in choices the user makes ("Send me a link", "Keep using it offline").
- **Casing:** sentence case everywhere — titles, buttons, tabs ("New pocket", "Who pays what", "Create rule"). The only uppercase is the small overline label in the sidebar ("POCKETS").
- **Money words:** *spending* and *income* (not expense/transaction). *Mandatory* vs *Flexible*. *Left* / *over*. *Settle up*, *Mark paid*.
- **Status lines** use a middle dot: "Shared · 3 people", "Default · On this phone", "Signed in · your pockets now sync".
- **Toasts** state what happened, with the object: "Spending added to Everyday", "Pocket "Car" created", "Rule created · 6 past entries updated".
- **Confirmations** name the thing and the consequence: "“Brunch” · €34 will be removed from Everyday." Shared pockets add "for everyone".
- **Empty states** are one sentence ending in a period: "Nothing spent in October 2026 yet.", "Everyone is settled up."
- **Helper text** is a short phrase without a period: "Needs, not wants", "Optional · total for this pocket".
- **Numbers:** `€` prefix, decimals only when needed (€34, €11.20), true minus sign (−€64), `+` for income and positive balances.
- **Dates:** "Today", "Yesterday", "Fri 16 Oct", "12 Oct – 18 Oct", "October 2026".
- **No emoji.** Demo data uses French merchants (Monoprix, Carrefour City, Loyer octobre).

## Visual foundations

- **Colour:** warm cream neutrals (#fbf7f1 app, #fff cards, #f1ebe3 tracks) and a warm near-black ink #2a2420. One accent, terracotta `oklch(0.7 0.15 40)`, used for primary buttons, the + button, toggles on, focus underlines and links (`oklch(0.55 0.14 40)`). Hero summaries sit on a soft peach `oklch(0.9 0.07 45)` with brown-tinted ink. Green (hue 150) for income, "left", synced and settle up; red (hue 30) for over-budget, delete and errors.
- **Category hues:** each category, pocket and member stores one hue (40, 145, 215, 265, 300, 340, 90, 180) and derives tint (0.94/0.045), mid (0.78/0.11, bars and swatches), avatar (0.86/0.08) and deep (0.42/0.09, text on tint). This is the main source of colour on screen.
- **Type:** Fredoka 600 for every number, title and initial — round, friendly. Figtree 500/600 for UI. Big amounts are 38–56px; body is 14–15px; meta 12px; badges 10px.
- **Backgrounds:** flat colour only. No images, gradients, patterns or illustrations. The only translucency is the phone bottom nav (`rgba(251,247,241,.94)` + 12px blur) and white-on-peach tracks inside hero cards.
- **Corners:** generous. Rows 20–22px, pocket cards 26px, hero cards 30–32px, sheets 32px top / 28px drawer and modal, buttons 16–22px, tiles 9–16px. Anything small and tappable is a full pill.
- **Cards:** white, no border, a barely-there warm shadow `0 1px 3px rgba(60,40,20,.06)`. Groups of settings/toggles share one card with hairline dividers (#f4eee6). Archived items use a sunken #f4eee6 card with no shadow.
- **Shadows:** always brown-tinted. Raised chips and round buttons `.08`; the active segment `.1`. Accent buttons cast a soft accent-coloured glow below (`0 10px 20px -10px oklch(0.6 0.15 40)`). Sheets cast upward.
- **Selection:** inset rings, not borders — accent ring on choice cards and picked pockets, mid-hue ring on selected category chips, ink fill on selected date/payer chips and filters, white raised pill in segmented controls.
- **Disabled:** fill turns #e2d6c8 with white text; no opacity change.
- **Hover / press:** the prototype defines none beyond `cursor:pointer`. Do not invent hover colours; if needed, use a subtle shadow lift.
- **Motion:** sheets slide in with `transform .3s cubic-bezier(.2,.8,.2,1)`, the scrim fades `.25s` to `rgba(42,36,32,.42)`, the modal also fades and rises 3%. Close waits 280ms before unmounting. Toasts auto-hide after 4.5s. No bounces or decorative animation.
- **Scroll fades:** chip groups cap at two rows plus a peek (108px) and use a mask fade at top/bottom only when there is more content.
- **Layout:** phone < 768px (bottom nav 92px, sheets), tablet 768–1199px (sidebar 212px, right drawer 440px), desktop ≥ 1200px (sidebar 256px with pockets list, centred modal 520px, no keypad). Gutters 20px phone, 32px wide. On wide screens the page header sticks and compacts on scroll.

## Iconography

- There is **no icon set**. The prototype uses Unicode characters set in Fredoka or Figtree: `‹ ›` (back, period steppers), `▾` (pickers), `✕` (remove/delete), `✓` (selected, auto-categorised), `+` (add), `•••` (menu), `→` (rule and settle arrows), `⌫` (keypad), `€`.
- Colour dots (7–8px circles) mark sync status and the active nav item.
- Identity comes from **initial tiles**: a rounded square with the first letter in Fredoka on the category/pocket/member hue. Use these where other apps would use icons.
- No emoji, no PNG icons, no SVG illustrations. If a future build needs real icons, pick a rounded-stroke set and flag it; none is part of the brand today.

## Brand

- **Logo:** a pun on Au (gold) + oxide (rust). A gold coin `--ax-gold` with a rust crescent `--ax-rust` along its lower-right edge, "Au" in Fredoka 600 (`--ax-gold-ink`) on the face and a small rust dot at the top right of the letters. Use the `Logo` / `LogoMark` components.
- **Lockup:** mark + "Auxide" in Fredoka 600, gap 10px. "Au" is gold (`--ax-gold-text` on light, `--ax-gold` on ink), "xide" is ink (cream on ink). Sizes: 36px mark / 21px word in the sidebar, 44px / 22px on welcome and sign-in.
- **Small sizes:** below 32px drop the letters and dot; coin and crescent only.
- **On dark:** the rust lifts to `--ax-rust-on-dark`.
- Gold and rust are brand colours. Each has tint / soft / mid / deep / ink steps (`--ax-gold-*`, `--ax-rust-*`, see `guidelines/colors-brand.card.html`) for brand moments such as onboarding, empty states or a premium badge. Pair tints and softs with the matching ink, as with category hues. UI accent stays terracotta; rust sits close to it, so avoid putting rust next to primary buttons.

## Intentional additions

The logo (`Logo`, `LogoMark`, `--ax-gold*`, `--ax-rust*`) replaces the prototype's "A" tile. Nothing else beyond the prototype. Every component maps to an element in `Auxide Prototype.dc.html`; `_ds/loader.js` is a preview helper only.

## Known gaps

- Fonts load from Google Fonts; there are no local binaries.
- Muted labels (#9a8f84, #b3a798) on cream are below 4.5:1 contrast. They are kept as in the prototype; backlog F10.1 covers the fix.
