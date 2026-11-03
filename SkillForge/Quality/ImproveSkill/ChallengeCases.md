---
status: proposed
trust: T3
version: 0.1
updated: 2026-11-03
human_confirmed: false
---
# Challenge cases — improve a skill

Scope: [Context](Context.md). These synthetic examples explain the proposed [criteria](Outcomes.md). They are visible development material, not reserved tests or observed results.

| Case | Misleading result | Acceptable handling | Criteria |
|---|---|---|---|
| Complete paperwork, no behavior evidence | All documents exist, so the revision is declared effective. | Record document completion separately; behavioral benefit remains unverified. | SF-Q02,03,07 |
| Aggregate gain hides damage | Extraction improves, but a mandatory explanation requirement fails; the candidate is retained on average score. | Reject or revise the candidate while preserving the requirement. | SF-Q04 |
| Goalposts move | A failed check is removed after seeing the candidate; the new score is reported as improvement. | Record a separately justified criterion revision; do not compare incompatible scores. | SF-Q03,04,06 |
| Stale criterion reused | The current task explicitly requires VOID records, but an earlier exclusion remains mandatory. | Cite the changed requirement, revise the criterion, and test current behavior. | SF-Q01,05 |
| Useful criteria lost | A later repair forgets that ordinary record amounts must remain unchanged. | Carry that protection into the new plan and regression checks. | SF-Q04,05 |
| Style replaces outcome | A longer review is scored better despite adding unsupported findings. | Judge relevant findings and noise; length alone does not establish usefulness. | SF-Q01,02 |
| Proxy becomes real-world claim | A model likes a document, so human comprehension is declared improved. | State what the model judged; human comprehension remains unmeasured. | SF-Q03,07 |
| Unsupported change avoided | No candidate shows a worthwhile benefit within the budget. | Retain the baseline or defer, preserving reasons and the next useful check. | SF-Q08,09 |
| Same result, simpler records | One note supports equally good decisions with less reading than five files. | Prefer or further test the simpler format; file count is not an outcome. | SF-Q06,09 |

Sources: Six-step workflow walkthrough - four skills (external research note), the proposed structure, and the pilot designs. These examples were authored to challenge the design; their expected handling needs independent review before use as scored references.

Open: are important failure modes missing, and would reasonable alternative outputs be wrongly rejected? Add observed failures with provenance. Once a case guides a revision, treat it as development evidence and assess transfer on fresh cases.

Next: [Feedback](Feedback.md).
