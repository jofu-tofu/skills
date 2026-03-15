# Obsidian Workflow Patterns

Common methodologies and workflows for organizing knowledge in Obsidian.

---

## Zettelkasten Method

**Philosophy**: Atomic, interconnected notes that grow organically.

**Structure**:
```
- Permanent notes: One idea per note, fully explained
- Literature notes: Summaries of sources
- Fleeting notes: Quick captures, process later
- MOCs: Maps of Content (hub notes)
```

**Naming**: Use timestamps or unique IDs: `202601221430 Concept Name`

**Key Practice**: Every note should link to at least one other note.

---

## PARA Method

**Philosophy**: Organize by actionability, not category.

```
📁 1-Projects/     # Active projects with deadlines
📁 2-Areas/        # Ongoing responsibilities
📁 3-Resources/    # Reference material by topic
📁 4-Archives/     # Inactive items from above
```

**Key Practice**: Move items between folders as status changes.

---

## GTD (Getting Things Done)

**In Obsidian**:
```markdown
Tags:
#inbox          # Unprocessed items
#next           # Next actions
#wait           # Waiting for someone
#someday        # Maybe later
#project        # Multi-step outcomes
```

**Daily Review**:
1. Process `#inbox` items
2. Review `#next` for today's work
3. Check `#wait` for follow-ups

---

## Daily Notes Workflow

**Structure**:
```markdown
# 2026-01-22

## Plan
- [ ] Top 3 priorities

## Log
- 09:00 - Started [[Project X]]
- 14:00 - Meeting with [[John Smith]]

## Notes
- Insight from today...

## Review
- What went well?
- What to improve?
```

**Linking**: Link to projects, people, and concepts mentioned.

---

## Research/Academic Workflow

**Structure**:
```
📁 Sources/        # PDFs and annotations
📁 Literature/     # Literature notes
📁 Concepts/       # Atomic concept notes
📁 Projects/       # Papers, theses
```

**Literature Note Template**:
```markdown
---
source: "[[Source Title]]"
authors:
year:
tags: [literature]
---

# Summary


# Key Points
-

# Quotes
> "Quote" (p. X)

# My Thoughts

```

---

## MOCs (Maps of Content)

Hub notes that organize a topic:
```markdown
# Programming MOC

## Core Concepts
- [[Variables]]
- [[Functions]]
- [[Data Structures]]

## Languages
- [[Python]]
- [[JavaScript]]
- [[Rust]]

## Practices
- [[Clean Code]]
- [[Testing]]
- [[Documentation]]
```
