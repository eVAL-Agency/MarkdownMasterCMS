# MarkdownMaster CMS


MarkdownMaster CMS is a flat-file framework designed to render HTML content from 
simple markdown files and HTML templates capable of running entirely client-side,
(though for best results, should be paired with the server-side component).

The idea of this is similar to [Jekyll](https://github.com/jekyll/jekyll),
but has the benefit of not requiring any pre-compiling for files to be served.
All content processing is handled within the browser.

For SEO and bot support, there is a small PHP-based server-side component
which will return generated HTML output, similar to that of the client-side application.
This is unnecessary for normal users, but is required
to ensure that crawlers can access the site data.

Because there is no database, registry, or administration of pages, 
deploying new pages is as simple as just uploading Markdown files to your server.
This can be done via automated sync applications such as NextCloud or just uploading
via SFTP or your web hosting interface.  _No building or scripts needed for deployment!_

This project is originally based from
[Chris Diana's CMS.js](https://github.com/chrisdiana/cms.js).


![MarkdownMaster CMS Screenshot](img/markdownmaster-cms-basic-blog-theme.webp)

-----

[![Version](https://img.shields.io/github/package-json/v/eVAL-Agency/MarkdownMasterCMS.svg)](https://github.com/eVAL-Agency/MarkdownMasterCMS/releases)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/eVAL-Agency/MarkdownMasterCMS/test.yml?branch=main)](https://github.com/eVAL-Agency/MarkdownMasterCMS/actions)
[![License](https://img.shields.io/github/license/eVAL-Agency/MarkdownMasterCMS.svg)](https://github.com/eVAL-Agency/MarkdownMasterCMS/blob/main/LICENSE.md)


## Features

* Zero dependencies
* Abstract content types
* Custom templates
* Search, filtering, tagging and sorting
* Apache ~~, Nginx, Mail-in-a-box, and Nextcloud support~~ (todo)
* Small footprint
* [Remarkable](https://github.com/jonschlinkert/remarkable) embedded
* Crawler and SEO support for most content
* Automatic sitemap.xml generation


## Demo

Check out a [live working site](https://veraciousnetwork.com)!

(todo - update demo link)


## ~~Quick Start~~

1. ~~Download the [latest release](https://github.
   com/cdp1337/markdownmaster/releases/latest)~~
2. ~~Setup environment, refer to specific documentation for 
   [NextCloud](docs/INSTALL.nextcloud-nginx.md),
   [Mail-in-a-Box](docs/INSTALL.mailinabox.md),
   or [Apache](docs/INSTALL.apache.md) for more information.~~
3. ~~[Configure config.js and config.ini](docs/site-configuration.md) to your liking~~

(todo)


## Documentation

For advanced usage of this framework, 
take a look through the other [post examples](dist/posts/) and the various
[documentation available](docs/).

* [Hooking into native events](docs/document-events.md)
* [Authoring content](docs/authoring-pages.md)
* [Extended attributes](docs/markdown-extended-attributes.md)
* [Development guide & build instructions](docs/development.md)


## How it works

MarkdownMaster CMS pulls the listing of files from either the server's
automatic directory index or from the server-side helper application (for faster 
loading and better bot/crawler support). 
This provides meta information of all pages in the application.

When browsing to a file, the source markdown is downloaded from the server
and rendered into HTML with Remarkable, (by default; this can be swapped out if 
necessary).

For bots anw crawlers, the server-side component is capable of generating HTML
from the same markdown files.  Not all features are supported in this rendering,
but is sufficient for SEO and indexing purposes.


## Thanks!

* [Chris Diana](https://github.com/chrisdiana) maintainer of original version of CMS.js

