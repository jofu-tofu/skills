# Excalidraw in Obsidian

Excalidraw is a whiteboard plugin for hand-drawn diagrams with powerful automation capabilities.

---

## Creating a Diagram

You will create Excalidraw diagrams by working through five decisions. Each decision builds on the previous one, and by the end you will have a clear plan to execute.

### Decision 1: What is the ONE idea?

Before drawing anything, identify the single concept you are communicating. A diagram that tries to show everything communicates nothing.

Ask yourself: *"If someone looks at this for 5 seconds, what should they understand?"*

Write this down as a single sentence. This is your north star.

**Why this matters:** Diagrams exploit parallel visual processing (10M bits/sec) vs sequential reading (200 words/min). That power only works when there's one clear message.

### Decision 2: What type of diagram?

Match your prompt to a diagram pattern. Scan for keywords:

| Your prompt mentions... | You will create... | Using these shapes | With roughness |
|-------------------------|--------------------|--------------------|----------------|
| architecture, system, components, services | Architecture diagram | Rectangles (services) + Ellipses (databases) | 0 (clean) |
| flow, process, workflow, steps, sequence | Flowchart | Rectangles (actions) + Diamonds (decisions) | 0-1 |
| brainstorm, ideas, sketch, whiteboard | Whiteboard sketch | Ellipses + Freedraw | 2 (sketchy) |
| user journey, path, experience | User flow | Sequential rectangles | 1 |
| concept map, mind map, relationships | Mind map | Ellipses in radial layout | 1-2 |
| presentation, slides, deck | Presentation | Frames containing groups | 0 |

**Default:** Architecture with roughness 1 if unclear.

For detailed patterns with code examples, see [UseCaseGuide.md](Workflows/Excalidraw/UseCaseGuide.md).

### Decision 3: What do elements mean?

Assign semantic colors to element categories. Same color = same meaning, always.

| Element category | Background | Stroke | Examples |
|------------------|------------|--------|----------|
| Information/Input | #a5d8ff | #1971c2 | User input, data sources, API requests |
| Success/Output | #b2f2bb | #2f9e44 | Databases, results, completed states |
| Warning/Decision | #ffec99 | #f08c00 | Decision nodes, branching, processes |
| Error/Critical | #ffc9c9 | #e03131 | Error states, stops, critical paths |
| External/Special | #d0bfff | #9c36b5 | Third-party services, external systems |
| Neutral/Context | #e9ecef | #868e96 | Annotations, labels, background info |

**The 60-30-10 rule:** 60% whitespace, 30% primary elements, 10% accent highlights. If your diagram feels crowded, add more whitespace.

For complete styling reference, see [StylingSystem.md](Workflows/Excalidraw/StylingSystem.md).

### Decision 4: Build the file

Create the `.excalidraw` file using these specifications:

| Setting | Value | Why |
|---------|-------|-----|
| Spacing | 50px grid (50, 100, 150, 200) | Consistent visual rhythm |
| Shape minimum | 80×60 | Readable labels |
| Standard box | 120×80 | Balanced proportion |
| Container | 160×100+ | Room for grouped content |
| Font (formal) | Helvetica (fontFamily: 2) | Professional documentation |
| Font (sketch) | Virgil (fontFamily: 1) | Hand-drawn aesthetic |
| Font (code) | Cascadia (fontFamily: 3) | Monospace for technical |

**File location:** `Diagrams/{Category}/{DescriptiveName}.excalidraw`

For API methods and JSON structure, see [AutomateAPI.md](Workflows/Excalidraw/AutomateAPI.md).

### Decision 5: Verify quality

Before delivering, run these tests:

| Test | How to run | Pass criteria |
|------|------------|---------------|
| Squint test | Blur your vision or step back | Hierarchy remains obvious |
| 5-second test | Imagine showing to someone new | They would state the main idea |
| Removal test | Consider each element | Nothing can be removed |

**Why verification matters:** These tests catch the most common failure mode—adding complexity that feels helpful but actually obscures the message.

For the full philosophy and additional tests, see [Philosophy.md](Workflows/Excalidraw/Philosophy.md).

---

## Quick Start

### Embedding Diagrams
```markdown
![[drawing.excalidraw]]              # Full diagram
![[drawing.excalidraw|400]]          # Width specified
![[drawing.excalidraw#^frame1]]      # Specific frame
```

### Creating Diagrams
- **Interactive:** Click "New Excalidraw Drawing" in Obsidian
- **Programmatic:** Use workflows below for automated generation

---

## When to Use Excalidraw vs Mermaid

| Use Excalidraw | Use Mermaid |
|----------------|-------------|
| Freeform sketches | Structured diagrams |
| Visual brainstorming | Code documentation |
| Architecture drawings | Automated generation |
| Custom visual styles | Version-controlled diagrams |
| Hand-drawn aesthetic | Standardized formats |
| Pixel-perfect positioning | Auto-layout diagrams |

