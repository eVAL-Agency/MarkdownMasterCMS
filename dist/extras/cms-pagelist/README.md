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


| Parameter | Required | Example                | Description                                                         |
|-----------|----------|------------------------|---------------------------------------------------------------------|
| type      | yes      | "posts,pages,etc"      | Any valid content type defined on your site                         |
| layout    | no       | "post-list"            | Layout to use for rendering content, useful for controlling UX      |
| link      | no       | "^posts/subproject/.+" | Regex or regular string to match, will only include matchings files |
| sort      | no       | "datetime-r"           | Sort results by a specific key                                      |
| limit     | no       | 5                      | Limit the number of results returned                                |
| filter-*  | no       | "filter-tag"           | Filter results by a specific key                                    |

{@link module:CMS~FileCollection#filterSort sort options}

{@link module:CMS~File#matchesAttributeSearch Filter options}

## Example Styles

N/A
