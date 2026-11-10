/**
 * Simple service worker for the site.
 *
 * Caches same-origin assets as they are loaded so the site keeps working
 * when the connection drops.  When you deploy new files, bump CACHE_NAME
 * to v2/v3/etc. so the old cache is dropped on the next visit.
 */
const CACHE_NAME = 'cms-request-cache';

/**
 * Database open request for IndexedDB object
 *
 * @type {IDBOpenDBRequest}
 */
const dbRequest = indexedDB.open('markdownmaster', 1);

/**
 * Database object itself
 *
 * @type {IDBDatabase|null}
 */
let db;

/**
 * Configuration for this service worker, contains the parameters as provided by /sw-config.json
 * @type {Object|null}
 */
let config = null;

/**
 * Timestamp of the last configuration update time, populated automatically
 *
 * @type {int}
 */
let lastQueryTime = 0;

dbRequest.onsuccess = () => {
	db = dbRequest.result;
};

dbRequest.onupgradeneeded = event => {
	const d = event.target.result;
	if (!d.objectStoreNames.contains('files')) {
		d.createObjectStore('files', { keyPath: 'path' });
	}

	console.debug('[serviceworker] Upgraded indexedDB successfully');
}

self.loadConfiguration = async () => {
	if (config !== null && lastQueryTime + config.configCheckInterval > Date.now()) {
		// The configuration has been loaded within the last N minutes,
		// that's good enough usually.
		// (N is adjusted by the server environment)
		return;
	}

	const webpath = self.location.pathname.substring(0, self.location.pathname.lastIndexOf('/')) + '/';

	try {
		const response = await fetch(`${webpath}sw-config.json`);

		if (response.ok) {
			lastQueryTime = Date.now();
			const freshConfig = await response.json();

			if (config !== null && freshConfig.configHash !== config.configHash) {
				console.debug('[serviceworker] configHash mismatch, issuing cache update');
				config = freshConfig;

				// Purge the page cache
				await self.deleteCache();
				await self.precacheFiles();

				// tell controlling clients to reload
				self.clients.matchAll().then(clients => {
					console.log(clients);
					clients.forEach(client => {
						client.postMessage({ action: 'sw-configuration-changed' });
					});
				});
			}
			else {
				// Config either didn't exist before or the hash is still the same.
				// Either way is fine.
				config = freshConfig;
			}
		}
	}
	catch (error) {
		// Lookup failed; this is allowed as the application may operate in offline mode.
		if (config === null) {
			// These probably won't work anytime, especially because default doesn't exist,
			// but it will at least populate SOMETHING in the config so the keys are available.
			config = {
				theme: 'default',
				webpath: '/',
				layoutDirectory: '/themes/default/layouts/',
				configHash: '0',
				configCheckInterval: 30,
			}
		}
	}
}

/**
 * Purge page cache, useful for install to wipe the cache to a clean state
 *
 * @returns {Promise<void>}
 */
self.deleteCache = async () => {
	return caches.delete(CACHE_NAME);
}

/**
 * Precache all files necessary for this application to operate, notably if an
 * offline state is encountered.  Includes the Web App Manifest and theme icons
 * so that the PWA install prompt keeps working when the site is re-opened
 * while offline.
 *
 * @returns {Promise<void>}
 */
self.precacheFiles = async () => {
	console.debug(`[serviceworker] Precaching files into cache`);

	const theme = config.theme || 'default';
	const files = config.offlineFiles || [];
	const cache = await caches.open(CACHE_NAME);

	for (const file of files) {
		try {
			const response = await fetch(file);
			if (response.ok) {
				await cache.put(file, response.clone());
			}
		} catch (e) {
			console.debug(`[serviceworker] Failed to pre-cache ${file}`);
		}
	}
}

/**
 * Event that is called when this service worker is first installed
 * and during updates when asset version is changed from the configuration.
 */
self.addEventListener('install', (event) => {
	// Nothing to pre-cache; files get cached on first load.
	console.debug('[serviceworker] Install event firing');

	event.waitUntil(
		(async () => {
			await self.loadConfiguration();
			await self.deleteCache();
			await self.precacheFiles();
			self.skipWaiting();
		})()
	);
});

/**
 * Handle messages sent by the application
 *
 * example:
 * ```
 * CMS.serviceWorker.active.postMessage({action: 'do-a-thing'});
 * ```
 */
self.addEventListener('message', event => {
	const data = event.data ?? null;
	if (!data) return;

	const action = data.action ?? null;

	// Do something with action or data as necessary
	if (action === 'config-check') {
		self.loadConfiguration();
	}
});

/**
 * Event dispatched after installation of the SW has been completed
 *
 * Skips waiting so the new worker takes over immediately, and deletes any
 * stale caches left behind by previous versions.
 */
self.addEventListener('activate', (event) => {
	console.debug('[serviceworker] Activate event firing');

	event.waitUntil(
		(async () => {
			try {
				const cacheNames = await caches.keys();
				for (const name of cacheNames) {
					if (name !== CACHE_NAME) {
						await caches.delete(name);
					}
				}
			}
			catch (err) {
				console.debug('[serviceworker] Failed to clean up stale caches', err);
			}

			self.skipWaiting();
		})()
	);
});

/**
 * Fetch the meta.json file.
 *
 * Acts as a fetchFirst policy, but also uses the response to manage the timestamp expiration for markdown files
 *
 * @param request
 * @returns {Promise<Response>}
 */
