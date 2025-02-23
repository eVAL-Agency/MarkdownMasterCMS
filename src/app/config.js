/**
 * Configuration handler for the CMS
 * @constructor
 * @param {Object} [options=null] Pass an Object to autoload site-specific options
 */
export class Config extends Object {
	constructor(options) {
		super();

		/**
		 * ID of element to attach MarkdownMaster CMS to
		 * @type {string}
		 */
		this.elementId = 'cms';

		/**
		 * This is set to the web path to use for URLs.
		 * For example, if your site is located in https://domain.tld/cms/
		 * your web path should be '/cms/'
		 * @type {string}
		 */
		this.webpath = '/';

		/**
		 * Markdown engine to use for parsing into HTML
		 * @type {function|null}
		 */
		this.markdownEngine = null;

		/**
		 * Name of the layouts directory on the filesystem
		 * @type {string}
		 */
		this.layoutDirectory = 'layouts';

		/**
		 * The URL that will be the default view that will initially load (sans the .html extension)
		 *
		 * For example, to use '/posts.html' as the homepage, set to 'posts'.
		 * To use '/pages/home.html', set as 'pages/home'.
		 * @type {string}
		 */
		this.defaultView = 'posts';

		/**
		 * Types of file collections available on the CMS
		 * @type {ConfigType[]}
		 */
		this.types = [
			new ConfigType(
				'posts',
				{
					list: 'post-list',
					single: 'post',
					sort: 'datetime-r',
					title: 'Posts'
				}
			),
			new ConfigType(
				'pages',
				{
					list: 'page-list',
					single: 'page',
					sort: 'title',
					title: 'Pages'
				}
			)
		];

		/**
		 * Function to call when rendering dates to the page, useful for modifying how dates display
		 *
		 * @param {Date} date
		 *
		 * Common option parameters:
		 *
		 * * weekday - The representation of the weekday. Possible values are:
		 *   * "long" (e.g., Thursday)
		 *   * "short" (e.g., Thu)
		 *   * "narrow" (e.g., T). Two weekdays may have the same narrow style for some locales (e.g. Tuesday's narrow style is also T).
		 *   * key ommitted, weekday is not displayed at all
		 *
		 * * year - The representation of the year. Possible values are:
		 *   * "numeric" (e.g., 2012)
		 *   * "2-digit" (e.g., 12)
		 *
		 * * month - The representation of the month. Possible values are:
		 *   * "numeric" (e.g., 3)
		 *   * "2-digit" (e.g., 03)
		 *   * "long" (e.g., March)
		 *   * "short" (e.g., Mar)
		 *   * "narrow" (e.g., M). Two months may have the same narrow style for some locales (e.g. May's narrow style is also M).
		 *
		 * * day - The representation of the day. Possible values are:
		 *   * "numeric" (e.g., 1)
		 *   * "2-digit" (e.g., 01)
		 *
		 * For more information about date options, refer to
		 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#options
		 */
		this.dateFormat = date => {
			const options = {
				//weekday: 'long',
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			};

			let lang = 'en-US';

			if (typeof (window) !== 'undefined') {
				lang = window.navigator.language;
			}

			return date.toLocaleDateString(lang, options);

			// Optionally return a hard-coded format, (if you don't want the UI to vary)
			//return [(date.getMonth() + 1), date.getDate(), date.getFullYear()].join('/');
		};

		/**
		 * Parsing regular expression for parsing a date from a File URL
		 * @type {RegExp}
		 */
		this.dateParser = /\d{4}[-/]\d{2}(?:[-/]\d{2})?/;

		/**
		 * Separator for FrontMatter content in Markdown files
		 * @type {string}
		 */
		this.frontMatterSeperator = '---';

		/**
		 * Extension to match Files with
		 * @type {string}
		 */
		this.extension = '.md';

		/**
		 * Class to add to system messages (when in debug mode)
		 * @type {string}
		 */
		this.messageClassName = 'cms-messages';

		/**
		 * Page title to set when searching for content
		 * @type {string}
		 */
		this.titleSearchResults = 'Search Results';

		this.extras = {};

		/**
		 * Set to true to enable debug logging, (will enable logging events to the console)
		 * @type {boolean}
		 */
		this.debug = false;

		// Allow options to be passed in by default for convenience
		if (options) {
			this.load(options);
		}
	}

	/**
	 * Load a user-defined dictionary of configuration values to override the defaults
	 * (usually set from the site config.js)
	 *
	 * @param {Object} options
	 */
	load(options) {
		if (Object.hasOwn(options, 'types')) {
			// Clear types to allow the user to override all of them
			this.types = [];
		}

		for (let [key, value] of Object.entries(options)) {
			if (key === 'types' && Array.isArray(value)) {
				value.forEach(type => {
					this.types.push(new ConfigType(type.name, type.layout));
				});
			}
			else {
				this[key] = value;
			}
		}
	}

	/**
	 * do a thing
	 * @param name
	 * @param key
	 * @param defaultValue
	 * @returns {*|null}
	 */
	extra(name, key, defaultValue) {
		defaultValue = defaultValue || null;
		if (!Object.hasOwn(this.extras, name)) {
			return defaultValue;
		}

		if (Object.hasOwn(this.extras[name], key)) {
			return this.extras[name][key];
		}

		return defaultValue;
	}
}

/**
 * The types of content collections to load.
 * Each type name is a directory where the files, pages or posts are located.
 * Each type has a set of layout templates for various use cases.
 *
 * @constructor
 * @param {string} name          Directory name for this content type (used as key name in CMS)
 * @param {Object} layout
 * @param {string} layout.list   Template file to use for listing this content type
 * @param {string} layout.single Template file to use for rendering a single page
 * @param {string} layout.sort   Default sort for files when browsing the listing page
 * @param {string} layout.title  Page title set when browsing the listing page
 */
export class ConfigType extends Object {
	constructor(name, layout) {
		super();

		this.name = name;
		this.layout = layout;
	}
}