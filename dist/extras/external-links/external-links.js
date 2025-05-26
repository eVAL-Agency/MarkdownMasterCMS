/**
 * Add the necessary tags for safely handling external links.
 */
document.addEventListener('cms:route', () => {

	// Run this after a short delay to allow other plugins to add links as necessary.
	setTimeout(() => {
		let local = CMS.config.extra('external-links', 'local', [window.location.host]);

		document.querySelectorAll('a').forEach(el => {
			if (el.href.startsWith('http://') || el.href.startsWith('https://')) {
				// Only process http(s) links, (skips mailto:, tel:, etc.)
				let isLocal = false;

				local.forEach(u => {
					if (el.href.startsWith('https://' + u) || el.href.startsWith('http://' + u)) {
						isLocal = true;
					}
				});

				if (isLocal) {
					return; // Skip local links
				}

				// Process external links
				if (el.target == '') {
					el.target = '_blank';
				}
				el.rel = 'external noopener';

				el.classList.add('external');
			}
		});
	}, 500);
});