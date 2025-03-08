/**
 * Extra - CMS Tags
 *
 * Provides tag lists and tag clouds for collections.
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
