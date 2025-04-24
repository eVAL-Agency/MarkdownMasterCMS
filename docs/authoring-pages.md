---
title: Authoring Pages and Markdown Reference
seotitle: Writing page content with MarkdownMaster CMS
author: Charlie Powell
tags: [Howto, Markdown, Authoring]
description: Authoring page content in MarkdownMaster CMS is easy and flexible.  This 
  guide will help you get started.
---

Since all pages in MarkdownMaster CMS are simply plain text markdown files,
writing content is as easy as writing a text file.
In addition to all the 
[basic syntaxes available in Markdown](https://daringfireball.net/projects/markdown/basics){target=_blank},
there are a number of additional format options provided to simplify web authoring.


## Content Types

Different themes will support different content types, but the `pages` type is pretty
ubiquitous, and those content files are stored in the `pages` directory of the site root.

Blog-oriented themes will often use `posts` and `authors` as well,
for publishing blog articles (differentiated from just content pages), and author information.

Each different type is meant to contain different type of data, but it is up to your discretion
as to how granular to take this approach.
For example, a blog site may have blog posts and reviews.

Option 1: you have object type `posts` all listed within `/posts.html` and a separate
`reviews` all listed within `/reviews.html` or

Option 2: you have `posts` which support both blog post content and review content,
all shared within the posts listing section.

Either are acceptable solutions, and it depends on site admin preference.

---

To create a new page, post, author, etc, create a new `.md` text file within the desired
directory or copy an existing file or template.  Nested directories ARE supported,
but common practices advise against nesting too deeply.

A common usage (especially for posts), is to group files by date published
to better organize them, otherwise you will end up with a mess of files and assets.

The following directory structure examples will all provide the same automatic date string parsing from the URL.

```
# All posts are just in the root directory
 - posts/
    |- 2021-01-02-something.md
```

```
# Group posts by year, include month and day in the filename
 - posts/
    |- 2021/
       |- 01-02-something.md
```

```
# Group posts by year, month, then day (probably excessive)
 - posts/
    |- 2021/
       |- 01
          |- 02
             |- something.md
```

```
# Group posts by year and month, include day in filename
 - posts/
    |- 2021-01/
       |- 02-something.md
```


## Page Meta Data

HTML pages have a number of meta attributes that are used to describe the page to search engines and other tools.
This goes outside the scope of basic markdown, but is supported in MarkdownMaster CMS
via YAML front matter.

This metadata conforms to the 
[standard YAML specification](https://yaml.org/spec/1.2.2/#chapter-2-language-overview){target=_blank} 
markup at the beginning of each file inside `---` blocks.

```yaml
---
title: Authoring Pages
author: Charlie Powell
tags: [Howto, Markdown, Authoring]
---
```

_Note, it's important that the **very first line** is `---`._
If the first line in the file is not `---`, the YAML front matter will not be parsed
and this metadata will be considered part of the body.

### Tags and Lists of Values

To define a list of tags, wrap the tags with `[ ... ]` or list them on each line with a `-` prefix, 
for example these two will provide the same results:

```yaml
tags: [Howto, Markdown, Authoring]
```

```yaml
tags: 
  - Howto
  - Markdown
  - Authoring
```

By default, tags are used to provide tag clouds and cross links for blog content.

### Images and URLs

For images and URLs where extra information may be needed, 
it is often beneficial to break them out into the various important tag.

```yaml
banner:
  src: images/page_banner.jpg
  alt: A banner image featuring something

call_to_action:
  href: https://mysite.tld
  title: Check Out My Cool Thing!
```

**IMPORTANT**, when tags are defined with a `src` or `href` key,
the value is auto-mapped based on the location of the file.

Example: 

```markdown
// File /pages/some-page.md on https://mysite.tld contents:
---
image:
  src: media/some_image.jpg
---
```

This will resolve `image.src` to `https://mysite.tld/pages/media/some_image.jpg`

If the value is fully resolved already, it will not be modified.

If the value starts with `/`, it is assumed to be at the root of the website, and just the URL is prepended.


### Common Meta Attributes

| Attribute   | Description                                                           |
|-------------|-----------------------------------------------------------------------|
| layout      | An alternative layout template for rendering this file                |
| title       | Title to use for H1 and on listing pages                              |
| seotitle    | Browser title to set when viewing the page                            |
| excerpt     | Short excerpt or description of this page to display on listing pages |
| description | Description of this page to use for SEO purposes                      | 
| date        | Date this article was published                                       |
| author      | Name or alias of the author of this page                              |
| tags        | Comma-separated list of tags for the content on this page             |
| image       | Fully resolve or relative path to preview image of this page          |


### Protected Attributes

**DO NOT USE THESE!** 
These are reserved for internal use only, but are available for use in your templates.

| Attribute   | Description                                                           |
|-------------|-----------------------------------------------------------------------|
| body        | The raw markdown content of this page                                 |
| bodyLoaded  | The rendered HTML content of this page                                |
| config      | The configuration object for this page                                |
| content     | The rendered HTML content of this page                                |
| name        | The filename of this page                                             |
| permalink   | The permalink of this page                                            |
| type        | The type of content this is (page, post, etc)                         |
| url         | The URL of this page                                                  |


### Other Attributes

Themes will support additional parameters; consult the documentation for the installed theme
for more information about specific attributes that may be supported.


## Page Content and Markdown

Since this is a _markdown_ content system, markdown syntax is used for writing the articles.  
Refer to the 
[official markdown syntax guide](https://daringfireball.net/projects/markdown/syntax){target=_blank} 
for a refresher on details.


### Headers (H1-H6)

By default, page headers (H1 elements) are rendered within the layout template for content based off metadata, so 
the inclusion of one is not necessary.

```markdown
---
title: My Page
---

# My Page

...
```

This example will produce the following result because the page title is effectively defined twice:

```html
<h1>My Page</h1>
<h1>My Page</h1>
```

Each page should have one and only one `H1` tag, but can contain multiple H2 through H6 tags.

To write sub heading tags, use the following:

```markdown
## Sub Heading (renders <h2/>)

...

### Tertiary Heading (renders <h3/>)
```

### Lists

Lists start with either `* `, `+ `, or `- `; all produce the same result.

```markdown
* Red
* Green
* Blue
```

```markdown
+ Red
+ Green
+ Blue
```

```markdown
- Red
- Green
- Blue
```

Ordered lists are prepended by the item number

```markdown
1. Red
2. Green
3. Blue
```

### Images

Images within markdown should use the following format and can be absolutely resolved,
(including https:// prefix or just using an absolute path), or relatively resolved
based on the file it is within.

Please note though, for the default home page content, those images should only be absolutely resolved
as crawlers will complain about the URL otherwise.

```markdown
// Renders <img src="text-icon.gif" alt="test image"/>
![test image](test-icon.gif)
```


### Links

```markdown
// Renders <a href="/pages/about.html">About</a>
[About](/pages/about.html)
```

Links to markdown files will automatically convert to the `.html` extension, example:

```markdown
// Renders <a href="/pages/about.html">About</a>
[About](/pages/about.md)
```

Besides the basic markdown formatting, this web software supports additional arguments on links.

```markdown
// Renders Checkout our <a href="https://external.tld" target="_blank">partner</a>
Checkout our [partner](https://external.tld){target=_blank}
```


### HTML Attributes

As part of the extended Markdown syntax supported in this platform, 
custom attributes can be added to various elements.

* paragraphs
* links
* images

To use HTML attributes, append `{...}` to the end of the line with the HTML tags inside.
As some examples:

Short paragraph with `class="center"` added

```markdown
This is a short example paragraph {.center}
```

```markdown
Longer and multi-line paragraphs also support custom attributes.
These can be added _after_ the last line, without a blank space between.
{.center}
```

This link will have a `title` and `target` set.
Since both paragraphs and links support extended attributes, try to ensure
no space between the link and curly brace.

```md
[Go Search](https://www.duckduckgo.com){title="Search for something" target=_blank}
```

This image will have a border

```markdown
![test image](test.png){style="border:5px solid pink;"}
```

#### Valid Attributes and Shorthand

Below is a list of attributes and shorthand versions,
but ANY HTML ATTRIBUTE is supported.

| Attribute  | Description             | Example                            |
|------------|-------------------------|------------------------------------|
| "." prefix | Shorthand for class=... | `{.center}`                        |
| "#" prefix | Shorthand for id=...    | `{#myid}`                          |
| style      | CSS style attributes    | `{style="border:5px solid pink;"}` |
| title      | Title attribute         | `{title="My Title"}`               |
| target     | Target attribute        | `{target=_blank}`                  |
| data-*     | Data attributes         | `{data-foo="bar"}`                 |


### Abbreviations

Particularly useful for technical documents with abbreviations, the abbr syntax
will replace any instance of the abbreviation with an appropriate `<abbr>` tag.

```markdown
MarkdownMaster CMS is a web platform to allow you to rapidly publish content!

*[CMS]: Content Management System
```

Will replace `CMS` with `<abbr title="Content Management System">CMS</abbr>` when rendered.


### Blockquotes

```markdown
> This is a blockquote.
> 
> This is the second paragraph in the blockquote.
>
> ## This is an H2 in a blockquote
```

Renders

```html
<blockquote>
    <p>This is a blockquote.</p>

    <p>This is the second paragraph in the blockquote.</p>

    <h2>This is an H2 in a blockquote</h2>
</blockquote>
```
