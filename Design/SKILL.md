---
name: Design
description: Design document methodology for any scale. USE WHEN design doc, design brief, scoping document, product brief, architecture decision, RFC, technical design, design review, scope a feature, write a proposal, record a decision. Guides agents through criteria-first design and constructive review from quick ADRs to full architecture docs.
context: fork
compatibility: Designed for Claude Code and Devin (or similar agent products)
metadata:
  author: pai
  version: "3.0.0"
---

## Customization

**Before executing, check for user customizations at:**
`$PAI_DIR/skills/PAI/USER/SKILLCUSTOMIZATIONS/Design/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.


# Design Skill

**Axiom: A design document exists to make a specific decision obvious, reviewable, and easy to revisit.**

Writing is still thinking — but the thinking is oriented toward decision quality: define what matters, show what is changing, and make the right trade-off easy to discuss. This skill guides agents through producing designs that are clear, honest, and structured for review — at any scale from a quick ADR to a full architecture document.

## The 6 Pillars

Every great design document achieves these six things. They serve as both the creation guide and the review lens — but they are a lens, not a checklist.

1. **Define the Decision Spine** — State the decision boundary, owner, criteria, assumptions, and revisit triggers before recommending an option. Criteria are the filter that keeps review constructive.
2. **Ask Before Inventing** — When users, user value, factual context, scale, or criteria are underdetermined, ask labeled questions that explain why the answer matters. Unknowns become assumptions or open questions, not facts.
3. **Know Your Decision-Makers** — Before writing, understand who reviews, what concerns them, and what evidence they trust. Clarity serves reviewer understanding, not abstract completeness.
4. **Build on What Exists** — Anchor to internal precedent. Frame designs as extensions, not departures. The strongest evidence is "we've done this before."
5. **Make It Easy to Decide** — Use structure, visuals, and scoped sections to reduce review friction. Show don't tell. Break big changes into reviewable blocks. Address likely concerns without turning the doc into a sales pitch.
6. **Validate Before Review** — Don't circulate a design until you've checked: are blocking concerns addressed, claims grounded, criteria explicit, and revisit conditions clear?

The pillars check *content*. Equally important is *structure*: does the document serve its reader? Is information organized by what the reader needs, not by what the author discovered? When a document serves multiple audiences, are there clear stopping points?

See `Principles.md` for the decision spine and review-oriented framework (Foundation + Context Recognition + Guardrails).

## Scale Selector

**Default to the lightest appropriate scale.** The key anti-rigidity mechanism — small things should feel lightweight, not bureaucratic.

| Scale | When | Workflow | Output |
|-------|------|----------|--------|
| **Quick** | Bug fix, small UI change, single decision | RecordDecision | 1-page ADR |
| **Standard** | Feature, workflow, medium scope | CreateDesign (phases 1-4) | Design document |
| **Full** | Architecture, new system, multi-week initiative | CreateDesign (all 5 phases) | Full design + ADRs |

Assess scale from context and suggest — but the user can override. When in doubt, go lighter.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

**When executing a workflow, output this notification directly:**

```
Running the **WorkflowName** workflow in the **Design** skill to ACTION...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **CreateDesign** | "design doc", "scope a feature", "write a proposal" | `Workflows/CreateDesign.md` |
| **ReviewDesign** | "review this design", "critique", "what's missing" | `Workflows/ReviewDesign.md` |
| **RecordDecision** | "record a decision", "write an ADR", "capture a decision" | `Workflows/RecordDecision.md` |
| **ValidateOutput** | "validate design output", "check output quality" | `Workflows/ValidateOutput.md` |

## Context Files

| File | Purpose |
|------|---------|
| `Principles.md` | Decision spine, foundation qualities, context recognition, guardrails |
| `Standards/LayerToolbox.md` | Situational review-support tools (Grounding, Structure, Timing) |
| `Standards/OutputScience.md` | Research grounding for output rules + full source attribution |
| `OutputQuality.md` | Format selection, density, macro-structure, anti-AI patterns — how to render output |

## Examples

