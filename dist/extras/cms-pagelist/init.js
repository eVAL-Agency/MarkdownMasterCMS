/**
 * Extra - CMS Pagelist
 *
 * Provide a block of content from a collection, eg: a list of blog posts or a list of authors.
 *
 * **Initialization**
 *
 * To load this functionality from HTML:
 *
 * ```html
 * <script>
 * CMS.loadExtra('cms-pagelist');
 * </script>
 * ```
 *
 * or from within `config.js`
 *
 * ```js
 * extras: {
 *   'cms-pagelist': {}
 * }
 * ```
 *
 * **Quick Usage**
 *
 * ```html
 * <cms-pagelist type="posts" layout="pages"></cms-pagelist>
 * ```
 *
 * **Attributes**
 *
 * - `type` - The type of collection to render
 * - `layout` - The layout template to use for rendering the collection
 * - `sort` - The sort order to use for the collection
 * - `limit` - The maximum number of items to display
 * - `filter-...` - Filter the collection by a specific attribute
 *
 * @module Extras/CMS-Pagelist
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
 * @since 3.0.0
 */

/**
 * Provides `<cms-pagelist>` tag functionality.
 */
class CMSPagelistElement extends HTMLElement {
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

		if (['layout', 'link', 'sort', 'type'].indexOf(name) !== -1 && oldValue !== newValue) {
			// Only re-render if an actionable attribute is modified
			this._render();
		}
	}

	/**
	 * Execute the plugin on a given node to render the requested content inside it
	 */
	_render() {
		let type = this.getAttribute('type'),
			layout = this.getAttribute('layout'),
			sort = this.getAttribute('sort'),
			limit = this.getAttribute('limit'),
			filters = {},
			has_filters = false,
			collection;

		if (type === null) {
			return;
		}

		if (!(Object.hasOwn(window, 'CMS') && window.CMS != null)) {
			// Only run once the CMS is loaded
			return;
		}

		collection = window.CMS.getCollection(type);
		if (collection === null) {
			// Collection not found
			return;
		}

		// To allow the user to specify multiple attributes for the same field,
		// ie: author = ['bob', 'alice']
		for (let i = 0; i < this.attributes.length; i++) {
			let ak = this.attributes[i].name, av = this.attributes[i].value;
			if (ak.indexOf('filter-') === 0) {
				// Starts with "filter-..., denotes a filter to add to the query"
				// Trim the prefix, so we have just the field the user is filtering
				ak = ak.replace(/^filter-/, '');
				has_filters = true;

				if (av.indexOf(',') !== -1) {
					// Value contains a comma, split into an array
					filters[ak] = [];
					av.split(',').forEach(v => {
						if (v.trim() !== '') {
							filters[ak].push(v.trim());
						}
					});
				}
				else {
					filters[ak] = av;
				}
			}
		}

		if (layout === null) {
			// Default for this collection
			layout = collection.layout.list;
		}

		// Reset any filters previously set on this collection
		collection.resetFilters();

		// User-request sort and filter parameters
		if (sort !== null) {
			collection.filterSort(sort);
		}
		if (has_filters) {
			collection.filterAttributeSearch(filters);
		}
		if (limit !== null) {
			collection.paginate(parseInt(limit), 1);
		}

		window.CMS.fetchLayout(layout, collection)
			.then(html => {
				this.innerHTML = html;
			})
			.catch(error => {
				console.error('Unable to render <cms-pagelist> template [' + layout + ']', error);
			});
	}
}

customElements.define('cms-pagelist', CMSPagelistElement);
