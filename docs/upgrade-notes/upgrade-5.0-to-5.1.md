---
title: Upgrade 5.0 to 5.1
seotitle: Upgrade notes for MarkdownMaster CMS 5.1
---

## CMS Tags Changes

The cms-tags plugin has been modified to exclude hard-coded '(...)' content
when rendering `as="cloud"`.  To restore this functionality, you can add
the following CSS to your theme:

```css
cms-tags .tag-weight::before {
    content: ' (';
}
cms-tags .tag-weight::after {
    content: ')';
}
```


## New Backend

The backend has been significantly updated; ensure to copy `backend/` and index.php
to include these new features.


## Shorter Descriptions

Descriptions in files have been truncated to 160 characters by default to improve SEO.
This may result in some content in your site being slightly shorter.
