# Obsidian Plugin Patterns

Use this file when a workflow may benefit from plugin-specific capabilities.

---

## Rule

- Never assume a community plugin is installed. Verify it from the vault when possible, or present the plugin as an optional recommendation.

---

## Core Plugins Worth Remembering

| Plugin | Agent-relevant use |
|--------|--------------------|
| Backlinks | Find linked mentions and unlinked mentions for the active note |
| Canvas | Spatially arrange notes, files, and web pages; text-only cards do not create backlinks |
| Properties View | Inspect and edit structured metadata consistently |
| Templates | Apply repeatable note scaffolds |
| Search | Search by text, path, tags, and properties |
| Bookmarks | Save recurring working sets for a topic or project |

---

## Community Plugins Often Worth Suggesting

| Plugin | Useful for | Agent use |
|--------|------------|-----------|
| Dataview | Live queries and dashboards | Generate LIST, TABLE, TASK, and CALENDAR views |
| Templater | Dynamic templates and JavaScript | Reusable note scaffolds and scripted note setup |
| QuickAdd | Capture flows and macros | One-shot capture, append, or template workflows |
| Smart Connections | Semantic related-note discovery | Gather relevant notes and assemble context packs |
| Modal Form | Structured data capture | Collect properties/frontmatter consistently |
| Tasks | Task dashboards and filtering | Build task-focused views instead of plain lists |
| Advanced URI | URI-driven automation | Open, edit, create notes, or trigger commands externally |
| Local REST API | External automation | Read, write, patch, and list notes from outside Obsidian |
| Excalidraw | Freeform sketching | Use only when hand-drawn or sketchy visuals matter |

---

## Suggestion Heuristics

- Prefer core features first.
- Suggest Dataview when the user wants live, query-backed views.
- Suggest QuickAdd or Templater when the same capture pattern repeats.
- Suggest Smart Connections when semantic related-note lookup would help more than title search.
- Suggest Advanced URI or Local REST API only for external automation workflows.
- Suggest Excalidraw only when Mermaid, Canvas, MOCs, or tables would lose the intended value.
