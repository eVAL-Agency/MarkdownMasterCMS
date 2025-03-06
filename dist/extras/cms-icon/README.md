# Extra - CMS-Icon

Simple icon renderer


## Initialization

To load this functionality from HTML:

```html
<script>
CMS.loadExtra('cms-icon');
</script>
```

or from within `config.js`

```js
extras: {
  'cms-icon': {}
}
```


## Configuration

N/A


## Required Schema

N/A


## Usage

```html
<i icon="camera" is="cms-icon"></i>
```

Will use the loaded icon library for rendering the actual icons.
(Currently only FontAwesome is supported.)


## Example Styles

N/A
