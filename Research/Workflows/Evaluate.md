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

| Tier | Criteria |
|------|----------|
| **T1** | Systematic reviews, meta-analyses |
| **T2** | Large-scale empirical, industry deployment |
| **T3** | Standard peer-reviewed empirical |
| **T4** | Preliminary, grey literature, preprints |
| **T5** | Theoretical, opinion, foundational frameworks |

Group papers by tier — no per-paper justification needed unless a tier assignment is non-obvious.

### Step 2: Map Convergences, Tensions, Gaps

**Convergences** — claims supported by 3+ independent sources. One sentence each with confidence level.

**Tensions** — where sources disagree. State the disagreement and what might explain it.

**Gaps** — what has NOT been studied. 2-3 bullet points.

### Step 3: Assess Systematic Risks

Flag any of these that apply (skip those that don't):
1. Publication bias — suspiciously positive results?
2. Replication concerns — key findings independently replicated?
3. Methodological monoculture — all studies use same method?
4. Unverified papers — how many marked `[FROM TRAINING — verify]`?

## Output Format

Write to `$RESEARCH_DIR/evaluation.md`:

```markdown
# Evidence Evaluation

## Triage Summary
- Total papers: [N]
- T1: [N] | T2: [N] | T3: [N] | T4: [N] | T5: [N]
- Unverified (FROM TRAINING): [N]
- Overall evidence quality: [Strong / Moderate / Weak / Very Weak]

## Paper Triage

### Tier 1
- [Author Year], [Author Year], ...

### Tier 2
- [Author Year], [Author Year], ...

[continue for each non-empty tier]

## Key Findings

| Finding | Confidence | Supporting | Contradicting |
|---------|-----------|------------|---------------|
| [claim] | [H/M/L] | [papers] | [papers] |

## Convergences
- [claim]: supported by [papers]. Confidence: [level].

## Tensions
- [tension]: [Side A papers] vs [Side B papers]. Possible explanation: [1 sentence].

## Gaps
- [gap]: [what's missing]

## Systematic Risks
[Only flag risks that actually apply — omit clean categories.]
```
