/**
 * Extra - CMS Author
 *
 * Render an author as an embedded widget, (using selectable layout template)
 *
 * **Initialization**
 *
 * To load this functionality from HTML:
 *
 * ```html
 * <script>
 * CMS.loadExtra('cms-author');
 * </script>
 * ```
 *
 * or from within `config.js`
 *
 * ```js
 * extras: {
 *   'cms-author': {}
 * }
 * ```
 *
 * **Quick Usage**
 *
 * ```html
 * <cms-author author="<%= data.author %>"></cms-author>
 * ```
 *
 * Will render the author's profile using the default layout template.
 *
 * **Attributes**
 *
 * - `author` - The name or alias of the author to render
 * - `layout` - The layout template to use for rendering the author
 *
 *
 * @module Extras/CMS-Author
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
 * @since 4.0.0
 */

/**
 * Provides `<cms-author>` tag functionality.
 */
class CMSAuthorElement extends HTMLElement {
	static get observedAttributes() {
		return ['author', 'layout'];
	}

	constructor() {
		// Always call super first in constructor
		super();
		this._render();

		// Initially when loaded, ignore any attribute change requests
		this.settled = false;
		setTimeout(() => {
			this.settled = true;
		}, 200);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (!this.settled) {
			// The CMS will sometimes load the DOM, then reload when adding to the page.
			// Prevent double-loading on pageload
			return;
		}
		if (['author', 'layout'].indexOf(name) !== -1 && oldValue !== newValue) {
			// Only re-render if an actionable attribute is modified
			this._render();
		}
	}

	_render() {
		let author = this.getAttribute('author'),
			layout = this.getAttribute('layout'),
			collection,
			results;

		// This module requires both an author and the authors component to be loaded.
		// Since this is a live component which watches attributes, this should be done
		// before any CMS work is checked to save cycles
		if (!author) {
			return;
		}
		if (!layout) {
			return;
		}

		if (!(Object.hasOwn(window, 'CMS') && window.CMS != null)) {
			// Only run once the CMS is loaded
			return;
		}

		// Load the collection from the CMS
		collection = window.CMS.getCollection('authors');
		if (!collection) {
			window.CMS.log.Warn('cms-author', '<cms-author> tag requires an "authors" collection to be available');
			return;
		}

		// Search for this user
		collection.resetFilters();
		results = collection.filterAttributeSearch({title: author, alias: author}, 'OR');

		// Only render if at least one found, (just pick the first)
		if (results.length >= 1) {
			window.CMS.fetchLayout(layout, results[0])
				.then(html => {
					this.innerHTML = html;
				}).catch(error => {
					window.CMS.log.Error('cms-author', 'Unable to render <cms-author> template [' + layout + ']', error);
				});
		} else {
			window.CMS.log.Warn('cms-author', 'No author could be found matching [' + author + ']');
		}
	}
}

customElements.define('cms-author', CMSAuthorElement);
