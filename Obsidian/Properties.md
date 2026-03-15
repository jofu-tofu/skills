# Obsidian Properties (Frontmatter)

Properties are YAML metadata at the top of notes. Obsidian recognizes 6 property types.

---

## Property Types
```yaml
---
# Text - single value
title: My Note Title
author: Daniel Miessler

# List - multiple values
tags:
  - topic1
  - topic2
aliases:
  - alternate name
  - another alias

# Number - numeric value
rating: 8
priority: 1

# Checkbox - boolean
completed: true
published: false

# Date - YYYY-MM-DD
created: 2026-01-22
due: 2026-02-15

# Date & Time - ISO 8601
modified: 2026-01-22T14:30:00
---
```

## Special Properties
```yaml
---
aliases: [alt1, alt2]            # Alternative names for linking
cssclass: custom-class           # Apply custom CSS
publish: true                    # Obsidian Publish visibility
tags: [tag1, tag2]               # Note tags
---
```

## Properties Impact
- **Search**: Filter by `[property:value]`
- **Graph**: Color/filter by properties
- **Dataview**: Query by any property
- **Templates**: Auto-populate properties
