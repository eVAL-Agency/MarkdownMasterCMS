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

		this._attached = false;

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
		this._attached = true;
		this.render();
	}

	disconnectedCallback() {
		this._attached = false;
	}

	/**
	 * Called when an observed attribute changes.
	 */
	static get observedAttributes() {
		return ['icon', 'href'];
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
		if (!this._attached) {
			return;
		}

		let icon = this.getAttribute('icon'),
			href = this.getAttribute('href'),
			handler = 'fontawesome';

		if (!icon && href) {
			// Allow an HREF to be set to automatically generate an icon based on the URL.
			// This will render a youtube icon for a Youtube link, Discord for Discord, etc.

			// Default if not available
			icon = 'external-link';
			let icon_map = {
				'https://amzn.to': 'amazon',
				'https://www.amazon.com': 'amazon',
				'https://amazon.com': 'amazon',
				'https://discord.gg': 'discord',
				'https://github.com': 'github',
				'https://gitlab.com': 'gitlab',
				'https://www.instagram.com': 'instagram',
				'https://www.linkedin.com': 'linkedin',
				'https://www.youtube.com': 'youtube',
				'https://en.wikipedia.org': 'wikipedia',
			};
			for (let key in icon_map) {
				if (href.startsWith(key)) {
					icon = icon_map[key];
					break;
				}
			}
		}

		if (!icon) {
			return;
		}

		// If other icon libraries are available, add support for them.
		// Currently only fontawesome is supported.
		CMS.loadExtra(handler).then(() => {
			fontawesome_icon(this, icon);
		});
	}

	set icon(value) {
		this.setAttribute('icon', value);
	}
	get icon() {
		return this.getAttribute('icon');
	}

	set href(value) {
		this.setAttribute('href', value);
	}
	get href() {
		return this.getAttribute('href');
	}
}

customElements.define('cms-icon', CMSIconElement, {extends: 'i'});
