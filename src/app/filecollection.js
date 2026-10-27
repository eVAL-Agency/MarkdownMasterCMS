/**
 * Handler for collection of files for CMS
 *
 * @module CMS
 * @license The MIT License (MIT)
 * @copyright (c) 2021 Chris Diana | https://chrisdiana.github.io/cms.js
 * @copyright (c) 2023 - 2024 Charlie Powell
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
 */

import {renderLayout} from './templater';
import {pathJoin} from './utils';
import File from './file';
import Log from './log';
import CMSError from './cmserror';
import TemplateObject from './templateobject';

let _queuedMetas = null;
let _queuedMetasPromises = [];

let _queuedGetMetas = async (path) => {
	return new Promise((resolve, reject) => {
		if (_queuedMetas === null) {
			// Not loaded yet
			_queuedMetas = true;
			_queuedMetasPromises.push([resolve, reject]);
			fetch(path)
				.then(resp => {
					if (resp.status !== 200) {
						_queuedMetas = false;
						_queuedMetasPromises.forEach(r => {
							r[1]('Server did not return a 200 successful');
						});
					}
					else {
						return resp.json();
					}
				})
				.then(data => {
					_queuedMetas = data;
					// Resolve all the queued entries now
					Log.Debug('FileCollection._queuedGetMetas', 'Meta.json loaded from server, resolving all promises now');
					_queuedMetasPromises.forEach(r => {
						r[0](_queuedMetas);
					});
				});
		} else if (_queuedMetas === true) {
			// Pending, add to queue
			_queuedMetasPromises.push([resolve, reject]);
		} else if (_queuedMetas === false) {
			// Failed
			reject('Previous lookup did not succeed, not retrying');
		} else {
			// Already received, just return the data.
			resolve(_queuedMetas);
		}
	});
};

/**
 * Represents a file collection.
 * @constructor
 * @param {string} type   The type of file collection (i.e. posts, pages).
 * @param {Object} layout The layouts of the file collection type.
 * @param {string} layout.list   Listing template
 * @param {string} layout.single Single page template
 * @param {string} layout.sort   Default sort for listing view
 * @param {string} layout.title  Title for listing view
 * @param {Config} config Configuration from the CMS
 */
class FileCollection extends TemplateObject {

	constructor(type, layout, config) {
		super(config);

		/**
		 * Type of files, as defined by the configuration.
		 *
		 * Usually something like "pages" or "posts"
		 *
		 * @type {string}
		 */
		this.type = type;

		/**
		 * Layout to use for rendering this collection
		 *
		 * @type {string}
		 */
		this.layout = layout;

		/**
		 * All raw files available in this collection
		 *
		 * @type {File[]}
		 */
		this.allFiles = [];

		/**
		 * Filtered list of files available in this collection
		 *
		 * This gets updated as filters are applied, but
		 * **DOES NOT** get updated with pagination!
		 *
		 * @type {File[]}
		 */
		this.filteredFiles = [];

		/**
		 * List of directories to scan when server-side is not available
		 * @type {string[]}
		 */
		this.directories = [];

		/**
		 * Filtered and sorted list of files matched
		 *
		 * Populates the dynamic property based on the type of file
		 *
		 * @type {File[]}
		 */
		this[type] = this.allFiles;

		/**
		 * @type {null|number}
		 */
		this.currentPage = null;

		/**
		 * @type {null|number}
		 */
		this.totalPages = null;

		/**
		 * @type {null|number}
		 */
		this.resultsPerPage = null;

		/**
		 * @type {null|number}
		 */
		this.totalResults = null;

		/**
		 * Cached filter mode, not used by filtering but available for diagnostic checks
		 * @type {string}
		 * @private
		 */
		this._filterMode = 'AND';

		/**
		 * Cached filters applied to this collection
		 *
		 * @type {{}}
		 * @private
		 */
		this._filters = {};
	}

	/**
	 * Initialize file collection
	 *
	 * @async
	 * @returns {Promise}
	 */
	async init() {
		return new Promise((resolve) => {
			this.getFilesByServer()
				.then(() => {
					resolve();
				})
				.catch((e) => {
					// Try the slow method of scanning for directory listings
					Log.Debug('FileCollection.init/' + this.type, 'Failed to load files from server, falling back to directory scan', e);
					this.getFiles().then(() => {
						this.loadFiles().then(() => {
							resolve();
						});
					});
				});
		});
	}

