---
name: Design
description: Design document methodology for any scale. USE WHEN design doc, design brief, scoping document, product brief, architecture decision, RFC, technical design, design review, scope a feature, write a proposal, record a decision. Guides agents through problem-first, trade-off-visible design that scales from quick decisions to full architecture docs.
context: fork
compatibility: Designed for Claude Code and Devin (or similar agent products)
metadata:
  author: pai
  version: "2.0.0"
---

## Customization

**Before executing, check for user customizations at:**
`$PAI_DIR/skills/PAI/USER/SKILLCUSTOMIZATIONS/Design/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.


# Design Skill

Writing is thinking, not documentation. A design document is a *thinking tool* that forces clarity before commitment and a *communication artifact* that serves its reader, not its author. This skill guides agents through producing designs that make problems clear, trade-offs visible, and decisions recoverable — at any scale from a quick ADR to a full architecture document.

## The 4 Pillars

Every great design document achieves these four things. They serve as both the creation guide and the review lens — but they are a lens, not a checklist.

1. **Force Clarity on the Problem** — Articulate the problem before jumping to solutions. If you can't write a clear problem statement, you don't understand the problem yet.
2. **Make Trade-offs Visible** — Show what was rejected and why. The "why not" is as important as the "why."
3. **Create Feedback Loops** — Structured review before commitment catches blind spots and builds shared understanding.
4. **Serve as Organizational Memory** — Optimize for the person who wasn't in the room, including future you.

The pillars check *content*. Equally important is *structure*: does the document serve its reader? Is information organized by what the reader needs, not by what the author discovered? When a document serves multiple audiences, are there clear stopping points? See Principles.md, Pattern 9.

See `Principles.md` for the full research-backed framework (9 patterns from 12 methodologies).

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
| `Principles.md` | 9 research-backed content patterns — what to include and how to structure designs |
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
→ Walks through: Understand problem → Explore alternatives → Define scope → Produce document
→ Outputs a structured design doc with goals, non-goals, approach, alternatives considered
```

### Example 3: Full Architecture Design
```
User: "We need to redesign our authentication system to support SSO"

→ Invokes CreateDesign workflow at Full scale
→ All 5 phases including stakeholder review planning
→ Outputs comprehensive design + individual ADRs for key decisions
```

## Anti-Patterns

What this skill explicitly avoids:

- **Template Worship** — Filling in sections for the sake of completeness. Empty sections should be omitted, not left blank. The template is a guide, not a checklist.
- **Scope Creep** — The design doc becoming the project. A design should clarify decisions, not replace implementation planning.
- **Over-Specification** — Boxing in implementers with premature detail. Leave room for implementation judgment.
- **Missing the "Why Not"** — Designs that show what was chosen but not what was rejected. Alternatives Considered is not optional.
- **Author-Ordered Structure** — Organizing the document by the order you figured things out, rather than by what the reader needs. The reader shouldn't have to do the work of figuring out what matters.
- **Verbose Prose Where Tables Work** — Using paragraphs to describe what a table could show in half the space. If the data has items x attributes, use a table.
- **Unfalsifiable Claims** — Sentences that cannot be wrong carry zero information. "This approach has several advantages" is true of every approach ever proposed. State the specific advantage with a number, or delete the sentence.
- **Setup Paragraphs** — Opening a section by restating the heading in prose form. "In this section, we will discuss the security implications of..." → delete and start with the actual security finding.
- **Circular Elaboration** — Saying the same thing multiple times in different words across a section. Each sentence sounds fine alone; together they make no progress. Keep the best phrasing, delete the rest.
- **Completeness Over Signal** — Including information because it might be relevant rather than because the reader needs it. If four of five points are obvious, include only the one that isn't. Missing information is recoverable; wasted attention is not.

---

**Attribution**: Methodology synthesized from Google Design Docs, Amazon Working Backwards, Shape Up, ADRs (Nygard), Rust RFCs, Stripe writing culture, Phil Calcado's Structured RFC, Squarespace "Yes, if", Klaviyo "Always Write Something", Design Thinking (Stanford d.school, NNGroup), PRD best practices (Atlassian, Product School), and Zinsser (On Writing Well).
