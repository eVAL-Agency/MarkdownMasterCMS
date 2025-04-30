---
title: Extra - CMS-Form
---



## Initialization

The recommended method to load this functionality is from within the server-side `config.php`,
as this will define both backend functionality and frontend configuration.

```php
return [
    // ...

	// Uncomment to enable forms
	'forms' => [
		'your-form-name' => [
			'fields' => [
			    // ...
			],
			'actions' => [
				// ...
			],
		],
	],
];
```

This will auto-set the client-side initialization with the appropriate parameters.


## Field Configuration

Each field definition should be keyed with the field name and can contain the following fields:

- `type` - The type of field
- `label` - The label to display for the field
- `placeholder` - The placeholder text for the field
- `required` - True/False Whether the field is required
- `value` - Default value when rendering the form
- `options` - An array of options for select and checkbox fields

The keyname of the field should be form-safe, ie: no spaces contained and all lowercase.

Example field definitions:

```php
'fields' => [
    'name' => [
        'label' => 'Your name',
        'required' => true,
        'value' => 'Default Value'
    ],
    'email' => [
        'type' => 'email',
        'required' => true
    ],
    'message' => [
        'type' => 'textarea',
        'required' => true,
        'placeholder' => 'Enter your message here'
    ],
],
```

### Type Parameter

Type defines the input type and associated behaviour.  Valid options:

* `text` - A single line text input
* `email` - An email input, validation check for a valid email address
* `number` - A number input
* `textarea` - A multi-line text input
* `select` - A dropdown select input, use `options` to define options
* `checkbox` - A single checkbox input
* `radio` - A group of radio inputs, use `options` to define options
* `checkboxes` - A group of checkboxes, use `options` to define options
* `hidden` - A hidden input
* `submit` - A submit button, use `value` to set text displayed on the button

### Label Parameter

Renders the label for the field, skipped for `submit` and `hidden` types.

### Placeholder Parameter

Renders the placeholder text for the field for text, email, number, and textarea types.

### Required Parameter

Set to `true` to require the field to be filled in before submission.

### Value Parameter

Sets the default value for the field when rendering the form.
This value can be changed by the user.

For `select` and `radio` types will define the pre-selected option.

### Options Parameter

Sets the available options for `select`, `radio`, and `checkboxes` input types.

```php
'options' => [
    'option1' => 'Option 1',
    'option2' => 'Option 2',
    'option3' => 'Option 3',
],
```

## Action Configuration

Actions set from server configuration are only used on the backend and are not transmitted to the client.

### Test action

Basic test action that will return the received JSON object back to the client.
This is useful in testing a form to ensure you are receiving the fields you expect.

```php
'actions' => [
    [
        'action' => 'test',
    ],
]
```

### Email action

Action to send an email to the specified address.

**Important**: using the email action requires that an email configuration is defined.

```php
'actions' => [
    [
        'action' => 'email',
        'to' => 'recipient@targetdomain.tld',
        'subject' => 'Message Subject', // Optional
        'template' => 'your_template', // Optional
    ],
]
```

#### To Parameter

Optionally the `to` target address can be `field:user_email` (or similar),
to use the field value with the name `user_email` as the target address.

This allows you to send an email to the original submitter of the form, 
(presuming you collect their email in that form).

#### Template Parameter

If a template is specified, a file lookup will be performed for
`themes/{your_theme}/layouts/email/{template_name}.tpl`
to populate the contents of the email.

This is a plain-text template that will use `{{field_name}}` to inject the field values
into the message.  eg:

```text
New message received from {{user_email}}!

{{message}}

---

Received from IP {{ip}} and user agent {{user_agent}}.
```

Each field key from the form is available, as are the following system-defined values:

* form - The name of the form
* ip - The IP address of the user
* user_agent - The user agent string of the browser

If no template is specified, (or the file does not exist), the raw values from the form
will be printed in the email body.


## Required Schema

N/A


## Usage

```html
<cms-form name="contact" success="pages/contact-thanks"></cms-form>
```

Will render the author's profile using the default layout template.

### Attributes

- `name` - The key name of the form to render
- `success` - The page fragment to redirect to on successful submission


## Example Styles

```css
/** <editor-fold desc="CMS Form"> **/

cms-form {
	position: relative;
}
cms-form label {
	display: block;
	margin: 1rem 0 0.25rem;
}
cms-form input[type="text"],
cms-form input[type="email"],
cms-form input[type="password"],
cms-form select,
cms-form textarea {
	width: calc(100% - 1em);
	padding: 0.5em;
	border: 1px solid #ccc;
	border-radius: 0.25em;
}
cms-form input[type="submit"] {
	background-color: var(--color-accent1);
	color: white;
	border: none;
	padding: 0.5em 1em;
	border-radius: 0.25em;
	cursor: pointer;
}
cms-form .cms-form-option label {
	display: inline-block;
	margin: 0.5em 0 0 1em;
}
cms-form .required-note {
	font-size: 0.75rem;
	color: #fd4545;
}
cms-form input.error,
cms-form textarea.error {
	border-color: #fd4545;
	background-color: #ffdbdb;
}
cms-form .error-message {
	color: #a20202;
	transition: transform 0.5s ease;
	transform: scaleY(1);
	transform-origin: top;
	padding-top: 0.5em;
}
cms-form .error-message.hidden {
	transform: scaleY(0);
}

/** </editor-fold> **/
```