	/**
	 * Clone the file collection
	 *
	 * @returns {FileCollection}
	 */
	clone() {
		let clone = new FileCollection(this.type, this.layout, this.config);
		clone.currentPage = this.currentPage;
		clone.allFiles = this.allFiles;
		clone.resultsPerPage = this.resultsPerPage;
		clone.totalPages = this.totalPages;
		clone.totalResults = this.totalResults;
		clone[this.type] = this[this.type];
		return clone;
	}

	/**
	 * Get file list URL
	 *
	 * @returns {string} URL of file list
	 */
	getFileListUrl() {
		return pathJoin(this.config.webpath, this.type);
	}

	/**
	 * Get the search parameters for this FileCollection based on the current filters and pagination.
	 *
	 * @returns {URLSearchParams}
	 */
	getSearchParams() {
		let params = new URLSearchParams();

		if (this.currentPage !== null && this.currentPage > 1) {
			params.set('page', this.currentPage.toString());
		}
		/*if (this.resultsPerPage !== null) {
			params.set('perpage', this.resultsPerPage.toString());
		}*/

		if (this._filters['tags'] || this._filters['&tags']) {
			let sep = ','; // Default for 'AND' tags (comma-separated) from '&tags'
			if (this._filters['tags']) {
				// If 'tags' are used, an 'OR' separator is used instead.
				sep = '|';
			}
			let tags = this._filters['tags'] || this._filters['&tags'];

			if (!Array.isArray(tags)) {
				tags = [ tags ];
			}

			let tagsFlat = tags.map(t => t.toLowerCase().replaceAll(' ', '_'));
			tagsFlat = tagsFlat.filter(t => t !== '');
			params.set('tag', tagsFlat.join(sep));
		}

		return params;
	}

	/**
	 * Get the URL for the previous page (when pagination is enabled)
	 *
	 * @returns {string}
	 */
	getPreviousPageUrl() {
		let url = this.getFileListUrl() + '.html',
			u = this.getSearchParams(),
			params;

		if (this.currentPage !== null && this.currentPage > 2) {
			u.set('page', (this.currentPage - 1).toString());
		}
		else {
			u.delete('page');
		}

		params = u.toString();

		return params === '' ? url : url + '?' + params;
	}

	/**
	 * Get the URL for the next page (when pagination is enabled)
	 *
	 * @returns {string}
	 */
	getNextPageUrl() {
		let url = this.getFileListUrl() + '.html',
			u = this.getSearchParams(),
			params;

		if (this.currentPage !== null && this.currentPage < this.totalPages) {
			u.set('page', (this.currentPage + 1).toString());
		}
		else if (this.currentPage !== null && this.currentPage >= this.totalPages) {
			// More pages than supported, just return the same page.
			u.set('page', (this.currentPage).toString());
		}
		else {
			u.delete('page');
		}

		params = u.toString();

		return params === '' ? url : url + '?' + params;
	}

	/**
	 * Get the URL for the requested page (when pagination is enabled)
	 *
	 * @param {number} page
	 * @returns {string}
	 */
	getPageUrl(page) {
		let url = this.getFileListUrl() + '.html',
			u = this.getSearchParams(),
			params;

		if (page >= 1 && page <= this.totalPages) {
			u.set('page', (page).toString());
		}
		else {
			u.delete('page');
		}

		params = u.toString();

		return params === '' ? url : url + '?' + u.toString();
	}

	/**
	 * Get the URL for the requested tag
	 *
	 * If the tag is already present, it will remove it.
	 * If the tag is not present, it will add it.
	 * If other tags are present, an AND is used to combine them
	 *
	 * @param {string} tag
	 * @returns {string}
	 */
	getPageTagUrl(tag) {
		let url = this.getFileListUrl() + '.html',
			u = new URLSearchParams(),
			tags = this._filters['tags'] || this._filters['&tags'] || [],
			found = false,
			newTags = [];

		tag = tag.trim().toLowerCase().replaceAll(' ', '_');

		if (!Array.isArray(tags)) {
			tags = [ tags ];
		}

		tags.forEach(t => {
			t = t.toLowerCase().replaceAll(' ', '_');
			if (t === tag) {
				found = true;
			}
			else {
				newTags.push(t);
			}
		});
		if (!found) {
			newTags.push(tag);
		}

		if (newTags.length === 0) {
			return url;
		}
		else {
			u.set('tag', newTags.join(','));
			return url + '?' + u.toString();
		}
	}

