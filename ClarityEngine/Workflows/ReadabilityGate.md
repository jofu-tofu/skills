# ReadabilityGate Workflow

> **Trigger:** "readability check", "check readability", "run readability gate"

## Scope

**Best fit for:** Running a readability and quality audit on a generated document or presentation, returning an advisory PASS/FAIL verdict with severity-ranked findings.
**Auto-chained by:** CreateDocument, RepurposeDocument.
**Route to:** `ReviewDocument` for a full information-order + readability + format-specific audit. This workflow focuses on Readability Contract checkpoints only.

## Reference Material

- `../Philosophy.md` — Readability Contract checkpoints (RC-1 through RC-20)

## Purpose

Score a document or presentation against the Readability Contract from Philosophy.md and return an advisory report. The gate always completes and returns findings — it does not block delivery. Users iterate on findings at their discretion.

## Gate Behavior

**ADVISORY, not blocking.** The gate always completes and returns findings alongside the artifact. The parent workflow delivers the artifact with the gate report attached. No retry loop. No halt-on-fail.

## Input Interface Contract

All callers pass this stable interface:

| Field | Type | Description |
|-------|------|-------------|
| `artifact` | string | Path to the generated file or inline content |
| `content_type` | enum | One of: `general`, `codebase-analysis`, `technical-writeup` |
| `format` | enum | One of: `html`, `ppt` |

## Scoring Model

- Each checkpoint scores **PASS** or **FAIL** (binary, with evidence cited)
- Severity assigned per checkpoint:
  - **Blocker** — accessibility violations, missing document structure
  - **Major** — readability degradation, comprehension barriers
  - **Polish** — improvements that enhance but do not degrade
- Note: Principle 6 (Density Over Completeness) checkpoints RC-16 through RC-20 are **Major** severity — they represent comprehension barriers caused by noise, not missing information.
- Overall verdict: **FAIL** if any Blocker exists; **PASS** otherwise
- Per-principle summary: `{principle}: {passed}/{total} checkpoints`

### RC-14 Split: Blocking vs Advisory

RC-14 covers two categories with different enforcement levels:
- **RC-14a** (Blocker, blocks delivery): WCAG AA contrast ratio (4.5:1 body text, 3:1 large text). Mathematically deterministic, near-zero false-positive rate.
- **RC-14b** (Major, advisory): Colorblind-safe palettes and consistent color semantics. Judgment-based, advisory only.

## Workflow Steps

### Step 1: Receive Context

Accept the input interface contract fields:
- `artifact`: path or content to audit
- `content_type`: determines which checkpoints to apply
- `format`: determines format-contextual interpretation of checkpoints

### Step 2: Load Readability Contract

Read `../Philosophy.md` and extract the Readability Contract (RC-1 through RC-20).

If `content_type` is `codebase-analysis`, also load the Codebase Analysis Addendum from Philosophy.md.

### Step 3: Score Each Checkpoint

For each applicable checkpoint:
1. Apply the checkpoint's test to the artifact
2. Record PASS or FAIL
3. Cite specific evidence: element inspected, value found, threshold compared
4. Assign severity: Blocker, Major, or Polish

Interpret checkpoints contextually per format:
- HTML: CSS properties and DOM structure apply directly
- PPT: Map checkpoints to equivalent slide formatting properties (font size, contrast, spacing)

#### Density Checkpoints (RC-16 through RC-20)

These checkpoints specifically target AI-generated noise — content that sounds reasonable but adds no information:

- **RC-16 (Falsifiability):** For each claim, ask: could this be wrong? Sentences that are true regardless of context carry zero information. Score FAIL if unfalsifiable sentences found.
- **RC-17 (Prediction):** For each section's opening sentence, ask: is this predictable from the heading? Headings that merely get restated in prose are wasted space. Score FAIL if predictable openers found.
- **RC-18 (State Once):** Scan for facts repeated across sections. Each fact belongs in one canonical section. Score FAIL if duplicates found.
- **RC-19 (Hard Limits):** Check sentence length ≤ 25 words, paragraphs ≤ 6 sentences, lists ≤ 7 items. Score FAIL if any violation.
- **RC-20 (Meta-Commentary):** Scan for banned phrases: "This section covers...", "As discussed above...", "It's worth noting that...", "Let's explore...", "Moving on to...", and similar. Score FAIL if found.

### Step 4: Classify and Rank Findings

Group findings by severity:
1. **Blockers** — must address for accessibility/usability
2. **Major** — significantly impacts comprehension
3. **Polish** — nice-to-have improvements

Within each severity, group by principle (P1-P5).

### Step 5: Return Advisory Report

Deliver:
- **Overall Verdict:** PASS or FAIL (FAIL only if Blockers exist)
- **Per-Principle Scores:** `{principle}: {passed}/{total}`
- **Severity-Ranked Findings:** Blockers first, then Major, then Polish
- **Top 3 Actionable Fixes:** The three highest-impact changes to improve comprehension
- **Checkpoint Coverage:** Total checkpoints checked vs. total applicable
- **Density Score:** Number of sentences passing all Signal Tests / total sentences (target: ≥ 0.90)
