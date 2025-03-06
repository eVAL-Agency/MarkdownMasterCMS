# Release Notes

This release is a complete re-thinking of the application
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

## Installation

Most hosting providers will be supported with minimal effort to install the application.
Just drop in the files into your web root and configure a couple files.

To troubleshoot issues, try setting `debug => true` in `config.php`
to get more verbose errors.

For new installs, the **full** version includes themes and example content.

For upgrades, the **app** version just contains the backend, application, and plugins.

## Upgrade Notes

* [2.x to 3.0](https://github.com/eVAL-Agency/MarkdownMasterCMS/blob/main/docs/upgrade-notes/upgrade-2.x-to-3.0.md)
* [3.0 to 3.1](https://github.com/eVAL-Agency/MarkdownMasterCMS/blob/main/docs/upgrade-notes/upgrade-3.0-to-3.1.md)
* [3.1 to 4.0](https://github.com/eVAL-Agency/MarkdownMasterCMS/blob/main/docs/upgrade-notes/upgrade-3.1-to-4.0.md)
* [4.0 to 5.0](https://github.com/eVAL-Agency/MarkdownMasterCMS/blob/main/docs/upgrade-notes/upgrade-4.0-to-5.0.md)
