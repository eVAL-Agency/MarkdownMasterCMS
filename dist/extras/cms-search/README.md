# Extra - CMS-Search

Provides search input functionality that hooks into the site


## Initialization

To load this functionality from HTML:

```html
<script>
CMS.loadExtra('cms-search');
</script>
```

or from within `config.js`

```js
extras: {
  'cms-search': {}
}
```


## Configuration

N/A


## Required Schema

N/A


## Usage

```html
<input is="cms-search" type="posts"/>
```

**Attributes**

- `type` - The type of collection to search


## Example Styles

N/A
