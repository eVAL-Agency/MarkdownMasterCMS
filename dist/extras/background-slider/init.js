let interval = null;

function startBackgroundSlides(selector) {
	selector = selector || '.page-backgrounds';

	if(interval) {
		clearTimeout(interval);
	}

	let i = 0,
		container = document.querySelector(selector),
		slides, timeoutTime;

	if(!container) {
		// No container, no slides
		return;
	}
	timeoutTime = container.getAttribute('data-timeout') || 10000;
	slides = container.querySelectorAll('.item');

	function nextSlide() {
		if (i >= 0) {
			slides[i].classList.remove('active');
		}

		i++;
		if(i >= slides.length) {
			i = 0;
		}
		slides[i].classList.add('active');
		if (slides[i].tagName === 'VIDEO') {
			slides[i].currentTime = 0;
			slides[i].play();
		}
		else {
			// Images should only display for a set amount of time
			if(slides.length > 1) {
				interval = setTimeout(() => {
					nextSlide();
				}, timeoutTime);
			}
		}
	}

	if(slides.length >= 1) {
		// At least one image, mark the first as active and clear any previous timeout
		i = -1;
		nextSlide();
	}

	if(slides.length > 1) {
		// Videos use their play/stop events to control the slider.
		slides.forEach(el => {
			if(el.tagName === 'VIDEO') {
				el.addEventListener('ended', () => {
					nextSlide();
				});
			}
		});
	}
}
