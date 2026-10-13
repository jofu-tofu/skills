# CreateDocument Workflow

> **Trigger:** "create presentation", "build slide deck", "make deck", "make a slideshow", "generate slides", "create html document", "build web document", "create html report", "create scrollable report", "create ppt deck", "create powerpoint deck", "create professional deck", "analyze codebase", "build deck"

## Reference Material

- `../Philosophy.md` — Comprehension principles and 23-checkpoint contract
- `../PersonalStyleGuide.md` — Plain, direct, connected writing
- `../FormatAdapters.md` — Rendering and verification responsibilities
- `../ReaderCheck.md` — Independent comprehension test

## Purpose

Write a format-neutral Document Brief, draft for the intended reader, then build and inspect the requested file. Use RepurposeDocument for conversions and ReviewDocument for audits.

## Workflow Steps

### Step 1: Write the Brief

Use the information already available, infer what you can, and proceed. Ask only when a missing answer materially affects correctness, audience, scope, or delivery. Do not ask users to confirm routine content-type detection.

| Brief field | Description |
|---|---|
| `topic` | Concrete subject |
| `audience` | Reader role and existing knowledge |
| `audience_exposure` | `internal`, `cross-functional`, `partner`, or `customer` |
| `outcome` | What the reader should understand, decide, or do |
| `artifact_intent` | `inform`, `explain`, `review`, or `decide` |
| `content_type` | `general`, `codebase-analysis`, or `technical-writeup`; explicit user choice wins |
| `key_takeaway` | Main point |
| `information_order` | Ordered sections and the purpose of each |
| `evidence_needs` | Sources, observations, uncertainty, and unresolved questions |
| `format` | User preference or supported adapter identifier; `auto` if unspecified |
| `depth` | `overview`, `standard`, or `deep-dive`; default `standard` |
| `constraints` | Template, length, accessibility, editability, offline use, distribution |

Choose provisional length from audience and purpose. Treat it as a planning aid, not a reason to remove necessary reasoning.

### Step 2: Plan the Explanation

Read Philosophy.md and PersonalStyleGuide.md. Apply the guidance for codebase explanations, customer audiences, or review and decision documents when it fits the task. Lead with the point, then evidence and explanation. For each major section or slide, identify its claim, supporting evidence, causal explanation, and implication where applicable.

State assumptions the reader needs. Identify the question the artifact answers. Use a familiar example, analogy, or diagram only when it clarifies a real knowledge gap; explain an analogy's limits when they matter.

### Step 3: Gather Evidence

Research missing facts through available source tools or the relevant research skill. Delegate research and code exploration when authorized or required by the session. Keep verified facts, proposals, assumptions, and unknowns distinct. Preserve exact identifiers for technical audiences and explain them for other readers.

### Step 4: Draft and Revise

Apply PersonalStyleGuide.md to wording, order, and formatting. In engineering designs, state the problem briefly, then write the changes as direct instructions. When listing rules, put each rule in a main bullet and nest its examples or supporting details. Keep independent requirements outside examples. Remove filler, conversation history, and sections with no reader purpose. Use a table when it makes repeated cases easier to compare.

Compare the revision with the brief and sources. Preserve decisions, definitions, causal links, quantities, qualifications, evidence, and actions. Keep purposeful summary repetition and reader orientation. There is no minimum percentage reduction, universal sentence-length limit, or requirement that every sentence make a falsifiable claim.

### Step 5: Render and Inspect

Read FormatAdapters.md. Honor the requested format; otherwise select one from audience and use. Record why when you choose the format automatically. Use the installed specialist skill for the format or branded template. Complete its file and rendered-output checks; inspect every slide/page or the full HTML document. Re-render and re-inspect after repairs.

### Step 6: Check Comprehension and Readiness

Run ReadabilityGate with `artifact`, `content_type`, `format`, and the brief. Include ReaderCheck.md's independent test. Reuse rendered evidence only for the current artifact version.

Repair material issues within authorized scope, with at most two review/repair cycles. Recheck changed content and affected rendering. Return the artifact and concise readiness, comprehension, and verification statuses. Deliver useful drafts with limitations clearly stated; generating a file alone does not make it ready.
