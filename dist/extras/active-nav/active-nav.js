/**
 * Extra - Active Navigation
 *
 * Adds a class name to navigation elements that match the page URL.
 *
 * @module Extras/ActiveNav
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://markdownmaster.com/docs/extras/active-nav.html
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
		CMS.log.Error('Extras/active-nav', 'No configuration setting "navSelector" defined.');
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
