# Rule Traceability

> Provenance record mapping all 54 PresentationForge rules to ClarityEngine checkpoints.
> This file preserves the distillation lineage — which rules became which checkpoints,
> and which were absorbed into model knowledge.
>
> Reference artifact. Not loaded during normal workflow execution.

---

## Principles

| ID | Principle |
|----|-----------|
| P1 | Layman First, Expert Second (Inverted Pyramid + Section Independence) |
| P2 | Evidence Over Assertion (Trust Through Specificity) |
| P3 | Bridge to the Known (Cross-Domain Connection + First Principles) |
| P4 | Density Over Completeness (Human Time is the Bottleneck) |

The inverted pyramid is the umbrella frame: P1 orders the document and restarts at section level. Structural formatting rules (subheadings, chunking, type sizes) are enforced via RC checkpoints under P1.

## Checkpoints

| ID | Checkpoint | Primary Principle |
|----|-----------|-------------------|
| RC-1 | Flesch 60-70 summaries, 15-20 word avg sentences | P1 |
| RC-2 | Jargon defined on first use, acronyms expanded | P1 |
| RC-3 | Subheadings every 100-150 words, max 4 heading levels | P1 |
| RC-4 | Section anchors on H2/H3, sticky ToC for long docs | P1 |
| RC-5 | Each section begins with its takeaway; support and detail follow | P1 |
| RC-6 | No empty/generic headings, every heading describes content | P1 |
| RC-7 | Specific examples in every major section, uncertainty marked | P2 |
| RC-8 | 3-5 chunks per group, 3-5 groups per heading level | P1 |
| RC-9 | Key info in headings + bold + bullets (70% comprehension rule) | P1 |
| RC-10 | Max 3 type sizes, no decorative elements without info value | P1 |
| RC-11 | Real identifiers from source in diagrams, no abstract labels | P2 |
| RC-12 | Self-contained diagrams: title, legend, max 20 elements | P2 |
| RC-13 | Claims traceable to source, data flows with actual types | P2 |
| RC-14 | WCAG AA contrast, colorblind-safe, consistent color semantics | P2 |
| RC-15 | Code: syntax highlighting, monospace, no horiz scroll, distinct bg | P2 |
| RC-16 | Falsifiability gate — every sentence must make a claim that could be wrong | P4 |
| RC-17 | No sentence predictable from heading alone | P4 |
| RC-18 | State Once — no fact in more than one section | P4 |
| RC-19 | Hard limits: ≤25 words/sentence, ≤6 sentences/paragraph, ≤7 items/list | P4 |
| RC-20 | No banned meta-commentary | P4 |
| RC-21 | First principles or assumptions stated before detailed content | P3 |
| RC-22 | At least one cross-domain bridge to audience's existing knowledge | P3 |
| RC-23 | Specific question or gap being addressed is explicit | P3 |

---

## ReadabilityStandards.md Mapping (33 Rules)

