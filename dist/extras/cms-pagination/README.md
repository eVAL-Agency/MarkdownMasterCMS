# CMS Pagination Extra

A configurable pagination component for MarkdownMaster CMS collections.

## Usage

```html
<!-- Default behavior (all the features) -->
<cms-pagination></cms-pagination>

<!-- Minimal: Only show current page -->
<cms-pagination adjacent-pages="0" show-first="0" show-last="0"></cms-pagination>

<!-- Compact: Show current ±2 pages, no first/last buttons, no ellipsis -->
<cms-pagination adjacent-pages="2" show-first="0" show-last="0" ellipsis=""></cms-pagination>
```

## HTML Attributes

| Attribute        | Default | Description                                                                  |
|------------------|---------|------------------------------------------------------------------------------|
| `show-first`     | true    | Show/hide First page button                                                  |
| `show-last`      | true    | Show/hide Last page button                                                   |
| `adjacent-pages` | 2       | Number of pages to show on each side of current page (0 = none, N = up to N) |
| `ellipsis`       | '...'   | Non-empty value renders the value between skipped page buttons               |
