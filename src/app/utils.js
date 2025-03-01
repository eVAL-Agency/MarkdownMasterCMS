/**
 * Utilities for the CMS
 *
 * @module CMS
 * @license The MIT License (MIT)
 * @copyright (c) 2021 Chris Diana | https://chrisdiana.github.io/cms.js
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
 */

/**
 * Formats date string to a Date object converted to the user's local timezone
 *
 * Accepts dashes or slashes between characters, (to support YYYY/MM/DD URL directories)
 *
 * @param {string|Date} dateStr Date string to convert
 * @returns {Date} Rendered Date object
 */
export function getDatetime(dateStr) {
	let matches, dt;
	if (dateStr instanceof Date) {
		// The input value may be a Date if passed from FrontMatter as a YAML date, allow this.
		dt = dateStr;
	} else {
		if ((matches = dateStr.match(/^(1[0-2]|[1-9])\/(3[0-1]|[1-2][0-9]|[0-9])\/((?:20|19)?[0-9][0-9])$/))) {
			// US-based M/d/Y
			if (matches[3] < 100) {
				// Short format year (2-digit)
				matches[3] = '20' + matches[3];
			}

			dateStr = [matches[3], matches[1], matches[2]].join('-');
		}
		dateStr = dateStr.replaceAll('/', '-');
		dt = new Date(dateStr);
	}

	return new Date(dt.getTime() + dt.getTimezoneOffset() * 60000);
}

/**
 * Function to join paths while ensuring each is separated by a slash
 *
 * @param {string} args
 * @returns {string}
 *
 * @example
 * pathJoin('posts', 'topic');
 * // Returns 'posts/topic'
 *
 * pathJoin('posts', 'topic', 'README.md');
 * // Returns 'posts/topic/README.md'
 */
export function pathJoin(...args) {
	let path = '';
	// Lazy person's os.path.join()
	for (let i = 0; i < args.length; i++) {

		if (args[i] === '' || args[i] === null) {
			// Failsafe checks
			continue;
		}

		if (path.endsWith('/') && args[i].startsWith('/')) {
			// If paths are provided as ['/', '/posts'], we don't want to double the slashes.
			path += args[i].substring(1);
		} else {
			path += args[i];
		}

		if (i + 1 < args.length && !args[i].endsWith('/')) {
			path += '/';
		}
	}

	return path;
}

/**
 * Get the directory name of the requested file
 *
 * @param {string} path
 * @returns {string}
 */
export function dirname(path) {
	if (path.indexOf('/') === -1) {
		// No slashes, no path
		return '';
	}
	return path.substring(0, path.lastIndexOf('/') + 1);
}

/**
 * Get the basename of a given file, optionally without the extension
 *
 * @param {string} path
 * @param {boolean} [without_extension=false]
 * @returns {string}
 */
export function basename(path, without_extension) {
	if (path.indexOf('/') !== -1) {
		path = path.substring(path.lastIndexOf('/') + 1);
	}

	if (without_extension && path.indexOf('.') !== -1) {
		path = path.substring(0, path.lastIndexOf('.'));
	}

	return path;
}

export class AttributeBuilder {
	/**
	 *
	 * @param {string|null} [attribute_string=null]
	 */
	constructor(attribute_string) {
		/**
		 * @type {Object<string, {values: string[], quote_style: string|null}>}
		 */
		this.attributes = {};

		if (attribute_string !== null) {
			this.loadString(attribute_string);
		}
	}

	/**
	 * Process all extended attributes as a string into their individual parts
	 *
	 * Will return a list of every key with its values and any quotations required
	 * note, each value will be an array of values, generally used for classes, but
	 * available for everything (except IDs).
	 *
	 * @param {string|null} attribute_string String of attributes (usually from MD) to load
	 */
	loadString(attribute_string) {
		let in_quote = false,
			quote_style = null,
			key = null,
			buffer = '';

		attribute_string = attribute_string ?? null;

		if (attribute_string === '' || attribute_string === null) {
			return;
		}

		for (let i = 0; i < attribute_string.length; i++) {
			// current letter
			let token = attribute_string[i];
			if (in_quote && token === quote_style) {
				// End of quoted text, stop quoted capture
				in_quote = false;
			} else if (in_quote) {
				// Quoted capture, just capture it directly
				buffer += token;
			} else if (token === '=' && buffer !== '') {
				// A '=' signifies a separation of a key attribute and its value
				key = buffer;
				buffer = '';
			} else if (token === '"' || token === '\'') {
				in_quote = true;
				quote_style = token;
			} else if (token === ' ') {
				// Attributes are space separated (unless inside a quoted string which is caught above)
				this.addAttribute(key, buffer, quote_style);
				quote_style = null;
				buffer = '';
				key = null;
			} else {
				// Default capture, either key or buffer, we'll figure that out later.
				buffer += token;
			}
		}

		// After processing the last record, process that last snippet
		this.addAttribute(key, buffer, quote_style);
	}

