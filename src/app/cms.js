/**
 * Primary handler for the CMS
 *
 * @module CMS
 * @license The MIT License (MIT)
 * @copyright (c) 2021 Chris Diana | https://chrisdiana.github.io/cms.js
 * @copyright (c) 2023 - 2024 Charlie Powell
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
 */

import FileCollection from './filecollection';
import {
	renderLayout,
	setSystemLayoutPath,
	setSystemContainer,
	fetchLayout,
	renderError
} from './templater';
import Log from './log';
import CMSError from './cmserror';
import {Config} from './config';

/**
 * Represents a CMS instance
 */
class CMS {

	/**
	 *
	 * @param {Window} view
	 */
	constructor(view) {
		/**
		 * Internally set to true when the CMS is ready
		 * @type {boolean}
		 */
		this.ready = false;

		/**
		 * Name-grouped list of collection objects for all resource types defined
		 * @type {Object.<string, FileCollection>}
		 * */
		this.collections = {};

		/**
		 * Top-level View object, (usually just the Window object)
		 * @type {Window}
		 */
		this.view = view;

		/**
		 * Configuration handler for the CMS
		 * @type {Config}
		 */
		this.config = new Config();

		/**
		 * The URL path of the current page (window.location.pathname)
		 * @type {string}
		 */
		this.currentPagePath = '';

		/**
		 * The renderable object of the currently viewing page or a string with the error
		 * @type {TemplateObject|string|null}
		 */
		this.currentPage = null;

		/**
		 * Dictionary of all extras and their load events
		 * @type {Object.<string, {status: string, onload: Array<Function>, onerror: Array<Function>}>}
		 */
		this.extras = {};

		/**
		 * Reference to the logger for external scripts to tap into easily
		 * @type {Log}
		 */
		this.log = Log;

		// Register the CMS object as a global variable
		// This is useful for plugins which tap into internal functional for features such as
		// loading pages, searching, etc.
		view.CMS = this;

		// Wait until the config is ready before doing anything else.
		document.addEventListener('cms:config', event => {
			this.load(event.detail);
			this.init();
		});
	}

	/**
	 * Load an extra / plugin, optionally with plugin configuration options
	 *
	 * @param {string} extra Plugin name to load
	 * @param {Object|null} [options=null] Configuration options for the plugin
	 * @returns {Promise<string>} Resolves with the plugin name if loaded successfully
	 */
	async loadExtra(extra, options) {
		options = options || null;

		return new Promise((resolve, reject) => {

			if (Object.hasOwn(this.extras, extra)) {
				// This extra plugin is already loaded, check if it's loaded in full or pending
				if (this.extras[extra].status === 'loaded') {
					// immediate resolve if already loaded
					resolve(extra);
				}
				else if(this.extras[extra].status === 'error') {
					// immediate reject if already errored
					reject(extra);
				}
				else {
					// Wait for the plugin to finish loading
					this.extras[extra].onload.push(resolve);
					this.extras[extra].onerror.push(reject);
				}
			}
			else {
				// Not loaded yet
				this.extras[extra] = {
					status: 'pending',
					onload: [resolve],
					onerror: [reject]
				};

				this.log.Debug('CMS.loadExtra', 'Loading extra plugin:', extra);
				if (options) {
					this.config.extras[extra] = options;
				}
				let script = document.createElement('script');
				script.src = this.config.webpath + 'extras/' + extra + '/init.js';
				script.onload = () => {
					this.log.Debug('CMS.loadExtra', 'Plugin successfully loaded:', extra);
					this.extras[extra].status = 'loaded';
					this.extras[extra].onload.forEach(fn => fn(extra));
				};
				script.onerror = () => {
					this.log.Debug('CMS.loadExtra', 'Plugin failed to load:', extra);
					this.extras[extra].status = 'error';
					this.extras[extra].onerror.forEach(fn => fn(extra));
				};
				document.body.appendChild(script);
			}
		});
	}

	/**
	 * Check if the requested extra is loaded
	 *
	 * @param {string} extra
	 * @returns {boolean}
	 */
	isExtraLoaded(extra) {
		if (Object.hasOwn(this.extras, extra)) {
			return this.extras[extra].status === 'loaded';
		}
		else {
			return false;
		}
	}

	/**
	 * Set the options for the CMS and initialize the system
	 *
	 * @param {Object} [options={}] List of config options
	 */
	load(options) {
		options = options || {};

		this.config.load(options);

		if (this.config.debug) {
			Log.EnableDebug();
		}

		// Set up the layout system
		if (this.config.layoutDirectory[0] === '/') {
			setSystemLayoutPath(this.config.layoutDirectory);
		}
		else {
			setSystemLayoutPath(this.config.webpath, this.config.layoutDirectory);
		}
	}

