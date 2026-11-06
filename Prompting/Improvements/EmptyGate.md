# Empty gate collection

Outcome PR10: a composed checklist preserves real supplied conditions and does not fabricate a gate when the collection is empty.

Broader primitive checks found `{gates: []}` rendered an unnamed `Checklist` because the empty array selected the single-gate fallback. The fallback now requires an actual `gate`. This preserves existing single/multiple-gate behavior; no schema or helper API changed.

Actual Roster/Structure/Gate checks improved 5/6 to 6/6: empty collection, empty optional conditions, two populated gates, two roster entries, empty roster and ordered workflow/tool handoffs. Portable renderer/validator suite now 24/24. These are rendered-content checks, not proof that an arbitrary downstream model obeys every interpolated instruction.

External evidence: RemainingSkills20261104/deep/reasoning/primitive-breadth/{before-empty-gate,after-empty-gate}/results.json; tool-runs/candidate6/final-portable-tests.txt. Candidate6 was staged from the prior snapshot; its inherited older result files are not new executions. Frozen model-authoring comparisons predate this isolated Gate change and do not render that primitive. Source authority/downstream tests remain separately recorded.
