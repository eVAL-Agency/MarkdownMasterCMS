---
title: Extra - CMS-Author
---

Render an author as an embedded widget, (using selectable layout template)

## Initialization

To load this plugin from raw HTML:

```html
<script>
	CMS.loadExtra('cms-author');
</script>
```

OR to load this functionality from a layout:

```html
<% CMS.loadExtra('cms-author'); %>
```


## Configuration

N/A


## Required Schema

Requires the `author` file type to be enabled to function.
Each author should have a `title` and `alias` property.

## Usage

```html
<cms-author author="<%= data.author %>"></cms-author>
```

### Attributes

- `author` - The name or alias of the author to render
- `layout` - The layout template to use for rendering the author

## Example Styles

N/A