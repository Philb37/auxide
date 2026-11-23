<script lang="ts">
	import { getAuxideApi } from '#lib/api/context.ts';
	import type { ApiError } from '#lib/models/api-error.ts';
	import type { Pocket } from '#lib/models/pocket.ts';

	const api = getAuxideApi();

	// The last list received. It stays on screen while a refresh is in flight, so the list
	// does not flash back to "Loading" after each create. `null` only before the first load.
	let pockets = $state.raw<Pocket[] | null>(null);
	let loadError = $state<ApiError | null>(null);
	let name = $state('');
	let createError = $state<ApiError | null>(null);

	async function refresh() {
		try {
			pockets = await api.listPockets();
			loadError = null;
		} catch (error) {
			loadError = error as ApiError;
		}
	}

	refresh();

	async function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		createError = null;

		try {
			await api.createPocket(name);
			name = '';
		} catch (error) {
			createError = error as ApiError;
			return;
		}

		await refresh();
	}
</script>

<form {onsubmit}>
	<label>
		Pocket name
		<input bind:value={name} autocomplete="off" />
	</label>
	<button type="submit">Create pocket</button>
</form>

{#if createError}
	<p role="alert">Could not create the pocket · {createError.code}</p>
{/if}

{#if loadError}
	<p role="alert">Could not load pockets · {loadError.code}</p>
{/if}

<!-- After a failed refresh, the last list stays visible next to the error. -->
{#if pockets === null}
	{#if !loadError}
		<p>Loading pockets…</p>
	{/if}
{:else if pockets.length === 0}
	<p>No pockets yet</p>
{:else}
	<ul>
		{#each pockets as pocket (pocket.id)}
			<li>{pocket.name}</li>
		{/each}
	</ul>
{/if}
