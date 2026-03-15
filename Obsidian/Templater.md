# Templater Plugin

Templater enables dynamic templates with JavaScript execution.

---

## Basic Syntax
```markdown
<% tp.date.now("YYYY-MM-DD") %>         # Current date
<% tp.file.title %>                      # Current file name
<% tp.file.cursor() %>                   # Place cursor here
```

---

## tp Object Reference

| Object | Purpose | Example |
|--------|---------|---------|
| `tp.date` | Date operations | `tp.date.now("YYYY-MM-DD")` |
| `tp.file` | File operations | `tp.file.title`, `tp.file.rename()` |
| `tp.system` | System functions | `tp.system.prompt("Question?")` |
| `tp.user` | User functions | `tp.user.myFunction()` |
| `tp.web` | Web requests | `tp.web.random_picture()` |

---

## Template Examples

### Daily Note Template
```markdown
---
created: <% tp.date.now("YYYY-MM-DD") %>
tags: [daily]
---

# <% tp.date.now("dddd, MMMM D, YYYY") %>

## Morning
- [ ]

## Tasks
- [ ]

## Notes


## Evening Reflection

```

### Meeting Note Template
```markdown
---
created: <% tp.date.now("YYYY-MM-DDTHH:mm") %>
type: meeting
attendees:
tags: [meeting]
---

# Meeting: <% tp.system.prompt("Meeting topic?") %>

**Date**: <% tp.date.now("YYYY-MM-DD HH:mm") %>
**Attendees**:

## Agenda
1.

## Discussion


## Action Items
- [ ]

## Next Steps

```

---

## User Functions

Create reusable functions in `Scripts/` folder:
```javascript
// Scripts/greeting.js
function greeting(name) {
    return `Hello, ${name}!`;
}
module.exports = greeting;
```

Use in templates:
```markdown
<% tp.user.greeting("Daniel") %>
```
