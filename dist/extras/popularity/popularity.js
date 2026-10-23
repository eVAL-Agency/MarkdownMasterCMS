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

