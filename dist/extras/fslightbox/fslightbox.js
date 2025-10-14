// Check to see if the library needs to be loaded
if (typeof refreshFsLightbox !== 'function') {
	let script = document.createElement('script');
	script.src = CMS.config.webpath + 'extras/fslightbox/lib/fslightbox.js';
	document.head.appendChild(script);
}

// Add events on page load to refresh the lightbox
document.addEventListener('cms:route', () => {
	if (typeof refreshFsLightbox === 'function') {
		refreshFsLightbox();
	}
});