	/**
	 * Get list of file elements from either the returned listing page scan (or JSON data for GITHUB)
	 *
	 * @param {string} data - HTML code from directory listing
	 * @returns {string[]} URLs of files and directories located
	 */
	getFileElements(data) {
		let fileElements = [];

		// convert the directory listing to a DOM element
		let listElement = document.createElement('div');
		listElement.innerHTML = data;
		// get the valid links in the directory listing
		listElement.querySelectorAll('a').forEach(el => {
			let href = el.getAttribute('href');
			if (href !== '../' && (href.endsWith(this.config.extension) || href.endsWith('/'))) {
				fileElements.push(href);
			}
		});

		return fileElements;
	}

	/**
	 * Get files from file listing and set to file collection.
	 * @method
	 * @async
	 * @returns {Promise}
	 */
	async getFiles() {
		return new Promise((resolve) => {
			// Scan the top-level directory first
			this.scanDirectory(this.getFileListUrl())
				.then(directories => {
					// THEN scan any child directory discovered to allow for 1-level depth paths
					let promises = [];
					for (let dir of directories) {
						promises.push(this.scanDirectory(dir));
					}
					if (promises.length > 0) {
						Promise.all(promises)
							.then(() => {
								resolve();
							});
					} else {
						// No additional directories found, resolve immediately.
						resolve();
					}
				});
		});
	}

	/**
	 * Get files from file listing and set to file collection.
	 * @method
	 * @async
	 * @returns {Promise}
	 */
	async getFilesByServer() {
		return new Promise((resolve, reject) => {
			Log.Debug('FileCollection.getFilesByServer/' + this.type, 'Retrieving files metadata from server script meta.json');

			// Try the server-side script first to pull files, this will save on calls
			_queuedGetMetas(pathJoin(this.config.webpath, 'meta.json'))
				.then(data => {
					if (typeof(data[this.type]) === 'undefined') {
						// Not set
						reject('No collection matched');
						return;
					}

					data[this.type].forEach(file => {
						Log.Debug('FileCollection.getFilesByServer/' + this.type, 'Found valid file, adding to collection', {file});
						let f = new File(file.path, this.type, this.layout.single, this.config);
						// Set the timestamp from the server, (so clients will request an up-to-date version when applicable)
						f.timestamp = file.timestamp;
						try {
							f.parseFilename();
							f.parsePermalink();
							f.parseFrontMatterData(file.meta);
							f.parseDate();
							this.allFiles.push(f);
						} catch (e) {
							Log.Error('Failed to parse file', {file, e});
						}
					});
					resolve();
				})
				.catch(e => {
					reject(e);
				});
		});
	}

	/**
	 * Perform the underlying directory lookup
	 * @method
	 * @async
	 * @param {string} directory   Directory URL to scan
	 * @returns {Promise<string[]>} Array of subdirectories found
	 */
	async scanDirectory(directory) {
		Log.Debug('FileCollection.scanDirectory/' + this.type, 'Scanning directory', directory);

		return new Promise((resolve) => {
			fetch(directory)
				.then(response => {
					return response.text();
				})
				.then(contents => {
					let directories = [];

					this.getFileElements(contents).forEach(file => {
						let fileUrl = file.startsWith('/') ? file : pathJoin(directory, file);

						if (
							// Skip top-level path
							fileUrl !== this.config.webpath &&
							// Must be a file on this site
							fileUrl.indexOf(this.config.webpath) === 0 &&
							// Must end with the extension configured
							fileUrl.endsWith(this.config.extension)
						) {
							// Regular markdown file
							Log.Debug('FileCollection.scanDirectory/' + this.type, 'Found valid file, adding to collection', {directory, file, fileUrl});
							this.allFiles.push(new File(fileUrl, this.type, this.layout.single, this.config));
						} else if (
							// skip checking '?...' sort option links
							fileUrl[fileUrl.length - 1] === '/' &&
							// skip top-level path
							fileUrl !== this.config.webpath &&
							// skip parent directory links, we're going DOWN, not UP
							fileUrl.indexOf('/../') === -1
						) {
							// in SERVER mode, support recursing ONE directory deep.
							// Allow this for any directory listing NOT absolutely resolved (they will just point back to the parent directory)
							directories.push(fileUrl);
						} else {
							Log.Debug('FileCollection.scanDirectory/' + this.type, 'Skipping invalid link', {directory, file, fileUrl});
						}
					});

					Log.Debug('FileCollection.scanDirectory/' + this.type, 'Scanning of ' + directory + ' complete');
					resolve(directories);
				});
		});
	}

