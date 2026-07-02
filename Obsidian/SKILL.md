---
name: Obsidian
description: Obsidian-native capability enhancer for note work and project continuity. USE WHEN working in an Obsidian vault and the task should leverage wikilinks, backlinks, properties, Dataview, Mermaid, Canvas, templates, related-note context, project vault structure, trust levels, or artifact promotion. Helps improve notes, gather context, build dashboards, choose visual forms, and maintain continuity across agent sessions.
compatibility: Designed for Codex and Devin (or similar agent products). Requires access to an Obsidian vault directory.
metadata:
  author: pai
  version: "1.1.0"
---

# Obsidian

Use this skill to make agents Obsidian-native rather than markdown-generic. It focuses on linking, context gathering, properties and queries, visual representation, and project continuity through trust-aware artifact handling. Folder routing belongs to the vault's `AGENTS.md` tree, not this skill.

## Vault Location

```
Path: C:\Users\fujos\Obsidian
```

PAI has direct read/write access.

## Working Stance

- Prefer note-native improvements: wikilinks, aliases, embeds, properties, Dataview, and MOCs.
- Prefer Mermaid, Canvas, MOCs, or Dataview before Excalidraw unless the user explicitly wants sketchy freeform visuals.
- Treat community-plugin advice as optional unless the user already has the plugin or asks for it.
- Use the nearest `AGENTS.md` for routing and placement rules.
- Treat trust level as authority to act, not confidence or note length.
- Keep first-class project folders stable by workflow/trust layer; put project-specific folders on the second layer.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **EnhanceNote** | "improve this note", "make this more obsidian", "add backlinks", "clean up this note" | `Workflows/EnhanceNote.md` |
| **GatherContext** | "find related notes", "gather note context", "collect note context", "what connects to this" | `Workflows/GatherContext.md` |
| **BuildQuery** | "make a dataview", "build a dashboard", "create a MOC", "make an index note" | `Workflows/BuildQuery.md` |
| **ChooseVisualForm** | "diagram this", "visualize this", "mermaid or canvas", "choose diagram format" | `Workflows/ChooseVisualForm.md` |
| **StructureProjectVault** | "structure project vault", "set up project notes", "create vault context", "organize project artifacts" | `Workflows/StructureProjectVault.md` |
| **CaptureSession** | "capture this session", "save session recap", "record agent session", "summarize for vault" | `Workflows/CaptureSession.md` |
| **PromoteArtifact** | "promote this artifact", "make this a decision", "mark as source backed", "archive this note" | `Workflows/PromoteArtifact.md` |

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
| `Standards/ContinuityPrinciples.md` | Trust levels, promotion authority, context-layer contract, and continuity philosophy |
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

**Example 3: Build a trust-aware project vault**
```
User: "Set up project notes for this larger project with meetings and decisions"
-> Invokes StructureProjectVault workflow
-> Creates or proposes stable first-layer folders and project-specific second-layer folders
-> Returns: AGENTS.md routing rules, trust rubric, promotion authority, and starter index structure
```

**Example 4: Promote an artifact safely**
```
User: "This is the decision; promote it"
-> Invokes PromoteArtifact workflow
-> Checks source links, authority boundary, and supersession fields
-> Returns: promoted decision or final artifact with backlinks to lower-trust evidence
```

## Quick Reference

```
VAULT:       C:\Users\fujos\Obsidian

LINKS:       [[Note]] | [[Note|Alias]] | [[Note#Heading]] | [[Note#^block]]
EMBEDS:      ![[Note]] | ![[Note#Heading]] | ![[Note#^block]]
PROPERTIES:  YAML frontmatter with text, list, number, checkbox, date, tags
QUERIES:     Dataview LIST | TABLE | TASK | CALENDAR
VISUALS:     Mermaid | Canvas | MOC | Table | Excalidraw
TRUST:       T0 raw | T1 research | T2 source-backed | T3 working | T4 decision | T5 final | T9 archive
PRIORITY:    Decisions and final artifacts first; research and recaps only with provenance or uncertainty
```
