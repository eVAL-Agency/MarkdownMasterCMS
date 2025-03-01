/**
 * Extra - Active Navigation
 *
 * Adds a class name to navigation elements that match the page URL.
 *
 * **Initialization**
 *
 * To load this functionality from HTML:
 *
 * ```html
 * <script>
 * CMS.loadExtra('active-nav', {
 *     'navSelector': 'nav li',
 *     'navActiveClass': 'active'
 *   });
 * </script>
 * ```
 *
 * or from within `config.js`
 *
 * ```js
 * extras: {
 *   'active-nav': {
 *     'navSelector': 'nav li',
 *     'navActiveClass': 'active'
 *   }
 * }
 * ```
 *
 * **Configuration**
 *
 * - `navSelector` - The selector to use to find navigation elements to check.
 * - `navActiveClass` - The class name to add to the navigation element when active.
 *
 * @module Extras/ActiveNav
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
 * @since 5.0.0
 */


/**
 * Runs automatically on cms:route events
 *
 * @listens cms:route
 * @name Run
 * @function
 */
document.addEventListener('cms:route', () => {
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
