---
title: Event hooks in Markdown Master PHP backend
---

## Event Hooks

The Events system to hook into various events that occur within the system.

### Usage

```php
use MarkdownMaster\Events\RenderPageViewEvent;

// Subscribe to an event
RenderPageViewEvent::Subscribe(function(RenderPageViewEvent $event) {
    // Plugin logic here
});
```

### Available Events

#### `RenderPageViewEvent`

Event that fires when an HTML page is being rendered by the server.

Provides an opportunity to manipulate the page rendering

#### `FileParsedEvent`

Event that fires while a Markdown file is being parsed.

Gives an opportunity to inject or manipulate variables within the File object itself.

### Debug Information

You can get debug information about registered hooks:

```php
$debug = HookService::GetDebugInfo();
print_r($debug);
```
