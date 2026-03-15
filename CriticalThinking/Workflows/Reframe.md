# Reframe Workflow

> Internal workflow — invoked by Think.md, not user-facing.

## Input / Output

**Input:**
- User's original problem/prompt (from `prompt.txt`)

**Output:**
- 5 perspective files: `perspective-1.md` through `perspective-5.md`
- Returns the absolute paths to all 5 files

## Background

This is the divergence engine of the CriticalThinking pipeline. Take a single problem and split it into five orthogonal analyses using four lens types — backed by empirical data from analysis of 3,819 top-tier AI research papers (Sci-Reasoning, arXiv:2601.04577) which identified the dominant innovation patterns behind breakthroughs.

The four lens types, ordered by empirical frequency:

1. **Gap-Driven Reframing (24.2%)** — Identify the specific failure and rewrite the limitation as the problem
2. **Cross-Domain Synthesis (18.0%)** — Translate into an alien field's vocabulary to reveal hidden structure
3. **Representation Shift (10.5%)** — Replace the problem's fundamental primitive/abstraction
4. **Adaptive 5th lens** — chosen from three constrained options based on problem fit

Pipeline quality depends on the distance between frames. If two framings produce similar reasoning chains when decomposed independently, an agent was wasted. Maximize conceptual distance between all five.

You choose all five lenses sequentially as a single agent. This is deliberate — you have context of each previous lens as you choose the next, which lets you evaluate orthogonality. Downstream agents each see only one file.

## Instructions

### Lens 1: Gap-Driven Reframing

Identify the specific failure, limitation, or mismatched assumption in the status quo. Rewrite that limitation as an explicit design constraint. Then ask: "If this constraint were the problem, what methods would apply?"

This is the most direct analysis — it stays in the problem's native domain but sharpens it to the exact failure point. The cognitive move is: **turn a vague problem into a precise constraint, then let the constraint tell you what class of solution applies.**

**How to execute:**
1. Diagnose: What specifically is failing, limited, or assumed incorrectly?
2. Constrain: Write the limitation as an explicit, testable constraint
3. Map: What methods, frameworks, or solution classes are designed for this exact constraint?

**Gap-driven is NOT the same as "just answering the question."** It reframes by zooming in — from "our API is slow" to "response times degrade non-linearly under load, which is a queuing theory problem." The reframe changes what solution class you reach for.

### Lenses 2-3: Cross-Domain Synthesis (two lenses)

Choose two non-adjacent domains. Translate the problem entirely into each domain's native vocabulary, mental models, and problem structures. Forced vocabulary change reveals hidden structure — describing an API performance problem in fluid dynamics language physically prevents reusing the original framings.

**Selecting domains:**
1. Choose a first domain with a structural analog to the user's problem — a genuine parallel, not a loose metaphor.
2. Choose a second domain **non-adjacent** to the first. Adjacent domains share practitioners or core vocabulary. Biology and ecology: adjacent. Biology and economics: non-adjacent.

**For each domain reframing:**
- Translate into that domain's native form — a practitioner would recognize this as their own problem
- Use actual frameworks, not surface metaphors. "It's like evolution" is a metaphor. "This is a fitness landscape with these selection pressures, these traits under selection, and this population structure" is a reframing.
- Identify what the domain's vocabulary makes visible that the original framing hides

### Lens 4: Representation Shift

Ask: "What primitive, abstraction, or data structure are we currently using to represent this problem? What alternative representation would make the problem trivial or dramatically simpler?"

The cognitive move is: **replace the problem's fundamental language** — not the domain vocabulary (that's cross-domain), but the structural primitive the solution operates on.

**How to execute:**
1. Identify the current representation: What objects, relationships, or abstractions are we manipulating? (e.g., users as active/inactive, requests as sequential pipeline, code as files)
2. Propose an alternative primitive: What if the fundamental unit were different? (e.g., users as momentum vectors, requests as event streams, code as dependency graphs)
3. Trace the consequences: What becomes easy, what becomes hard, what previously hidden structure becomes visible?

**Representation shift is NOT cross-domain synthesis.** Cross-domain changes the vocabulary you use to *describe* the problem. Representation shift changes the *objects you manipulate*. You can do representation shift within the problem's own domain.

### Lens 5: Adaptive (choose one)

Review lenses 1-4. Select the option below that is **most orthogonal** to the four lenses already chosen — the one whose questions cannot be derived from, reduced to, or answered by any combination of lenses 1-4.

**Option A: Third Cross-Domain Synthesis**
Choose a third non-adjacent domain (non-adjacent to both lenses 2 and 3). Use this when a genuinely distant domain exists that would reveal structure invisible to the first two domains. Apply the same rules as lenses 2-3.

**Option B: Mechanistic / Causal Localization**
Trace the actual causal chain producing the current outcome. Identify which specific component, factor, or link in the chain — if changed — would change the outcome. Localize the problem to its point of origin. Use this when the problem involves complex systems where the *cause* is unclear or where the *leverage point* is hidden.

**Option C: Adversarial / Failure Mode Analysis**
Model what would destroy, break, or defeat each potential solution. Identify worst-case scenarios, failure modes, and attack surfaces. Reason from the perspective of an adversary trying to make things go wrong. Use this when the problem involves decisions under uncertainty, risk, or competition.

**Selection criteria:** Pick the option that fills the biggest gap left by lenses 1-4. If the first four lenses are all analytical (what is?), pick adversarial (what breaks?). If the first four lenses are all forward-looking, pick mechanistic (what causes?). If the first four leave a vocabulary gap, pick a third cross-domain.

## Output Format

Write each perspective file (`perspective-N.md`) as follows:

**Lens 1 (Gap-Driven):**

