---
name: CriticalThinking
description: Multi-agent critical thinking pipeline that escapes local minima by analyzing problems through five orthogonal lenses — gap-driven reframing, cross-domain synthesis, representation shift, and an adaptive fifth lens. Lens types are backed by empirical analysis of 3,819 top-tier research papers (Sci-Reasoning, arXiv:2601.04577). USE WHEN critical thinking OR think critically OR analyze problem OR think about this from different angles OR multiple perspectives OR escape local minima OR orthogonal analysis OR think deeply OR attack this problem OR break down this problem OR think harder OR rigorous analysis OR five perspectives OR cross-domain reasoning OR avoid blind spots OR stress test an idea.
compatibility: Designed for Claude Code and Devin (or similar agent products).
metadata:
  author: pai
  version: "2.0.0"
---

# CriticalThinking

Multi-agent critical thinking pipeline with **process-boundary enforcement**. Takes any problem and analyzes it through five **orthogonal lenses** using four empirically-backed lens types: gap-driven reframing, cross-domain synthesis, representation shift, and an adaptive fifth lens chosen from three constrained options. Lens types are derived from analysis of 3,819 top-tier AI research papers (Sci-Reasoning, arXiv:2601.04577) which identified the dominant thinking patterns behind breakthroughs.

The purpose is **escaping local minima**: when you think about a problem one way, you converge on the nearest "good enough" answer. Five genuinely orthogonal reasoning chains, developed independently, explore different regions of the solution space. Gap-driven reframing sharpens the problem to its exact failure point. Cross-domain synthesis forces alien vocabulary that reveals hidden structure. Representation shift changes the fundamental primitive to simplify what was previously hard. The adaptive fifth lens fills whatever analytical gap remains.

The pipeline produces **six files**: five perspective files (one per lens) and one synthesis file. Each perspective file accumulates through three waves — reframing, decomposition, solution — creating a complete reasoning chain per lens. The synthesis file cross-pollinates insights across all five chains.

## Success Criteria

1. **Orthogonality** — The five lenses must be genuinely independent reasoning modes, not surface relabelings. Each must ask questions the others structurally cannot.
2. **Independence** — Decomposer and solver agents never see each other's work; cross-pollination happens only at synthesis
3. **Depth** — Each perspective produces a real first-principles decomposition, not a shallow restatement
4. **Escape velocity** — The synthesis must contain insights that no single-perspective analysis would reach — evidence that the pipeline escaped a local minimum
5. **Process integrity** — Agent isolation is enforced by process boundaries, not text instructions

## Orchestrator Architecture (MANDATORY)

**This skill uses a thin orchestrator that spawns separate agents for each pipeline step.**

### Core Invariant

**The orchestrator (Think.md) NEVER reads workflow step files.** It only:
- Passes file paths to agents (agent prompts include the path to the workflow file the agent should read)
- Checks that artifacts exist between waves (e.g., all 5 perspective files exist after Wave 1)
- Passes perspective file paths to downstream agents

Each pipeline wave runs as **separate agent invocations** (separate LLM sessions), creating real process boundaries that prevent contamination between perspectives.

### Why Process Boundaries Matter

The entire value of this skill is that five independent reasoning chains explore different regions of solution space. When a single LLM session handles all perspectives, it converges — the biology-framed and economics-framed analyses end up suspiciously similar because the same context window holds both. Process boundaries make convergence impossible: each decomposer and solver only sees one perspective file. This is the mechanism that escapes local minima.

### Pipeline Waves

| Wave | Agent(s) | Input | Output | Artifact Check |
|------|----------|-------|--------|---------------|
| 0 | Setup | User prompt | `$THINK_DIR` created | Directory exists |
| 1 | Reframer (1 agent) | User prompt | 5 perspective files | All 5 files exist, non-empty |
| 2 | Decomposers (5 parallel) | One perspective file each | Updated perspective files | All 5 files updated with decomposition section |
| 3 | Solvers (5 parallel) | One perspective file each | Updated perspective files | All 5 files updated with approaches section |
| 4 | Synthesizer (1 agent) | All 5 perspective files | `synthesis.md` | File exists, output to user |

