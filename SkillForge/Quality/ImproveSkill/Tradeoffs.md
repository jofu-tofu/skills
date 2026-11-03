---
status: proposed
trust: T3
version: 0.1
updated: 2026-11-03
human_confirmed: false
---
# Tradeoffs — improve a skill

Scope and criterion IDs: [Outcomes](Outcomes.md). Priorities below are proposed operating choices, derived from the user's discussion and SkillForge Proposed Structure (external research note). They are not empirically optimal weights.

| Choice | Proposed handling | When to adapt |
|---|---|---|
| Better target behavior versus regressions | Protect mandatory behavior before accepting aggregate gains (SF-Q04). | The requirement's owner explicitly changes it; evaluate under a separately versioned specification. |
| Reuse versus fresh reasoning | Reuse supported criteria after checking current context (SF-Q05). | Audience, constraints, authority, or evidence changes. |
| Measurement rigor versus cost | Use the least expensive evidence adequate for the claim; report gaps (SF-Q03,09). | Broader claims or costly errors warrant stronger checks. |
| Generality versus specificity | Keep a shared sequence, but adapt criteria and feedback to the workflow (SF-Q01,02). | Shared criteria become vague or reject valid task-specific outcomes. |
| Improving something versus retaining baseline | Treat a justified no-change decision as useful (SF-Q08). | New evidence identifies a worthwhile, testable change. |
| Traceability versus reading burden | Keep current decisions easy to find and load old attempts selectively (SF-Q06,09). | Retrieval failures, duplicated records, or stale criteria appear. |
| Separate dimensions versus one score | Report protected behavior, benefits, uncertainty, and cost separately. | Combine only when the task owner has justified the exchange rates and decision rule. |

## Authority and disagreements

The user owns the replacement's purpose and acceptable tradeoffs. A target skill's explicit stakeholder requirements govern that target. An agent may propose criteria and routine implementation choices; an inferred preference cannot silently override an explicit requirement.

When preferences conflict, record who prefers what and the practical consequence. When evidence is uncertain, seek a discriminating observation or mark the decision unresolved. These are different problems.

## Open decisions

No universal improvement threshold, cost ceiling, criterion weighting, or required file count is adopted. Set an attempt's budget and practical benefit rule before observing its results. Revisit these defaults when pilot evidence shows avoidable cost, blind reuse, or missed regressions.

Next: [Challenge cases](ChallengeCases.md).
