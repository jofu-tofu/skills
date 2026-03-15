# CreateDocument Workflow

> **Trigger:** "create presentation", "build slide deck", "make deck", "make a slideshow", "generate slides", "create html document", "build web document", "create html report", "create scrollable report", "create ppt deck", "create powerpoint deck", "create professional deck", "analyze codebase", "build deck"

## Scope

**Best fit for:** New documents or presentations where content strategy, format selection, and information ordering are all needed. Handles all creation paths through a unified pipeline.
**Route to:** `RepurposeDocument` for converting an existing document between formats. `ReviewDocument` for quality-checking an existing document. For graphic design services, proprietary vendor templates, or deep background research, use dedicated skills instead.

## Reference Material

- `../Philosophy.md` — Four core principles and Readability Contract
- `../FormatAdapters.md` — Format-specific rendering instructions
- `../ToolingLandscape.md` — Verified external tooling references

## Purpose

Create a document or presentation from idea to draft by building a philosophy-driven, format-neutral Document Brief first, then rendering through the appropriate format adapter.

## Workflow Steps

### Step 1: Capture Brief Inputs

Collect or infer:
- **Topic**: what is this document about
- **Audience**: who will read it (role, expertise level)
- **Audience exposure**: `internal`, `cross-functional`, `partner`, or `customer` (default: infer from audience and venue)
- **Outcome**: what decision or understanding should the reader have after
- **Artifact intent**: `inform`, `explain`, `review`, or `decide` (default: infer from the user ask)
- **Depth**: `overview`, `standard`, or `deep-dive` (default: `standard`)
- **Format preference**: `html`, `ppt`, or `auto` (default: `auto`)
- **Density preference**: `tight` or `standard` (default: `tight` — prefer shorter output with reader follow-up over comprehensive output with noise)

If required inputs are missing, ask concise questions before proceeding.

### Step 2: Detect Content Type

| Content Type | Auto-Detection Keywords |
|---|---|
| `codebase-analysis` | "codebase", "architecture", "module", "API", "dependency", "refactor", "code review", "system design" |
| `technical-writeup` | "research", "analysis", "report", "findings", "investigation" |
| `general` | Default fallback when no keywords match |

- Manual override always wins.
- When auto-detected, state the detected type and ask user to confirm before proceeding.
- Content type determines which Philosophy.md sections apply downstream.

### Step 3: Load Philosophy

Read `../Philosophy.md`. Apply the four core principles to all subsequent content decisions. If `audience_exposure` is `partner` or `customer`, or `artifact_intent` is `review` or `decide`, also apply the Audience and Review Addendum from Philosophy.md. If content type is `codebase-analysis`, also load the Codebase Analysis Addendum from Philosophy.md.

### Step 4: Build Document Brief

Create a format-neutral brief:

| Field | Required | Description |
|-------|----------|-------------|
| `topic` | yes | What is this document about |
| `audience` | yes | Who will read it (role, expertise level) |
| `audience_exposure` | yes | One of: `internal`, `cross-functional`, `partner`, `customer` |
| `outcome` | yes | What decision or understanding should the reader have after |
| `artifact_intent` | yes | One of: `inform`, `explain`, `review`, `decide` |
| `content_type` | yes | One of: `general`, `codebase-analysis`, `technical-writeup` |
| `key_takeaway` | yes | The single most important thing the reader should remember |
| `information_order` | yes | Ordered list of sections in descending reader value with one-line summaries |
| `evidence_needs` | no | What data, code, or sources need to be gathered |
| `format` | no | If user specified a format, record it here; otherwise blank |
| `depth` | no | `overview`, `standard`, or `deep-dive` (default: `standard`) |
| `word_budget` | no | Total target word count: `overview`=300-600, `standard`=600-1500, `deep-dive`=1500-3000 |

For review/decision artifacts, default the `information_order` to the inverted pyramid: lead with the point, follow with evidence, and push background later.

### Step 5: Conceptual Clarity Pass (Bridge to the Known)

Before writing or researching, apply first-principles bridging to the Document Brief:

1. **Surface assumptions** — What does the reader need to already understand for this document to make sense? State these explicitly. If an assumption is wrong, the whole document fails — better to surface it early.
2. **Identify the gap** — What specific confusion, question, or decision does this document address? Not "covers topic X" but "resolves whether Y or Z." Gap-driven framing prevents the document from becoming a knowledge dump.
3. **Find bridges** — For each major concept, identify at least one cross-domain analogy, mental model, or pattern the audience already knows. If the audience is engineers, a biology analogy may reveal structure. If the audience is executives, a financial framing may land faster. The bridge should make the concept feel like recognition, not absorption.
4. **Choose the right representation** — Is there a different way to frame the problem that makes it dramatically simpler for this audience? If the current framing requires extensive explanation, the framing itself may be wrong.

Add `bridges` and `assumptions` fields to the Document Brief:
- `bridges`: List of cross-domain analogies or familiar frameworks to use
- `assumptions`: Underlying assumptions the reader must hold for the document to make sense

### Step 6: Run Research When Needed

If user asks for research, or evidence is missing:
- Invoke the Research skill
- Use verified sources only

### Step 7: Select Output Format

Read `../FormatAdapters.md` and apply Format Selection Logic:
- If user specified format, honor it
- If `auto`, decide based on audience, venue, and content type
- Document the selection rationale

### Step 8: Render

Follow the appropriate adapter section in `../FormatAdapters.md`:
- **HTML**: Generate semantic HTML with CDN tooling, apply CSS targets, build document structure, open in browser
- **PPT**: Select build path (Marp/PptxGenJS/python-pptx), define slide contract, generate PPTX

### Step 8.5: Compression Pass

Before the ReadabilityGate, run a structured compression pass on the rendered content. This step catches AI-generated noise that sounds reasonable but adds no information.

**The governing principle: Human time > AI output.** Missing information is recoverable (the reader asks). Wasted attention is not. Optimize for the reader's time, not completeness.

Run the four compression levels in order:

1. **Lexical:** Replace wordy phrases ("in order to" → "to", "due to the fact that" → "because"). Remove banned adverbs (quite, very, really, simply, basically) and meta-commentary ("This section covers...", "As discussed above...").
2. **Sentential:** Delete sentences that fail Signal Tests:
   - **Falsifiability:** Could this sentence be wrong? If not, it carries no information — delete.
   - **One New Fact:** Does this sentence add something no previous sentence said? If not — delete.
   - **Prediction:** Could a reader predict this sentence from the heading alone? If yes — delete.
3. **Structural:** Remove sections that exist because the template included them, not because content demands them. If a section could be swapped into a different document without anyone noticing, it's generic noise.
4. **Conceptual:** Collapse repeated case descriptions into pattern + table. Replace prose with tables where data has items × attributes.

After compression, verify: is the document at least 30% shorter than the pre-compression draft? If not, compress again. The first draft is almost always too long.

### Step 9: Auto-Chain ReadabilityGate

After rendering, auto-chain the `ReadabilityGate` workflow with:
- `artifact`: path to the generated file
- `content_type`: the detected or specified content type
- `format`: `html` or `ppt` based on selected output