```markdown
# Perspective 1: Gap-Driven Reframing

**Type:** Gap-driven reframing
**Stance:** [The persona — e.g., "The Constraint Analyst", "The Diagnostician"]

## Lens Selection

**Identified failure/limitation:** [1-2 sentences: the specific thing that is broken, limited, or wrongly assumed]
**Constraint rewrite:** [1 sentence: the limitation stated as a precise, testable constraint]
**Solution class this maps to:** [1 sentence: what methods/frameworks are designed for this constraint]

## Reframed Problem

[2-4 paragraphs. Start from the specific failure. Rewrite it as a constraint. Then analyze what solution class this constraint maps to. Show how the sharpened problem statement changes what approaches are viable.]

## Key Questions This Frame Raises

[3-5 questions that emerge from treating the limitation as the core problem — questions that a vague statement of the original problem would never surface.]

## Why This Frame Matters

[1-2 sentences: what the gap-driven reframe reveals that a broad attack on the problem misses.]
```

**Lenses 2-3 (Cross-Domain):**

```markdown
# Perspective N: [Domain Name]

**Type:** Cross-domain synthesis
**Stance:** [The persona — e.g., "The Ecologist", "The Urban Planner"]

## Lens Selection

**Domain:** [Name]
**Non-adjacency from prior domain lenses:** [1-2 sentences: why this domain is distant from prior domain lenses]
**What this vocabulary reveals:** [1 sentence: what becomes visible in this domain's language]

## Reframed Problem

[2-4 paragraphs. Translate the problem entirely into this domain's native framing. Use the domain's vocabulary, mental models, and problem structures. A practitioner in this field would recognize this as their own problem.]

## Key Questions This Frame Raises

[3-5 questions that ONLY this domain's vocabulary would surface — non-obvious questions invisible in the original framing.]

## Why This Frame Matters

[1-2 sentences: what this reframing reveals that a direct attack on the problem misses.]
```

**Lens 4 (Representation Shift):**

```markdown
# Perspective 4: Representation Shift

**Type:** Representation shift
**Stance:** [The persona — e.g., "The Abstraction Engineer", "The Primitive Redesigner"]

## Lens Selection

**Current representation:** [1-2 sentences: what primitive/abstraction the problem currently uses]
**Proposed alternative:** [1-2 sentences: the new primitive and why it simplifies]
**What this shift reveals:** [1 sentence: what structure becomes visible in the new representation]

## Reframed Problem

[2-4 paragraphs. Describe the problem using the new primitive. Show how the representation change makes previously hidden structure visible or previously hard operations easy.]

## Key Questions This Frame Raises

[3-5 questions that ONLY the new representation makes askable — questions that don't exist in the original representation.]

## Why This Frame Matters

[1-2 sentences: what the representation shift reveals that operating in the original primitive misses.]
```

**Lens 5 (Adaptive — format depends on choice):**

If **Option A (Third Cross-Domain):** Use the cross-domain format above.

If **Option B (Mechanistic/Causal):**

```markdown
# Perspective 5: Mechanistic / Causal Localization

**Type:** Mechanistic / causal localization
**Stance:** [The persona — e.g., "The Root Cause Analyst", "The Causal Tracer"]

## Lens Selection

**Why mechanistic:** [1-2 sentences: what gap this fills that lenses 1-4 leave open]
**Orthogonality justification:** [1-2 sentences: what questions this lens asks that none of lenses 1-4 can ask]

## Causal Analysis

[2-4 paragraphs. Trace the actual causal chain. Identify the specific links, factors, or components that produce the current outcome. Localize where exactly the chain breaks or where intervention would have the most leverage.]

## Key Questions This Frame Raises

[3-5 questions about mechanism, causation, and leverage points — questions that reframing alone cannot answer.]

## Why This Frame Matters

[1-2 sentences: what the causal trace reveals that reframing misses.]
```

If **Option C (Adversarial/Failure):**

```markdown
# Perspective 5: Adversarial / Failure Mode Analysis

**Type:** Adversarial / failure mode analysis
**Stance:** [The persona — e.g., "The Adversary", "The Failure Analyst"]

## Lens Selection

**Why adversarial:** [1-2 sentences: what gap this fills that lenses 1-4 leave open]
**Orthogonality justification:** [1-2 sentences: what questions this lens asks that none of lenses 1-4 can ask]

## Failure Analysis

[2-4 paragraphs. Model what would break, destroy, or defeat each potential approach. Identify worst-case scenarios, attack surfaces, and failure modes. Reason from the perspective of an adversary.]

## Key Questions This Frame Raises

[3-5 questions about vulnerabilities, failure modes, and worst cases — questions that constructive/analytical lenses systematically miss.]

## Why This Frame Matters

[1-2 sentences: what the adversarial perspective reveals that constructive analysis misses.]
```

## Constraints

Verify before writing:

1. **Gap specificity:** The gap-driven lens identifies a *specific* failure, not a restatement of the original problem. "The API is slow" is a restatement. "Response times degrade non-linearly under concurrent load" is a specific failure.
2. **Non-adjacency (domains):** Practitioners in one cross-domain field would rarely encounter the vocabulary of the other. If the two domains share significant vocabulary, replace one.
3. **Representation novelty:** The representation shift proposes a genuinely different primitive, not just a synonym for the current one. If the new representation doesn't change what operations are easy/hard, it's not a real shift.
4. **Adaptive justification:** The 5th lens choice is explicitly justified — why this option over the other two, given lenses 1-4.
5. **Coverage:** Five independent agents each receiving one file would produce five distinct analyses, not convergent ones.
6. **Substance:** Each reframing uses actual frameworks — specific concepts, models, and terminology. Surface metaphors are insufficient.

## Follow-Up

Return the paths to all 5 perspective files. The orchestrator passes each to a separate Decompose agent in Wave 2.
