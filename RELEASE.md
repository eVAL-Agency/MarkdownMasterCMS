# Release Notes

The 5.0 release is a complete re-thinking of the application
architecture.  The default backend handler has been ported from 
Python to PHP for better support in multi-tenant hosting environments.

PHP 8.2 or better is required for use of this server-side functionality.

The application can still operate in CLIENT-ONLY mode,
but this will lack bot support, crawler support, and internal form handling.

Before updating, please read through the
[release notes for 5.0](https://github.com/eVAL-Agency/MarkdownMasterCMS/blob/main/docs/upgrade-notes/upgrade-4.0-to-5.0.md)

Other changes include plugin (called extras), architectural changes
and a simplification of configuration.

The client-side `config.js` is still supported, but not used by default for new installs.
This config is generated dynamically from the server-side config.

v5.0.1 features a new server-side search engine for full-text searching and some server-side
fixes to improve bot rendering.

v5.0.2 features a new theme for wiki-style sites, a table of contents tag, and a theme selector tag.

[Complete changelog](https://github.com/eVAL-Agency/MarkdownMasterCMS/blob/main/CHANGELOG.md)


## Installation

Most hosting providers will be supported with minimal effort to install the application.
Just drop in the files into your web root,
rename `config.example.php` to `config.php` and [configure](https://github.com/eVAL-Agency/MarkdownMasterCMS/blob/main/docs/site-configuration.md), 
and rename `.htaccess.example` to `.htaccess` and configure.

**NOTICE** Pay special attention to `.htaccess`, as the file is hidden by default!
Ensure to include this file in the upload.

To troubleshoot issues, try setting `debug => true` in `config.php`
to get more verbose errors.

For new installs, the **full** version includes themes and example content.

For upgrades, the **app** version just contains the backend, application, and plugins.


## Upgrade Notes

* [2.x to 3.0](https://github.com/eVAL-Agency/MarkdownMasterCMS/blob/main/docs/upgrade-notes/upgrade-2.x-to-3.0.md)
* [3.0 to 3.1](https://github.com/eVAL-Agency/MarkdownMasterCMS/blob/main/docs/upgrade-notes/upgrade-3.0-to-3.1.md)
* [3.1 to 4.0](https://github.com/eVAL-Agency/MarkdownMasterCMS/blob/main/docs/upgrade-notes/upgrade-3.1-to-4.0.md)
* [4.0 to 5.0](https://github.com/eVAL-Agency/MarkdownMasterCMS/blob/main/docs/upgrade-notes/upgrade-4.0-to-5.0.md)
