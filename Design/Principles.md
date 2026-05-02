# Design Principles

**Purpose**: Context file containing the decision-quality and review-oriented framework that grounds the Design skill. Organized as Decision Spine + Foundation (always-on qualities) + Context Recognition + Guardrails (constraints). Loaded on-demand by workflows when deeper grounding is needed.

**Companion files** (loaded only when needed):
- `Standards/LayerToolbox.md` — Situational tools organized by cognitive phase. Loaded during CreateDesign Step 4.
- `Standards/OutputScience.md` — Research grounding for OutputQuality.md rules + full source attribution.

---

## The Decision Spine

A design's reasoning must be explicit before the recommendation appears: **decision boundary -> criteria -> assumptions -> option comparison -> ask**. This prevents post-hoc justification, limits review drift, and gives every stakeholder the same filter for comments.

### Clarification Before Synthesis

When context is missing, ask before filling gaps with plausible-sounding assumptions. A design saves words by aligning to the user's actual intent and the known facts; invented context creates extra prose, weak criteria, and review churn.

Ask only blocking questions. Each question must include **Why this matters** so the user can see how the answer changes scale, criteria, evidence, or scope. If an answer is unknown, capture it as an explicit assumption or open question instead of treating it as fact.

**Anti-pattern**: Creating user goals, decision criteria, reviewer concerns, or current-state facts from generic domain knowledge when the prompt did not provide them.

**Test**: Is every claim grounded in user-provided context, repo/source evidence, or an explicitly labeled assumption?

### Decision Boundary

State exactly what is being decided, who owns the final call, whether the decision is reversible, and which inputs are allowed to change the outcome. A bounded decision lets reviewers contribute without turning the document into an open-ended brainstorming space.

**Anti-pattern**: "Choose database approach" when the real decision is "Pick persistence layer for the billing service; reversible; owner = platform lead; inputs = consistency, operational risk, and 12-month scale; not style preference."

### Decision Criteria

Criteria define what "good" means for this decision. Derive them from first principles: context -> risks -> constraints -> criteria. Prioritize them so trade-offs become explicit: correctness may outrank performance for a ledger, while repeated-use efficiency may outrank first-use discoverability for a daily workflow.

Valid criteria are concrete, ranked, and decision-driving. They map to real failure modes, can be observed or evaluated, force trade-offs, and help reject options. If a criterion cannot help say no to an option, it is decoration.

**Domain guides**:
- **UI/UX**: derive criteria from workflow friction and human constraints: interaction cost, cognitive load, learnability, discoverability, efficiency at scale, error prevention/recovery, flexibility. Nielsen heuristics are a source library; translate only relevant heuristics into workflow-specific criteria.
- **Architecture/data model**: derive criteria from system risk: correctness, scalability, coupling, performance, operational safety, observability, schema evolution.
- **Scope**: derive criteria from product and delivery risk: user value, time-to-ship, overbuild risk, underbuild risk, complexity, milestone integrity.

### Assumptions and Revisit Triggers

Assumptions are testable beliefs that explain why the criteria are valid; they are not the criteria themselves. Debate only assumptions that would change the decision. Revisit triggers turn future disagreement into a factual question: "Did the assumptions change?"

**Anti-pattern**: Trying to align on every assumption. This creates swirl. Align on criteria first, then resolve only load-bearing assumptions.

### Review Surface

The document should make comments constructive by defining what feedback is in scope. A review comment should challenge a criterion, a priority, a load-bearing assumption, an option's score against criteria, or a stated non-goal. Styling details, implementation preferences, and adjacent concerns move async unless they affect the decision criteria.

**Test**: Can every blocking comment be answered as "changes criteria," "changes assumption," "changes option evaluation," or "out of scope"?

---

## The Foundation

Six always-on qualities applied to every design document. These are not "selected" — they are ambient properties of good design writing that handle most review and comprehension work.

### 1. Narrative Framing

The opening sets the interpretive lens. A reviewer who encounters your frame first reads everything through it. Not generic background — a compact statement of the problem, users, criteria, and proposed change.

The first paragraph addresses the top blocking uncertainty. The second shows why the proposed change follows from the criteria. A reader who finishes the opening should understand the decision before reading the details.

Bransford & Johnson (1972) demonstrated that providing the topic before the content produces roughly 2x recall. Frame first, detail second.

**Anti-pattern**: Generic "background" openings that describe the situation without naming the decision. The reader must infer what matters.

### 2. Honest Trade-offs

Showing what you rejected and why prevents derailment and builds trust through demonstrated intellectual honesty. Every alternative gets genuine consideration. The recommended option has acknowledged weaknesses.

In trial advocacy, disclosing weaknesses on direct examination ("disclose on direct") neutralizes them before cross-examination. The same principle applies: a reviewer who discovers a flaw you didn't mention loses trust in everything else you wrote.

> "One of the most important sections of a design doc." — Google Design Docs on the Alternatives Considered section

**Anti-pattern**: Alternatives that are obviously inferior straw men. If every rejected option looks bad, the comparison isn't honest — it's theater.

### 3. Evidence Hierarchy

Internal precedent > industry practice > external research. What your own org has done is usually the strongest evidence because it is closest to the current constraints, systems, and team habits.

| Evidence Type | Strength | Why |
|--------------|----------|-----|
| Internal precedent | Strongest | "We've done this before" — local feasibility and operational fit |
| Industry practice | Strong | "Others do this" — external validation when local data is missing |
| External research | Moderate | "Studies show" — authority, but distant from your specific context |

