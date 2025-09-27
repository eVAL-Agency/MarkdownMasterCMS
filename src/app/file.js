/**
 * Handler for single files in the CMS
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
import {basename, dirname, getDatetime, pathJoin} from './utils';
import Log from './log';
import CMSError from './cmserror';
import jsYaml from 'js-yaml';
import TemplateObject from './templateobject';

/**
 * Represents a Markdown file installed in one of the collection directories
 */
class File extends TemplateObject {

	/**
	 * Set of keys which cannot be set from the FrontMatter content
	 * These generally have a built-in or reserved purpose
	 * @type {string[]}
	 */
	static ProtectedAttributes = [
		'body',
		'bodyLoaded',
		'config',
		'content',
		'name',
		'permalink',
		'type',
		'url',
		'scripts',
		'scriptsLoaded',
	];

	/**
	 * @param {string} url    The URL of the file
	 * @param {string} type   The type of file (i.e. posts, pages)
	 * @param {string} layout The layout templates of the file
	 * @param {Config} config Configuration from the CMS
	 */
	constructor(url, type, layout, config) {
		super();
		// Common author-defined parameters

		/**
		 * Author name - pulled from FrontMatter
		 * @type {string|null}
		 */
		this.author = null;
		/**
		 * Banner alt/label and URL for this page, useful for pretty headers on pages
		 * @type {{label: string, url: string}|null}
		 */
		this.banner = null;
		/**
		 * Date published - pulled from FrontMatter or URL
		 * Will be converted into the requested format from Config.dateParser
		 *
		 * @see {@link Config#dateParser} for rendering info
		 * @type {string|null}
		 */
		this.date = null;
		/**
		 * Date object holding the date published - pulled from Last-Modified header
		 * if date is not set otherwise
		 * @type {Date|null}
		 */
		this.datetime = null;
		/**
		 * Set to TRUE to flag this File as draft (and not rendered to the site)
		 * @type {boolean}
		 */
		this.draft = false;
		/**
		 * Short excerpt or teaser about the page, useful on listing pages
		 * @type {string|null}
		 */
		this.excerpt = null;
		/**
		 * Image alt/label and URL for this page
		 * @type {{label: string, url: string}|null}
		 */
		this.image = null;
		/**
		 * Default layout for rendering this file
		 * @type {string}
		 */
		this.layout = layout;
		/**
		 * Window title / SEO title for this page, useful for differing from page title
		 * @type {string|null}
		 */
		this.seotitle = null;
		/**
		 * List of tags associated with this page
		 * @type {string[]|null}
		 */
		this.tags = null;
		/**
		 * Title for this page, generally rendered as an H1
		 * @type {string|null}
		 */
		this.title = null;


		// System-defined parameters

		/**
		 * Rendered HTML body for this File
		 * @type {string}
		 */
		this.body = null;

		/**
		 * Set to true when the HTML body has been parsed (performance tracker)
		 * @type {boolean}
		 */
		this.bodyLoaded = false;

		/**
		 * System configuration
		 * @type {Config}
		 */
		this.config = config;

		/**
		 * Raw Markdown contents of this File
		 * @type {string}
		 */
		this.content = null;

		/**
		 * Base filename of this File (without the extension)
		 * @type {string}
		 */
		this.name = null;

		/**
		 * Browseable link to this File (includes .html)
		 * @type {string}
		 */
		this.permalink = null;

		/**
		 * Collection type this file resides under
		 * @type {string}
		 */
		this.type = type;

		/**
		 * Path to the raw Markdown source file
		 * @type {string}
		 */
		this.url = url;

		/**
		 * Timestamp of the last modification, as pulled from Meta loader (when available)
		 * @type {null|int}
		 */
		this.timestamp = null;

		/**
		 * List of scripts to load for this file
		 * @type {string[]}
		 */
		this.scripts = [];

		/**
		 * List of scripts loaded (and ACTIVE) for this pageview
		 * @type {HTMLScriptElement[]}
		 */
		this.scriptsLoaded = [];

		/**
		 * Internal match score for this file when matchesAttributeSearch is used.
		 * @type {number}
		 * @private
		 */
		this.__match = 0;
	}

