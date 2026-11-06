---
status: proposed
version: 0.1
updated: 2026-11-03
---
# Feedback — UpdateSkill

Use matched baseline/candidate executions, targeted failure cases, preservation checks, and fresh cases for broader claims. Record differences in environment and missing observations.

For U06, inspect whether the attempt actually reaches outcome evidence and a decision after authorized checkpoints are resolved. A document promising future tests is not evidence that evaluation happened. Distinguish legitimate design-only delivery or an unresolved checkpoint from prematurely ending a behavioral improvement request. Inspect the completion contract, checker output (or labeled manual check), and whether `continue` actually led to the next action. A report that relegates an authorized in-scope repair check to future work fails this handoff.

Record criterion IDs, raw outputs, version identities, failed checks, costs, and unresolved judgments. [EvaluateCandidate](../../Procedures/EvaluateCandidate.md) owns evidence collection; [ApproveSkill](../../Procedures/ApproveSkill.md) owns readiness decisions.

For U08/U09, compare original intent and the full primary task surface with the parent inventory **before** judging the selected round. Inspect actual follow-up execution after an initial green case: were uncovered families and structural defects evaluated/repaired, or only listed and deferred? Check resulting target behavior through its callers, not outcome counts or the word comprehensive. Passing one sampled task per portfolio skill cannot establish broad closure. Preserve focused/no-change controls to reject unnecessary restructuring or endless iteration.

Source: [Outcomes](Outcomes.md) and the project's pilot designs. No executions have qualified this profile. Revisit on grader disagreement, false passes, false failures, or changed conditions. Open: reliability across models and task families.

For U10, inspect the relevant execution path and the resulting target task, not just package size. Check whether reduced loading, navigation, calls, records or repetition preserves required results and avoids shifting cost into retries or user work. Compare only observed, compatible costs under matched conditions; static word counts support instruction-volume claims only. Accept justified no-change and existing compact records. Test a misleading shorter candidate that drops a required exception and a valid longer candidate that avoids repeated lookups. Scope checks must reject turning a typo into an efficiency audit. [EstablishQuality](../../Procedures/EstablishQuality.md#operational-efficiency) owns the outcome consideration; DesignMeasurement owns its measurement.
