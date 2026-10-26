---
title: Listing Tags
author: Charlie Powell
tags: [Howto, HTML, Authoring]
---

Tags are a first-class feature of MarkdownMaster CMS and are pulled from the metadata.

To add tags to a page, use the `tags` key in the frontmatter.

```markdown
---
title: My Page
tags:
  - some_tag
  - another_tag
---
```

or alternative usage for a short list of tags:

```markdown
---
title: My Page
tags: [some_tag, another_tag]
---
```

For a more full-featured plugin for rendering tags, refer
to the [CMS tags plugin](https://markdownmaster.com/docs/extras/cms-tags.html).

## Manually Using Tags

Tags can be accessed from the `data` object when viewing listing pages.

### Get All Tags

Get all tags across all pages under this listing type.

```html
<% tags = data.getTags() %>
```

### Get Filtered Tags

Get tags across all pages under this listing type based on current filters.
Useful for complex systems that combine different filters for the view.

```html
<% tags = data.getFilteredTags() %>
```

### Get Tag URL (Simple)

Tags from getTags() and getFilteredTags() contain a `url` property which can be used in links.
This is a simple version of the tag URL that does not include any filters.

```html
<% data.getTags('weight-r').forEach(function(tag) { %>
    <a
        href="<%= tag.url %>"
        title="<%= tag.name %> - <%= tag.count %> <% if(tag.count>1){ %>posts<% } else { %>post<% } %>">
        <%= tag.name %>
    </a>
<% }) %>
```

### Get Tag URL (Complex)

The listing object FileCollection provides `getPageTagUrl()` which can generate a URL
taking into account the current filtered tags.

This is notably useful for combining filters in a complex system.

```html
<% data.getFilteredTags('weight-r').forEach(function(tag) { %>
    <a
        href="<%= data.getPageTagUrl(tag.name) %>"
        title="<%= tag.name %> - <%= tag.count %> <% if(tag.count>1){ %>posts<% } else { %>post<% } %>">
        <%= tag.name %>
    </a>
<% }) %>
```

### Check if a tag is used

You can use `hasFilterTag()` to check if the given tag is used in the current filters.

```html
<% if(data.hasFilterTag('test')) { %>
    The "test" tag is used.
<% } %>
```
