---
title: Extra - Offline Notification
---

Renders a small notification bar at the very top of the page when the browser
reports no network connection. It informs users that their connection to the
site has been lost, that they are viewing a cached, offline version of the
content, and that some features may be unavailable until they reconnect.

It complements the [service worker](https://markdownmaster.com/docs/service-worker.html)
offline support: while the service worker serves previously fetched content,
this plugin keeps users clearly aware of the offline state.

## Initialization

To load this plugin, add it to the `extras` block in your
[config.php](https://markdownmaster.com/docs/site-configuration.html) or theme
[settings.php](https://markdownmaster.com/docs/theme-development.html):

```php
'extras' => [
    // ...

    'offline-notification' => [],

    // ...
],
```

Or, on the client only, via `CMS.loadExtra()` in the theme:

```html
<script>
	CMS.loadExtra('offline-notification');
</script>
```

This plugin is **client-side only** and has no server component.

## Configuration

| Parameter     | Required | Example    | Description                                          | Default              |
|---------------|----------|------------|------------------------------------------------------|----------------------|
| `styles`      | no       | `false`    | Load the bundled default stylesheet (see below).     | `true`               |
| `message`     | no       | `'...'`    | Body text explaining the offline state.              | *see default below*  |
| `showIcon`    | no       | `false`    | Show the leading warning glyph.                      | `true`               |
| `autoReload`  | no       | `false`    | Auto-reload the page when connection is restored     | `true`               |

Defaults:

```js
{
    styles: true,
    message: "Connection to the server was lost. You are viewing an offline " +
             "version of this site and some features may be unavailable until you " +
             "reconnect.",
    showIcon: true,
	autoReload: true,
}
```


### Example Styles

The plugin ships default styling (amber warning bar, with a dark-mode fallback)
loaded automatically when `styles` is `true`. These defaults are intentionally
theme-agnostic. To customize the look, add rules targeting the **class names**
below to your theme stylesheet.

```css
/** <editor-fold desc="Offline Notification"> **/

.offline-notification {
	background-color: #e74c3c; /* any warning/error color */
	color: #ffffff;
	padding: 0.5em 1.5em;
	font-size: 1em;
}

.offline-notification__icon {
	font-size: 1.25em;
}

.offline-notification__message {
	margin: 0;
	font-weight: 400;
}

/*
 * Override the dark-mode default:
 */
@media (prefers-color-scheme: dark) {
	.offline-notification {
		background-color: #7f1d1d;
		color: #fde6e6;
	}
}

/** </editor-fold desc="Offline Notification"> **/
```

To supply your own stylesheet entirely, set `'styles' => false` and load your
own CSS targeting those same class names.

## How it works

- On load the plugin registers its stylesheet (unless disabled).
- It watches the browser's `online` and `offline` events and reads
  `navigator.onLine` to determine connectivity.
- When offline, a single bar is inserted as the **first child** of `<body>`;
  when the connection returns it is removed. The bar persists across in-page
  (hash/history) route changes, since it lives on `<body>`, not inside the CMS
  content container.

## Accessibility

The notification is marked with `role="alert"` and `aria-live="assertive"`, so
screen readers announce it when the connection is lost. The decorative warning
icon is hidden from assistive technology via `aria-hidden`.

## Notes

- No inline styles are used anywhere; all appearance is controlled by CSS so it
  is fully theme-overrideable.
- This notification is separate from (and complements) the service worker's
  full-page offline layout. Both may appear together when offline.
