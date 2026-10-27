/**
 * Extra - Popularity
 *
 * No direct functionality within the UI, but issues the request to track page views
 * when the cms:route event is fired.
 *
 * @module Extras/Popularity
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://markdownmaster.com/docs/extras/popularity.html
 * @since 6.0.0
 */

document.addEventListener('cms:route', e => {
	if (e.detail.file && e.detail.collection) {
		fetch(`${CMS.config.webpath}popularity.json`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				't': e.detail.collection.type,
				'p': e.detail.file.permalink
			})
		})
			.then(res => res.text())
			.then(res => CMS.log.Debug('Popularity',  res))
			.catch(err => console.error(err));
	}
});

