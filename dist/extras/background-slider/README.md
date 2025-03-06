# Extra - Background Slider

Render child elements with the `.item` class inside the container as slider components.
Works by cycling through the children of the element, marking as `.active` one at a time.

Supports images, divs, and videos.  For normal elements, a timer is used to automatically advance the slide.
For videos, the next-slide advance is performed at the end of the video playback.

## Initialization

To load this plugin from raw HTML:

```html
<script>
	CMS.loadExtra('background-slider');
</script>
```

OR to load this plugin from a layout:

```html
<% CMS.loadExtra('background-slider'); %>
```

OR to load this plugin from a page:

```yaml
extras:
  - background-slider
```


## Configuration

None Required


## Required Schema

Schema is not required if items are manually defined in HTML.
When using auto-lookup mode, each video should have a `src` property,
images should have a `src` and `alt`, and text is just text.

example schema:

```yaml
backgrounds:
    - src: 'media/example-2845487.webm'
    - src: 'media/pexels-mccutcheon-1191710.webp'
      alt: 'Picture of multi colored pieces of plastic'
    - This is literal text that will get rendered in place of a background
```

## Usage

Example usage in a layout template using auto-lookup for items

```html
<% if (heading.backgrounds) { %>
    <% CMS.loadExtra('background-slider'); %>
    <background-slider
        class="page-cover-background"
        type="<%= data.type %>"
        file="<%= data.permalink %>"
        tag="heading.backgrounds">
    </background-slider>
<% } %>
```

Given the HTML:

```html
<background-slider timeout="5000">
    <img class="item" src="image1.jpg"/>
    <video class="item"><source src="video1.mp4"></video>
    <div class="item">Some HTML content</div>
</background-slider>
```

The first image will become `<img class="item active" src="image1.jpg"/>`
for 5 seconds.

Then that first item will have `.active` removed and the video playback will be started
and `.active` added to its class list.

After the video has ended, that video will have `.active` removed and the next `.item`
marked as `.active` for 5 seconds, before the loop restarts.


### Attributes

- `timeout` - The time in milliseconds to display each slide before advancing
- `type` - (AUTO MODE) The type of collection to pull backgrounds from
- `file` - (AUTO MODE) The specific file to pull backgrounds from (permalink of the file)
- `tag` - (AUTO MODE) The tag to pull backgrounds from


## Example Styles

```css
background-slider {
	position: relative;
}

background-slider .item {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	opacity: 0;
	transition: opacity 1s ease;
}

background-slider .item.active {
	opacity: 1;
}
```
