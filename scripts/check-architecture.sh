#!/usr/bin/env bash
# Auxide architecture guardrails (hexagonal dependency rule + pure core + thin shells).
# Usage: bash scripts/check-architecture.sh
# Exit 1 if a rule is broken. Rules and the why: .claude/skills/auxide-core/references/architecture.md
set -uo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT" || exit 2
fail=0
report() { printf '\n✗ %s\n  → %s\n%s\n' "$1" "$2" "$(sed 's/^/    /' <<<"$3" | cut -c1-200)"; fail=1; }

# 1. Workspace dependency graph (normal + build deps; dev-deps are free for tests).
graph="$(cargo metadata --format-version 1 --no-deps 2>/dev/null | python3 -I -c '
import json, sys
allowed = {
  "auxide-core": set(),
  "auxide-api-types": set(),
  "auxide-storage-opfs": {"auxide-core"},
  "auxide-storage-pgsql": {"auxide-core"},
  "auxide-http-client": {"auxide-core", "auxide-api-types"},
  "auxide-wasm": {"auxide-core", "auxide-storage-opfs", "auxide-http-client", "auxide-api-types"},
  "auxide-server": {"auxide-core", "auxide-storage-pgsql", "auxide-api-types"},
  "auxide-tauri-shell": set(),
}
m = json.load(sys.stdin)
ws = {p["name"] for p in m["packages"]}
for p in m["packages"]:
    name = p["name"]
    if name not in allowed:
        print(f"{name}: new crate, not in the dependency table (add it to architecture.md and this script)")
        continue
    for d in p["dependencies"]:
        if d.get("kind") == "dev":
            continue
        dep = d["name"]
        ok = ", ".join(sorted(allowed[name])) or "none"
        if dep in ws and dep not in allowed[name]:
            print(f"{name} -> {dep} (allowed: {ok})")
')" || { echo "✗ could not read the workspace graph (cargo metadata / python3 failed)"; fail=1; }
[ -n "$graph" ] && report "Dependency rule broken" "dependencies must point inward to core; only composition roots wire adapters" "$graph"

# 2. Infrastructure crates in core, transitively.
if cargo metadata --format-version 1 --no-deps >/dev/null 2>&1; then
  infra="$(cargo tree -p auxide-core -e normal,build --target all --prefix none -f '{p}' 2>/dev/null \
    | grep -E '^(wasm-bindgen|web-sys|js-sys|gloo|actix|diesel|sqlx|rusqlite|libsqlite3|sqlite|tokio|async-std|reqwest|hyper|tauri|serde_json|getrandom|rand|tracing-subscriber|tracing-opentelemetry|tracing-wasm|tracing-web|opentelemetry[a-z_-]*) ' | sort -u)"
  [ -n "$infra" ] && report "Infrastructure crate in auxide-core" "core stays pure: put it behind a port and implement it in an adapter" "$infra"
fi

# 3. Clock, randomness, id generation, I/O called directly from core.
if [ -d crates/core/src ]; then
  calls="$(grep -rnE '(SystemTime|Instant)::now|Utc::now|Local::now|OffsetDateTime::now|Uuid::(now_v7|new_v4|new_v7)|thread_rng|rand::|std::fs::|std::net::|std::env::|println!|eprintln!|dbg!|\blog::' crates/core/src 2>/dev/null)"
  [ -n "$calls" ] && report "Side effect inside auxide-core" "time, ids and randomness come from the Clock / IdGenerator ports; no I/O or printing in core: log through the tracing macros" "$calls"
  floats="$(grep -rnE '\b(f32|f64)\b' crates/core/src 2>/dev/null)"
  [ -n "$floats" ] && report "Float in auxide-core" "money is i64 cents; if this float is not money (e.g. a ratio for display), justify it" "$floats"
fi

# 4. Thin shells: no business entry points in Tauri, no Tauri IPC from the UI.
cmds="$(grep -rnE '#\[tauri::command\]|invoke_handler' tauri-shell/src 2>/dev/null)"
[ -n "$cmds" ] && report "Tauri command in the desktop shell" "tauri-shell only hosts the web build: no commands (exceptions are recorded in CLAUDE.md)" "$cmds"
ipc="$(grep -rnE "from ['\"]@tauri-apps/" web/src --include=*.svelte --include=*.ts --include=*.js 2>/dev/null)"
[ -n "$ipc" ] && report "Tauri API used from web/" "the UI must run the same in the browser and in the shell" "$ipc"

# 5. Only the AuxideApi facade talks to the wasm module.
wasm="$(grep -rnE "from ['\"]auxide-wasm|import\(['\"]auxide-wasm" web/src --include=*.svelte --include=*.ts --include=*.js 2>/dev/null | grep -v '^web/src/lib/api/')"
[ -n "$wasm" ] && report "auxide-wasm imported outside the facade" "go through AuxideApi (web/src/lib/api/)" "$wasm"

if [ $fail -eq 0 ]; then echo "✓ architecture checks passed"; else printf '\nFix each hit, or justify it.\n'; fi
exit $fail
