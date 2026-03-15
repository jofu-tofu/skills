# EnhanceNote Workflow

> **Trigger:** "improve this note", "make this more obsidian", "add backlinks", "clean up this note"

## Reference Material

- **Syntax:** `../Syntax.md` — wikilinks, embeds, block references, callouts
- **Properties:** `../Properties.md` — property types and frontmatter format
- **Workflow Patterns:** `../WorkflowPatterns.md` — MOCs and note patterns
- **Plugins:** `../Plugins.md` — optional plugin-dependent enhancements

## Purpose

Upgrade a note from plain markdown to Obsidian-native structure when that materially helps retrieval, navigation, or reuse.

## Workflow Steps

### Step 1: Inspect the note and the request

Read the note or selection. Determine whether the user wants direct edits, suggestions only, or both.

### Step 2: Identify high-value Obsidian affordances

Consider only improvements that change how the note works inside Obsidian:

- Wikilinks to existing notes
- Aliases when note names and in-note terms do not match cleanly
- Embeds or block references when reuse beats duplication
- Light properties that improve search or Dataview
- A `## Related` section or MOC-style structure when the note is a hub

### Step 3: Gather related notes when needed

If likely links are not obvious from the current note alone, search the vault for relevant notes. For broad or fuzzy topics, consider using an Explore subagent to gather 3–7 relevant notes quickly.

### Step 4: Prefer precision over link spam

- Add only links that materially help navigation or recall.
- Prefer a few high-confidence links over many weak ones.
- Do not invent notes that do not exist unless the user asked for new notes.
- Add properties only when they enable actual retrieval or querying.

### Step 5: Apply or suggest

If the user asked for edits, update the note. Otherwise, return concrete suggestions with exact link and property text.

### Step 6: Report

Summarize what changed or what is recommended, and call out any optional follow-up such as creating a hub note or a Dataview view.