	/**
	 * Load file content from the server
	 *
	 * @returns {Promise<string>}
	 * @throws {CMSError}
	 */
	async loadContent() {
		return new Promise((resolve, reject) => {
			if (this.content !== null) {
				// Already loaded!
				resolve(this.content);
				return;
			}

			let url = this.url;
			if (this.timestamp) {
				// Append a timestamp to the URL to ensure the browser gets the most updated version.
				// This is required because repeated viewers will often not see updates, and getting
				// some browsers *cough Chrome cough* to actually poll the server can be challenging.
				url += '?t=' + this.timestamp;
			}

			fetch(url)
				.then(response => {
					if (!response.ok) {
						Log.Warn(this.type, 'Unable to load file', this.url, response);

						reject(new CMSError(response.status, response.statusText));
					}

					if (response.headers.has('Last-Modified')) {
						this.datetime = response.headers.get('Last-Modified');
					}

					return response.text();
				})
				.then(content => {
					this.content = content;
					this.parseContent();

					Log.Debug('File.loadContent/' + this.type, 'Loaded file ', this);
					resolve(content);
				})
				.catch(e => {
					Log.Warn(this.type, 'Unable to load file', this, e);
					reject(new CMSError(503, e));
				});
		});
	}

	/**
	 * Handle operations necessary when unloading this page from the browser view
	 */
	onUnload() {
		if (this.scriptsLoaded.length > 0) {
			// Unload any scripts loaded for this page
			this.scriptsLoaded.forEach(script => {
				document.body.removeChild(script);
			});
			this.scriptsLoaded = [];
		}
	}

	/**
	 * Get all tags located in this file
	 *
	 * Each set will contain the properties `name`, `count`, `url`, and `weight`.
	 *
	 * @param {null|string} sort Key ['name', 'count', 'url'] to sort results
	 * @returns {Object} {{name: string, count: number, url: string, weight: int}[]}
	 */
	getTags(sort = null) {
		let tags = [];

		if (this.tags && Array.isArray(this.tags)) {
			this.tags.forEach(tag => {
				tags.push({
					tag: tag.toLowerCase(),
					name: tag.replace(/_/g, ' '),
					count: 1,
					weight: 1,
					url: this.config.webpath + this.type + '.html?tag=' + encodeURIComponent(tag.toLowerCase())
				});
			});
		}

		if (sort) {
			tags.sort((a, b) => { return a[sort] > b[sort]; });
		}

		return tags;
	}

	/**
	 * Get a specific meta field from this file
	 *
	 * @param {string} lookup Key to retrieve, or period-separated lookup for nested values
	 */
	getMeta(lookup) {
		let keys = lookup.indexOf('.') === -1 ? [lookup] : lookup.split('.'),
			value = this;

		for (let key of keys) {
			if (Object.hasOwn(value, key)) {
				value = value[key];
			} else {
				return null;
			}
		}

		return value;
	}

	/**
	 * Parse front matter, the content in the header of the file.
	 *
	 * Will scan through and retrieve any key:value pair within `---` tags
	 * at the beginning of the file.
	 *
	 * These values get set directly on the `File` object for use within templates or system use.
	 */
	parseFrontMatter() {
		if (!this._checkHasFrontMatter()) {
			// No FrontMatter, nothing to scan.
			return;
		}

		let yaml = this.content.split(this.config.frontMatterSeperator)[1],
			data;

		if (yaml) {
			data = jsYaml.load(yaml);
			this.parseFrontMatterData(data);
		}
	}

	/**
	 * Parse the actual metadata located from the frontmatter
	 *
	 * @param {object} data
	 */
	parseFrontMatterData(data) {
		for (let [attKey, attVal] of Object.entries(data)) {
			// For convenience all tags should be lowercase.
			attKey = attKey.toLowerCase();

			if (File.ProtectedAttributes.indexOf(attKey) !== -1) {
				// To prevent the user from messing with important parameters, skip a few.
				// These are calculated and used internally and really shouldn't be modified.
				Log.Warn(this.type, this.url, 'has a protected key [' + attKey + '], value will NOT be parsed.');
				continue;
			}

			if (typeof this[attKey] === 'function') {
				// Do not allow methods to be overridden
				Log.Warn(this.type, this.url, 'unable to load key [' + attKey + '], target is a function!');
				continue;
			}

			this[attKey] = this._parseFrontMatterKey(attVal);
		}
	}

