# ReviewDocument Workflow

> **Trigger:** "review presentation", "polish slide deck", "presentation quality check", "review document", "quality check"

## Scope

**Best fit for:** Quality-checking and polishing an existing document or presentation, returning a PASS/FAIL verdict with actionable fixes.
**Route to:** `CreateDocument` for building a new document from scratch. `RepurposeDocument` for converting between HTML and PPT. For graphic design overhauls or full visual redesigns, use dedicated design tools.

## Reference Material

- `../Philosophy.md` — Comprehension principles and Readability Contract
- `../FormatAdapters.md` — Format-specific technical checks

## Purpose

Run a quality and delivery-readiness audit on a document or presentation. Combines information-order checks against Philosophy.md principles with readability scoring (via ReadabilityGate) and format-specific technical checks.

## Workflow Steps

### Step 1: Validate Against Comprehension Principles

Check the document against Philosophy.md's four core principles:
- **Layman First**: Does the opening deliver the main point before background? Can any section be read independently?
- **Evidence Over Assertion**: Are claims specific, traceable, and verifiable? Are there vague or jargon-laden sections?
- **Bridge to the Known**: Are first principles stated before details? Does the document connect to what the reader already knows through cross-domain analogies or familiar frameworks? Is the specific gap or question being addressed explicit?
- **Density Over Completeness**: Could the document be shorter and still support the same decisions? Are there sentences that add no new information?

For partner/customer-facing review artifacts, also check the Audience and Review Addendum:
- Does the language stay in the reader's world rather than internal taxonomy?
- Does the artifact follow the reader's judgment path instead of the author's process?
- When the subject is visible product behavior, do visuals carry the main evidence?
- Does the closing make the requested confirmation, decision, or feedback explicit?
- Could lower-priority material be trimmed without losing the core message?

### Step 2: Run Readability Scoring

Delegate readability scoring to the `ReadabilityGate` workflow:
- Pass the artifact, content type, and format
- ReadabilityGate returns advisory PASS/FAIL verdict with per-checkpoint scores
- Incorporate ReadabilityGate findings into the overall review

### Step 3: Run Format-Specific Technical Checks

**HTML documents:**
- Document loads without console errors
- Navigation (sticky ToC, section anchors) functions correctly
- Layout remains stable at common viewport widths
- CDN dependencies load correctly

**PPT decks:**
- File opens in PowerPoint without repair warnings
- Theme and fonts render as intended
- Speaker notes exist where presenter support is needed
- Animations are intentional and minimal
- Output file size fits distribution channel constraints

### Step 4: Produce Severity-Ranked Findings

Combine principle, readability, and format-specific findings. Report in this order:
1. Blockers (must fix before sharing)
2. Major quality issues
3. Polish improvements

### Step 5: Output Ready-State

Return:
- `PASS` or `FAIL`
- Top 3 fixes with direct rationale
- Optional fast-pass fix plan for time-constrained revisions
