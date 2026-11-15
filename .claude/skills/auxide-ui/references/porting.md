# Porting a reference component (JSX → Svelte 5)

The reference components in `design-system/components/` are compact React with inline styles. Port the **design**, not the code.

## Steps

1. Read the three files: `.d.ts` (props = the API), `.prompt.md` (intent and usage), `.jsx` (exact values).
2. Check [library-map.md](library-map.md) for the source (Bits UI, vaul-svelte, svelte-sonner, own).
3. Write `web/src/lib/ui/<group>/<Name>.svelte`:
   - Props from `.d.ts` become typed `$props()`. Keep the same names and defaults, and callbacks keep their names (`onChange`, `onClick`).
   - `children` becomes a `Snippet`; extra content slots become named snippets.
   - Inline `style={{…}}` objects become a scoped `<style>` block reading tokens. Variant/size lookup tables (`SIZES`, `V`) become classes (`.size-lg`, `.variant-soft`) or `data-*` attributes.
   - Values that vary per instance (hue, width) go through `style:--hue={hue}`, not string-built styles.
   - Forward `class` and rest props (`...rest`) onto the root element so screens can position it.
4. Move pure logic out: `hueColors` / `tint` / `deep` / `mid` → `web/src/lib/ui/hue.ts`; `keypadInput` → `web/src/lib/ui/keypad.ts`; `signed()` amount formatting → the money library (F0.3). Each gets unit tests.
5. Export it from `web/src/lib/ui/index.ts` and add it to the gallery with every variant and state.
6. Run the verification steps in SKILL.md.

## Literal → token cheatsheet

Literals that appear in the reference `.jsx` and the token to use instead:

| Literal in .jsx | Token |
|---|---|
| `'#fff'` (text on accent) | `--text-on-accent` |
| `'#fff'` (card/key background) | `--surface-card` |
| `#e2d6c8` (disabled) | `--fill-disabled` |
| `#f4eee6` (hairline / sunken) | `--border-hairline` / `--surface-sunken` |
| `rgba(42,36,32,.42)` (scrim) | `--scrim` |
| `oklch(0.36 0.09 40)` (soft button text) | none yet — add `--ax-accent-ink-*` step to `tokens/colors.css` and say so |
| `600 15px var(--font-ui)` | the matching `--type-*` token from `tokens/typography.css`, or `font-family: var(--font-ui)` + size from the scale |
| `cubic-bezier(.2,.8,.2,1)`, `.3s` | `--ease-sheet`, `--dur-sheet` |

When a literal has no token, adding one is fine and expected. Inlining it is not.

## Known gaps in the reference to fix while porting

- Clickable `<span>`s (Toggle, Keypad keys, Keypad "Done", ListRow when clickable): use `<button>` / Bits UI.
- No hover or press states: leave them out, or add a subtle shadow lift and flag it for review (backlog item on press/hover states).
- Muted labels (`--text-subtle`, `--text-placeholder`) fail 4.5:1 contrast on cream: keep the token, the fix is a token change (F10.1), not a per-component override.
