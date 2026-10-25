/**
 * Template object for CMS
 *
 * @module CMS
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
 */

class TemplateObject {

	constructor(config) {
		/**
		 * System configuration
		 * @type {Config}
		 */
		this.config = config;
	}

	/**
	 * Get a value from the object using a key lookup
	 *
	 * If the key contains '.', it will be treated as a nested key lookup,
	 * eg: 'user.name' will fetch the value of object.user.name
	 *
	 * Values are converted to a string for use directly within HTML templates.
	 *
	 * @param {string} key
	 * @param {string} [defaultValue='']
	 * @returns {string}
	 */
	get(key, defaultValue) {
		defaultValue = defaultValue ?? '';

		let val = this._get(this, key, defaultValue);

		// Support auto formatters for some types
		if (val && val instanceof Date) {
			return this.config.dateFormat(val);
		}
		else if (val){
			return val.toString();
		}
		else {
			return defaultValue;
		}
	}

	/**
	 * Lookup the underlying value from a potentially nested array
	 *
	 * @param {Object} src
	 * @param {string} key
	 * @param {string} defaultValue
	 * @returns {*}
	 * @private
	 */
	_get(src, key, defaultValue) {
		defaultValue = defaultValue ?? '';

		if (key.indexOf('.') === -1) {
			// Simple key lookup
			return Object.hasOwn(src, key) ? src[key] : defaultValue;
		}
		else {
			// Key contains a '.'; that indicates a nested lookup.  Iterate!
			let parts = key.split('.');
			let first_key = parts.shift();
			let rest = parts.join('.');
			if (Object.hasOwn(src, first_key) && typeof src[first_key] === 'object') {
				return this._get(src[first_key], rest, defaultValue);
			}
			else {
				return defaultValue;
			}
		}
	}

	/**
	 * Handle operations necessary when unloading this page from the browser view
	 */
	onUnload() {
		// Unload the template object
		// This is called when the template is unloaded
		// You can use this to clean up any resources or references
	}
}

export default TemplateObject;
