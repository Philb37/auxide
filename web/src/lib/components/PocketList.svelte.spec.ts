import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PocketList from './PocketList.svelte';
import AuxideApiProvider from '#lib/testing/AuxideApiProvider.svelte';
import { stubAuxideApi } from '#lib/testing/stub-auxide-api.ts';
import type { AuxideApi } from '#lib/api/auxide-api.ts';

function renderPocketList(api: AuxideApi) {
	return render(PocketList, {}, { wrapper: AuxideApiProvider, wrapperProps: { api } });
}

const nameInput = () => page.getByRole('textbox', { name: 'Pocket name' });
const createButton = () => page.getByRole('button', { name: 'Create pocket' });

describe('PocketList.svelte', () => {
	it('shows a loading message until the pockets arrive', async () => {
		const { promise, resolve } = Promise.withResolvers<[]>();
		renderPocketList(stubAuxideApi({ listPockets: () => promise }));

		await expect.element(page.getByText('Loading pockets…')).toBeInTheDocument();

		resolve([]);
		await expect.element(page.getByText('No pockets yet')).toBeInTheDocument();
	});

	it('lists the pockets returned by the API', async () => {
		const api = stubAuxideApi();
		api.listPockets.mockResolvedValue([
			{ id: 'p1', name: 'Groceries' },
			{ id: 'p2', name: 'Rent' }
		]);
		renderPocketList(api);

		const items = page.getByRole('listitem');
		await expect.element(items.nth(0)).toHaveTextContent('Groceries');
		await expect.element(items.nth(1)).toHaveTextContent('Rent');
		expect(items.elements()).toHaveLength(2);
	});

	it('creates a pocket, clears the field and reloads the list', async () => {
		const api = stubAuxideApi();
		api.createPocket.mockResolvedValue({ id: 'p1', name: 'Groceries' });
		api.listPockets
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([{ id: 'p1', name: 'Groceries' }]);
		renderPocketList(api);
		await expect.element(page.getByText('No pockets yet')).toBeInTheDocument();

		await userEvent.fill(nameInput(), 'Groceries');
		await userEvent.click(createButton());

		await expect.element(page.getByRole('listitem')).toHaveTextContent('Groceries');
		await expect.element(nameInput()).toHaveValue('');
		expect(api.createPocket).toHaveBeenCalledExactlyOnceWith('Groceries');
		expect(api.listPockets).toHaveBeenCalledTimes(2);
	});

	it('keeps the current list on screen while it reloads after a create', async () => {
		const api = stubAuxideApi();
		const reload = Promise.withResolvers<{ id: string; name: string }[]>();
		api.createPocket.mockResolvedValue({ id: 'p2', name: 'Rent' });
		api.listPockets
			.mockResolvedValueOnce([{ id: 'p1', name: 'Groceries' }])
			.mockReturnValueOnce(reload.promise);
		renderPocketList(api);
		await expect.element(page.getByRole('listitem')).toHaveTextContent('Groceries');

		await userEvent.fill(nameInput(), 'Rent');
		await userEvent.click(createButton());
		await expect.poll(() => api.listPockets).toHaveBeenCalledTimes(2);

		await expect.element(page.getByRole('listitem')).toHaveTextContent('Groceries');
		await expect.element(page.getByText('Loading pockets…')).not.toBeInTheDocument();

		reload.resolve([
			{ id: 'p1', name: 'Groceries' },
			{ id: 'p2', name: 'Rent' }
		]);
		await expect.element(page.getByRole('listitem').nth(1)).toHaveTextContent('Rent');
	});

	it('keeps the last list on screen when a reload fails', async () => {
		const api = stubAuxideApi();
		api.createPocket.mockResolvedValue({ id: 'p2', name: 'Rent' });
		api.listPockets
			.mockResolvedValueOnce([{ id: 'p1', name: 'Groceries' }])
			.mockRejectedValueOnce({ code: 'internal' });
		renderPocketList(api);
		await expect.element(page.getByRole('listitem')).toHaveTextContent('Groceries');

		await userEvent.fill(nameInput(), 'Rent');
		await userEvent.click(createButton());

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent('Could not load pockets · internal');
		await expect.element(page.getByRole('listitem')).toHaveTextContent('Groceries');
	});

	it('submits with the Enter key', async () => {
		const api = stubAuxideApi();
		api.createPocket.mockResolvedValue({ id: 'p1', name: 'Rent' });
		renderPocketList(api);

		await userEvent.type(nameInput(), 'Rent{Enter}');

		await expect.poll(() => api.createPocket).toHaveBeenCalledWith('Rent');
	});

	it('shows the error and keeps the typed name when creation fails', async () => {
		const api = stubAuxideApi();
		api.createPocket.mockRejectedValue({ code: 'pocketNameEmpty' });
		renderPocketList(api);

		await userEvent.fill(nameInput(), '   ');
		await userEvent.click(createButton());

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent('Could not create the pocket · pocketNameEmpty');
		await expect.element(nameInput()).toHaveValue('   ');
		expect(api.listPockets).toHaveBeenCalledOnce();
	});

	it('clears a previous creation error on the next successful submit', async () => {
		const api = stubAuxideApi();
		api.createPocket
			.mockRejectedValueOnce({ code: 'pocketNameEmpty' })
			.mockResolvedValueOnce({ id: 'p1', name: 'Rent' });
		renderPocketList(api);

		await userEvent.click(createButton());
		await expect.element(page.getByRole('alert')).toBeInTheDocument();

		await userEvent.fill(nameInput(), 'Rent');
		await userEvent.click(createButton());

		await expect.element(page.getByRole('alert')).not.toBeInTheDocument();
	});

	it('shows an error when the pockets cannot be loaded', async () => {
		renderPocketList(stubAuxideApi({ listPockets: () => Promise.reject({ code: 'initError' }) }));

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent('Could not load pockets · initError');
	});
});
