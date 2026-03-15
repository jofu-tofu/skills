### Context Rot Is Real

**Source:** Wen Tan et al., "An Empirical Study of Documentation Decay" (2023); Chroma Research, "Context Window Decay" (2024); Winters et al., "Software Engineering at Google" (2020)

**Impact: HIGH — documentation decay is measurable, predictable, and inevitable without intervention**

> Documentation progressively diverges from reality. In codebases, this is doc-code inconsistency. In AI contexts, it's stale instructions degrading agent performance. Both are empirically measurable.

---

## Two Fronts of Rot

| Front | Manifestation | Speed |
|-------|-------------|-------|
| **Code-level rot** | Docs become inconsistent with the codebase | API docs rot fastest; architecture docs slowest |
| **AI context rot** | Instructions in CLAUDE.md/AGENTS.md become stale or contradictory | Accelerates when tooling changes |

Both are inevitable without maintenance coupling (see `Rules/ProximityPreventsRot.md`). The question is not *whether* to fight rot, but *how fast* to detect it.

---

## Evidence

| Source | Finding |
|--------|---------|
| **Tan et al. (2023)** | Doc-code inconsistency increases at predictable rates. API docs rot fastest. The strongest predictor of freshness is proximity to code. |
| **Chroma Research (2024)** | Information at the beginning and end of context windows is retrieved most reliably. Middle content suffers "lost in the middle" effects. Stale or contradictory content degrades overall agent performance. Signal-to-noise ratio directly impacts response quality. |
| **Google SWE Book (2020)** | Even with sophisticated tooling, freshness requires active ownership. Automated checks catch some decay, but human review remains essential. |

---

## The Rot Timeline

| Time Since Last Review | Status | Action |
|----------------------|--------|--------|
| 0-3 months | Fresh | Likely accurate |
| 3-6 months | Aging | Verify critical details before relying on them |
| 6-12 months | Stale | Assume inaccuracies exist |
| 12+ months | Rotten | Treat as unreliable unless verified against current code |

Timelines assume active development. Stable codebases decay slower; rapidly evolving codebases decay faster.

---

## Code-Level Context Rot

```
Month 1: Developer writes docs for authentication flow
Month 3: Another developer adds OAuth provider, skips doc update
Month 5: Auth flow refactored, docs describe a phantom system
Month 8: New developer builds integration against phantom API
Month 9: Integration fails. "But the docs said..."
```

**Countermeasures:**
- Co-locate docs with code (same PR updates both)
- Include documentation files in CODEOWNERS
- Add "Did you update related docs?" to code review checklist
- Add freshness metadata (last-reviewed dates) on critical docs

---

## AI Context Rot

```
Month 1: CLAUDE.md instructs "use npm for package management"
Month 3: Team migrates to pnpm, forgets to update CLAUDE.md
Month 5: AI agent uses npm, creates lockfile conflicts
Month 6: Developer appends "actually use pnpm" — now both instructions exist
Month 8: Agent follows whichever instruction it hits first in context
```

**Countermeasures:**
- Treat AI context files as code (review, test, own)
- Audit context files when tooling changes
- Replace stale instructions — never append corrections alongside them
- Minimize context file size to reduce rot surface area

---

## The Rot Detection Test

1. **When was it last updated?** (git log on the file)
2. **Has the subject changed since?** (git log on related code)
3. **Does any content contradict current behavior?** (spot-check claims)
4. **Are there competing/duplicate documents?** (search for similar content)

If any answer raises concern, review or delete.

---

## The Test Question

**"When was this document last verified against the system it describes — and what changed in the system since?"**

If you can't answer both parts, the document's accuracy is unknown. Unknown accuracy is effectively zero accuracy.