	/**
	 * Parse filename from the URL of this file and sets to `name`
	 */
	parseFilename() {
		this.name = basename(this.url, true);
	}

	/**
	 * Parse permalink from the URL of this file and sets to `permalink`
	 */
	parsePermalink() {
		this.permalink = pathJoin(dirname(this.url), basename(this.url, true) + '.html');
	}

	/**
	 * Parse file date from either the FrontMatter or server Last-Modified header
	 */
	parseDate() {
		let dateRegEx = new RegExp(this.config.dateParser);
		if (this.date) {
			// Date is set from markdown via the "date" inline header
			this.datetime = getDatetime(this.date);
			this.date = this.config.dateFormat(this.datetime);
		} else if (dateRegEx.test(this.url)) {
			// Date is retrieved from file URL
			// Support 2023-01-02 and 2023/01/02 formats in the URL
			this.date = dateRegEx.exec(this.url)[0].replace('/', '-');
			this.datetime = getDatetime(this.date);
			this.date = this.config.dateFormat(this.datetime);
		} else if (this.datetime) {
			// Lastmodified is retrieved from server response headers or set from the front content
			this.datetime = getDatetime(this.datetime);
			this.date = this.config.dateFormat(this.datetime);
		}
	}

	/**
	 * Parse file body from the markdown content
	 */
	async parseBody() {
		return new Promise((resolve, reject) => {
			if (this.bodyLoaded) {
				// Only render content if it hasn't been loaded yet, (allows for repeated calls)
				resolve(this.body);
				return;
			}

			this.loadContent()
				.then(content => {
					let html;
					if (this._checkHasFrontMatter()) {
						// Trim off the FrontMatter from the content
						html = content
							.split(this.config.frontMatterSeperator)
							.splice(2)
							.join(this.config.frontMatterSeperator);
					} else {
						// This file does not contain any valid formatted FrontMatter content
						html = content;
					}

					if (this.config.markdownEngine) {
						this.body = this.config.markdownEngine(html);

						// Scripts being loaded from within a script can be tricky,
						// extract out any embedded scripts and process them separately.
						// We do not need to worry about ```<script>example code...</script>``` as this is escaped by the markdown engine.
						if (this.body.includes('<script')) {
							let scripts = this.body.matchAll(/<script.*?>([\s\S]*?)<\/script>/g);
							scripts.forEach(script => {
								this.scripts.push(script[1]);
							});
							this.body = this.body.replace(/<script.*?>[\s\S]*?<\/script>/g, '');
						}
					} else {
						this.body = '<pre>' + html + '</pre>';
					}

					this.bodyLoaded = true;
					resolve(this.body);
				})
				.catch(e => {
					reject(e);
				});
		});
	}

	/**
	 * Parse file content
	 *
	 * Sets all file attributes and content.
	 */
	parseContent() {
		this.parseFilename();
		this.parsePermalink();
		this.parseFrontMatter();
		this.parseDate();
	}

	/**
	 * Perform a text search on this file to see if the content contains a given search query
	 *
	 * @param {string} query Query to check if this file matches against
	 * @returns {boolean}
	 */
	matchesSearch(query) {
		let words = query.toLowerCase().split(' '),
			found = true,
			checks = '';

		if (this.content) {
			checks += this.content.toLowerCase();
		}

		if (this.title) {
			checks += this.title.toLowerCase();
		}

		if (this.excerpt) {
			checks += this.excerpt.toLowerCase();
		}

		words.forEach(word => {
			if (checks.indexOf(word) === -1) {
				// This keyword was not located anywhere, matches need to be complete when multiple words are provided.
				found = false;
				return false;
			}
		});

		return found;
	}

