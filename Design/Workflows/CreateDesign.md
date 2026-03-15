# CreateDesign Workflow

**Purpose**: Walk through a structured design process that scales from standard feature designs to full architecture documents. Produces a concrete markdown design artifact.

**When to Use**:
- "Design doc", "write a design", "scope this feature", "proposal"
- Any request to produce a design document at Standard or Full scale
- If scale assessment yields Quick, redirect to `RecordDecision` workflow instead

## Reference Material

- **Output Quality:** `../OutputQuality.md` — Format selection, density, anti-AI patterns. **Read before producing any output in Step 4.**
- **Design Principles:** `../Principles.md` — 9 research-backed content patterns.

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

### Step 2: Understand (Problem-First)

The most important phase. Resist the urge to jump to solutions. The goal is to articulate the problem so clearly that the approach becomes obvious.

**Ask the user (use AskUserQuestion or conversational clarification):**

1. **What problem are we solving?** Not "what do we want to build" — what pain or gap exists?
2. **For whom?** Who experiences this problem? Who benefits from solving it?
3. **What's the current state?** What exists today? What happens if we do nothing?
4. **What's the appetite?** How much time/effort do we WANT to spend? (This is a constraint, not an estimate.)
5. **Who decides?** Who has final decision authority? Who needs to be consulted?
6. **Who will read this document?** A reviewer signing off, a peer giving feedback, an implementer, a future maintainer? If multiple audiences, what does each need?

The answer to question 6 shapes *how* the document is structured — not just what goes in it. A document for a reviewer should lead with the approach and trade-offs. A document for an implementer should lead with the technical details. A document for both needs explicit boundaries so each reader knows where to stop. (See Principles.md, Pattern 9.)

**Synthesize into a Problem Statement** using the Design Thinking POV format:

> **[WHO]** needs **[WHAT]** because **[WHY / INSIGHT]**

This single sentence should pass the "would a stranger understand this?" test.

**One-Sentence Mission Test**: The entire design's purpose must fit in this single POV sentence. If it can't, the scope is too broad — consider splitting into multiple designs or reducing to Quick scale.

**Output**: Problem statement + context summary

---

### Step 3: Explore (Diverge)

Generate and evaluate alternatives. The goal is NOT to find the right answer — it's to map the solution space so the eventual choice is informed.

**For each plausible approach:**
- What would we gain?
- What would we lose?
- What assumptions does it make?
- What's the biggest risk?

**Also identify:**
- **Rabbit holes** — specific areas of technical risk or complexity worth calling out explicitly, so implementers don't get pulled in
- **Non-goals** — things that are reasonably possible but deliberately excluded. State these explicitly with a brief rationale for each.
- **Prior art** — has this been solved before, internally or externally? What can we learn?

**Output**: Alternatives matrix + non-goals list + rabbit holes

---

### Step 4: Define (Converge)

Synthesize the exploration into a concrete design. This is where the actual artifact takes shape.

**Before writing, read `../OutputQuality.md`** — especially the Section Selection table (section 3) and the Section Format Defaults (section 1).

**Select sections dynamically.** Do not produce all template sections and compress — select which sections to include based on the Section Selection table in OutputQuality.md. For each "Could" section, evaluate: does this section carry specific, non-obvious information for *this particular design*? If not, omit it entirely. Empty or generic sections are worse than absent ones.

**Output**: The design document using the template below, with only the selected sections.

**Word Budgets**: Apply these constraints to prevent open-ended generation. Budgets are ceilings, not targets — shorter is better.

