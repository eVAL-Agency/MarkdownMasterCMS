---
title: Upgrade 5.1 to 6.0
seotitle: Upgrade notes for MarkdownMaster CMS 6.0
---


## New Database

An SQLite3 database is now supported and is available for plugins to utilize.

If you are using a plugin, (such as the new **popularity** plugin),
ensure to call `/install` in a web browser to create the database schemas.

**Note**, this `/install` will also handle upgrades to the schema too.


## New Cron

New webcron support has been added in 6.0.0 to allow background tasks to be automated.
This webcron adds a background XHR call in pages to `/cron` to have browsers kick off these tasks.

If you prefer to schedule this with a controlled service task, just call `/cron` in a curl request.


## `get()` vs direct access in templates

To standardize meta value retrieval and storage, raw values are now stored in objects as the native object
when possible.
A side effect of this means Dates are stored as actual Date objects.

```html
<% if(data.date) { %>
    <time><%= data.date %></time>
<% } %>

// Renders Mon May 26 2025 00:00:00 GMT-0400 (Eastern Daylight Time)
```

```html
<% if(data.date) { %>
    <time><%= data.get('date') %></time>
<% } %>

// Renders 26 May 2025
```

This change is a **breaking change** and requires updates to templates.  `data.date` to `data.get('date')`.
Standard checks for `if...` can still use the direct property.

This `.get()` can be used for **any** attribute on Files, not just dates.
All values are converted to appropriate string values for use within templates.