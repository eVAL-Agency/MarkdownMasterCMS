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
			limit = this.getAttribute('limit') ?? null,
			tags,
			tagsAreBlocks = false,
			collection = window.CMS.getCollection(type);

		if (file) {
			// Request tags for a specific file
			tags = collection.getFileByPermalink(file).getTags(sort);
		}
		else {
			tags = collection.getTags(sort);
		}

		// Check to see if this container is one of the blocks-# tags to indicate a block container.
		// If so, add "block" to each tag.
		let cl = this.classList;
		if (
			cl.contains('blocks-2') ||
			cl.contains('blocks-3') ||
			cl.contains('blocks-4') ||
			cl.contains('blocks-5') ||
			cl.contains('blocks-6')
		) {
			tagsAreBlocks = true;
		}


		let counter = 0;
		tags.forEach(tag => {
			counter += 1;
			if (limit && counter > limit) {
				return;
			}

			let a = document.createElement('a'),
				label = '<span class="tag-name">' + tag.name + '</span>';

			a.classList.add('tag');
			if (tagsAreBlocks) {
				a.classList.add('block');
			}

			if (as === 'cloud') {
				a.classList.add('tag-weight-' + tag.weight);
				label += '<span class="tag-weight">' + tag.count + '</span>';
			}
			a.href = tag.url;
			a.innerHTML = label;
			this.appendChild(a);
		});
	}
}

customElements.define('cms-tags', CMSTagsElement);
