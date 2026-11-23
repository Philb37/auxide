import type { Pocket } from "#lib/models/pocket.ts";

/**
 * The UI's only way into the domain (`auxide-core`, running as wasm in a Web Worker).
 *
 * Every method is async and rejects only with an `ApiError` (`#lib/models/api-error.ts`),
 * never with an `Error`: callers can read `error.code` and pick the copy to show.
 * TypeScript cannot type rejections, so this rule lives here and in `WorkerAuxideApi`.
 */
export interface AuxideApi {
  /** Every pocket. */
  listPockets(): Promise<Pocket[]>
  /** Creates a pocket. Core trims the name; rejects with `pocketNameEmpty` if it is blank. */
  createPocket(name: string): Promise<Pocket>
}
