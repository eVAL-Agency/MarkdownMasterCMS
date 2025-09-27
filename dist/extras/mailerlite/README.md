---
title: Extra - MailerLite
---

Adds support for newsletter subscriptions using [MailerLite](https://www.mailerlite.com/).

Features both client-side form support and a server-side API integration for
traditional form submissions.


## Initialization

To load this plugin, add the following to the `extras` block in your
[config.php](https://markdownmaster.com/docs/site-configuration.html) or
theme [settings.php](https://markdownmaster.com/docs/theme-development.html):

```php
'extras' => [
    // ...
    
    'mailerlite' => [
        'account' => 123456789, // Your MailerLite Account ID
    ],
    
    // ...
],
```

The account ID can be located in embedded forms; view a form and scroll down to "Embed form into your website".

The Javascript snippet contains the form ID, example: `ml('account', '1234567');`.


## Form Action Target

This plugin supports a server-side form submission action for forms to subscribe email addresses to.

To enable this, add the following action to your form configuration:

```php
'forms' => [
    'contact' => [
        'fields' => [
            ...
        ],
        'actions' => [
            [
                'action' => 'mailerlite',
                'apiKey' => '... your api key ...',
                'emailField' => 'email',
                'optinField' => 'optin',
            ]
        ],
    ],
],
```

* **apiKey** can be generated in your MailerLite account settings under `Integrations` -> `API`.
* **emailField** is the name of the form field that contains the email address to subscribe.
* **optinField** is the name of the form field that contains a boolean value indicating
  whether the user has opted in to receive emails.  This field is optional, if not provided,
  the user will always be subscribed.


## Adding Embedded Forms

To add an embedded form, ensure the account ID is set in the configuration as described above
and copy the requested form HTML snippet into the location where you'd like it.

**Skip the Javascript snippet!**  The provided snippet is not compatible with Markdown Master
and is not needed, as the plugin will load the required script automatically.
