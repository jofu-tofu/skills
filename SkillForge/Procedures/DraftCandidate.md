# DraftCandidate

Internal procedure; called by workflows, not automatically loaded at entry.

## Contract

**Input:** A scoped plan, target intent, and preserved baseline where one exists.

**Output:** A separate candidate version plus a change summary.

## Steps

1. Read the target intent and affected instructions.
2. Implement the smallest coherent change or initial candidate within scope.
3. Preserve baseline and comparison records; separate criterion changes from instruction changes.
4. Check links, structure, and dependencies. Record behavioral checks not run.
   Use [Authoring](../Standards/Authoring.md) and bundled [ValidateSkill.ts](../Tools/ValidateSkill.ts) for supported skill structure; see [tool invocation](../Tools/README.md). A validator's naming conventions are not universal behavioral requirements.
5. Hand the exact candidate identity to EvaluateCandidate.

## Acceptance and failure checks

The candidate is reviewable and attributable to the plan. Structural success does not imply behavioral improvement.

## References and limits

For authoring new target workflows, separate user tasks from shared procedures using [Architecture](../Architecture.md).

Status: proposed and unvalidated. Shared requirements: [Quality/Shared](../Quality/Shared.md). Test this procedure with fixed input artifacts independently, then test its handoffs.
