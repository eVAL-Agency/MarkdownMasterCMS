# MarkdownMaster CMS


MarkdownMaster CMS is a flat-file framework designed to render HTML content from 
simple markdown files and HTML templates capable of running entirely client-side,
(though for best results, should be paired with the server-side component).

The idea of this is similar to [Jekyll](https://github.com/jekyll/jekyll),
but has the benefit of not requiring any pre-compiling for files to be served.
All content processing is handled within the browser.

As a complement system to the client-side engine, a PHP-based server-side component
facilitates support for search crawlers to ensure SEO, bots, form submissions, and
RSS feeds by rendering the Markdown files into HTML on the server.
This server-generated content will not exactly match the client-side rendering
as there are some features lacking, but is sufficient for basic content.

Because there is no database, registry, or administration of pages, 
deploying new pages is as simple as just uploading Markdown files to your server.
This can be done via automated sync applications such as NextCloud or just uploading
via SFTP or your web hosting interface.  **No building or scripts needed for deployment!**

The client-side javascript rendering in this project was originally based from
[Chris Diana's CMS.js](https://github.com/chrisdiana/cms.js).


![MarkdownMaster CMS Screenshot](img/markdownmaster-cms-basic-blog-theme.webp)

-----

[![Version](https://img.shields.io/github/package-json/v/eVAL-Agency/MarkdownMasterCMS.svg)](https://github.com/eVAL-Agency/MarkdownMasterCMS/releases)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/eVAL-Agency/MarkdownMasterCMS/test.yml?branch=main)](https://github.com/eVAL-Agency/MarkdownMasterCMS/actions)
[![License](https://img.shields.io/github/license/eVAL-Agency/MarkdownMasterCMS.svg)](https://github.com/eVAL-Agency/MarkdownMasterCMS/blob/main/LICENSE.md)


First-party professional support for this code, along with server hosting and technology consultation 
is available from [Ohio-local eVAL Agency](https://eval.agency).

Aside from business support, you can also help support this project by donating to me directly.
[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Q5Q013RM9Q)

## Features

* Low dependencies (just PHP 8.2+ and a web server)
* Abstract content types
* Custom templates
* Search, filtering, tagging and sorting
* Apache, Nginx, Mail-in-a-box, and Nextcloud support
* Small footprint
* [Remarkable](https://github.com/jonschlinkert/remarkable) Markdown parser embedded (modified)
* Crawler and SEO support for most content
* Automatic sitemap.xml generation
* Theme support
* RSS 2.0 feed support


## Demo

Check out a [live working site](https://markdownmaster.com?mtm_campaign=github)!


## Quick Start

1. Setup/obtain your web environment with at least PHP 8.2 or greater.
   * [Apache specific install guide](docs/INSTALL.apache.md)
   * [Mail-in-a-Box specific install guide](docs/INSTALL.mailinabox.md)
2. Download the **full** 
   [latest release](https://github.com/eVAL-Agency/MarkdownMasterCMS/releases/latest)
   which includes themes and example content.
   (Alternatively the **app** package just contains the app, backend, and plugins.)
3. Upload and extract the tarball to your web root.
4. Copy / rename `config.example.php` to `config.php` and configure to your liking.
   * Notably `host` and `theme` are important.
5. Copy / rename `.htaccess.example` to `.htaccess` and configure if necessary.
   * Default setup for top-level directory, require SSL, and no `www.` prefix.
6. Edit theme markup in themes/(themename)/index.html, CSS, and markdown content.


## Themes

MarkdownMaster CMS ships with a few themes to get you started, and creating new ones
is straight forward as you can choose whatever HTML/CSS framework you prefer.

### Basic Blog Theme

![Basic Blog Theme](img/markdownmaster-cms-blog.webp)

### Basic Business Theme

![Basic Business Theme](img/markdownmaster-cms-business.webp)

### Basic Wiki Theme

![Basic Wiki Theme](img/markdownmaster-cms-wiki.webp)


## Documentation

Documentation is available on the 
[official MarkdownMaster CMS website](https://markdownmaster.com/docs.html?mtm_campaign=github),
compiled from [docs/](docs/) and other various sources within this project.

[Javascript API documentation](https://markdownmaster.com/jsdocs/latest/) is also available
for interfacing with low-level functions within this framework.


## How it works

MarkdownMaster CMS pulls the listing of files from either the server's
automatic directory index or from the server-side helper application (for faster 
loading and better bot/crawler support). 
This provides meta information of all pages in the application.

When browsing to a file, the source markdown is downloaded from the server
and rendered into HTML with Remarkable, (by default; this can be swapped out if 
necessary).

For bots and crawlers, the server-side component is capable of generating HTML
from the same markdown files.  Not all features are supported in this rendering,
but is sufficient for SEO and indexing purposes.


## Thanks!

* [Chris Diana](https://github.com/chrisdiana) maintainer of original version of CMS.js

