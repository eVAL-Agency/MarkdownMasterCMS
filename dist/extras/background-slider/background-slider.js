/**
 * Extra - Background Slider
 *
 * Render child elements with the `.item` class inside the container as slider components.
 * Works by cycling through the children of the element, marking as `.active` one at a time.
 *
 * @module Extras/Background-Slider
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://markdownmaster.com/docs/extras/background-slider.html
 * @since 4.0.0
 */

/**
 * Provides `<background-slider>` tag functionality.
 */
class BackgroundSlider extends HTMLElement {
	constructor() {
		super();

		this.timer = null;
		this.index = 0;
		this.slides = null;
		this.timeoutTime = null;
	}

	connectedCallback() {
		this.render();
	}

	disconnectedCallback() {
		if (this.timer) {
			clearTimeout(this.timer);
		}
	}

	_addItem(definition) {
		let src = definition.src ?? '';

		if (src.endsWith('.webm') || src.endsWith('.mp4')) {
			let el = document.createElement('video'),
				ext = src.replace(/.*\.([^.]*)$/, '$1'),
				subel = document.createElement('source');
			el.classList.add('item');
			el.muted = true;
			el.playsInline = true;
			subel.src = src;
			subel.type = `video/${ext}`;
			el.appendChild(subel);
			this.appendChild(el);
		}
		else if(
			src.endsWith('.jpg') ||
			src.endsWith('.jpeg') ||
			src.endsWith('.png') ||
			src.endsWith('.gif') ||
			src.endsWith('.webp') ||
			src.endsWith('.svg')
		) {
			let el = document.createElement('img');
			el.classList.add('item');
			el.src = src;
			el.alt = definition.alt ?? 'background image';
			this.appendChild(el);
		}
		else {
			let el = document.createElement('div');
			el.classList.add('item');
			el.innerHTML = definition;
			this.appendChild(el);
		}
	}

	render() {
		let type = this.getAttribute('type') ?? null,
			file = this.getAttribute('file') ?? null,
			tag = this.getAttribute('tag') ?? null;

		if (type && file && tag) {
			// Allow the list to be generated dynamically from a CMS lookup.
			let collection = CMS.getCollection(type);
			if (!collection) {
				CMS.log.Error('Extras/Background-Slider', `Collection '${type}' not found.`);
			}
			else {
				let item = collection.getFileByPermalink(file);
				if (!item) {
					CMS.log.Error('Extras/Background-Slider', `File '${file}' not found in collection '${type}'.`);
				}
				else {
					let items = item.getMeta(tag);
					if (items) {
						items.forEach(item => {
							this._addItem(item);
						});
					}
				}
			}
		}

		this.slides = this.querySelectorAll('.item');
		this.timeoutTime = this.getAttribute('timeout') || 10000;

		if(this.slides.length >= 1) {
			// At least one image, mark the first as active and clear any previous timeout
			this.index = -1;
			this.nextSlide();
		}

		if(this.slides.length > 1) {
			// Videos use their play/stop events to control the slider.
			this.slides.forEach(el => {
				if(el.tagName === 'VIDEO') {
					el.addEventListener('ended', () => {
						this.nextSlide();
					});
				}
			});
		}
		else if(this.slides.length === 1 && this.slides[0].tagName === 'VIDEO') {
			// Only one slide and it's a video; it should loop, (which the browser can handle)
			this.slides[0].loop = true;
		}
	}

	nextSlide() {
		if (this.index >= 0) {
			this.slides[this.index].classList.remove('active');
		}

		this.index++;
		if(this.index >= this.slides.length) {
			this.index = 0;
		}
		this.slides[this.index].classList.add('active');
		if (this.slides[this.index].tagName === 'VIDEO') {
			this.slides[this.index].currentTime = 0;
			this.slides[this.index].play();
		}
		else {
			// Images should only display for a set amount of time
			if(this.slides.length > 1) {
				this.timer = setTimeout(() => {
					this.nextSlide();
				}, this.timeoutTime);
			}
		}
	}
}

customElements.define('background-slider', BackgroundSlider);
