### Knowledge Is Perishable

**Source:** Argote, Beckman & Epple, "The Persistence and Transfer of Learning in Industrial Settings" (1990); Klammer & Gueldenberg, "Knowledge Management in Project-Based Organizations" (2019); Gergely Orosz, "The Software Engineer's Guidebook" (2023)

**Impact: HIGH — unexternalized knowledge disappears from teams, individuals, and organizations**

> Knowledge in people's heads is perishable. People leave, forget, and context-switch. Only knowledge externalized into a durable medium persists.

---

## The Externalization Imperative

Organizational forgetting is a measured phenomenon. If knowledge matters, it must exist outside a human brain.

In software engineering:
- The developer who understood the payment system leaves — taking the understanding with them
- The team that built the architecture disbands — the *why* behind decisions is lost
- You solve a complex bug — six months later, you face it again with no memory of the solution

---

## Evidence

| Source | Finding |
|--------|---------|
| **Argote et al. (1990)** | Organizations lose 20-30% of learned productivity per year when knowledge exists only in individuals. Embedding knowledge in documentation or tooling significantly reduces depreciation. |
| **Klammer & Gueldenberg (2019)** | Project knowledge decays faster than operational knowledge. Externalization is the primary defense. Tacit knowledge is the most valuable and hardest to capture. Post-project capture is significantly less effective than continuous capture. |
| **Orosz (2023)** | The most effective teams write things down — not as bureaucracy, but as a survival mechanism. The alternative is rediscovering the same lessons repeatedly. |

---

## The Perishability Spectrum

| Knowledge Type | Half-Life | Externalization Strategy |
|---------------|-----------|------------------------|
| **Implementation details** | Weeks | Code is the documentation |
| **Architecture rationale** | Months | ADRs in the repository |
| **Debugging insights** | Months | Comments at the fix site, runbook entries |
| **Domain knowledge** | Years | Design docs, personal knowledge base |
| **Organizational context** | Varies | Personal notes, institutional documentation |
| **Tacit expertise** | Career-length | Hardest to capture; use examples, patterns, principles |

---

## Problem: Knowledge Silos

```
Year 1: Senior engineer builds the recommendation engine
        "It's all in my head — I'll document it later"

Year 2: Senior engineer moves to a different team
        Team inherits the recommendation engine

Year 3: Recommendation engine needs modification
        New team reverse-engineers behavior from code
        Takes 3 weeks for what should have been 3 days

Year 4: New team's understanding is also only in their heads
        Cycle repeats
```

---

## Solution: Continuous Externalization

When you learn something, decide immediately where it belongs:

| What You Learned | Where It Goes |
|-----------------|---------------|
| Why code works this way | Inline comment or ADR |
| How to debug a specific failure | Runbook entry or comment at fix site |
| Architectural insight | Design doc or ADR |
| Personal synthesis / cross-project pattern | Personal knowledge base (Obsidian) |
| Tribal knowledge from conversation | Wherever the audience is (repo or notes) |

Capture at the moment of understanding. "I'll document it later" means "I'll forget to document it."

---

## The Obsidian Principle

**If it's meant to be read by me → Obsidian. If it's meant to be read by the codebase (developers or agents) → in the codebase.**

Personal knowledge bases serve a different purpose than project documentation:
- Capture *your* understanding, not the system's specification
- Connect ideas across projects, domains, and time
- Optimize for *your* retrieval, not a team's onboarding
- Persist across jobs, teams, and organizations

The mistake is conflating personal learning with project documentation. Different audiences, different lifespans, different homes.

---

## The Externalization Test

After solving any non-trivial problem:

1. **Would someone else benefit?** → Document in the codebase
2. **Would future-me benefit?** → Document in personal KB
3. **Both?** → Codebase gets technical facts; personal KB gets synthesis
4. **Neither?** → Rare, but some things are genuinely ephemeral

---

## The Test Question

**"If I forgot everything about this tomorrow, where would I look to recover the understanding — and would it be there?"**

If the answer is "nowhere," the knowledge is one context-switch away from being lost forever.
