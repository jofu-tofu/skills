# CreateDesign Workflow

**Purpose**: Walk through a structured design process that scales from standard feature designs to full architecture documents. Produces a concrete markdown design artifact oriented toward decision quality and constructive review.

**When to Use**:
- "Design doc", "write a design", "scope this feature", "proposal"
- Any request to produce a design document at Standard or Full scale
- If scale assessment yields Quick, redirect to `RecordDecision` workflow instead

## Reference Material

- **Output Quality:** `../OutputQuality.md` — Format selection, density, anti-AI patterns. **Read before producing any output in Step 4.**
- **Design Principles:** `../Principles.md` — Decision spine, foundation qualities, context recognition, guardrails.
- **Layer Toolbox:** `../Standards/LayerToolbox.md` — Situational review-support tools. **Read during Step 4.**

---

## Process

### Step 0: Clarify Blocking Unknowns

Before assessing scale or drafting, separate known facts from missing context. Use repo/source context when available, but do not invent user goals, user segments, current-state facts, reviewer concerns, or decision criteria from generic domain knowledge.

Ask only questions that change the artifact. Each question must use this format:

```markdown
**Question:** [Specific missing fact]
**Why this matters:** [How the answer affects scale, criteria, scope, evidence, or wording]
```

Ask when any of these are unknown:
- **Target users or beneficiaries** — needed to define what matters and avoid generic criteria
- **User/workflow pain** — needed to derive criteria from real friction rather than preference
- **Decision boundary** — needed to know what is being approved and what stays async
- **Decision owner/reviewers** — needed to choose evidence and review framing
- **Constraints/appetite** — needed to choose scale and avoid over-designing
- **Criteria or trade-off priority** — needed to evaluate alternatives without post-hoc justification
- **Current-state facts** — needed to avoid unsupported claims

If the user cannot answer, record the gap as an assumption or open question. Do not silently promote it to fact.

---

### Step 1: Assess Scale

Before anything else, determine the appropriate scale for this design.

| Scale | Signals | Action |
|-------|---------|--------|
| **Quick** | Single decision, bug fix, small UI change | Redirect to `RecordDecision` workflow |
| **Standard** | Feature, workflow, medium scope, weeks of work | Phases 1-4 of this workflow |
| **Full** | Architecture, new system, multi-week initiative, multiple teams | All 5 phases |

**Default to the lightest appropriate scale when the context supports it.** If scale is uncertain because the decision boundary, blast radius, or intended use is missing, ask the user with a **Why this matters** label. Over-scoping a design is a failure mode — it creates friction and discourages future documentation.

**Write**: "Scale assessment: [Quick/Standard/Full] because [reason]"

If Quick → stop here and invoke `RecordDecision` instead.

---

### Step 2: Understand Context

Three checks establish the foundation for the design: artifact weight, reviewer model, and problem definition.

#### Step 2a: Set Artifact Weight and Boundaries

Before problem synthesis, identify what kind of artifact the user is asking for. This prevents support material from becoming a full design document.

| Artifact Weight | Signals | Output Shape |
|-----------------|---------|--------------|
| **Design Doc** | New feature, architecture, reviewable approach | Full selected sections from Step 4 |
| **Support Note** | "write this somewhere", "context", "notes", "index this" | Short note linked from the source-of-truth doc |
| **Estimate Note** | Planned hours, PRJ planning, buffer, timeline | Problem/risk/estimate, explicit math, source-of-truth link |
| **Meeting Note** | "meeting notes", "we discussed", uncertain decisions | Dated notes, user wording, implications, open questions |

For Epic DLG work, also define the DLG boundary before drafting:
- **This DLG**: what this ticket will change or prove.
- **Adjacent/Future DLGs**: related work that belongs elsewhere.
- **Out of Scope**: plausible work deliberately excluded.
- **Source of Truth**: the design/spec/doc that owns scope; support notes link to it instead of duplicating it.

If the artifact is a support, estimate, or meeting note, keep it intentionally short. Do not add traceability scaffolding, indexed-scope sections, or formal design structure unless the user asks for it.

**Output**: Artifact weight + DLG/scope boundary summary

#### Step 2b: Know Your Reviewers

**Ask the user (use AskUserQuestion or conversational clarification) when this cannot be inferred from provided context. Label each question with why it matters:**

1. **Who will review/approve this design?**
2. **For each reviewer**: What are their top 2-3 concerns? What's their likely disposition (supportive, neutral, skeptical)? What evidence types do they trust?

**If the user can't name specific reviewers**, use these fallback archetypes based on the design type and label them as assumptions:

| Archetype | Top Concern | Evidence They Trust |
|-----------|------------|-------------------|
| Engineering lead | Feasibility, maintenance burden | Internal precedent, benchmarks |
| Product manager | User impact, timeline | User data, competitive analysis |
| Security reviewer | Attack surface, compliance | Standards, audit results |
| Executive | Cost, strategic alignment | Business metrics, industry trends |