When triggered, you MUST:
1. Read `Workflows/Think.md` FIRST — before doing any thinking or analysis
2. Follow Think.md's orchestrator steps — each wave spawns agents with workflow file paths
3. Check artifacts between waves as specified
4. Do NOT read workflow files (Reframe.md, Decompose.md, etc.) yourself — agents read their own instructions

## Workflow Routing

**When executing a workflow, output this notification IMMEDIATELY upon reading Think.md — before any other actions:**

```
Running the **Think** workflow from the **CriticalThinking** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **Think** | "critical thinking", "think critically", "analyze from different angles", "multiple perspectives", "escape local minima", "orthogonal analysis", "think deeply", "attack this problem", "break this down", "think harder", "rigorous analysis", "cross-domain reasoning" | `Workflows/Think.md` |

> **Pipeline waves** (Reframe, Decompose, Solve, Synthesize) are internal — each runs as separate agent(s). Think.md is the orchestrator.

## Lens System

5 orthogonal lenses using four lens types, backed by empirical frequency data from the Sci-Reasoning dataset (arXiv:2601.04577, analysis of 3,819 top-tier papers). The Reframer chooses all five sequentially as a single agent — it has context of each previous lens to evaluate orthogonality. Downstream agents each see only one file.

### Lens 1: Gap-Driven Reframing (24.2% of innovations)

The most common thinking pattern behind breakthroughs. Identify the specific failure, limitation, or mismatched assumption in the status quo. Rewrite that limitation as a precise constraint, then ask what methods are designed for that constraint. Stays in the problem's native domain but sharpens it to the exact failure point.

| # | Type | Constraint |
|---|------|-----------|
| 1 | Gap-Driven | Identify the specific failure. Rewrite as a testable constraint. Map to the solution class that addresses this constraint. |

### Lenses 2-3: Cross-Domain Synthesis (18.0% of innovations)

Two non-adjacent domain reframings — the problem is translated entirely into each field's vocabulary, mental models, and problem structures. Forced vocabulary change reveals hidden structure: you literally cannot describe the problem the same way when speaking biology instead of computer science.

| # | Type | Constraint |
|---|------|-----------|
| 2 | Cross-Domain | Agent-chosen. Must be a substantive field with its own vocabulary and frameworks. |
| 3 | Cross-Domain | Agent-chosen. Must be non-adjacent to lens 2 (different branch of knowledge). |

**Non-adjacency test:** Two domains are adjacent if practitioners regularly cross between them or share core vocabulary. Biology and ecology are adjacent. Biology and economics are non-adjacent. Computer science and mathematics are adjacent. Computer science and anthropology are non-adjacent.

### Lens 4: Representation Shift (10.5% of innovations)

Replace the problem's fundamental primitive or abstraction with an alternative that makes the problem dramatically simpler. This is NOT cross-domain synthesis — cross-domain changes the vocabulary you use to *describe* the problem; representation shift changes the *objects you manipulate*. You can do representation shift within the problem's own domain.

| # | Type | Constraint |
|---|------|-----------|
| 4 | Representational | Identify the current primitive. Propose an alternative that simplifies. Trace what becomes easy and what becomes hard. |

### Lens 5: Adaptive (choose one of three)

The Reframer selects whichever option is most orthogonal to lenses 1-4 for this specific problem:

| Option | Type | When to use |
|--------|------|-------------|
| A | Third Cross-Domain | A genuinely non-adjacent domain exists that would reveal structure invisible to lenses 2-3 |
| B | Mechanistic / Causal | The problem involves complex systems where the cause is unclear or the leverage point is hidden |
| C | Adversarial / Failure Mode | The problem involves decisions under uncertainty, risk, or competition |

**The orthogonality test:** The chosen lens is orthogonal if the questions it asks cannot be derived from, reduced to, or answered by any combination of lenses 1-4.

## Examples

**Example 1: Technical decision**
```
User: "Should we use microservices or a monolith for our new platform?"
-> Lens 1 (Gap-Driven): The specific failure is that monoliths become undeployable past ~50 engineers — the constraint is "independent deployability at scale," which maps to distributed systems coordination theory
-> Lens 2 (Cross-Domain: Biology): organism vs colony, cell membranes as service boundaries, immune system as fault isolation, metabolic cost of coordination
-> Lens 3 (Cross-Domain: Urban Planning): zoning, infrastructure costs between zones, traffic patterns, building codes as API contracts
-> Lens 4 (Representation Shift): Instead of "services" (nouns), represent as "capabilities" (verbs) — what operations need independent scaling? Changes the decomposition axis entirely
-> Lens 5 (Adaptive → Adversarial): What kills microservices? Network partitions, distributed debugging nightmares, data consistency failures, cascading timeouts
```

**Example 2: Strategic question**
```
User: "How should I think about building a personal brand?"
-> Lens 1 (Gap-Driven): The specific failure is signal-to-noise — most "personal brands" are indistinguishable. The constraint is "be the only person who could have said this," which maps to positioning theory
-> Lens 2 (Cross-Domain: Ecology): niche construction, carrying capacity, symbiosis, competitive exclusion
-> Lens 3 (Cross-Domain: Architecture): load-bearing structures vs facades, foundations, renovation vs rebuild
-> Lens 4 (Representation Shift): Instead of "audience" (passive noun), represent as "resonance network" (active graph) — who amplifies you, and why? Changes the growth model from broadcasting to network effects
-> Lens 5 (Adaptive → Third Cross-Domain: Music Theory): harmony, rhythm, resonance, composition vs performance, audience connection
```

**Example 3: Debugging a hard problem**
```
User: "Our API response times are degrading non-linearly as we add users"
-> Lens 1 (Gap-Driven): The specific failure is non-linearity — linear degradation would be expected. The constraint is "identify the superlinear component," which maps to computational complexity analysis and contention modeling
-> Lens 2 (Cross-Domain: Fluid Dynamics): flow, turbulence onset at Reynolds number thresholds, viscosity, pipe constraints
-> Lens 3 (Cross-Domain: Epidemiology): contagion patterns, tipping points, super-spreader events, herd effects
-> Lens 4 (Representation Shift): Instead of "requests per second" (throughput), represent as "contention graph" — which resources do requests compete for? The non-linearity lives in the contention topology, not the request volume
-> Lens 5 (Adaptive → Mechanistic/Causal): Trace the actual causal chain — request arrives → hits load balancer → queries database → the specific join on table X with no index causes O(n²) scanning → this is the leverage point
```

## Architecture Notes

The skill uses a **multi-start optimization** strategy for reasoning:
- Waves 1-3: five independent searches from different starting points in solution space
- Wave 4: compare results across all five, identify which found the deepest minimum (or reveal the answer spans multiple regions)

**File accumulation pattern:** Each perspective file grows through three waves:
1. After Wave 1: Contains the reframed problem from one lens
2. After Wave 2: Adds first-principles decomposition within that lens
3. After Wave 3: Adds 2-3 distinct approaches with trade-offs within that lens

The synthesis file (Wave 4) is the only file that draws from all five perspectives. This is the sixth and final file.

**Why this lens split works:** The four lens types operate on different aspects of the problem. Gap-driven reframing changes *what question you're answering* (zooming into the specific failure). Cross-domain synthesis changes *what vocabulary you use* (alien language reveals hidden structure). Representation shift changes *what objects you manipulate* (new primitives simplify previously hard operations). The adaptive fifth lens fills whichever analytical gap remains — more vocabulary diversity, causal tracing, or failure analysis. Together, the five lenses explore genuinely different regions of solution space.

**Empirical basis:** The lens types correspond to the top three innovation patterns identified in the Sci-Reasoning dataset (arXiv:2601.04577): Gap-Driven Reframing (24.2%), Cross-Domain Synthesis (18.0%), and Representation Shift (10.5%). These three patterns account for 52.7% of all innovations in 3,819 Oral and Spotlight papers at NeurIPS, ICML, and ICLR (2023-2025). The most powerful innovation combinations pair these patterns: Gap-Driven + Representation Shift (318 co-occurrences), Cross-Domain + Representation Shift (233), and Gap-Driven + Cross-Domain (204).
