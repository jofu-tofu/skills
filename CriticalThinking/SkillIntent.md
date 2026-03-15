# CriticalThinking Skill Intent

## Purpose

This skill formalizes the observation that rigorous problem-solving follows a consistent structure: decompose to first principles, link to known patterns from diverse domains, compare solutions, and synthesize. The quality of the output depends on two things: (1) how many genuinely different starting points you explore, and (2) whether those starting points are far enough apart to avoid converging on the same local minimum.

Most people (and most AI prompts) do this in a single chain of thought, which means the "different perspectives" converge almost immediately because they share a context window. CriticalThinking makes this process explicit and enforces genuine divergence through process boundaries. Five separate agents, each locked into one lens, produce five independent reasoning chains. Only the final synthesis agent sees all five.

This is critical thinking, not creative thinking. The goal is not novelty — it's rigor. Escaping local minima in reasoning, not generating novel ideas.

## Design Philosophy

### The Multi-Start Optimization Principle

The skill treats thinking as optimization in solution space. A single chain of reasoning is gradient descent from one starting point — it finds the nearest local minimum. Five independent chains from orthogonal starting points are multi-start optimization — they explore different regions of the space. The synthesis step then compares what each found.

The key insight: genuine divergence is hard in a single context window. The LLM naturally converges because all perspectives share the same token history. Process boundaries enforce what text instructions cannot: real independence.

### Why 3 Domain + 2 Epistemic (Not All Fixed, Not All Adaptive)

The lens system went through three design iterations:

1. **v1.0 — 4 fixed disciplines + 1 adaptive:** Mathematical, linguistic, biological, economic, + agent-chosen. Problem: these are creative prompts ("think like a biologist"), not critical thinking modes. They also sometimes had no purchase on the problem.

2. **v1.1 — 3 fixed epistemic + 2 adaptive:** Structural, causal, adversarial, + 2 agent-chosen. Problem: epistemic lenses are universally applicable but don't force vocabulary change. The structural analysis of a software problem still sounds like a software problem.

3. **v1.2 — 3 adaptive domain + 2 adaptive epistemic (current):** Domain reframing forces alien vocabulary (the primary mechanism for escaping local minima). Epistemic lenses add reasoning-mode diversity that domain lenses can't reach. All five are agent-chosen, but with orthogonality constraints.

The current design combines both mechanisms: domain lenses change what you SEE (new vocabulary reveals hidden structure), and epistemic lenses change HOW you think (new cognitive operations explore different solution regions).

### Why One Reframe Agent (Not Five Parallel Choosers)

The Reframer must choose all five lenses sequentially because:
1. It needs context of previous lenses to judge orthogonality — you can't verify lens 3 is distant from lenses 1-2 if you can't see them
2. Having previous context makes it easier to force genuinely new perspectives — the agent can explicitly push away from what it already chose
3. This mirrors the geometric intuition: in 5D space, each new basis vector must be perpendicular to ALL previous vectors, which requires knowing what they are

### The File Accumulation Pattern

Each perspective file grows through three waves (reframe → decompose → solve). This ensures each agent in the chain sees the full reasoning history for their perspective, maintaining coherence within each chain while preventing cross-contamination between chains.

Alternative designs considered:
- **Separate files per wave:** More files, harder to maintain coherence within a perspective
- **Single giant file with all perspectives:** Destroys independence — each agent would be influenced by the other perspectives
- **In-memory handoff:** Not possible with process boundaries; files are the handoff mechanism

### The Thin Orchestrator Pattern (from CodeReview)

Borrowed directly from CodeReview's architecture. The orchestrator never reads agent workflow files, only passes paths and checks artifacts. This prevents the orchestrator from "optimizing" by doing the thinking itself or skipping agents it considers redundant.

## Success Criteria

From the output perspective:
1. The synthesis contains insights that appear in ZERO individual perspective files (genuine emergence from cross-pollination)
2. At least one convergence is identified (independent agreement from different reasoning)
3. At least one contradiction is identified (genuine tension the user must navigate)
4. The user receives concrete, actionable output — not an academic exercise

## Explicit Out-of-Scope

- **Domain-specific expertise:** This skill provides structure for thinking, not domain knowledge. The quality of domain-specific reasoning depends on the LLM's training data.
- **Empirical validation:** The skill produces hypotheses and insights, not proven facts. The "What This Analysis Cannot Tell You" section is mandatory to prevent over-confidence.
- **Iterative refinement:** This is a single-pass pipeline. Future versions may add a feedback loop where the user can request deeper exploration of specific perspectives.

## Evolution Notes

### 2025-03-14 — Initial Design (v1.0)
- Created based on the observation that creativity = first-principles decomposition + cross-domain linking + solution comparison
- Adopted CodeReview's process-boundary architecture to enforce genuine perspective independence
- Chose 4 fixed disciplines (math, linguistic, biological, economic) + 1 adaptive
- Pipeline: Reframe (1 agent) → Decompose (5 parallel) → Solve (5 parallel) → Synthesize (1 agent)
- Total: 12 agent invocations per run (1 + 5 + 5 + 1), producing 6 files

### 2025-03-14 — Epistemic Pivot (v1.1)
- Reframed from "creative divergence" to "critical thinking / escaping local minima"
- Replaced 4 fixed disciplines with 3 fixed epistemic lenses (structural, causal, adversarial)
- Made lenses 4-5 agent-chosen with explicit orthogonality constraints
- Rationale: epistemic lenses are more generalizable than domain lenses for critical thinking

### 2025-03-14 — Domain-First Hybrid (v1.2)
- Reversed the epistemic-only approach: domain reframing IS the primary mechanism for escaping local minima
- New structure: 3 domain lenses (force vocabulary change) + 2 epistemic lenses (force reasoning mode change)
- All 5 lenses are agent-chosen with orthogonality constraints
- Non-adjacency test for domains; orthogonality test for epistemic lenses
- One reframe agent handles all 5 (needs context of previous choices to judge distance)

### 2025-03-14 — First Test Run & Retrospective (v1.3)
- Tested with: "In a world where AI agents remove bottlenecks, what is the new way to stand out as an exceptional person?"
- Solve workflow redesigned: replaced single prescribed solution with 2-3 approaches + trade-offs. Synthesis agent picks winners, not solvers.
- Added Trade-Off Landscape section to Synthesize workflow — integrates convergent, contradictory, and complementary trade-offs across all five lenses
- Decompose output was too verbose (~80-100 lines per perspective). Tightened to target 40-60 lines: compact component format (1 line each), merged Relationships + Leverage Points, explicit concision constraint.
- Background subagents couldn't write files (permission auto-denied). Workaround: foreground subagents for write-heavy waves. Design note: orchestrator should create files, agents should only append.
- Output quality was strong — five genuinely orthogonal perspectives, real convergences, actionable trade-off landscape. The pipeline earns its keep on complex, ambiguous questions.