	/**
	 * Load files and get file content.
	 * @method
	 * @async
	 * @returns {Promise}
	 */
	async loadFiles() {
		return new Promise((resolve) => {
			let promises = [];

			this.allFiles.forEach((file) => {
				promises.push(file.loadContent());
			});

			// Once all files have been loaded, notify the parent
			Promise.allSettled(promises).then(() => {
				resolve();
			});
		});
	}

	/**
	 * Reset filters and sorting
	 */
	resetFilters() {
		this[this.type] = this.allFiles.filter((file) => {
			file.__match = 0;
			return !file.draft;
		});
		this.filteredFiles = this[this.type];

		this._filters = {};
		this._filterMode = 'AND';
	}

	/**
	 * Sort results by a given parameter
	 *
	 * If a function is requested, that is used to sort the results.
	 * If a string is requested, only specific keywords are supported.  Use -r to inverse results.
	 * If NULL is requested, the default sort for this collection type is used.
	 *
	 * Common sort parameters:
	 *
	 * * title - Sort by page title
	 * * random - Sort randomly
	 * * recent - Sort by most recent
	 *
	 * @param {function|string|null} [param=null] A function, string, or empty value to sort by
	 */
	filterSort(param) {
		// Provide some useful defaults and shortcut values
		if (typeof (param) === 'undefined' || param === null) {
			param = this.layout.sort || 'title';
		}
		else if (param === 'random') {
			// Allow convenience method for randomizing results
			param = () => {
				return 0.5 - Math.random();
			};
		}
		else if (param === 'recent') {
			param = 'datetime-r';
		}


		if (typeof (param) === 'function') {
			// Allow user to define their own function for sorting
			this[this.type].sort(param);
		}
		else {
			let params = [];

			// Allow multiple comma-separated parameters to be requested
			if (param.indexOf(',') !== -1) {
				params = param.split(',').map(p => p.trim());
			} else {
				params = [ param ];
			}

			// Detect if the reverse order is requested ("-r" suffix) and inverse the directionality if so
			for (let i = 0; i < params.length; i++) {
				if (params[i].match(/-r$/)) {
					params[i] = {
						direction: -1,
						key: params[i].substring(0, params[i].length - 2)
					};
				} else {
					params[i] = {
						direction: 1,
						key: params[i]
					};
				}
			}

			this[this.type].sort((a, b) => {
				// Loop through each key requested (in order) and check if one of them differ.
				for(let i = 0; i < params.length; i++) {
					if ((a[params[i].key] || null) > (b[params[i].key] || null)) {
						// A > B, this is 1 in normal and -1 in reversed
						return params[i].direction;
					}
					if ((a[params[i].key] || null) < (b[params[i].key] || null)) {
						// A < B, this is -1 (1 * -1) in normal and 1 (-1 * -1) in reversed
						return params[i].direction * -1;
					}
				}

				// All requested keys are the same
				return 0;
			});
		}
	}

	/**
	 * Search file collection by attribute.
	 *
	 * @param {string} search - Search query.
	 * @returns {File[]} Set of filtered files
	 */
	async filterSearch(search) {
		return new Promise(resolve => {
			Log.Debug('FileCollection.filterSearch/' + this.type, 'Performing text search for:', search);
			let url;

			try {
				url = new URL(window.location.origin + pathJoin(this.config.webpath, 'search.json'));
				url.searchParams.append('q', search);
				url.searchParams.append('t', this.type);
			}
			catch (e) {
				Log.Debug('FileCollection.filterSearch/' + this.type, 'Using local-only fallback search');
				this[this.type] = this[this.type].filter((file) => {
					return file.matchesSearch(search);
				});

				resolve(this[this.type]);
				return;
			}

			// Try to initiate a server-side search for more in-depth results
			fetch(url)
				.then(raw => {
					return raw.json();
				})
				.then(results => {
					Log.Debug('FileCollection.filterSearch/' + this.type, 'Server provided search results', results);
					this[this.type] = this[this.type].filter((file) => {
						return results.indexOf(file.url) !== -1;
					});

					resolve(this[this.type]);
				})
				.catch(() => {
					// Local-only search fallback
					Log.Debug('FileCollection.filterSearch/' + this.type, 'Using local-only fallback search');
					this[this.type] = this[this.type].filter((file) => {
						return file.matchesSearch(search);
					});

					resolve(this[this.type]);
				});
		});
	}

