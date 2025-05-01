/**
 * Extra - CMS Search
 *
 * Provides search input functionality that hooks into the site
 *
 * @module Extras/CMS-Search
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://markdownmaster.com/docs/extras/cms-search.html
 * @since 3.0.0
 */

/**
 * Provides `<input is="cms-search">` tag functionality.
 */
class CMSSearchElement extends HTMLInputElement {

	constructor() {
		super();

		this.addEventListener('keyup', e => {
			if (e.key === 'Enter') {
				this.search();
				e.preventDefault();
			}
		});

		// Enable support to preserve the search query
		let u = new URLSearchParams(window.location.search);
		if (u.has('s')) {
			this.value = u.get('s');
		}
	}

	search() {
		if (Object.hasOwn(window, 'CMS') && window.CMS != null) {
			// Only run once the CMS is loaded
			window.CMS.search(this.dataset.type, this.value);
		}
	}
}

customElements.define('cms-search', CMSSearchElement, { extends: 'input' });