async function fetchMeta(request) {
	let response;

	try {
		response = await fetch(request);
		cloned = response.clone();
	}
	catch (error) {
		// Try from cache instead.
		// This query should only fallback to the cache if the server is not available.
		const cached = await caches.match('/meta.json');
		if (cached) {
			return cached;
		}

		// If cache couldn't be located, just return the original network error.
		throw error;
	}

	if (response.ok && db) {
		// Store this response in the offline cache so it's available
		caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned.clone()));

		// Iterate through the returned JSON to find the pages and their
		// last updated timestamp, and store them in IndexedDB as plain
		// key/value pairs (path -> timestamp).
		const data = await cloned.clone().json();

		for (const type of Object.keys(data)) {
			const items = data[type] || [];
			for (const item of items) {
				if (item.path) {
					let readStore = db.transaction('files', 'readonly').objectStore('files');
					readStore.get(item.path).onsuccess = e => {
						if (e.target.result) {
							// Record exists, check if the timestamp was updated.
							if (e.target.result.timestamp !== item.timestamp) {
								caches.open(CACHE_NAME).then((cache) => cache.delete(item.path));
								let writeStore = db.transaction('files', 'readwrite').objectStore('files');
								writeStore.put({path: item.path, timestamp: item.timestamp});
							}
							// No else needed; if the entry exists and timestamp matches, no modification is needed.
						}
						else {
							// Record not logged yet, add new
							let writeStore = db.transaction('files', 'readwrite').objectStore('files');
							writeStore.put({path: item.path, timestamp: item.timestamp});
						}
					};
				}
			}
		}
	}
	return cloned.clone();
};

/**
 * Fetch-first: hit the network, cache the response on success.
 * Falls back to cache only when the network request fails.
 *
 * @param {string} requestUrl
 * @param {Request} request
 * @returns {Promise<Response>}
 */
function fetchFirst(requestUrl, request) {
	return fetch(request).then((response) => {
		if (response.ok) {
			const cloned = response.clone();
			caches.open(CACHE_NAME).then((cache) => cache.put(requestUrl, cloned));
		}
		return response;
	}).catch(() => caches.match(requestUrl));
}

/**
 * Cache-first: serve a cached copy if one exists, otherwise
 * hit the network and store the response.
 *
 * @param {string} requestUrl
 * @param {Request} request
 * @returns {Promise<Response>}
 */
function cacheFirst(requestUrl, request) {
	return caches.match(requestUrl).then((cached) => {
		if (cached) {
			return cached;
		}
		return fetch(request).then((response) => {
			if (response.ok) {
				const cloned = response.clone();
				caches.open(CACHE_NAME).then((cache) => cache.put(requestUrl, cloned));
			}
			return response;
		}).catch(error => {
			// Network error, usually due to network connectivity issues
			if (requestUrl.endsWith('.html')) {
				console.log('[serviceworker] Failed to fetch, attempting offline.html');
				// If the requested file is HTML, try to replace with the offline HTML snippet
				return caches.match(config.layoutDirectory + 'offline.html').then((cached) => {
					if (cached) {
						return cached;
					}
					console.log('[serviceworker] HTML fallback "offline.html" failed!  Please ensure your theme has an offline.html in the layouts and browser cache is NOT DISABLED!');
					throw error;
				});
			}
			else {
				throw error;
			}
		});
	});
}

/**
 * Event dispatched when a request is fetched from a remote server
 */
self.addEventListener('fetch', (event) => {
	const request = event.request;

	// Only intercept same-origin GET requests
	if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
		return;
	}

	const webpath = self.location.pathname.substring(0, self.location.pathname.lastIndexOf('/')) + '/';

	// URL to the requested asset
	// Trim the origin data; we just care about the path.
	// This results in https://yoursite.example.com/theblog/pages/home.html
	// being shortened to /theblog/pages/home.html.
	let requestUrl = request.url.substring(self.location.origin.length);

	if (requestUrl.includes('?v=')) {
		// Trim out basic version strings which are unnecessary for the local cache
		requestUrl = requestUrl.substring(0, requestUrl.indexOf('?v='));
	}
	else if (requestUrl.includes('?t=')) {
		// Same, but for timestamp strings, common with markdown pages
		requestUrl = requestUrl.substring(0, requestUrl.indexOf('?t='));
	}

	// The check URL is just the base URL without any parameters;
	// this is used to refer to the type of cache to use for this request.
	let checkUrl = requestUrl;
	if (checkUrl.includes('?')) {
		checkUrl = checkUrl.substring(0, checkUrl.indexOf('?'));
	}

	if (checkUrl === self.location.pathname) {
		// NEVER CACHE ITSELF!
		// This could lead to a comically annoying situation.
		return;
	}

	if (checkUrl === `${webpath}meta.json`) {
		// Meta contains timestamps and meta for all published Markdown files on the application
		event.respondWith(fetchMeta(request));
		return;
	}

	// List of requests which should check the cache first and only hit the server if not found
	const ext = checkUrl.slice(checkUrl.lastIndexOf('.')).toLowerCase() || '';
	// Important, .js files **MUST NOT USE CACHE FIRST STRATEGY**
	// This is because the JS files are critical to this application, so having fresh versions
	// is more important than a few extra ms for the lookups.
	const defaultCacheExtensions = [
		'.css',
		'.woff2',
		'.png',
		'.webp',
		'.gif',
		'.jpg',
		'.jpeg',
		'.svg',
		'.md',
		'.html'
	];

	const result = defaultCacheExtensions.includes(ext)
		? cacheFirst(requestUrl, request)
		: fetchFirst(requestUrl, request);
	event.respondWith(result);
});

/**
 * Handle push notifications
 */
/*self.addEventListener('push', event => {
	// NOOP
});*/
