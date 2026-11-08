# Recorded-panel scenarios

Exercise ReadabilityGate/Verify bookkeeping and final reports using supplied evidence; do not launch reviewers, rerun tools or edit text. Missing/empty/stale results already include retry. Plain-text short-form chat, current artifact v2. Readers answer main point/action/risk correctly and applicable completed RCs pass unless overridden. No findings otherwise. File/Rendered/Target app are N/A; Content is not run: no separate sources or Logician. Gate selects Reader, Cutter, Navigator, AudienceFit; no Skim, Logician or Visual is required.

Each checkpoint is a separate snapshot, reset to the stated scenario default. Never carry evidence or findings between checkpoints. Report every checkpoint's planned/completed reviewers, readiness, comprehension, missing evidence and governing rule. These are recorded boundary checks, not live panel-quality tests.

## A. Current evidence and stale replacements

Default: all four selected reviewers have non-empty passing v2 reports.

| Checkpoint | Override |
|---|---|
| C1 | None. |
| C2 | Cutter returns no file after retry. |
| C3 | Navigator has only a round-1 v1 report; no v2 report after retry. |
| C4 | AudienceFit's file is empty after retry. |
| C9 | Navigator has only a v1 Major setup finding, fixed in v2 and not attributable to current text; no v2 report after retry. State whether this old finding enters current Fixes. |

## B. Defect precedence and execution failure

Same default as A; checkpoints remain independent.

| Checkpoint | Override |
|---|---|
| C5 | Reader's main-point answer is wrong; Verify confirms a Major comprehension defect. Cutter missing after retry. Navigator and AudienceFit have v2 reports. |
| C6 | None of the four reviewers produced a report after retry. |
| C7 | After all four valid v2 reports, an unrelated tool request fails. It changes/invalidates neither artifact nor reports. |

## C. Multiple audiences, including repair

Selected panel: Reader-approver, Reader-operator, Cutter, Navigator, AudienceFit. Current reports pass except Reader-operator, which is missing after retry. Preserve audiences separately.

| Checkpoint | Context |
|---|---|
| C8 | Normal review with the selected panel above. |
| C10 | Repair finished on v2. Both Readers ran in round1 and both audiences remain in the brief. Initially nobody reviewed v2: record Gate's repair Reader dispatch selection. Then consume the current results above and report status. |

Return all ten checkpoint reports. Do not inspect other configurations or answer keys.
