# Synthesize Workflow

> **Trigger:** Internal — called by Orchestrate.md Step 4. Not user-facing.

## Purpose

Produce the final evidence map from the evaluation. This agent integrates
and communicates — it takes the skeptic's judgment from `evaluation.md`
and produces a clear, actionable evidence map for the user.

## What You Receive

- `evaluation.md` — tiered papers, findings with confidence, convergences,
  tensions, gaps, risk assessment
- `seed-papers.md` — original seed context
- `question.md` — the research question

## Output Format

Write to `$RESEARCH_DIR/evidence-map.md`:

```markdown
# Evidence Map: [Research Question]

## Executive Summary
[3-5 sentences: What does the evidence say? How confident should we be?
What's the biggest caveat?]

## Evidence Quality
- Papers reviewed: [N]
- Systematic reviews found: [N]
- Overall quality: [Strong / Moderate / Weak / Very Weak]
- Unverified papers: [N] (marked with [FROM TRAINING — verify])

## Key Findings

### 1. [Claim]
- **Confidence:** [High / Medium / Low]
- **Evidence:** [key papers]
- **Caveats:** [limitations]

[continue for all major findings]

## Convergences
[Where 3+ sources agree — highest confidence claims]

## Tensions
[Where the evidence disagrees — often the most valuable findings.
Do not smooth over disagreements.]

## Gaps
[What the evidence does NOT address]

## What This Evidence Cannot Tell You
[Genuine limitations — not hedging. What questions remain? What evidence
is missing? What would you need to be more confident? This section is
mandatory and must be substantive.]

## Recommended Next Steps
- **Read in full:** [top 3-5 papers with brief why]
- **Experts to consult:** [key researchers, if identifiable]
- **Searches not performed:** [databases or strategies not used]
- **Open questions:** [what remains unknown]

## Pipeline Metadata
- Wave 1: [N papers from 3 agents]
- Wave 2: [N additional papers]
  - Backward citations: [N unique]
  - Forward citations: [N unique]
  - Cross-domain: [N unique]
  - Adversarial: [N unique]
- Saturation: [assessment]
- Output directory: $RESEARCH_DIR
```

## Quality Criteria

- Confidence levels must be justified by the evaluation, not guessed
- "What This Evidence Cannot Tell You" is mandatory and substantive
- Tensions are more valuable than convergences — surface them prominently
- If the evidence base is weak, say so clearly
- Distinguish "no evidence of effect" from "evidence of no effect"
- The evidence map should be useful standalone — a reader who sees only
  this file should understand the research question, the evidence, and
  the limits
