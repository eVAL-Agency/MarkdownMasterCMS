---
title: Loading Plugins
---

Plugins, (also called "extras"), can be loaded by the CMS to add additional functionality to your site.

## Installing Plugins

To install a plugin, copy the plugin directory to the `extras/` directory of your site.

The structure should look like this:

```
extras/
  | my-plugin/
    | my-plugin.js
    | README.md
```

If you have `extras/my-plugin/my-plugin/my-plugin.js`, it will **NOT** work!

## Activating Plugins

There are multiple methods to activate a plugin, but the recommended approach is to
add it to the `extras` block in your [config.php](https://markdownmaster.com/docs/site-configuration.html).

### Recommended Method

Example:

```php
'extras' => [
    // ...
    
    'my-plugin' => [],
    
    // ...
],
```

Some plugins may require configuration options, refer to the specific plugin's documentation for details.
These options can be added to the array for the plugin.

Example with configuration options:

```php
'extras' => [
    // ...
    
    'my-plugin' => [
        'option1' => 'value1',
        'option2' => 'value2',
    ],
    
    // ...
],
```

### Themes

Themes can ship with certain plugins activated by default.
This is done by adding the plugin to the `extras` block in the theme's `settings.php` file.

Follow the same syntax for config.

### Serverless / Client-Only

Plugins can be activated without relying on server-side code; this can be useful for serverless hosting options.

```html
<script>
	CMS.loadExtra('my-plugin');
</script>
```

### Within Layouts

Plugins can be activated within a layout template using the following syntax:

```html
<% CMS.loadExtra('my-plugin'); %>
```

### Within Pages

Plugins can be activated within a page's frontmatter using the following syntax:

```yaml
extras:
  - my-plugin
```
