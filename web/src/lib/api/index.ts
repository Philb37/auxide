import type { AuxideApi } from "./auxide-api";
import { WorkerAuxideApi } from "./worker-auxide-api";

/**
 * The AuxideApi plus the handle that stops its worker. Only the owner (the root layout)
 * sees `dispose`; components get a plain AuxideApi through context.
 */
export type DisposableAuxideApi = AuxideApi & { dispose(): void };

export function createAuxideApi(): DisposableAuxideApi {
  return new WorkerAuxideApi(new Worker(new URL('./auxide.worker.ts', import.meta.url), { type: 'module' }));
}
