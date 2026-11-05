# ApproveSkill

Internal procedure; called by workflows, not automatically loaded at entry.

## Contract

**Input:** A fixed assessment, declared acceptance rule, candidate/baseline identities, and decision authority.

**Output:** A scoped decision: ready, not ready, or insufficient evidence; for updates, retain candidate/baseline or revise/defer.

## Steps

For behavioral updates, check completion against the original required outcome, not only the candidate author's selected test scope. Read the assessment's limitations and implicit preconditions. Each exclusion needs a basis in user intent or the actual contract. A new domain bound introduced merely to make passing tests sufficient does not discharge the original requirement.

Check composition at the affected producer/consumer boundary: do guarantees for individual valid inputs still hold after batching, accumulation, transformation or retries? Where that can defeat the same required result, request a concrete discriminating check. Do not infer the whole result from individually valid items or a passing component. This is a targeted contract check, not a demand to enumerate all inputs or solve unrelated defects.

If missing evidence has an authorized, feasible resolution within the remaining budget, return insufficient evidence with the specific next check to EvaluateCandidate through the owning workflow. Do not close the improvement as deferred merely because the current assessment is fixed. A partial gain may be retained as partial, but it does not complete the unresolved requested outcome. Keep real resource, authority and scope limits explicit.

1. Check that evidence matches the exact candidate, current criteria and qualified measurement versions/scope. Required unverified checks or unsupported measurement prevent readiness/improvement confirmation; return insufficient evidence unless a confirmed mandatory failure already determines not ready. Design delivery may still be complete.
2. Apply mandatory gates before aggregate benefits or preferences. For an improvement, decide targeted benefit and required preservation separately using the plan's coverage map; both must meet their declared rules. Missing required branch/dependency evidence blocks the broader claim even when executed checks pass. Use [RegressionCoverage](../Standards/RegressionCoverage.md); preserve narrower supported results and design-only delivery without implying workflow readiness.
3. Compare benefit and cost under the declared rule; expose unresolved value conflicts.
4. Return a justified decision with scope and revisit trigger. Cite the governing rule ID or section anchor, file/version, applicable evidence and decision authority.
5. Hand it to RecordLearning; make no deployment or installation action.

## Acceptance and failure checks

Reject a higher-scoring candidate with a mandatory regression. Defer when evidence is missing. A complete evidence packet can be judged independently of how the candidate was authored.

## References and limits

Use [Decision](../Templates/Improvement/Decision.md). This is an evidence gate, not a recurring user permission request. Existing user authorization remains valid; release policy is separate.

Status: proposed and unvalidated. Shared requirements: [Quality/Shared](../Quality/Shared.md). Test this procedure with fixed input artifacts independently, then test its handoffs.
