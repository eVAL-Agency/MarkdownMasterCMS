/**
 * Extra - CMS Form
 *
 * Render a form using the form configuration
 *
 * @module Extras/CMS-Form
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://markdownmaster.com/docs/extras/cms-form.html
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
			formData = CMS.config.extra('cms-form', name),
			submitRendered = false;

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
			let field = formData.fields[key];

			if (field.type === 'hidden') {
				this.form.appendChild(this._generateInput(key, field));
			}
			else if(field.type === 'checkboxes' || field.type === 'radio') {
				this.form.appendChild(this._generateLabel(key, field));
				this._generateInputs(key, field).forEach(el => {
					this.form.appendChild(el);
				})
				this.form.appendChild(this._generateError(key, field));
			}
			else if(field.type === 'submit') {
				submitRendered = true;
				this.submitBtn = this._generateInput(key, field);
				this.form.appendChild(this.submitBtn);
			}
			else {
				this.form.appendChild(this._generateLabel(key, field));
				this.form.appendChild(this._generateInput(key, field));
				this.form.appendChild(this._generateError(key, field));
			}
		});

		if (!submitRendered) {
			// Render a default submit button if none was provided
			this.submitBtn = document.createElement('input');
			this.submitBtn.setAttribute('type', 'submit');
			this.submitBtn.setAttribute('value', 'Submit');
			this.form.appendChild(this.submitBtn);
		}

		this.form.addEventListener('submit', this.formSubmitEvent.bind(this));

		this.appendChild(this.form);
	}

	/**
	 * Calculate the ID for a given field
	 *
	 * @param {string} key
	 * @returns {string}
	 * @private
	 */
	_getFieldId(key) {
		let id = [this.getAttribute('name'), key].join('-');
		// Santize the ID
		id = id.replace(/[^a-zA-Z0-9-_]/g, '_');
		return id;
	}

	/**
	 * Create a <label> element for a given field
	 *
	 * @param {string} key
	 * @param {Object} field
	 * @param {string|null}  field.label
	 * @param {string|null}  field.type
	 * @param {boolean|null} field.required
	 * @param {Object|null}  field.options
	 * @param {string|null}  field.value
	 * @param {string|null}  field.placeholder
	 * @returns {HTMLLabelElement}
	 * @private
	 */
	_generateLabel(key, field) {
		let label = document.createElement('label'),
			fieldId = this._getFieldId(key);

		label.innerHTML = field.label ?? key;
		label.setAttribute('for', fieldId);
		if (field.required) {
			label.innerHTML += ' <span class="required-note">*</span>';
		}

		return label;
	}

	/**
	 * Create an <input> element for a given field
	 *
	 * @param {string} key
	 * @param {Object} field
	 * @param {string|null}  field.label
	 * @param {string|null}  field.type
	 * @param {boolean|null} field.required
	 * @param {Object|null}  field.options
	 * @param {string|null}  field.value
	 * @param {string|null}  field.placeholder
	 * @returns {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement}
	 * @private
	 */
	_generateInput(key, field) {
		let fieldId = this._getFieldId(key),
			input;

		if (field.type === 'textarea') {
			input = document.createElement('textarea');
			if (field.value) {
				input.setAttribute('value', field.value);
			}
		}
		else if (field.type === 'select') {
			input = document.createElement('select');
			Object.keys(field.options).forEach(subkey => {
				let opt = document.createElement('option');
				opt.value = subkey;
				opt.innerHTML = field.options[subkey];
				if ((field.value || '') === subkey) {
					opt.setAttribute('selected', 'selected');
				}
				input.appendChild(opt);
			});
		}
		else {
			input = document.createElement('input');
			input.setAttribute('type', field.type ?? 'text');
			if (field.value) {
				input.setAttribute('value', field.value);
			}
		}

		// Set client-side validation checks
		if (field.type === 'email') {
			input.addEventListener('blur', this.emailValidateEvent.bind(this));
		}
		else {
			input.addEventListener('blur', this.genericValidateEvent.bind(this));
		}

		input.setAttribute('id', fieldId);
		input.setAttribute('name', key);
		if (field.placeholder) {
			input.setAttribute('placeholder', field.placeholder);
		}
		if (field.required) {
			input.setAttribute('required', 'required');
		}

		return input;
	}

	/**
	 * Create multiple <input> and <label> elements for a given field, usually for radio or checkboxes
	 *
	 * @param {string} key
	 * @param {Object} field
	 * @param {string|null}  field.label
	 * @param {string|null}  field.type
	 * @param {boolean|null} field.required
	 * @param {Object|null}  field.options
	 * @param {string|null}  field.value
	 * @param {string|null}  field.placeholder
	 * @returns {list<HTMLInputElement|HTMLLabelElement>}
	 * @private
	 */
	_generateInputs(key, field) {
		let fieldId = this._getFieldId(key),
			optCounter = 0,
			inputs = [];

		Object.keys(field.options).forEach(subkey => {
			let div = document.createElement('div'),
				input = document.createElement('input'),
				label = document.createElement('label');

			optCounter += 1;

			div.className = 'cms-form-option';

			if (field.type === 'checkboxes') {
				input.type = 'checkbox';
				input.setAttribute('name', key + '[]');
				div.classList.add('checkbox');
			}
			else {
				input.type = 'radio';
				input.setAttribute('name', key);
				div.classList.add('radio');
			}
			input.value = subkey;
			input.setAttribute('id', fieldId + '-' + optCounter);

			label.innerHTML = field.options[subkey];
			label.setAttribute('for', fieldId + '-' + optCounter);

			div.appendChild(input);
			div.appendChild(label);

			inputs.push(div);
		});

		return inputs;

		if (field.type === 'textarea') {
			input = document.createElement('textarea');
			if (field.value) {
				input.setAttribute('value', field.value);
			}
		}
		else if (field.type === 'select') {
			input = document.createElement('select');

		}
		else {
			input = document.createElement('input');
			input.setAttribute('type', field.type ?? 'text');
			if (field.value) {
				input.setAttribute('value', field.value);
			}
		}

		// Set client-side validation checks
		if (field.type === 'email') {
			input.addEventListener('blur', this.emailValidateEvent.bind(this));
		}
		else {
			input.addEventListener('blur', this.genericValidateEvent.bind(this));
		}


		if (field.placeholder) {
			input.setAttribute('placeholder', field.placeholder);
		}
		if (field.required) {
			input.setAttribute('required', 'required');
		}

		return input;
	}

	/**
	 * Create an error container <div> element for a given field
	 *
	 * @param {string} key
	 * @param {Object} field
	 * @param {string|null}  field.label
	 * @param {string|null}  field.type
	 * @param {boolean|null} field.required
	 * @param {Object|null}  field.options
	 * @param {string|null}  field.value
	 * @param {string|null}  field.placeholder
	 * @returns {HTMLDivElement}
	 * @private
	 */
	_generateError(key, field) {
		let error = document.createElement('div'),
			fieldId = this._getFieldId(key) + '-error';

		error.setAttribute('id', fieldId);
		error.setAttribute('class', 'error-message hidden');

		return error;
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
					if (this.getAttribute('success')) {
						CMS.historyPushState(CMS.config.webpath + this.getAttribute('success') + '.html');
					}
					else {
						this.submitBtn.disabled = false;
						this.submitBtn.value = prevSubmitText;

						if (response.message) {
							alert(response.message);
						}
						else {
							alert('Form submitted successfully');
						}
					}

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
