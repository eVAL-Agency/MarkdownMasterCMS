---
title: Change History
seotitle: MarkdownMaster CMS Change History
description: Compiled list of changes to the MarkdownMaster CMS application and archived download links.
---

## MarkdownMaster CMS 5.1.0 - YYYY.MM.DD

### New Features

* Add support for fediverse:creator meta tag on pages based on socials data
* Add support for Twitter card previews
* Add support for server-side plugin code
* Add getFilteredTags to retrieve only tags based on current search filters
* Add support for reverse search when using getTags (-r convention)
* Add support for opengraph URL tags
* Add support for opengraph type tags
* Add support for backend hooks
* Add limit attribute to cms-tags to restrict number of tags shown
* Add support for blocks in cms-tags
* Add support in pagelists to fetch full text of content

### Changes

* Pagelist plugin now defaults sorting of `related` pages based on relevance.
* Add support for operation mode (OR / AND) on backend File lookups
* Add kofi and external-link aliases to fontawesome
* Dropped composer in favor of native include lookups
* Add cms:pagelist:loaded document event
* Add tag attribute on returned objects when using getTags
* Add support for server-side type details on files
* Force descriptions to be trimmed at 160 characters for SEO purposes
* Add support for scripts to be injected in HTML pages (head and foot)
* Add support for content to be injected at the end of the body
* Add support for backend Config::GetExtraParameter to mimic frontend functionality
* Matomo plugin can how handle tracking code injection automatically
* Upgrade fslightbox to 2.7.4
* Change rendering of cms-tags to allow for CSS to handle layout

### Fixes

* Include search parameters in default redirect to preserve campaign tracking and search parameters
* Server-generated pages preserve existing body classnames correctly
* Server-generated pages only add an H1 if one is not located in the content
* Server-generated pages handle mailto: and other non-HTTP links correctly


## [MarkdownMaster CMS 5.0.4 - 2025.08.09](https://github.com/eVAL-Agency/MarkdownMasterCMS/releases/tag/v5.0.4)

### New Features

* Add support for custom form submit buttons
* Add support for select fields on forms
* Add support for radio inputs on forms
* Add support for checkbox inputs on forms
* Add support for hidden inputs on forms
* Add external-links plugin for auto handling links to external sites
* Add mastodon-comments plugin for embedding Mastodon posts as comments

### Changes

* Handle forms with no success target
* Auto-load extras requested from the server
* Wrap inline script tags in IIFE to prevent scope issues
* Rename extras from `init.js` to `{name}.js` to make them easier to find
* Remove mastodon-share in favor of mastodon-comments

### Fixes

* Fix support for newlines within HTML and script tags
* Fix '&' and other non-XML friendly characters in titles


## [MarkdownMaster CMS 5.0.3 - 2025.04.27](https://github.com/eVAL-Agency/MarkdownMasterCMS/releases/tag/v5.0.3)

### New Features