	/**
	 * Perform an attribute search on this file to see if its metadata matches the query
	 *
	 * @param {Object} query Dictionary containing key/values to search
	 * @param {string} [mode=AND] "OR" or "AND" if we should check all keys or any of them
	 * @returns {boolean}
	 *
	 * @example
	 * // Match if this file is authored by Alice
	 * file.matchesAttributeSearch({author: 'Alice'});
	 *
	 * // Match if this file is authored by Alice or Bob
	 * file.matchesAttributeSearch({author: ['Alice', 'Bob']});
	 *
	 * // Match if this file is authored by Alice or Bob AND has the tag Configuration
	 * file.matchesAttributeSearch({author: ['Alice', 'Bob'], tags: 'Configuration'});
	 *
	 * // Match if this file is authored by Bob OR has the tag HR
	 * file.matchesAttributeSearch({author: 'Bob', tags: 'HR'}, 'OR');
	 */
	matchesAttributeSearch(query, mode) {
		let found = false,
			matches_all = true,
			match_count = 0,
			match_total = 0;

		mode = mode || 'AND';

		for (let [key, value] of Object.entries(query)) {
			if (Array.isArray(value)) {
				// Multiple values, this grouping is an 'OR' automatically
				let set_match = false;
				for (let i = 0; i < value.length; i++) {
					match_total += 1;
					if (this._matchesAttribute(key, value[i])) {
						set_match = true;
						match_count += 1;
					}
				}
				if (set_match) {
					found = true;
				} else {
					matches_all = false;
				}
			} else {
				match_total += 1;
				if (this._matchesAttribute(key, value)) {
					found = true;
					match_count += 1;
				} else {
					matches_all = false;
				}
			}
		}

		this.__match = match_total > 0 ? (match_count / match_total) : 0;

		if (mode.toUpperCase() === 'OR') {
			// an OR check just needs at least one matching result
			return found;
		} else {
			// an AND check (default) needs at least one matching AND all other matching
			return found && matches_all;
		}
	}

	/**
	 * Renders file with a configured layout
	 *
	 * @async
	 * @returns {Promise}
	 * @throws {Error}
	 */
	async render() {
		document.title = 'Loading ' + this.url + '...';

		return new Promise((resolve, reject) => {
			this.parseBody().then(() => {
				// Rendering a full page will update the page title
				if (this.seotitle) {
					document.title = this.seotitle;
				} else if (this.title) {
					document.title = this.title;
				} else {
					document.title = 'Page';
				}

				renderLayout(this.layout, this).then(() => {
					// Add any inline scripts to the page once rendering is complete.
					this.scripts.forEach(script => {
						let s = document.createElement('script');
						s.type = 'text/javascript';
						// Auto-include IIFE wrapper around scripts to prevent scope issues
						s.textContent = '(() => { \n' + script + '\n})();';
						document.body.appendChild(s);
						this.scriptsLoaded.push(s);
					});

					resolve();
				}).catch(e => {
					reject(e);
				});
			}).catch(e => {
				reject(e);
			});
		});
	}

