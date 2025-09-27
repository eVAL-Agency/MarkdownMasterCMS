/**
 * Extra - Mailerlite
 *
 * Provides functionality for Mailerlite forms.
 *
 * Required because MarkdownMaster acts as a single page app and therefore is incompatible
 * with Mailerlite's default loader.
 *
 * @module Extras/Mailerlite
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://markdownmaster.com/docs/extras/mailerlite.html
 * @since 5.0.3
 */

/**
 * Called immediately upon successful initialization of the CMS
 *
 * @param {CMS}
 */
document.addEventListener('cms:load', () => {
	if (CMS.config.extra('mailerlite', 'account') === null) {
		CMS.log.Error('Extras/Mailerlite', '"account" is not configured for Mailerlite.');
		return;
	}

	const s = document.createElement('script');
	s.async = true;
	s.src = 'https://assets.mailerlite.com/js/universal.js';
	document.head.appendChild(s);
});

/**
 * Called after any page load operation
 *
 * Load any forms that may be present on this page.
 *
 * @param {CMS} event.detail.cms CMS object for reference if needed
 * @param {FileCollection[]|null} event.detail.collection Collection of files to view for listing pages
 * @param {File|null} event.detail.file Single file to view when available
 * @param {string} event.detail.mode Type of view, usually either "list", "single", or error.
 * @param {string} event.detail.search Any search query
 * @param {string} event.detail.tag Any tag selected to view
 * @param {string} event.detail.type Content type selected
 */
document.addEventListener('cms:route', event => {
	let account = CMS.config.extra('mailerlite', 'account');

	if (typeof(window.ml) === 'undefined') {
		// Not loaded yet.
		return;
	}

	document.querySelectorAll('.ml-embedded').forEach(el => {
		if (el.dataset.form) {
			fetch('https://assets.mailerlite.com/jsonp/' + account + '/forms/' + el.dataset.form)
				.then(response => response.text())
				.then(text => JSON.parse(text))
				.then(data => ml.fn.renderEmbeddedForm(data))
				.catch(err => {
					CMS.log.Error('Extras/Mailerlite', 'Could not load form ID ' + el.dataset.form + ': ' + err);
					el.innerHTML = 'Could not load newsletter subscription form';
				});
		}
	});
});