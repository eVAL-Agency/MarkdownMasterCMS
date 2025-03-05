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

	render() {
		let author = this.getAttribute('author'),
			layout = this.getAttribute('layout'),
			collection,
			results;

		// This module requires both an author and the authors component to be loaded.
		if (!author) {
			this.innerHTML = 'ERROR: No author specified';
			return;
		}
		if (!layout) {
			this.innerHTML = 'ERROR: No layout specified';
			return;
		}

		// Load the collection from the CMS
		collection = CMS.getCollection('authors');
		if (!collection) {
			CMS.log.Error('Extras/cms-author', '<cms-author> tag requires an "authors" collection to be available');
			this.parentElement.removeChild(this);
			return;
		}

		// Search for this user
		collection.resetFilters();
		results = collection.filterAttributeSearch({title: author, alias: author}, 'OR');

		// Only render if at least one found, (just pick the first)
		if (results.length >= 1) {
			CMS.fetchLayout(layout, results[0])
				.then(html => {
					this.innerHTML = html;
				}).catch(error => {
					CMS.log.Error('Extras/cms-author', 'Unable to render <cms-author> template [' + layout + ']', error);
				});
		} else {
			CMS.log.Error('Extras/cms-author', 'No author could be found matching [' + author + ']');
		}
	}
}

customElements.define('cms-author', CMSAuthorElement);
