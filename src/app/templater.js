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
	return new Promise((resolve, reject) => {
		fetch(url)
			.then(response => {
				if (!response.ok) {
					reject(new CMSError(response.status, response.statusText));
				}
				return response.text();
			})
			.then(tmpl => {
				let fn = new Function(
						'data',
						'var output=' +
						JSON.stringify(tmpl)
							.replace(/<%=(.+?)%>/g, '"+($1)+"')
							.replace(/<%(.+?)%>/g, '";$1\noutput+="') +
						';return output;'
					),
					html = '';

				try {
					html = fn.call(this, data); //renderer(data);
					resolve(html);
				} catch (e) {
					reject(new CMSError(500, e));
				}
			});
	});
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
	return new Promise((resolve, reject) => {
		let url = pathJoin(layout_path, layout + '.html');
		Log.Debug('fetchLayout', url);
		loadTemplate(url, data)
			.then(html => {
				Log.Debug('fetchLayout', 'Fetched templated layout', url);
				resolve(html);
			})
			.catch(e => {
				Log.Error('fetchLayout', 'Error while rendered layout', url, e.message);
				reject(e);
			});
	});
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
	return new Promise((resolve, reject) => {
		fetchLayout(layout, data).then(html => {
			system_container.innerHTML = html;
			resolve();
		}).catch(e => {
			reject(e);
		});
	});
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
