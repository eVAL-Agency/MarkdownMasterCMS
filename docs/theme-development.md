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
	
	'pwa' => [
		'name' => 'MarkdownMasterCMS Website',
		'short_name' => 'MarkdownMasterCMS',
		'display' => 'standalone',
		'theme_color' => '#3f70b3',
		'background_color' => '#ffffff',
	],

	'icons' => [
		'icons/icon.svg',
		'icons/icon-192.png',
		'icons/icon-512.png',
		'icons/icon-maskable-512.png',
	],
];
```

The theme settings should define plugins and parameters used by that theme.
For example if your theme utilizes specific functionality, it should be defined here.

## Icons

Icons can be included in the theme to provide default favicons and PWA icons.
Including them in the settings.php means you **do not need to include them manually**
in the theme `index.html`.

Icons are parsed and injected automatically into the HTML.

## Progress Web App

As of v6.0.0 PWA is natively supported, and the theme can define default values for
the appearance of the application when installed as a PWA.


## Dynamic Titles for Listing Pages

As of v6.0.0, titles of listing pages can be adjusted by the client-side configuration.
This is useful for listing pages which support different content based on the tags provided, (for example).

```js
CMS.config.getTypeLayout('posts').titleResolver = collection => {
    if (collection.hasFilterTag('cats')) {
        return 'Cats';
    }
    else if (collection.hasFilterTag('turtles')) {
        return 'Turtles';
    }
    else {
        return 'Posts';
    }
};
```

The `titleResolver` method on the configured file types supports a function
with the `FileCollection` used for rendering the view passed as the one argument.

This method is expected to return a string which is injected as the SEO title of the page.
