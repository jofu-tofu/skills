# ReviewDocument Workflow

> **Trigger:** "review presentation", "polish slide deck", "presentation quality check", "review document", "quality check"

## Reference Material

- `ReadabilityGate.md` — The review panel
- `../Standards/FormatAdapters.md` — Building and capturing the file when fixes require re-rendering

## Purpose

Review an existing document or presentation. An audit request returns findings without editing. A request to polish or fix also authorizes scoped revisions. Use RepurposeDocument for format changes.

## Workflow Steps

1. Reconstruct the brief from the request and the document: audience, expertise, outcome, artifact intent, content type, a reading-time budget, and the terms the reader needs as written. Ask only when ambiguity materially affects the review.
2. Gather the sources the document relies on, when available.
3. Run the format's file check, and the target-app check when the request depends on that app, as FormatAdapters.md describes.
4. Run ReadabilityGate with the sources, those results as `verification_evidence`, and `edit_scope: none` for an audit or `full` for a polish or fix request.
5. Return the gate's report. For a polish or fix request, also return the revised artifact.
