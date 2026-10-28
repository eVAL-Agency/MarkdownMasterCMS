/**
 * Extra - CMS Reading Time
 *
 * Provides an estimated reading time for pages, based on the word count of the
 * article content. The estimate is computed entirely client-side.
 *
 * @module Extras/CMS-Reading-Time
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://markdownmaster.com/docs/extras/cms-reading-time.html
 * @since 6.0.0
 */

/**
 * Provides `<cms-reading-time>` tag functionality.
 */
class CMSReadingTimeElement extends HTMLElement {
	/**
	 * Constructor for the reading time element.
	 */
	constructor() {
		// Always call super first in constructor
		super();
	}

	/**
	 * Called when the element is added to the DOM.
	 */
	connectedCallback() {
		this.render();
	}

	/**
	 * Get if an attribute has a truthy value assigned.
	 *
	 * @param {string} name
	 * @param {boolean} defaultValue
	 * @returns {boolean}
	 * @private
	 */
	_getBoolAttribute(name, defaultValue) {
		defaultValue = defaultValue || false;

		let val = this.getAttribute(name) ?? (defaultValue ? '1' : '0');
		val = val.toLowerCase();

		return val === 'true' || val === '1';
	}

	/**
	 * Get the int value of an attribute.
	 *
	 * @param {string} name
	 * @param {number} defaultValue
	 * @returns {number}
	 * @private
	 */
	_getIntAttribute(name, defaultValue) {
		defaultValue = defaultValue || 0;

		return parseInt(this.getAttribute(name) ?? defaultValue);
	}

	/**
	 * Get the trimmed string value of an attribute.
	 *
	 * @param {string} name
	 * @returns {string}
	 * @private
	 */
	_getStrAttribute(name) {
		let val = this.getAttribute(name) ?? '';

		return (typeof val === 'string') ? val.trim() : '';
	}

	/**
	 * Render the estimated reading time for the resolved content.
	 */
	render() {
		// Clear any current entries
		this.innerHTML = '';

		// Validate environment
		if (typeof window === 'undefined' || !window.CMS) {
			// CMS is not initialized yet, nothing to do
			return;
		}

		let file = this._resolveFile();
		if (!file) {
			// No content source available, leave element empty
			return;
		}

		let speed = this._getIntAttribute('speed', 200);
		let showWords = this._getBoolAttribute('words');
		let hideShort = this._getBoolAttribute('hide-short');

		// Ensure the article content is available. parseBody() is idempotent, so
		// this only fetches on demand when the body is not already loaded.
		file.parseBody()
			.then(() => {
				let words = this._countWords(file.body);

				if (words === 0) {
					// No readable content, render nothing
					return;
				}

				let rawMinutes = words / speed;
				if (hideShort && rawMinutes < 1) {
					// Hide very short content
					return;
				}

				let minutes = Math.max(1, Math.round(rawMinutes));
				this._renderContent(minutes, words, showWords);
			})
			.catch((error) => {
				// Failed to load content, leave element empty
				window.CMS.log.Warn('cms-reading-time', 'Failed to load content for reading time', error);
				this.innerHTML = '';
			});
	}

	/**
	 * Resolve the File this element should display the reading time for.
	 *
	 * @returns {File|null}
	 * @private
	 */
	_resolveFile() {
		let fileAttr = this._getStrAttribute('file');

		if (fileAttr !== '') {
			// An explicit file was requested, resolve it from a collection.
			let type = this._deriveType(fileAttr);
			if (!type) {
				window.CMS.log.Warn('cms-reading-time', 'Could not determine collection type from file path "' + fileAttr + '"');
				return null;
			}

			let collection = window.CMS.getCollection(type);
			if (collection === null) {
				window.CMS.log.Warn('cms-reading-time', 'Collection "' + type + '" not located in CMS');
				return null;
			}

			try {
				return collection.getFileByPermalink(fileAttr);
			}
			catch (error) {
				window.CMS.log.Warn('cms-reading-time', 'File "' + fileAttr + '" not located in CMS', error);
				return null;
			}
		}

		// No file specified, fall back to the current page when it is a single File
		let current = window.CMS.currentPage;
		if (current && Object.hasOwn(current, 'permalink')) {
			return current;
		}

		window.CMS.log.Warn('cms-reading-time', 'No content source available for reading time');
		return null;
	}

	/**
	 * Derive the collection type from a file path / permalink.
	 *
	 * @param {string} path
	 * @returns {string|null}
	 * @private
	 */
	_deriveType(path) {
		try {
			let paths = window.CMS.getPathsFromURL(path);
			if (paths && paths.length && typeof paths[0] === 'string') {
				return paths[0];
			}
		}
		catch (error) {
			// Ignore parsing errors and let the caller handle the fallback
		}

		return null;
	}

	/**
	 * Count the readable words in the given HTML content string.
	 *
	 * Strips non-prose elements (scripts, styles, code blocks, embedded media, etc.)
	 * so that only actual readable text is counted toward the reading time.
	 *
	 * @param {string|null} html
	 * @returns {number}
	 * @private
	 */
	_countWords(html) {
		if (!html || typeof html !== 'string') {
			return 0;
		}

		let container = document.createElement('div');
		container.innerHTML = html;

		container.querySelectorAll(
			'script, style, pre, code, svg, canvas, iframe, object, embed, noscript, template'
		).forEach((element) => element.remove());

		let text = container.textContent.replace(/\s+/g, ' ').trim();
		if (text === '') {
			return 0;
		}

		return text.split(' ').length;
	}

	/**
	 * Render the computed reading time content into the element.
	 *
	 * @param {number} minutes Rounded reading time in minutes
	 * @param {number} words  Word count
	 * @param {boolean} showWords Whether to also display the word count
	 * @private
	 */
	_renderContent(minutes, words, showWords) {
		if (showWords) {
			let wordSpan = document.createElement('span');
			wordSpan.className = 'cms-reading-time-words';
			wordSpan.textContent = words.toLocaleString() + ' words';
			this.appendChild(wordSpan);

			this.appendChild(document.createTextNode(' \u00B7 '));
		}

		let timeSpan = document.createElement('span');
		timeSpan.className = 'cms-reading-time-time';
		timeSpan.textContent = minutes + ' min read';
		this.appendChild(timeSpan);

		let unit = (minutes === 1) ? 'minute' : 'minutes';
		let ariaLabel = 'Estimated reading time: ' + minutes + ' ' + unit;
		if (showWords) {
			ariaLabel = words.toLocaleString() + ' words, estimated reading time: ' + minutes + ' ' + unit;
		}
		this.setAttribute('aria-label', ariaLabel);
	}
}

customElements.define('cms-reading-time', CMSReadingTimeElement);
