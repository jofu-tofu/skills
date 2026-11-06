### Context Rot Is Real

**Sources:** [Software Engineering at Google, Documentation](https://abseil.io/resources/swe-book/html/ch10.html) (2020); [Chroma, Context Rot](https://www.trychroma.com/research/context-rot) (2025). The earlier attribution to Wen Tan et al., "An Empirical Study of Documentation Decay" (2023), remains unverified and must not support rate or ranking claims.

**Impact: HIGH — documentation can diverge when its subject or operating context changes**

> Documentation progressively diverges from reality. In codebases, this is doc-code inconsistency. In AI contexts, it's stale instructions degrading agent performance. Both are empirically measurable.

---

## Two Fronts of Rot

| Front | Manifestation | Review trigger |
|-------|-------------|----------------|
| **Code-level rot** | Docs become inconsistent with the codebase | Relevant behavior, interface or architecture changed |
| **AI context rot** | Instructions in CLAUDE.md/AGENTS.md become stale or contradictory | Tooling, runtime loading or project constraints changed |

Couple review to relevant changes (see `Rules/ProximityPreventsRot.md`). Detect divergence from evidence rather than assuming that every document decays at the same rate.

---

## Evidence

| Source | Finding |
|--------|---------|
| **Earlier Tan attribution** | Unverified. Do not use it to claim universal decay rates, a fastest-decaying document type, or a strongest predictor. |
| **Chroma Research (2025)** | Evaluates model performance under increasing input length in controlled tasks. This concerns context processing, not calendar-based documentation freshness; it does not validate the review intervals below. |
| **Google SWE Book (2020)** | Even with sophisticated tooling, freshness requires active ownership. Automated checks catch some decay, but human review remains essential. |

---

## Review Cadence Is Not an Accuracy Verdict

| Evidence state | Reliance decision | Action |
|----------------|------------------|--------|
| Relevant claims verified against the current subject | Supported within the checked scope | Record what was checked and recheck when its subject changes |
| Subject changed or current sources conflict | Affected claims need review | Compare the actual claims and resolve current authority |
| Last review or relevant changes unknown | Accuracy unverified | Check consequential details; preserve the distinction between missing evidence and a false claim |
| Old document with stable, currently verified content | Age alone does not invalidate it | Retain useful guidance and historical rationale |

Choose review intervals from change frequency, consequence and ownership capacity. An interval is a maintenance policy, not an empirically established expiry date. A newly edited document can be wrong and an older verified one can remain accurate.

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

If an answer raises concern, review the affected claims. Correct current guidance and preserve relevant history; delete only within authorized scope when the material is genuinely redundant or no longer useful.

---

## The Test Question

**"When was this document last verified against the system it describes — and what changed in the system since?"**

If you cannot answer both parts, mark the relevant accuracy unverified. Missing evidence does not establish zero accuracy; verify consequential claims before relying on them.
