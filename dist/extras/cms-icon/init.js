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

	constructor() {
		super();

		let icon = this.getAttribute('icon'),
			handler = 'fontawesome';

		// If other icon libraries are available, add support for them.
		// Currently only fontawesome is supported.

		CMS.loadExtra(handler).then(() => {
			fontawesome_icon(this, icon);
		});
	}
}

customElements.define('cms-icon', CMSIconElement, {extends: 'i'});
