/**
 * Log handler for CMS
 *
 * @module CMS
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
 */

/**
 * Logging utility class for the CMS to report messages to the web console.
 */
class Log {

	static _DebugEnabled = false;

	/**
	 * Log a [DEBUG] message to the console, (only when debug mode is enabled).
	 *
	 * @param {string} source
	 * @param {any} args
	 */
	static Debug(source, ...args) {
		if (Log._DebugEnabled) {
			let prefix = Log._Date() + ' [' + source + ']';
			console.log(prefix, ...args);
		}
	}

	/**
	 * Log a [WARNING] message to the console.
	 *
	 * @param {string} source
	 * @param {any} args
	 */
	static Warn(source, ...args) {
		let prefix = Log._Date() + ' [' + source + ']';
		console.warn(prefix, ...args);
	}

	/**
	 * Log an [ERROR] message to the console.
	 *
	 * @param {string} source
	 * @param {any} args
	 */
	static Error(source, ...args) {
		let prefix = Log._Date() + ' [' + source + ']';
		console.error(prefix, ...args);
	}

	/**
	 * Enable debug mode for the CMS.
	 */
	static EnableDebug() {
		Log._DebugEnabled = true;
	}

	/**
	 * Get the current time in HH:MM:SS format.
	 * @return {string}
	 */
	static _Date() {
		let d = new Date();
		return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
	}
}

export default Log;