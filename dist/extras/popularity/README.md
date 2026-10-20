---
title: "Extra: Page Popularity Tracking"
seotitle: Page Popularity Tracking in MarkdownMaster CMS
author: Charlie Powell
tags: [Howto, Configuration]
---

## Overview

MarkdownMaster CMS includes a server-side page popularity tracking system that records 
visitor views and calculates weighted scores for each page. 
This system is designed to be privacy-conscious, 
with no raw IP addresses or user agent strings stored; only hashes are used.

The system works by:

1. Recording page views on the server with visitor identification (hashed by IP+UA)
2. Aggregating view counts into daily buckets
3. Calculating a decayed log-scaled score based on traffic

## How it Works

### Visitor Tracking

When a visitor accesses a page, their IP address and User-Agent string are hashed 
to create a unique identifier that cannot be reverse-engineered to reveal the original information.

All visitor data is stored in a SQLite database (`data/cms.sqlite` by default) with the following structure:

- **views table**: Stores individual view records with visitor hashes
- **daily table**: Aggregated daily view counts (rolled up from views)


### Daily Rollup

Views are aggregated daily to reduce database size and improve performance. The rollup process:

1. Groups views by page and day
2. Inserts/upserts the data into the `daily` table
3. Removes rolled rows in the `views` table
4. Purges old rolled data older than 90 days

### Scoring System

The popularity score is calculated using a decayed log-scaled formula:

```
weighted = Σ views(day) * 2^(-age_days / halfLifeDays)
score = log10(1 + weighted)
```

Where:
- `views(day)` = number of human visitors for that day
- `age_days` = how many days old the data is (from today)
- `halfLifeDays` = controls how quickly scores decay (default 7 days)

## Configuration

### Popularity Block

```php
'popularity' => [],
```

## Installation

To install this popularity feature, add `popularity` to your `extras` config
and then access `/install` to install the database.

When accessing `/install`, you will only just see 'OK'.

Check the error log or enable debug mode to check for errors.


## Scheduling / Webcron

The popularity rollup and cleanup jobs run on a cron schedule.
You can set up a webcron endpoint by calling:

```bash
curl -X GET "https://yoursite.com/cron"
```

This endpoint is idempotent and safe from double-execution, so it's safe to call via cron or healthchecks.

## Client-side Usage

### Meta.json Exposure

The popularity score is exposed in the `/meta.json` endpoint as a `popularity` field on each page entry. 
The value is an int, generally on a score between 0 and 9999.

Example:
```json
{
    "pages": [
        {
            "url": "/pages/home.html",
            "path": "pages/home.md",
            "meta": {
                "title": "Home"
            },
            "timestamp": 1680000000,
            "popularity": 2154
        }
    ]
}
```

When the popularity feature is disabled or not configured, the `popularity` field is omitted entirely.

### Client Integration

In client-side JavaScript, you can access the popularity score via:

```javascript
File.getMeta('popularity') // Returns null or a numeric score
// Or from meta.json:
file.popularity // Returns null or a numeric score
```

### Integration with pagelist

A primary purpose of this feature is to integrate with the pagelist directive
to provide additional sorting and filtering options.

```markdown
## Popular Posts

<cms-pagelist type="posts" sort="popularity"></cms-pagelist>

## Really Popular Posts

<cms-pagelist type="posts" sort="popularity" filter-popularity="> 500"></cms-pagelist>
```

## Privacy Notes

- No raw IP addresses or user agent strings are stored
- All visitor data stored is hashed
- Hashed data is cleared during the rollup each day
- Aggregated data is purged after 90 days to minimize storage

## Disabling Popularity Tracking

To disable the popularity tracking system entirely:

Remove or comment out the `popularity` block from your config.php
