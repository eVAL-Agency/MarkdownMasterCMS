---
title: Extra - CMS Tags
---

Provides tag lists and tag clouds for collections.

## Initialization

To load this plugin, add the following to the `extras` block in your
[config.php](https://markdownmaster.com/docs/site-configuration.html) or
theme [settings.php](https://markdownmaster.com/docs/theme-development.html):

```php
'extras' => [
    // ...
    
    'cms-tags' => [],
    
    // ...
],
```


## Configuration

No configuration required

## Required Schema

Expects `tags` to be defined in the frontmatter of files.

Example:

```markdown
tags: [ 'tag1', 'tag2', 'tag3' ]
```

or

```markdown
tags:
    - tag1
    - tag2
    - tag3
```


## Usage

Pull the tags for a specific file

```html
<cms-tags type="posts" file="<%= data.permalink %>"></cms-tags>
```

Pull the tags for all files as a weighted cloud list

```html
<cms-tags type="posts" as="cloud"></cms-tags>
```


### Attributes

- `type` - The type of collection to pull tags from
- `file` - The specific file to pull tags from (permalink of the file)
- `as` - The style of tag list to render (default, cloud)
- `sort` - The sort order to use for the tags

## Example Styles

```css
cms-tags:before {
    content: '🏷 ';
}
cms-tags .tag-weight-1 {
    font-size: 50%;
}
cms-tags .tag-weight-2 {
    font-size: 60%;
}
cms-tags .tag-weight-3 {
    font-size: 70%;
}
cms-tags .tag-weight-4 {
    font-size: 80%;
}
cms-tags .tag-weight-5 {
    font-size: 90%;
}
cms-tags .tag-weight-6 {
    font-size: 100%;
}
cms-tags .tag-weight-7 {
    font-size: 110%;
}
cms-tags .tag-weight-8 {
    font-size: 120%;
}
cms-tags .tag-weight-9 {
    font-size: 130%;
}
cms-tags .tag-weight-10 {
    font-size: 140%;
}
```
