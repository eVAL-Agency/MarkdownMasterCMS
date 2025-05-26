/**
 * Add the necessary tags for safely handling external links.
 */
document.addEventListener('cms:route', () => {

	// Run this after a short delay to allow other plugins to add links as necessary.
	setTimeout(() => {
		let prefix = '://' + window.location.host;

		document.querySelectorAll('a').forEach(el => {
			if (el.href.startsWith('http://') || el.href.startsWith('https://')) {
				// Only process http(s) links, (skips mailto:, tel:, etc.)
				if (!(el.href.startsWith('http' + prefix) || el.href.startsWith('https' + prefix))) {
					// Process external links
					if (el.target == '') {
						el.target = '_blank';
					}
					el.rel = 'external noopener noreferrer';

					el.classList.add('external');
				}
			}
		});
	}, 500);
});