	/**
	 * Init
	 *
	 * Initializes the application based on the configuration. Sets up config object,
	 * hash change event listener for router, and loads the content.
	 */
	init() {
		Log.Debug('CMS.init', 'Initializing MarkdownMaster CMS');

		if (!this.config.elementId) {
			Log.Error('CMS.init', 'Element ID not set in config');
			return;
		}

		// setup container
		this.config.container = document.getElementById(this.config.elementId);
		if (!this.config.container) {
			Log.Error('CMS.init', 'Element ID not found:', this.config.elementId);
			return;
		}

		setSystemContainer(this.config.container);

		this.view.addEventListener('click', (e) => {
			if (e.target && e.target.closest('a')) {
				this.listenerLinkClick(e);
			}
		});

		// setup file collections
		this.initFileCollections().then(() => {
			Log.Debug('CMS.init', 'File collections initialized');

			// AND check for location.history changes (for SEO reasons)
			this.view.addEventListener('popstate', () => {
				// Skip hash-only changes.  The browser will handle these itself.
				if (this.currentPagePath !== window.location.pathname) {
					this.route();
				}
			});
			// start router by manually triggering hash change
			//this.view.dispatchEvent(new HashChangeEvent('hashchange'));

			// Backwards compatibility with 2.0.1 configuration
			if (this.config.onload && typeof (this.config.onload) === 'function') {
				document.addEventListener('cms:load', () => {
					this.config.onload();
				});
			}
			if (this.config.onroute && typeof (this.config.onroute) === 'function') {
				document.addEventListener('cms:route', () => {
					this.config.onroute();
				});
			}

			this.route();
			this.ready = true;
			document.dispatchEvent(new CustomEvent('cms:load', {detail: {cms: this}}));
		});

		// Load any pre-requested extras, (usually assigned from the server)
		Object.keys(this.config.extras).forEach(extra => {
			this.loadExtra(extra);
		});
	}

	/**
	 * Handle processing links clicked, will re-route to the history for applicable links.
	 *
	 * @param {MouseEvent} e Click event from user
	 */
	listenerLinkClick(e) {
		let targetHref = e.target.closest('a').href;

		// Scan if this link was a link to one of the articles,
		// we don't want to intercept non-page links.
		this.config.types.forEach(type => {
			if (
				targetHref.indexOf(window.location.origin + this.config.webpath + type.name + '/') === 0 &&
				targetHref.substring(targetHref.length - 5) === '.html'
			) {
				// Target link is a page within a registered type path
				this.historyPushState(targetHref);
				e.preventDefault();
				return false;
			}

			if (targetHref.indexOf(window.location.origin + this.config.webpath + type.name + '.html') === 0) {
				// Target link is a listing page for a registered type path
				this.historyPushState(targetHref);
				e.preventDefault();
				return false;
			}
		});

		if (targetHref === window.location.origin + this.config.webpath) {
			// Target link is the homepage, this one can be handled too
			this.historyPushState(targetHref);
			e.preventDefault();
			return false;
		}

	}

	/**
	 * Initialize file collections
	 *
	 * @async
	 * @returns {Promise}
	 */
	async initFileCollections() {
		return new Promise((resolve) => {
			let promises = [];

			// setup collections and routes
			this.config.types.forEach((type) => {
				this.collections[type.name] = new FileCollection(type.name, type.layout, this.config);
				promises.push(this.collections[type.name].init());
			});

			Promise.all(promises).then(() => {
				resolve();
			});
		});
	}

	/**
	 * Retrieve the current path URL broken down into individual pieces
	 *
	 * @param {string|null} path Path to parse, or current location by default
	 *
	 * @returns {string[]} The segments of the URL broken down by directory
	 */
	getPathsFromURL(path) {
		path = path ?? window.location.pathname;
		let paths;

		if (path.startsWith(this.config.webpath)) {
			path = path.substring(this.config.webpath.length);
		}

		if (path.startsWith('/')) {
			// Strip leading slash
			path = path.substring(1);
		}

		paths = path.split('/');

		if (paths.length >= 1 && paths[0].endsWith('.html')) {
			// First node (aka type) has HTML extension, just trim that off.
			// This is done because /posts needs to be browseable separately,
			// so we need a way to distinguish between that and the HTML version.
			paths[0] = paths[0].substring(0, paths[0].length - 5);
		}

		return paths;
	}

	/**
	 * REPLACE the window location, ONLY really useful on initial pageload
	 *
	 * Use historyPushState instead for most interactions where the user may click 'back'
	 * @param {string} url URL to replace
	 */
	historyReplaceState(url) {
		window.history.replaceState({}, '', url);
		// Immediately trigger route to switch to the new content.
		this.route();
	}

	/**
	 * PUSH the window location, useful for most interactions where the user may click 'back'
	 *
	 * This is the normal "go to URL" method for the CMS.
	 *
	 * @param {string} url
	 */
	historyPushState(url) {
		window.history.pushState({}, '', url);
		// Immediately trigger route to switch to the new content.
		this.route();
	}

