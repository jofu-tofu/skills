# ReviewDocument Workflow

> **Trigger:** "review presentation", "polish slide deck", "presentation quality check", "review document", "quality check"

## Reference Material

- `../Philosophy.md` — Comprehension principles
- `../PersonalStyleGuide.md` — Plain, direct, connected prose
- `../FormatAdapters.md` — Technical and visual checks
- `../ReaderCheck.md` — Independent reader test

## Purpose

Check an existing document or presentation's main point, wording, organization, formatting, and readiness for use. Audit requests return findings; requests to polish or fix also authorize scoped revisions. Use RepurposeDocument for format changes.

## Workflow Steps

1. Identify the audience, what they need to understand or do, and the document's purpose from the request or brief. Ask only when ambiguity materially affects the review.
2. Read Philosophy.md and PersonalStyleGuide.md. Check the main point, named subjects, reasoning, evidence, qualifications, and requested action. Check that rules come before their examples, independent requirements remain visible, and each section reads in a sensible order. Apply the relevant audience and codebase guidance.
3. Run ReadabilityGate with artifact, content type, format, and brief. It performs the independent reader check separately from technical assessment. Do not run a second duplicate reader test.
4. Complete the applicable FormatAdapters checks. Inspect every rendered page/slide or full HTML artifact. Keep file validity, visual inspection, and target-app verification distinct. Feed this evidence into the gate's status while keeping preview results separate from target-app results, including when the target app was not tested.
5. Compare the reader's answers, writing review, and technical checks against the document. Rank by Blocker, Major, and Polish; cite exact locations.
6. If fixes are requested, repair the material issues, re-render, and recheck affected content and visuals. Use at most two review/repair cycles.
7. Return readiness, comprehension, and verification statuses using ReadabilityGate definitions, top fixes, and unresolved limitations. Deliver the reviewed/revised artifact when applicable.
