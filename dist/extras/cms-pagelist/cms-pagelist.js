/**
 * Extra - CMS Pagelist
 *
 * Provide a block of content from a collection, eg: a list of blog posts or a list of authors.
 *
 * @module Extras/CMS-Pagelist
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://markdownmaster.com/docs/extras/cms-pagelist.html
 * @since 3.0.0
 */

/**
 * Provides `<cms-pagelist>` tag functionality.
 */
class CMSPagelistElement extends HTMLElement {
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
	 * Execute the plugin on a given node to render the requested content inside it
	 */
	render() {
		let type = this.getAttribute('type'),
			layout = this.getAttribute('layout'),
			sort = this.getAttribute('sort'),
			limit = this.getAttribute('limit'),
			related = this.getAttribute('related'),
			filters = {},
			has_filters = false,
			collection;

		if (related !== null) {
			// Support related articles
			let post, paths, tags;
			if (related === 'this') {
				paths = CMS.getPathsFromURL();
			}
			else {
				// Allow user to define which page to retrieve related articles from
				paths = CMS.getPathsFromURL(related);
			}

			if (paths.length >= 2) {
				has_filters = true;
				// Assign the type based on the related reference page
				type = paths[0];
				collection = CMS.getCollection(type);
				if (collection === null) {
					CMS.log.Error('cms-pagelist', 'Collection ' + type + ' not located in CMS');
					this.parentElement.removeChild(this);
					return;
				}
				post = collection.getFileByPermalink(paths.join('/'));

				// Omit the original page
				filters['permalink'] = '!= ' + post.permalink;

				// Retrieve related posts by tags
				tags = post.tags || [];
				if (tags.length > 0) {
					filters['tags'] = tags;
				}
				else {
					CMS.log.Warn('cms-pagelist', 'No tags found for related articles');
				}
			}
			else {
				CMS.log.Error('cms-pagelist', 'Invalid path for related attribute');
				this.parentElement.removeChild(this);
				return;
			}
		}


		if (type === null) {
			this.innerHTML = 'ERROR: No type specified';
			return;
		}

		collection = window.CMS.getCollectionClone(type);
		if (collection === null) {
			CMS.log.Error('cms-pagelist', 'Collection ' + collection + ' not located in CMS');
			this.parentElement.removeChild(this);
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
