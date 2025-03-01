/**
 * Error class for the CMS that adds HTTP status codes
 *
 * @module CMS
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
 */

/**
 * @constructor
 * @param {int}    code    HTTP status code (usually 404 or 500)
 * @param {string} message Error message text
 */
class CMSError extends Error {
	constructor(code, message) {
		super(message);
		this.code = code;
	}

	toString() {
		return '[' + this.code + '] ' + this.message;
	}
}

export default CMSError;