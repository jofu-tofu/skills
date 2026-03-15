# RecordDecision Workflow

**Purpose**: Capture a single decision as a lightweight Architecture Decision Record (ADR). For quick decisions that don't need a full design document.

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

Ask the user (use AskUserQuestion or conversational clarification):

1. **What was decided?** The decision itself in one sentence.
2. **What forces led to this?** The context — technical constraints, business needs, team dynamics, timeline pressure. Capture neutral facts, not justifications.
3. **What alternatives were considered?** At minimum two — including "do nothing" if applicable.
4. **Why not those alternatives?** Brief reason for each rejection.

### Step 2: Articulate Consequences

For every decision, there are trade-offs. Capture them honestly:

- **Positive**: What we gain from this decision
- **Negative**: What we lose or accept as a cost
- **Neutral**: Side effects that aren't clearly good or bad

If the user can't articulate any negative consequences, push back gently — every non-trivial decision has costs. The goal is honest trade-off capture, not post-hoc justification.

### Step 3: Produce the ADR

**Output using this format:**

```markdown
# Decision: [Short Noun Phrase]

**Date**: [date]  |  **Status**: Proposed / Accepted / Deprecated / Superseded by [link]

## Context
[Neutral facts. The forces at play — technological, political, social, project-local. Describe the situation that led to needing this decision. Do not justify — describe.]

## Decision
We will [decision in active voice].

## Alternatives Considered
| Alternative | Why Not |
|-------------|---------|
| [Option A] | [Brief reason] |
| [Option B] | [Brief reason] |

## Consequences
- **Positive**: [What we gain]
- **Negative**: [What we lose or accept]
- **Neutral**: [Side effects that aren't clearly good or bad]
```

### Step 4: Validate Output Quality

Auto-chain the `ValidateOutput` workflow:
- `artifact`: the completed ADR
- `scale`: `quick`

Fix any FAIL results before delivery.

---

## ADR Lifecycle

ADRs are immutable records — they capture what was decided and why at a point in time. They are not edited retroactively.

| Status | Meaning |
|--------|---------|
| **Proposed** | Decision is drafted but not yet accepted |
| **Accepted** | Decision is in effect |
| **Deprecated** | Decision is no longer relevant (context changed) |
| **Superseded by [link]** | A new decision replaces this one — link to it |

When a decision changes, create a NEW ADR that supersedes the old one. Don't edit the original — it's part of the historical record.

---

## Integration Notes

- **From CreateDesign**: Quick-scale assessments are redirected here
- **From CreateDesign (Full)**: Individual decisions within a large design may each get their own ADR
- **From ReviewDesign**: Decisions surfaced during review can be captured here
- **Format based on**: Michael Nygard's Architecture Decision Records (Cognitect)