	/**
	 * Search file collection by arbitrary attributes
	 *
	 * @see {@link module:CMS~File#matchesAttributeSearch} for full documentation of usage
	 * @param {Object} search Dictionary containing key/values to search
	 * @param {string} [mode=AND]   "OR" or "AND" if we should check all keys or any of them
	 * @returns {File[]} Set of filtered files
	 */
	filterAttributeSearch(search, mode) {
		mode = mode || 'AND';

		Log.Debug('FileCollection.filterAttributeSearch/' + this.type, 'Performing "' + mode + '" attribute search for files', search);
		this._filterMode = mode;
		this._filters = search;

		this[this.type] = this[this.type].filter((file) => {
			return file.matchesAttributeSearch(search, mode);
		});
		this.filteredFiles = this[this.type];

		return this[this.type];
	}

	/**
	 * Filter content to display by a tag (Convenience method)
	 *
	 * Simple usage is to pass a single tag name to filter by.
	 * If a comma-separated string is provided, ALL tags in the string are matched.
	 * If a pipe-separated string is provided, ANY tag in the string is matched.
	 *
	 * @see filterAttributeSearch
	 *
	 * @param {string|string[]} query - Search query.
	 * @returns {File[]} Set of filtered files
	 */
	filterTag(query) {
		let tag = 'tags';

		if (typeof query === 'string' && query.indexOf(',') !== -1) {
			// When multiple tags are requested, set the key to include an 'AND' check
			query = query.split(',').map(t => t.trim());
			tag = '&tags';
		}
		else if (typeof query === 'string' && query.indexOf('|') !== -1) {
			// Pipe-separated values result in an 'OR' check (default)
			query = query.split('|').map(t => t.trim());
		}

		let search = {};
		search[tag] = query;

		return this.filterAttributeSearch(search);
	}

