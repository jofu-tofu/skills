# StructureProjectVault Workflow

> **Trigger:** "structure project vault", "set up project notes", "create vault context", "organize project artifacts"

## Reference Material

- **Continuity Principles:** `../Standards/ContinuityPrinciples.md` — trust rubric, promotion authority, stable-layer model, and context-layer contract
- **Properties:** `../Properties.md` — YAML/frontmatter and property types
- **Workflow Patterns:** `../WorkflowPatterns.md` — MOCs and project index patterns
- **Dataview:** `../Dataview.md` — optional dashboards for project views

## Purpose

Create or update a project-local Obsidian structure that supports continuity across agent sessions while keeping taxonomy flexible. The workflow produces stable first-layer folders, project-specific second-layer folders, and an `AGENTS.md` contract that agents can follow even without this skill.

## Workflow Steps

### Step 1: Identify project profile

Classify the project shape from user context and existing files:

- **lightweight** — simple notes, few artifacts, no recurring meetings
- **research-heavy** — many sources, web/literature synthesis, evidence comparisons
- **meeting-heavy** — recurring meeting notes, decisions from conversations
- **delivery-heavy** — drafts, exports, presentations, final deliverables
- **mixed/large** — needs multiple second-layer folders

If unclear, choose the lightest profile that satisfies the current need.

### Step 2: Use stable first-layer folders

Use this first layer unless the nearest `AGENTS.md` already defines a compatible equivalent:

```text
<Project>/
  AGENTS.md
  _index.md
  00-inbox-T0/
  10-sources-T0-T2/
  20-working-T1-T3/
  30-decisions-T4/
  40-artifacts-T5/
  90-archive/
```

Do not create project-specific top-level folders such as `Meetings/`, `Research/`, or `Plans/`. Put those under the appropriate trust/workflow layer.

### Step 3: Add second-layer folders only when useful

Choose the smallest second-layer set that fits the project:

```text
10-sources-T0-T2/
  raw/
  extracted/
  research/
  meetings/
  interviews/
  documents/
  logs/

20-working-T1-T3/
  session-recaps/
  plans/
  hypotheses/
  analysis/
  open-questions/
  drafts/

30-decisions-T4/
  accepted/
  superseded/

40-artifacts-T5/
  final/
  presentations/
  exports/
```

For lightweight projects, keep only the first layer until a second-layer folder is needed.

### Step 4: Create or update project AGENTS.md

Add a concise project-local contract. Adapt paths to the folders actually present.

