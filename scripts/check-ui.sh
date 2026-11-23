#!/usr/bin/env bash
# Auxide UI guardrails. Scans the Svelte frontend for design-system drift and reinvented wheels.
# Usage: bash scripts/check-ui.sh [path ...]   (default: web/src)
# Exit 1 if any check finds something. Each hit prints file:line so it can be fixed or justified.
set -uo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT" || exit 2
TARGETS=("$@"); [ ${#TARGETS[@]} -eq 0 ] && TARGETS=(web/src)
INC=(--include=*.svelte --include=*.ts --include=*.js --include=*.css)
EXCL=(--exclude-dir=node_modules --exclude-dir=.svelte-kit --exclude=*.spec.ts --exclude=*.test.ts)
fail=0

check() { # $1 title, $2 hint, $3 regex of lines to ignore ('' = none), rest: grep args
  local title="$1" hint="$2" ignore="$3"; shift 3
  local out; out="$(grep -rnE "${INC[@]}" "${EXCL[@]}" "$@" "${TARGETS[@]}" 2>/dev/null)"
  [ -n "$ignore" ] && out="$(grep -vE "$ignore" <<<"$out")"
  if [ -n "$out" ]; then
    printf '\n✗ %s\n  → %s\n%s\n' "$title" "$hint" "$(sed 's/^/    /' <<<"$out" | cut -c1-200)"
    fail=1
  fi
}

# 1. Hard-coded colours (oklch/rgb/hsl built on var(--hue…) etc. are allowed: derived hue colours).
check "Hard-coded colour" "use a token from design-system/tokens (add one if missing)" "href=[\"'][^\"']*#" \
  -e '(^|[^&\w-])#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?([0-9a-fA-F]{2})?\b[^-]' \
  -e '\b(rgba?|hsla?|oklch|oklab|lab|lch)\((\s*[0-9.]+%?[ ,/]+){2}\s*[0-9.]+(%|deg)?\s*[,/)]'

check "Gradient" "the design system is flat colour only" '' \
  -e '(linear|radial|conic)-gradient\('

check "Literal font family" "use var(--font-ui) / var(--font-display) or a --type-* token" '' \
  -i -e "font(-family)?\s*:[^;]*['\"]?(fredoka|figtree|inter|roboto|helvetica|arial)"

# 2. Banned dependencies / imports (see references/library-map.md).
check "Banned import" "not in the library map — ask the user before adding a library" '' \
  -e "from ['\"](react|react-dom|@radix-ui/|@base-ui|lucide|@lucide/|lucide-svelte|framer-motion|motion|motion-sv|svelte-motion|@melt-ui/|melt|@ark-ui/|@zag-js/|shadcn|tailwind|tailwind-variants|clsx|@iconify|phosphor|svelte-hero-icons)" \
  -e "@import ['\"](tailwindcss|https?://fonts\.googleapis)"

# 3. Interactive elements built by hand.
check "Clickable div/span" "use <button>/<a> or a Bits UI primitive" '' \
  -e '<(div|span|li|p)\b[^>]*\bon(click|keydown|pointerdown)='

# 4. Legacy Svelte syntax (svelte-core-bestpractices).
check "Legacy Svelte syntax" "runes, onclick, snippets, {@attach} — see svelte-core-bestpractices" '' \
  -e '\bon:[a-z]+' -e '^\s*export let ' -e '<slot\b' -e '^\s*\$:' -e 'createEventDispatcher' -e '<svelte:component\b' -e '\buse:[a-zA-Z]'

# 5. Design-system components duplicated outside web/src/lib/ui.
if [ -d design-system/components ]; then
  names="$(find design-system/components -name '*.jsx' -printf '%f\n' | sed 's/\.jsx$//' | sort -u)"
  dups="$(find "${TARGETS[@]}" -name '*.svelte' -not -path '*/lib/ui/*' -not -path '*/node_modules/*' 2>/dev/null \
    | while read -r f; do b="$(basename "$f" .svelte)"; grep -qxF "$b" <<<"$names" && echo "$f"; done)"
  if [ -n "$dups" ]; then
    printf '\n✗ Design-system component re-created outside web/src/lib/ui\n  → import it from $lib/ui instead\n%s\n' "$(sed 's/^/    /' <<<"$dups")"
    fail=1
  fi
  near="$(find "${TARGETS[@]}" -name '*.svelte' -not -path '*/node_modules/*' 2>/dev/null \
    | grep -E '/(My|Custom|New|Base|Simple)?(Button|Card|Toggle|Chip|Sheet|Modal|Dialog|Drawer|Toast|Badge|Avatar)[0-9]+\.svelte$|/(My|Custom|New|Simple)(Button|Card|Toggle|Chip|Sheet|Modal|Dialog|Drawer|Toast|Badge|Avatar)\.svelte$|/(Modal|Drawer|Popup|Snackbar|Notification)\.svelte$')"
  if [ -n "$near" ]; then
    printf '\n✗ Look-alike component name\n  → reuse Sheet / ConfirmDialog / Toast / Button… from $lib/ui\n%s\n' "$(sed 's/^/    /' <<<"$near")"
    fail=1
  fi
fi

# 6. Dependencies in web/package.json that are not in the library map.
if [ -f web/package.json ] && command -v node >/dev/null; then
  extra="$(node -e '
    const p=require("./web/package.json");
    const ok=/^(bits-ui|vaul-svelte|svelte-sonner|@number-flow\/svelte|@fontsource\/(fredoka|figtree)|@tanstack\/svelte-virtual|runed|auxide-wasm|@sveltejs\/.*|svelte|svelte-check|typescript|vite|vitest|@vitest\/.*|vitest-browser-svelte|playwright|@playwright\/.*|cross-env|@tauri-apps\/.*|@types\/.*|eslint.*|@eslint\/.*|prettier.*|typescript-eslint|globals)$/;
    for (const d of Object.keys({...p.dependencies,...p.devDependencies})) if(!ok.test(d)) console.log(d);')"
  if [ -n "$extra" ]; then
    printf '\n✗ Dependency not in references/library-map.md\n  → get the user’s OK, then add it to the map (or remove it)\n%s\n' "$(sed 's/^/    /' <<<"$extra")"
    fail=1
  fi
fi

if [ $fail -eq 0 ]; then echo "✓ auxide-ui checks passed (${TARGETS[*]})"; else printf '\nFix each hit, or justify it in your reply.\n'; fi
exit $fail
