/**
 * Add the necessary tags for safely handling external links.
 */
document.addEventListener('cms:route', () => {

	// Run this after a short delay to allow other plugins to add links as necessary.
	setTimeout(() => {
		let local = CMS.config.extra('external-links', 'local', [window.location.host]),
			icons = CMS.config.extra('external-links', 'icons', false);

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

				if (icons && !el.querySelector('i')) {
					let icon = 'external-link';
					let icon_map = {
						'https://amzn.to': 'amazon',
						'https://www.amazon.com': 'amazon',
						'https://amazon.com': 'amazon',
						'https://discord.gg': 'discord',
						'https://github.com': 'github',
						'https://gitlab.com': 'gitlab',
						'https://en.wikipedia.org': 'wikipedia',
					};
					for (let key in icon_map) {
						if (el.href.startsWith(key)) {
							icon = icon_map[key];
							break;
						}
					}

					if (icon) {
						let iconEl = document.createElement('i', {is: 'cms-icon'});
						iconEl.setAttribute('part', 'icon');
						iconEl.setAttribute('icon', icon);
						iconEl.classList.add('inline-icon');
						iconEl.title = icon;
						el.appendChild(iconEl);
					}
				}
			}
		});
	}, 500);
});