Select 1-2 archetypes that match the design type. A technical design defaults to eng lead; a scope design defaults to PM + exec.

**Output**: Reviewer model (names or archetypes, concerns, dispositions, evidence preferences)

#### Step 2c: Define the Problem

**Ask the user for missing items. Label each question with why it matters and skip questions already answered by the prompt or repo context:**

1. **What problem are we solving?** Not "what do we want to build" — what pain or gap exists?
2. **For whom?** Who experiences this problem? Who benefits from solving it?
3. **What's the current state?** What exists today? What happens if we do nothing?
4. **What's the appetite?** How much time/effort do we WANT to spend? (This is a constraint, not an estimate.)
5. **What kind of design is this?** (scope, UI, technical, architectural, process, quick decision)
6. **How big is the change?** Incremental extension, moderate departure, or significant departure from current state?
7. **What exact decision is needed?** If there are multiple decisions, list them and keep the meeting/review surface to 2-3 decision points per 30 minutes.
8. **Who owns the decision?** Name the DRI/decider. Reviewers provide input; one owner makes the final call.
9. **What is out of scope for this decision?** Identify topics that should move async or become follow-up decisions.

**Synthesize into a Problem Statement** using the Design Thinking POV format:

> **[WHO]** needs **[WHAT]** because **[WHY / INSIGHT]**

Frame the problem statement to address the top blocking concern identified in Step 2b.

**One-Sentence Mission Test**: The entire design's purpose must fit in this single POV sentence. If it can't, the scope is too broad — consider splitting into multiple designs or reducing to Quick scale.

**Plain-English First Test**: For complex Epic designs, write the workflow outcome first: what exists now, what does not, what timing or ownership problem matters, and what decision this design must make. Add routine, item, API, or data-model names only after that model is clear.

**Output**: Problem statement + context summary + reviewer model

**Grounding rule**: The problem statement may use only user-provided facts, repo/source evidence, or explicitly labeled assumptions. If target users, user value, or current-state pain are unknown, ask before writing the problem statement.

---

### Step 3: Build the Decision Spine

Build the reasoning spine before recommending an option. The sequence is:

> Context -> risks -> constraints -> criteria -> assumptions -> alternatives -> decision

#### Step 3a: Define the Decision Boundary

Capture:
- **Decision**: the exact choice being made
- **Owner**: the single person or role accountable for the final call
- **Decision type**: reversible, reversible with cost, or hard to reverse
- **Allowed inputs**: concerns that can change the outcome
- **Out-of-scope inputs**: topics to park, answer async, or route to a follow-up decision

This turns the design into a decision artifact, not a discussion space.

#### Step 3b: Derive Decision Criteria

Criteria define what "good" means for this decision. Derive them from first principles:

1. What breaks if we optimize the wrong thing?
2. What will hurt in 6 months?
3. What matters most right now?

Use a criteria table:

| Criterion | Why It Matters | Priority | Evaluation |
|-----------|----------------|----------|------------|
| [Concrete criterion] | [Risk or constraint it answers] | Must / Should / Could or rank | [Metric, evidence, or review question] |

Criteria must be ranked. Unranked criteria preserve debate instead of resolving it.

Use the design type to find non-arbitrary criteria:
- **UI/UX**: start from workflow friction and human constraints. Common dimensions: interaction cost, cognitive load, learnability, discoverability, efficiency at scale, error prevention/recovery, flexibility. If the org uses Nielsen heuristics, translate only relevant heuristics into concrete criteria for this workflow.
- **Architecture/data model**: start from system risks. Common dimensions: correctness, scalability, coupling, performance, operational safety, observability, schema evolution.
- **Scope**: start from product and delivery risks. Common dimensions: user value, time-to-ship, overbuild risk, underbuild risk, complexity, milestone integrity.

If you cannot derive criteria from the stated workflow, risks, constraints, or user priorities, ask before proceeding:

```markdown
**Question:** Which outcome matters most if we have to trade off [A] against [B]?
**Why this matters:** This priority determines the decision criteria; without it, the design would invent intent and over-explain alternatives.
```

Criteria may include assumptions, but they must be labeled. Example: "Assumption: daily users prioritize repeated-use speed over first-use guidance."

#### Step 3c: Separate Assumptions from Criteria

Assumptions are testable beliefs that make the criteria reasonable. Capture only load-bearing assumptions: if the assumption were false, would the decision change?

Examples:
- Criteria: "Optimize for repeated-use efficiency over first-use guidance."
- Assumption: "Most users perform this workflow daily after onboarding."

Debate only assumptions that can flip the decision. Everything else moves async.

#### Step 3d: Gather Evidence and Evaluate Alternatives

