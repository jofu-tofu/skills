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
[3-5 sentences: What does the evidence say? How confident? Biggest caveat?]

## Evidence Quality
- Papers reviewed: [N] | Systematic reviews: [N] | Unverified: [N]
- Overall quality: [Strong / Moderate / Weak / Very Weak]

## Key Findings

### 1. [Claim]
- **Confidence:** [High / Medium / Low]
- **Evidence:** [key papers]
- **Caveats:** [limitations]

[continue for major findings]

## Convergences
[Where 3+ sources agree — highest confidence claims]

## Tensions
[Where the evidence disagrees. Do not smooth over disagreements.]

## What This Evidence Cannot Tell You
[Genuine limitations — what's missing, what would you need for more confidence. Mandatory and substantive.]

## Next Steps
- **Read in full:** [top 3-5 papers with brief why]
- **Open questions:** [what remains unknown]

## Pipeline Metadata
- Wave 1: [N papers] | Wave 2: [N additional]
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
