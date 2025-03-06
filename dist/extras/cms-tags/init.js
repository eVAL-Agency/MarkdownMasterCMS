/**
 * Extra - CMS Tags
 *
 * Provides tag lists and tag clouds for collections.
 *
 * **Initialization**
 *
 * To load this functionality from HTML:
 *
 * ```html
 * <script>
 * CMS.loadExtra('cms-tags');
 * </script>
 * ```
 *
 * or from within `config.js`
 *
 * ```js
 * extras: {
 *   'cms-tags': {}
 * }
 * ```
 *
 * **Quick Usage**
 *
 * ```html
 * <cms-tags type="posts" file="<%= data.permalink %>"></cms-tags>
 * ```
 *
 * **Attributes**
 *
 * - `type` - The type of collection to pull tags from
 * - `file` - The specific file to pull tags from (permalink of the file)
 * - `as` - The style of tag list to render (default, cloud)
 * - `sort` - The sort order to use for the tags
 *
 * @module Extras/CMS-Tags
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://markdownmaster.com/docs/extras/cms-tags.html
 * @since 5.0.0
 */

/**
 * Provides `<cms-tags>` tag functionality.
 */
class CMSTagsElement extends HTMLElement {
	constructor() {
		// Always call super first in constructor
		super();
	}

	/**
	 * Called when the element is added to the DOM.
	 */
	connectedCallback() {
		// Element is now connected to the DOM
		this.render();
	}

	render() {
		let type = this.getAttribute('type'),
			file = this.getAttribute('file'),
			as = this.getAttribute('as') ?? 'default',
			sort = this.getAttribute('sort') ?? 'name',
			tags,
			collection = window.CMS.getCollection(type);

		if (file) {
			// Request tags for a specific file
			tags = collection.getFileByPermalink(file).getTags(sort);
		}
		else {
			tags = collection.getTags(sort);
		}

		tags.forEach(tag => {
			let a = document.createElement('a'),
				label = tag.name;

			a.classList.add('tag');
			if (as === 'cloud') {
				a.classList.add('tag-weight-' + tag.weight);
				label += ' (' + tag.count + ')';
			}
			a.href = tag.url;
			a.innerHTML = label;
			this.appendChild(a);
		});
	}
}

customElements.define('cms-tags', CMSTagsElement);
