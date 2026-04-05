# ReviewDesign Workflow

**Purpose**: Evaluate an existing design document — first as a reader, then for content completeness, then for acceptance readiness. The best review feedback comes from reading as the audience would, not from evaluating against a grid.

**When to Use**:
- "Review this design", "critique", "what's missing"
- Evaluating someone else's design document
- Self-review before sharing a design with stakeholders

## Reference Material

- **Output Quality:** `../OutputQuality.md` — Format selection, density, macro-structure.
- **Design Principles:** `../Principles.md` — Foundation qualities, context recognition, guardrails.
- **Layer Toolbox:** `../Standards/LayerToolbox.md` — Situational tools (for checking layer appropriateness).

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

**Know Your Decision-Makers** — Does the document show awareness of who reviews it? Are reviewer concerns addressed? Is evidence matched to what decision-makers trust?

**Build on What Exists** — Is the design anchored to internal precedent? Does it frame itself as an extension rather than a departure where possible?

**Make It Easy to Say Yes** — Is the document structured to reduce friction? Are concerns addressed before they're raised? Is there a visual element? Does it end with a clear ask?

**Validate Before You Ask** — Does the document feel ready for circulation? Are blocking concerns addressed? Would a skeptical reader feel informed or sold to?

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

### Step 4: Acceptance Assessment

After the pillar checks, evaluate the document through the acceptance lens from `Principles.md`.

| Check | Evaluates |
|-------|-----------|
| **Foundation Present** | Are all 6 foundation qualities visible? Narrative framing, honest trade-offs, evidence hierarchy, co-creation tone, visual element, explicit ask. |
| **Layer Appropriateness** | Are situational tools appropriate for this design type and scale? Any over-application (too many Layer 3 tools for a Standard doc)? Any under-application (architectural design with no credibility tools)? Load `../Standards/LayerToolbox.md` for reference. |
| **Guardrail Compliance** | Any violations? Unearned urgency? Stacked pressure? Performative concessions? Visible scaffolding? |
| **Reviewer Fit** | If reviewers are known, does the document address their specific concerns with evidence they trust? |

### Step 5: Produce Feedback

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
| Know Your Decision-Makers | Strong / Adequate / Gaps | [Brief note] |
| Build on What Exists | Strong / Adequate / Gaps | [Brief note] |
| Make It Easy to Say Yes | Strong / Adequate / Gaps | [Brief note] |
| Validate Before You Ask | Strong / Adequate / Gaps | [Brief note] |

| Check | Status | Note |
|-------|--------|------|
| Self-Claim Follow-Through | OK / Contradictions | [Brief note] |
| Claim Credibility | OK / Unsubstantiated | [Brief note] |
| Visual Coverage | OK / Gaps | [Brief note] |
| Link Hygiene | OK / Issues | [Brief note] |

### Acceptance Assessment

| Check | Status | Note |
|-------|--------|------|
| Foundation Present | All 6 / Missing: [list] | [Brief note] |
| Layer Appropriateness | Appropriate / Over-applied / Under-applied | [Brief note] |
| Guardrail Compliance | Clean / Violations: [list] | [Brief note] |
| Reviewer Fit | Addressed / Gaps: [list] | [Brief note or "No reviewer info available"] |

### Feedback (Yes, if...)

1. **Yes, if** [condition] — [why this matters]
2. **Yes, if** [condition] — [why this matters]

### Strengths
- [What the design does well — reinforce good patterns]
```

The "Yes, if" frame assumes the design is moving forward and asks what it needs to be ready. This removes blocking dynamics and makes review collaborative.

---

## Calibration by Scale

- **Quick (ADR)**: Focus on reader experience and alternatives. Don't penalize for missing foundation qualities or acceptance assessment.
- **Standard**: Reader experience + all 4 pillars + Foundation Present and Guardrail Compliance from acceptance assessment. A Standard design doesn't need a review process section.
- **Full**: Reader experience + all 4 pillars + full acceptance assessment. Expect thorough alternatives, clear authority, and a review plan.

---

## Integration Notes

- **Load `Principles.md`** when you need the foundation qualities or guardrails for deeper grounding during evaluation
- **Load `Standards/LayerToolbox.md`** when checking layer appropriateness in Step 4
- After review, the author may use `CreateDesign` to revise, or `RecordDecision` to capture individual decisions surfaced during review
