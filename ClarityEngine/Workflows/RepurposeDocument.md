# RepurposeDocument Workflow

> **Trigger:** "convert presentation", "html to ppt", "ppt to html", "html to powerpoint", "powerpoint to html", "turn into powerpoint", "change format", "convert format"

## Scope

**Best fit for:** Converting an existing document or presentation between HTML and PPT formats while preserving message hierarchy.
**Route to:** `CreateDocument` for building a new document from scratch. `ReviewDocument` for quality-checking without format conversion. Conversion produces a fidelity risk log — for pixel-identical reproduction, inform the user that lossless round-trip conversion is outside scope.

## Reference Material

- `../Philosophy.md` — Comprehension principles for quality preservation during conversion
- `../FormatAdapters.md` — Format-specific rendering targets
- `../ToolingLandscape.md` — Verified tooling references

## Purpose

Convert a document or presentation between HTML and PPT while preserving message hierarchy, applying comprehension principles to the target format, and explicitly reporting fidelity trade-offs.

## Conversion Routing

| Source | Target | Primary Path | Notes |
|---|---|---|---|
| Markdown/HTML | PPT | Marp `--pptx` or PptxGenJS regeneration | Marp is fastest for markdown sources |
| PPT | HTML | Extract structure (python-pptx) then rebuild as scrollable HTML | Direct HTML generation with CDN tooling |

## Workflow Steps

### Step 1: Extract Canonical Content Model

Normalize source into:
- Content sequence (sections for HTML, slides for PPT)
- Per-section/slide intent
- Core text and data points
- Visual requirements

### Step 2: Choose Conversion Path

Read `../FormatAdapters.md` for target format rendering instructions.

If source is markdown-friendly, use Marp CLI for PPT target:
```bash
npx @marp-team/marp-cli@latest source.md --pptx -o converted.pptx
```

If source is PPT and target is HTML:
- Extract content with python-pptx automation
- Rebuild as scrollable HTML using semantic HTML with CDN tooling (Tailwind, Mermaid, Prism)

### Step 3: Rebuild Visuals, Do Not Blindly Copy

Preserve meaning first:
- Keep argument order and section purpose
- Recreate visuals when direct transfer harms readability
- Refit pacing to target format (scrollable sections vs. slides)
- Apply Philosophy.md principles to the rebuilt content

### Step 4: Run Target-Format Checks

Apply the Readability Contract from `../Philosophy.md` for the target format. Record any losses:
- Layout drift
- Font substitution
- Content hierarchy gaps
- Notes transfer gaps

### Step 5: Return Conversion Report and Auto-Chain ReadabilityGate

Deliver:
- Converted artifact
- Conversion method used
- Fidelity Risk Log with concrete follow-up fixes

**Auto-chain ReadabilityGate** with:
- `artifact`: path to the converted file
- `content_type`: inherited from source or `general`
- `format`: `html` or `ppt` based on target
