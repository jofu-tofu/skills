# Synthesize Workflow

> Internal workflow — invoked by Think.md, not user-facing.

## Input / Output

**Input:**
- All 5 perspective files: `perspective-1.md` through `perspective-5.md` (each contains reframing + decomposition + solution)
- Original problem: `$THINK_DIR/prompt.txt`

**Output:**
- Writes `$THINK_DIR/synthesis.md` — the final integrated analysis
- Returns the synthesis content AND the absolute path to `synthesis.md`

## Background

Five independent reasoning chains — each operating in a different lens, each decomposing and solving the problem independently — have produced five complete perspective files. Produce something none of them could alone: a synthesis that cross-pollinates insights, surfaces contradictions, and delivers an integrated answer.

Synthesis is not summary. A summary compresses each perspective into a bullet point. Synthesis finds patterns that span multiple perspectives, contradictions that reveal hidden complexity, and combined insights that produce a stronger answer than any single lens.

## Instructions

### Step 1: Read Everything

Read all 5 perspective files end-to-end and re-read `prompt.txt`. For each perspective, note the core reframing, the key insight from decomposition, and the approaches with trade-offs.

### Step 2: Find Convergences and Contradictions

**Convergences:** Where do multiple perspectives independently reach the same conclusion through different reasoning? This is the highest-confidence signal the pipeline produces.

**Contradictions:** Where do perspectives disagree? These reveal genuine tensions a single-perspective analysis would miss. Note whether the disagreement is about facts, values, or framing.

### Step 3: Cross-Pollinate

Find 1-2 insights where one perspective strengthens or transforms an approach from another. The best synthesis creates combinations no single agent could have conceived.

### Step 4: Produce Integrated Answer

Weave the above into a direct answer to the user's original question.

## Output Format

Write to `$THINK_DIR/synthesis.md`. **Target length: 80-120 lines.** Density over exhaustiveness.

```markdown
# Critical Thinking Synthesis

**Original problem:** [1-2 sentence restatement]

## Perspectives Summary

| # | Lens | Core Insight |
|---|------|-------------|
| 1 | [Name] | [1-line] |
| 2 | [Name] | [1-line] |
| 3 | [Name] | [1-line] |
| 4 | [Name] | [1-line] |
| 5 | [Name] | [1-line] |

## Convergences

[Where 2+ perspectives independently agree. 1-2 paragraphs. These are the highest-confidence findings.]

## Contradictions

[Where perspectives genuinely disagree. 1-2 paragraphs. Present the tension — don't resolve artificially.]

## Cross-Pollinated Insights

[1-2 novel combinations. Brief — just the insight and why it matters.]

## Integrated Answer

[3-5 paragraphs. The main deliverable — a direct, actionable answer to the user's problem. Lead with the strongest conclusion, reference convergences and tensions, write in plain language.]

## Action Items

1. **[Action]** — [Why, from which perspective(s)]
2. **[Action]** — [Why]
3. **[Action]** — [Why]

## Limitations

[2-3 sentences. What this analysis cannot tell you. What requires empirical testing or domain expertise.]
```

## Constraints

1. **Produce synthesis, not summary.** Concatenating each perspective's approaches is failure — the value lives in cross-connections, convergent trade-offs, and insights that emerge from comparing across lenses.
2. **Highlight convergences prominently.** Independent agreement through different reasoning is the strongest signal this pipeline produces.
3. **Present contradictions honestly.** They reveal complexity the user needs to navigate. Do not resolve them artificially — present the tension.
4. **Answer the question.** The user asked something specific. The five perspectives are the reasoning; the synthesis is the answer. Translate to action.
5. **Credit perspectives.** When citing an insight, note which perspective it came from so the user can drill into that perspective file for depth.

## Follow-Up

Return the synthesis content AND the path to `synthesis.md`. The orchestrator outputs the synthesis to the user.
