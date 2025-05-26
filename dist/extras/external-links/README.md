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

```js
extras: {
  'external-links': {}
}
```


## Configuration

N/A


## Required Schema

N/A


## Usage

```markdown
[Example Site](https://example.com)
```

Will be rendered as:

```html
<a href="https://example.com" target="_blank" rel="noopener noreferrer" class="external">Example Site</a>
```

