/**
 * Template engine for CMS
 *
 * @module CMS
 * @license The MIT License (MIT)
 * @copyright (c) 2021 Chris Diana | https://chrisdiana.github.io/cms.js
 * @copyright (c) 2023 - 2024 Charlie Powell
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
 */

import {pathJoin} from './utils';
import CMSError from './cmserror';
import Log from './log';

let layout_path = '',
	system_container = null;

/**
 * Time (in ms) for the new content to fade in after content is swapped.
 * @type {number}
 */
const FADE_IN_MS = 100;

/**
 * Whether the current user has requested reduced motion.
 *
 * @returns {boolean}
 */
function prefersReducedMotion() {
	return (
		typeof window !== 'undefined'
			&& typeof window.matchMedia === 'function'
			&& window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}

/**
 * Promise that resolves after at least the given number of milliseconds
 * has elapsed.
 *
 * @param {number} ms
 * @returns {Promise}
 */
function minimumDelay(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

/**
 * Load template from URL.
 * @function
 * @async
 * @param {string} url - URL of template to load.
 * @param {object} data - Data to load into template.
 * @returns {Promise<string>}
 * @throws {CMSError}
 */
export async function loadTemplate(url, data) {
	let response;
	try {
		response = await fetch(url);
	}
	catch (error) {
		throw new CMSError(500, error.message);
	}

	if (!response.ok) {
		throw new CMSError(response.status, response.statusText);
	}

	const tmpl = await response.text();
	let fn = new Function(
		'data',
		'var output=' +
		JSON.stringify(tmpl)
			.replace(/<%=(.+?)%>/g, '"+($1)+"')
			.replace(/<%(.+?)%>/g, '";$1\noutput+="') +
		';return output;'
	);

	try {
		return fn.call(this, data);
	} catch (e) {
		throw new CMSError(500, e.message);
	}
}

/**
 * Fetch the layout and return in the resolve
 *
 * @async
 * @param {string} layout - Filename of layout.
 * @param {object} data - Data passed to template.
 * @returns {Promise<string>}
 * @throws {CMSError}
 */
export async function fetchLayout(layout, data) {

	let version = '1';
	if (typeof data.config === 'object' && typeof data.config.version === 'string') {
		version = data.config.version;
	}

	let url = pathJoin(layout_path, `${layout}.html?v=${version}`);
	Log.Debug('fetchLayout', url);
	const html = await loadTemplate(url, data);
	Log.Debug('fetchLayout', 'Fetched templated layout', url);
	return html;
}

/**
 * Renders the layout into the main container.
 *
 * When the container already holds content (typically the static,
 * server-side rendered version) the existing content is dimmed while
 * the new content is being fetched and then swapped in, after which the
 * new content fades back to full opacity. This avoids the abrupt flash
 * that a same-frame content replacement would otherwise produce on
 * first page load and on every in-app navigation.
 *
 * The transition is skipped when the container is empty or when the
 * user has requested reduced motion.
 *
 * @async
 * @param {string} layout - Filename of layout.
 * @param {TemplateObject} data - Data passed to template.
 * @returns {Promise}
 * @throws {CMSError}
 */
export async function renderLayout(layout, data) {
	if (!system_container) {
		return;
	}

	// textContent is always a string for real DOM elements; the
	// `|| ''` keeps the check safe for non-element stand-ins used in tests.
	const hasExistingContent = (system_container.textContent || '').trim() !== '';
	const allowTransition = hasExistingContent && !prefersReducedMotion();

	let html;
	try {
		if (allowTransition) {
			// Wait for the layout fetch and the fade-out transition to
			// complete before the content swap, so the swap happens in a
			// stable visual state.
			const [layoutHtml] = await Promise.all([
				fetchLayout(layout, data),
				minimumDelay(FADE_IN_MS)
			]);
			html = layoutHtml;
		}
		else {
			html = await fetchLayout(layout, data);
		}

		system_container.innerHTML = html;

		if ('classList' in system_container) {
			system_container.classList.remove('cms-preload');

			if (allowTransition) {
				// The swap is complete; reveal the new content.
				system_container.classList.remove('cms-fade-out');
				system_container.classList.add('cms-fade-in');
				if (data.config.loadingContainer) {
					data.config.loadingContainer.classList.remove('show');
				}

				setTimeout(() => {
					system_container.classList.remove('cms-fade-in');
				}, FADE_IN_MS + 50);
			}
		}
	}
	catch (e) {
		// Restore the existing content's visibility if the swap failed;
		// the caller (e.g. CMS.route) typically renders an error layout
		// afterwards, which handles its own transition.
		if (allowTransition) {
			system_container.classList.remove('cms-fade-out');
		}
		throw e;
	}
}

/**
 * Render an error to the browser
 *
 * @param {CMSError} error
 * @returns {Promise}
 */
export async function renderError(error) {
	return renderLayout('error' + error.code, {});
}

/**
 * Set the system layout directory (generally only called from the CMS)
 *
 * @param {string} args
 */
export function setSystemLayoutPath(...args) {
	layout_path = pathJoin(...args);
}

/**
 * Set the system layout directory (generally only called from the CMS)
 *
 * @param {HTMLElement} container
 */
export function setSystemContainer(container) {
	system_container = container;
}
