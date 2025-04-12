---
title: Extra - CMS Theme Selector
---

Provide an interface for user to toggle light/dark theme.


## Initialization

To load this functionality from HTML:

```html
<script>
CMS.loadExtra('cms-theme-selector');
</script>
```

or from within `config.js`

```js
extras: {
  'cms-theme-selector': {}
}
```


## Configuration

N/A


## Required Schema

Requires CSS link files to be referenced with appropriate media query (`(prefers-color-scheme: ...)`).


## Usage

```html
<!-- in HEAD -->
<link rel="stylesheet" href="{{theme_dir}}css/light.css" media="(prefers-color-scheme: light)"/>
<link rel="stylesheet" href="{{theme_dir}}css/dark.css" media="(prefers-color-scheme: dark)"/>


<!-- in BODY somewhere -->
<cms-theme-selector class="theme-selector">
	<a href="#" class="theme-selector-link" data-theme="light" title="Change to light mode">
		<i is="cms-icon" icon="sun"></i>
	</a>
	<a href="#" class="theme-selector-link" data-theme="dark" title="Change to dark mode">
		<i is="cms-icon" icon="moon"></i>
	</a>
</cms-theme-selector>
```


The element will not modify the content within the `cms-theme-selector` tag,
but will only apply necessary events to trigger the theme change.

## Example Styles

```css
/* in light.css */
:root {
	--text-color: #444;
	--link-color: #1c3280;
	--background-color: #fff;
	--input-color: #333;
	--input-background: #ffffff;
}

.theme-selector-link[data-theme=light] {
	border: 1px solid;
	border-radius: 8px;
	background-color: #bed4ff;
}


/* in dark.css */
:root {
	--text-color: #777;
	--link-color: #7891e8;
	--background-color: #000;
	--input-color: #cccccc;
	--input-background: #151515;
}
.theme-selector-link[data-theme=light] {
	border: 0 none;
	background-color: var(--background-color);
}
.theme-selector-link[data-theme=dark] {
	border: 1px solid;
	border-radius: 8px;
	background-color: #242424;
}
```
