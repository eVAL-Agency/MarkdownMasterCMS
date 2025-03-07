---
title: Extra - CMS-Form
---



## Initialization

To load this functionality from HTML:

```html
<script>
CMS.loadExtra('cms-form', {...form configuration parameters...});
</script>
```

or from within `config.js`

```js
extras: {
  'cms-form': {...form configuration parameters...}
}
```


## Configuration

When running in server mode, the configuration can be pulled automatically from 
the server-side configuration in `config.php`.

```json
{
    "name-of-form": {
        "fields": {
            "field-name": { ...field-definition... },
            ...
        },
    },
}
```

Each field definition should be keyed with the field name and can contain the following fields:

- `label` - The label to display for the field
- `type` - The type of field (text, email, textarea)
- `placeholder` - The placeholder text for the field
- `required` - True/False Whether the field is required

Actions set from server configuration are only used on the backend and are not transmitted to the client.


## Required Schema

N/A


## Usage

```html
<cms-form name="contact" success="pages/contact-thanks"></cms-form>
```

Will render the author's profile using the default layout template.

### Attributes

- `name` - The key name of the form to render
- `success` - The page fragment to redirect to on successful submission


## Example Styles

N/A
