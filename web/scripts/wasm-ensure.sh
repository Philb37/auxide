#!/usr/bin/env bash
# Builds web/wasm-pkg before check / test / build when it is missing, or (locally) older
# than the Rust sources, so `pnpm check` never compares against stale wasm types.
# In CI the package comes from the wasm job's artifact (and there is no wasm-pack in the
# web job): only check that it is there.
set -euo pipefail
cd "$(dirname "$0")/.."

pkg=wasm-pkg/package.json
if [ -f "$pkg" ]; then
  [ -n "${CI:-}" ] && exit 0
  [ -z "$(find ../crates ../Cargo.toml ../Cargo.lock -newer "$pkg" -print -quit)" ] && exit 0
  echo "Rust sources changed since the last wasm build, rebuilding auxide-wasm…"
fi
exec pnpm run wasm
