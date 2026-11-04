# Outcome decomposition and contribution mapping

Date: 2026-11-04. Candidate: 2.1.0-rc.3. Baseline: published 2.1.0-rc.2 at repository commit 1f0ec74d268996f1ca2778c70cbdd7ab9f05cf12. Status: authorized design revision in an isolated worktree; no installation, commit or publication in this attempt.

## Gap and authority

The owner accepted CodeReview's overall purpose and outcomes, then asked for granular outcomes that could inform each review dimension. The assistant had proposed moving to measurements without explicitly scheduling that decomposition. Inspection found that EstablishQuality derived/challenged outcomes but did not define adequate detail or a map from goals to existing capabilities. The Outcomes template lacked parent/contributor fields. This is an instruction gap and an execution omission; its causal contribution to future failures is unproven.

The owner authorized improving SkillForge so goals inform dimensions from specific needs. This does not authorize changing CodeReview's dimensions, accepting its proposed granular outcomes, or installing this SkillForge candidate. Prior human checkpoints persist for the CodeReview task.

## Desired behavior and design

- Derive specific, user-relevant outcomes where broad wording hides distinct meaningful failures. Preserve their connection to the purpose.
- Stop adding detail when a meaningful failure and valid alternative can be distinguished and a useful check or change can be designed; no fixed tree depth.
- Map outcome contributions to existing or proposed dimensions/capabilities where useful. Explain what each contributes, not merely its label.
- Use coverage gaps or unsupported responsibilities to propose design changes, without treating the existing structure as requirements or the mapping as authority to edit it.
- Preserve complementary overlap, cross-cutting requirements, explicit constraints, narrow maintenance and assessment-only boundaries. Do not double-count a finding or claim causal credit from a mapping alone.

EstablishQuality owns outcome detail and the contribution map. Its existing Outcomes template carries the record. PlanChange consumes the map to justify bounded changes and preservation checks. No new procedure, agent call or mandatory file is introduced. DesignMeasurement still owns qualification of measures; RegressionCoverage still governs affected branches and dependencies.

Alternative: leave this implicit and rely on the operator to infer decomposition. That remains a viable baseline. The candidate makes the expectation explicit; its effectiveness has not been compared.

## Illustrative CodeReview application

This is a design example, not an approved CodeReview quality record or executed trial.

Parent outcome: identify consequential behavior failures. A more specific outcome: identify when a retry after an uncertain response can repeat a charge, explaining the actual sequence and affected rule.

| Contributor | Goal derived from that specific outcome |
|---|---|
| Resilience | Examine partial-failure and retry paths; explain how recovery can repeat an already completed side effect. |
| Correctness | Identify the payment rule that must remain true and the execution path that violates it. |
| Impact, where a caller contract is involved | Identify which consumer assumes retry safety and which changed promise makes its behavior unsafe. |

One issue can need these complementary contributions without becoming three findings or requiring three independent scores. A valid idempotent retry with supported deduplication should not be flagged merely because retries exist. The contributor list is a hypothesis about useful review responsibilities; it is not proof that every lens is necessary or effective.

If a required outcome has no credible contributor, investigate whether to clarify an existing responsibility, add capability or narrow the claim. If two dimensions serve the same outcome, inspect their distinct inputs/questions before proposing consolidation. An unclear map alone is insufficient evidence to remove a dimension.

## Design review scope and limits

The author reviewed the changed contracts and CreateSkill, UpdateSkill and EvaluateSkill callers. EstablishQuality retains decision ownership; PlanChange consumes rather than redefines the mapping. Create can use proposed capabilities without inventing dimensions; assessment-only mappings remain external; Update's typo and bounded-refactor paths still bypass full quality regeneration. Focused repairs revisit only affected mappings. Requested human review includes newly introduced detailed requirements rather than assuming approval from a broad-goal agreement.

The example above is a self-check of the design, not behavioral evaluation. No fresh-agent, baseline/candidate, autonomous or downstream trial has run. Existing rc.1/rc.2 evidence does not validate this revision. Static package checks are recorded after execution below. A future behavioral comparison should include a multi-domain skill, a simple skill without dimensions, complementary overlap, an uncovered goal, a narrow repair, and assessment-only scope. Freeze their references and decision rules before using results to select this candidate.

Verification: the bundled structural validator passes 14/14 checks; all 232 ordinary inline Markdown file references resolve; the new outcome-contribution-mapping anchor matches its heading; git diff whitespace checks are clean. Review of changed contracts and callers found no blocking design contradiction within this scope. This is author review, not independent behavioral confirmation. Only SkillForge files changed. Retain as a reviewable design candidate; do not claim improved execution from these checks.

## Evaluation handoff correction

The owner subsequently challenged the lack of outcome testing and clarified that UpdateSkill should attempt it. The old workflow named EvaluateCandidate but made execution conditional without distinguishing an improvement request from explicit design-only scope. The assistant had ended at design delivery. The candidate now makes proportionate outcome evaluation part of improvement/repair scope, preserves explicit design-only/maintenance paths, resumes after resolved human checkpoints, and requires an outcome decision or a specific pending checkpoint/limitation. U06 records this expected result; no tool-run claim is implied by the new wording.

The owner accepted the proposed baseline/candidate comparison criteria. Freeze this combined candidate before execution; a comparison now concerns decomposition/mapping plus this evaluation-handoff clarification and cannot isolate their individual causal effects. Subjective proposal usefulness still requires the planned owner review; raw exploratory runs may proceed without pretending their judgment method is already qualified.
