# CreateDesign Workflow

**Purpose**: Walk through a structured design process that scales from standard feature designs to full architecture documents. Produces a concrete markdown design artifact oriented toward reviewer acceptance.

**When to Use**:
- "Design doc", "write a design", "scope this feature", "proposal"
- Any request to produce a design document at Standard or Full scale
- If scale assessment yields Quick, redirect to `RecordDecision` workflow instead

## Reference Material

- **Output Quality:** `../OutputQuality.md` — Format selection, density, anti-AI patterns. **Read before producing any output in Step 4.**
- **Design Principles:** `../Principles.md` — Foundation qualities, context recognition, guardrails.
- **Layer Toolbox:** `../Standards/LayerToolbox.md` — Situational tools by cognitive phase. **Read during Step 4.**

---

## Process

### Step 1: Assess Scale

Before anything else, determine the appropriate scale for this design.

| Scale | Signals | Action |
|-------|---------|--------|
| **Quick** | Single decision, bug fix, small UI change | Redirect to `RecordDecision` workflow |
| **Standard** | Feature, workflow, medium scope, weeks of work | Phases 1-4 of this workflow |
| **Full** | Architecture, new system, multi-week initiative, multiple teams | All 5 phases |

**Default to the lightest appropriate scale.** If uncertain, ask the user. Over-scoping a design is a failure mode — it creates friction and discourages future documentation.

**Write**: "Scale assessment: [Quick/Standard/Full] because [reason]"

If Quick → stop here and invoke `RecordDecision` instead.

---

### Step 2: Understand Context

Two sub-phases that establish the foundation for the design.

#### Step 2a: Know Your Reviewers

**Ask the user (use AskUserQuestion or conversational clarification):**

1. **Who will review/approve this design?**
2. **For each reviewer**: What are their top 2-3 concerns? What's their likely disposition (supportive, neutral, skeptical)? What evidence types do they trust?

**If the user can't name specific reviewers**, use these fallback archetypes based on the design type:

| Archetype | Top Concern | Evidence They Trust |
|-----------|------------|-------------------|
| Engineering lead | Feasibility, maintenance burden | Internal precedent, benchmarks |
| Product manager | User impact, timeline | User data, competitive analysis |
| Security reviewer | Attack surface, compliance | Standards, audit results |
| Executive | Cost, strategic alignment | Business metrics, industry trends |

Select 1-2 archetypes that match the design type. A technical design defaults to eng lead; a scope design defaults to PM + exec.

**Output**: Reviewer model (names or archetypes, concerns, dispositions, evidence preferences)

#### Step 2b: Define the Problem

**Ask the user:**

1. **What problem are we solving?** Not "what do we want to build" — what pain or gap exists?
2. **For whom?** Who experiences this problem? Who benefits from solving it?
3. **What's the current state?** What exists today? What happens if we do nothing?
4. **What's the appetite?** How much time/effort do we WANT to spend? (This is a constraint, not an estimate.)
5. **What kind of design is this?** (scope, UI, technical, architectural, process, quick decision)
6. **How big is the change?** Incremental extension, moderate departure, or significant departure from current state?

**Synthesize into a Problem Statement** using the Design Thinking POV format:

> **[WHO]** needs **[WHAT]** because **[WHY / INSIGHT]**

Frame the problem statement to address the top blocking concern identified in Step 2a.

**One-Sentence Mission Test**: The entire design's purpose must fit in this single POV sentence. If it can't, the scope is too broad — consider splitting into multiple designs or reducing to Quick scale.

**Output**: Problem statement + context summary + reviewer model

---

### Step 3: Build Your Case

Gather evidence and evaluate alternatives, oriented toward the reviewer concerns identified in Step 2.

**Apply the evidence hierarchy** (from `Principles.md`):
- Internal precedent first — what has your org done before that's similar?
- Industry practice — who else does this, and how?
- External research — what data supports this approach?

**For each plausible approach:**
- What would we gain?
- What would we lose?
- How does it address each reviewer's top concerns?
- What assumptions does it make?

**Classify decisions:**
- **Load-bearing** — anchor heavily with evidence; these are non-negotiable
- **Negotiable** — mark as concession surfaces for reviewer input

**For controversial sections:**
- Draft preemptive rebuttals for the top 2-3 anticipated objections
- Tie each rebuttal to evidence from the hierarchy

**Plan visuals:**

The default is visual, not textual. Ask "can this be shown?" before writing prose for any structural content.

