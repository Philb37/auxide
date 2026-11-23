import { vi, type Mock } from 'vitest';
import type { AuxideApi } from '#lib/api/auxide-api.ts';

export type StubAuxideApi = { [M in keyof AuxideApi]: Mock<AuxideApi[M]> };

/**
 * An AuxideApi where every method is a `vi.fn`. Each test scripts the replies it needs
 * (pass implementations here, or use `mockResolvedValue` & co); the stub holds no domain
 * logic of its own. By default there are no pockets and creating one never settles.
 */
export function stubAuxideApi(implementations: Partial<AuxideApi> = {}): StubAuxideApi {
	return {
		listPockets: vi.fn(implementations.listPockets ?? (async () => [])),
		createPocket: vi.fn(implementations.createPocket ?? (() => new Promise(() => {})))
	};
}
