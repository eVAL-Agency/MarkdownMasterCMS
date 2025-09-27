---
title: Theme Development
seotitle: Develop Themes in Markdown Master CMS
tags: [Development, Themes]
---

Themes should reside inside the `themes/` directory and named with the key name of the theme,
along with an `index.html` file and a `settings.php` file for configuration options.
A `README.md` file is also recommended for user documentation.

A `layouts/` directory within the theme should be included which contain templates for page types
and widgets.

example layout:

```
themes/
    | my-theme/
        | index.html
        | settings.php
        | README.md
        | layouts/
            | post.html
            | page.html
            | post-list.html
            | etc...
```

There is no requirement of any styling framework, so themes are free to implement whatever CSS they prefer.

## Settings

Example `settings.php` configuration file:

```php
<?php
/**
 * Theme default settings
 */
return [
	// Type of files to support
	'types' => ['pages', 'posts', 'authors'],

	// ID of element to attach CMS.js to
	'elementId' => 'cms',

	'extras' => [
		'cms-search' => [],
		'cms-icon' => [],
		'cms-button' => [],
		'external-links' => [],
	],
];
```

The theme settings should define plugins and parameters used by that theme.
For example if your theme utilizes specific functionality, it should be defined here.