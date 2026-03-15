# Format Adapters

> Rendering instructions for each supported output format. Philosophy.md drives what to communicate;
> this file drives how to render it. Read by CreateDocument after the Document Brief is built.

---

## Format Selection Logic

1. **User specifies format** -> honor it without question.
2. **Long-form analysis, report, codebase review** -> HTML (scrollable, link-friendly).
3. **Executive/client formal meeting, strict corporate template** -> PPT.
4. **Unclear** -> default to HTML for speed; offer PPT conversion afterward.

| Condition | Prefer HTML | Prefer PPT |
|---|---|---|
| Rapid drafting and sharing by link | Yes | No |
| Long-form analysis or report | Yes | No |
| Codebase architecture review | Yes | No |
| Executive or client-facing formal meeting | Sometimes | Yes |
| Strict corporate template required | No | Yes |
| Lightweight single-file handoff | Yes | No |
| Offline editing in Microsoft Office | No | Yes |
| Team editing inside PowerPoint | No | Yes |

---

## HTML Adapter

### CDN Stack (Zero Build Step)

| Tool | CDN | Purpose |
|------|-----|---------|
| Tailwind CSS | `https://cdn.tailwindcss.com` | Professional styling, responsive layout, typography |
| Mermaid.js | `https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js` | Diagram rendering (flowcharts, sequence, C4) |
| Prism.js | `https://cdn.jsdelivr.net/npm/prismjs/` | Syntax highlighting for code blocks |

> CDN dependencies require internet access. Offline environments are not supported.

### CSS Targets

- Body text: 16px minimum, 1.5x line height, relative units (rem/em)
- Text containers: `max-width: 75ch` for optimal line length
- Paragraph spacing: at least 2em
- Responsive layout for mobile and desktop

### Required Document Structure

- Single `<h1>` document title
- Sticky table of contents with section anchors (for documents exceeding 3 screen-heights)
- Active section highlighting in ToC during scroll
- Section anchors with `id` attributes on all H2 and H3 elements
- Back-to-top affordance for long documents
- Progressive disclosure with `<details>`/`<summary>` for supplementary content

### Diagrams

Use Mermaid.js for all diagrams in HTML output. Mermaid renders directly in the browser from markdown-like syntax — no image generation, no external tools, no build step. Place diagrams in `<pre class="mermaid">` blocks.

Supported diagram types for common needs:
- **Architecture/system boundaries**: `flowchart` or `C4Context`/`C4Container`
- **Data flows and sequences**: `sequenceDiagram`
- **State machines and transitions**: `stateDiagram-v2`
- **Dependency graphs**: `flowchart` with directional arrows
- **Timelines and Gantt**: `gantt`
- **Entity relationships**: `erDiagram`

When the visual-first principle (P4) calls for a diagram, Mermaid is the default tool in HTML context. Only reach for SVG hand-coding or external image generation if Mermaid cannot express the required visual.

### Post-Generation

After generating the HTML file, open it in the user's default browser:

```bash
bun /home/fujos/projects/pai/skills/ClarityEngine/Tools/OpenInBrowser.ts "<path>"
```

### Mermaid Gotcha

Mermaid 11.12.3 parser: avoid `$` in labels, escaped `\n` in messages, and punctuation-heavy strings. If rendering fails, simplify labels first.

---

## PPT Adapter

### Tool Selection

| User Intent | Approach | Primary Tooling |
|---|---|---|
| Quick PPT draft from markdown | Convert markdown to PPTX | Marp CLI |
| New automated corporate deck | Programmatic PPT generation | PptxGenJS |
| Edit existing template safely | Template-preserving PPT editing | python-pptx |

### Marp PPTX Flags

| User Says | Flag | Effect |
|---|---|---|
| "convert to ppt" | `--pptx` | Standard PPTX export |
| "editable powerpoint" | `--pptx --pptx-editable` | More editable output |
| "set filename" | `-o <file>.pptx` | Explicit output path |

### Slide Budget

Define before rendering:
- Slide list and information intent per slide
- Per-slide content limits
- Visual hierarchy and chart strategy
- Speaker notes requirements

### Audience-Relative PPT Rendering

- Match the deck's language to the reader's world. For partner/customer audiences, translate internal taxonomy into audience-safe terms.
- Apply inverted-pyramid ordering when clarity matters most: lead with the point or change, follow with evidence, and push background or appendix material later. For review decks, that usually means problem/change first, evidence second, decision or feedback ask last.
- When product behavior is the proof, screenshots are primary evidence. Use prose to frame the visual, not to narrate what the screenshot already shows.
- Keep main slides lighter than speaker notes or appendix. If the reader can infer the point from the visual, do not repeat it at length on the slide.

### Build Issue Fallback

If the selected build tool is unavailable, try the next in priority order: Marp CLI -> PptxGenJS -> python-pptx. Report which path was used.

---

## Adding a New Format

To add a new format (e.g., Word, Excalidraw):

1. Add a new section below with heading `## [Format] Adapter`
2. Include: tool selection, rendering targets, required structure, post-generation steps
3. Add the format to the Format Selection Logic table above
4. No changes needed to Philosophy.md or workflow files — format is a rendering concern
