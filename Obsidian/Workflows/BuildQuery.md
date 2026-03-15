# BuildQuery Workflow

> **Trigger:** "make a dataview", "build a dashboard", "create a MOC", "make an index note"

## Reference Material

- **Dataview:** `../Dataview.md` — DQL syntax and output types
- **Properties:** `../Properties.md` — metadata structure and property types
- **Workflow Patterns:** `../WorkflowPatterns.md` — MOCs and organizational patterns
- **Syntax:** `../Syntax.md` — markdown structure and linking syntax
- **Plugins:** `../Plugins.md` — Dataview, Tasks, Templater, and related plugin notes

## Purpose

Generate live queries, dashboards, MOCs, or index notes that make the vault easier to browse and review.

## Workflow Steps

### Step 1: Identify the output shape

Clarify whether the user needs:

- a Dataview table/list/task/calendar
- a dashboard note
- a hub note or MOC
- a static markdown table or list

### Step 2: Inspect existing metadata patterns

Before inventing properties or tags, inspect the existing notes involved. Reuse current field names and conventions when possible.

### Step 3: Choose the lightest viable solution

- Use Dataview when the vault already has queryable metadata or path structure.
- Use a MOC when the main need is navigational overview.
- Use a static markdown structure when the set is small and stable.
- Use DataviewJS only when standard Dataview is clearly insufficient.

### Step 4: Generate the artifact

Produce the Dataview block, MOC outline, or dashboard note structure. If the output depends on a plugin, say so explicitly.

### Step 5: Explain assumptions and gaps

If a better query would require new properties or cleanup, say which minimal changes would unlock it. Keep schema suggestions small and concrete.

### Step 6: Report

Return the artifact and any optional follow-up improvements.
