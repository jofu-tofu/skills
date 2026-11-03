---
status: proposed
trust: T3
version: 0.1
updated: 2026-11-03
human_confirmed: false
---
# Feedback — improve a skill

Scope: [Context](Context.md). Use the [criterion IDs](Outcomes.md) to connect observations to claims. No checks below have been executed for the replacement.

| Question | Observation and judge | Limitation |
|---|---|---|
| Are criteria grounded and usable? SF-Q01,02 | An independent evaluator applies them to fixed cases; compare decisions with separately reviewed references. | Agreement with flawed references is not validity. |
| Is the decision supported? SF-Q03,06 | Audit baseline identity, criterion versions, raw evidence, and cited conclusions. | Traceability does not establish causal attribution. |
| Did behavior improve without protected regressions? SF-Q04 | Compare baseline and candidate under matched conditions on relevant and fresh cases. Use mechanical checks where faithful, reviewed judgment elsewhere. | Finite cases support a scoped claim; stochastic results may need repetitions. |
| Were criteria reused appropriately? SF-Q05 | Compare applicable criteria, changed requirements, and resulting decisions against an independent reference key. | Repeating text or citing IDs does not show correct use. |
| Are claims and stopping honest? SF-Q07,08 | Inspect evidence scope, missing results, stopping decisions, and actual budget use. | Compliance alone does not prove a useful improvement. |
| Is the benefit worthwhile? SF-Q09 | Report decision quality, reading effort, tokens, elapsed time, and human review effort separately. | No universal exchange rate between quality and cost is established. |

## Existing experiment handoffs

Measurement design support: Measurement design workflow v0.1 (external research note) translates intended outcomes into evidence, checking methods, benchmark specifications and qualification tests. CodeReview measurement worked example v0.1 (external research note) demonstrates the proposed method across correctness and maintainability. These are Task 3 design artifacts, not a completed qualification or a replacement for the frozen protocols below.

1. Criteria-generation pilot (external research note) tests six-step specifications against a simple good-outcome question.
2. Document-reuse pilot (external research note) compares reconstruction, one note, and five documents during later bounded improvement runs.

The protocols own exact budgets, scoring, and proposed thresholds. Neither has run. These hand-authored SkillForge quality documents are design artifacts, not a substitute for the frozen, matched records required by the reuse experiment.

## Before and after a run

Before: verify references distinguish known good, bad, stale, and unresolved cases. Record criteria versions, baseline, model/environment, cases, and budget. Keep reserved cases unavailable to the improver.

After: preserve raw observations and failures. Separate facts, interpretations, and decisions. Report retain/reject/revise/defer with scope and uncertainty; missing evidence stays unverified. Preserve the old comparison if criteria change.

## Revision triggers and unknowns

Revisit the profile when independent judges disagree materially, valid alternatives fail, mandatory failures pass, historical criteria become stale, or documentation costs exceed their benefit. Use failures to change the next version, not to rewrite a completed run's success rule.

Open: measurement reliability across skill families, worthwhile cost thresholds, and longer-term reuse. Current support is design reasoning from SkillForge Axioms and Foundations (external research note), SkillForge Proposed Structure (external research note), and the pilot protocols.

Next: [Improvement records and templates](../../Improvements/Index.md).
