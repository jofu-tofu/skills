---
status: template
trust: T3
updated: 2026-11-03
---
# Attempt plan template

Complete before execution. Unresolved required fields mean the run is not ready. For assessment-only work, state the question and target version; mark change-only fields and an unnecessary comparison baseline not applicable, with a reason. This does not authorize edits or execution.

| Field | Record |
|---|---|
| Attempt and scope | ID, target skill/workflow, task conditions, and claim level. |
| Starting state | Exact target version and comparison baseline when applicable, environment, relevant prior decision, and quality document snapshots or hashes. |
| Observed problem | Assessment question, requested gain, or failure and evidence; separate observation from suspected cause. |
| Gap diagnosis | For a reported gap, link [GapRecord](../../Templates/Improvement/GapRecord.md); identify skill/outcome/case/checker/evidence gap and why the selected artifact should change. |
| Context check | Applicable criterion IDs; revised, retired, or unresolved criteria with reasons and authority. |
| Research decision | For broad improvement: question, existing evidence, academic search findings and limits, or why no new search is useful; distinguish unavailable research from sufficient evidence. See [PlanChange](../../Procedures/PlanChange.md#research-decision). For other scopes, apply only when relevant. |
| Hypothesis | For creation/change, smallest proposed change, predicted benefit, and evidence that would disprove it; not applicable to assessment-only work. |
| Protection | Mandatory behavior and affected dependent workflows. |
| Regression coverage | For behavioral changes/workflow readiness: map requirements to affected branches/dependencies and cases or reused evidence; justify exclusions and show untested scope. See [RegressionCoverage](../../Standards/RegressionCoverage.md). Preserve lightweight/design-only limits. |
| Comparison | Target inputs, cases, judges and reference qualification; add baseline/candidate inputs and controls for comparison claims. |
| Experiment adequacy | Decision and required outcome reach; rival explanations; baseline opportunity and test sensitivity; realistic subject information; consequential case breadth; interpretation and next action for favorable, adverse, tied and unavailable results. See [PlanChange](../../Procedures/PlanChange.md#experiment-adequacy). |
| Decision rule | Assessment/readiness rule or required benefit, applicable regression gates, uncertainty handling, and cost tradeoff. |
| Budget and stopping | Finite runs, time/tokens, error handling; completion/defer conditions, plus retain/reject/revise conditions for updates. |
| Evidence destination | Raw outputs, checks, costs, and resulting decision record. |

Review the active workflow's feedback requirements: [UpdateSkill](../../Quality/UpdateSkill/Feedback.md), [CreateSkill](../../Quality/CreateSkill/Feedback.md), or [EvaluateSkill](../../Quality/EvaluateSkill/Feedback.md). For a measurement change, preserve its prior version and reassess affected evidence; comparisons use the same revised specification for baseline and candidate. Record protocol amendments before affected executions; preserve prior versions.
