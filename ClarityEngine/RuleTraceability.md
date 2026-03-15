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
| P1 | Layman First, Expert Second (Inverted Pyramid + Progressive Disclosure) |
| P2 | Skip-Friendly by Design (Section-Level Inverted Pyramid) |
| P3 | Clarity Over Brevity (Prefer Skipping Over Vagueness) |
| P4 | Scannable Architecture (Visual Hierarchy + Chunking) |
| P5 | Evidence Over Assertion (Trust Through Specificity) |

The inverted pyramid is the umbrella frame across P1, P2, and P4: P1 orders the document, P2 restarts that order within sections, and P4 makes the order visually scannable.

## Checkpoints

| ID | Checkpoint | Primary Principle |
|----|-----------|-------------------|
| RC-1 | Flesch 60-70 summaries, 15-20 word avg sentences | P1 |
| RC-2 | Jargon defined on first use, acronyms expanded | P1 |
| RC-3 | Subheadings every 100-150 words, max 4 heading levels | P4 |
| RC-4 | Section anchors on H2/H3, sticky ToC for long docs | P2 |
| RC-5 | Each section begins with its takeaway; support and detail follow | P2 |
| RC-6 | No empty/generic headings, every heading describes content | P3 |
| RC-7 | Specific examples in every major section, uncertainty marked | P3 |
| RC-8 | 3-5 chunks per group, 3-5 groups per heading level | P4 |
| RC-9 | Key info in headings + bold + bullets (70% comprehension rule) | P4 |
| RC-10 | Max 3 type sizes, no decorative elements without info value | P4 |
| RC-11 | Real identifiers from source in diagrams, no abstract labels | P5 |
| RC-12 | Self-contained diagrams: title, legend, max 20 elements | P5 |
| RC-13 | Claims traceable to source, data flows with actual types | P5 |
| RC-14 | WCAG AA contrast, colorblind-safe, consistent color semantics | P5 |
| RC-15 | Code: syntax highlighting, monospace, no horiz scroll, distinct bg | P5 |

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
| C1 | Contrast Ratio AA (4.5:1) | RC-14 (P5) | Concrete threshold preserved |
| C2 | Enhanced Contrast AAA (7:1) | RC-14 (P5) | Target threshold preserved |
| C3 | Maximum Distinct Colors (7-8) | RC-10 (P4) | Absorbed into visual restraint principle |
| C4 | No Red-Green Only Encoding | RC-14 (P5) | Accessibility constraint preserved |
| C5 | Consistent Color Coding | RC-14 (P5) | Semantic consistency preserved |
| H1 | Single H1 Per Document | RC-3 (P4) | Heading hierarchy preserved |
| H2 | No Skipped Heading Levels | RC-3 (P4) | Heading hierarchy preserved |
| H3 | Maximum Nesting Depth (4 levels) | RC-3 (P4) | Concrete limit preserved |
| H4 | Descriptive Heading Text | RC-6 (P3) | No empty or generic headings |
| IA1 | Chunking (Miller's Law) | RC-8 (P4) | 3-5 chunks preserved |
| IA2 | Progressive Disclosure | RC-5 (P2) | Section-level lead-first ordering preserved |
| IA3 | F-Pattern Compatibility | RC-9 (P4) | Key info positioning preserved |
| IA4 | Visual Hierarchy through Proximity | RC-8 (P4) | Proximity grouping preserved |
| WS1 | Macro White Space (800px max) | Model knowledge | CSS implementation detail — standard content width |
| WS2 | Breathing Room Between Sections | Model knowledge | CSS implementation detail — standard section spacing |
| N1 | Sticky Table of Contents | RC-4 (P2) | Navigation preserved |
| N2 | Active Section Highlighting | RC-4 (P2) | Navigation preserved |
| N3 | Back-to-Top Affordance | RC-4 (P2) | Navigation preserved |
| N4 | Section Anchors | RC-4 (P2) | Deep linking preserved |
| D1 | Element Count per Diagram (max 20) | RC-12 (P4) | Diagram constraint preserved |
| D2 | Diagram Title and Legend | RC-12 (P5) | Self-contained diagrams |
| D3 | Self-Contained Diagrams | RC-12 (P5) | Independence preserved |
| D4 | Layered Abstraction (C4 Zoom) | RC-12 (P4) | Multi-level preserved |
| D5 | Diagram Text Readability | RC-14 (P5) | Contrast in diagrams |
| D6 | Diagram Accessibility (SVG a11y) | Model knowledge | SVG accessibility implementation detail |
| CL1 | Coherence Principle | RC-10 (P4) | No decorative elements |
| CL2 | Spatial Contiguity Principle | RC-8 (P4) | Related elements grouped |
| CL3 | Signaling Principle | RC-9 (P4) | Visual emphasis preserved |
| CL4 | Data-Ink Ratio (Tufte) | RC-10 (P4) | Maximize information density |
| CL5 | Visual-First Communication | P4 core tenet | Elevated to principle level: visual hierarchy now makes information order legible before detail. |
| CL6 | Escalating Abstraction | RC-5 (P2) | Section-level depth layering preserved |
| CP1 | Syntax Highlighting | RC-15 (P5) | Code presentation |
| CP2 | Monospace Font for Code | RC-15 (P5) | Code presentation |
| CP3 | Code Block Line Length (80ch) | RC-15 (P5) | Code presentation |
| CP4 | Code Block Contrast | RC-15 (P5) | Code presentation |

---

## CodebaseAnalysisStandards.md Mapping (21 Rules)

| Rule ID | Rule Name | Mapped To | Notes |
|---------|-----------|-----------|-------|
| CA1 | Boundary Identification | RC-12 (P4) | Diagram constraint |
| CA2 | Data Flow with Type Annotations | RC-13 (P5) | Evidence with real types |
| CA3 | Dependency Direction | RC-12 (P4) | Diagram clarity |
| CA4 | Layer Identification | RC-12 (P4) | Architecture layers |
| CA5 | Problem Callouts | RC-9 (P4) | Visual distinction for findings |
| BC1 | Named Boundaries | RC-11 (P5) | Real identifiers |
| BC2 | Internal vs External Distinction | RC-12 (P4) | Visual distinction |
| BC3 | Responsibility Summaries | RC-11 (P5) | Source-grounded labels |
| DF1 | End-to-End Data Flows | RC-13 (P5) | Evidence through specifics |
| DF2 | Transformation Labels | RC-13 (P5) | Evidence through specifics |
| DF3 | Async vs Sync Distinction | RC-12 (P4) | Visual distinction |
| LI1 | Named Layers | RC-12 (P4) | Architecture structure |
| LI2 | Cross-Layer Dependencies Shown | RC-12 (P4) | Dependency clarity |
| LI3 | Layer Violations Called Out | RC-9 (P4) | Problem signaling |
| DM1 | Runtime Dependencies Listed | RC-13 (P5) | Concrete evidence |
| DM2 | Circular Dependencies Flagged | RC-9 (P4) | Problem signaling |
| DM3 | External Service Dependencies | RC-13 (P5) | Evidence specifics |
| EP1 | Application Entry Points | RC-11 (P5) | Real identifiers |
| EP2 | Key Interfaces | RC-11 (P5) | Real identifiers |
| PC1 | Problems Visually Distinct | RC-9 (P4) | Visual signaling |
| PC2 | Problems as Observations | RC-7 (P3) | Clarity over prescription |
| SG1 | Real Identifiers from Source Code | RC-11 (P5) | Core evidence rule |
| SG2 | Type Signatures in Context Boxes | RC-11 (P5) | Core evidence rule |
| CMP1 | Side-by-Side for Parallel Paths | RC-5 (P2) | Section independence |
| CMP2 | Divergence Point Annotation | RC-13 (P5) | Evidence specifics |

---

## Summary

- **Total rules:** 54 (33 ReadabilityStandards + 21 CodebaseAnalysisStandards)
- **Mapped to checkpoints:** 47 rules -> 15 checkpoints (RC-1 through RC-15)
- **Model knowledge:** 7 rules (T3, T4, T5, T6, WS1, WS2, D6) — CSS/SVG implementation details
- **Coverage:** 100% of rules have a mapping target