	/**
	 * Internal method to parse a value query, including support for comparison prefixes in the string
	 * Supports a single value to compare and both single and array values from the metadata
	 *
	 * @param {string}      key   Frontmatter meta key to compare against
	 * @param {string|null} check Value comparing
	 * @returns {boolean}
	 * @private
	 */
	_matchesAttribute(key, check) {
		let op = '=',
			local_val;

		// Key conversions, (must be before local_var assignment)
		if (key === 'date') {
			// This is a useless parameter as it's formatted into a human-friendly version,
			// but we can remap it to datetime (that's probably what they wanted)
			key = 'datetime';
		}

		local_val = Object.hasOwn(this, key) ? this[key] : null;
		if (!Array.isArray(local_val)) {
			// To support array values, just convert everything to an array to make the logic simpler.
			local_val = [local_val];
		}

		if (check === null) {
			check = '';
		}

		// Strings support embedding operator checks
		if (typeof check === 'string') {
			if (check.startsWith('!~ ') || check.startsWith('>= ') || check.startsWith('<= ') || check.startsWith('!= ')) {
				op = check.substring(0, 2);
				check = check.substring(3);
			}
			else if (check.startsWith('~ ') || check.startsWith('> ') || check.startsWith('< ') || check.startsWith('= ')) {
				op = check.substring(0, 1);
				check = check.substring(2);
			}
		}

		for (let val of local_val) {
			if (val === null) {
				val = '';
			}

			if (this._compare(val, op, check)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Perform a fuzzy check against two values
	 *
	 * Will try to perform an intelligent comparison, ie: "true" and TRUE will be presumed as a match,
	 * this is because YAML will convert "true" to a boolean TRUE when parsed,
	 * but HTML will treat all attributes as a string.
	 *
	 * @param {Date|boolean|string|integer} val
	 * @param {string} op
	 * @param {string} check
	 * @returns {boolean}
	 * @private
	 */
	_compare(val, op, check) {

		if (op === '~' || op === '!~') {
			// Regex check
			let re = new RegExp(check),
				invert = op === '!~',
				test = re.test(val.toString());

			return invert ? !test : test;
		}

		if (op === '=' || op === '!=') {
			// Equality check
			let invert = op === '!=',
				test;

			check = check.toLowerCase();

			if (val === true) {
				test = check === '1' || check === 'true' || check === 'yes' || check === 'on';
			}
			else if(val === false) {
				test = check === '0' || check === 'false' || check === 'no' || check === 'off';
			}
			else if(val instanceof Date) {
				test = val.getTime() === (new Date(check)).getTime();
			}
			else {
				test = val.toString().toLowerCase() === check;
			}

			return invert ? !test : test;
		}

		if (op === '>') {
			if (val instanceof Date) {
				return val > (new Date(check));
			}
			else {
				return val > check;
			}
		}

		if (op === '<') {
			if (val instanceof Date) {
				return val < (new Date(check));
			}
			else {
				return val < check;
			}
		}

		if (op === '>=') {
			if (val instanceof Date) {
				return val >= (new Date(check));
			}
			else {
				return val >= check;
			}
		}

		if (op === '<=') {
			if (val instanceof Date) {
				return val <= (new Date(check));
			}
			else {
				return val <= check;
			}
		}

		return false;
	}

	/**
	 * Check if this File has FrontMatter content
	 *
	 * This is important because parseContent needs to know if it needs to strip the meta fields
	 * @returns {boolean}
	 * @private
	 */
	_checkHasFrontMatter() {
		if (this.content === null || this.content === '') {
			// Failsafe checks
			return false;
		}

		// FrontMatter always starts on line 1
		let r = new RegExp('^' + this.config.frontMatterSeperator),
			m = this.content.match(r);
		if (m === null) {
			return false;
		}

		// There must be at least 2 separators
		r = new RegExp('^' + this.config.frontMatterSeperator + '$[^]', 'gm');
		m = this.content.match(r);
		return (Array.isArray(m) && m.length >= 2);
	}

	/**
	 * Parse a FrontMatter value for special functionality
	 * @param {Object|Array|string|boolean|null|number} value
	 * @returns {Object|Array|string|boolean|null|number}
	 */
	_parseFrontMatterKey(value) {
		if (Array.isArray(value)) {
			for (let i = 0; i < value.length; i++) {
				value[i] = this._parseFrontMatterKey(value[i]);
			}
		} else if (value instanceof Date) {
			// Native Date objects will utilize UTC which is probably not what the user wanted.
			// Convert that date to the user's local timezone
			return new Date(value.getTime() + value.getTimezoneOffset() * 60000);
		} else if (value instanceof Object) {
			for (let [k, v] of Object.entries(value)) {
				if (k === 'src' || k === 'href') {
					// Objects may have HREF or SRC attributes, treat these as such
					// Fix for relatively positioned images
					// An easy way to specify images in markdown files is to list them relative to the file itself.
					// Take the permalink (since it's already resolved), and prepend the base to the image.
					if (v.indexOf('://') === -1 && v[0] !== '/') {
						if (!this.permalink) {
							// Ensure the permalink for this file is ready
							this.parsePermalink();
						}
						value[k] = pathJoin(dirname(this.permalink), v);
					}
				}

				if (k === 'src' && !Object.hasOwn(value, 'alt')) {
					// src is commonly used for images, so include an 'alt' attribute by default if not provided.
					value['alt'] = basename(value[k]);
				}
			}
		}

		return value;
	}
}

export default File;
