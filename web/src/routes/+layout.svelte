<script lang="ts">
    import { setAuxideApi } from '#lib/api/context.ts';
    import { createAuxideApi } from '#lib/api/index.ts';
	import favicon from '#lib/assets/favicon.svg';
	import { onDestroy } from 'svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const api = createAuxideApi();
	setAuxideApi(api);
	// The layout is re-created on HMR: stop the old worker so it cannot keep the database open.
	onDestroy(() => api.dispose());
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
