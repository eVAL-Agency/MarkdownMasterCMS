---
title: Scripts within Markdown
seotitle: How to inline javascript with MarkdownMaster CMS
author: Charlie Powell
tags: [Howto, Markdown, Authoring, Javascript]
description: Some notes on including Javascript from within Markdown pages in MarkdownMaster CMS.
---

Markdown supports inline HTML, including advanced functionality like Javascript.
Some caveats must be noted when including `<script>` tags within your content.

Since loading inline javascript cannot be done the same as regular HTML content,
the CMS extracts out any inline scripts and loads them separately in the footer of the page.

These scripts are loaded **after** the document has been rendered and in the order
in which they appear in the document.
This allows your scripts to be at the top of the markdown page, middle, or anywhere.


## Including Javascript

Just like with native HTML, scripts are supported with no additional workarounds required.

```markdown
This is an amazing article about dogs.  [See More](#){#see-more-link}

<script>
    document.getElementById('see-more-link').href = 'https://example.com';
</script>
```

Use of `(() => { ... })()` is not required, as inline scripts will already run as soon
as they are loaded, and that does not occur until after the document has been rendered.
If you prefer to use that format however, it will work just fine.


## Caveat - No Serverside Content

To prevent javascript from double-executing, the backend portion of the CMS will
remove any `<script>` tags from the page content prior to rendering on the initial page load.

This means that using `curl` or similar tools will return the page **without** the inline
`<script>` tags within body content.

If you require scripts to be available via command-line tools and external direct calls,
use a dedicated javascript file instead of an inline script.


## Note - Scripts in HTML Templates

HTML templates such as `index.html` and those within `layouts/` are not rendered server-side
and thus their script tags are not modified.
This _does_ mean that their execution is affected by the double-execution issue
of the browser first rendering the server-generated version,
so care must be taken with these to ensure proper execution.

Example: make use of `cms:route` or other events as [documented in the CMS events](document-events.md)
