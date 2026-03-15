# Decompose Workflow

> Internal workflow — invoked by Think.md, not user-facing.
> You are ONE of five parallel agents. You see ONE perspective file only.

## Input / Output

**Input:**
- One perspective file: `$THINK_DIR/perspective-N.md` (reframed problem from one lens)
- Original problem: `$THINK_DIR/prompt.txt`

**Output:**
- Appends a `## First-Principles Decomposition` section to the same perspective file
- Returns the absolute path to the updated file

## Background

The perspective file contains a problem reframed through one lens's vocabulary and mental models. Decompose it to irreducible components within that lens — strip away assumptions and "obvious" answers until you reach bedrock truths that cannot be further reduced. Then rebuild upward.

## Instructions

### Step 1: Read Your Perspective File

Read the reframed problem and `prompt.txt`. Identify the lens's native framing, key questions, and vocabulary.

### Step 2: Challenge Assumptions

Identify 3-5 assumptions embedded in the original problem and the lens's reframing. For each: does it hold, break, or hold conditionally? One sentence of reasoning each.

### Step 3: Extract Irreducible Components

Break the problem into 3-5 irreducible pieces within this lens. For each component, state in one line each: what it is, what drives it, and what depends on it. Resist the urge to elaborate — the Solve agent will build on these.

### Step 4: Map Relationships and Leverage Points

In a short paragraph (3-5 sentences), describe the key relationships between components — dependencies, tensions, and feedback loops. Then identify 2-3 leverage points where a small change produces a large effect.

### Step 5: Distill the Key Insight

One to two sentences: what does this decomposition reveal that was invisible before the breakdown?

## Output Format

Append to the perspective file. **Target length: 40-60 lines.** Favor clarity and density over exhaustiveness.

```markdown
---

## First-Principles Decomposition

### Assumptions Challenged

| Assumption | Status | Reasoning |
|-----------|--------|-----------|
| [Assumption] | [Holds / Breaks / Conditional] | [1 sentence] |

### Irreducible Components

1. **[Name]** — [1-sentence definition]. Driver: [what sustains it]. Downstream: [what depends on it].
2. **[Name]** — [Same compact format].
3. **[Name]** — [Same compact format].

### Relationships & Leverage Points

[3-5 sentences: key dependencies, tensions, feedback loops between components.]

**Leverage points:**
1. **[Point]** — [1 sentence: why high-leverage]
2. **[Point]** — [1 sentence: why high-leverage]

### Key Insight

[1-2 sentences: the non-obvious truth this decomposition reveals.]
```

## Constraints

1. **Do NOT read other perspective files.** Only read `perspective-N.md` (your assigned file) and `prompt.txt`. Reading other perspective files contaminates your reasoning — exposure to another lens's framing causes unconscious convergence, destroying your independent analysis.
2. **Stay in your lane.** Decompose within your assigned lens only.
3. **Be concise.** Every sentence should earn its place. If a point can be made in one sentence, do not use three. The Solve agent builds on this work — it does not need a dissertation, it needs a clear structural map.
4. **Challenge the frame.** Identify where this lens's assumptions fail. "This lens doesn't capture X" is a valid finding.
5. **Stay concrete.** Every component and leverage point connects back to the user's actual problem.

## Follow-Up

Return the path to the updated perspective file. The orchestrator passes this same file to a Solve agent in Wave 3.
