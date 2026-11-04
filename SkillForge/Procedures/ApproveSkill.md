# ApproveSkill

Internal procedure; called by workflows, not automatically loaded at entry.

## Contract

**Input:** A fixed assessment, declared acceptance rule, candidate/baseline identities, and decision authority.

**Output:** A scoped decision: ready, not ready, or insufficient evidence; for updates, retain candidate/baseline or revise/defer.

## Steps

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
