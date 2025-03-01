/**
 * Extra - CMS Icon
 *
 * Simple icon renderer
 *
 * **Initialization**
 *
 * To load this functionality from HTML:
 *
 * ```html
 * <script>
 * CMS.loadExtra('cms-icon');
 * </script>
 * ```
 *
 * or from within `config.js`
 *
 * ```js
 * extras: {
 *   'cms-icon': {}
 * }
 * ```
 *
 * **Quick Usage**
 *
 * ```html
 * <i icon="camera" is="cms-icon"></i>
 * ```
 *
 * Will use the loaded icon library for rendering the actual icons.
 * (Currently only FontAwesome is supported.)
 *
 *
 * @module Extras/CMS-Icon
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
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
