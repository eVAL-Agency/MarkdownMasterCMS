/**
 * MarkdownMaster CMS
 *
 * The MIT License (MIT)
 * Copyright (c) 2025 eVAL Agency
 * https://github.com/eVAL-Agency/MarkdownMasterCMS
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Add a class to navigation elements that match the page URL.
 */
document.addEventListener('cms:route', e => {
	let navSelector = CMS.config.extra('active-nav', 'navSelector'),
		navActiveClass = CMS.config.extra('active-nav', 'navActiveClass', 'active');

	if (!navSelector) {
		console.warn('No "navSelector" defined for the "active-nav" plugin.');
		return;
	}

	let elMatches = function(el) {
		if (el.href === window.location.href) {
			return true;
		}

		if (Object.hasOwn(el.dataset, 'matches')) {
			// Also check the regex of the "data-matches" attribute
			let regex = new RegExp(el.dataset.matches);
			if (regex.test(window.location.href)) {
				return true;
			}
		}

		return false;
	}

	document.querySelectorAll(navSelector).forEach(nav => {

		if (nav.classList.contains(navActiveClass)) {
			nav.classList.remove(navActiveClass);
		}

		if (nav.nodeName !== 'A') {
			// Find the first 'a' tag within to check the URL instead.
			let link = nav.querySelector('a');
			if (link && elMatches(link)) {
				nav.classList.add(navActiveClass);
			}
		}
		else if(elMatches(nav)) {
			nav.classList.add(navActiveClass);
		}
	});
});