Gather evidence and evaluate alternatives, oriented toward the decision criteria and reviewer concerns identified in Step 2.

**Apply the evidence hierarchy** (from `Principles.md`):
- Internal precedent first — what has your org done before that's similar?
- Industry practice — who else does this, and how?
- External research — what data supports this approach?

**For each plausible approach:**
- How does it perform against the top criteria?
- What would we gain?
- What would we lose?
- How does it address each reviewer's top concerns?
- What assumptions does it make?

**Classify decisions:**
- **Load-bearing** — anchor heavily with evidence; these are non-negotiable
- **Negotiable** — mark as flexible surfaces for reviewer input

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
- **Selective impact** — for related extensions, components, or workflows, mark each as **Unchanged**, **Needs Review**, or **Must Change**. Do not imply broad impact unless overlap is proven.
- **Revisit triggers** — assumption or metric changes that should reopen the decision later

**Output**: Decision boundary + ranked criteria + load-bearing assumptions + evidence matrix + alternatives evaluation + visual plan + classified decisions + revisit triggers

---

### Step 4: Draft for Review

Synthesize into the design artifact. Apply the Foundation + review-support tools throughout.

**Before writing, read `../OutputQuality.md`** and **`../Standards/LayerToolbox.md`**.

#### Apply Foundation Qualities

Start with the Decision Spine from Step 3. The recommendation should read as the result of criteria and evidence, not as a choice later justified by them.

All 6 foundation qualities from `Principles.md` are mandatory:

1. **Narrative framing** — Opening "Why This Design" section makes the design feel like the natural next step
2. **Honest trade-offs** — Alternatives get genuine consideration; recommended option has acknowledged weaknesses
3. **Evidence hierarchy** — Claims trace to internal precedent, industry practice, or data
4. **Constructive review surface** — fixed/flexible/open items are clear; reviewer input has a defined place
5. **Show don't tell** — Execute the visual plan from Step 3. Diagrams are the primary communication; prose explains what they can't show
6. **Explicit ask** — Document ends with a specific decision request

#### Select Review-Support Tools

Read `../Standards/LayerToolbox.md`. For each layer, check the "Activate When" column against your Step 2 context:

1. **Layer 1 (Credibility):** Read each tool's trigger. If a trigger matches your situation, activate that tool.
2. **Layer 2 (Structure):** Same process.
3. **Layer 3 (Decision Timing):** Same process. Use only when the timing facts matter.

For each layer, write a one-line note:
- "Layer 1: Activating **benchmarks** because audience is data-driven and we have performance claims."
- "Layer 2: Activating **preemptive rebuttals** because the migration will face 'why not stay on current system' objections."
- "Layer 3: No tools — no timing trigger matches at this scale."

If no trigger matches for a layer, activate zero tools for that layer.

#### Check Against Guardrails

Before finalizing, verify against the 5 guardrails in `Principles.md`:
- Urgency is earned (quantifiable cost of inaction)
- Timing/pressure tools are grounded and limited
- Concession surfaces are genuinely flexible
- Dominant type leads for hybrids
- Scaffolding is invisible

#### Select Sections and Write

**Select sections dynamically** per OutputQuality.md section 3. Do not produce all template sections and compress — select which to include based on the Section Selection table. Empty or generic sections are worse than absent ones.

**Output**: The design document using the template below, with only selected sections.

**Density principle**: A design document's power is inversely proportional to its length. Every additional sentence competes for the reader's finite attention — and the sentences that matter most (the decision points, the key trade-offs) lose force as the document grows. The reader who skims past your critical insight because it was buried in context didn't fail you — the document failed them.

Write the shortest document that lets a reviewer understand, challenge, approve, or revisit the decision. Let OutputQuality.md's density rules, signal tests, and compression protocol do the enforcement — they exist precisely so you don't need rigid word counts. When in doubt about whether a section is too long, apply the "So What?" test: if removing a paragraph changes no decision, remove it.

As a rough anchor: Standard designs typically land around 500–1000 words, Full designs around 1000–2500 words. These aren't limits — they're what naturally results from disciplined section selection and compression. If you're well above that range, you're likely including content the reader doesn't need to decide.

---

### Step 4.5: Validate Output Quality

Auto-chain the `ValidateOutput` workflow:
- `artifact`: the completed design document from Step 4
- `scale`: the assessed scale from Step 1

ValidateOutput runs dual gates: Substance Gate first, then Review Readiness Gate. Fix any FAIL results before delivery.

---

### Step 5: Review (Full Scale Only)

Structure feedback as decision input: objections should clarify criteria, evidence, assumptions, scope, or alternatives.

Use the design artifact to compress the decision, not to explore from scratch. Pre-wire high-risk objections before the meeting: send the draft to the 2-3 stakeholders most likely to block, ask what would make them block it, and revise weak criteria, assumptions, or evidence before live review.

