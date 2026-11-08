# ApproveSkill

Internal procedure; called by workflows, not automatically loaded at entry.

## Contract

**Input:** A fixed assessment, declared acceptance rule, candidate/baseline identities, decision authority, and the owning task's completion contract or declared scope.

**Output:** Two separate decisions: candidate readiness/retention, and task status `complete`, `continue` or `blocked` with unresolved required outcomes and next actions. Retaining or deferring a candidate does not finish the user's task.

## Steps

For behavioral updates, check completion against the original required outcome, not only the candidate author's selected test scope. Read the assessment's limitations and implicit preconditions. Each exclusion needs a basis in user intent or the actual contract. A new domain bound introduced merely to make passing tests sufficient does not discharge the original requirement.

Check composition at the affected producer/consumer boundary: do guarantees for individual valid inputs still hold after batching, accumulation, transformation or retries? Where that can defeat the same required result, request a concrete discriminating check. Do not infer the whole result from individually valid items or a passing component. This is a targeted contract check, not a demand to enumerate all inputs or solve unrelated defects.

If missing evidence has an authorized, feasible resolution within the remaining budget, record insufficient evidence and a `continue` task status with the specific next check for EvaluateCandidate through the owning workflow. Do not close the improvement as deferred merely because the current assessment is fixed. A partial gain may be retained as partial, but it does not complete the unresolved requested outcome. Keep real resource, authority and scope limits explicit.

1. Check that evidence matches the exact candidate, current criteria and qualified measurement versions/scope. For a repair claim, inspect the [baseline red case](DiagnoseGap.md#baseline-red-case-for-a-repair), its unchanged candidate rerun, preservation and fresh-case evidence; keep captured incidents, current reproduction and broader reliability claims distinct. Required unverified checks or unsupported measurement prevent readiness/improvement confirmation; set candidate readiness to insufficient evidence unless a confirmed mandatory failure already determines not ready. Still determine task status below. Design delivery may still be complete.
2. Apply mandatory gates before aggregate benefits or preferences. For an improvement, decide targeted benefit and required preservation separately using the plan's coverage map; both must meet their declared rules. Missing required branch/dependency evidence blocks the broader claim even when executed checks pass. Use [RegressionCoverage](../Standards/RegressionCoverage.md); preserve narrower supported results and design-only delivery without implying workflow readiness.
3. Compare benefit and cost under the declared rule; expose unresolved value conflicts. Equal regression passes establish shared adequacy, not equal quality. For an unresolved comparison, consume [PlanChange's tie diagnosis](PlanChange.md#diagnosing-an-unresolved-tie) and the measurement's comparative-resolution evidence. Distinguish scoped equality, unresolved measurement/precision and task-dependent tradeoffs; do not force a winner or silently close an outstanding improvement whose missing comparison has a feasible repair.
4. Record a justified candidate decision with scope and revisit trigger. Cite the governing rule ID or section anchor, file/version, applicable evidence and decision authority. When a recommendation depends on present adoption status, reconcile the exact candidate and change scope with the target's current release/integration records before deciding, including a recommendation to leave it pending. Historical trial notes establish trial-time status; retained, merged and installed are different states. Newer unrelated records do not supersede matching evidence. Reuse already-read evidence; do not scan the archive by default. If status is missing or conflicting, name the smallest read-only identity/record check and keep the status unverified.
5. Apply the task-completion check below and return both decisions to the owning workflow. RecordLearning preserves the result but does not convert `continue` into closure. Make no deployment or installation action.

## Task completion

For broad improvement, first reconcile the **parent** inventory from [ComprehensiveImprovement](ComprehensiveImprovement.md), its baseline structural review and all round results against the original request and target surface. Review scope adequacy independently of evidence validity: a faithful quote plus a narrow operator-written contract can still misrepresent the user's intent. Inspect missing workflow families, consequential outcomes and handoffs, not just whether each listed check passed. A round-complete or per-skill sampled pass cannot close that parent. Use `depth: comprehensive`, the hashed inventory and explicit scope/structure/outcome judgments in CheckCompletion. Shared artifacts can support several judgments, but one aggregate pass cannot hide uncovered outcomes or portfolio children. New in-scope gaps require a recorded parent amendment and continued work; do not demote them to optional future reliability work to obtain complete.

For behavioral updates, use the pre-edit [completion contract](../Templates/Improvement/Completion.md), grounded in the user's requested result and scope. Other callers use their declared task scope; an additional contract file is optional. These are task outcomes, not every desired property of the target: an assessment-only task can complete with a justified insufficient-evidence finding, and an explicit design-only task can complete with an unexecuted proposal. Neither exception applies when the user requested the behavior repaired. Review the assessment semantically before checking its structure: evidence must reach the requested outcome and the reported failure's missed decision, not merely a convenient toy task. An observed incident is already evidence of failure; inability to reproduce it in a weaker test does not erase it. If a relevant, feasible diagnostic remains, keep that work in the current repair rather than relabel it as optional future reliability research.

| Required outcome state | Task status and handoff |
|---|---|
| All required outcomes have applicable, qualified evidence | `complete`; report the scoped candidate decision and evidence. A supported no-change result may complete the task. |
| A required outcome is failed/unverified and an authorized, feasible action remains | `continue`; execute that action through the owning workflow, then reassess. |
| A required outcome is unresolved and no next action has been designed | `continue`; PlanChange must identify the next discriminating check. Missing planning is not an execution blocker. |
| Every unresolved required outcome is prevented by an evidenced runtime, authority, resource or user checkpoint limit, with no available authorized workaround | `blocked`; report the actual limit and the specific action needed to resume. Do not call the repair complete. |

For behavioral updates, run [CheckCompletion.cjs](../Tools/CheckCompletion.cjs) on the contract and assessment when Node or Bun is available, preserve its output, and consume its task status. The [format and invocation](../Templates/Improvement/Completion.md) explain evidence hashes and deliberate exit codes. Fix invalid input rather than bypass the check. Without a runtime, apply the same table manually and label that limitation. This check does not certify semantic relevance or install an application-level final-answer hook.

Do not use an exhausted self-selected pilot batch as evidence of an external resource limit. Plan the next discriminating check within the authorized scope rather than repeating saturated cases.

Keep candidate retention independent: `retain_candidate` with unresolved repair coverage still means `continue` or an evidenced `blocked`. Ties that show already-adequate behavior can justify no change, but ties from cases that do not exercise the reported failure cannot close that repair. Do not invent a large benchmark or repeat saturated tests; choose the smallest check that can settle the unresolved decision.

## Acceptance and failure checks

Reject a higher-scoring candidate with a mandatory regression. Missing evidence may defer candidate acceptance; task status follows the table above. A complete evidence packet can be judged independently of how the candidate was authored.

## References and limits

Use [Decision](../Templates/Improvement/Decision.md). This is an evidence gate, not a recurring user permission request. Existing user authorization remains valid; release policy is separate.

Status: proposed and unvalidated. Shared requirements: [Quality/Shared](../Quality/Shared.md). Test this procedure with fixed input artifacts independently, then test its handoffs.