| Content Type | Visual Format |
|-------------|--------------|
| System boundaries, services, dependencies | Architecture diagram |
| Request/data flow, multi-step processes | Sequence diagram or flow chart |
| State changes, lifecycles | State machine diagram |
| Option comparison | Comparison table |
| Timeline, phases, milestones | Gantt chart or timeline |
| Hierarchy, org structure | Tree diagram |

At least one visual is mandatory. For architectural or multi-component designs, expect 2-3. The Approach section's format default is "Prose + diagrams" — the diagrams aren't decoration, they're the primary communication and the prose explains what the diagram can't show.

**Also identify:**
- **Non-goals** — things deliberately excluded, with rationale
- **Rabbit holes** — areas of technical risk to timebox or avoid

**Output**: Evidence matrix + alternatives evaluation + visual plan + classified decisions

---

### Step 4: Draft for Acceptance

Synthesize into the design artifact. Apply the Foundation + Layers framework throughout.

**Before writing, read `../OutputQuality.md`** and **`../Standards/LayerToolbox.md`**.

#### Apply Foundation Qualities

All 6 foundation qualities from `Principles.md` are mandatory:

1. **Narrative framing** — Opening "Why This Design" section makes the design feel like the natural next step
2. **Honest trade-offs** — Alternatives get genuine consideration; recommended option has acknowledged weaknesses
3. **Evidence hierarchy** — Claims trace to internal precedent, industry practice, or data
4. **Co-creation tone** — "We" language; concession surfaces invite participation
5. **Show don't tell** — Execute the visual plan from Step 3. Diagrams are the primary communication; prose explains what they can't show
6. **Explicit ask** — Document ends with a specific decision request

#### Select Situational Tools

Read `../Standards/LayerToolbox.md`. For each layer, check the "Activate When" column against your Step 2 context:

1. **Layer 1 (Credibility):** Read each tool's trigger. If a trigger matches your situation, activate that tool.
2. **Layer 2 (Structure):** Same process.
3. **Layer 3 (Momentum):** Same process. Respect the scale limit (Standard: max 1; Full: max 2).

For each layer, write a one-line note:
- "Layer 1: Activating **benchmarks** because audience is data-driven and we have performance claims."
- "Layer 2: Activating **preemptive rebuttals** because the migration will face 'why not stay on current system' objections."
- "Layer 3: No tools — no trigger matches at this scale."

If no trigger matches for a layer, activate zero tools for that layer.

#### Check Against Guardrails

Before finalizing, verify against the 5 guardrails in `Principles.md`:
- Urgency is earned (quantifiable cost of inaction)
- Momentum tools within scale limit
- Concession surfaces are genuinely flexible
- Dominant type leads for hybrids
- Scaffolding is invisible

#### Select Sections and Write

**Select sections dynamically** per OutputQuality.md section 3. Do not produce all template sections and compress — select which to include based on the Section Selection table. Empty or generic sections are worse than absent ones.

**Output**: The design document using the template below, with only selected sections.

**Density principle**: A design document's power is inversely proportional to its length. Every additional sentence competes for the reader's finite attention — and the sentences that matter most (the decision points, the key trade-offs) lose force as the document grows. The reader who skims past your critical insight because it was buried in context didn't fail you — the document failed them.

Write the shortest document that a reviewer can say yes to. Let OutputQuality.md's density rules, signal tests, and compression protocol do the enforcement — they exist precisely so you don't need rigid word counts. When in doubt about whether a section is too long, apply the "So What?" test: if removing a paragraph changes no decision, remove it.

As a rough anchor: Standard designs typically land around 500–1000 words, Full designs around 1000–2500 words. These aren't limits — they're what naturally results from disciplined section selection and compression. If you're well above that range, you're likely including content the reader doesn't need to decide.

---

### Step 4.5: Validate Output Quality

Auto-chain the `ValidateOutput` workflow:
- `artifact`: the completed design document from Step 4
- `scale`: the assessed scale from Step 1

ValidateOutput runs dual gates: Substance Gate first, then Acceptance Gate. Fix any FAIL results before delivery.

---

### Step 5: Review (Full Scale Only)

Structure feedback using the "Yes, if" framing — objections are constructive contributions, not blockers.

**Pre-review readiness check:**
- Do you have the votes? Cross-reference the reviewer model from Step 2a against the document.
- Is every blocking concern addressed with evidence the reviewer trusts?
- Would a skeptical reader feel informed or sold to?

**Process:**
1. Identify reviewers based on the decision authority established in Step 2
2. Present the design document
3. Collect feedback framed as "Yes, if [condition]" rather than "No, because [objection]"
4. Cross-reference actual feedback against the reviewer model — update the model for future designs
5. Capture outstanding concerns and resolution path
6. Record final decisions with rationale in the decision log
7. Set a revisit date if the design has time-sensitive assumptions

