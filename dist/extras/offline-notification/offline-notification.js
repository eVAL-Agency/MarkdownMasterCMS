/**
 * Extra - Offline Notification
 *
 * Renders a small notification bar at the very top of <body> when the browser
 * reports no network connection. It lets users know they are viewing a cached,
 * offline copy of the site and that some features may be unavailable until a
 * connection is restored.
 *
 * This complements the service worker's offline cache: the service worker
 * serves previously fetched content while the connection is down, and this
 * notification keeps users informed of the offline state.
 *
 * **Initialization**
 *
 * To load this plugin, add it to the `extras` block of your
 * [config.php](https://markdownmaster.com/docs/site-configuration.html) or
 * theme [settings.php](https://markdownmaster.com/docs/theme-development.html):
 *
 * ```php
 * 'extras' => [
 *     // ...
 *
 *     'offline-notification' => [],
 *
 *     // ...
 * ],
 * ```
 *
 * @module Extras/OfflineNotification
 * @license The MIT License (MIT)
 * @copyright (c) 2026 eVAL Agency
 * @author Charlie Powell
 * @see https://markdownmaster.com/docs/extras/offline-notification.html
 * @since 6.0.0
 */

/**
 * The notification element currently in the document body, or null.
 *
 * @type {HTMLElement|null}
 */
let notificationElement = null;

/**
 * Reference to the CMS instance.
 *
 * `window.CMS` is set when the CMS core boots (see `src/app/main.js`).
 * The guard below also covers the edge case where this script runs before
 * the core is ready.
 *
 * @type {Object|null}
 */
const cms = window.CMS;

/**
 * Used to track if a connection was lost and subsequently reconnected.
 *
 * @type {boolean}
 */
let wasOffline = false;

/**
 * Time the script started so we can ignore sub-2-second flickers during page load/reload.
 * @type {DOMHighResTimeStamp}
 */
const PAGE_LOAD_TIME = performance.now();

/**
 * Safely fetch a single extra option.
 *
 * @param {string} name  Plugin name
 * @param {string} key   Option key
 * @param {*} defaultValue
 * @returns {*}
 */
function extraOption(name, key, defaultValue) {
	if (!cms || !cms.config) {
		return defaultValue;
	}
	return cms.config.extra(name, key, defaultValue);
}

/**
 * Options resolved for this plugin.
 *
 * @type {Object}
 */
const options = {
	// Auto-load the bundled default stylesheet.
	styles: extraOption('offline-notification', 'styles', true),

	// Body message explaining the offline state.
	message: extraOption('offline-notification', 'message',
		'Connection to the server was lost. You are viewing an offline ' +
		'version of this site and some features may be unavailable until you ' +
		'reconnect.'
	),

	// Show the leading warning glyph.
	showIcon: extraOption('offline-notification', 'showIcon', true),

	// Auto reload on reconnection
	autoReload: extraOption('offline-notification', 'autoReload', true),
};

/**
 * Adds the plugin's default stylesheet to the document head if enabled and
 * not already present.
 *
 * @function
 */
function loadStyles() {
	// Nothing to do if the core is not (yet) available.
	if (!cms || !cms.config) {
		return;
	}

	// Skip if the theme (or a user) has already loaded a stylesheet for this
	// plugin, so we don't double-load it.
	if (document.querySelector('link[href*="offline-notification.css"]')) {
		return;
	}

	let style = document.createElement('link');
	style.rel = 'stylesheet';
	style.href = cms.config.webpath + 'extras/offline-notification/offline-notification.css';
	document.head.appendChild(style);
}

/**
 * Builds and inserts the notification element as the first child of <body>.
 *
 * @function
 */
function showNotification() {
	// A single notification element is sufficient; skip if already present.
	if (notificationElement) {
		return;
	}

	let body = document.body;
	if (!body) {
		// No body yet (e.g. extremely early load); retry shortly.
		setTimeout(showNotification, 16);
		return;
	}

	let notification = document.createElement('div');
	notification.className = 'offline-notification';
	notification.setAttribute('role', 'alert');
	notification.setAttribute('aria-live', 'assertive');

	if (options.showIcon) {
		let icon = document.createElement('span');
		icon.className = 'offline-notification__icon';
		icon.setAttribute('aria-hidden', 'true');
		icon.textContent = '\u26a0';
		notification.appendChild(icon);
	}

	let message = document.createElement('p');
	message.className = 'offline-notification__message';
	message.textContent = options.message;
	notification.appendChild(message);

	body.prepend(notification);
	notificationElement = notification;
}

/**
 * Removes the notification element from the document body.
 *
 * @function
 */
function hideNotification() {
	if (!notificationElement) {
		return;
	}

	notificationElement.remove();
	notificationElement = null;
}

/**
 * Syncs the notification visibility with the current network state.
 *
 * @function
 */
function updateNotification() {
	if (window.navigator.onLine) {
		hideNotification();
		if (options.autoReload && wasOffline) {
			window.location.reload();
		}
	} else {
		showNotification();
		if (performance.now() - PAGE_LOAD_TIME > 5000) {
			// Only mark that it was offline if it occurred after the initial page load.
			wasOffline = true;
		}
	}
}

/**
 * Bootstrap: register styles, react to connectivity changes, and sync with the
 * browser's current state.
 *
 * @function
 */
{
	if (options.styles) {
		loadStyles();
	}

	window.addEventListener('online', updateNotification);
	window.addEventListener('offline', updateNotification);

	// Reflect the state at the moment the plugin loads.
	updateNotification();
}
