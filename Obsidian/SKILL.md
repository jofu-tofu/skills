---
name: Obsidian
description: Obsidian-native capability enhancer for note work. USE WHEN working in an Obsidian vault and the task should leverage wikilinks, backlinks, properties, Dataview, Mermaid, Canvas, templates, or related-note context instead of plain markdown editing. Helps improve notes, gather vault context, build dashboards and MOCs, and choose the right visual form.
compatibility: Designed for Claude Code and Devin (or similar agent products). Requires access to an Obsidian vault directory.
metadata:
  author: pai
  version: "1.0.0"
---

# Obsidian

Use this skill to make agents Obsidian-native rather than markdown-generic. It focuses on linking, context gathering, properties and queries, and choosing the right representation for a note. Folder routing belongs to the vault's `CLAUDE.md` tree, not this skill.

## Vault Location

```
Path: C:\Users\fujos\Obsidian
```

PAI has direct read/write access.

## Working Stance

- Prefer note-native improvements: wikilinks, aliases, embeds, properties, Dataview, and MOCs.
- Prefer Mermaid, Canvas, MOCs, or Dataview before Excalidraw unless the user explicitly wants sketchy freeform visuals.
- Treat community-plugin advice as optional unless the user already has the plugin or asks for it.
- Use the nearest `CLAUDE.md` for routing and placement rules.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **EnhanceNote** | "improve this note", "make this more obsidian", "add backlinks", "clean up this note" | `Workflows/EnhanceNote.md` |
| **GatherContext** | "find related notes", "gather note context", "collect note context", "what connects to this" | `Workflows/GatherContext.md` |
| **BuildQuery** | "make a dataview", "build a dashboard", "create a MOC", "make an index note" | `Workflows/BuildQuery.md` |
| **ChooseVisualForm** | "diagram this", "visualize this", "mermaid or canvas", "choose diagram format" | `Workflows/ChooseVisualForm.md` |

## Context Files

Load these on-demand when specific reference is needed:

| File | Content |
|------|---------|
| `Syntax.md` | Wiki links, embeds, block references, callouts, formatting |
| `Properties.md` | Properties/frontmatter and property types |
| `Canvas.md` | Canvas concepts and file-card behavior |
| `MermaidDiagrams.md` | Mermaid diagram types and syntax |
| `Dataview.md` | Query syntax and output forms |
| `Templater.md` | Template and scripting patterns |
| `WorkflowPatterns.md` | MOCs and knowledge-work patterns |
| `Excalidraw.md` | Optional hand-drawn/sketch reference |
| `Plugins.md` | Agent-relevant core and community plugin patterns |

## Examples

**Example 1: Make a note more Obsidian-native**
```
User: "Make this note more Obsidian-native and add useful links"
-> Invokes EnhanceNote workflow
-> Suggests or adds high-value wikilinks, aliases, properties, and related-note structure
-> Returns: note improvements plus any optional follow-up suggestions
```

**Example 2: Gather related vault context**
```
User: "Find related notes for this topic and suggest backlinks"
-> Invokes GatherContext workflow
-> Searches for nearby concepts, linked notes, and relevant supporting notes
-> Returns: ranked context pack plus suggested wikilinks/backlinks
```

**Example 3: Build a live dashboard or hub**
```
User: "Build a Dataview dashboard for my project reviews"
-> Invokes BuildQuery workflow
-> Checks existing metadata patterns before inventing new ones
-> Returns: Dataview block, MOC, or fallback markdown structure
```

**Example 4: Choose the right visual form**
```
User: "Should this be Mermaid, Canvas, or something else?"
-> Invokes ChooseVisualForm workflow
-> Chooses the lowest-friction representation that fits the information shape
-> Returns: recommendation and the artifact or structure to use
```

## Quick Reference

```
VAULT:       C:\Users\fujos\Obsidian

LINKS:       [[Note]] | [[Note|Alias]] | [[Note#Heading]] | [[Note#^block]]
EMBEDS:      ![[Note]] | ![[Note#Heading]] | ![[Note#^block]]
PROPERTIES:  YAML frontmatter with text, list, number, checkbox, date, tags
QUERIES:     Dataview LIST | TABLE | TASK | CALENDAR
VISUALS:     Mermaid | Canvas | MOC | Table | Excalidraw
PRIORITY:    Linking and retrieval first, visuals second
```
