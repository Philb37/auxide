import { describe, expect, it, vi } from 'vitest';
import type { Reply, Request } from './protocol';
import { WorkerAuxideApi } from './worker-auxide-api';

/** Stands in for the real worker: records what the facade posts and lets the test reply. */
class FakeWorker extends EventTarget {
	posted: Request[] = [];
	terminated = false;

	postMessage(message: Request): void {
		this.posted.push(message);
	}

	terminate(): void {
		this.terminated = true;
	}

	reply(message: Reply): void {
		this.dispatchEvent(new MessageEvent('message', { data: message }));
	}

	crash(message: string): void {
		this.dispatchEvent(Object.assign(new Event('error'), { message }));
	}
}

function setup() {
	const worker = new FakeWorker();
	const api = new WorkerAuxideApi(worker as unknown as Worker);
	return { worker, api };
}

/** Lets pending promise callbacks (the facade awaiting `ready`) run. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('WorkerAuxideApi', () => {
	it('waits for the worker to be ready before posting a request', async () => {
		const { worker, api } = setup();

		void api.listPockets();
		await flush();
		expect(worker.posted).toHaveLength(0);

		worker.reply({ kind: 'ready' });
		await flush();
		expect(worker.posted).toEqual([{ id: 0, method: 'listPockets', args: [] }]);
	});

	it('resolves with the value of the matching result', async () => {
		const { worker, api } = setup();
		worker.reply({ kind: 'ready' });

		const created = api.createPocket('Groceries');
		await flush();
		expect(worker.posted).toEqual([{ id: 0, method: 'createPocket', args: ['Groceries'] }]);

		worker.reply({ kind: 'result', id: 0, ok: true, value: { id: 'p1', name: 'Groceries' } });
		await expect(created).resolves.toEqual({ id: 'p1', name: 'Groceries' });
	});

	it('matches replies to requests by id, whatever the order', async () => {
		const { worker, api } = setup();
		worker.reply({ kind: 'ready' });

		const first = api.createPocket('Rent');
		const second = api.listPockets();
		await flush();
		const [firstId, secondId] = worker.posted.map((request) => request.id);

		worker.reply({ kind: 'result', id: secondId, ok: true, value: [] });
		worker.reply({ kind: 'result', id: firstId, ok: true, value: { id: 'p1', name: 'Rent' } });

		await expect(first).resolves.toEqual({ id: 'p1', name: 'Rent' });
		await expect(second).resolves.toEqual([]);
	});

	it('rejects with the ApiError of a failed result', async () => {
		const { worker, api } = setup();
		worker.reply({ kind: 'ready' });

		const created = api.createPocket('   ');
		await flush();
		worker.reply({ kind: 'result', id: 0, ok: false, error: { code: 'pocketNameEmpty' } });

		await expect(created).rejects.toEqual({ code: 'pocketNameEmpty' });
	});

	it('ignores a result for an unknown id', async () => {
		const { worker, api } = setup();
		worker.reply({ kind: 'ready' });

		const listed = api.listPockets();
		await flush();
		worker.reply({ kind: 'result', id: 42, ok: true, value: 'stray' });
		worker.reply({ kind: 'result', id: 0, ok: true, value: [] });

		await expect(listed).resolves.toEqual([]);
	});

	it('rejects every call when the worker reports init-failed', async () => {
		const { worker, api } = setup();
		worker.reply({ kind: 'init-failed', error: { code: 'initError' } });

		await expect(api.listPockets()).rejects.toEqual({ code: 'initError' });
		await expect(api.createPocket('Rent')).rejects.toEqual({ code: 'initError' });
		expect(worker.posted).toHaveLength(0);
	});

	it('rejects pending calls with internal when the worker crashes', async () => {
		const { worker, api } = setup();
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		worker.reply({ kind: 'ready' });

		const listed = api.listPockets();
		await flush();
		worker.crash('boom');

		await expect(listed).rejects.toEqual({ code: 'internal' });
		expect(consoleError).toHaveBeenCalledWith(expect.objectContaining({ message: 'boom' }));
		consoleError.mockRestore();
	});

	it('rejects calls with initError when the worker crashes before being ready', async () => {
		const { worker, api } = setup();
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		worker.crash('wasm failed to load');

		await expect(api.listPockets()).rejects.toEqual({ code: 'initError' });
		consoleError.mockRestore();
	});

	it('rejects later calls with internal once the worker crashed after being ready', async () => {
		const { worker, api } = setup();
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		worker.reply({ kind: 'ready' });
		await flush();
		worker.crash('boom');

		await expect(api.listPockets()).rejects.toEqual({ code: 'internal' });
		expect(worker.posted).toHaveLength(0);
		consoleError.mockRestore();
	});

	it('does not leave an unhandled rejection when init fails before any call', async () => {
		// Vitest fails the run on an unhandled rejection, so reaching the end is the check.
		const { worker } = setup();
		worker.reply({ kind: 'init-failed', error: { code: 'initError' } });
		await flush();

		expect(worker.posted).toHaveLength(0);
	});

	it('dispose terminates the worker and rejects pending and later calls', async () => {
		const { worker, api } = setup();
		worker.reply({ kind: 'ready' });

		const listed = api.listPockets();
		await flush();
		api.dispose();

		expect(worker.terminated).toBe(true);
		await expect(listed).rejects.toEqual({ code: 'internal' });
		await expect(api.createPocket('Rent')).rejects.toEqual({ code: 'internal' });
		expect(worker.posted).toHaveLength(1);
	});

	it('dispose before ready rejects the calls waiting for it', async () => {
		const { worker, api } = setup();

		const listed = api.listPockets();
		api.dispose();

		await expect(listed).rejects.toEqual({ code: 'internal' });
		expect(worker.posted).toHaveLength(0);
	});
});
