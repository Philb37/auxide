# Library map

Decided with the user on 2026-11-15. Changing a row is a design decision: ask first, then update this file and the backlog.

## Approved dependencies (web/package.json)

| Package | Version | Used for |
|---|---|---|
| `bits-ui` | `^2.21` | Headless, accessible primitives (Svelte's Radix / Base UI) |
| `vaul-svelte` | `1.0.0-next.7` — **pin exactly**, it is a prerelease | Phone bottom sheet with swipe-to-close. Isolated inside `Sheet.svelte` so it can be swapped for Bits UI `Dialog` + our own gesture without touching screens |
| `svelte-sonner` | `^1.2` | Toast queue, stacking, timers, swipe-to-dismiss |
| `@number-flow/svelte` | `^0.4` | Digit transitions on app-computed amounts (NumberFlow rule in SKILL.md) |
| `@fontsource/fredoka` (600) · `@fontsource/figtree` (500, 600) | `^5` | Bundled fonts, no Google Fonts request (offline) |
| `@tanstack/svelte-virtual` | `^3` | Virtualised entry lists (F10.2: 5,000 entries at 60fps). Only for lists that can grow unbounded |
| `runed` | optional | Small reactive utilities (media queries, debounce, element size) — prefer it to a hand-written `$effect` |

Not needed — do not add: a state library (runes + classes with `$state`), a form library (forms are small; validation lives in Rust `core`), a chart library (breakdowns are `StripBar` / `ProgressBar`), a date-picker library (F2.4 uses chips + the native picker), `clsx`/`tailwind-variants` (Svelte's `class` accepts arrays/objects), `mode-watcher` (no dark mode in the design system yet).

## Reference component → source

| Design-system component | Build from | Notes |
|---|---|---|
| **controls/** Button | own `<button>` | Variants and sizes from `Button.d.ts` |
| IconButton | own `<button>` | `aria-label` required (`label` prop) |
| SegmentedControl | Bits UI `ToggleGroup` (type single) | Or `RadioGroup` when it's a form value. White raised pill = `[data-state="on"]` |
| Toggle | Bits UI `Switch` | Replaces the reference `<span role="switch">` (no keyboard) |
| Chip | own `<button>` (`aria-pressed`) | Inside a group, the group owns selection |
| ChipGroup | Bits UI `ToggleGroup` (single or multiple) | Keeps the two-rows + peek + mask fade from the reference |
| **display/** Amount, Avatar, AvatarStack, Badge, StatusChip, Card, HeroCard, CategoryTile, Logo / LogoMark, Icon | own | Presentational. `Amount` static; app-computed totals use NumberFlow with the same formatting. `Icon` keeps the 9 reference SVG paths, no icon library |
| ProgressBar | Bits UI `Progress` (or `Meter` for budget used) | Gives the right ARIA role |
| StripBar | own | Category breakdown bar; add an accessible text summary |
| **forms/** FieldCard | own `<label>` + native input | |
| AmountInput, MoneyInput | own native `<input inputmode="decimal">` | Uses `keypadInput` rules (F2.3); desktop accepts `,` and `.` |
| ChoiceCard | Bits UI `RadioGroup` item | Accent inset ring = `[data-state="checked"]` |
| HuePicker | Bits UI `RadioGroup` | One item per `--ax-hue-*` |
| Pickers with ▾ (pocket, category kind…) | Bits UI `Select` | Or a `Sheet` with a list on phone when options are rich |
| **lists/** ListRow, SettingsList / SettingsRow | own | Row is a `<button>`/`<a>` when it navigates |
| ToggleRow | own row + Bits UI `Switch` | Whole row toggles; label wired to the switch |
| **feedback/** Toast | svelte-sonner `Toaster` + our `Toast` markup | Duration `--toast-ms` (4.5s). Copy: "Spending added to Everyday" |
| Banner, EmptyState | own | |
| **overlays/** Sheet | phone: `vaul-svelte` Drawer · tablet (right drawer 440px) and desktop (modal 520px): Bits UI `Dialog` | One `Sheet` API, variant chosen by breakpoint. Focus trap, Esc, scrim `--scrim`, timings `--dur-sheet` / `--ease-sheet` |
| ConfirmDialog | Bits UI `AlertDialog` | Names the thing and the consequence |
| ••• menus | Bits UI `DropdownMenu` | |
| **entry/** Keypad + `keypadInput` | own; `keypadInput` → `web/src/lib/ui/keypad.ts` with tests | Keys are `<button>`s. Phone/tablet only |
| **navigation/** BottomNav, SidebarNav / NavItem | own `<nav>` + `<a>` | `aria-current="page"` on the active item |
| PeriodStepper | own (two IconButtons + label) | |

## Possible later additions (ask first)

- Bits UI `Command` — ⌘K palette if desktop keyboard support (F9.7) grows into search.
- Bits UI `Tooltip` — only for desktop icon buttons, never as the only label.
- Bits UI `ScrollArea` — if native scrolling in the sidebar pockets list looks wrong on desktop.
