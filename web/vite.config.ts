import { spawn } from 'node:child_process';
import path from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

/**
 * `pnpm dev` only: rebuilds web/wasm-pkg (`pnpm run wasm`) when Rust code changes, then
 * reloads the page. The first build runs in the `dev` script, before Vite starts.
 * A failed build keeps the previous wasm-pkg and prints cargo's errors in the terminal.
 */
function rebuildWasmOnRustChange(): Plugin {
	return {
		name: 'auxide:rebuild-wasm',
		apply: 'serve',
		configureServer(server) {
			if (process.env.VITEST) return;

			const { root, logger } = server.config;
			const workspace = path.resolve(root, '..');
			const watched = ['crates', 'Cargo.toml', 'Cargo.lock'].map((p) => path.join(workspace, p));
			const isRust = (file: string) =>
				watched.some((w) => file === w || file.startsWith(w + path.sep)) &&
				/(\.rs|Cargo\.toml|Cargo\.lock)$/.test(file);

			let building = false;
			let again = false;
			let debounce: ReturnType<typeof setTimeout> | undefined;

			const build = () => {
				if (building) {
					again = true;
					return;
				}
				building = true;
				logger.info('Rust changed, rebuilding auxide-wasm…', { timestamp: true });

				// 'close' can follow 'error' (e.g. pnpm not found): settle once.
				let settled = false;
				const done = (ok: boolean) => {
					if (settled) return;
					settled = true;
					building = false;
					if (ok) server.ws.send({ type: 'full-reload' });
					else logger.error('auxide-wasm build failed, keeping the previous build', { timestamp: true });
					if (again) {
						again = false;
						build();
					}
				};
				const child = spawn('pnpm', ['run', '--silent', 'wasm'], { cwd: root, stdio: 'inherit' });
				child.on('error', () => done(false));
				child.on('close', (code) => done(code === 0));
			};

			const onFile = (file: string) => {
				if (!isRust(file)) return;
				clearTimeout(debounce);
				debounce = setTimeout(build, 200);
			};

			server.watcher.add(watched);
			server.watcher.on('change', onFile);
			server.watcher.on('add', onFile);
			server.watcher.on('unlink', onFile);
		}
	};
}

export default defineConfig({
	plugins: [
		rebuildWasmOnRustChange(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter({ fallback: 'index.html' })
		})
	],
	worker: { format: 'es' },
	// SvelteKit only allows src/, .svelte-kit/ and node_modules/. The wasm package
	// (built by wasm-pack into web/wasm-pkg, linked as `auxide-wasm`) resolves to its
	// real path, so the dev server must be allowed to serve it explicitly.
	server: { fs: { allow: ['wasm-pkg'] } },
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}', 'src/**/*.browser.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}', 'src/**/*.browser.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
