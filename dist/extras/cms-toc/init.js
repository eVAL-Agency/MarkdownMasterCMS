/**
 * Extra - CMS TOC
 *
 * Generates a table of contents for the current page
 *
 * @module Extras/CMS-TOC
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://markdownmaster.com/docs/extras/cms-toc.html
 * @since 5.0.2
 */

/**
 * Provides `<ul is=cms-toc>` tag functionality.
 */
class CMSTocElement extends HTMLUListElement {
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
		let li = document.createElement('li'),
			a = document.createElement('a');

		a.href = '#';
		a.innerHTML = '(Top)';
		li.classList.add('level-0');
		li.appendChild(a);
		this.appendChild(li);

		document.body.querySelectorAll('h2, h3, h4, h5, h6').forEach((heading) => {
			let li = document.createElement('li'),
				a = document.createElement('a'),
				id = heading.id;

			if (!id) {
				id = heading.innerText.replace(/\s+/g, '-').toLowerCase();
				heading.id = id;
			}

			a.href = '#' + id;
			a.innerHTML = heading.innerText;
			li.classList.add('level-' + (parseInt(heading.tagName.substring(1)) - 2));
			li.appendChild(a);
			this.appendChild(li);
		});
	}
}

customElements.define('cms-toc', CMSTocElement, {extends: 'ul'});