```markdown
# Project Vault Context

## Project Profile

Profile: lightweight | research-heavy | meeting-heavy | delivery-heavy | mixed/large

## First-Layer Contract

- `00-inbox-T0/` holds unprocessed captures.
- `10-sources-T0-T2/` holds provenance-bearing inputs and source-backed notes.
- `20-working-T1-T3/` holds synthesis, plans, session recaps, hypotheses, and open questions.
- `30-decisions-T4/` holds human-confirmed decisions and superseded decision history.
- `40-artifacts-T5/` holds final deliverables, exports, and presentations; keep active drafts in `20-working-T1-T3/`.
- `90-archive/` holds inactive, superseded, or archived material from any trust level.

## Trust Rubric

| Level | Name | Meaning | Agent May Use It To | Agent Must Not Do |
|---|---|---|---|---|
| T0 | Raw Capture | Unprocessed input | Preserve, quote, extract, summarize with citation | Treat as interpreted or decided |
| T1 | Agent Research | Agent-generated findings or hypotheses | Inform analysis, propose options, surface uncertainty | Treat as fact without source check or human confirmation |
| T2 | Source-Backed Note | Claims tied to identifiable source material | Cite as evidence, compare sources, support recommendations | Treat as a project decision |
| T3 | Working Judgment | Current plan, draft spec, analysis, design direction | Continue work, draft artifacts, identify likely next steps | Override accepted decisions |
| T4 | Decision | Human-confirmed decision with rationale/date/status | Act as authoritative, resolve conflicts, guide implementation | Override without explicit supersession |
| T5 | Final Artifact | Published or delivered output derived from decisions | Reuse as canonical deliverable | Modify casually without checking decision/source basis |

## Lifecycle Status

Trust level is authority/evidence level. Status is lifecycle state.

Use these status values:
- `active`
- `draft`
- `accepted`
- `final`
- `superseded`
- `archived`

Archived material keeps its original `trust_level`. Example: a superseded decision remains `trust_level: T4` with `status: superseded`.
## Promotion Authority

Agents may promote:
- T0 raw captures to T1 research/extraction when linking back to the raw source.
- T1 research to T2 source-backed notes when claims have provenance or citations.
- T2 source-backed notes to T3 working analysis when assumptions remain marked.
- T4 accepted decisions to T5 artifacts when the artifact directly implements the decision.

Agents must ask before promoting:
- any artifact to T4 decision
- any decision to superseded
- any active project artifact to `status: archived`

Agents must not:
- treat research as a decision
- treat a recap as a decision
- resolve conflicting decisions silently

## Pruning Policy

After promoting an artifact, prune duplicate active lower-trust material.

Agents may delete:
- scratch or inbox notes whose content was fully captured elsewhere
- duplicate working drafts replaced by a promoted artifact
- temporary agent research fully represented in a source-backed note, decision, or final artifact
- empty shells left behind by move/merge work

Agents should archive or mark superseded instead of deleting:
- raw sources
- source-backed notes
- accepted or superseded decisions
- final artifacts
- notes with unique rationale, quotes, source links, or historical context

If deleting the old artifact would break the provenance chain, keep it in `90-archive/` with `status: archived` and backlinks to the promoted artifact.
## Required Properties

Use these properties for durable project artifacts:

```yaml
trust_level:
artifact_type:
status:
created:
updated:
source:
human_confirmed:
related_decisions:
supersedes:
superseded_by:
```

## Retrieval Order

1. `30-decisions-T4/` accepted decisions
2. `40-artifacts-T5/final/` final artifacts
3. `10-sources-T0-T2/` source-backed notes
4. `20-working-T1-T3/` working plans and recaps
5. `00-inbox-T0/` and raw captures only when source inspection is needed
6. `90-archive/` only for history or supersession checks; inspect original `trust_level` before using

## Obsidian Continuity

This workspace uses the Obsidian continuity structure. Use the Obsidian skill when creating, updating, or reorganizing project notes, especially for session recaps, source-backed notes, decisions, artifacts, Dataview indexes, MOCs, and trust-level promotion.

Before ending meaningful work:
- Capture durable context if the session changed project state.
- Update `_index.md` if the current goal, canonical decisions, open questions, or active artifacts changed.
- Link new notes to relevant sources, decisions, and artifacts.
- Keep research, working notes, decisions, and final artifacts at their correct trust levels; use `status` for draft/final/superseded/archived lifecycle.
- Prune duplicate active lower-trust notes after promotion, preserving provenance and decision history.

Authority rules:
- Research and session recaps are not decisions.
- Agents may promote artifacts when promotion adds structure or provenance.
- Agents must ask before promoting anything to an accepted decision.
- Agents must ask before superseding a decision or archiving active project material.

If this `AGENTS.md` conflicts with the Obsidian skill, this project-local file wins for routing and folder placement. The skill provides reusable mechanics; this file defines this project's structure.
```

### Step 5: Create or update _index.md

Use `_index.md` as the human-facing project map:

```markdown
# Project Index

## Current Goal

## Canonical Decisions

## Current Working Plan

## Open Questions

## Key Sources

## Active Artifacts

## Recent Session Recaps
```

Prefer wikilinks to project notes. Keep this index short enough to paste into a resume prompt.

### Step 6: Report

Return:

- project profile selected
- folders created or proposed
- `AGENTS.md` sections added or changed
- index sections added or changed
- any places where existing structure conflicts with the stable-layer model

