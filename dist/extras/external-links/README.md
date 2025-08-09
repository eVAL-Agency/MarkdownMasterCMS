---
title: Extra - External Links
---

Simple plugin to ensure links to external sites open in a new tab and contain
the necessary `rel` attributes to prevent security issues.

Optionally can also add an icon at the end of the link to visually indicate it is an external link.


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

### local

This allows you to mark domains that should not be treated as external links.

```html
<script>
CMS.loadExtra('external-links', {
	'local': ['localhost', '127.0.0.1', 'example.com']
});
</script>
```

### icons

Can be set to `true` to add an icon at the end of the link to visually indicate it is an external link.

```html
<script>
CMS.loadExtra('external-links', {
	'icons': true
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