**Pre-review readiness check:**
- Do you have the votes? Cross-reference the reviewer model from Step 2b against the document.
- Is every blocking concern addressed with evidence the reviewer trusts?
- Would a skeptical reader feel informed rather than sold to?
- Is the review surface bounded by criteria, assumptions, option evaluation, and explicit non-goals?

**Process:**
1. Identify reviewers based on the decision authority established in Step 2
2. Pre-wire alignment with likely blockers before live review
3. Present the design document as the decision filter: criteria, load-bearing assumptions, and option comparison
4. Collect feedback framed as "This changes the decision if [condition]" rather than open-ended preference
5. Classify each objection: changes criteria, changes assumption, changes option evaluation, or out of scope
6. Park comments that do not affect the decision criteria or load-bearing assumptions
7. Cross-reference actual feedback against the reviewer model — update the model for future designs
8. Capture outstanding concerns and resolution path
9. Record final decisions with rationale in the decision log
10. Set a revisit date or revisit trigger if the design has time-sensitive assumptions

**Output**: Updated design document with review feedback incorporated + decision log entries

---

## Output Template

The artifact this workflow produces. **Include only sections selected per OutputQuality.md section 3.** Skip sections that aren't relevant — the template is a menu, not a checklist.

```markdown
# Design: [Title]

**Date**: [date]  |  **Status**: Draft / In Review / Accepted  |  **Scale**: Standard / Full
**Author**: [name]  |  **Decider**: [name/role]

## Why This Design
[Narrative framing — 2 paragraphs that state the problem, users, top criteria, and why the proposed change follows. Addresses the top blocking uncertainty within the first paragraph.]

## Current State
[What exists today — what's broken/missing. Use visuals where possible.]

## Decision Boundary
| Field | Value |
|-------|-------|
| Decision | [Exact choice being made] |
| Owner | [DRI / decider] |
| Type | [Reversible / reversible with cost / hard to reverse] |
| In Scope | [Inputs allowed to change the outcome] |
| Out of Scope | [Topics to answer async, park, or route to follow-up] |

## Decision Criteria
| Criterion | Why It Matters | Priority | Evaluation |
|-----------|----------------|----------|------------|
| ... | ... | Must / Should / Could or rank | Metric, evidence, or review question |

## Assumptions & Revisit Triggers
| Assumption | Why It Matters | Revisit Trigger |
|------------|----------------|-----------------|
| ... | ... | [Metric, event, or new evidence that reopens the decision] |

## Approach
[The actual design. Diagrams, flow charts, architecture pictures. Show don't tell. Break large changes into incremental phases where applicable.]

## Precedent & Evidence
| Claim | Evidence | Source |
|-------|----------|--------|
| ... | ... | Internal / Industry / Data |

## Alternatives Considered
| Option | Pros | Cons | Why Not |
|--------|------|------|---------|
| [Alternative A] | ... | ... | [Tied to criterion or concern it fails to address] |

## Open Questions & Flexibility
[Genuine unresolved items. Mark which are flexible, what evidence would decide them, and which owner should resolve them.]

## Goals & Non-Goals
- Goals: [Specific, measurable]
- Non-Goals: [Deliberately excluded, with rationale]

## Risks & Mitigations
[Embedded inline where possible. For remaining risks: each risk paired with a mitigation or acknowledgment. Preemptive rebuttals for the top 2-3 anticipated objections.]

## Ask
[Explicit decision request: "Approve this design" / "Approve with conditions" / "Choose between Option A and Option B" / "Validate these criteria before implementation." Not a summary.]

## Decision Log
| When / Source | Decision / Concern | Why | Revisit If | Reopens |
|---------------|--------------------|-----|------------|---------|
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
1. Cache invalidation strategy: TTL-based vs. event-driven. **Flexible** — we lean toward TTL for simplicity but would adopt event-driven if the catalog team needs tighter consistency.
2. Should we cache product images or just metadata? Needs input from the frontend team on current bottlenecks.
3. **Flexible** — Redis cluster topology (single-node vs. cluster). We've sized for single-node but can scale if the infra team has concerns.

**Ask** (Full, architectural):
> Approve the Redis read-through cache as described, or identify which criterion or assumption changes the decision. It extends our existing infrastructure, addresses the p99 SLA risk before Q4, and leaves cache topology and invalidation strategy flexible for reviewer input.

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
- **From ReviewDesign**: Existing designs can be evaluated against the 6 Pillars and Review Readiness
- **To RecordDecision**: Full-scale designs may spawn individual ADRs for key decisions
- **Load `Principles.md`** when deeper grounding is needed on any foundation quality or guardrail
- **Load `Standards/LayerToolbox.md`** during Step 4 for situational tool selection
