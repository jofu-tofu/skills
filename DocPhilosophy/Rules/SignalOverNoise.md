### Signal Over Noise

**Source:** John Sweller, "Cognitive Load Theory" (1988); Mark Heath, "The Problem with Documentation" (2023); Daniele Procida, "Diataxis" (2017)

**Impact: HIGH — cognitive load determines whether documentation gets read at all**

> Small, dense documentation outperforms large, comprehensive documentation. When signal-to-noise ratio drops, readers stop reading entirely.

---

## Cognitive Load Applied to Docs

| Load Type | Definition | Action |
|-----------|-----------|--------|
| **Intrinsic** | The actual concept being documented | Unavoidable — this is the signal |
| **Germane** | Effort to integrate new understanding | Desirable — keep this |
| **Extraneous** | Formatting, filler, irrelevant context | Destructive — eliminate this |

Every document competes for a scarce resource: the reader's attention. Extraneous load directly competes with comprehension (Sweller, 1988).

---

## The Signal-to-Noise Ratio

```
Signal = Information the reader needs for their current task
Noise  = Everything else in the document

Effective docs: Signal / (Signal + Noise) → approaches 1.0
Failed docs:    Signal / (Signal + Noise) → approaches 0.0
```

A 50-page architecture doc with 3 pages of useful content has a ratio of 0.06. The reader must process 47 pages of noise to find 3 pages of signal. Most won't try.

---

## Evidence

| Source | Finding |
|--------|---------|
| **Sweller (1988)** | Working memory has hard limits. Extraneous load directly competes with germane load. Filler text literally prevents understanding. |
| **Diataxis (Procida, 2017)** | Succeeds because it forces documents to serve *one purpose*. Single-purpose documents have inherently higher signal density. |
| **The Readability Cliff** | 500-word doc gets read. 5,000-word doc gets skimmed. 50,000-word doc gets ignored — regardless of content quality. |

---

## Problem: The Comprehensive Document

```
# Service Architecture Guide (47 pages)

1. Introduction (2 pages of company history)
2. Overview (3 pages restating the introduction)
3. Architecture (the actual content — 4 pages)
4. Historical Context (6 pages nobody reads)
5. Future Plans (5 pages, already outdated)
6. Appendix A-F (27 pages of reference tables)

Reader needs: How does authentication flow work?
Reader must process: 47 pages to find 1 diagram
Reader actually does: Asks a colleague instead
```

---

## Solution: Dense, Purpose-Specific Documents

```
docs/
├── auth-flow.md              ← 200 words + 1 diagram. Answers THE question.
├── decisions/
│   └── 001-chose-jwt.md      ← ADR. Why JWT, not sessions.
└── reference/
    └── api-endpoints.md      ← Table format. Scannable. No prose.
```

Each document serves one purpose. Each has high signal density. Each gets read.

---

## The Density Principles

1. **One document, one purpose.** If it serves two audiences, split it.
2. **Lead with the answer.** State it first, then explain.
3. **Tables over prose for reference.** Scannable beats readable for lookup tasks.
4. **Diagrams over paragraphs for architecture.** One diagram replaces 500 words.
5. **Delete sections that exist for completeness, not communication.** If nobody reads it, it's noise.

---

## The Compression Test

1. Delete the first paragraph (it's usually throat-clearing)
2. Delete every sentence restating what the reader already knows
3. Delete every section that exists because a template said to include it
4. Read what remains

If the document improved, the deleted content was noise.

---

## The Test Question

**"Could I cut this document in half and lose nothing the reader actually needs?"**

If yes — cut it. The shorter version will be read more, maintained more, and serve better.
