/**
 * Extra - CMS Icon
 *
 * @module Extras/CMS-Icon
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://markdownmaster.com/docs/extras/cms-icon.html
 * @since 4.0.1
 */

/**
 * Provides `<i is="cms-icon">` tag functionality.
 */
class CMSIconElement extends HTMLElement {

	static observedAttributes = ['icon'];

	constructor() {
		super();

		// If other icon libraries are available, add support for them.
		// Currently only fontawesome is supported.
		let handler = 'fontawesome';

		// Preload the backend handler
		CMS.loadExtra(handler);
	}

	/**
	 * Called when the element is added to the DOM.
	 */
	connectedCallback() {
		this.render();
	}

	/**
	 * Called when an attribute is modified
	 *
	 * @param {string} name
	 * @param {string} oldValue
	 * @param {string} newValue
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		this.render();
	}

	/**
	 * Execute the plugin on a given node to render the requested content inside it
	 */
	render() {
		let icon = this.getAttribute('icon'),
			handler = 'fontawesome';

		if (!icon) {
			return;
		}

		// If other icon libraries are available, add support for them.
		// Currently only fontawesome is supported.
		CMS.loadExtra(handler).then(() => {
			fontawesome_icon(this, icon);
		});
	}
}

customElements.define('cms-icon', CMSIconElement, {extends: 'i'});
