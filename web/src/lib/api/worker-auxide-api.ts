import type { ApiError } from "#lib/models/api-error.ts";
import type { Pocket } from "#lib/models/pocket.ts";
import type { AuxideApi } from "./auxide-api";
import type { Reply, Request } from "./protocol";

type Pending = {
  resolve: (value: unknown) => void;
  reject: (error: ApiError) => void;
};

export class WorkerAuxideApi implements AuxideApi {
  #worker: Worker;
  #ready: Promise<void>;
  #readyOk: () => void;
  #readyFailed: (error: ApiError) => void;
  // Set once the worker crashed or was disposed: every later call rejects with it.
  #stopped: ApiError | null = null;
  #nextId = 0;
  #pending = new Map<number, Pending>();

  constructor(worker: Worker) {
    this.#worker = worker;

    const { promise, resolve, reject } = Promise.withResolvers<void>();
    this.#ready = promise;
    this.#readyOk = resolve;
    this.#readyFailed = reject;
    // Calls handle the failure through `await this.#ready`. Without this, an init
    // failure before any call would be reported as an unhandled rejection.
    promise.catch((e) => {
      console.error(e);
    });

    worker.addEventListener("message", (event: MessageEvent<Reply>) =>
      this.#onReply(event.data),
    );

    worker.addEventListener("error", (event: ErrorEvent) => {

      console.error(event);

      // Before `ready`, the worker could not start; after, it broke while running.
      this.#readyFailed({ code: "initError" });
      this.#stop({ code: "internal" });
    });
  }

  /**
   * Terminates the worker. Pending and later calls reject with `internal`.
   * Only the owner of the API (the root layout) calls it.
   */
  dispose(): void {
    this.#worker.terminate();
    this.#readyFailed({ code: "internal" });
    this.#stop({ code: "internal" });
  }

  #stop(error: ApiError): void {
    this.#stopped ??= error;
    this.#pending.forEach((pending) => {
      pending.reject(error);
    });

    this.#pending.clear();
  }

  #onReply(reply: Reply): void {
    switch (reply.kind) {
      case "ready":
        this.#readyOk();
        return;
      case "init-failed":
        this.#readyFailed(reply.error);
        return;
      case "result": {
        const pending = this.#pending.get(reply.id);

        if (!pending) {
          return;
        }

        this.#pending.delete(reply.id);

        if (reply.ok) {
          pending.resolve(reply.value);
          return;
        }

        pending.reject(reply.error);
        return;
      }
    }
  }

  async #call<M extends keyof AuxideApi>(
    method: M,
    ...args: Parameters<AuxideApi[M]>
  ): Promise<Awaited<ReturnType<AuxideApi[M]>>> {
    await this.#ready;

    if (this.#stopped) {
      throw this.#stopped;
    }

    const id = this.#nextId++;
    const { promise, resolve, reject } = Promise.withResolvers<unknown>();
    this.#pending.set(id, { resolve, reject });

    this.#worker.postMessage({ id, method, args } as Request);

    return promise as Promise<Awaited<ReturnType<AuxideApi[M]>>>;
  }

  listPockets(): Promise<Pocket[]> {
    return this.#call("listPockets");
  }

  createPocket(name: string): Promise<Pocket> {
    return this.#call("createPocket", name);
  }
}
