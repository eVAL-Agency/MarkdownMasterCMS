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
 * @async
 * @param {string} layout - Filename of layout.
 * @param {TemplateObject} data - Data passed to template.
 * @returns {Promise}
 * @throws {CMSError}
 */
export async function renderLayout(layout, data) {
	system_container.innerHTML = await fetchLayout(layout, data);
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
