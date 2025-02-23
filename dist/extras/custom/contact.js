document.addEventListener('cms:route', event => {
	let form = document.getElementById('contact-form');

	if (form) {
		form.querySelector('input[name="name"]').addEventListener('keyup', e => {
			if (e.target.value.trim() !== '') {
				e.target.classList.remove('error');
			}
		});
		form.querySelector('input[name="email"]').addEventListener('keyup', e => {
			if (e.target.value.trim() !== '') {
				e.target.classList.remove('error');
			}
		});
		form.querySelector('textarea[name="message"]').addEventListener('keyup', e => {
			if (e.target.value.trim() !== '') {
				e.target.classList.remove('error');
			}
		});
		form.addEventListener('submit', e => {
			e.preventDefault();

			let name = form.querySelector('input[name="name"]'),
				email = form.querySelector('input[name="email"]'),
				channel = form.querySelector('input[name="channel"]'),
				message = form.querySelector('textarea[name="message"]'),
				submitBtn = form.querySelector('input[type="submit"]'),
				prevSubmitText = submitBtn.value,
				emailValidation = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

			if (name.value.trim() === '') {
				name.classList.add('error');
				name.focus();
				return;
			}

			if (email.value.trim() === '') {
				email.classList.add('error');
				email.focus();
				return;
			}

			if (!emailValidation.test(email.value.trim())) {
				email.classList.add('error');
				email.focus();
				return;
			}

			if (message.value.trim() === '') {
				message.classList.add('error');
				message.focus();
				return;
			}

			submitBtn.disabled = true;
			submitBtn.value = 'Sending...';

			fetch('/form', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: name.value.trim(),
					email: email.value.trim(),
					channel: channel.value.trim(),
					message: message.value.trim(),
					form: 'contact'
				})
			})
				.then(response => {
					if (!response.ok) {
						throw new Error('Error sending message');
					}

					CMS.historyPushState('/pages/contact-success.html');
				})
				.catch(error => {
					submitBtn.disabled = false;
					submitBtn.value = prevSubmitText;
					console.error(error);
					alert('There was an error sending your message. Please try again later.');
				});
		});
	}
});