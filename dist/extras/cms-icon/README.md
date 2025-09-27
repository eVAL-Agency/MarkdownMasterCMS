---
title: Extra - CMS-Icon
---

Simple icon renderer


## Initialization

To load this plugin, add the following to the `extras` block in your
[config.php](https://markdownmaster.com/docs/site-configuration.html) or
theme [settings.php](https://markdownmaster.com/docs/theme-development.html):

```php
'extras' => [
    // ...
    
    'cms-icon' => [],
    
    // ...
],
```


## Configuration

N/A


## Required Schema

N/A


## Usage

```html
<i icon="camera" is="cms-icon"></i>
```

Will use the loaded icon library for rendering the actual icons.
(Currently only FontAwesome is supported.)


## Example Styles

N/A
