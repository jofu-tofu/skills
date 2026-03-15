# DeepExpand Workflow

> **Trigger:** Internal — called by Orchestrate.md Step 2. Not user-facing.

## Purpose

Wave 2 agent instructions. Four variants (D/E/F/G) expand the paper set
using strategies that find what Wave 1 missed.

## Your Role

You receive seed papers from `seed-papers.md`. Find ADDITIONAL papers that
the initial search missed using your assigned strategy. Write results to
your assigned output file.

## Strategies

### Agent D — Backward Citation Chaining

For the top 5-7 seed papers, find what they cite:
- References appearing in 2+ seeds' bibliographies (foundational work)
- Older papers establishing key concepts
- Search: `"[seed paper title]" references`, or visit paper pages

### Agent E — Forward Citation Chaining

For the top 5-7 seed papers, find who cited them:
- Recent papers (last 3-5 years) citing 2+ seeds
- Papers from different fields citing your seeds (cross-domain bridges)
- Search: Google Scholar "Cited by" feature

### Agent F — Cross-Domain Reframing

Translate the research question into 2-3 adjacent field vocabularies:
- Use adjacent fields from `question.md` AND discover your own
- For each field: restate the question in that field's terms, then search
- Quality test: a practitioner in that field would recognize the problem as
  their own — surface metaphors don't count
- Autonomy: if you identify adjacent fields not listed in `question.md`,
  search those too

### Agent G — Adversarial / Contradiction Search

Actively seek evidence that contradicts the emerging picture from Wave 1:
- Failed replications: `"failed to replicate" [topic]`
- Null results: `"no significant effect" [topic]`
- Methodological critiques: `"critique" [key paper/author]`
- Boundary conditions: `"moderating factors" [topic]`
- Publication bias analyses: `"funnel plot" [topic]`
- Preprints on arXiv, SSRN, OSF for unpublished findings

**Fallback:** If web search fails, use training knowledge with
`[FROM TRAINING — verify]` markers.

## Output Format

Write to your assigned file:

```markdown
# Deep Expansion — Agent [D/E/F/G] ([strategy])

## Papers Found

### 1. [Author (Year)] "Title"
- **Type:** [empirical / review / replication / critique]
- **Found Via:** [which seed or reframing led here]
- **Key Finding:** [1-2 sentences]
- **Unique Contribution:** [why Wave 1 missed this]
- **Source:** [URL or FROM TRAINING — verify]

[continue for all papers]

## Strategy Report
- Seed papers used: [list]
- Queries used: [list]
- Unique finds (not in seeds): [count]
- Cross-domain bridges: [Agent F only]
- Contradictions found: [Agent G only]
```

## Quality Criteria

- Your primary value is finding papers Wave 1 MISSED — returning the same
  papers adds nothing
- For Agents D/E: 2-hop chains are fine, but note the path
- For Agent F: surface metaphors are not cross-domain finds
- For Agent G: finding zero contradictions is itself a finding worth noting
