/**
 * Test suite for the offline-notification extra
 *
 * @module CMS
 * @license The MIT License (MIT)
 * @copyright (c) 2026 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
 */

import { describe, expect, it, jest } from '@jest/globals';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';

const pluginSource = readFileSync(
	'dist/extras/offline-notification/offline-notification.js',
	'utf8'
);


/**
 * Build a mock CMS config that mirrors the real `Config.extra()` lookup.
 *
 * @param {Object} [options.extras] Map of plugin name -> options object
 * @returns {Object} The mock config
 */
function makeConfig(extras = {}) {
	return {
		webpath: '/',
		debug: false,
		extra(name, key, defaultValue) {
			const plugin = extras[name];
			if (plugin && Object.hasOwn(plugin, key)) {
				return plugin[key];
			}
			return defaultValue;
		},
	};
}


/**
 * Set up a JSDOM window with a mocked CMS and (optionally) an offline navigator.
 *
 * @param {Object} [options]
 * @param {Object} [options.extras] Plugin options passed to the mock config.
 * @param {boolean} [options.online=true] Whether the simulated browser is online.
 * @returns {Object}
 */
function setup(options = {}) {
	const online = options.online !== false;

	const dom = new JSDOM('<html><head></head><body></body></html>');
	const win = dom.window;
	const doc = win.document;

	let cms = {
		log: {
			Warn: jest.fn(),
			Error: jest.fn(),
			Debug: jest.fn(),
		},
		config: makeConfig(options.extras),
	};

	win.CMS = cms;

	if (!online) {
		// JSDOM's navigator.onLine is a getter that cannot be changed by direct
		// assignment, so shadow it with our own writable property to simulate
		// an offline state.
		Object.defineProperty(win.navigator, 'onLine', {
			value: false,
			writable: true,
			configurable: true,
		});
	}

	// The plugin source references the global `document` and `window`
	// directly; inject the JSDOM equivalents as function parameters.
	const fn = new Function('document', 'window', pluginSource);
	fn(doc, win);

	return {
		win,
		doc,
		cms,
	};
}


/**
 * Dispatch a browser-style online/offline event on the window.
 *
 * In a real browser the online/offline events always accompany a change to
 * navigator.onLine, so simulate both here for a faithful transition.
 *
 * @param {boolean} online True for 'online', false for 'offline'
 */
function dispatchConnectivity(win, online) {
	Object.defineProperty(win.navigator, 'onLine', {
		value: online,
		writable: true,
		configurable: true,
	});
	win.dispatchEvent(new win.Event(online ? 'online' : 'offline'));
}


describe('offline-notification', () => {
	it('registers the default stylesheet in the head by default', () => {
		let ctx = setup({});

		let link = ctx.doc.querySelector('link[href*="offline-notification.css"]');
		expect(link).not.toBeNull();
		expect(link.href).toBe('/extras/offline-notification/offline-notification.css');
		expect(link.rel).toBe('stylesheet');
	});

	it('does not register the stylesheet when styles is false', () => {
		let ctx = setup({ extras: { 'offline-notification': { styles: false } } });

		let link = ctx.doc.querySelector('link[href*="offline-notification.css"]');
		expect(link).toBeNull();
	});

	it('does not render the notification when the browser is online', () => {
		let ctx = setup({});

		let bar = ctx.doc.querySelector('.offline-notification');
		expect(bar).toBeNull();
	});

	it('inserts the notification as the first child of the body when offline', () => {
		let ctx = setup({ online: false });

		let bar = ctx.doc.querySelector('.offline-notification');
		expect(bar).not.toBeNull();
		expect(ctx.doc.body.firstElementChild).toBe(bar);
	});

	it('uses the default message when offline', () => {
		let ctx = setup({ online: false });
		let bar = ctx.doc.querySelector('.offline-notification');

		let message = bar.querySelector('.offline-notification__message');

		expect(message.textContent).toContain('offline version');
	});

	it('uses the warning icon by default', () => {
		let ctx = setup({ online: false });
		let bar = ctx.doc.querySelector('.offline-notification');

		let icon = bar.querySelector('.offline-notification__icon');
		expect(icon).not.toBeNull();
		expect(icon.textContent).toBe('\u26a0');
	});

	it('omits the icon when showIcon is false', () => {
		let ctx = setup({ online: false, extras: { 'offline-notification': { showIcon: false } } });
		let bar = ctx.doc.querySelector('.offline-notification');

		let icon = bar.querySelector('.offline-notification__icon');
		expect(icon).toBeNull();
	});

	it('honors custom message options', () => {
		let ctx = setup({
			online: false,
			extras: {
				'offline-notification': {
					message: 'Custom message text',
				},
			},
		});
		let bar = ctx.doc.querySelector('.offline-notification');

		let message = bar.querySelector('.offline-notification__message');

		expect(message.textContent).toBe('Custom message text');
	});

	it('removes the notification when an online event fires', () => {
		let ctx = setup({ online: false });

		let bar = ctx.doc.querySelector('.offline-notification');
		expect(bar).not.toBeNull();

		dispatchConnectivity(ctx.win, true);
		expect(ctx.doc.querySelector('.offline-notification')).toBeNull();
	});

	it('adds the notification when an offline event fires from an online state', () => {
		let ctx = setup({}); // starts online

		let bar = ctx.doc.querySelector('.offline-notification');
		expect(bar).toBeNull();

		dispatchConnectivity(ctx.win, false);
		let bar2 = ctx.doc.querySelector('.offline-notification');
		expect(bar2).not.toBeNull();
	});

	it('does not create a second notification on repeated offline events', () => {
		let ctx = setup({ online: false });

		// Simulate multiple offline events firing back-to-back.
		dispatchConnectivity(ctx.win, false);
		dispatchConnectivity(ctx.win, false);

		let bars = ctx.doc.querySelectorAll('.offline-notification');
		expect(bars).toHaveLength(1);
	});

	it('sets accessible markup on the notification', () => {
		let ctx = setup({ online: false });
		let bar = ctx.doc.querySelector('.offline-notification');

		expect(bar.getAttribute('role')).toBe('alert');
		expect(bar.getAttribute('aria-live')).toBe('assertive');
	});

	it('persists the notification across subsequent online->offline transitions', () => {
		let ctx = setup({}); // online

		// go offline
		dispatchConnectivity(ctx.win, false);
		let first = ctx.doc.querySelector('.offline-notification');
		expect(first).not.toBeNull();

		// go back online
		dispatchConnectivity(ctx.win, true);
		expect(ctx.doc.querySelector('.offline-notification')).toBeNull();

		// go offline again
		dispatchConnectivity(ctx.win, false);
		let second = ctx.doc.querySelector('.offline-notification');
		expect(second).not.toBeNull();
	});
});
