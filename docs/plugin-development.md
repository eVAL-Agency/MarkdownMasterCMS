---
title: Plugin Development
seotitle: Develop Plugins in Markdown Master CMS
tags: [Development, Plugins]
---

Plugins should reside inside the `extras/` directory and named with the key name of the plugin,
along with an initialization script with the same name and a README.md file for user documentation.

example layout:

```
extras/
  | my-plugin/
    | my-plugin.js
    | README.md
```

Other files can be included as necessary, but only the primary will be loaded initially
by the CMS.

Plugins are loaded by the CMS using the `CMS.loadExtra()` method, which generally
is called from the theme `index.html`.

```html
<script>
CMS.init();
// ...
CMS.loadExtra('my-plugin');
</script>
```

## Plugin Configuration

Plugins support configuration options that can be passed by the site operator.

```html
<script>
CMS.init();
// ...
CMS.loadExtra('my-plugin', {'config1': 'value1', 'config2': 'value2'});
</script>
```

These options can then be accessed via the `CMS.config.extra` method.

```javascript
CMS.config.extra('my-plugin', 'config1', null); // returns 'value1' or NULL if not set
```

## Logging

```javascript
CMS.log.Debug('my-plugin', 'some debug message (only displayed when in debug mode)');
CMS.log.Warn('my-plugin', 'some warning message');
CMS.log.Error('my-plugin', 'some error message');
```

## Require Other Plugins

```javascript
{
	CMS.loadExtra('other-plugin');
}
```

## Including Stylesheets

```javascript
{
	if (CMS.config.extra('my-plugin', 'styles', true)) {
		// Allow the admin to set 'styles': false to skip loading auto styles
		let style = document.createElement('link');
		style.rel = 'stylesheet';
		style.href = CMS.config.webpath + 'extras/my-plugin/my-plugin.css';
		document.head.appendChild(style);
	}
}
```