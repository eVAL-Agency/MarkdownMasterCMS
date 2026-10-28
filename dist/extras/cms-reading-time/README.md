---
title: Extra - CMS-Reading-Time
---

Displays an estimated reading time for a page, based on the word count of its
article content. The estimate is computed entirely on the client.

## Initialization

To load this plugin, add the following to the `extras` block in your
[config.php](https://markdownmaster.com/docs/site-configuration.html) or
theme [settings.php](https://markdownmaster.com/docs/theme-development.html):

```php
'extras' => [
    // ...
    
    'cms-reading-time' => [],
    
    // ...
],
```

## Configuration

N/A

## Required Schema

N/A

## Usage

```html
<cms-reading-time></cms-reading-time>
```

When used with no attributes, it uses the current page (single view) as the
content source.

When used in a list, pass the file of each card:

```html
<% data.posts.forEach(function(post) { %>
    <article class="post">
        <h2 class="post-title"><a href="<%= post.permalink %>">
            <%= post.title %>
        </a></h2>
        <time class="post-date"><%= post.get('date') %></time>
        <cms-reading-time file="<%= post.permalink %>"></cms-reading-time>
    </article>
<% }) %>
```

**New in v6.0.0:**

Reading time can be displayed next to the title on a single page:

```markdown
<h1 class="page-title">
    <%= data.title %>
</h1>

<div class="post-subheading">
    <time class="post-date"><%= data.get('date') %></time>
    <cms-reading-time></cms-reading-time>
</div>
```

### Attributes

| Parameter  | Required | Example           | Description                                  |
|------------|----------|-------------------|----------------------------------------------|
| file       | no*      | "/posts/foo.html" | Permalink of the file to estimate            |
| speed      | no       | 200               | Words per minute used for the estimate       |
| words      | no       | "true"            | Also display the raw word count              |
| hide-short | no       | "true"            | Render nothing when content is under 1 min   |

\* If the `file` attribute is omitted, the current page is used.

#### Attribute File

The `file` attribute specifies the permalink of the content to estimate. When
omitted, the current page is used.

#### Attribute Speed

The reading speed, in words per minute. Defaults to `200`.

#### Attribute Words

When set, also displays the word count before the reading time, separated by a
"·" (e.g. `1,234 words · 3 min read`).

#### Attribute Hide-Short

When set, the element renders nothing if the estimated time is less than 1
minute, which is useful for short content.

## Accessibility

The element sets an `aria-label` describing the estimated reading time, so the
text is announced to screen readers. The displayed value (e.g. `3 min read`)
is also visible to all users.

## Example Styles

```css
/** <editor-fold desc="CMS Reading Time"> **/

.cms-reading-time {
	font-size: 0.9em;
	opacity: 0.7;
	font-style: italic;
	margin: 0 0.5rem 0;
}

.cms-reading-time-time {
	font-weight: bold;
}

.cms-reading-time-words {
	opacity: 0.6;
}

/** </editor-fold desc="CMS Reading Time"> **/
```

## Performance Note

In server mode, list files are not pre-loaded with their content. Each
`<cms-reading-time>` on a list card triggers one `fetch` of its markdown file
(on first load; `parseBody` caches the result). This only happens where you
choose to add the element per card.
