/**
 * Extra - CMS Form
 *
 * Render a form using the form configuration
 *
 * **Initialization**
 *
 * To load this functionality from HTML:
 *
 * ```html
 * <script>
 * CMS.loadExtra('cms-form', {...form configuration parameters...});
 * </script>
 * ```
 *
 * or from within `config.js`
 *
 * ```js
 * extras: {
 *   'cms-form': {...form configuration parameters...}
 * }
 * ```
 *
 * **Configuration**
 *
 * When running in server mode, the configuration can be pulled automatically from the server-side configuration.
 *
 * ```json
 * {
 *     "name-of-form": {
 *         "fields": {
 *             "field-name": { ...field-definition... },
 *             ...
 *         },
 *     },
 * }
 * ```
 *
 * Each field definition should be keyed with the field name and can contain the following fields:
 *
 * - `label` - The label to display for the field
 * - `type` - The type of field (text, email, textarea)
 * - `placeholder` - The placeholder text for the field
 * - `required` - True/False Whether the field is required
 *
 * Actions set from server configuration are only used on the backend and are not transmitted to the client.
 *
 *
 * **Quick Usage**
 *
 * ```html
 * <cms-form name="contact" success="pages/contact-thanks"></cms-form>
 * ```
 *
 * Will render the author's profile using the default layout template.
 *
 * **Attributes**
 *
 * - `name` - The key name of the form to render
 * - `success` - The page fragment to redirect to on successful submission
 *
 *
 * @module Extras/CMS-Form
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
 * @since 5.0.0
 */

/**
 * Provides `<cms-form>` tag functionality.
 */
class CMSFormElement extends HTMLElement {

	constructor() {
		// Always call super first in constructor
		super();
		this.form = null;
		this.submitBtn = null;
		this.emailValidation = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
	}

	/**
	 * Called when the element is added to the DOM.
	 */
	connectedCallback() {
		// Element is now connected to the DOM
		this.render();
	}

	/**
	 * Render this element into the DOM
	 */
	render() {

		let name = this.getAttribute('name'),
			successPage = this.getAttribute('success'),
			formData = CMS.config.extra('cms-form', name);

		if (!formData) {
			this.innerHTML = 'No form with name ' + name + ' configured.';
			console.error(`Form with name '${name}' not found.`);
			return;
		}

		this.form = document.createElement('form');
		this.form.setAttribute('method', 'POST');
		this.form.setAttribute('action', CMS.config.webpath + 'form');

		let input = document.createElement('input');
		input.setAttribute('type', 'hidden');
		input.setAttribute('name', 'form');
		input.setAttribute('value', name);
		this.form.appendChild(input);

		Object.keys(formData.fields).forEach(key => {
			let field = formData.fields[key],
				label = document.createElement('label'),
				error = document.createElement('div'),
				input;

			label.innerHTML = field.label ?? key;
			label.setAttribute('for', [name, key].join('-'));
			if (field.required) {
				label.innerHTML += ' <span class="required-note">*</span>';
			}

			if (field.type === 'textarea') {
				input = document.createElement('textarea');
			}
			else {
				input = document.createElement('input');
				input.setAttribute('type', field.type ?? 'text');
			}

			// Set client-side validation checks
			if (field.type === 'email') {
				input.addEventListener('blur', this.emailValidateEvent.bind(this));
			}
			else {
				input.addEventListener('blur', this.genericValidateEvent.bind(this));
			}

			input.setAttribute('id', [name, key].join('-'));
			input.setAttribute('name', key);
			input.setAttribute('placeholder', field.placeholder ?? '');
			if (field.required) {
				input.setAttribute('required', 'required');
			}

			error.setAttribute('id', [name, key, 'error'].join('-'));
			error.setAttribute('class', 'error-message hidden');

			this.form.appendChild(label);
			this.form.appendChild(input);
			this.form.appendChild(error);
		});

		this.submitBtn = document.createElement('input');
		this.submitBtn.setAttribute('type', 'submit');
		this.submitBtn.setAttribute('value', 'Submit');
		this.form.appendChild(this.submitBtn);

		this.form.addEventListener('submit', this.formSubmitEvent.bind(this));

		this.appendChild(this.form);
	}

	/**
	 * Validate an email field
	 *
	 * @param {FocusEvent} e
	 */
	emailValidateEvent(e) {
		console.log(e);
		let error = document.getElementById(e.target.id + '-error');

		if (e.target.value.trim() !== '') {
			// Input has a value; try to perform basic validation against it

			if (this.emailValidation.test(e.target.value.trim())) {
				e.target.classList.remove('error');
				if (error) {
					error.innerHTML = '';
					error.classList.add('hidden');
				}
			}
			else {
				e.target.classList.add('error');
				if (error) {
					error.innerHTML = 'Email does not appear to be valid';
					error.classList.remove('hidden');
				}
			}
		}
		else {
			// No value set
			if (e.target.required) {
				e.target.classList.add('error');
				if (error) {
					error.innerHTML = 'Field is required';
					error.classList.remove('hidden');
				}
			}
		}
	}

	/**
	 * Validate a generic text field
	 *
	 * @param {FocusEvent} e
	 */
	genericValidateEvent(e) {
		let error = document.getElementById(e.target.id + '-error');

		if (e.target.value.trim() !== '') {
			// Input has a value; no validation available for generic fields

			e.target.classList.remove('error');
			if (error) {
				error.innerHTML = '';
				error.classList.add('hidden');
			}
		}
		else {
			// No value set
			if (e.target.required) {
				e.target.classList.add('error');
				if (error) {
					error.innerHTML = 'Field is required';
					error.classList.remove('hidden');
				}
			}
		}
	}

	/**
	 * Handle form submission via an XHR request
	 *
	 * @param {SubmitEvent} e
	 */
	formSubmitEvent(e) {
		let prevSubmitText = this.submitBtn.value;

		e.preventDefault();

		this.submitBtn.disabled = true;
		this.submitBtn.value = 'Sending...';

		fetch(this.form.action, {
			method: this.form.method,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(Object.fromEntries(new FormData(this.form)))
		})
			.then(response => {
				// Grab JSON result of submission
				return response.json();
			})
			.then(response => {
				if (!response.success) {
					let errors = response.errors,
						focused = false;

					if (!errors) {
						console.error(response);
						throw new Error('Invalid or unexpected response received from backend');
					}

					Object.keys(errors).forEach(key => {
						let error = document.getElementById([this.getAttribute('name'), key, 'error'].join('-')),
							input = document.getElementById([this.getAttribute('name'), key].join('-'));

						error.innerHTML = errors[key];
						error.classList.remove('hidden');
						input.classList.add('error');
						if (!focused) {
							// Switch focus to the first discovered error
							input.focus();
							focused = true;
						}
					});

					this.submitBtn.disabled = false;
					this.submitBtn.value = prevSubmitText;
				}
				else {
					CMS.log.Debug('Extra/cms-form', 'Received successful response from form handler', response);
					CMS.historyPushState(CMS.config.webpath + this.getAttribute('success') + '.html');
				}
			})
			.catch(error => {
				this.submitBtn.disabled = false;
				this.submitBtn.value = prevSubmitText;
				console.error(error);
				alert('There was an error sending your message. Please try again later.');
			});
	}
}

customElements.define('cms-form', CMSFormElement);
