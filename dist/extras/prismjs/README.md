---
title: Extra - PrismJS Syntax Highlighter
---

Provide syntax highlighting for code blocks powered by [Prism.JS](https://prismjs.com).

* PrismJS 1.29.0 - https://prismjs.com
* License - MIT License


## Initialization

To load this plugin, add the following to the `extras` block in your
[config.php](https://markdownmaster.com/docs/site-configuration.html) or
theme [settings.php](https://markdownmaster.com/docs/theme-development.html):

```php
'extras' => [
    // ...
    
    'prismjs' => [
        'theme' => 'light|dark|auto',
        'lineNumbers' => true|false,
    ],
    
    // ...
],
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
