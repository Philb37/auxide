#!/usr/bin/env bash
# PostToolUse hook (Edit|Write|MultiEdit): validate Svelte files Claude just changed in web/.
# Runs svelte-autofixer and the auxide-ui checks on that file. Problems are sent back to Claude
# (stderr + exit 2) so it fixes them right away. Clean files and non-Svelte files pass silently.
set -uo pipefail
ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"

file="$(python3 -I -c 'import json,sys; d=json.load(sys.stdin); print((d.get("tool_input") or {}).get("file_path",""))' 2>/dev/null)"
[ -z "$file" ] && exit 0
case "$file" in /*) ;; *) file="$ROOT/$file" ;; esac
case "$file" in "$ROOT"/web/src/*) ;; *) exit 0 ;; esac
[ -f "$file" ] || exit 0

problems=""

case "$file" in
  *.svelte|*.svelte.ts|*.svelte.js)
    version="$(python3 -I -c 'import json,re,sys; p=json.load(open(sys.argv[1])); v={**p.get("dependencies",{}),**p.get("devDependencies",{})}.get("svelte","5"); print(re.sub(r"[^0-9.]","",v) or "5")' "$ROOT/web/package.json" 2>/dev/null || echo 5)"
    out="$(cd "$ROOT/web" && timeout 90 npx @sveltejs/mcp svelte-autofixer "$file" --svelte-version "$version" 2>/dev/null)"
    if [ -n "$out" ] && ! { grep -q 'issues: \[\]' <<<"$out" && grep -q 'suggestions: \[\]' <<<"$out"; }; then
      problems+=$'svelte-autofixer:\n'"$(grep -v '^Detected file path' <<<"$out")"$'\n'
    fi
    ;;
esac

case "$file" in
  *.svelte|*.ts|*.js|*.css)
    ui="$(cd "$ROOT" && bash .claude/skills/auxide-ui/scripts/check-ui.sh "${file#"$ROOT"/}" 2>&1)" || problems+=$'check-ui.sh:\n'"$ui"$'\n'
    ;;
esac

if [ -n "$problems" ]; then
  printf 'Checks failed for %s — fix them (or justify each one) before moving on:\n\n%s' "${file#"$ROOT"/}" "$problems" >&2
  exit 2
fi
exit 0
