import type { AuxideApi } from "#lib/api/auxide-api.ts";
import type { ApiError } from "#lib/models/api-error.ts";

export type Request = {
  [M in keyof AuxideApi]: {
    id: number; method: M; args: Parameters<AuxideApi[M]>;
  }
}[keyof AuxideApi];

export type Reply =
  | { kind: 'ready' }
  | { kind: 'init-failed'; error: ApiError } // wasm or storage could not start
  | { kind: 'result'; id: number; ok: true; value: unknown }
  | { kind: 'result'; id: number; ok: false; error: ApiError };
  // | { kind: 'event'; event: AuxideEvent };     // later: "pockets changed after sync"
