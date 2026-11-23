import init, { Auxide, type PocketDto } from "auxide-wasm";
import type { Reply, Request } from "./protocol";
import type { Pocket } from "#lib/models/pocket.ts";
import { toApiError } from "./to-api-error";

const ready: Promise<Auxide> = init().then(() => Auxide.open());
const toPocket = (dto: PocketDto): Pocket => ({ id: dto.id, name: dto.name });

function reply(message: Reply): void {
  self.postMessage(message);
}

ready.then(
  () => reply({ kind: 'ready' }),
  (e) => {
    // A failed wasm fetch or compile throws a plain Error: it is still "could not start".
    console.error(e);
    reply({ kind: 'init-failed', error: toApiError(e, 'initError') });
  },
);

self.addEventListener('message', async (event: MessageEvent<Request>) => {
  const request = event.data;
  try {
    const auxide = await ready;
    const value = await handle(auxide, request);
    reply({ kind: 'result', id: request.id, ok: true, value });
  } catch (e) {
    const error = toApiError(e);
    // A known ApiError is returned as is (Rust already logged an internal one). Anything
    // else (a wasm trap, a JS exception) only reaches the UI as `internal`: log the cause.
    if (error !== e) {
      console.error(e);
    }
    reply({ kind: 'result', id: request.id, ok: false, error });
  }
});

async function handle(auxide: Auxide, request: Request): Promise<unknown> {
  switch (request.method) {
    case 'listPockets':
      return auxide.listPockets().map(toPocket);
    case 'createPocket':
      return toPocket(auxide.createPocket(request.args[0]));
    default: {
      const unreachable: never = request;
      throw new Error(`unknown method ${String(unreachable)}`);
    }
  }
}
