---
title: Extra - CMS-Search
---

Provides search input functionality that hooks into the site


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

N/A