**Output**: Updated design document with review feedback incorporated + decision log entries

---

## Output Template

The artifact this workflow produces. **Include only sections selected per OutputQuality.md section 3.** Skip sections that aren't relevant — the template is a menu, not a checklist.

```markdown
# Design: [Title]

**Date**: [date]  |  **Status**: Draft / In Review / Accepted  |  **Scale**: Standard / Full
**Author**: [name]  |  **Decider**: [name/role]

## Why This Design
[Narrative framing — 2 paragraphs that make the design feel like the natural next step. Addresses the top blocking concern within the first paragraph.]

## Current State
[What exists today — what's broken/missing. Use visuals where possible.]

## Approach
[The actual design. Diagrams, flow charts, architecture pictures. Show don't tell. Break large changes into incremental phases where applicable.]

## Precedent & Evidence
| Claim | Evidence | Source |
|-------|----------|--------|
| ... | ... | Internal / Industry / Data |

## Alternatives Considered
| Option | Pros | Cons | Why Not |
|--------|------|------|---------|
| [Alternative A] | ... | ... | [Tied to specific concern it fails to address] |

## Open Questions & Flexibility
[Genuine unresolved items. Mark which are concession surfaces — areas where you're genuinely flexible and invite reviewer input.]

## Goals & Non-Goals
- Goals: [Specific, measurable]
- Non-Goals: [Deliberately excluded, with rationale]

## Risks & Mitigations
[Embedded inline where possible. For remaining risks: each risk paired with a mitigation or acknowledgment. Preemptive rebuttals for the top 2-3 anticipated objections.]

## Ask
[Explicit decision request: "Approve this design" / "Approve with conditions" / "Choose between Option A and Option B." The single strongest reason to say yes. Not a summary.]

## Decision Log
| Decision | Rationale | Date |
|----------|-----------|------|
```

### Worked Examples for New Sections

**Why This Design** (Standard, technical design — caching layer):
> Our API response times have degraded 40% since January as the product catalog grew past 500K items. We need a caching layer before the holiday traffic spike in Q4 — without one, projected p99 latency exceeds our 500ms SLA by November.
>
> We recommend a Redis-backed read-through cache that extends the existing product service. This approach builds on the Redis infrastructure we already run for sessions, requires no new operational dependencies, and can ship within the 4-week appetite.

**Precedent & Evidence** (architectural migration):

| Claim | Evidence | Source |
|-------|----------|--------|
| Read-through cache reduces p99 by 60-80% for catalog workloads | Load test results from staging (March 2026) | Internal — performance team |
| Redis handles our projected 50K RPM with single-node | AWS benchmark for r7g.xlarge at similar workload | Industry |
| Teams that migrate caching incrementally report fewer rollback incidents | Shopify eng blog, Stripe infrastructure post | Industry |

**Open Questions & Flexibility** (scope design):
1. Cache invalidation strategy: TTL-based vs. event-driven. **Concession surface** — we lean toward TTL for simplicity but would adopt event-driven if the catalog team prefers tighter consistency.
2. Should we cache product images or just metadata? Needs input from the frontend team on current bottlenecks.
3. **Concession surface** — Redis cluster topology (single-node vs. cluster) is flexible. We've sized for single-node but can scale if the infra team has concerns.

**Ask** (Full, architectural):
> We recommend approving the Redis read-through cache as described. It extends our existing infrastructure, addresses the p99 SLA risk before Q4, and leaves cache topology and invalidation strategy flexible for reviewer input. Approve this design, or identify conditions under which it would be acceptable.

---

## Scale Adaptations

### Standard Scale
- Skip Step 5 (Review) unless the user requests it
- Use the template flexibly — include only sections that pass the Section Selection table
- Aim for 500-1000 words total (see word budgets in Step 4)

### Full Scale
- All 5 steps including pre-review readiness check and structured review
- Template used comprehensively
- Consider producing individual ADRs (via `RecordDecision`) for key decisions within the design
- Aim for 1000-2500 words total (see word budgets in Step 4). The constraint forces prioritization — the reader's time is the scarce resource, not your output capacity.

---

## Integration Notes

- **From RecordDecision**: Quick-scale assessments redirect there instead
- **From ReviewDesign**: Existing designs can be evaluated against the 4 Pillars and the Acceptance Assessment
- **To RecordDecision**: Full-scale designs may spawn individual ADRs for key decisions
- **Load `Principles.md`** when deeper grounding is needed on any foundation quality or guardrail
- **Load `Standards/LayerToolbox.md`** during Step 4 for situational tool selection
