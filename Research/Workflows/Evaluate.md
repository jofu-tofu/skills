# Evaluate Workflow

> **Trigger:** Internal — called by Orchestrate.md Step 3. Not user-facing.

## Purpose

Triage all collected papers by evidence quality and map the evidence
landscape. This agent is a skeptic — its job is to judge, not summarize.

## What You Receive

All files from `$RESEARCH_DIR/`:
- `question.md` — the research question
- `seed-papers.md` — Wave 1 results (deduplicated)
- `expansion-backward.md` — backward citation results
- `expansion-forward.md` — forward citation results
- `expansion-crossdomain.md` — cross-domain results
- `expansion-adversarial.md` — adversarial/contradiction results

## Workflow Steps

### Step 1: Evidence Triage

Sort all papers into tiers:

| Tier | Criteria | Weight |
|------|----------|--------|
| **T1** | Systematic reviews, meta-analyses | Highest |
| **T2** | Large-scale empirical, industry deployment | High |
| **T3** | Standard peer-reviewed empirical | Medium |
| **T4** | Preliminary, grey literature, preprints | Low |
| **T5** | Theoretical, opinion, foundational frameworks | Context only |

For each paper: assign tier + one-sentence justification.

### Step 2: Map Convergences, Tensions, Gaps

**Convergences** — claims supported by 3+ independent sources.
Assign confidence: High / Medium / Low.

**Tensions** — where sources disagree. For each:
- What does each side claim?
- What might explain the disagreement?
- What would resolve it?

**Gaps** — what has NOT been studied. Look for:
- Questions the literature doesn't address
- Populations or contexts not covered
- Methods not yet applied

### Step 3: Assess Systematic Risks

1. **Publication bias:** Are findings suspiciously positive? Did Agent G
   find contradictions?
2. **Replication status:** Have key findings been independently replicated?
3. **Methodological diversity:** Do all studies use the same method?
4. **Recency:** Are key findings from recent work or decades old?
5. **Conflict of interest:** Industry-funded studies with aligned incentives?
6. **Unverified papers:** How many papers are marked `[FROM TRAINING — verify]`?

## Output Format

Write to `$RESEARCH_DIR/evaluation.md`:

```markdown
# Evidence Evaluation

## Triage Summary
- Total papers: [N]
- T1 (systematic reviews): [N]
- T2 (high-quality empirical): [N]
- T3 (standard empirical): [N]
- T4 (preliminary): [N]
- T5 (theoretical): [N]
- Unverified (FROM TRAINING): [N]
- Overall evidence quality: [Strong / Moderate / Weak / Very Weak]

## Paper Triage

### Tier 1
| Paper | Justification |
|-------|---------------|
| [Author Year] | [why T1] |

[repeat for each tier]

## Key Findings (with confidence)

### Finding 1: [claim]
- **Confidence:** [High / Medium / Low]
- **Supporting:** [papers with tier]
- **Contradicting:** [papers, if any]
- **Caveats:** [limitations]

[continue for all major findings]

## Convergences
- [claim]: supported by [papers]. Confidence: [level].

## Tensions
- [tension]: Side A ([papers]) vs Side B ([papers]).
  Possible explanation: [hypothesis].

## Gaps
- [gap]: [what's missing and why it matters]

## Systematic Risk Assessment
- Publication bias: [assessment]
- Replication: [assessment]
- Methodological diversity: [assessment]
- Conflict of interest: [assessment]
- Unverified sources: [N papers need web verification]
```
