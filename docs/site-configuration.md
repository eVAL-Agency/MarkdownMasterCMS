---
title: Site Configuration
seotitle: Configuring Markdown Master CMS
author: Charlie Powell
tags: [Howto, Configuration]
---

## Web Application Configuration

The bulk of configuration required is performed within `config.js` or `config.php`.

When running the application in server+client mode, configuration should be done
within the PHP file, which will be used to dynamically generate the client config
when viewing the page.  
This is the recommended mode as it preserves support for crawlers and bots.

When running server+client mode, **only config.php is required**.

When running the application in client-only mode, configuration should be done
within the `config.js` file, then load that file in your index.html.


### Configuration Parameters

---

#### Host (Server and Client)

Set this to the host of the site, this is used to generate URLs for the site.

```php
'host' => 'https://localhost'
```

---

#### webpath (Server and Client)

Set this to the web path to use for the URL,
for example, if your site is located in https://domain.tld/cms/
your webpath should be '/cms/'
NOTE, a trailing slash is REQUIRED.

```php
'webpath' => '/'
```

---

#### defaultView (Server and Client)

The URL that will be the default view that will initially load

* 'posts' -- Set default view to `/posts.html`
* 'pages/home' -- Set default view to `/pages/home.html`

```php
'defaultView' => 'posts'
```

---

#### extras (Server and Client)

List of extras (plugins) to load for the site.

```php
'extras' => [
    'cms-pagelist' => [],
    'active-nav' => [
        'navSelector' => 'nav li',
        'navActiveClass' => 'active',
    ],
],
```

Plugins that do not require any configuration, (or none set), can be defined with an empty array.

Refer to the specific plugin for its specific configuration options.
These options are shared by both server and client.

---

#### Theme (Server only)

Set the theme to use for the site, this is the name of the directory within the `themes` directory.

```php
'theme' => 'default'
```

---

#### Debug Mode (Server and Client)

Set to true to enable debug logging, (will enable logging events to the console)

```php
'debug' => false
```

---

#### Email (Server only)

Set the email configuration for the site, this is used for sending emails from the site.

If your site does not send emails, you can leave this blank.

Syntax of the DNS must be: `smtp://username:password@host`

```php
'email' => [
    'from' => 'contact@yourdomain.tld',
    'fromName' => 'Your Name',
    'dsn' => 'smtp://contact@yourdomain.tld:password@mail.yourdomain.tld',
],
```

---

#### Forms (Server and partially client)

Set the forms configuration for the site, this is used for processing forms on the site.

The `actions` key in each form configuration is utilized by the backend
and never transmitted to the client, but field definitions are shared between
server and client configuration.

```php
'forms' => [
    'contact' => [
        'fields' => [
            'name' => [
                'type' => 'text',
                'required' => true,
            ],
            'email' => [
                'type' => 'email',
                'required' => true,
            ],
            'message' => [
                'type' => 'textarea',
                'required' => true,
            ],
        ],
        'actions' => [
            'email' => [
                'to' => 'you@yourdomain.com',
            ],
        ],
    ],
],
```

In this example, a form named `contact` is defined
with the fields `name`, `email`, and `message` with an action to email the form data.

**All field properties** (shared with client):

* `type` -- The type of field, can be `text`, `email`, `textarea`
* `required` -- Set to true if the field is required
* `label` -- The label to display for the field
* `placeholder` -- The placeholder text for the field


**Supported actions** (only used on server):

* `email` -- Send an email with the form data
* `test` -- Test handler to return the form data as a JSON object

**Email options:**

* `to` -- The email address to send the form data to
* `subject` -- The subject of the email
* `template` -- The template to use for the email

If a template is requested, it uses `layouts/email-{templatename}.tpl` to render the data.
Else, (or if the template is not found) it will render the data as plain text.

**Test options:**

No options; just useful for debugging
