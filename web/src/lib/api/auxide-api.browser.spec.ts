import { afterEach, describe, expect, it } from 'vitest';
import { createAuxideApi as openAuxideApi, type DisposableAuxideApi } from './index';

const opened: DisposableAuxideApi[] = [];

/** Opens an API (and its worker) that is disposed after the test. */
function createAuxideApi(): DisposableAuxideApi {
	const api = openAuxideApi();
	opened.push(api);
	return api;
}

afterEach(() => {
	opened.splice(0).forEach((api) => api.dispose());
});

/**
 * End to end through the real stack: AuxideApi → worker → auxide-wasm → core.
 * Needs `web/wasm-pkg` built (`pnpm dev` or wasm-pack). Each test opens its own worker.
 *
 * Today the wasm wires an in-memory repository, so every worker starts empty. Once the
 * OPFS adapter lands, data will survive between workers and these tests will need to
 * reset the database (or use a unique one per test).
 */
describe('AuxideApi (worker + wasm)', () => {
	it('starts with no pockets', async () => {
		const api = createAuxideApi();

		await expect(api.listPockets()).resolves.toEqual([]);
	});

	it('creates a pocket and lists it', async () => {
		const api = createAuxideApi();

		const created = await api.createPocket('Groceries');

		expect(created.name).toBe('Groceries');
		expect(created.id).toEqual(expect.any(String));
		await expect(api.listPockets()).resolves.toEqual([created]);
	});

	it('trims the pocket name', async () => {
		const api = createAuxideApi();

		await expect(api.createPocket('  Rent  ')).resolves.toMatchObject({ name: 'Rent' });
	});

	it('gives each pocket its own id', async () => {
		const api = createAuxideApi();

		const first = await api.createPocket('Rent');
		const second = await api.createPocket('Rent');

		expect(first.id).not.toBe(second.id);
	});

	it('rejects a blank name with pocketNameEmpty', async () => {
		const api = createAuxideApi();

		await expect(api.createPocket('   ')).rejects.toEqual({ code: 'pocketNameEmpty' });
		await expect(api.listPockets()).resolves.toEqual([]);
	});
});
