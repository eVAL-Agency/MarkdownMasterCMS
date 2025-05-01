/**
 * Extra - PrismJS
 *
 * Adds support for Prism.JS syntax highlighting.
 *
 * @module Extras/PrismJS
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://markdownmaster.com/docs/extras/prismjs.html
 * @since 4.0.0
 */

{
	let theme = CMS.config.extra('prismjs', 'theme', 'auto'),
		debug = CMS.config.debug,
		linkLight = document.createElement('link'),
		linkDark = document.createElement('link'),
		script = document.createElement('script');

	linkLight.rel = 'stylesheet';
	linkDark.rel = 'stylesheet';

	linkLight.href = CMS.config.webpath + 'extras/prismjs/css/prismjs-light' + (debug ? '.css' : '.min.css');
	linkDark.href = CMS.config.webpath + 'extras/prismjs/css/prismjs-dark' + (debug ? '.css' : '.min.css');

	if (theme === 'auto') {
		linkDark.media = '(prefers-color-scheme: dark)';
		linkLight.media = '(prefers-color-scheme: light)';
	}

	if (theme === 'auto' || theme === 'dark') {
		document.head.appendChild(linkDark);
	}
	if (theme === 'auto' || theme === 'light') {
		document.head.appendChild(linkLight);
	}

	script.src = CMS.config.webpath + 'extras/prismjs/js/prism' + (debug ? '.js' : '.min.js');
	script.onload = () => {
		document.addEventListener('cms:route', () => {
			if (CMS.config.extra('prismjs', 'lineNumbers', false)) {
				// Enable line numbers, (remove to omit)
				document.body.classList.add('line-numbers');
			}

			// Run the highlighter
			Prism.highlightAllUnder(CMS.config.container);
		});
	}
	document.head.appendChild(script);
}
