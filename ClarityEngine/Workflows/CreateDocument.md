# CreateDocument Workflow

> **Trigger:** "create presentation", "build slide deck", "make deck", "make a slideshow", "generate slides", "create html document", "build web document", "create html report", "create scrollable report", "create ppt deck", "create powerpoint deck", "create professional deck", "analyze codebase", "build deck"

## Reference Material

- `../Standards/Philosophy.md` — Comprehension principles and the check index
- `../Standards/PersonalStyleGuide.md` — The voice
- `../Lenses/` — The checks the draft will face; read them as the writing rules
- `../Standards/FormatAdapters.md` — Building and capturing the file
- `ReadabilityGate.md` — Review and repair

## Purpose

Write a Document Brief, draft for the intended reader, build the file, then run the review panel and apply its verified fixes. Use RepurposeDocument for conversions and ReviewDocument for audits.

## Workflow Steps

### Step 1: Write the Brief

Use the information already available, infer what you can, and proceed. Ask only when a missing answer materially affects correctness, audience, scope, or delivery. Do not ask users to confirm routine content-type detection.

| Brief field | Description |
|---|---|
| `topic` | Concrete subject |
| `audience` | Reader role |
| `expertise` | The reader's knowledge of this content: `newcomer`, `mixed`, or `expert`; default `mixed` |
| `audience_exposure` | `internal`, `cross-functional`, `partner`, or `customer` |
| `outcome` | What the reader should understand, decide, or do |
| `artifact_intent` | `inform`, `explain`, `review`, or `decide` |
| `content_type` | `general`, `codebase-analysis`, or `technical-writeup`; an explicit user choice wins |
| `key_takeaway` | Main point |
| `information_order` | Ordered sections and the purpose of each |
| `evidence_needs` | Sources, observations, uncertainty, and unresolved questions |
| `format` | User preference or a FormatAdapters identifier; `auto` if unspecified |
| `depth` | `overview`, `standard`, or `deep-dive`; default `standard` |
| `budget_minutes` | Reading time for the main path; set from `depth` unless the user gives one |
| `constraints` | Template, length, accessibility, editability, offline use, distribution |

Set `budget_minutes` from `depth`. MeasureDraft converts main-path words to minutes at 220 words per minute, a little below the measured adult average of about 238 for nonfiction, because technical text reads slower:

| Depth | Budget | About |
|---|---|---|
| `overview` | 2 minutes | 450 words |
| `standard` | 5 minutes | 1,100 words |
| `deep-dive` | 10 minutes | 2,200 words |

For dense technical content, treat the estimate as optimistic. The budget is a planning target and a review diagnostic, never a reason to drop a needed step.

### Step 2: Plan the Explanation

Read Philosophy.md, PersonalStyleGuide.md, and the lens files that will review this artifact. For each major section or slide, identify its claim, supporting evidence, causal explanation, and implication. Identify the question the artifact answers and the assumptions the reader needs. Decide what belongs on the main path and what goes in collapsed sections or an appendix.

### Step 3: Gather Evidence

Research missing facts through available source tools or a research skill, delegating when the session allows it. Keep verified facts, proposals, assumptions, and unknowns distinct, and save source notes for the Logician lens.

### Step 4: Draft

Write to pass the lens checks. Compare the draft with the brief and sources, keeping decisions, definitions, causal links, quantities, qualifications, evidence, and actions.

### Step 5: Build

Build the file through FormatAdapters.md and the installed specialist skill. Run its file check, and the target-app check when delivery depends on that app.

### Step 6: Review and Repair

Run ReadabilityGate with the artifact, content type, format, brief, source notes, the file and target-app results as `verification_evidence`, and `edit_scope: full`. Return the artifact with the gate's readiness, comprehension, and verification statuses and any remaining limitations.
