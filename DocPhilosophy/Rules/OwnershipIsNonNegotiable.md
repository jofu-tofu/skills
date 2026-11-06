### Ownership Is Non-Negotiable

**Sources:** [Software Engineering at Google, Documentation](https://abseil.io/resources/swe-book/html/ch10.html) (2020); [GitHub Open Source Survey](https://opensourcesurvey.org/2017/) (2017).

**Impact: CRITICAL — unclear ownership makes maintenance and correction harder**

> Make maintenance accountability explicit. A person, role or team can own a document if its update and escalation path is clear. Do not invent a named owner or discard unique knowledge merely because ownership is unresolved.

---

## What Ownership Means

| Component | Definition |
|-----------|-----------|
| **Authority** | Can update the document within its approval and retention rules |
| **Responsibility** | Reviews it when its subject changes |
| **Accountability** | Answers when it's found inaccurate |

Without all three, you have a suggestion, not an owner.

---

## Evidence

| Source | Finding |
|--------|---------|
| **Software Engineering at Google** | Treat documentation as maintained engineering work, with review and ownership. This supports an explicit maintenance process, not a universal ownerless-document lifespan. |
| **GitHub Open Source Survey (2017)** | 93% encountered incomplete or outdated documentation; 60% of contributors seldom or never contributed to documentation. These different questions do not define a 33-point quality gap or establish ownership as its cause. |

---

## The Ownership Test

Before creating documentation:

1. **Who will update this when the subject changes?**
   - A specific person or role → Proceed
   - A team → Identify its responsible role, update path and escalation route
   - Nobody known → Mark ownership unresolved and propose a responsible role; preserve necessary knowledge with its status and limitations

2. **How will the owner know the subject changed?**
   - Same PR / same commit → Couple the change to documentation review
   - Code review catches it → Semi-automatic
   - Relies on memory → Establish a more dependable trigger

3. **What happens if the owner leaves?**
   - Ownership transfers to replacement → Sustainable
   - Undefined → Doc becomes orphan

---

## Problem: The Orphaned Wiki Page

```
Quarter 1: New engineer writes comprehensive onboarding guide
Quarter 2: Engineer moves to different team
Quarter 3: Onboarding process changes (new tools, new repos)
Quarter 4: New hires follow outdated guide, waste 2 days on wrong setup
Quarter 5: Someone adds "WARNING: May be outdated" banner
Quarter 6: Everyone ignores the page entirely
```

No owner. No updates. The document became harmful — worse than nothing, because it actively misled readers.

---

## Solution: Structural Ownership

Prefer ownership that survives personnel changes:

| Ownership Type | Mechanism | Condition to check |
|---------------|-----------|-------------|
| **Co-located** | Doc near the code | Does the code owner's remit include these docs? |
| **Explicit review ownership** | Repository owner/reviewer configuration | Does the host actually route and require the review? |
| **Role-based** | "The API team owns API docs" | Is there an update and escalation path? |
| **Assigned** | "Alice owns this page" | Is there a transfer plan? |
| **Implied** | "Whoever wrote it" | Has anyone accepted maintenance responsibility? |

Location and configuration support ownership; they do not prove that someone is maintaining the document or that personnel changes are handled.

---

## Correct, Transfer or Retire Deliberately

Misleading current guidance can harm readers:

- Wastes reader time
- Builds false confidence ("the docs say X")
- Contradicts actual system behavior
- Occupies space where accurate documentation could live

Correct or clearly withdraw misleading current instructions within the user's authority. Preserve unique rationale and required history; propose an owner or a reachable canonical home. Retire redundant material with a replacement link when appropriate. Missing ownership or age alone does not authorize deletion or prove the content false.

---

## The Test Question

**"If this document becomes inaccurate tomorrow, whose job is it to fix it — and how will they know?"**

If you can't answer both parts, the document needs a different owner or a different location.
