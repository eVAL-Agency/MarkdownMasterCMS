---
title: Extra - Chart.js
---

Renders data charts (bar / line / pie / donut) from a native Markdown table inside a `:::` container, 
using Chart.js v4 on the client.

## Initialization

To load this plugin, add the following to the `extras` block in your
[config.php](https://markdownmaster.com/docs/site-configuration.html) or
theme [settings.php](https://markdownmaster.com/docs/theme-development.html):

```php
'extras' => [
    // ...

    'chartjs' => [],

    // ...
],
```

## Configuration

The chartjs extra supports the following global configuration options:

| Key        | Default                    | Description                               |
|------------|----------------------------|-------------------------------------------|
| `colors`   | `[ '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40' ]` | Array of CSS color strings used as the dataset palette |
| `title`    | `true`                     | Whether to display chart titles           |
| `legend`   | `true`                     | Whether to display the legend             |

Example configuration in PHP:
```php
'extras' => [
    'chartjs' => [
        'colors' => [ '#FF0000', '#00FF00', '#0000FF' ],
        'title' => false,
        'legend' => true
    ],
],
```

## Usage

### Basic Chart Types

#### Bar Chart
```
:::bar
# Monthly Signups
| Month | Signups |
|:-----:|--------:|
| Jan   | 10      |
| Feb   | 45      |
| Mar   | 22      |
:::
```

#### Line Chart
```
:::line
# Sales Trend
| Month | Revenue | Expenses |
|-------|---------|----------|
| Jan   | 100     | 60       |
| Feb   | 150     | 80       |
| Mar   | 200     | 90       |
:::
```

#### Pie Chart
```
:::pie
# Market Share
| Product | Share |
|---------|-------|
| A       | 40    |
| B       | 30    |
| C       | 20    |
| D       | 10    |
:::
```

#### Donut Chart
```
:::donut
# Budget Allocation
| Category | Amount |
|----------|--------|
| Marketing| 500    |
| R&D      | 300    |
| Operations| 200   |
:::
```

### Chart Options

#### Stacked Bar/Line Charts
Use the `.stacked` class to enable stacked charts:

```
:::bar .stacked
# Team Performance
| Task | Alice | Bob | Carol |
|------|-------|-----|-------|
| Task 1 | 50    | 70  | 60    |
| Task 2 | 80    | 90  | 40    |
:::
```

#### Line Fill
Use the `.fill` class to fill the area under line charts:

```
:::line .fill
# Temperature
| Day | Celsius |
|-----|---------|
| Mon | 20      |
| Tue | 22      |
| Wed | 18      |
| Thu | 25      |
:::
```

#### Hide Legend
Use the `.no-legend` class to hide the legend:

```
:::pie .no-legend
# Preferences
| Color | Count |
|-------|-------|
| Red   | 30    |
| Blue  | 40    |
| Green | 30    |
:::
```

### Chart Styling

The charts use a default color palette, which can be customized via the `colors` configuration option. Colors are applied in order to datasets.

## No-JS Fallback

If JavaScript is disabled or the chartjs extra fails to load, the raw Markdown table will remain visible as-is. This fallback works automatically since the table is only replaced during the upgrade process, not before.

This extra is client-side only and its scripts are stripped for crawlers.