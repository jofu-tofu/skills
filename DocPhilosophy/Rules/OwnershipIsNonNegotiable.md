### Ownership Is Non-Negotiable

**Source:** Winters, Manshreck & Wright, "Software Engineering at Google" (2020); GitHub Developer Survey (2023)

**Impact: CRITICAL — ownerless documentation dies within months**

> Assign exactly one accountable owner to every document. Not a team. Not "everyone." One person or role with authority, responsibility, and accountability.

---

## What Ownership Means

| Component | Definition |
|-----------|-----------|
| **Authority** | Can update or delete the document |
| **Responsibility** | Reviews it when its subject changes |
| **Accountability** | Answers when it's found inaccurate |

Without all three, you have a suggestion, not an owner.

---

## Evidence

| Source | Finding |
|--------|---------|
| **Google GooWiki** | Internal wiki used by thousands. Many pages rotted because no individual owned them. Tooling alone cannot solve ownership. Google later emphasized treating docs like code — with explicit owners via CODEOWNERS. |
| **GitHub Gap (2023)** | 93% call docs important. 60% say inadequate. The 33-point gap is an ownership problem: docs get created enthusiastically, then nobody maintains them. |

---

## The Ownership Test

Before creating documentation:

1. **Who will update this when the subject changes?**
   - A specific person or role → Proceed
   - "The team" → Assign a specific owner or skip creation
   - Nobody → Skip creation; it will become harmful fiction

2. **How will the owner know the subject changed?**
   - Same PR / same commit → Automatic awareness
   - Code review catches it → Semi-automatic
   - Relies on memory → It won't happen

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

| Ownership Type | Mechanism | Reliability |
|---------------|-----------|-------------|
| **Co-located** | Doc in same dir as code; code owner owns doc | Highest |
| **CODEOWNERS** | Explicit file-level ownership via git | High |
| **Role-based** | "The API team owns API docs" | Medium |
| **Assigned** | "Alice owns this page" | Low (person-dependent) |
| **Implied** | "Whoever wrote it" | Minimal |

When the doc lives next to the code and CODEOWNERS covers the directory, ownership is automatic and survives personnel changes.

---

## The Deletion Principle

Delete documents with no owner. Stale documentation is actively harmful:

- Wastes reader time
- Builds false confidence ("the docs say X")
- Contradicts actual system behavior
- Occupies space where accurate documentation could live

Deleting a stale document is an act of service. Preserving it "just in case" is negligence.

---

## The Test Question

**"If this document becomes inaccurate tomorrow, whose job is it to fix it — and how will they know?"**

If you can't answer both parts, the document needs a different owner or a different location.
