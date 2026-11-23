import type { ApiError as WasmApiError } from "auxide-wasm";
import type { ApiError } from "#lib/models/api-error.ts";

// The UI model is written by hand so `models/` never depends on the wasm package. This
// type-only check (lib/api is the one place allowed to see auxide-wasm) keeps the two in
// step: when the Rust ApiError changes and the model does not, `pnpm check` fails here
// with "Type 'true' does not satisfy the expected type 'false'".
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
true satisfies Same<ApiError, WasmApiError>;

// Every code exactly once: a code added to ApiError but not listed here fails to compile.
const KNOWN_CODES: Record<ApiError['code'], true> = {
  initError: true,
  internal: true,
  pocketNameEmpty: true,
};

/**
 * Turns whatever the wasm threw into an ApiError. A value that is not a known ApiError
 * (a JS Error, a failed wasm fetch…) becomes `fallback`.
 */
export function toApiError(e: unknown, fallback: ApiError['code'] = 'internal'): ApiError {

  if (typeof e === 'object' && e !== null && 'code' in e && typeof e.code === 'string'
    && Object.hasOwn(KNOWN_CODES, e.code)) {
    return e as ApiError;
  }

  return { code: fallback };
}
