# EvaluateCandidate

Internal procedure; called by workflows, not automatically loaded at entry.

## Contract

**Input:** A named candidate, frozen criteria, cases, judge specification, and baseline when required.

**Output:** An assessment with observations, costs, uncertainties, and evidence references.

## Steps

If the suite is missing, call [ConstructCases](ConstructCases.md) first with the applicable PlanChange plan/version. Resolve execution-plan conflicts with its policy owner before running checks. Read [Schemas](../Standards/Schemas.md) for evaluation-plan.json, results.json, and improvement records; [Grader](../Standards/Grader.md) for evidence-backed judgments.

1. Check input versions, criterion scope, and linked measurement qualification evidence. Call [DesignMeasurement](DesignMeasurement.md) for new, changed, unsupported or out-of-scope measures. A required measure that remains designed/unqualified permits labeled exploratory or qualification work, but its target check remains unverified and cannot establish improvement/readiness. Reuse adequate qualification evidence without unnecessary reruns. Validate any newly used checker on known positive/negative cases, valid alternatives and misleading passes.
2. Use provided evidence where sufficient; otherwise run only authorized, budgeted checks.
3. Match conditions across comparisons. Keep reserved cases out of the authoring context.
4. Preserve all outcomes, including failures and missing data; do not quietly retry until success.
5. Report per-criterion results against the plan's coverage map, including omitted and unexecuted required rows. Return targeted benefit and preservation evidence separately; a passing subset cannot establish workflow-wide preservation. Use [RegressionCoverage](../Standards/RegressionCoverage.md) for scope interpretation. Return evidence and limitations without editing the target.

Use disposable workspaces and separate contexts where available. Keep baseline and candidate inputs equivalent, record model/runtime/tools and version hashes, and exclude the target from a no-skill baseline. Disclose inability to isolate; such execution supports only a limited smoke test. Context separation does not establish independent reference evidence or eliminate shared model errors.

Preserve timeouts and runtime errors separately from valid task failures. Record unavailable usage as unknown, not zero. Correcting a checker creates a new suite version and requires affected comparisons to be rerun; preserve old results.

Write results.json and report.md using the bundled schema. Report paired case/trial differences, regressions, variation when measured, and fresh-case exposure. A fix needs observed targeted resolution and preservation checks; if the baseline failure is not reproduced, the fix claim remains inconclusive. Use aggregate_benchmark.py or the review viewer only when helpful and schema-compatible; neither is required to finish a report.

## Acceptance and failure checks

Known faults are detected; valid alternatives are accepted; missing data is unverified rather than pass. Assessment-only requests leave target content unchanged.

## References and limits

Use [Results](../Templates/Improvement/Results.md). Record independence of evidence, reference construction and adjudication separately from context isolation; no specific agent count establishes validity. Canonical tri-state results follow [Schemas](../Standards/Schemas.md#canonical-resultsjson); Boolean exports are optional and never map unknowns to failure or success.

Status: proposed and unvalidated. Shared requirements: [Quality/Shared](../Quality/Shared.md). Test this procedure with fixed input artifacts independently, then test its handoffs.
