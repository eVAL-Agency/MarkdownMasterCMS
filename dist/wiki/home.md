---
title: Example Wiki
---

Home content for an example wiki!  You can pin articles to this page by including
`pinned: true` in the frontmatter of the article.

These are pulled with the following HTML code within the markdown page:

```html
<cms-pagelist type="wiki" sort="title" filter-pinned=1 layout="wiki-pages-embed"></cms-pagelist>
```

## Pinned Articles

<cms-pagelist type="wiki" sort="title" filter-pinned=1 layout="wiki-pages-embed"></cms-pagelist>

## Recent Articles

<cms-pagelist type="wiki" limit="4" sort="recent" layout="wiki-pages-embed"></cms-pagelist>