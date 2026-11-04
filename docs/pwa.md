---
title: Progressive Web App (PWA)
seotitle: PWA Support in Markdown Master CMS
author: Charlie Powell
tags: [Howto, PWA]
---

Markdown Master CMS ships with service worker support out of the box. With a
small amount of configuration it becomes a fully installable
**Progressive Web App (PWA)** — installable from the browser address bar,
launched in standalone mode, and usable offline.

## Requirements

For the browser to offer an **install prompt**, all of the following must be
true:

* The site is served over **HTTPS** (or from `localhost` during development).
  PWA installability is unavailable on plain HTTP.
* The PHP backend is enabled. The Web App Manifest is generated
  server-side, so client-only / static-only deployments cannot be installed.
  (Offline *caching* still works without PHP, but there is no install prompt.)
* The service worker is enabled (see below).
* The default themes ship some default icons to use with PWA.

## Enabling the Service Worker

In `config.php`, enable the service worker:

```php
// Use the bundled service worker.
'serviceWorker' => true,

// Or point to a custom one:
// 'serviceWorker' => '/path/to/my-serviceworker.js',
```

When enabled, the client registers the worker on page load. The worker
caches same-origin assets, serves the active theme's offline page when the
network is unavailable, and keeps the site usable once the connection drops.

## Web App Manifest

The server exposes a Web App Manifest at `/manifest.json` (resolved
`{webpath}manifest.json`). Each theme ships the `<link rel="manifest">`
reference in its `<head>` automatically:

```html
<link rel="manifest" href="{{webpath}}manifest.json">
```

The manifest values are read from the `"pwa"` configuration block and can be
set at either level:

* **Theme defaults** — `themes/<theme>/settings.php`. Applies to everyone using
  that theme.
* **Root override** — `config.php`. Overrides the theme's values and applies to
  the whole site.

Example `config.php`:

```php
return [
  // ...
  'pwa' => [
    'name'             => 'My Company',
    'short_name'       => 'MyCo',
    'display'          => 'standalone',   // or: "browser", "minimalUI", "inline"
    'theme_color'      => '#1e3a5d',
    'background_color' => '#ffffff',
  ],
];
```

### Manifest fields

| Field             | Description                                                       | Default (theme)     |
|-------------------|-------------------------------------------------------------------|---------------------|
| `name`            | Full site name, shown in the install dialog.                      | Theme default       |
| `short_name`      | Short name, shown on the taskbar / app switcher.                  | Theme default       |
| `display`         | How the app launches: `standalone` (recommended), `browser`, etc. | `standalone`        |
| `theme_color`     | Color of the app's status bar / splash.                           | Theme default       |
| `background_color`| Background behind the app while content loads.                    | Theme default       |
| `icons`           | **Auto-generated.** Points at the theme's icon set.               | —                   |

### Icon set

Icons are defined by the `icons` configuration parameter and may point to images within
the theme or application.

For example, if the theme `basic-blog` ships its `settings.php` theme config with:

```php
<?php
return [
	// ...

	'icons' => [
		'icons/icon.svg',
		'icons/icon-192.png',
		'icons/icon-512.png',
		'icons/icon-maskable-512.png',
	],

];
```

These 4 icons are parsed to:

```json
{
  "icons": [
    {
      "src": "/themes/basic-blog/icons/icon.svg",
      "type": "image/svg+xml",
      "sizes": "any",
      "purpose": "any"
    },
    {
      "src": "/themes/basic-blog/icons/icon-192.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "any"
    },
    {
      "src": "/themes/basic-blog/icons/icon-512.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "any"
    },
    {
      "src": "/themes/basic-blog/icons/icon-maskable-512.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "maskable"
    }
  ]
}
```

To implement your own brand, add icon images and add an `icons` block
in your `config.php` site configuration pointing to the files.

(Keep the maskable icon's content inside the central ~80% circle so it survives the launcher
masking).

## Installing and Testing

Once configured, the browser shows an **install** affordance in the address
bar (desktop Chrome) or via the share menu (Android). To verify:

* **Lighthouse** (DevTools → Lighthouse → "PWA" audit).
* The **Lighthouse installability checklist**: manifest present, 192 & 512
  icons present, service worker registered, standalone display, HTTPS.

Offline behaviour: disconnect from the network and reload. Cached pages are
served; uncached HTML requests fall back to the active theme's offline page
(`themes/<theme>/layouts/offline.html`).

## Client-Only / Static Deployments

In client-only mode there is no PHP backend, so `/manifest.json` is not
generated and the install prompt will not appear. Offline *caching* of already
fetched assets still works through the service worker, but a full installable
PWA requires the PHP backend.
