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

/**
 * Escapes a string so it can be used inside a regular expression.
 *
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Removes any previously added search highlights, restoring the original text.
 *
 * @param {Element} container
 */
function clearHighlights(container) {
	container.querySelectorAll('mark[data-cms-search]').forEach(mark => {
		mark.replaceWith(document.createTextNode(mark.textContent));
	});
}

/**
 * Wraps text matching the query in <mark> tags inside the rendered content.
 *
 * @param {Element} container
 * @param {string} query
 */
function highlightSearch(container, query) {
	clearHighlights(container);

	const trimmed = (query || '').trim();
	if (trimmed === '') {
		return;
	}

	const regex = new RegExp(escapeRegex(trimmed), 'gi');

	// Browser NodeFilter interfaces expose filterNode(); jsdom exposes
	// acceptNode() instead. Supplying both keeps the walker portable.
	const filterNode = node => {
		const parent = node.parentElement;
		if (parent) {
			// Skip non-content nodes and previously highlighted text
			if (parent.closest('script, style, noscript, mark[data-cms-search]')) {
				return NodeFilter.FILTER_SKIP;
			}
		}
		return NodeFilter.FILTER_ACCEPT;
	};

	const walker = document.createTreeWalker(
		container,
		NodeFilter.SHOW_TEXT,
		{
			filterNode,
			acceptNode: filterNode
		}
	);

	// Collect the text nodes first, then modify the DOM. This avoids
	// skipping nodes while the walker is still in progress.
	const textNodes = [];
	let node;
	while ((node = walker.nextNode()) !== null) {
		textNodes.push(node);
	}

	textNodes.forEach(textNode => {
		const text = textNode.nodeValue;
		const matches = [];
		let match;
		regex.lastIndex = 0;
		while ((match = regex.exec(text)) !== null) {
			matches.push(match);
		}

		if (matches.length === 0) {
			return;
		}

		const fragment = document.createDocumentFragment();
		let lastIndex = 0;

		matches.forEach(match => {
			if (match.index > lastIndex) {
				fragment.appendChild(
					document.createTextNode(text.slice(lastIndex, match.index))
				);
			}
			const markEl = document.createElement('mark');
			markEl.setAttribute('data-cms-search', 'true');
			markEl.textContent = text.slice(match.index, match.index + match[0].length);
			fragment.appendChild(markEl);
			lastIndex = match.index + match[0].length;
		});

		if (lastIndex < text.length) {
			fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
		}

		textNode.parentNode.replaceChild(fragment, textNode);
	});

	// Bring the first highlight into view so the user can find their result.
	const firstMark = container.querySelector('mark[data-cms-search]');
	if (firstMark && typeof firstMark.scrollIntoView === 'function') {
		firstMark.scrollIntoView({ block: 'center' });
	}
}

/**
 * Run a text highlight pass against the currently rendered page.
 *
 * @param {string} query
 */
function searchPage(query) {
	if (!query) {
		return;
	}

	const cms = window.CMS;
	const container = (cms && cms.config.container) || document.body;
	highlightSearch(container, query);
}

document.addEventListener('cms:route', e => {
	if (e.detail.search) {
		searchPage(e.detail.search);
	}
});

// Fallback: on initial page load the cms:route event can dispatch before
// this extra's script has finished loading. Re-run the highlight pass using
// the query still present in the URL.
searchPage(new URLSearchParams(window.location.search).get('s'));
