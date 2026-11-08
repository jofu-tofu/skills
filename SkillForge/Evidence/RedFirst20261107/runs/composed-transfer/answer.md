# Dossier assessments

Scope: supplied synthetic records only, evaluated as of each request date. Routed through `method/Workflows/EvaluateSkill.md`; this is an assessment using existing evidence, not an execution comparison or release authorization. Exact identity, scope, source integration and active installation are assessed separately. No target was changed, installed or deployed. No new behavioral success measure is claimed. This report preserves observations, decisions and remaining checks under RecordLearning; the prompt limits output to this answer and the reader ledger.

## h01 — SortCards SC-09 / sc09-f4, 2026-10-09

**Recommendation:** Keep SC-09 out of source and installation. Next, investigate and reproduce the mixed-script regression, prepare a targeted correction, and require the stated review before any reapplication.

Evidence: `cases/h01/records/trial.md` (October 2) says SC-09 was retained after ordering examples passed, but “Mixed-script titles omitted.” `cases/h01/records/release.md` (October 7) records full merge and installation in S6, receipt DS6. The later `cases/h01/records/incident.md` (October 9) says “Commit r609 reverted the complete SC-09 patch” and DS7 restored S5 without SC-09; “Source and installation now both exclude it.” It explicitly holds reapplication until a mixed-script fix passes review. The incident's S6 title is a search label, not the active version.

Limits and next check: The dossier establishes rollback and a reported regression, not its root cause, frequency or a successful repair. The omitted case family explains a coverage gap, not necessarily the implementation fault. Recover J3's input, expected ordering and actual output; reproduce against the identified pre-revert patch, preserve that failing case, then check a correction on the same case, ordinary ordering and fresh mixed-script cases. No reproduction was executed here. The old trial pass cannot establish current readiness.

## h02 — ClipGuide CG-22 v2 / cg22-v2, 2026-10-10

**Recommendation:** Prepare the separate paste-recovery delta release for source integration and installation through the existing process. Do not reapply the keyboard hints or treat the whole v2 request as delivered.

Evidence: `cases/h02/records/trial.md` (October 1) says v2 adds paste recovery to v1 keyboard hints and both passed the constructed trial and were retained. `cases/h02/records/release.md` (October 8) says C8 installed “CG-22 v1 / cg22-v1 keyboard hints only”; paste recovery from cg22-v2 “was excluded.” Its title “CG-22 delivered” does not cover v2. `cases/h02/records/queue.md` (October 10) says the paste-recovery delta remains “approved and pending in source and installation,” while keyboard hints need no repeat application, and calls for a separate delta release note.

Limits and next check: Retention and approval are recorded; integration and installation of the delta are still pending. Trial paste examples cover plain text only, so broader paste behavior is unverified. Prepare the scoped release note and manifest for that delta, preserve the installed hints, and obtain a matching source/installation receipt when the authorized release occurs. This recommendation performs no release and claims no rich-text validation.

## h03 — NameMap NM-31 / nm31-g5, 2026-10-12

**Recommendation:** Take NM-31 alias deduplication to the reserved source-integration review and advance that exact approved patch through integration, with installation tracked separately. Do not close its queue based on N14.

Evidence: `cases/h03/records/trial.md` (October 3) says NM-31 was retained and approved for source integration. `cases/h03/records/ledger.md` (October 6) says NM-31 / nm31-g5 remains “unmerged and absent from active installation” and notes the next review slot. The newer `cases/h03/records/release.md` (October 12) identifies N14 as NM-32 / nm32-h8 export timestamps only. Its complete manifest has “no NM-31 or alias-deduplication files” and “the NM-31 queue was unchanged.” Thus the generic announcement “NameMap upgrade shipped” is not delivery evidence for the requested identity.

Limits and next check: The complete manifest and unchanged queue support non-delivery of NM-31, not merely missing evidence of delivery. Approval for source integration does not itself prove integration, installation or general effectiveness. Confirm the nm31-g5 patch at the reserved review, record its eventual merge identity, then obtain exact installation evidence through the appropriate authorized process. No such action was executed here.

## h04 — ReadPatch RP-16 / rp16-j2, 2026-10-11

**Recommendation:** Record RP-16 as integrated and installed and close the earlier installation-identity verification item using DR11. No repeat verification or deployment is needed to resolve that specific historical uncertainty.

Evidence: `cases/h04/records/merge.md` (October 4) says the complete RP-16 / rp16-j2 patch merged into main at c416 and constructed quotation checks passed. `cases/h04/records/audit.md` (October 5) could not identify the copied installation because the label and digest were missing; it proposed verification before deployment. The later `cases/h04/records/receipt.md` (October 11) supplies precisely that missing evidence: “DR11 identifies the active installation by digest rp16-j2” and maps it to complete source tree c416; “All RP-16 files match.” No later deployment or rollback is recorded.

Limits and next check: DR11 resolves the earlier identity uncertainty as of the requested date. It does not prove universal quotation-boundary correctness, and normal launching or a refreshed shortcut would not establish identity. Preserve the DR11-to-c416 link in the completion record; use new behavioral evidence only if a broader correctness claim or new incident requires it. No redundant deployment is recommended.

## Access, failures and truncation

All method and dossier access used the required instrumented reader against `inputs/composed-transfer`; its ledger is `runs/composed-transfer/reads.jsonl`. The prompt was read directly, as allowed. No other experiment root, prior answer, grading key, web, Git, external reference or agent was accessed. The supplied method's own `Standards/Grader.md` was read because EvaluateCandidate explicitly references it; it is method guidance, not an experiment grading key.

No reader or command failure occurred. No host/tool output truncation was observed. The reader's 10,000-character pagination limited one multi-file read after the beginning of RecordLearning; dossiers were then read fully in a separate invocation, and RecordLearning was recovered with the later method-reference read. That reference read was paginated at offsets 10000, 20000 and 30000 through `[End of output]`. All four dossiers' requests and three records each were read in full. There were no unlogged method/dossier reads. No optional historical method records were sought. No behavioral trials were run; model usage, elapsed evaluation time and billing figures are unavailable and are not estimated.
