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
 * - `sort` - The sort order to use for the collection - see {@link module:CMS~FileCollection#filterSort sort options}
 * - `limit` - The maximum number of items to display
 * - `filter-...` - Filter the collection by a specific attribute - see {@link module:CMS~File#matchesAttributeSearch filter options}
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
		// Element is not connected to the DOM
		this.connected = false;
	}

	/**
	 * Called when the element is added to the DOM.
	 */
	connectedCallback() {
		// Element is now connected to the DOM
		this.connected = true;
		document.addEventListener('cms:route', this.render.bind(this), {once: true});
	}

	/**
	 * Called when the element is removed from the DOM.
	 */
	disconnectedCallback() {
		// Element is no longer connected to the DOM
		this.connected = false;
	}

	/**
	 * Execute the plugin on a given node to render the requested content inside it
	 */
	render() {
		// If not connected to the DOM anymore, don't render
		if (!this.connected)  return;

		let type = this.getAttribute('type'),
			layout = this.getAttribute('layout'),
			sort = this.getAttribute('sort'),
			limit = this.getAttribute('limit'),
			filters = {},
			has_filters = false,
			collection;

		if (type === null) {
			this.innerHTML = 'ERROR: No type specified';
			return;
		}

		collection = window.CMS.getCollection(type);
		if (collection === null) {
			CMS.log.Warn('cms-pagelist', 'Collection ' + collection + ' not located in CMS');
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
