/**
 * Extra - CMS Theme Selection
 *
 * Provides functionality for user-selectable themes, (light/dark).
 *
 * @module Extras/CMS-Theme-Selector
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://markdownmaster.com/docs/extras/cms-theme-selector.html
 * @since 5.0.2
 */

/**
 * Provides `<cms-theme-selector>` tag functionality.
 */
class CMSThemeSelectorElement extends HTMLElement {
	constructor() {
		// Always call super first in constructor
		super();
	}

	/**
	 * Called when the element is added to the DOM.
	 */
	connectedCallback() {
		this.addEventListener('click', e => {
			let target = null;

			if (e.target.dataset.theme) {
				target = e.target;
			}
			else {
				target = e.target.closest('[data-theme]');
			}

			if (target) {
				let theme = target.dataset.theme;
				CMSThemeSelectorElement.UpdateTheme(theme);
				localStorage.setItem('cms-theme', theme);
				e.preventDefault();
			}
		});
	}

	static UpdateTheme(theme) {
		document.querySelectorAll('link[media]').forEach(link => {
			if (link.media.includes('prefers-color-scheme') && !link.dataset.originalTheme) {
				// Not set yet, but contains prefers-color-scheme,
				// Assign the default value to the dataset for future use.
				let re = new RegExp(/.*:[ ]?([a-z]*)\)/);
				link.dataset.originalTheme = re.exec(link.media)[1];
			}

			if (link.dataset.originalTheme) {
				if (link.dataset.originalTheme === theme) {
					link.media = 'all';
					link.disabled = false;
				}
				else {
					link.media = 'none';
					link.disabled = true;
				}
			}
		});
	}
}

customElements.define('cms-theme-selector', CMSThemeSelectorElement);

// Initial load (check saved setting)
if (localStorage.getItem('cms-theme')) {
	CMSThemeSelectorElement.UpdateTheme(localStorage.getItem('cms-theme'));
}