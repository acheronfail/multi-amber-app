/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, prerendered, version } from '$service-worker';

// SvelteKit registers this file automatically in production builds.
const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE = `amber-dashboard-${version}`;

// The full app shell: hashed JS/CSS (`build`), static assets in /static
// (`files`, incl. icons + manifest), and prerendered HTML pages.
const PRECACHE = [...build, ...files, ...prerendered];

sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(PRECACHE))
			.then(() => sw.skipWaiting())
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key !== CACHE) await caches.delete(key);
			}
			await sw.clients.claim();
		})()
	);
});

sw.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;

	const url = new URL(request.url);

	// Never intercept cross-origin requests — Amber API calls must always hit
	// the network so prices stay live.
	if (url.origin !== sw.location.origin) return;

	// Cache-first for immutable, hashed build assets.
	if (build.includes(url.pathname) || files.includes(url.pathname)) {
		event.respondWith(
			caches.open(CACHE).then(async (cache) => {
				const cached = await cache.match(request);
				if (cached) return cached;
				const response = await fetch(request);
				cache.put(request, response.clone());
				return response;
			})
		);
		return;
	}

	// Network-first for navigations/pages, falling back to cache when offline.
	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);
			try {
				const response = await fetch(request);
				if (response.ok) cache.put(request, response.clone());
				return response;
			} catch {
				const cached = await cache.match(request);
				if (cached) return cached;
				// Last resort: the prerendered app shell.
				const shell = await cache.match(`${sw.location.origin}/`);
				if (shell) return shell;
				throw new Error('offline and not cached');
			}
		})()
	);
});
