# Dataview Plugin

Dataview turns your vault into a queryable database.

---

## Query Types

### TABLE
```markdown
```dataview
TABLE file.name, rating, tags
FROM "Books"
WHERE rating >= 4
SORT rating DESC
LIMIT 10
```
```

### LIST
```markdown
```dataview
LIST
FROM #project AND -#archived
SORT file.mtime DESC
```
```

### TASK
```markdown
```dataview
TASK
FROM "Projects"
WHERE !completed
GROUP BY file.link
```
```

### CALENDAR
```markdown
```dataview
CALENDAR file.ctime
FROM "Daily Notes"
```
```

---

## Inline Queries
```markdown
Today is `= date(today)`.
This note has `= length(file.inlinks)` backlinks.
Last modified: `= this.file.mtime`.
```

---

## Common Query Patterns

### Recent Notes
```markdown
```dataview
TABLE file.mtime as Modified
FROM ""
SORT file.mtime DESC
LIMIT 10
```
```

### Notes Without Tags
```markdown
```dataview
LIST
FROM ""
WHERE length(file.tags) = 0
```
```

### Tasks Due This Week
```markdown
```dataview
TASK
FROM ""
WHERE due >= date(today) AND due <= date(today) + dur(7 days)
SORT due ASC
```
```

---

## DataviewJS

For complex queries, use JavaScript:
```markdown
```dataviewjs
const pages = dv.pages("#project")
    .where(p => p.status === "active")
    .sort(p => p.priority, "desc");

dv.table(
    ["Project", "Priority", "Due"],
    pages.map(p => [p.file.link, p.priority, p.due])
);
```
```
