---
title: Extra - CMS-Search
---

Provides search input functionality that hooks into the site

As of v6.0.0, cms-search will now inject `<mark>` snippets
around matched results.


## Initialization

To load this plugin, add the following to the `extras` block in your
[config.php](https://markdownmaster.com/docs/site-configuration.html) or
theme [settings.php](https://markdownmaster.com/docs/theme-development.html):

```php
'extras' => [
    // ...
    
    'cms-search' => [],
    
    // ...
],
```


## Configuration

N/A


## Required Schema

N/A


## Usage

```html
<input is="cms-search" type="posts"/>
```

**Attributes**

- `type` - The type of collection to search


## Example Styles

Matching text is wrapped in `<mark data-cms-search>` tags in the rendered
search results. You may override the default highlight appearance:

```css
mark[data-cms-search] {
	background-color: #fff9c4;
	border-radius: 2px;
}
```
