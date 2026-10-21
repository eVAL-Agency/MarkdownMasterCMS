---
title: Hooks in backend application
---

## HookService

The HookService provides an event dispatching system for plugins.

### Usage

```php
use MarkdownMaster\Services\HookService;

// Register a hook
HookService::Register('file_saved', 'Called when a file is saved');

// Add a callback to the hook
HookService::Add('file_saved', function($file) {
    // Plugin logic here
});

// Run the hook
HookService::Run('file_saved', $file);
```

### Debug Information

You can get debug information about registered hooks:

```php
$debug = HookService::GetDebugInfo();
print_r($debug);
```