**Rule of thumb:** If it needs to look hand-drawn or requires precise control, use Excalidraw. If it's structured and needs to live in markdown, use Mermaid.

---

## Key Features

- **Freehand drawing**: Sketch-style diagrams with adjustable roughness (0-2)
- **9 element types**: Rectangle, ellipse, diamond, arrow, line, freedraw, text, image, frame
- **LaTeX support**: Embed math formulas with `\LaTeX` syntax
- **SVG/PNG export**: High-quality exports with auto-export option
- **Obsidian integration**: Embed in notes, link to other notes, Canvas integration
- **ExcalidrawAutomate API**: Programmatic diagram creation and manipulation
- **Libraries**: Reusable element collections for consistency
- **Frames**: Container elements for presentations and sections
- **Collaborative**: Share drawings (JSON-based, git-friendly)

---

## How This Skill Uses Excalidraw

Excalidraw is a secondary reference inside this skill, not the default path.

Use Excalidraw when:
- the user explicitly wants Excalidraw
- a sketchy, hand-drawn, or intentionally rough visual is the point
- freeform whiteboarding matters more than text-first maintenance

Prefer Mermaid, Canvas, MOCs, or Dataview when they capture the same structure with less friction.

The Obsidian skill now consults this file mainly through `ChooseVisualForm.md` when Excalidraw is the right fit.

---

## Automate API Quick Reference

```javascript
const ea = ExcalidrawAutomate.plugin;

// Create elements
ea.addRect(x, y, width, height, {text: "Label"});
ea.addEllipse(x, y, width, height, {fillStyle: "solid"});
ea.addDiamond(x, y, width, height);
ea.addArrow([[x1, y1], [x2, y2]], {endArrowhead: "arrow"});
ea.addText(x, y, "Text", {fontSize: 20});
ea.addLaTeX(x, y, "E = mc^2");

// Style elements
ea.setStrokeColor("#1e90ff", elementId);
ea.setBackgroundColor("#e0f7fa", elementId);
ea.setFillStyle("solid", elementId);

// Layout
ea.group([id1, id2, id3]);
ea.alignVertical([id1, id2, id3], "middle");
ea.distributeHorizontal([id1, id2, id3]);

// Canvas management
ea.clear();
ea.create("DiagramName", "Diagrams/");
```

For deeper API details, use the Excalidraw plugin's own documentation or community references if the user explicitly wants implementation-level help.

---

## File Formats

### Plain `.excalidraw` (Recommended for Programmatic Creation)

When creating Excalidraw files programmatically, use **plain JSON** with `.excalidraw` extension:

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [...],
  "appState": { "viewBackgroundColor": "#ffffff" },
  "files": {}
}
```

This format is reliably parsed by the Excalidraw plugin.

### `.excalidraw.md` (Plugin-Created Only)

The Excalidraw plugin creates `.excalidraw.md` files with YAML frontmatter when you create diagrams interactively in Obsidian. **Do NOT create this format programmatically** - it causes JSON parsing errors ("no number after minus sign").

### Linter Compatibility

**Important:** Exclude `.excalidraw` files in Linter settings to prevent corruption:
```
Exclude files: **/*.excalidraw
```

The Excalidraw plugin manages its own files - let it handle formatting.

---

## Common Use Cases

| Use Case | Approach | Key Elements |
|----------|----------|--------------|
| **Architecture diagrams** | Rectangles + arrows | Clean style (roughness: 0) |
| **User flows** | Diamonds + rectangles | Decision nodes + actions |
| **Brainstorming** | Ellipses + freedraw | Sketchy style (roughness: 2) |
| **Presentations** | Frames + groups | Sequential slides |
| **Mind maps** | Radial layout | Central concept + branches |
| **Technical diagrams** | Solid fills + images | Icons, precise positioning |

Use the table below as the quick pattern guide for when Excalidraw is worth the extra friction.

---

## File Organization

Recommended structure:
```
Obsidian Vault/
└── Diagrams/
    ├── Architecture/        # System diagrams
    ├── Flows/               # User flows, processes
    └── Sketches/            # Brainstorms, whiteboard
```

**Naming:** Use descriptive names like `AuthenticationFlow.excalidraw` (not `diagram1.excalidraw`)

---

## Version Control

Excalidraw files are **JSON-based**, making them:
- ✅ Git-friendly (text-based, diffable)
- ✅ Merge-friendly (human-readable conflicts)
- ⚠️ Verbose (large diagrams = large JSON)

**Tip:** Use auto-export to generate images on-demand, keep only `.excalidraw` source in git.

---

## Resources

- **Official Excalidraw:** https://excalidraw.com
- **Obsidian Plugin:** Search "Excalidraw" in Community Plugins
- **This file:** Use as the built-in quick reference for Excalidraw decisions and file format hints
- **Workflow surface:** Excalidraw is now an optional branch inside `ChooseVisualForm.md`, not a dedicated primary workflow
