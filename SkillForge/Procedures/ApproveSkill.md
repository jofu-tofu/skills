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

## Owned outcome or bounded suggestion

Classify from the user's required result and preceding context, not from whether the latest idea came from research or whether its trial passed. Record the objective before editing; do not downgrade it after an unsuccessful candidate.

| Objective | What permits completion |
|---|---|
| **Repair** a reported or established gap | Applicable evidence shows the gap resolved, or disproves the diagnosis/expectation under the relevant conditions. A passing easier replay or absence of a new failure is not disproof of a captured incident. |
| **Enhancement** the user requires, including a missing capability or specified improvement | Evidence establishes that outcome. No invented historical failure is needed; rejecting one implementation does not discharge the requirement. |
| **Suggestion** the user only asks to try, without owning an unresolved outcome | A sufficient bounded evaluation can reject the suggestion and retain baseline. Do not invent a gap, force an edit or search indefinitely for a win. |

A research suggestion used to repair a gap remains a **repair**. “Keep baseline if this candidate fails” controls retention, not the parent repair obligation. Broad improvement retains its parent inventory regardless of a local suggestion's result. If intent is unclear, preserve the ambiguity and perform useful diagnosis; do not choose suggestion scope merely because it makes closure easier.

When a mechanism fails or ties, keep the gap visible and select the next useful diagnostic, alternate mechanism or correction to the measure/environment. Execute that work while authorized and feasible. Do not repeat a settled experiment or require a fixed number of attempts. Stop an owned-outcome task only with resolution, justified disproof for a repair, an explicit user scope amendment, or a genuine evidenced blocker. An amendment preserves the old contract and the source of changed authority; an agent's own pilot limit is not one.

For a no-change result, report which objective was evaluated, why it can close, and any still-owned gap separately from the rejected idea. The [completion format](../Templates/Improvement/Completion.md#objective-and-resolution) binds the objective and outcome disposition. A resolution label still needs qualified, relevant evidence; the checker cannot interpret the original request or prove a diagnosis false.

## Autonomous follow-up of gains and tradeoffs

Before closing an improvement, check for a promising measured gain or an unresolved effect that could change retention, scope or usefulness. Execute the next feasible, discriminating check under the existing authorization; do not turn it into a future-work suggestion or ask whether the user wants ordinary follow-up testing.

- Shared adequacy passes do not settle comparative value. A repeatable positive gain with required outcomes preserved and no relevant cost regression can justify retention; do not require a baseline failure or invent a minimum percentage. Honor explicit user thresholds and distinguish small gains from measurement noise.
- If the gain could reflect run or author variation, choose the check that separates those explanations. Repeating timings of one artifact does not confirm a method advantage. If a changed or unknown outcome could offset the gain, test that outcome or workload now. Preserve useful scoped gains while resolving tradeoffs; uncertainty is neither evidence of harm nor proof that everything else is unchanged.
- After each check, carry remaining in-scope questions forward. For a method-improvement claim, fixed-artifact checks cannot settle author variation: execute independent author confirmation when feasible, or name the capability or authority that prevents it. Do not silently narrow the requested improvement into a completed artifact assessment because both versions passed the old gate. One completed diagnostic does not resolve every question it leaves open.
- A frozen rule preserves the original result; it does not forbid a useful follow-up. Record a revised question and rule before collecting new evidence, then reassess both versions fairly. Do not rewrite old results to favor a candidate.

Return `continue` while such authorized, feasible work remains, and have the owning workflow execute it in the current task. Stop when evidence supports the scoped choice and no decision-changing check remains, or report a genuine scope, access, resource or human-decision limit. Do not repeat settled tests, invent production preferences, expand design-only work, or demand that every possible outcome be known. If a value judgment needs the user, establish the testable effects first and ask only for the remaining choice.

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

Keep candidate retention independent: `retain_candidate`, `retain_baseline` or `reject_candidate` with an unresolved owned outcome still means `continue` or an evidenced `blocked`. Apply the [objective distinction](#owned-outcome-or-bounded-suggestion) before accepting a no-change closure. Ties that show already-adequate behavior can justify no change, but ties from cases that do not exercise the reported failure cannot close that repair. Do not invent a large benchmark or repeat saturated tests; choose the smallest check that can settle the unresolved decision.

## Acceptance and failure checks

Reject a higher-scoring candidate with a mandatory regression. Missing evidence may defer candidate acceptance; task status follows the table above. A complete evidence packet can be judged independently of how the candidate was authored.

## References and limits

Use [Decision](../Templates/Improvement/Decision.md). This is an evidence gate, not a recurring user permission request. Existing user authorization remains valid; release policy is separate.

Status: proposed and unvalidated. Shared requirements: [Quality/Shared](../Quality/Shared.md). Test this procedure with fixed input artifacts independently, then test its handoffs.
