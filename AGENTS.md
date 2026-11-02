# Rules for Agents

## Project Overview

Project is split up into several discrete components, each with different technologies.

Automated agents **MUST NEVER GIT COMMIT DIRECTLY**.
Automated agents may edit, create, and remove files in this project as necessary,
but **all changes must be audited and verified by the developer**.

This project is an HTML rendering engine for markdown files.

When the user accesses `https://yoursite.example.com/pages/about.html`,
the configured theme HTML is pulled and the markdown file `pages/about.md` is pulled
to be rendered to HTML and injected into that theme HTML.

Clients access the markdown file **directly** to download the **raw markdown** into the browser.

This project is not meant to be used as-is, but rather deployed as an archive to be used
as a foundation for external projects.
`dist/` gets packaged in two versions, a **full** version which includes example content
and themes and an **app** version which just includes the compiled client-side JS application
and server-side PHP application.


### Client Application

The client application located within `src/` is the Javascript application that compiles with
**rollup** down to common javascript.

These source files are ESM modules that get compiled with the **node** task `npm run build_app`
to `dist/app/cms.js` and `dist/app/cms.min.js` as a CommonJS bundle 
intended for direct <script> inclusion in the browser.

This source application forked from Chris Diana and original files include the header

```
* Copyright (c) 2021 Chris Diana
* https://chrisdiana.github.io/cms.js
```

New files created only need the following copyright header

```
* Copyright (c) (YEAR) eVAL Agency
* https://github.com/eVAL-Agency/MarkdownMasterCMS
```

All files herein are licensed under MIT.

Tests for these source files reside within `test/client` and at least 80% code coverage is preferred.
Code coverage above 60% is acceptable.

To invoke tests for the client application, run `npm run action_app_test` to run
npx jest with the necessary options.

This compiled application must support currently supported browsers, 
including browsers which are legacy but still supported.
This means Internet Explorer does not need to be supported
but Firefox Extended Support Release (ESR) must be supported despite it not being the "latest release".

Compilation of source files into `dist/app/` is done by running the task `npm run build_app`.
Do not edit files within `dist/app/` as this is generated code.


## Backend Application

A PHP-based backend application is located in `dist/backend/` and provides server-side support
for the client application.
This is not strictly required but introduces performance and discoverability benefits
to supplement the client-side application.

`dist/backend/routes.php` store system-default routes for the server application

`dist/backend/libs/MarkdownMaster/` store the primary files for the server application.
This contains `Controllers/`, `Models/`, `Services/`, and `Views/` to store those classes.

This backend is an MVC based application which borrows concepts from Symfony.

Additional dependencies for the server application reside within `dist/backend/libs/`
in various directories such as `Brick/`, `Doctrine/`, `Symfony/`, and more.

All libraries within `dist/backend/libs/` are grouped by their namespace in a variation of PSR-4.
`\Acme\Log\Writer\File_Writer` for example must reside within
`dist/backend/libs/Acme/Log/Writer/File_Writer.php`.

All libraries are **manually installed** as no composer is used!

The "bootstrap" of this server application is just `dist/index.php`.

Tests for the backend files reside within `test/backend` and at least 80% code coverage is preferred.
Code coverage above 60% is acceptable.

To run all tests in the backend application, `npm run action_backend_test` is used
to invoke `test/phpunit.phar` in the `test/backend` directory.

Compilation of the backend is done by running `npm run build_backend`, though
this only needs to be done in CI/CD and **should not run in development**.


## Plugins

Plugins (or as called in this project, "extras"), are located within `dist/extras/`.

These extras must be named with the name of the extra, for example
`matomo` plugin is within `dist/extras/matomo/` and the client-side portion of this plugin
is located in `dist/extras/matomo/matomo.js` and the server-side portion of this plugin
is located in `dist/extras/matomo/autoload.php`.

Client bootstrap for plugins **must** be (name_of_plugin).js.

Server bootstrap for plugins **must** be autoload.php.

Plugins **must** include a `README.md` with details of how to use this plugin,
any configuration options are needed, examples of its use, etc.

This `README.md` file gets deployed standalone to `https://markdownmaster.com/docs/extras/(name_of_plugin).md`.

Tests for plugins reside within `test/extras` and code coverage (at present) is optional.

Absolutely no inline styles are allowed within plugins unless very specifically required for some functionality.
This is to allow custom themes to define their own styles for elements in plugins.

If necessary, styles _may_ be registered in a CSS file within the plugin directory,
to be added to the DOM by the plugin Javascript.
This can be beneficial for complex plugins.
If done, these styles should still be easily overridden by a theme styles,
(though CSS being **cascading**, both plugin-specific stylesheet and theme stylesheet may be loaded at the same time).


## Database

Server-side application supports an SQLite3 database located in `dist/data/cms.sqlite`.


## Themes

Themes are available in `dist/themes/`.

Each theme may have a `settings.php` to define defaults for that theme, eg used plugins
and content types supported.

Each theme must have an `index.html` to define the base HTML for the theme.

Each theme should have a `layouts/` to define JS-enhanced HTML to be used for various layouts and widgets
throughout the site.

These layouts get rendered with Javascript, so basic features like `<%= data.title %>` or
`<% if (data.title) { %> it has a title! <% } %>` are allowed to provide more intelligent templates.

The type of the layout determines what is provided.  `dist/themes/basic-wiki/layouts/wiki.html`
renders a single "wiki" page and that page (aka File from `src/app/file.js`) is injected as the `data` parameter.

`dist/themes/basic-wiki/layouts/wiki-pages.html` renders a **listing** of wiki pages
(aka FileCollection from `src/app/filecollection.js`) as the `data` parameter.


## Documentation

Developer and end-user documentation should go within `docs/` to get exported to 
`https://markdownmaster.com/docs/`.

End-user documentation should be usable by developers with basic understanding of HTML
and CSS concepts, as using this framework requires at least basic knowledge.

`npm run docs` compiles documentation to `build/jsdoc/` and is **not required in development**,
it is run by CI/CD automatically to be deployed to `https://markdownmaster.com/jsdocs/latest/`.


## Running Locally

To run this application locally, the command `npm run serve_full` starts a web server
on `http://locahost:8000` pointing to `dist/`.
This allows the full application to be tested in a live browser prior to deployment.

**Note**, the client application **must** be compiled to `dist/app/cms.js` for the web browser
to pick up on any changes to code within `src/`.

**Note**, changes to files within `dist/backend/` and `dist/extras/` are **immediately live**
within a web browser with no build process to run.