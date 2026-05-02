# RecordDecision Workflow

**Purpose**: Capture a single decision as a focused Architecture Decision Record (ADR). The ADR should explain the problem, users, audience, criteria, change, and decision history without turning into a full design document.

**When to Use**:
- "Record this decision", "ADR", "why did we decide", "decision record"
- Quick-scale design needs (redirected from CreateDesign)
- Capturing individual decisions within a larger design
- Documenting a decision that was made verbally or in a meeting

## Reference Material

- **Output Quality:** `../OutputQuality.md` — Format selection, density, anti-AI patterns. **Read before producing output.**

---

## Process

### Step 1: Capture Context

Ask the user for missing context (use AskUserQuestion or conversational clarification). Do not invent criteria, assumptions, or factual context from the broad topic.

Each blocking question must use this format:

```markdown
**Question:** [Specific missing fact]
**Why this matters:** [How the answer changes the ADR, criteria, scope, or revisit trigger]
```

1. **What problem are we solving?** The problem statement, not just the chosen solution.
2. **Who has this problem?** The target users or affected systems, backed by evidence when available.
3. **Who is the audience for this ADR?** The people who need to review, approve, implement, or understand the decision later.
4. **What factual evidence do we have?** Repo/source facts, metrics, user feedback, incidents, support tickets, meeting notes, or internal precedent. Use evidence next to the claim it supports.
5. **What criteria define a good decision?** Derive criteria from the problem, users, audience, constraints, and first principles. Rank them or mark Must/Should/Could.
6. **What is changing?** The proposed change and the important non-change. Show the delta from current state.
7. **What decisions came from meetings or review?** Capture entries that changed criteria, scope, implementation direction, or which alternatives should be reconsidered later.
8. **What rejected option would otherwise resurface?** Include only alternatives that are likely to be debated again or explain an important trade-off.

If the user cannot answer a question, record it as an explicit assumption or open question. Do not write it as a fact. If the missing answer controls criteria or scope, ask before producing the ADR.

### Step 2: Prune to the Decision

Keep only sections that help readers understand or revisit the decision. The ADR is not a full design doc.

Include:
- The problem statement
- Users and audience
- Decision criteria
- The change
- Decision log

Use evidence inside the relevant section: problem evidence in the problem statement, user evidence in users and audience, criteria evidence in decision criteria, and meeting evidence in the decision log. Keep gaps local to the section they affect as `Unknown`, `Assumption`, or `Open question`; do not create a standalone evidence section unless the ADR is evidence-heavy enough that inline grounding would be harder to read.

Include optional rejected alternatives only when omitting them would cause the same debate to return. Fold consequences into the criteria, change summary, or decision log instead of making a standalone section.

### Step 3: Produce the ADR

**Output using this format:**

```markdown
# Decision: [Short Noun Phrase]

**Date**: [date]  |  **Status**: Proposed / Accepted / Deprecated / Superseded by [link]  |  **Owner**: [name/role]

## Problem Statement
[Who] needs [what] because [why]. Keep this to 1-3 sentences and include the key evidence or assumption inline.

## Users and Audience
| Group | Role in Decision | What Matters | Grounding |
|-------|------------------|--------------|-----------|
| [Target user / affected system] | Has the problem | [Need, constraint, or risk] | [Evidence, assumption, or unknown] |
| [Reviewer / implementer / future reader] | Reviews, approves, implements, or maintains | [Concern or evidence needed] | [Known / assumed / ask] |

## Decision Criteria
| Criterion | Why It Matters | Priority | Grounding |
|-----------|----------------|----------|-----------|
| [Criterion derived from problem/users/audience] | [First-principles rationale] | Must / Should / Could or rank | [Evidence, assumption, or open question] |

## Change
- **We will**: [Concrete change]
- **We will not**: [Important non-change or out-of-scope item]
- **Why this fits**: [Tie the change to the top criteria]

## Decision Log
| When / Source | Decision / Concern | Why | Revisit If | Reopens |
|---------------|--------------------|-----|------------|---------|
| [date + meeting, async thread, user test, incident, metric review, or source] | [Decision, objection, or scope change] | [Human-readable rationale and trade-off] | [Condition that would make this wrong] | [Alternatives or prior decisions to reconsider] |

## Rejected Alternatives (Only If Likely to Resurface)
| Alternative | Why Rejected |
|-------------|--------------|
| [Only include options likely to resurface] | [Tie to criteria or evidence] |
```

Omit `Rejected Alternatives` when no rejected option would clarify the decision or prevent repeat debate.

### Step 4: Validate Output Quality

Auto-chain the `ValidateOutput` workflow:
- `artifact`: the completed ADR
- `scale`: `quick`

Fix any FAIL results before delivery.

---

## ADR Lifecycle

ADRs are decision artifacts with a lifecycle: draft before review, stress-test in review, finalize after the decision. They should not grow organically during meetings; live review should resolve blocking problem, user, audience, criteria, or change disagreements.

After acceptance, ADRs are immutable records — they capture what was decided and why at a point in time. They are not edited retroactively.

| Status | Meaning |
|--------|---------|
| **Proposed** | Decision is drafted but not yet accepted |
| **Accepted** | Decision is in effect |
| **Deprecated** | Decision is no longer relevant (context changed) |
| **Superseded by [link]** | A new decision replaces this one — link to it |

When a decision changes, create a NEW ADR that supersedes the old one. Don't edit the original — it's part of the historical record.

If new information appears before acceptance, revise the Proposed ADR. If new information appears after acceptance, create a follow-up ADR or superseding ADR rather than bloating the original.

---

## Integration Notes

- **From CreateDesign**: Quick-scale assessments are redirected here
- **From CreateDesign (Full)**: Individual decisions within a large design may each get their own ADR
- **From ReviewDesign**: Decisions surfaced during review can be captured here
- **Format based on**: Michael Nygard's Architecture Decision Records (Cognitect)
