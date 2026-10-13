# ReadabilityGate Workflow

> **Trigger:** "readability check", "check readability", "run readability gate"

## Reference Material

- `../Philosophy.md` — RC-1 through RC-23
- `../PersonalStyleGuide.md` — Writing preferences
- `../ReaderCheck.md` — Independent comprehension test
- `../FormatAdapters.md` — Format verification evidence

## Purpose

Check whether the document is clear and usable. Report Blocker or Major findings even when other checks pass. Always return the report and draft; failed or unavailable checks affect the readiness status.

## Inputs

| Field | Type | Description |
|---|---|---|
| `artifact` | string | File path or inline content |
| `content_type` | enum | `general`, `codebase-analysis`, or `technical-writeup` |
| `format` | string | Supported FormatAdapters identifier, such as `html` or `ppt` |
| `brief` | optional object | Audience, outcome, key claims, constraints; infer from request if absent |

## Workflow Steps

### Step 1: Gather Independent Evidence

Read the reference files. Run ReaderCheck before showing that reviewer the author's rationale, checklist scores, or technical findings. Separately inspect format evidence, including layout and measured contrast where applicable. Reuse verification only when it corresponds to this artifact version.

### Step 2: Check the Relevant Checkpoints

Record **PASS**, **FAIL**, **N/A**, or **NOT VERIFIED** for each RC checkpoint, with evidence and a reason. N/A means the feature or requirement does not apply, not that the check could not run. An artifact without code blocks may mark RC-15 N/A; an unrendered deck cannot pass layout checks.

Apply numerical writing targets as diagnostics unless the brief or an applicable accessibility requirement makes them binding. A longer sentence, purposeful recap, or absence of an unnecessary analogy is not itself a failure. Judge whether the reader can follow the explanation.

For RC-2, review the wording itself, even when the reader understood the overall point. For each technical phrase, ask: "Can plain language express the same meaning for this reader?" If yes, flag it and provide the replacement. If not, state why the exact term is needed and check its explanation. Preserve evidence limits when rewriting; move investigation details to a nearby note only when the main claim remains accurate. Use PersonalStyleGuide.md for the jargon definition and examples.

Mark RC-2 **FAIL** when unnecessary jargon remains. Classify it as **Major** when it obscures the main point or action, or recurs throughout audience-facing explanations; readiness is then `NeedsRevision`. An isolated phrase with no material effect on understanding is **Polish**, but still needs replacement in an authorized editing pass. Correct facts or successful reader answers do not override this wording check.

Classify findings:

- **Blocker:** Materially false or missing information, inaccessible essential content, or an unusable artifact.
- **Major:** Missing causal links, ambiguous actions, lost qualifications, or other substantive comprehension/layout problems.
- **Polish:** Optional improvements without a material effect on understanding or use.

For RC-14, measure contrast against actual foreground and background where possible: normal text 4.5:1, large text 3:1. Record text category and measurement method. Mark uncertain or unmeasured cases NOT VERIFIED. Assess color-only meaning and palette consistency separately. Measured and judgment-based issues both affect readiness according to actual severity.

### Step 3: Compare the Findings

Compare independent reader answers with expected answers from the brief and sources. Use the document or rendered file to resolve disagreements. Keep comprehension findings separate from technical failures; neither substitutes for the other. A good overall score cannot cancel a Blocker or Major finding.

### Step 4: Return Status and Fixes

- **Readiness:** `NeedsRevision` if any Blocker or Major remains; otherwise `Unverified` if required checks are missing; otherwise `Ready`.
- **Comprehension:** `Pass`, `NeedsRevision`, or `NotVerified`, based on reader evidence and material content findings. Missing independent reader evidence prevents `Pass` and makes readiness `Unverified` unless known defects already make it `NeedsRevision`.
- **Verification:** State content, file, rendered, and target-app checks separately as passed, failed, not run, or not applicable.
- **Findings:** Severity, location, evidence, and proposed fix; lead with the three that most affect understanding or use.
- **Coverage:** Checked/applicable checkpoints, plus N/A and NOT VERIFIED counts. Coverage is not proof of readiness.

The calling workflow may repair within its scope and rerun affected checks, up to its stated limit. Standalone audits report findings without assuming permission to rewrite. Return incomplete artifacts as drafts with limitations; do not block delivery or call them ready.
