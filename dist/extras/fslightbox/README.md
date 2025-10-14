---
title: Extra - Fullscreen Lightbox
---

An easy to use but powerful plug-in for displaying various types of sources—such as images, 
HTML videos, or YouTube videos—in a clean overlying box. Supports, among others, captions, thumbnails, and zooming.

Present a single source or create a beautiful gallery with a stylish lightbox without jQuery.

For more information on using Fullscreen Lightbox, 
refer [to the official documentation](https://fslightbox.com/javascript/documentation/how-to-use)


## Initialization

To load this plugin, add the following to the `extras` block in your
[config.php](https://markdownmaster.com/docs/site-configuration.html) or
theme [settings.php](https://markdownmaster.com/docs/theme-development.html):

```php
'extras' => [
    // ...
    
    'fslightbox' => [],
    
    // ...
],
```


## Configuration

N/A



## Required Schema

N/A


## Usage

```markdown
[![Thumbnail](https://via.placeholder.com/150)](https://via.placeholder.com/800){data-fslightbox="gallery1" data-caption="This is a caption"}
```
