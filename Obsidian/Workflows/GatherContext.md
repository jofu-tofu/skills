# GatherContext Workflow

> **Trigger:** "find related notes", "gather note context", "collect note context", "what connects to this"

## Reference Material

- **Syntax:** `../Syntax.md` — note-link and embed syntax
- **Workflow Patterns:** `../WorkflowPatterns.md` — MOCs and connection patterns
- **Plugins:** `../Plugins.md` — optional semantic-search and automation plugin ideas
- **Dataview:** `../Dataview.md` — query-backed rollups when useful

## Purpose

Assemble a compact, relevant vault context set for a note, topic, or task so the agent can link better, write better, or synthesize better.

## Workflow Steps

### Step 1: Anchor the search

Determine the anchor:

- current note
- selected text
- named topic
- folder/project area

### Step 2: Search in layers

Gather candidates using increasingly broad signals:

1. Direct links and backlinks
2. Title matches and aliases
3. Folder proximity and nearby topic clusters
4. Tags, properties, and Dataview-relevant fields
5. Concept overlap and recurring entities in note content

### Step 3: Use an Explore subagent for broad discovery when warranted

If the scope is broad, ambiguous, or likely to touch many notes, consider using an Explore subagent to search the vault quickly without cluttering the main context.

### Step 4: Rank and compress

Return a short, high-signal set of notes. Prefer 3–7 strong candidates over an exhaustive dump. For each candidate, say why it matters.

### Step 5: Offer follow-through

If useful, convert the gathered context into one of these:

- suggested wikilinks or backlinks
- a `## Related` section
- a starter MOC outline
- a Dataview source or filter idea

### Step 6: Report

Return the context pack, relevance rationale, and any recommended next edits.
