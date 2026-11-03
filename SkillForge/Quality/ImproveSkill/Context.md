---
status: proposed
trust: T3
version: 0.1
updated: 2026-11-03
human_confirmed: false
---
# Context — improve a skill

## Intended use

This profile describes the proposed replacement SkillForge's bounded skill-improvement workflow. Its user is a skill owner; its operator is an agent helping that owner. The outcome is an evidence-supported decision about a candidate change, with reusable reasoning for the next run.

Quality definition is the first part of this workflow. These documents describe quality for SkillForge itself; each target skill needs its own contextual criteria. They are populated design drafts, not evidence that the method works.

## Boundaries and inputs

- Evaluate one named target workflow and a declared set of tasks. Record shared instructions and dependent workflows that a change could affect.
- Start with the target's intent, current instructions, current task requirements, available failure evidence, previous applicable criteria, and a finite budget.
- Identify the user or other authority behind requirements. Separate explicit requirements from inferred preferences and untested assumptions.
- Record missing inputs. When evidence cannot distinguish candidates, an unresolved decision is a valid outcome.
- Preserve a baseline and exact criteria versions before comparing revisions.

Outputs: a scoped quality profile, a bounded improvement plan, preserved observations, and a retain/reject/revise/defer decision. Completion means the declared decision is supported at its stated scope, or the evidence gap and next useful check are explicit.

## Three different claims

| Claim | Unit being judged | Evidence needed |
|---|---|---|
| Quality reasoning is usable | A quality specification applied to a task | Whether another evaluator can distinguish relevant successes, failures, and unknowns. |
| A skill revision improves outcomes | Baseline and candidate on declared cases | Comparable executions, protected behavior checks, and uncertainty. |
| SkillForge is a better improvement method | Improvement runs across target workflows | Matched alternative method, multiple cases, costs, and fresh assessment. |

Success at one level does not establish the next. Self-review, complete documents, or a higher proxy score alone cannot establish method effectiveness.

## Adaptation and exclusions

For checkable tasks, use direct checks where they represent the requirement. For semantic tasks, specify reference judgments and their limits. For preferences, record whose preference governs and when clarification is needed. For mixed tasks, retain separate dimensions rather than silently averaging conflicts.

This profile excludes installation, publishing, unlimited autonomous iteration, and claims about all skills. It does not require a particular number of agents or files to produce a good outcome.

## Sources and revision triggers

Sources: SkillForge Axioms and Foundations (external research note) (D01–D03), SkillForge Proposed Structure (external research note), and Task 1 - Validity of Q (external research note). These establish intent and proposed design, not validated effectiveness.

Revisit when the target audience, task, requirements, authority, execution environment, evidence access, or budget changes. Open: how much context can transfer between workflows without introducing irrelevant criteria?

Next: [Outcomes](Outcomes.md).