### Example 1: Quick Decision
```
User: "We decided to use PostgreSQL instead of MongoDB for the user service.
       Record this decision."

→ Invokes RecordDecision workflow
→ Asks clarifying questions about context and alternatives
→ Produces a 1-page ADR with context, decision, consequences
```

### Example 2: Standard Feature Design
```
User: "I need to design the notification preferences page for our app"

→ Invokes CreateDesign workflow at Standard scale
→ Walks through: Understand context → define criteria → build case → draft for review → validate
→ Outputs a structured design doc with decision criteria, approach, alternatives, and explicit ask
```

### Example 3: Full Architecture Design
```
User: "We need to redesign our authentication system to support SSO"

→ Invokes CreateDesign workflow at Full scale
→ All 5 phases including pre-review readiness check
→ Outputs comprehensive design + individual ADRs for key decisions
```

## Anti-Patterns

What this skill explicitly avoids:

- **Template Worship** — Filling in sections for the sake of completeness. Empty sections should be omitted, not left blank. The template is a guide, not a checklist.
- **Scope Creep** — The design doc becoming the project. A design should clarify decisions, not replace implementation planning.
- **Over-Specification** — Boxing in implementers with premature detail. Leave room for implementation judgment.
- **Missing the "Why Not"** — Designs that show what was chosen but not what was rejected. Capture rejected alternatives when they explain an important trade-off or would otherwise resurface in review.
- **Criteria After Recommendation** — Picking an option first, then inventing criteria that make it look inevitable. Criteria must be defined before options are evaluated.
- **Invented Intent** — Filling in users, user goals, current-state pain, or priorities from plausible domain guesses. Ask or label assumptions.
- **Unbounded Review Surface** — Letting every concern enter the decision discussion. Feedback should connect to the decision criteria, load-bearing assumptions, or explicit non-goals; everything else moves async or to a follow-up decision.
- **Author-Ordered Structure** — Organizing the document by the order you figured things out, rather than by what the reader needs. The reader shouldn't have to do the work of figuring out what matters.
- **Verbose Prose Where Tables Work** — Using paragraphs to describe what a table could show in half the space. If the data has items x attributes, use a table.
- **Unfalsifiable Claims** — Sentences that cannot be wrong carry zero information. "This approach has several advantages" is true of every approach ever proposed. State the specific advantage with a number, or delete the sentence.
- **Setup Paragraphs** — Opening a section by restating the heading in prose form. "In this section, we will discuss the security implications of..." → delete and start with the actual security finding.
- **Circular Elaboration** — Saying the same thing multiple times in different words across a section. Each sentence sounds fine alone; together they make no progress. Keep the best phrasing, delete the rest.
- **Completeness Over Signal** — Including information because it might be relevant rather than because the reader needs it. If four of five points are obvious, include only the one that isn't. Missing information is recoverable; wasted attention is not.
- **Technically Right, Review-Hostile** — Sound design that ignores reader needs. A design can be correct on every technical dimension and still fail because reviewers cannot see the problem, criteria, trade-offs, or change.
- **Agreement Over Correctness** — Optimizing for yes instead of making the correct decision low-friction. Approval should follow from a clear decision spine, not from pressure.
- **Review Support as a Sledgehammer** — Applying every framing tool at max intensity; the document reads as a sales pitch. If the scaffolding is visible, the technique has failed.
- **Audience-Blind Writing** — Producing a document without knowing who approves it. Default archetypes exist as a fallback, but named reviewers with mapped concerns produce stronger designs.

---

**Attribution**: Methodology synthesized from Google Design Docs, Amazon Working Backwards, Shape Up, ADRs (Nygard), Rust RFCs, Stripe writing culture, Phil Calcado's Structured RFC, Squarespace "Yes, if", Klaviyo "Always Write Something", Design Thinking (Stanford d.school, NNGroup), PRD best practices (Atlassian, Product School), Zinsser (On Writing Well), Fisher/Ury (Getting to Yes), Kahneman/Tversky (Prospect Theory), and Brehm (Reactance Theory).
