---
title: Backend Hooks
seotitle: Using backend hooks in MarkdownMaster CMS
tags: [Development, Backend, Hooks]
---

As of MarkdownMaster CMS v5.1.0, backend hooks have been implemented to allow plugins
to tap into core functionality such as page rendering.

Hooks allow for multiple events to be handled, called in the order they were added.

## Available Hooks

### render_page_view 

Runs at the time of page rendering, allowing modification of the view.

Parameters:

* $0 File - The source file object being rendered.
* $1 HTMLTemplateView - The view object containing template and data.


## Registering Hooks

Hooks can be dynamically used without any formal registration,
but registering a hook allows for defining a description which can be helpful to developers.

```php
use MarkdownMaster\Hooks;

Hooks::Register('your_custom_hook', 'Description of what this hook does and what parameters can be expected.');
```

## Dispatching Hooks

To dispatch a hook, use the `Run` method.

```php
use MarkdownMaster\Hooks;

Hooks::Run('your_custom_hook', $param1, $param2, ...);
```

## Attaching to Hooks

To attach a function to a hook, use the `Add` method.

```php
use MarkdownMaster\Hooks;
Hooks::Add('your_custom_hook', function($param1, $param2, ...) {
    // Your code here
});
```

## Debugging Hooks

When the site is in `debug` mode, all registered hooks and attach sources are listed in the Javascript console.

```
Backend Hooks: 
Object { 
    render_page_view: Object { 
        description: "Modify the page view before rendering, provides the arguments File and HTMLTemplateView.", 
        calls: Array [ "extras/matomo/autoload.php" ]
    }
}
```

Hook calls do not list the actual function called, only the file where the hook was added.