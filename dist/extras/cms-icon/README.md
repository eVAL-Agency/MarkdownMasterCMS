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

The font library to use for the backend can be configured, 
(but at the moment only FontAwesome is supported).


## Required Schema

N/A


## Usage

**Basic usage:**

```html
<i is="cms-icon" icon="camera"></i>
```

**Automatic Resolution:**

An HREF can be provided to automatically resolve the icon to the given service.
For example if a Youtube link is provided, the youtube icon will be rendered.

```html
<i is="cms-icon" href="https://youtube.com/some-video"></i>
```


## Example Styles

N/A

## Changelog

### NEXT - NEXT

Add support for `href` attribute for automatic resolution, (cloned from `external-links`)

### 5.0.3 - 2025-04-26

Fix integration between CMS-Button and CMS-Icon
