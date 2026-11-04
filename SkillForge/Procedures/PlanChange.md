# PlanChange

Internal procedure; called by workflows, not automatically loaded at entry.

## Contract

**Input:** A target quality profile and a creation, change, comparison or assessment request, with authorized scope and budget.

**Output:** A frozen plan naming the target/version, requested claim, checks, budget and stopping rule; baseline and change hypothesis only where applicable.

## Steps

1. Identify the requested claim and available evidence. For creation or change, identify the desired difference and distinguish observed failure from design hypothesis. For assessment-only work, name the question and target version; mark change hypothesis not applicable. For a reported gap, load its [DiagnoseGap](DiagnoseGap.md) record or call that procedure if missing. Identify whether the target skill, outcome, case set or checker needs revision; a plan need not include a skill edit.
2. For comparison or benefit claims, name the baseline or alternative and preserve its version. A single-version assessment or readiness check needs no comparison baseline; record it as not applicable.
   For broad improvement, order plausible changes by expected contribution to the agreed outcomes, evidence, effort, regression risk and dependencies. Start with the smallest useful, reversible step that can resolve an important uncertainty or deliver a checkable benefit; give the reason for that order. Structural cleanup may come first when it removes an identified obstacle, but new folders or conformity to SkillForge's layout are not benefits by themselves. Keep later stages provisional and revisit them after each result; a useful plan may defer structural changes or make no skill edit.
   Use EstablishQuality's outcome contribution map when present: tie a proposed component change to the specific result it should improve, the gap or overlap motivating it, and the other contributions it must preserve. A shared goal alone does not justify merging dimensions, and an unmapped goal does not automatically require a new one. Keep responsibility changes as hypotheses until checked against the final outcome and affected handoffs. This map informs the regression-coverage map below; it does not replace execution evidence.
3. Define protected behavior, affected dependencies, assessment or comparison cases and measurement specifications with qualification evidence/status. Call [DesignMeasurement](DesignMeasurement.md) if missing, changed or unsupported; design-only plans may retain pending qualification. Select evidence methods before defaulting to a judge, and name unsupported outcomes explicitly.
   For behavioral changes or workflow-level readiness, apply [RegressionCoverage](../Standards/RegressionCoverage.md). Record the requirement-to-branch/dependency-to-evidence map, justified exclusions and untested scope. Declare targeted benefit and preservation gates separately; match coverage to claim breadth and preserve lightweight/design-only limits.
4. Declare assessment, improvement or readiness rules, budget, and error handling before execution. For staged work, state the next step's benefit and preservation checks and what would justify continuing, revising or stopping; do not bundle later hypotheses into a single untestable overhaul. This plan owns attempt policy. ConstructCases derives execution details from its identified version; resolve policy conflicts here through an explicit amendment, preserving the prior plan and affected evidence.
5. Record design-only limits where execution is outside scope.

## Acceptance and failure checks

The plan permits findings that contradict the claim and does not require a candidate to win. An assessment-only plan can be executed without inventing a revision or baseline. Mandatory unknowns prevent a confirmed verdict, not an honest draft.

## References and limits

Use [Plan](../Templates/Improvement/Plan.md).

Status: proposed and unvalidated. Shared requirements: [Quality/Shared](../Quality/Shared.md). Test this procedure with fixed input artifacts independently, then test its handoffs.