	/**
	 * Add an attribute key/value pair to the list of attributes
	 *
	 * Used to standardize various shorthand declarations to their usable format,
	 * meant to be called once-per-pair
	 *
	 * For example, the following shorthands are supported:
	 * '.red' value can be passed with no key for a class name
	 * '#thing' value can be passed with no key for an ID
	 *
	 * @param {string|null} key
	 * @param {string} value
	 * @param {string|null} [quote_style=null]
	 */
	addAttribute(key, value, quote_style) {
		quote_style = quote_style ?? null;

		if (key == null && value[0] === '.') {
			key = 'class';
			value = value.substring(1);
		} else if (key == null && value[0] === '#') {
			key = 'id';
			value = value.substring(1);
		}

		if (typeof (this.attributes[key]) === 'undefined') {
			this.attributes[key] = {
				values: [value],
				quote_style: quote_style,
			};
		} else {
			this.attributes[key].values.push(value);
		}
	}

	/**
	 * Flatten a processed list of attributes (key, values, quote_style),
	 * to a flat string to be sent directly to the browser
	 *
	 * @returns string
	 */
	asString() {
		let results = [];
		// Everything processed, compile into a flat string
		for (let k in this.attributes) {
			let v = k + '=';

			if (this.attributes[k].quote_style === null) {
				// Default to double quotes
				this.attributes[k].quote_style = '"';
			}

			v += this.attributes[k].quote_style + this.getValue(k) + this.attributes[k].quote_style;

			results.push(v);
		}

		return results.join(' ');
	}

	/**
	 * Get the value for the requested key
	 *
	 * @param {string} key
	 * @returns {string}
	 */
	getValue(key) {
		if (typeof(this.attributes[key]) === 'undefined') {
			// No key set, no value to provide.
			return '';
		} else if (key === 'id') {
			// Hard code to only support one ID (to keep people from doing something silly)
			return this._parseIDValue(this.attributes[key].values[0]);
		} else {
			// Everything else can have multiple if they want.
			return this.attributes[key].values.join(' ');
		}
	}

	/**
	 * Parse an ID to an acceptable value, IDs cannot start with a number,
	 * contain spaces or special characters, and should not end with a dash.
	 *
	 * @param {string} id
	 * @returns {string}
	 * @private
	 */
	_parseIDValue(id) {
		id = id
			.toLowerCase()
			.replace(/\W/g, '-')
			.replace(/[^a-z0-9-]/g, '')
			.replace(/-+/g, '-')
			.replace(/(^-|-$)/g, '');
		if (id.match(/^[0-9]/)) {
			id = 'id-' + id;
		}

		return id;
	}
}


/**
 * Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
 * /c*$/ is vulnerable to REDOS.
 *
 * @param {string} str
 * @param {string} [c=' ']
 * @param {boolean} [invert=false] Remove suffix of non-c chars instead. Default falsey.
 *
 * @see marked/src/helpers.js
 */
export function rtrim(str, c, invert = false) {
	c = c ?? ' ';
	const l = str.length;
	if (l === 0) {
		return '';
	}

	// Length of suffix matching the invert condition.
	let suffLen = 0;

	// Step left until we fail to match the invert condition.
	while (suffLen < l) {
		const currChar = str.charAt(l - suffLen - 1);
		if (currChar === c && !invert) {
			suffLen++;
		} else if (currChar !== c && invert) {
			suffLen++;
		} else {
			break;
		}
	}

	return str.slice(0, l - suffLen);
}