| Rule ID | Rule Name | Mapped To | Notes |
|---------|-----------|-----------|-------|
| T1 | Minimum Body Text Size (16px) | RC-1 (P1) | Absorbed into readability baseline |
| T2 | Line Length (45-80ch) | RC-1 (P1) | Absorbed into readability baseline |
| T3 | Line Height (1.5x) | Model knowledge | CSS implementation detail — any competent AI knows 1.5x line height |
| T4 | Paragraph Spacing (2x) | Model knowledge | CSS implementation detail — standard paragraph spacing |
| T5 | Letter/Word Spacing | Model knowledge | CSS implementation detail — WCAG text spacing values |
| T6 | Text Resizability (200%) | Model knowledge | Accessibility implementation detail — use relative units |
| C1 | Contrast Ratio AA (4.5:1) | RC-14 (P2) | Concrete threshold preserved |
| C2 | Enhanced Contrast AAA (7:1) | RC-14 (P2) | Target threshold preserved |
| C3 | Maximum Distinct Colors (7-8) | RC-10 (P1) | Absorbed into visual restraint |
| C4 | No Red-Green Only Encoding | RC-14 (P2) | Accessibility constraint preserved |
| C5 | Consistent Color Coding | RC-14 (P2) | Semantic consistency preserved |
| H1 | Single H1 Per Document | RC-3 (P1) | Heading hierarchy preserved |
| H2 | No Skipped Heading Levels | RC-3 (P1) | Heading hierarchy preserved |
| H3 | Maximum Nesting Depth (4 levels) | RC-3 (P1) | Concrete limit preserved |
| H4 | Descriptive Heading Text | RC-6 (P1) | No empty or generic headings |
| IA1 | Chunking (Miller's Law) | RC-8 (P1) | 3-5 chunks preserved |
| IA2 | Progressive Disclosure | RC-5 (P1) | Section-level lead-first ordering preserved |
| IA3 | F-Pattern Compatibility | RC-9 (P1) | Key info positioning preserved |
| IA4 | Visual Hierarchy through Proximity | RC-8 (P1) | Proximity grouping preserved |
| WS1 | Macro White Space (800px max) | Model knowledge | CSS implementation detail — standard content width |
| WS2 | Breathing Room Between Sections | Model knowledge | CSS implementation detail — standard section spacing |
| N1 | Sticky Table of Contents | RC-4 (P1) | Navigation preserved |
| N2 | Active Section Highlighting | RC-4 (P1) | Navigation preserved |
| N3 | Back-to-Top Affordance | RC-4 (P1) | Navigation preserved |
| N4 | Section Anchors | RC-4 (P1) | Deep linking preserved |
| D1 | Element Count per Diagram (max 20) | RC-12 (P2) | Diagram constraint preserved |
| D2 | Diagram Title and Legend | RC-12 (P2) | Self-contained diagrams |
| D3 | Self-Contained Diagrams | RC-12 (P2) | Independence preserved |
| D4 | Layered Abstraction (C4 Zoom) | RC-12 (P2) | Multi-level preserved |
| D5 | Diagram Text Readability | RC-14 (P2) | Contrast in diagrams |
| D6 | Diagram Accessibility (SVG a11y) | Model knowledge | SVG accessibility implementation detail |
| CL1 | Coherence Principle | RC-10 (P1) | No decorative elements |
| CL2 | Spatial Contiguity Principle | RC-8 (P1) | Related elements grouped |
| CL3 | Signaling Principle | RC-9 (P1) | Visual emphasis preserved |
| CL4 | Data-Ink Ratio (Tufte) | RC-10 (P1) | Maximize information density |
| CL5 | Visual-First Communication | P1 core tenet | Elevated to principle level: visual hierarchy makes information order legible. |
| CL6 | Escalating Abstraction | RC-5 (P1) | Section-level depth layering preserved |
| CP1 | Syntax Highlighting | RC-15 (P2) | Code presentation |
| CP2 | Monospace Font for Code | RC-15 (P2) | Code presentation |
| CP3 | Code Block Line Length (80ch) | RC-15 (P2) | Code presentation |
| CP4 | Code Block Contrast | RC-15 (P2) | Code presentation |

---

## CodebaseAnalysisStandards.md Mapping (21 Rules)

| Rule ID | Rule Name | Mapped To | Notes |
|---------|-----------|-----------|-------|
| CA1 | Boundary Identification | RC-12 (P2) | Diagram constraint |
| CA2 | Data Flow with Type Annotations | RC-13 (P2) | Evidence with real types |
| CA3 | Dependency Direction | RC-12 (P2) | Diagram clarity |
| CA4 | Layer Identification | RC-12 (P2) | Architecture layers |
| CA5 | Problem Callouts | RC-9 (P1) | Visual distinction for findings |
| BC1 | Named Boundaries | RC-11 (P2) | Real identifiers |
| BC2 | Internal vs External Distinction | RC-12 (P2) | Visual distinction |
| BC3 | Responsibility Summaries | RC-11 (P2) | Source-grounded labels |
| DF1 | End-to-End Data Flows | RC-13 (P2) | Evidence through specifics |
| DF2 | Transformation Labels | RC-13 (P2) | Evidence through specifics |
| DF3 | Async vs Sync Distinction | RC-12 (P2) | Visual distinction |
| LI1 | Named Layers | RC-12 (P2) | Architecture structure |
| LI2 | Cross-Layer Dependencies Shown | RC-12 (P2) | Dependency clarity |
| LI3 | Layer Violations Called Out | RC-9 (P1) | Problem signaling |
| DM1 | Runtime Dependencies Listed | RC-13 (P2) | Concrete evidence |
| DM2 | Circular Dependencies Flagged | RC-9 (P1) | Problem signaling |
| DM3 | External Service Dependencies | RC-13 (P2) | Evidence specifics |
| EP1 | Application Entry Points | RC-11 (P2) | Real identifiers |
| EP2 | Key Interfaces | RC-11 (P2) | Real identifiers |
| PC1 | Problems Visually Distinct | RC-9 (P1) | Visual signaling |
| PC2 | Problems as Observations | RC-7 (P2) | Specificity over prescription |
| SG1 | Real Identifiers from Source Code | RC-11 (P2) | Core evidence rule |
| SG2 | Type Signatures in Context Boxes | RC-11 (P2) | Core evidence rule |
| CMP1 | Side-by-Side for Parallel Paths | RC-5 (P1) | Section independence |
| CMP2 | Divergence Point Annotation | RC-13 (P2) | Evidence specifics |

---

## Summary

- **Total rules:** 54 (33 ReadabilityStandards + 21 CodebaseAnalysisStandards)
- **Mapped to checkpoints:** 47 rules -> 15 checkpoints (RC-1 through RC-15)
- **Model knowledge:** 7 rules (T3, T4, T5, T6, WS1, WS2, D6) — CSS/SVG implementation details
- **Coverage:** 100% of rules have a mapping target
