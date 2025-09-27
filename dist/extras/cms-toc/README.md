---
title: Extra - CMS-TOC
---

Generate a table of contents for a page, based on the headings within the page.


## Initialization

To load this plugin, add the following to the `extras` block in your
[config.php](https://markdownmaster.com/docs/site-configuration.html) or
theme [settings.php](https://markdownmaster.com/docs/theme-development.html):

```php
'extras' => [
    // ...
    
    'cms-toc' => [],
    
    // ...
],
```


## Configuration

N/A


## Required Schema

No schema is required, but use of heading tags (H1-H6) is required for the table of contents to be generated.


## Usage

```html
<ul is="cms-toc"></ul>
```

Note, when used in Markdown files, the directive must be on a single line.

```markdown
<ul is="cms-toc"></ul>
```

These will generate the example result:

```html
<ul is="cms-toc">
	<li class="level-0">
		<a href="#">(Top)</a>
	</li>
	<li class="level-0">
		<a href="#some-heading">Some Heading</a>
	</li>
	<li class="level-1">
		<a href="#some-subheading">Some Subheading</a>
	</li>
</ul>
```

## Example Styles

```css
ul[is=cms-toc] {
	list-style: none;
	padding-left: 0;
	border-top: 1px solid;
}
ul[is=cms-toc] li {
	margin: 1rem 0;
	padding-left: 0;
}
ul[is=cms-toc] li.level-1 {
	padding-left: 1rem;
}
ul[is=cms-toc] li.level-2 {
	padding-left: 2rem;
}
ul[is=cms-toc] li.level-3 {
	padding-left: 3rem;
}
ul[is=cms-toc] li.level-4 {
	padding-left: 4rem;
}
```