	/**
	 * Primary method handling the loading of pages and content within the CMS
	 */
	route() {
		Log.Debug('CMS.route', 'Running routing');

		// Users expect the viewport to start at the top of the page on navigation events.
		window.scrollTo({ top: 0, behavior: 'smooth' });

		// Unload the current page prior to doing anything
		if (this.currentPage && this.currentPage.onUnload) {
			this.currentPage.onUnload();
		}

		this.currentPagePath = window.location.pathname;

		let paths = this.getPathsFromURL(),
			type = paths[0],
			filename = paths.splice(1).join('/'),
			collection = this.getCollection(type),
			url = new URL(window.location),
			search = url.searchParams.get('s'),
			tag = url.searchParams.get('tag'),
			mode = '',
			file = null,
			renderer = null;

		Log.Debug('CMS.route', 'Paths retrieved from URL:', {type: type, filename: filename, collection: collection});

		if (!type) {
			// Default view
			// route will be re-called immediately upon updating the state
			this.historyReplaceState(this.config.webpath + this.config.defaultView + '.html');
		} else {
			// List and single views
			if (collection && filename) {
				// Single view
				try {
					file = collection.getFileByPermalink([type, filename.trim()].join('/'));
					mode = 'single';
					this.currentPage = file;
					renderer = file.render();
				} catch (e) {
					mode = 'error';
					this.currentPage = 'error';
					renderer = renderError(e);
				}
			} else if (collection) {
				// List view of some sort
				// All new page views start with fresh filters and default sorting
				mode = 'listing';
				collection.resetFilters();
				collection.filterSort();
				this.currentPage = collection;

				if (search) {
					// Check for queries
					renderer = collection.renderSearch(search);
				} else if (tag) {
					// Check for tags
					collection.filterTag(tag);
					renderer = collection.render();
				} else {
					renderer = collection.render();
				}
			} else {
				mode = 'error';
				this.currentPage = 'error';
				renderer = renderError(new CMSError(404, 'Bad request or collection not found'));
			}

			if (renderer) {
				renderer.then(() => {
					if (file && Object.hasOwn(file, 'extras') && typeof file.extras === 'object') {
						// Allow extra plugins to be loaded from the content
						file.extras.forEach(extra => {
							this.loadExtra(extra);
						});
					}

					Log.Debug('CMS.route', 'Page render complete, dispatching user-attachable event cms:route');
					document.dispatchEvent(
						new CustomEvent(
							'cms:route',
							{
								detail: {
									cms: this,
									type, file, mode, search, tag, collection
								}
							}
						)
					);
				}).catch(e => {
					// Try to render the error instead
					renderError(e).then(() => {
						Log.Debug('CMS.route', 'Page render failed, dispatching user-attachable event cms:route');
						mode = 'error';
						document.dispatchEvent(
							new CustomEvent(
								'cms:route',
								{
									detail: {
										cms: this,
										type, file, mode, search, tag, collection
									}
								}
							)
						);
					});
				});
			}
		}
	}

	/**
	 * Get the given collection by name or NULL if it does not exist
	 *
	 * @param {string} name
	 * @returns {FileCollection|null}
	 */
	getCollection(name) {
		return (Object.hasOwn(this.collections, name)) ? this.collections[name] : null;
	}

	/**
	 * Get a clone of the given collection by its name, or NULL if it does not exist
	 *
	 * @param {string} name
	 * @returns {FileCollection|null}
	 */
	getCollectionClone(name) {
		return (Object.hasOwn(this.collections, name)) ? this.collections[name].clone() : null;
	}

	/**
	 * Sort method for file collections.
	 *
	 * @param {string} type - Type of file collection.
	 * @param {function} sort - Sorting function.
	 */
	sort(type, sort) {
		if (this.ready) {
			this.collections[type].filterSort(sort);
			this.collections[type].render();
		} else {
			Log.Error('CMS.sort', 'CMS not ready');
		}
	}

	/**
	 * Search method for file collections.
	 *
	 * @param {string} type - Type of file collection.
	 * @param {string} search - Search query.
	 */
	search(type, search) {
		this.historyPushState(this.config.webpath + type + '.html?s=' + encodeURIComponent(search));
	}

	/**
	 * Pass-thru convenience function for external scripts to utilize the template engine
	 *
	 * @param {string} layout
	 * @param {Object} data
	 * @returns {Promise<string>}
	 */
	fetchLayout(layout, data) {
		return fetchLayout(layout, data);
	}

	/**
	 * Renders a layout with the set data
	 *
	 * @param {string} layout Base filename of layout to render
	 * @param {TemplateObject} data Data passed to template.
	 * @returns {Promise} Returns rendered HTML on success or the error message on error
	 */
	renderLayout(layout, data) {
		return renderLayout(layout, data);
	}
}

export default CMS;
