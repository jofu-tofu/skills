# ChooseVisualForm Workflow

> **Trigger:** "diagram this", "visualize this", "mermaid or canvas", "choose diagram format"

## Reference Material

- **Mermaid Diagrams:** `../MermaidDiagrams.md` — code-based diagram syntax
- **Canvas:** `../Canvas.md` — spatial note layout concepts
- **Excalidraw:** `../Excalidraw.md` — optional freeform sketch reference
- **Syntax:** `../Syntax.md` — embeds and note-link syntax
- **Workflow Patterns:** `../WorkflowPatterns.md` — MOCs and note-structure alternatives

## Purpose

Choose the lowest-friction Obsidian representation that fits the shape of the information, then produce the artifact or a concrete structure.

## Workflow Steps

### Step 1: Classify the information shape

Determine whether the user has:

- a process, sequence, or state machine
- a hierarchy or concept map
- a spatial brainstorming problem
- a note index or hub problem
- structured data better shown as a table or query

### Step 2: Choose the representation

Use this default order:

| Shape | Default representation |
|---|---|
| Process, sequence, state | Mermaid |
| Navigable overview of notes/topics | MOC |
| Structured rollup or status view | Dataview or markdown table |
| Spatial clustering or whiteboarding | Canvas |
| Hand-drawn, sketchy, or intentionally rough visual | Excalidraw |

### Step 3: Apply Obsidian-specific caveats

- Prefer Mermaid when the content is structured and likely to be revised in text.
- Prefer Canvas for spatial thinking, but remember text-only cards do not create backlinks.
- Prefer MOCs when the real need is navigation across notes rather than a picture.
- Prefer tables or Dataview when the content is primarily data.
- Use Excalidraw only when its freeform or sketch aesthetic is the point.

### Step 4: Produce the result

- For Mermaid, return a working code block.
- For MOCs, return a note outline with wikilinks.
- For Dataview or tables, return the block or markdown structure.
- For Canvas or Excalidraw, return a concrete layout plan unless the user explicitly asked for the file to be created.

### Step 5: Explain the trade-off

Briefly say why the chosen form is better than the nearest alternatives.
