---
title: Loading MarkdownMaster CMS
---

The core of the MarkdownMaster CMS is a single javascript bundle which can be included
with a simple `<script src="..."></script>` tag in the theme `index.html` template.

For best compatibility and error handling however, it is recommended to use the
more complex syntax for adding the script with necessary `onload` and `onerror` callbacks.

This example assumes the CMS content is rendered in an element with `[@id=cms]`
and a loading frame of `[@id=cms-loading]`.

Also in this example are `{{webpath}}`, `{{version}}`, `{{config}}`, and `{{types}}`.
These are server-side variables injected into the main theme HTML to populate client-side
variables based on server configuration.


```html
<script>
	(function() {
		// Immediately mark the static content as "preloaded" to minimize content flicker
		document.getElementById('cms').classList.add('cms-preload');
		// Show the CMS loading content to provide feedback to the user that something is happening
		document.getElementById('cms-loading').classList.add('show');

		const u="{{webpath}}app/cms.min.js?v={{version}}",
			s=document.createElement('script');
		s.async=true;
		s.src=u;
		
		// On successful load of MarkdownMaster CMS, continue to CMS initialization 
		s.onload = () => {
			// Setup config from server
			CMS.load({{config}});

			// Setup all page types supported by this theme
			CMS.config.addTypes({{types}});

			// Other tasks which need to be performed after the CMS library
			// is available, but before initialization of the platform.

			// Inform the CMS that the configuration is ready.
			CMS.init();
		};
		
		// On error of loading the CMS, revert back to the static version
		s.onerror = () => {
			document.getElementById('cms').classList.remove('cms-preload');
			document.getElementById('cms-loading').classList.remove('show');
		}
		
		// Add the new script to the document
		document.body.appendChild(s);
	})();
</script>
```
