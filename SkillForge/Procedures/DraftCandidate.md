# DraftCandidate

Internal procedure; called by workflows, not automatically loaded at entry.

## Contract

**Input:** A scoped plan, target intent, and preserved baseline where one exists.

**Output:** A separate candidate version plus a change summary.

## Steps

1. Read the target intent and affected instructions.
2. Implement the smallest coherent change or initial candidate within scope. When changing error, completion or retry handling, identify where execution status becomes an outcome verdict and what evidence is available at that decision. Preserve evidence that already establishes an individual criterion; a later failure does not automatically erase it. Conversely, missing evidence cannot establish an observed negative. Derive both decisions from the criterion before choosing a blanket success/failure policy, then check the affected consumers.
   When changing a conditional step or its caller, trace how the caller decides whether that step is needed. Keep that decision and the skip path usable without resources required only by the optional work; moving detection into a tool can accidentally make its imports, initialization or preflight mandatory. Preserve one consistent decision rule and an executable caller-to-tool handoff. Do not silently skip work whose required dependency is genuinely missing.
3. Preserve baseline and comparison records; separate criterion changes from instruction changes.
4. Check links, structure, and dependencies. Record behavioral checks not run.
   Use [Authoring](../Standards/Authoring.md) and bundled [ValidateSkill.ts](../Tools/ValidateSkill.ts) for supported skill structure; see [tool invocation](../Tools/README.md). A validator's naming conventions are not universal behavioral requirements.
5. Hand the exact candidate identity to EvaluateCandidate.

## Acceptance and failure checks

The candidate is reviewable and attributable to the plan. Structural success does not imply behavioral improvement.

## References and limits

For authoring new target workflows, separate user tasks from shared procedures using [Architecture](../Architecture.md).

Status: proposed and unvalidated. Shared requirements: [Quality/Shared](../Quality/Shared.md). Test this procedure with fixed input artifacts independently, then test its handoffs.
