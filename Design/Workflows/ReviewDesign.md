# ReviewDesign Workflow

**Purpose**: Evaluate an existing design document — first as a reader, then for content completeness. The best review feedback comes from reading as the audience would, not from evaluating against a grid.

**When to Use**:
- "Review this design", "critique", "what's missing"
- Evaluating someone else's design document
- Self-review before sharing a design with stakeholders

## Reference Material

- **Output Quality:** `../OutputQuality.md` — Format selection, density, macro-structure.
- **Design Principles:** `../Principles.md` — 9 research-backed content patterns.

---

## Process

### Step 1: Read as the Intended Audience

Read the full document, but read it as the person who will actually receive it — not as an evaluator. Note the scale (Quick/Standard/Full) and calibrate expectations accordingly.

While reading, pay attention to your own experience:
- At what point did you understand the core idea?
- Where did your attention drift?
- What questions came up that the document didn't answer?
- Was there a natural stopping point, or did you have to read everything to get the picture?

### Step 2: Identify the Audience and Assess Structure

Before checking content, ask the structural question: **does this document serve the person reading it?**

- **Who is the primary reader?** A decision-maker, a peer reviewer, an implementer, a future maintainer?
- **What does that reader need to decide or understand?** Sign off on an approach? Understand trade-offs? Know where to start coding?
- **Does the document structure match that need?** Is the most important information early? Can the reader stop at a reasonable point and still have what they need?
- **If the document serves multiple audiences**, are they separated with clear boundaries? A reviewer shouldn't have to read implementation details. An implementer shouldn't have to re-derive the design from scattered hints.

The strongest signal of an author-structured document: it's thorough but exhausting. Everything is there, nothing is foregrounded.

### Step 3: Check Content Against the 4 Pillars

Now evaluate content completeness. Use the pillars as a lens, not a checklist — not every pillar demands a section, and a document can satisfy a pillar without naming it.

**Problem Clarity** — Is the problem stated without jumping to the solution? Would someone outside the team understand what this solves?

**Trade-off Visibility** — Are alternatives shown, including "do nothing"? For each rejected alternative, do we know why? Are costs of the chosen approach acknowledged?

**Feedback Loop** — Are there open questions that need answers? Is decision authority clear?

**Organizational Memory** — Would a new team member understand why these decisions were made? Will this still make sense in 6 months?

#### Rendering Quality (via OutputQuality.md)

Read `../OutputQuality.md` and evaluate:
- Does each section use the correct format for its data shape?
- Is there unnecessary density? Can paragraphs be compressed?
- Are there AI writing patterns? (banned vocabulary, structural patterns)
- Do headers tell the story by themselves? (layer-cake test)
- Is the macro-structure right? (narrative lead, audience separation, stopping points)

#### Self-Claim Verification

Extract what the design says about itself — its declared scope, self-imposed constraints, stated policies, and exclusions. Then check follow-through. A violation of a self-claim is a stronger finding than a missing best practice. If the design says "We will not support X" but the approach section includes X, that's a contradiction worth flagging.

#### Claim Credibility Check

Categorize each significant claim by strength and check evidence expectations:

| Claim Type | Example | Expected Evidence |
|-----------|---------|-------------------|
| **Planning intent** | "We plan to migrate to X" | Rationale sufficient — no artifact needed |
| **Design-level rule** | "All API endpoints require auth" | Referenced in approach section or constraints |
| **Implemented-state assertion** | "The service handles 10K req/s" | Must trace to a benchmark, test, or measured data |

Flag any implemented-state assertion that lacks traceable evidence. Planning intent with only rationale is fine.

#### Visual Assessment

For structural content (system boundaries, data flows, component relationships, state machines), check: would a diagram communicate this faster than prose? If yes and no diagram exists, note it as a gap. If a diagram exists, check that labels reference real identifiers, not abstractions like "Data Layer."

#### Link Hygiene

For any external references (URLs, doc links, ADR references):
- Does the link have a purpose label? ("See RFC-42 for the auth decision" not just "See RFC-42")
- Is the critical information from the link summarized in-doc? A reader shouldn't need to open an external link to understand the design.

### Step 4: Produce Feedback

Lead with the reader-experience finding — that's what makes the document better to receive, not just more complete. Use "Yes, if" framing for gaps.

**Before writing feedback, verify your own findings:** For each finding that references a specific file, section, or claim — confirm it actually exists in the document. Do not produce findings based on sections you assumed were there. This prevents hallucinated review feedback.

**Output format:**

```markdown
## Design Review: [Design Title]

**Reviewed by**: [name/agent]  |  **Date**: [date]

### Reader Experience
[2-3 sentences: How does this document read? Does the structure serve the audience? Where does attention drift? What's the core idea, and how quickly does the reader reach it?]

### Content Assessment

| Pillar | Status | Note |
|--------|--------|------|
| Problem Clarity | Strong / Adequate / Gaps | [Brief note] |
| Trade-off Visibility | Strong / Adequate / Gaps | [Brief note] |
| Feedback Loop | Strong / Adequate / Gaps | [Brief note] |
| Organizational Memory | Strong / Adequate / Gaps | [Brief note] |

| Check | Status | Note |
|-------|--------|------|
| Self-Claim Follow-Through | OK / Contradictions | [Brief note] |
| Claim Credibility | OK / Unsubstantiated | [Brief note] |
| Visual Coverage | OK / Gaps | [Brief note] |
| Link Hygiene | OK / Issues | [Brief note] |

### Feedback (Yes, if...)

1. **Yes, if** [condition] — [why this matters]
2. **Yes, if** [condition] — [why this matters]

### Strengths
- [What the design does well — reinforce good patterns]
```

The "Yes, if" frame assumes the design is moving forward and asks what it needs to be ready. This removes blocking dynamics and makes review collaborative.

---

## Calibration by Scale

- **Quick (ADR)**: Focus on reader experience and alternatives. Don't penalize for missing sections.
- **Standard**: Reader experience + all 4 pillars at moderate expectations. A Standard design doesn't need a review process section.
- **Full**: Reader experience + all 4 pillars at full depth. Expect thorough alternatives, clear authority, and a review plan.

---

## Integration Notes

- **Load `Principles.md`** when you need the 9 patterns for deeper grounding during evaluation — especially Pattern 9 (Structure for the Reader) for structural feedback
- After review, the author may use `CreateDesign` to revise, or `RecordDecision` to capture individual decisions surfaced during review
