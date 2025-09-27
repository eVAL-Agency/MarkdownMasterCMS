---
title: Extra - Mastodon Comments
---

Adds page comments using a Mastodon post as a source.

Pages will not automatically have comments enabled, so once you publish a page you will
need to publish a new post on your Fediverse / Mastodon account, (or with a branded account),
on the server configured in the plugin configuration.

When you make a post, include a link to the page, some '#' tags about the content, 
and ideally a callback to ask for feedback or comments to boost engagement.

The ID will be visible in the URL of the post, ie:
on a post `https://social.veraciousnetwork.com/deck/@cdp1337/114594237700425231`
the ID is `114594237700425231`.

Copy this ID to the newly published page in the Frontmatter and ensure to wrap the ID in quotes
(single or double).

```yaml
---
...
fediverse: '114594237700425231'
---
```

## Initialization

To load this plugin, add the following to the `extras` block in your
[config.php](https://markdownmaster.com/docs/site-configuration.html) or
theme [settings.php](https://markdownmaster.com/docs/theme-development.html):

```php
'extras' => [
    // ...
    
    'mastodon-comments' => [
        'host' => 'your-mastodon-instance',
    ],
    
    // ...
],
```


## Configuration

- `host` - The hostname of your Mastodon instance.
- `styles` - Optionally set this to `false` to disable default styles.


## Required Schema

Pages must have a `fediverse` attribute to enable this feature on the individual pages.

(Note, the theme may override this attribute with a different attribute name, so refer to your theme documentation).

## Usage

Inside the page/post layout template:

```html
<% if(data.fediverse) { %>
    <section class="post-comments">
        <h2>Comments</h2>

        <mastodon-comments post-id="<%= data.fediverse %>"></mastodon-comments>
    </section>
<% } %>
```

## Example Styles

Refer to mastodon-comments.css for default styles.

## Source

Based off [code published by Carl Schwan](https://carlschwan.eu/2020/12/29/adding-comments-to-your-static-blog-with-mastodon/)
