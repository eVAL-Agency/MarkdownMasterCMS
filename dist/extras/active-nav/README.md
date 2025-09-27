---
title: Extra - Active Nav
---

Adds a class name to navigation elements that match the page URL.

## Initialization

To load this plugin, add the following to the `extras` block in your 
[config.php](https://markdownmaster.com/docs/site-configuration.html) or 
theme [settings.php](https://markdownmaster.com/docs/theme-development.html):

```php
'extras' => [
    // ...
    
    'active-nav' => [
        'navSelector' => 'nav li',
        'navActiveClass' => 'active',
    ],
    
    // ...
],
```


## Configuration

- `navSelector` - The selector to use to find navigation elements to check.
- `navActiveClass` - The class name to add to the navigation element when active.


## Required Schema

N/A

## Usage

N/A

## Example Styles

```css
nav li {
	color: #001447;
}
nav li.active {
	color: #0000e8;
}
```
