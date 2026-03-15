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

Read all 5 perspective files end-to-end and re-read `prompt.txt`. For each perspective, note:
- The core reframing (how this lens sees the problem)
- The key insight from decomposition (what was non-obvious)
- The approaches proposed and their trade-offs (gains, costs, best-when, worst-when)
- What the lens reveals about the solution space

### Step 2: Identify Convergences

Where do multiple perspectives independently arrive at the same conclusion through different reasoning paths? Convergence from independent chains is high-confidence signal — if two analyses both identify the same structural bottleneck through completely different logic, that bottleneck is almost certainly real.

### Step 3: Identify Contradictions

Where do perspectives disagree? Contradictions are the most valuable output — they reveal genuine tensions that a single-perspective analysis would miss. For each contradiction:
- What exactly do the perspectives disagree on?
- Is the disagreement about facts, values, or framing?
- Can it be resolved, or is it a genuine trade-off the user must navigate?

### Step 4: Cross-Pollinate

Find insights from one perspective that strengthen or transform approaches from another:
- Does one decomposition reveal a component that another approach could exploit?
- Does one formalization make a vague insight from another perspective precise?
- Does one incentive analysis explain why another perspective's analog evolved one way and not another?

The best synthesis creates combinations no single agent could have conceived.

### Step 5: Integrate Trade-Offs

Each perspective file contains 2-3 approaches with explicit trade-offs. Compare these trade-offs across all five lenses:

- **Convergent trade-offs:** Multiple lenses independently identify the same cost or gain from different reasoning paths. These are high-confidence — if a biological, economic, and structural lens all flag the same cost, it's real.
- **Contradictory trade-offs:** One lens sees something as a gain, another sees it as a cost. These reveal hidden complexity in the decision space.
- **Complementary trade-offs:** One lens's approach mitigates another lens's identified cost. These suggest combined strategies.

Produce a unified trade-off landscape the user can navigate — not a list of every trade-off from every lens, but the integrated picture of what the key decisions are and what each direction costs.

### Step 6: Produce Integrated Answer

Weave the above into a coherent response that answers the user's original question with the full depth of five reasoning chains behind it.

## Output Format

Write to `$THINK_DIR/synthesis.md`:

```markdown
# Critical Thinking Synthesis

**Original problem:** [1-2 sentence restatement of the user's prompt]

## Perspectives Analyzed

| # | Lens | Core Insight | Solution Approach |
|---|------|-------------|-------------------|
| 1 | [Name] | [1-line key insight] | [1-line approach] |
| 2 | [Name] | [1-line key insight] | [1-line approach] |
| 3 | [Name] | [1-line key insight] | [1-line approach] |
| 4 | [Name] | [1-line key insight] | [1-line approach] |
| 5 | [Name] | [1-line key insight] | [1-line approach] |

## Convergences (High-Confidence Findings)

### [Convergence 1 title]
**Perspectives:** [which ones]
[Description of the shared finding and why independent arrival at it matters]

### [Convergence 2 title]
[Continue as needed]

## Contradictions (Genuine Tensions)

### [Contradiction 1 title]
**Between:** [Perspective X] vs [Perspective Y]
**Nature:** [Factual / Values / Framing]
[Description and implications]

## Cross-Pollinated Insights

### [Insight 1 title]
**Combines:** [Perspective X] + [Perspective Y]
[The novel insight and why it matters]

## Trade-Off Landscape

[The integrated trade-off picture across all five lenses. Not a dump of every trade-off — the synthesized map of key decisions the user faces.]

### [Key decision/trade-off 1]
**Convergence:** [Which lenses independently flag this, and from what angle]
**What you gain:** [Integrated view of the upside]
**What it costs:** [Integrated view of the downside]
**Tension:** [If lenses disagree on whether this is a gain or cost, describe the tension]

### [Key decision/trade-off 2]
[Same structure — continue for each major trade-off the user must navigate]

## Integrated Answer

[3-6 paragraphs. The main deliverable — a direct, concrete answer to the user's original problem drawing from all five reasoning chains:
- Lead with the strongest, most actionable conclusion
- Incorporate convergences as high-confidence foundations
- Reference the trade-off landscape — frame key decisions clearly
- Acknowledge contradictions as tensions the user must navigate
- Include cross-pollinated insights where they strengthen the answer
- Write in plain language, not jargon
- Be specific enough to act on]

## Action Items

[Concrete next steps, ordered by priority. Each self-contained and actionable.]

1. **[Action]** — [Why, drawing from which perspective(s)]
2. **[Action]** — [Why]
3. **[Action]** — [Why]

## What This Analysis Cannot Tell You

[Honest limitations. What questions remain unanswered? What requires additional information, domain expertise, or empirical testing? This section prevents over-confidence.]
```

## Constraints

1. **Produce synthesis, not summary.** Concatenating each perspective's approaches is failure — the value lives in cross-connections, convergent trade-offs, and insights that emerge from comparing across lenses.
2. **Highlight convergences prominently.** Independent agreement through different reasoning is the strongest signal this pipeline produces.
3. **Present contradictions honestly.** They reveal complexity the user needs to navigate. Do not resolve them artificially — present the tension.
4. **Answer the question.** The user asked something specific. The five perspectives are the reasoning; the synthesis is the answer. Translate to action.
5. **Credit perspectives.** When citing an insight, note which perspective it came from so the user can drill into that perspective file for depth.

## Follow-Up

Return the synthesis content AND the path to `synthesis.md`. The orchestrator outputs the synthesis to the user.
