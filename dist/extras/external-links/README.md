---
title: Extra - External Links
---

Simple plugin to ensure links to external sites open in a new tab and contain
the necessary `rel` attributes to prevent security issues.


## Initialization

To load this functionality from HTML:

```html
<script>
CMS.loadExtra('external-links');
</script>
```

or from within `config.js`

```javascript
extras: {
  'external-links': {}
}
```


## Configuration

This plugin will work automatically with no configuration, but does allow for
local domains to be defined if necessary.
This allows you to mark domains that should not be treated as external links.

```html
<script>
CMS.loadExtra('external-links', {
	'local': ['localhost', '127.0.0.1', 'example.com']
});
</script>
```



## Required Schema

N/A


## Usage

```markdown
[Example Site](https://example.com)
```

Will be rendered as:

```html
<a href="https://example.com" target="_blank" rel="external noopener" class="external">Example Site</a>
```