	/**
	 * Check if the given tag is currently filtered
	 *
	 * @param {string} tag
	 * @returns {boolean}
	 */
	hasFilterTag(tag) {
		let tags = this._filters['tags'] || this._filters['&tags'] || '';

		tag = tag.toLowerCase().replaceAll(' ', '_');

		if (!Array.isArray(tags)) {
			tags = [ tags ];
		}

		for (let i = 0; i < tags.length; i++) {
			if (tags[i].toLowerCase().replaceAll(' ', '_') === tag) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Filter results by a URL regex (Convenience method)
	 *
	 * @see filterAttributeSearch
	 *
	 * @param {string} url URL fragment/regex to filter against
	 * @returns {File[]} Set of filtered files
	 */
	filterPermalink(url) {
		return this.filterAttributeSearch({permalink: '~ ' + url + '.*'});
	}

	/**
	 * Get all tags located from this collection
	 *
	 * Each set will contain the properties `name`, `count`, `url`, and `weight`.
	 *
	 * @param {string|null} [sort=null] Key ['name', 'count', 'url'] to sort results
	 * @param {number} [weightMax=10] Max weight
	 * @returns {Object} {{name: string, count: number, url: string, weight: int}[]}
	 */
	getTags(sort = null, weightMax = 10) {
		return this._getTags(sort, weightMax, true);
	}

	/**
	 * Get tags of only currently filtered files located from this collection
	 *
	 * Each set will contain the properties `name`, `count`, `url`, and `weight`.
	 *
	 * @param {string|null} [sort=null] Key ['name', 'count', 'url'] to sort results
	 * @param {number} [weightMax=10] Max weight
	 * @returns {Object} {{name: string, count: number, url: string, weight: int}[]}
	 */
	getFilteredTags(sort = null, weightMax = 10) {
		return this._getTags(sort, weightMax, false);
	}

	/**
	 * Get all tags located from this collection
	 *
	 * Each set will contain the properties `name`, `count`, `url`, and `weight`.
	 *
	 * @param {string|null} [sort=null] Key ['name', 'count', 'url'] to sort results
	 * @param {number} [weightMax=10] Max weight
	 * @param {boolean} [all=false] If true, get all tags, otherwise only get tags of currently filtered files
	 * @returns {Object} {{name: string, count: number, url: string, weight: int}[]}
	 */
	_getTags(sort = null, weightMax = 10, all = false) {
		let tags = [],
			tagNames = [],
			maxPages = 1,
			source;

		if (all) {
			source = this.allFiles;
		}
		else {
			source = this.filteredFiles;
		}

		source.forEach(file => {
			if (!file.draft && file.tags && Array.isArray(file.tags)) {
				file.tags.forEach(tag => {
					let tag_lower = tag.toLowerCase().replaceAll(' ', '_'),
						pos = tagNames.indexOf(tag_lower);
					if (pos === -1) {
						// New tag discovered
						tags.push({
							tag: tag_lower,
							name: tag.replace(/_/g, ' '),
							count: 1,
							url: this.config.webpath + this.type + '.html?tag=' + encodeURIComponent(tag_lower)
						});
						tagNames.push(tag_lower);
					} else {
						// Existing tag
						tags[pos].count++;
						maxPages = Math.max(maxPages, tags[pos].count);
					}
				});
			}
		});

		// To assist with CSS, assign a relative weight to each entry based on the count and total count discovered
		for(let i = 0; i < tags.length; i++) {
			tags[i]['weight'] = Math.ceil(tags[i].count / maxPages * weightMax);
		}

		if (sort) {
			if (sort.endsWith('-r')) {
				sort = sort.substring(0, sort.length - 2);
				tags.sort((a, b) => {
					if (typeof a[sort] === 'string' && typeof b[sort] === 'string') {
						return b[sort].localeCompare(a[sort]);
					}
					return b[sort] - a[sort];
				});
			}
			else {
				tags.sort((a, b) => {
					if (typeof a[sort] === 'string' && typeof b[sort] === 'string') {
						return a[sort].localeCompare(b[sort]);
					}
					return a[sort] - b[sort];
				});
			}
		}

		return tags;
	}

	/**
	 * Get file by permalink.
	 * @method
	 * @param {string} permalink - Permalink to search.
	 * @returns {File} File object.
	 * @throws {CMSError}
	 */
	getFileByPermalink(permalink) {

		Log.Debug('FileCollection.getFileByPermalink/' + this.type, 'Retrieving file by permalink', permalink);

		let foundFiles = this.allFiles.filter((file) => {
			return file.permalink === permalink ||
				file.permalink === this.config.webpath + permalink;
		});

		if (foundFiles.length === 0) {
			// The page may still exist, just not have been loaded by the server scan.
			// This occurs when the page is flagged as draft mode,
			// (but draft pages should still be visible if you know the URL).
			let url = permalink.replace('.html', '.md');
			if (!url.startsWith(this.config.webpath)) {
				url = this.config.webpath + url;
			}
			let f = new File(
				url,
				this.type,
				this.layout.single,
				this.config
			);

			try {
				f.parseFilename();
				f.parsePermalink();
				return f;
			} catch (e) {
				throw new CMSError(404, 'Requested file could not be located');
			}
		}

		return foundFiles[0];
	}

	/**
	 * Set pagination (total number of results) for this collection
	 *
	 * @param {number} results Total number of results per page
	 * @param {number} page Current page number (1-based) or NULL to retrieve from URL
	 */
	paginate(results, page) {
		results = results || 20;
		let u = new URLSearchParams(window.location.search),
			start, end;

		this.resultsPerPage = results;
		this.currentPage = page || (u.has('page') ? parseInt(u.get('page')) : 1);
		this.totalResults = this.filteredFiles.length;
		this.totalPages = Math.ceil(this.totalResults / this.resultsPerPage);

		if (this.currentPage > this.totalPages) {
			// Sanity check to limit to number of pages
			this.currentPage = this.totalPages;
		}

		start = (this.currentPage - 1) * this.resultsPerPage;
		end = Math.min(this.currentPage * this.resultsPerPage, this.totalResults);

		this[this.type] = this.filteredFiles.slice(start, end);
	}

	/**
	 * Renders file collection.
	 *
	 * @async
	 * @returns {Promise}
	 * @throws {Error}
	 */
	async render() {

		// Rendering a full page will update the page title
		if (this.layout.title) {
			document.title = this.layout.title;
		} else {
			document.title = 'Listing';
		}

		return renderLayout(this.layout.list, this);
	}

	async renderSearch(query) {
		return new Promise((resolve, reject) => {
			document.title = 'Searching...';

			this.filterSearch(query).then(() => {
				if (this.layout.title) {
					document.title = this.layout.title + ' - ' + query;
				} else {
					document.title = 'Listing - ' + query;
				}

				renderLayout(this.layout.list, this)
					.then(resolve)
					.catch(reject);
			});
		});
	}
}

export default FileCollection;
