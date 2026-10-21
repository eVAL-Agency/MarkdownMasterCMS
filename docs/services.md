---
title: Services Layer
seotitle: Using the Services layer in MarkdownMaster CMS
tags: [Development, Backend, Services]
---

The Services layer provides middleware and business logic functionality for the application.
Service classes are designed to encapsulate complex operations that span multiple layers
of the application architecture.

## Directory Structure

Service classes are located in `dist/backend/libs/MarkdownMaster/Services/`.

## Responsibilities

Service classes handle:
- **Middleware operations** - Cross-cutting concerns like authentication, logging, caching
- **Business logic** - Complex operations that don't fit cleanly into Model or Controller layers
- **Scheduled tasks** - Cron jobs and background processing (see [`Cron`](../dist/backend/libs/MarkdownMaster/Services/Cron.php))

## Service Class Guidelines

1. **Naming Convention**: Use the `Service` suffix for service classes (e.g., `CronService`, `AuthService`)
2. **Static Methods**: Services may use static methods for stateless operations, but prefer instance methods for stateful operations
3. **Dependencies**: Inject dependencies through constructor or setter injection rather than creating them internally
4. **Testing**: Service classes should be testable in isolation; avoid tight coupling to specific models or controllers

## Example Usage

```php
use MarkdownMaster\Services\CronService;

// Register a cron job
CronService::Register('cleanup_temp', 3600, function() {
    // Cleanup logic here
});

// Run due jobs
CronService::RunDue();
```