* cms-pagelist now supports `related` attribute to retrieve related content based on tags
* Links in Markdown content translate '.md' to '.html' automatically
* Add support for Github-style task lists (Issue #2)
* Add RSS support

### Changes

* CMS.getPathsFromURL now supports a string to be passed in, to parse arbitrary URLs.
* Add CMS.currentPage to point to the current page being viewed
* Add onUnload handler for pages and collections
* Parameters `scripts` and `scriptsLoaded` are now reserved on pages
* Add support for a default value for backend Config
* Add links for RSS feed to blog and wiki themes

### Fixes

* Fix support for script tags within markdown content
* Pages with no explicit title should render something (Issue #1)
* Improvements to responsiveness support in blog theme
* URLs embedded in content now get fully resolved when served from backend
* Fix integration between cms-button and cms-icon


## [MarkdownMaster CMS 5.0.2 - 2025.04.13](https://github.com/eVAL-Agency/MarkdownMasterCMS/releases/tag/v5.0.2)

### New Features

* Add "!~" and "!=" to the list of supported operators for filtering
* New tag - cms-toc for generating a table of contents of the current page
* New theme - basic-wiki for wiki-style sites
* New tag - cms-theme-selector for switching themes between light/dark

### Changes

* Cleanup and expand file attribute filtering
* Add getCollectionClone to CMS to allow manipulating collections independently

### Fixes

* Change cms-pagelist to use `getCollectionClone` to support multiple tags on the same page


## [MarkdownMaster CMS 5.0.1 - 2025-04-03](https://github.com/eVAL-Agency/MarkdownMasterCMS/releases/tag/v5.0.1)

### New Features

* Add support for `field:...` on form email action for the `to` field
* Add server-side search for full text searching

### Changes

* Change default canonical to /
* Add default favicons and logo
* Theme is optional, (to support legacy sites)

### Fixes

* Fix GetRootPath to return a trailing slash
* Additional sanity checks for File paths
* `cms-pagelist` now renders server-side (SEO Fix)
* `cms-button` fixes to work again
* Fix support for rendering files with invalid YAML headers
* Fix for hosting on nginx


## [MarkdownMaster CMS 5.0.0 - 2025-03-08](https://github.com/eVAL-Agency/MarkdownMasterCMS/releases/tag/v5.0.0)

New architecture, new features, new plugins, new everything!


## MarkdownMaster CMS 4.1.0 - (UNRELEASED)

### New Features

* Add 'random' as supported sort parameter
* Paginate now supports 'page' parameter
* Page-list now supports 'limit' parameter

### Fixes

* Fix cms-* plugins trying to run before CMS was initialized
* Switch example site to use minified version of app by default
* Include default config for Apache expiry headers (for caching)
* Fix paragraph stealing extended attributes for simple blocks

### Changes

* Mastodon Share is now an element as opposed to a plugin
* Switch to `is=...` for all custom elements


## [MarkdownMaster CMS 4.0.2 - 2023-10-23](https://github.com/cdp1337/markdownmaster/releases/tag/v4.0.2)

### New Features

* Include a simple background-slider plugin
* Include fslightbox-basic for a simple lightbox

### Fixes

* Fix support for Apache web servers


## [MarkdownMaster CMS 4.0.1 - 2023-06-03](https://github.com/cdp1337/markdownmaster/releases/tag/v4.0.1)

### New Features

* #18 support pagination for listing pages
* #19 support for cms-icon (convenience helper)

### Fixes

* #20 cms-search preserves search query
* #21 hash URLs were taking over route events


## [MarkdownMaster CMS 4.0.0 - 2023-06-03](https://github.com/cdp1337/markdownmaster/releases/tag/v4.0.0)

### New Features

* New support for HTML attributes inline
* Include Prism.JS as an extra for sites
* Include FontAwesome as an extra for sites
* Better error management
* Better logging support
* Better support for external scripts
* Add fetchLayout and renderLayout
* Add support for filtering files by date published
* New convenience method CMS.getCollection
* New support for complex filtering of files
* Add CMS-Author tag for embedded author snippet
* Add CMS-Button tag for stylized buttons from a-elements
* URLs in FrontMatter now support multiple values
* New support for sticky pages
* New support for multiple sort keys
* Include listing pages in sitemap.xml
* New server-side support for loading page metadata
* New debug parameters for DEBUG and crawlers
* Filecollection getTags now can sort and provide weighted values


### Fixes

* Do not include DRAFT pages in taglist
* Fix beginning newline on sitemap
* Fix for FrontMatter overwriting functions
* Fix parsing of files with no FrontMatter
* Fix bug where images inside anchors were not dispatching the router
* FrontMatter now correctly handles YAML parsing
* Fix listing pages for crawlers
* Fix draft pages from showing in sitemap.xml
* Add canonical URL to crawler pages
* Crawler pages now render the template to provide full links and previews
* Fix support for abbr tags in markdown


### Changes

* Removed Github support (it was broken anyway on this fork)
* Switch to new Configuration system
* Switch to Promises for async operations
* Move CMS-Pagelist to a standardized customElement
* Move CMS-Search to a standardized customElement
* URL-type properties now require `src` or `href` subattributes
* The date formatting by default is now locale-aware
* Switched default markdown renderer from marked to remarkable


## [CMS.js 3.1.0 - 2022-11-24](https://github.com/cdp1337/markdownmaster/releases/tag/v3.1.0)

author: cdp1337

Version 3.1.0 features server-side scripts to better assist with crawler visibility, as evidently Google will refuse to fully index markdown content.
The two included server scripts are sitemap generator and a crawler-friendly site renderer.

### New Features

* New server-side scripts to better support crawlers and bots
* Add support for sorting in the page-list plugin
* Add support for multiple filters to be applied at a time
* Add support for lazy-loading markdown content in articles
* Add support for custom URL-type attributes in frontmatter

### Fixes

* Fix support for sorting of articles
* Refactor internal method names to be more consistent to their actions


## [CMS.js 3.0.0 - 2022-11-22](https://github.com/cdp1337/markdownmaster/releases/tag/v3.0.0)

author: cdp1337

Version 3.x features a nearly completely rewrite of all core concepts of this utility and a large number of features and bugfixes implemented.

### New Features

* Better debug logging support
* Switch to History API for page navigation
* Include SEO and crawler support via rewrite rules
* Add support for nested directories
* Add support for subdirectory web paths
* Add support for SEO page titles
* Add support for automatic change timestamps
* Fix support for images in meta attributes
* Add support for full text searching
* Add support for retrieving tags for an entire collection
* Add support for dynamic body classes
* Include marked.js for better markdown support
* Better nginx support
* Fix image URLs relative to the markdown source file in meta tags
* Retool plugin functionality
* Add several plugins to core system


## 2.0.0 - 2018-11-21

author: chrisdiana

* Zero dependencies (no more jQuery or Marked)
* Abstract types
* Boilerplate separated from source code
* Custom Templates
* Tagging
* Filtering
* Search
* Sorting
* Events
* Streamlined Config
* Updated Github & Server Mode
* Extendable Plugins
* Extendable Markdown Renderer
* Small size footprint


## 1.0.0 2016-01-20

author: chrisdiana

* Initial release