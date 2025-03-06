# Extra - Active Nav

Adds a class name to navigation elements that match the page URL.

## Initialization

To load this plugin from raw HTML:

```html
<script>
	CMS.loadExtra('active-nav', {
		'navSelector': 'nav li',
		'navActiveClass': 'active'
	});
</script>
```


## Configuration

- `navSelector` - The selector to use to find navigation elements to check.
- `navActiveClass` - The class name to add to the navigation element when active.


## Required Schema

N/A

## Usage

N/A

## Example Styles

```css
nav li {
	color: #001447;
}
nav li.active {
	color: #0000e8;
}
```
