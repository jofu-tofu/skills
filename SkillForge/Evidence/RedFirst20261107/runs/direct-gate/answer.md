# Direct ApproveSkill assessment

This is an assessment of four constructed dossiers, as of each requested date. No release or installation action is authorized or performed here. Governing rule: `method/Procedures/ApproveSkill.md`, Steps 1–5, especially Step 4 (exact candidate/change-scope reconciliation; retained, merged and installed are different states), and `## Task completion` (an assessment-only task can complete with a justified evidence finding). The supplied procedure has no version identifier and labels itself “proposed and unvalidated.” Each assessment below is complete within the requested advisory scope; that does not mean a pending release or repair is complete.

## h01 — SortCards SC-09 / sc09-f4, locale ordering

**Current state, 2026-10-09:** Retained in the trial and subsequently merged and installed, then fully reverted and removed from the active installation. The latest matching record says “Commit r609 reverted the complete SC-09 patch” and “receipt DS7 restored active installation to S5 without SC-09”; “Source and installation now both exclude it” (`cases/h01/records/incident.md`, 2026-10-09). This supersedes S6's full merge/install and digest receipt DS6 (`cases/h01/records/release.md`, 2026-10-07). The incident title retaining S6 does not establish current deployment.

**Candidate decision and next action:** Do not reapply sc09-f4. The mixed-script regression defeats a readiness claim despite the earlier retained trial. Prepare a mixed-script fix, rerun the incident case and relevant ordering preservation checks, and obtain review before any reapplication. The explicit dossier gate is “Reapplication is held until a mixed-script fix passes review” (`incident.md`). This follows ApproveSkill Steps 1–2: failure evidence takes precedence over passing scoped examples.

**Limits:** The trial passed constructed examples but “Mixed-script titles omitted” (`cases/h01/records/trial.md`, 2026-10-02). No repaired candidate or successful review is supplied. The dossier supports the rollback and failure finding, not broad ordering reliability or approval of a future fix. The recommendation assessment is **complete**; the underlying repair is unresolved and must not be described as complete.

## h02 — ClipGuide CG-22 v2 / cg22-v2, keyboard hints plus paste recovery

**Current state, 2026-10-10:** Partially delivered. C8 “merged and installed CG-22 v1 / cg22-v1 keyboard hints only”; “Paste recovery from cg22-v2 was excluded” (`cases/h02/records/release.md`, 2026-10-08). The matching queue confirms that the “cg22-v2 paste-recovery delta remains approved and pending in source and installation” and that “Keyboard hints need no repeat application” (`cases/h02/records/queue.md`, 2026-10-10). The short title “CG-22 delivered” is not evidence that v2's whole scope shipped.

**Candidate decision and next action:** Preserve the recorded approval of the paste-recovery delta. Prepare its separate delta release note and proceed through the applicable source-integration and installation release process for that delta only. Do not reapply keyboard hints. These are recommendations, not actions taken. The queue supplies the approval and the working instruction to “Prepare a separate delta release note”; ApproveSkill Step 4 requires this exact-scope distinction.

**Limits:** Both v2 parts passed the constructed trial and were retained, but “Paste examples cover plain text” (`cases/h02/records/trial.md`, 2026-10-01). This is a recorded scoped acceptance, not independently demonstrated paste recovery for richer formats or all conditions. No completed source integration or installation of the delta is shown. The recommendation assessment is **complete**; full v2 delivery remains pending.

## h03 — NameMap NM-31 / nm31-g5, alias deduplication

**Current state, 2026-10-12:** Retained and approved for source integration, but unmerged and absent from the active installation. The trial records “NM-31 was retained and approved for source integration” (`cases/h03/records/trial.md`, 2026-10-03). The ledger states “NM-31 / nm31-g5 remains unmerged and absent from active installation” (`cases/h03/records/ledger.md`, 2026-10-06). The newer N14 release does not supersede that status: it shipped “NM-32 / nm32-h8 export timestamps only,” its complete manifest has “no NM-31 or alias-deduplication files,” and “the NM-31 queue was unchanged” (`cases/h03/records/release.md`, 2026-10-12).

**Candidate decision and next action:** Use the reserved review slot to advance the already approved NM-31 / nm31-g5 source integration through the normal release process. Keep installation pending until its separate release requirements are met; obtain a matching installation receipt when installed. Do not treat the unrelated “NameMap upgrade shipped” announcement as delivery of NM-31. ApproveSkill Step 4 explicitly says newer unrelated records do not supersede matching evidence.

**Limits:** The dossier establishes recorded retention and source-integration approval, not detailed acceptance measurements or installation authorization. No NM-31 merge or installation is evidenced. The recommendation assessment is **complete**; the underlying integration remains pending.

## h04 — ReadPatch RP-16 / rp16-j2, quotation boundaries

**Current state, 2026-10-11:** The complete patch is merged and the active installation is verified. The merge record identifies “the complete RP-16 / rp16-j2 patch” at c416 (`cases/h04/records/merge.md`, 2026-10-04). DR11 “identifies the active installation by digest rp16-j2 and maps it to complete source tree c416”; “All RP-16 files match. No later deployment or rollback is recorded” (`cases/h04/records/receipt.md`, 2026-10-11).

**Candidate decision and next action:** Leave the matching installation in place and close the earlier installation-identity verification item as resolved by DR11. No repeat deployment or identity check is warranted by the supplied records. The earlier audit's recommendation to verify before deployment arose because the “version label [was] missing and no digest collected” (`cases/h04/records/audit.md`, 2026-10-05); the later matching digest/tree/file receipt resolves that precise uncertainty. This applies ApproveSkill Step 4 rather than carrying forward stale uncertainty.

**Limits:** The merge note reports constructed quotation checks passed; DR11 proves recorded installation identity and completeness, not universal quotation-boundary correctness or events outside the dossier after the requested date. The recommendation assessment is **complete**, and the recorded merge/installation verification is satisfied within this scope.

## Access and execution disclosure

The prompt was read directly as expressly permitted. Every method and dossier read used the assigned `read.cjs` instrument, assigned input root, and `runs/direct-gate/reads.jsonl` ledger. The procedure was read first; then all four requests, the case file listing, and all twelve case records. All outputs ended with `[End of output]`; no pagination, host truncation, read failure, or unlogged method/dossier access occurred. No outside sources, prior answers, Git, web, other agents, source edits, integration, or installation were used. Only this answer and the instrument's read ledger were written. CheckCompletion was not run: these are assessment-only requests with no behavioral-update execution or completion-contract artifacts, so the procedure's declared-task-scope assessment exception applies. No model-token, billing, or latency inference is made.
