---
title: CMS Button Tag
---

Tag to assist with rendering a fancy button on the page.
Has no inherit functionality other than adding a class `button` and support for an 
embedded icon using FontAwesome.

## Requirements

None

## Parameters

### icon

An icon to include inside the button


## Example

```html
<a href="https://site.tld" icon="download" is="cms-button">Download this Thing</a>

<!--
Renders to
<a href="https://site.tld" class="button">
    <i class="fa fa-download"></i>
    <span>Download this Thing</span>
</a>
-->
```

Also usable from within Markdown pages

```markdown
[Download this Thing](https://site.tld){is=cms-button icon=download}
```