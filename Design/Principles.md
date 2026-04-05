# Design Principles

**Purpose**: Context file containing the acceptance-oriented framework that grounds the Design skill. Organized as Foundation (always-on qualities) + Context Recognition + Guardrails (constraints). Loaded on-demand by workflows when deeper grounding is needed.

**Companion files** (loaded only when needed):
- `Standards/LayerToolbox.md` — Situational tools organized by cognitive phase. Loaded during CreateDesign Step 4.
- `Standards/OutputScience.md` — Research grounding for OutputQuality.md rules + full source attribution.

---

## The Foundation

Six always-on qualities applied to every design document. These are not "selected" — they are ambient properties of good design writing that handle 80% of acceptance work.

### 1. Narrative Framing

The opening sets the interpretive lens. A reviewer who encounters your frame first reads everything through it. Not neutral problem description — a compelling case for why this path is right, presented as the natural next step.

The first paragraph addresses the top blocking concern. The second builds momentum toward the approach. A reader who finishes the opening should already be leaning toward yes.

> "Pre-suasion is the practice of getting people sympathetic to your message before they experience it." — Robert Cialdini, *Pre-Suasion*

Bransford & Johnson (1972) demonstrated that providing the topic before the content produces roughly 2x recall. Frame first, detail second.

**Anti-pattern**: Neutral "background" openings that describe the situation without directing interpretation. The reader constructs their own frame — and it may work against you.

### 2. Honest Trade-offs

Showing what you rejected and why prevents derailment and builds trust through demonstrated intellectual honesty. Every alternative gets genuine consideration. The recommended option has acknowledged weaknesses.

In trial advocacy, disclosing weaknesses on direct examination ("disclose on direct") neutralizes them before cross-examination. The same principle applies: a reviewer who discovers a flaw you didn't mention loses trust in everything else you wrote.

> "One of the most important sections of a design doc." — Google Design Docs on the Alternatives Considered section

**Anti-pattern**: Alternatives that are obviously inferior straw men. If every rejected option looks bad, the comparison isn't honest — it's theater.

### 3. Evidence Hierarchy

Internal precedent > industry practice > external research. What your own org has done is the strongest anchor because it's simultaneously social proof, authority, and risk reduction.

| Evidence Type | Strength | Why |
|--------------|----------|-----|
| Internal precedent | Strongest | "We've done this before" — social proof + authority + proven feasibility |
| Industry practice | Strong | "Others do this" — social proof + external validation |
| External research | Moderate | "Studies show" — authority, but distant from your specific context |

Anchoring bias (Tversky & Kahneman, 1974): the first reference point disproportionately shapes evaluation. Lead with internal precedent when available.

> "A person's compliance with a request is often strongly influenced by knowing that others in the same situation have complied." — Cialdini on Social Proof

**Anti-pattern**: Leading with external research when internal precedent exists. Your own org's experience is more persuasive and more relevant.

### 4. Co-Creation Tone

People defend decisions they helped shape. "We" language and genuine concession surfaces transform "your proposal" into "our approach." Reviewers who feel like co-authors become advocates.

The IKEA effect: people value things more when they contributed to building them. Concession surfaces — areas deliberately left flexible for reviewer input — create ownership.

> "Separate the people from the problem. Focus on interests, not positions." — Fisher & Ury, *Getting to Yes*

Cialdini's Unity principle: people say yes to those they consider "one of us." Co-creation tone signals shared identity and shared goals.

**Anti-pattern**: "I propose" / "my design" language that positions the author against reviewers. Also: performative concessions where the "flexible" areas are actually locked down.

### 5. Show Don't Tell

The default is visual, not textual. For any structural content — system boundaries, data flows, state changes, option comparisons — the diagram is the primary communication and prose explains what the diagram can't show. People retain 80% more when presented visually (Mayer's multimedia learning principles).

Architectural or multi-component designs need 2-3 visuals. Even feature-level designs benefit from a flow chart or comparison table. Break large changes into smaller visual blocks that look incremental — discrete components feel manageable where monolithic transformation feels risky.

> "When words and visuals are presented together, people learn more deeply than from words alone." — Richard Mayer, *Multimedia Learning*

**Anti-pattern**: Prose-only designs for structural content (system boundaries, data flows, component relationships). If the reader has to mentally construct a diagram, the document has failed.

### 6. Explicit Ask

The document ends with a clear, specific request: approve, give feedback on X, decide between A and B. Not a summary — a decision request.

An ambiguous conclusion forces the reviewer to construct an action — and the easiest self-constructed action is "defer." Default bias (Samuelson & Zeckhauser, 1988): when no clear action is specified, people choose the status quo.

In trial advocacy, this is verdict construction — telling the jury exactly what verdict to reach and why.

> "Never leave the close to chance. Tell the decision-maker exactly what you're asking for." — Trial advocacy principle

**Anti-pattern**: Ending with a summary or "next steps" list that doesn't include a specific decision request. The reader finishes informed but uncommitted.

---

## Context Recognition

Before applying situational tools, understand the design situation. Three questions guide tool selection.

### Question 1: What kind of design is this?

| Design Type | Characteristics | Foundation Emphasis |
|------------|----------------|-------------------|
| Scope (next quarter planning) | Resource allocation, prioritization | Co-creation tone critical; concession surfaces for negotiation |
| UI/UX (new flow, redesign) | Visual, user-facing | Show don't tell dominant; heavy use of mockups and flows |
| Technical (caching, API, service) | Performance, correctness | Evidence hierarchy key; benchmarks and data |
| Architectural (migration, new system) | Cross-team, high stakes | All foundation qualities at full depth |
| Process (code review, workflow) | People and habits | Co-creation tone critical; social proof from industry |
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
| Significant departure | New system, migration, paradigm shift | Full Layer 2 + Layer 3 tools; incremental blocking to make it digestible |

---

## Guardrails

Five rules that constrain tool application. Framed as what to do, not what to avoid.

### 1. Earn Urgency

Use penalty framing only when inaction has quantifiable cost. If the cost of waiting a month is negligible, frame the decision as low-pressure. Manufactured urgency triggers reactance (Brehm, 1966) — people resist when they feel their freedom to choose is being restricted.

### 2. Limit Momentum Tools

Apply at most 1 Layer 3 tool at Quick or Standard scale. At most 2 at Full scale. When multiple momentum tools stack (penalty + scarcity + forcing mechanism together), the reader stops evaluating the design and starts resisting the pressure.

### 3. Offer Genuine Flexibility

Mark areas as concession surfaces only when you would genuinely accept the reviewer's alternative. If the "open question" has a predetermined answer, it's not a concession — it's manipulation. Fake flexibility erodes trust when discovered, and it will be discovered.

### 4. Let the Dominant Type Lead

For hybrid designs (e.g., scope + architecture), classify by who approves. The approval authority determines the dominant design type. Pull at most 1-2 tools from the secondary type. Trying to fully address both types produces an unfocused document.

### 5. Make Scaffolding Invisible

Rewrite until the document reads as a clear design, not a persuasion exercise. The techniques should be invisible — the document should feel like honest reasoning that naturally leads to approval. Loss aversion framing that feels manipulative, concession surfaces that feel staged, urgency that feels manufactured — rewrite or remove all of these.
