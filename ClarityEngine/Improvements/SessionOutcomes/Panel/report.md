# Panel-completion comparison

## Decision and scope

Retain the planned-panel evidence change in ClarityEngine 1.5.1, with the final [independent adjudication](adjudication.md) supporting all ten bounded cases. This is a bounded improvement to reporting review completion, not evidence of better prose, human comprehension, rendering, or reliable live reviewer orchestration.

Baseline: `80d6099f6c7c76dd0995284f7a3ae49d72cbb7d6`. Candidate v1 is preserved in this folder. Final candidate v2 is the Gate/Verify change in the enclosing commit; exact Git blob identities are recorded in results.json. Other workflows and writing tools did not change.

## Diagnosis and qualification

Gate selected reviewers but passed only the completed set to Verify; Verify derived applicable required checks from returned reviewers. A partially absent panel could therefore report Ready. The historical handoff about a repair round with no lens files supports the importance of execution evidence, but was a user-provided report, not independently inspected original reports. The partial-panel defect was found by current source inspection and reproduced in synthetic decision-path executions.

M1 evidence reconciliation is qualified only for these explicit contract cases: completed required current evidence allows Ready absent defects; missing required evidence prevents it; intentional exclusions do not block it; valid evidence survives an unrelated later tool failure; old evidence cannot establish current checks or defects. These labels follow CE-O8 and the existing requirement for verified checks. A separate reviewer checked the reference controls before comparison. No preference score or agreement count supplies the reference truth.

## Executions

Fresh baseline and candidate agents received the same recorded reviewer-result fixtures, workflow files and permissions. They executed bookkeeping, handoff, and final report decisions, without launching real lens agents. This tests the final status reported to the author given recorded execution evidence. It is not a live filesystem/reviewer-failure injection test. The agent model/settings were inherited equally; exact model build and token costs were unavailable.

V1 used eight cases per version (16 case executions). Baseline returned false Ready in C2 missing Cutter, C3 stale Navigator and C4 empty AudienceFit. Candidate returned Unverified for those while preserving the valid Reader's Pass. Complete short panels, confirmed Major defects, zero evidence, later unrelated errors and two audiences produced the reference statuses. V1 design review then found reconciliation occurred too late to exclude stale findings before scoring and that repair Reader selection was singular.

V2 moved reconciliation before scoring/adjudication and explicitly reruns one Reader per intended audience. Before rerunning, the plan added C9 stale negative findings and C10 multi-audience repair. All ten cases were run for both versions (20 case executions). The v2 fixture preserves its original heading/eight-report wording plus appended cases; the executor instruction explicitly requested ten and both outputs contain ten. This editorial mismatch did not remove cases or change references.

| Case | Baseline v2 readiness / comprehension | Candidate v2 readiness / comprehension | Result |
|---|---|---|---|
| C1 complete small panel | Ready / Pass | Ready / Pass | Preserved; no extra lenses demanded |
| C2 missing Cutter | Ready / Pass | Unverified / Pass | False readiness corrected |
| C3 old Navigator evidence | Ready / Pass | Unverified / Pass | False readiness corrected |
| C4 empty AudienceFit | Ready / Pass | Unverified / Pass | False readiness corrected |
| C5 confirmed Major plus missing check | NeedsRevision / NeedsRevision | NeedsRevision / NeedsRevision | Defect precedence and missing-evidence disclosure preserved |
| C6 no reports | Unverified / NotVerified | Unverified / NotVerified | Missing evidence remains unknown |
| C7 unrelated later error | Ready / Pass | Ready / Pass | Earlier valid evidence retained |
| C8 missing audience Reader | Permissive Ready / Pass, operator NotVerified | Unverified / NotVerified | Ambiguous aggregate rule made explicit |
| C9 stale negative finding | Ready / Pass; old finding excluded | Unverified / Pass; old finding excluded | Current coverage gap corrected; stale defect exclusion preserved |
| C10 multi-audience repair | Permissive Ready / Pass, operator NotVerified | Unverified / NotVerified | Both Readers dispatched; incomplete aggregate blocked |

The baseline's C8 differed across executions: v1 treated the missing audience as blocking, v2 exposed a permissive interpretation. Preserve that variation; do not claim the baseline always fails. The unambiguous C2–C4 result repeated in both comparisons. Both v2 versions excluded the stale negative finding and dispatched both Readers; those are preservation checks, not demonstrated additional gains.

## Retention rule and limits

Record.md stage 3 requires an observed false Ready corrected with all mandatory controls preserved. The v2 candidate meets this narrow rule in the recorded executions. Planned reviewers remain required after an unsuccessful retry; missing evidence is reconciled before findings; current valid evidence remains available; intended exclusions stay distinct. No universal pass rate or skill-wide readiness is inferred from these cases.

Next useful evidence: a live ReadabilityGate run that actually loses one current lens report while other reports succeed, plus a real multi-audience repair. This would test host orchestration beyond the recorded-evidence boundary exercised here. The independent-meaning check after final PlainRewrite composition remains a separate, unmodified hypothesis; it was not bundled into this repair.