Anchoring bias (Tversky & Kahneman, 1974): the first reference point disproportionately shapes evaluation. Lead with internal precedent when available.

**Anti-pattern**: Leading with external research when internal precedent exists. Your own org's experience is usually more relevant.

### 4. Constructive Review Surface

Reviewers need clear ways to improve the decision without reopening everything. Mark what is fixed, what is flexible, and what evidence would change the outcome.

Use collaborative language and genuine flexibility where reviewer input can improve the design. A flexible surface is useful only when you would accept a different answer.

> "Separate the people from the problem. Focus on interests, not positions." — Fisher & Ury, *Getting to Yes*

**Anti-pattern**: Performative flexibility where the "open question" has a predetermined answer.

### 5. Show Don't Tell

The default is visual, not textual. For any structural content — system boundaries, data flows, state changes, option comparisons — the diagram is the primary communication and prose explains what the diagram can't show. People retain 80% more when presented visually (Mayer's multimedia learning principles).

Architectural or multi-component designs need 2-3 visuals. Even feature-level designs benefit from a flow chart or comparison table. Break large changes into smaller visual blocks that look incremental — discrete components feel manageable where monolithic transformation feels risky.

> "When words and visuals are presented together, people learn more deeply than from words alone." — Richard Mayer, *Multimedia Learning*

**Anti-pattern**: Prose-only designs for structural content (system boundaries, data flows, component relationships). If the reader has to mentally construct a diagram, the document has failed.

### 6. Explicit Ask

The document ends with a clear, specific request: approve, give feedback on X, decide between A and B, or validate criteria before more work happens. Not a summary — a decision request.

An ambiguous conclusion forces the reviewer to construct an action — and the easiest self-constructed action is "defer." Default bias (Samuelson & Zeckhauser, 1988): when no clear action is specified, people choose the status quo.

**Anti-pattern**: Ending with a summary or "next steps" list that doesn't include a specific decision request. The reader finishes informed but uncommitted.

---

## Context Recognition

Before applying situational tools, understand the design situation. Three questions guide tool selection.

### Question 1: What kind of design is this?

| Design Type | Characteristics | Foundation Emphasis |
|------------|----------------|-------------------|
| Scope (next quarter planning) | Resource allocation, prioritization | Constructive review surface critical; flexible surfaces for negotiation |
| UI/UX (new flow, redesign) | Visual, user-facing | Show don't tell dominant; heavy use of mockups and flows |
| Technical (caching, API, service) | Performance, correctness | Evidence hierarchy key; benchmarks and data |
| Architectural (migration, new system) | Cross-team, high stakes | All foundation qualities at full depth |
| Process (code review, workflow) | People and habits | Constructive review surface critical; internal precedent matters |
| Quick decision (database, library) | Single choice, low ceremony | Evidence hierarchy via comparison table |

### Question 2: Who decides, and what are their concerns?

Model each reviewer when known:

| Reviewer Attribute | How to Identify | How It Shapes the Document |
|-------------------|----------------|--------------------------|
| Top 2-3 concerns | Ask, or infer from role | Address in first paragraph and approach section |
| Likely disposition | Supportive, neutral, skeptical | Skeptics need more evidence; supporters need less |
| Trusted evidence types | Data-driven? Precedent-driven? | Match evidence to reviewer preference |

**Fallback archetypes** (when specific reviewers are unknown):

| Archetype | Typical Concerns | Evidence Preference |
|-----------|-----------------|-------------------|
| Engineering lead | Feasibility, maintenance burden, tech debt | Internal precedent, benchmarks |
| Product manager | User impact, timeline, scope | User data, competitive analysis |
| Security reviewer | Attack surface, compliance, data handling | Standards, audit results |
| Executive | Cost, strategic alignment, risk | Business metrics, industry trends |

### Question 3: How big is the change?

| Change Size | Signal | Implication |
|-------------|--------|-------------|
| Incremental extension | Builds on existing pattern | Frame as continuation; evidence hierarchy anchors to precedent |
| Moderate departure | New approach to existing problem | Needs stronger evidence; preemptive rebuttals for "why not keep current approach" |
| Significant departure | New system, migration, paradigm shift | Strong criteria, evidence, and incremental blocking to make it digestible |

---

## Guardrails

Five rules that constrain tool application. Framed as what to do, not what to avoid.

### 1. Earn Urgency

Use cost-of-delay framing only when inaction has quantifiable cost. If the cost of waiting a month is negligible, frame the decision as low-pressure. Manufactured urgency triggers reactance (Brehm, 1966) — people resist when they feel their freedom to choose is being restricted.

### 2. Limit Pressure

Apply pressure only when the facts justify it. When cost, deadline, and dependency framing stack together, the reader stops evaluating the design and starts resisting the pressure.

### 3. Offer Genuine Flexibility

Mark areas as flexible only when you would genuinely accept the reviewer's alternative. If the "open question" has a predetermined answer, it is fake flexibility. Fake flexibility erodes trust when discovered, and it will be discovered.

### 4. Let the Dominant Type Lead

For hybrid designs (e.g., scope + architecture), classify by who approves. The approval authority determines the dominant design type. Pull at most 1-2 tools from the secondary type. Trying to fully address both types produces an unfocused document.

### 5. Make Scaffolding Invisible

Rewrite until the document reads as a clear design, not a persuasion exercise. The structure should feel like honest reasoning. Loss framing that feels manipulative, flexible surfaces that feel staged, or urgency that feels manufactured should be rewritten or removed.
