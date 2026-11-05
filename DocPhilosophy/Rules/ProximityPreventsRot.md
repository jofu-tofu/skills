### Proximity Prevents Rot

**Source:** Winters, Manshreck & Wright, "Software Engineering at Google" (2020); [GitHub Open Source Survey](https://opensourcesurvey.org/2017/) (2017). The earlier Wen Tan et al., "An Empirical Study of Documentation Decay" (2023), attribution remains unverified; do not use it for rate or ranking claims.

**Impact: HIGH — coupling documentation updates to the maintained system reduces missed-update opportunities**

> Keep documentation in the actual maintenance workflow while preserving access for its intended readers. Repository proximity is useful when it achieves both.

---

## The Proximity Gradient

The following is an illustrative maintenance-distance model, not a measured universal ranking. External documentation can have effective review automation and ownership; inaccessible in-repository guidance cannot serve its audience merely by being near code.

```
MOST DURABLE ──────────────────── LEAST DURABLE
Inline comment > README > docs/ > Wiki > Confluence > Google Doc
     │              │       │        │         │           │
  Same file    Same repo  Same repo  Same org  Same org  Anywhere
  Same commit  Same PR    Same PR    Separate maintenance handoff
```

---

## Evidence

| Source | Finding |
|--------|---------|
| **Earlier Tan attribution** | Unverified; no established decay rate or strongest-predictor claim follows from this citation. |
| **Google SWE Book (2020)** | Documentation must be treated like code — owned, reviewed, tested, co-located. Google's internal wiki (GooWiki) rotted despite good tooling because of ownership gaps. |
| **GitHub Open Source Survey (2017)** | 93% of respondents had encountered incomplete or outdated documentation; 60% of contributors seldom or never contributed to docs. These are different questions from importance or adequacy ratings, and do not establish proximity as the cause. |

---

## The Proximity Test

Before placing documentation, ask:

1. **Will this doc change when the code changes?**
   - YES → Same repo, ideally same directory
   - NO → Reference/conceptual — can live further away

2. **Will the person changing the code see this doc?**
   - YES → It will get updated naturally
   - NO → It will rot

3. **Can this doc be included in the same PR?**
   - YES → Maximum maintenance coupling
   - NO → Maintenance becomes a separate, forgettable task

---

## Problem: The Distant Wiki

```
Code lives in:     github.com/team/service
Docs live in:      confluence.company.com/pages/service-docs

Developer changes API endpoint behavior.
Developer updates code, writes tests, creates PR.
Developer does NOT update Confluence.

Six months later: Confluence describes an API that no longer exists.
```

---

## Solution: Co-located Documentation

```
service/
├── src/
│   └── api/
│       ├── users.ts
│       └── users.md          ← API behavior docs, same directory
├── docs/
│   ├── architecture.md       ← System-level docs, same repo
│   └── decisions/
│       └── 001-auth-flow.md  ← ADR, same repo
└── README.md                 ← Entry point, same repo
```

When a developer changes `users.ts`, the PR diff shows `users.md` right next to it. Reviewers notice staleness. The doc survives.

---

## Maintenance Coupling

Documentation durability is proportional to maintenance coupling:

| Coupling Level | Mechanism | Durability |
|---------------|-----------|------------|
| **Same commit** | Dev updates doc and code together | Highest |
| **Same PR** | Reviewer catches stale docs | High |
| **Same repo** | Visible during development | Medium |
| **Same organization** | Requires separate navigation | Low |
| **External** | Requires memory and discipline | Minimal |

Maximize coupling. Minimize distance.

---

## The Test Question

**"If a developer changes the code this documents, will they naturally encounter this doc during their workflow?"**

If yes — the doc survives. If no — it's already dying.
