---
title: Site Configuration
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

**Host** (Server and Client)

Set this to the host of the site, this is used to generate URLs for the site.

```php
'host' => 'https://localhost'
```

---

**webpath** (Server and Client)

Set this to the web path to use for the URL,
for example, if your site is located in https://domain.tld/cms/
your webpath should be '/cms/'
NOTE, a trailing slash is REQUIRED.

```php
'webpath' => '/'
```

---

**defaultView** (Server and Client)

The URL that will be the default view that will initially load

* 'posts' -- Set default view to `/posts.html`
* 'pages/home' -- Set default view to `/pages/home.html`

```php
'defaultView' => 'posts'
```

---

**Theme** (Server only)

Set the theme to use for the site, this is the name of the directory within the `themes` directory.

```php
'theme' => 'default'
```

---

**Debug Mode** (Server and Client)

Set to true to enable debug logging, (will enable logging events to the console)

```php
'debug' => false
```

---

**Email** (Server only)

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

**Forms** (Server only)

Set the forms configuration for the site, this is used for processing forms on the site.

(@todo finish)
