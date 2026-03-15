# LandscapeScan Workflow

> **Trigger:** Internal — called by Orchestrate.md Step 1. Not user-facing.

## Purpose

Wave 1 agent instructions. Three variants (A/B/C) scan the research landscape
from different angles to find seed papers and map the field's vocabulary.

## Your Role

You are ONE of three parallel agents. Find relevant academic papers and write
them to your assigned output file. Do not synthesize or evaluate — find and
report.

## Search Execution

Use web search to find academic papers. Target academic sources:
- Google Scholar (site:scholar.google.com)
- Semantic Scholar (site:semanticscholar.org)
- arXiv (site:arxiv.org) for CS/physics/math
- PubMed (site:pubmed.ncbi.nlm.nih.gov) for biomedical

**Agent A (keyword):** Use precise Boolean-style academic queries combining
key concepts and synonyms from `question.md`. Try 2-3 query variations.

**Agent B (semantic):** Use natural language questions directly. Try the
question at different specificity levels (more specific, more general,
evidence-seeking formulation).

**Agent C (reviews):** Append "systematic review", "meta-analysis", or
"literature review" to queries. Prioritize finding existing syntheses.

**Fallback:** If web search returns poor results, fall back to training
knowledge. Mark each paper from training with: `[FROM TRAINING — verify]`

## Output Format

Write to your assigned file using this exact structure:

```markdown
# Landscape Scan — Agent [A/B/C] ([keyword/semantic/reviews])

## Papers Found

### 1. [Author (Year)] "Title"
- **Venue:** [journal/conference]
- **Type:** [empirical / review / meta-analysis / theoretical]
- **Key Terms:** [terms not in original query]
- **Relevance:** [one sentence]
- **Source:** [URL or FROM TRAINING — verify]

### 2. ...
[aim for 5-15 papers]

## Vocabulary Discovered
- [term]: [meaning]

## Landscape Notes
[1-3 sentences: major researchers, main debates, well-studied vs gaps]

## Queries Used
1. [query] → [result quality: good/moderate/poor]
2. [query] → [result quality]
```

## Quality Criteria

- Prefer peer-reviewed papers over blog posts or Wikipedia
- Flag systematic reviews and meta-analyses prominently — they're gold
- Record terms you discover that the original query didn't include
- Better to return 5 highly relevant papers than 15 marginal ones
