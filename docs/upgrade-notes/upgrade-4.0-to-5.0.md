---
title: Upgrade 4.0 to 5.0
seotitle: Upgrade notes for Markdownmaster CMS 4.0
---

## HTAccess and Backend Changes

New backend requires a new .htaccess to be installed.
This is a notable change as the backend processor changed from Python to PHP
to better support multi-tenant environments.

This upgrade requires either PHP 8.2 or newer or for the application
to be installed in CLIENT-ONLY mode.
(eg: no support for backend processing of markdown files and no crawler support.)

This requires a new `config.php` to be configured (as opposed to `cgi-bin/config.ini`).

You will also need to ensure that `index.php` is installed in the root directory.


## Application Paths

Default path for application changed from js/cms.js to app/cms.js.

Frontend configuration is no longer required when in SERVER mode, and otherwise has moved
to the root directory.


## New Initialization

Old:

```javascript
const site = CMS(config);
// ...
site.init();
```

New:

```javascript
CMS.load(config);
// ...
CMS.init();
```


## Remarkable now default

If your configuration script includes `site.enablePlugin(['remarkable']);`, that
definition can safely be removed.  This component is now included by default.

This includes the configuration directive `markdownEngine: null` in `config.js`.
Remove this as it will set the engine to NULL which will render raw markdown,
(unless that's what you want).


## Plugin `pagebodyclass` Removed

This plugin has been removed as it is now baked into the CMS natively.
Remove any `enablePlugin` directive for that plugin.


## New Plugin Loading

Old:

```javascript
site.enablePlugin([...]);
```

New:

```javascript
CMS.loadExtra('plugin-name');
```

Additionally, many plugins will NOT be compatible with the new API.
If errors are encountered, just switch them to 
`<script src="/extras/whatever-plugin.js"></script>` in the HTML.

Plugin loading via the initial `load()` no longer **loads** the plugin,
but only loads the configuration data for that plugin.

This allows plugins like `cms-form` to have the forms configuration loaded at init
but the plugin file not loaded until a page is viewed which requires that functionality.


## Some Plugins Removed from Core

A number of plugins have been removed from the core application.
To restore their functionality, include them with `CMS.loadExtra(...)` directives.

(Ensure to include the plugin itself if you are cherry-picking the install.)

These include:

* cms-author
* cms-icon
* cms-pagelist
* cms-search
* cms-tags
