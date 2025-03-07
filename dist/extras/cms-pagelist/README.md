---
title: Extra - CMS-Pagelist
---

Provide a block of content from a collection, eg: a list of blog posts or a list of authors.


## Initialization

To load this functionality from HTML:

```html
<script>
CMS.loadExtra('cms-pagelist');
</script>
```

or from within `config.js`

```js
extras: {
  'cms-pagelist': {}
}
```


## Configuration

N/A


## Required Schema

N/A


## Usage

```html
<cms-pagelist type="posts" layout="pages"></cms-pagelist>
```

**Attributes**

- `type` - The type of collection to render
- `layout` - The layout template to use for rendering the collection
- `sort` - The sort order to use for the collection - see {@link module:CMS~FileCollection#filterSort sort options}
- `limit` - The maximum number of items to display
- `filter-...` - Filter the collection by a specific attribute - see {@link module:CMS~File#matchesAttributeSearch filter options}


## Example Styles

N/A
