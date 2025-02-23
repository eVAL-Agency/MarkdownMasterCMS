class CustomCasestudyVideo extends HTMLElement {
	static observedAttributes = ['poster', 'source', 'type', 'target', 'href', 'label'];
	constructor() {
		// Always call super first in constructor
		super();
	}

	connectedCallback() {
		let poster = this.getAttribute('poster'),
			source = this.getAttribute('source'),
			type = this.getAttribute('type'),
			href = this.getAttribute('href'),
			target = this.getAttribute('target'),
			label = this.getAttribute('label'),
			overlayHasContent = false,
			nodeVideo, nodeSource, nodeOverlay, nodeButton, nodeOverlayContent;

		if (type === null) {
			// Guess type by extension
			if (source.endsWith('.webm')) {
				type = 'video/webm';
			} else if (source.endsWith('.mp4')) {
				type = 'video/mp4';
			} else if (source.endsWith('.ogg')) {
				type = 'video/ogg';
			}
		}

		if (label === null) {
			label = 'See More Info';
		}

		nodeVideo = document.createElement('video');
		nodeVideo.autoplay = true;
		nodeVideo.muted = true;
		nodeVideo.loop = true;
		if (poster !== null) {
			nodeVideo.setAttribute('poster', poster);
		}

		nodeSource = document.createElement('source');
		nodeSource.src = source;
		nodeSource.type = type;
		nodeVideo.appendChild(nodeSource);

		nodeOverlay = document.createElement('div');
		nodeOverlay.classList.add('overlay');
		nodeOverlayContent = document.createElement('div');
		nodeOverlayContent.classList.add('overlay-content');
		if (href !== null) {
			nodeButton = document.createElement('a');
			nodeButton.href = href;
			if (target !== null) {
				nodeButton.target = target;
			}
			nodeButton.innerHTML = label;
			nodeOverlayContent.appendChild(nodeButton);
			overlayHasContent = true;
		}
		if (this.innerHTML.trim() !== '') {
			// Append content in the overlay
			let p = document.createElement('p');
			p.classList.add('content');
			p.innerHTML = this.innerHTML;
			nodeOverlayContent.appendChild(p);
			overlayHasContent = true;
		}

		// Clear any content prior to writing
		this.innerHTML = '';

		this.appendChild(nodeVideo);
		if (overlayHasContent) {
			this.appendChild(nodeOverlay);
			this.appendChild(nodeOverlayContent);
		}
	}
}

customElements.define('custom-casestudy-video', CustomCasestudyVideo);