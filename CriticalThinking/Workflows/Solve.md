# Solve Workflow

> Internal workflow — invoked by Think.md, not user-facing.
> You are ONE of five parallel agents. You see ONE perspective file only.

## Input / Output

**Input:**
- One perspective file: `$THINK_DIR/perspective-N.md` (reframed problem + first-principles decomposition from one lens)
- Original problem: `$THINK_DIR/prompt.txt`

**Output:**
- Appends a `## Approaches` section to the same perspective file
- Returns the absolute path to the updated file

## Background

The perspective file contains a reframed problem AND a first-principles decomposition identifying irreducible components, relationships, and leverage points. Using the decomposition as a map, explore the solution space within this lens and generate 2-3 genuinely distinct approaches with honest trade-offs.

Do not pick a winner. The synthesis agent has context from all five lenses and is in a far better position to evaluate and recommend. Your job is to map the key approaches within your lens — not exhaustively, but enough for the synthesis agent to compare across lenses.

## Instructions

### Step 1: Absorb Your Perspective File

Read end-to-end. You have three layers of context:
1. The lens's reframing (how this lens sees the problem)
2. The first-principles decomposition (irreducible structure)
3. The leverage points (where intervention is most efficient)

Re-read `prompt.txt` — the user needs insight into their real problem, not an academic exercise.

### Step 2: Explore the Solution Space

Using the decomposition's leverage points as starting positions, brainstorm approaches that address the problem within this lens. Cast a wide net first, then narrow to the 2-3 most distinct and substantive options.

If two approaches are variants of the same idea, merge them or replace one. Prioritize distinctness over count.

### Step 3: Articulate Trade-Offs

For each approach, state what you gain and what you give up. One sentence each — trade-offs are the most valuable output for the synthesis agent.

### Step 4: Translate to the User's Domain

Each approach must be understandable outside this lens's jargon. Express the core idea first in the lens's native terms (for precision), then translate it to the user's original framing (for actionability).

## Output Format

Append to the perspective file. **Target length: 40-60 lines.** Match the Decompose step's density — concise, not exhaustive.

```markdown
---

## Approaches

### Approach 1: [Name]

**Targets leverage point(s):** [Which leverage points from the decomposition]

**Description:** [1-2 paragraphs. What this approach is and how it works, in this lens's terms then translated to the user's domain.]

**Trade-offs:** [Gains] vs [Costs]. Best when [condition]. Worst when [condition].

### Approach 2: [Name]

[Same structure]

### Approach 3: [Name] *(if warranted — omit if only 2 genuinely distinct approaches exist)*

[Same structure]

### What This Lens Reveals

[1-2 sentences. The non-obvious insight about the trade-off landscape itself.]
```

## Constraints

1. **Do NOT read other perspective files.** Only read `perspective-N.md` (your assigned file) and `prompt.txt`. Reading other perspective files contaminates your reasoning — exposure to another lens's framing or approaches causes unconscious convergence, destroying your independent analysis. The pipeline's value depends on five genuinely independent chains.
2. **Explore within your lens's framework.** Cross-pollination is the synthesizer's responsibility.
3. **Generate options, not recommendations.** Present 2-3 distinct approaches with trade-offs. Do not rank them or pick a winner — that's the synthesis agent's job with full cross-lens context.
4. **Ground every approach in the decomposition.** Each approach targets leverage points identified above. Proposals disconnected from the structural analysis waste the pipeline.
5. **Be concrete.** "Reduce friction" is not an approach. "Eliminate the approval step between X and Y, which the decomposition identifies as a bottleneck with no downstream dependency" is.
6. **Admit limits.** If this lens generates fewer than 2 genuinely distinct approaches, say so. One honest approach is better than a second one fabricated for count.

## Follow-Up

Return the path to the updated perspective file. The orchestrator passes all 5 completed perspective files to the Synthesize agent in Wave 4.
