# SkillIntent — Design

> **For agents modifying this skill:** Read this before making any changes.

## First Principles

1. **Problem Before Solution** — Articulate the problem before jumping to solutions. Writing is the thinking tool, not the documentation step.
2. **Trade-offs Over Choices** — Show what was rejected and why. The "why not" is as important as the "why."
3. **Reader Over Author** — A design document serves the person reading it, not the person writing it. Structure by what the reader needs, not by what the author discovered.
4. **Density Over Verbosity** — Use the minimum words needed to convey the full meaning. Prose requires justification; tables and lists are the default.
5. **Scale-Appropriate Ceremony** — Small things should feel lightweight. Default to the lightest appropriate scale.
6. **Standalone Operation** — This skill operates independently with no coupling to other skills.

## Problem This Skill Solves

Without this skill, design work suffers from five failure modes:
- **Fuzzy problem definitions** — Teams jump to solutions without articulating what problem they're solving
- **Invisible trade-offs** — Decisions look arbitrary because rejected alternatives aren't captured
- **Lost rationale** — Six months later, nobody knows why a decision was made
- **Author-structured documents** — The document captures everything the author knows but is organized by discovery order, not reader need. Thorough but exhausting. Reviewers disengage before reaching the key decisions.
- **AI verbosity** — Agent-generated output uses prose where tables work, banned AI vocabulary, and excessive word count, requiring manual cleanup

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|----------|----------------|----------------------|-----|
| Scale selector | 3 tiers (Quick/Standard/Full) | Single format, 5 tiers | Matches real decision sizes without over-granularity |
| Output quality rules | Standalone `OutputQuality.md` | Reference ClarityEngine's Philosophy.md | No coupling between skills — Design must be self-contained |
| Template format hints | Reference file with hardened load wording | Inline HTML comments per section | Avoids duplication since ReviewDesign also needs the rules |
| Density stance | Strong density-first (prose requires justification) | Balanced or light touch | Verbose prose is the #1 iteration trigger from user feedback |
| Self-validation | Shared `ValidateOutput.md` mini-workflow | Step within CreateDesign only | Reusable across CreateDesign, RecordDecision, ReviewDesign |
| Content boundary | Principles.md = what to include + why; OutputQuality.md = how to render | Single merged file | Keeps Principles as philosophy, OutputQuality as compact rules |
| Section selection | MoSCoW per scope (Must/Should/Could) in OutputQuality.md | All sections always included | Irrelevant sections actively harm comprehension (expertise reversal effect) |
| Rules format | One-liner rules, philosophy in Principles.md | Verbose rules with inline rationale | Structural constraints beat behavioral instructions for LLMs |

## Explicit Out-of-Scope

- **Document rendering** — Visual formatting, PDF/DOCX conversion, presentation layout (ClarityEngine's domain)
- **Code review** — Reviewing implementation against a design (CodeReview's domain)
- **ClarityEngine coupling** — No imports, references, or dependencies on ClarityEngine files
- **Implementation planning** — The design clarifies decisions; it does not replace project planning

## Success Criteria

1. CreateDesign output passes all 7 ValidateOutput checks without manual intervention
2. Every template section uses the correct format per OutputQuality.md's Section Format Defaults
3. Users do not need to ask "put this in table format" after receiving a design artifact
4. Only sections relevant to the specific design are included — no generic filler
5. ReviewDesign leads with reader experience before checking content completeness
6. Design documents have a clear primary audience, and multi-audience documents have explicit stopping points

## Constraints

- `OutputQuality.md` is standalone — no references to ClarityEngine files
- `ValidateOutput.md` is advisory and fix-before-delivery — not a blocking gate
- `Principles.md` covers content (what to include) and philosophy (why the rules exist); `OutputQuality.md` covers rendering (how to format) — no overlap
- The output template is a menu, not a checklist — sections are selected by relevance, not included by default
