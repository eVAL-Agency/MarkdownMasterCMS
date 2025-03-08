---
title: Extra - PrismJS Syntax Highlighter
---

Provide syntax highlighting for code blocks powered by [Prism.JS](https://prismjs.com).

* PrismJS 1.29.0 - https://prismjs.com
* License - MIT License


## Initialization

To load this plugin from raw HTML:

```html
<script>
CMS.loadExtra('prismjs', {
    theme: 'light|dark|auto',
    lineNumbers: true|false
});
</script>
```

OR to load this plugin from a layout:

```html
<% CMS.loadExtra('prismjs', {theme: '...', lineNumbers: ...}); %>
```


## Configuration

* `theme` - The theme to use for PrismJS (light, dark, auto)
* `lineNumbers` - Enable line numbers for code blocks


## Required Schema

N/A


## Usage

Render any preformatted code block with the language specified ala Github style.


## Example Styles

N/A
