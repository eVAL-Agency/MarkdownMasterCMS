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
	/**
	 * Get a value from the object using a key lookup
	 *
	 * If the key contains '.', it will be treated as a nested key lookup,
	 * eg: 'user.name' will fetch the value of object.user.name
	 *
	 * @param {string} key
	 * @param {mixed} [defaultValue=null]
	 * @returns {mixed}
	 */
	get(key, defaultValue) {
		defaultValue = defaultValue ?? null;

		let lookup = this;
		if (key.indexOf('.') === -1) {
			// Simple key lookup
			return Object.hasOwn(lookup, key) ? lookup[key] : defaultValue;
		}
		else {
			// Nested key lookup
			let parts = key.split('.');
			for (let i = 0; i < parts.length; i++) {
				if (!Object.hasOwn(lookup, parts[i])) {
					return defaultValue;
				}
				lookup = lookup[parts[i]];
			}
			return lookup;
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
