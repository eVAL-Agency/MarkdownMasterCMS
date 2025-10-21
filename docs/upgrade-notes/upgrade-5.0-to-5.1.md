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

The backend has been significantly updated; ensure to copy `backend/` and `index.php`
to include these new features.


## Shorter Descriptions

Descriptions in files have been truncated to 160 characters by default to improve SEO.
This may result in some content in your site being slightly shorter.


## Type Declaration Change

Types are now defined on the server to better support advanced backend features.
For client-only sites this is unnecessary, but default installations must move 
`CMS.addType(...)` calls to the server-side `config.php` or theme `settings.php`.

This is generally a 1-to-1 swap, converting the JS / JSON syntax to PHP syntax.

Additionally, the new dynamic type declaration must be added to your theme `index.html`:

```html
<script>
// Setup all page types supported by this theme
CMS.config.addTypes({{types}});
</script>
```