/**
 * Extra - CMS Pagination
 *
 * Provides a configurable pagination component for collections.
 *
 * @module Extras/CMS-Pagination
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://markdownmaster.com/docs/extras/cms-pagination.html
 * @since 6.0.0
 */

/**
 * Provides `<cms-pagination>` tag functionality.
 */
class CMSPaginationElement extends HTMLElement {
	/**
	 * Constructor for the pagination element.
	 */
	constructor() {
		super();
	}

	/**
	 * Called when the element is added to the DOM.
	 */
	connectedCallback() {
		this.render();
	}

	/**
	 * Get if an attribute has a truthy value assigned.
	 *
	 * @param {string} name
	 * @param {boolean} defaultValue
	 * @returns {boolean}
	 * @private
	 */
	_getBoolAttribute(name, defaultValue) {
		defaultValue = defaultValue || false;

		let val = this.getAttribute(name) ?? (defaultValue ? '1' : '0');
		val = val.toLowerCase();

		return val === 'true' || val === '1';
	}

	/**
	 * Get the int value of an attribute.
	 *
	 * @param {string} name
	 * @param {number} defaultValue
	 * @returns {number}
	 * @private
	 */
	_getIntAttribute(name, defaultValue) {
		defaultValue = defaultValue || 0;

		return parseInt(this.getAttribute(name) ?? defaultValue);
	}

	/**
	 * Get the string value of an attribute.
	 *
	 * @param {string} name
	 * @param {string} defaultValue
	 * @returns {string}
	 * @private
	 */
	_getStrAttribute(name, defaultValue) {
		defaultValue = defaultValue || '';
		return this.getAttribute(name) ?? defaultValue;
	}

	/**
	 * Render the pagination based on configuration attributes.
	 */
	render() {
		let showFirst = this._getBoolAttribute('show-first', true),
			showLast = this._getBoolAttribute('show-last', true),
			adjacentPages = this._getIntAttribute('adjacent-pages', 2),
			ellipsis = this._getStrAttribute('ellipsis', '...');

		// Clear any current entries
		this.innerHTML = '';

		// Validate environment
		if (!CMS.currentPage) {
			this.innerHTML = 'ERROR: CMS not initialized';
			return;
		}

		// Validate type attribute
		if (!CMS.currentPage.type) {
			this.innerHTML = 'ERROR: No type specified';
			return;
		}

		// Check if pagination is enabled (has multiple pages)
		if (!CMS.currentPage.totalPages || CMS.currentPage.totalPages < 2) {
			// No pagination needed, show empty or current page only
			this.innerHTML = '';
			return;
		}

		let currentPage = CMS.currentPage.currentPage,
			totalPages = CMS.currentPage.totalPages,
			pageNumbers = [];

		// Calculate which pages to show based on adjacent-pages setting
		let startPage = Math.max(1, currentPage - adjacentPages);
		let endPage = Math.min(totalPages, currentPage + adjacentPages);

		if (startPage > 1 && showFirst) {
			pageNumbers.push(1);
		}

		for (let i = startPage; i <= endPage; i++) {
			pageNumbers.push(i);
		}

		if (endPage < totalPages && showLast) {
			pageNumbers.push(totalPages);
		}

		// Render the pagination
		let lastPage = 0;
		pageNumbers.forEach(pageNumber => {
			if (lastPage + 1 !== pageNumber && ellipsis !== '' && lastPage > 0) {
				let sep = document.createElement('span');
				sep.classList.add('sep');
				sep.innerHTML = ellipsis;
				this.appendChild(sep);
			}
			lastPage = pageNumber;

			let button = document.createElement('a');
			button.href = CMS.currentPage.getPageUrl(pageNumber);
			button.title = `Page ${pageNumber} of ${totalPages}`;
			button.innerHTML = `${pageNumber}`;
			button.classList.add('button');
			if (currentPage === pageNumber) {
				button.classList.add('active');
			}
			this.appendChild(button);
		});
	}
}

customElements.define('cms-pagination', CMSPaginationElement);
