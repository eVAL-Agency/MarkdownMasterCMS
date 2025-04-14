---
title: Extra - CMS-Pagelist
---

Provide a block of content from a collection, eg: a list of blog posts or a list of authors.


## Initialization

To load this functionality from HTML:

```html
<script>
CMS.loadExtra('cms-pagelist');
</script>
```

or from within `config.js`

```js
extras: {
  'cms-pagelist': {}
}
```


## Configuration

N/A


## Required Schema

N/A


## Usage

```html
<cms-pagelist type="posts"></cms-pagelist>
```

Note, when used in Markdown files, the directive must be on a single line.

```markdown
<cms-pagelist type="posts" sort="recent" limit="4"></cms-pagelist>
```

### Attributes


| Parameter | Required | Example                 | Description                                                    |
|-----------|----------|-------------------------|----------------------------------------------------------------|
| type      | yes*     | "posts", "pages", "etc" | Any valid content type defined on your site                    |
| layout    | no       | "post-list"             | Layout to use for rendering content, useful for controlling UX |
| sort      | no       | "datetime-r"            | Sort results by a specific key                                 |
| limit     | no       | 5                       | Limit the number of results returned                           |
| filter-*  | no       | "filter-tag"            | Filter results by a specific key                               |
| related   | no       | "this"                  | Retrieve related content based on tags (also defines type)     |


#### Attribute Type

Type is required and specifies the type of content to retrieve.

#### Attribute Sort
Sort allows the content to be sorted, multiple sort keys can be specified by separating them with a comma.
Common sort options are:

* title - Sort by the page title alphabetically A-Z (title-r for reversed)
* random - Sort results randomly
* recent - Sort by the most recent date
* datetime - Sort by oldest first (or datetime-r for newest first)

#### Attribute Filter

Filters can be any system or custom tag on pages, and multiple queries for the same filter
can be separated by a comma.  For example

```html
<cms-pagelist
    type="posts"
    layout="posts-embed"
    sort="recent"
    filter-author="<%= data.title %>, <%= data.alias %>"
    limit="9"
>
	Loading Content...
</cms-pagelist>
```

Here `author` is searched, with either the page `title` or the page `alias` used.

Regular expressions are also supported in values, for example to limit page results to a singular directory:

```html
<cms-pagelist
    type="posts"
    layout="posts-embed"
    sort="recent"
    filter-permalink="~ /posts/[^/]*.html"
    limit="9"
>Loading...</cms-pagelist>
```



All filter value modifiers include:

* `~` - Regular expression match
* `!~` - Regular expression not match (Added in v5.0.2)
* `<` - Less than value
* `<=` - Less than or equal to value
* `>` - Greater than value
* `>=` - Greater than or equal to value
* `=` - Exact match (default option)
* `!=` - Not equal to value (Added in v5.0.2)


#### Attribute Related (Added in v5.0.3)

Pull content related to the requested article, (based on matching tags).
If set to `related="this"`, the current page is used as reference, allowing templates to
dynamically pull related content based on the currently viewed page.

A specific URL fragment can be set as well, eg: `related="posts/some-post.html"`.

Using `related` will also set `type`, so defining that is not necessary when using `related`.


## Example Styles

N/A
