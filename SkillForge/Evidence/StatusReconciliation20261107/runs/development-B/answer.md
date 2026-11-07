# Four dossier decisions

Assessment-only application of `method/Workflows/EvaluateSkill.md`, using the supplied records without executing new tests. `method/Procedures/ApproveSkill.md`, step 4, requires reconciling exact identity and scope with current records and distinguishing retained, merged and installed states. This report completes the requested recommendations; it does not execute integration or installation.

## d01 — RouteNotes RN-17 / rn17-a6, full routing-note change

**As of 2026-09-10: correct the agenda to record the change as already merged and installed; do not repeat integration.**

- `cases/d01/records/trial.md` (2026-09-03): “Retain RN-17 for integration review”; the trial “performed no source merge or installation.” Its four passing constructed examples support only that bounded trial.
- `cases/d01/records/release.md` (2026-09-09): “R12 merged the complete RN-17 / rn17-a6 change at c120.” It adds that receipt I12 “installed that exact tree in the active location” and the inventory lists rn17-a6. This establishes both states for the requested complete scope within this dossier.
- `cases/d01/records/queue.md` (2026-09-10): the integration agenda “was copied from September 3 without reconciling release receipts.” Its later date does not make the copied instruction authoritative over the matching receipt.

No deployment work remains evidenced for this change. The dossier does not establish universal routing effectiveness or production benefit; those claims are outside this recommendation.

## d02 — TableHints TH-08 / th08-b2, header alignment

**As of 2026-09-12: take the approved TH-08 / th08-b2 change into its next integration slot, then verify the resulting source identity and record installation separately if undertaken.**

- `cases/d02/records/trial.md` (2026-09-04): TH-08 “passed five constructed examples and was retained; no merge or install occurred.” Retention is not deployment.
- `cases/d02/records/release.md` (2026-09-11): “R21 contains TH-07 only”; TH-08 / th08-b2 “is absent from both the source manifest and installed inventory.” R21 therefore does not supersede the pending requested change.
- `cases/d02/records/review.md` (2026-09-12): exact candidate TH-08 / th08-b2 “is approved for the next integration slot. No merge has been applied; source remains R21.” This supplies approval and the concrete pending action.

The evidence supports approved-but-unmerged status, not an additional readiness claim beyond the five examples or an assertion that installation is complete. The exercise authorizes recommendations only; no integration is performed here.

## d03 — LinkAudit LA-04 / la04-c7, backlink preservation

**As of 2026-09-13: reconcile L9's identity records before recommending integration, reinstallation or declaring completion. Obtain the original package manifest and a trustworthy mapping of its contents/digest to la04-c7, and resolve the contradictory signed inventories.**

- `cases/d03/records/trial.md` (2026-09-02): the retained archive identifies LA-04 as “la04-c7, for backlink preservation”; “no integration” occurred in that trial.
- `cases/d03/records/release.md` (2026-09-13): the signed L9 ledger marks LA-04 “integrated and installed as digest la04-d9,” but “No mapping from la04-c7 to la04-d9 is supplied.” The familiar short label does not establish identity.
- `cases/d03/records/inventory.md` (2026-09-13): another signed L9 inventory marks “la04-c7 pending and la04-d9 a separate link-normalization artifact.” Both records have “the same release time” and there is “no superseding correction.”

Requested candidate integration and installation are **unverified due to conflicting evidence**, not confirmed pending or complete. Neither equal authority nor chronology resolves this conflict. The original manifest is the smallest useful next evidence source, but a reliable reconciliation may also require a corrected signed record or content comparison. This dossier cannot settle that external check; the assessment itself is complete with explicit uncertainty.

## d04 — DraftGuard DG-12 / dg12-e3, complete warning-text change

**As of 2026-09-15: verify the active copied package against the complete dg12-e3 change at c314 before deciding whether installation is needed. Do not merge it again.**

- `cases/d04/records/trial.md` (2026-09-01): constructed wording checks passed and the candidate was retained for integration; “No production adoption measured.”
- `cases/d04/records/merge.md` (2026-09-14): “Commit c314 contains the complete DG-12 / dg12-e3 change and is merged into main.” This settles source integration, while “No deployment receipt accompanies it.”
- `cases/d04/records/machine.md` (2026-09-15): active installation is “a copied package, not a link to main”; its version field is missing and “no digest or file contents were captured.” Successful launch does not identify its version.

Source integration is confirmed; installation of this exact complete change is **unverified**. Capture the active package contents or digest and compare them with the corresponding c314 artifact. If it matches, record installation evidence; if it differs, plan the required installation. A missing version field and receipt do not prove the copy is old or that deployment remains pending.

## Evidence and access record

All method and dossier content was read through the prescribed instrumented reader into `reads.jsonl`. Only the task prompt was read directly, as expressly permitted. No other roots, prior answers, external references, web, Git or agents were consulted. No target content was changed and no new behavioral results were invented.

No commands failed and no host output truncation occurred. Two reader outputs reached their explicit pagination boundary; both were continued with `--offset=10000` until `[End of output]`. The case records were read in full. The supplied historical method records were not consulted. This answer is the permitted assessment/learning record; no additional output files were created. Model-token usage, billing and latency are not asserted.
