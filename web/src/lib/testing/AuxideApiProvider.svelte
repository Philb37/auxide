<!--
	Test-only wrapper: provides an AuxideApi through context, the way +layout.svelte does,
	so components can be rendered against a stub. Use it as `wrapper` in `render`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { AuxideApi } from '#lib/api/auxide-api.ts';
	import { setAuxideApi } from '#lib/api/context.ts';

	let { api, children }: { api: AuxideApi; children: Snippet } = $props();

	// The API is fixed for the lifetime of a test render, like the app's single instance.
	// svelte-ignore state_referenced_locally
	setAuxideApi(api);
</script>

{@render children()}