| Section | Budget (Standard) | Budget (Full) |
|---------|-------------------|---------------|
| Problem | 30–75 words | 50–150 words |
| Current State | 50–100 words | 75–200 words |
| Appetite | 1 sentence | 1–2 sentences |
| Goals | 3–7 bullets, ≤15 words each | 5–10 bullets, ≤15 words each |
| Non-Goals | 2–5 bullets, ≤15 words each | 3–7 bullets, ≤15 words each |
| Approach | 100–300 words | 300–600 words |
| Alternatives Considered | Table, ≤2 sentences per cell | Table, ≤2 sentences per cell |
| Risks & Rabbit Holes | 3–7 bullets, ≤20 words each | 5–10 bullets, ≤20 words each |
| User Impact | 30–75 words | 50–150 words |
| Open Questions | 3–7 items | 5–10 items |
| Decision Log | Table rows as needed | Table rows as needed |
| **Total document** | **500–1000 words** | **1000–2500 words** |

Exceeding a section budget requires justification tied to content complexity, not thoroughness.

---

### Step 4.5: Validate Output Quality

Auto-chain the `ValidateOutput` workflow:
- `artifact`: the completed design document from Step 4
- `scale`: the assessed scale from Step 1

Fix any FAIL results before delivery.

The validation now includes Compression and Coherence checks. Compression failures (unfalsifiable sentences, predictable-from-heading sentences, duplicate facts) must be fixed before delivery — they are the most common source of AI-generated bloat.

---

### Step 5: Review (Full Scale Only)

Structure feedback using the "Yes, if" framing — objections are constructive contributions, not blockers.

**Process:**
1. Identify reviewers based on the decision authority established in Step 2
2. Present the design document
3. Collect feedback framed as "Yes, if [condition]" rather than "No, because [objection]"
4. Capture outstanding concerns and resolution path
5. Record final decisions with rationale in the decision log
6. Set a revisit date if the design has time-sensitive assumptions

**Output**: Updated design document with review feedback incorporated + decision log entries

---

## Output Template

The artifact this workflow produces. **Include only sections selected per OutputQuality.md section 3.** Skip sections that aren't relevant — the template is a menu, not a checklist.

```markdown
# Design: [Title]

**Date**: [date]  |  **Status**: Draft / In Review / Accepted  |  **Scale**: Standard / Full
**Author**: [name]  |  **Decider**: [name/role]

## Problem
[WHO needs WHAT because WHY — the POV statement]

## Current State
[What exists today, what's broken/missing]

## Appetite
[How much time/effort we want to spend — the constraint, not an estimate]

## Goals
- [Specific, measurable goals]

## Non-Goals
- [Things we COULD do but are deliberately NOT doing, with brief rationale]

## Approach
[The actual design — technical details, user flow, architecture, whatever is appropriate to the problem]

## Alternatives Considered
| Option | Pros | Cons | Why Not |
|--------|------|------|---------|
| [Alternative A] | ... | ... | ... |
| [Alternative B] | ... | ... | ... |
| [Do nothing] | ... | ... | ... |

## Risks & Rabbit Holes
- [Known technical risks or complexity traps to timebox or avoid]

## User Impact
[What changes for end users — or "No user-facing changes"]

## Open Questions
- [Unresolved items that need answers before/during implementation]

## Decision Log
| Decision | Rationale | Date |
|----------|-----------|------|
| [What we decided] | [Why, including what we traded away] | [When] |
```

---

## Scale Adaptations

### Standard Scale
- Skip Step 5 (Review) unless the user requests it
- Use the template flexibly — include only sections that pass the Section Selection table
- Appetite and Decision Log are still important even at this scale
- Aim for 500-1000 words total (see word budgets in Step 4)

### Full Scale
- All 5 steps including structured review
- Template used comprehensively
- Consider producing individual ADRs (via `RecordDecision`) for key decisions within the design
- Aim for 1000-2500 words total (see word budgets in Step 4). The constraint forces prioritization — the reader's time is the scarce resource, not your output capacity.

---

## Integration Notes

- **From RecordDecision**: Quick-scale assessments redirect there instead
- **From ReviewDesign**: Existing designs can be evaluated against the 4 Pillars
- **To RecordDecision**: Full-scale designs may spawn individual ADRs for key decisions
- **Load `Principles.md`** when deeper grounding is needed on any specific pattern
