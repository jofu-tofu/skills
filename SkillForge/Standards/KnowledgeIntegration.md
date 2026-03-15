# Knowledge Integration

> How to incorporate research, evidence, and expertise into skills.
> The goal is durable understanding, not rule compliance.

---

## The Problem: Rule Accumulation

When new research enters a skill, the default instinct is to append a rule: "Always do X", "Never do Y", "Consider Z when W." Over time, rules accumulate. A skill with 40+ discrete rules creates three compounding failures:

1. **Attention dilution** — Every rule competes for the same finite attention budget. Adding rule #41 makes rules #1-40 less likely to be followed. (AgentBehavior Principle 1)
2. **Context mismatch** — Most rules apply only in specific situations. An agent reading 40 rules where 5 apply must skim past 35 irrelevant ones, training itself to treat rules as suggestions.
3. **No verification** — Rules are instructions, not enforcement. Without tooling or tests, there's no feedback loop confirming a rule was followed. (AgentBehavior Principle 9)

Discrete rules work for small, checkable, mechanical requirements (naming conventions, file structure, validation steps). They fail for judgment, design philosophy, and nuanced application of research findings.

---

## The Alternative: Philosophical Integration

Instead of "follow these 40 rules," give the agent a mental model that generates the right behavior across contexts. A principle understood is stronger than a rule memorized.

**What philosophical integration means:**

- The **WHY** behind the behavior is explicit — the agent understands the reasoning, not just the instruction
- The principle is **concise** — one paragraph, not one page
- The principle **self-selects** — an agent reading a well-stated philosophy naturally applies it where relevant and ignores it where it's not, without needing "applies when" guards
- New research **updates existing principles** rather than spawning new rules

### The Two Knowledge Patterns

| Pattern | Structure | Best For | Examples |
|---------|-----------|----------|----------|
| **Philosophical Integration** | Single `Philosophy.md` or `Principles.md` with interconnected principles | Judgment, design, quality, methodology | ClarityEngine (6 principles), Design (9 patterns) |
| **Discrete Rules** | `Rules/` folder, one file per rule, index in SKILL.md | Checkable, mechanical, independently-applicable standards | TestDriven (12 rules), WebDesign (41 rules) |

**Default to philosophical integration.** Use discrete rules only when:
- Each rule is independently applicable without understanding the others
- Rules have clear, mechanical pass/fail criteria
- The skill's value is in the checklist, not the philosophy

### Anatomy of a Good Principle

| Element | Purpose | Length |
|---------|---------|--------|
| **Name** | Memorable handle | 3-6 words |
| **WHY** | The reasoning — why this matters, what goes wrong without it | 1-3 sentences |
| **WHAT** | The behavior — what to do, concretely | 1-3 sentences |
| **ANTI-PATTERN** | The failure mode this prevents | 1 sentence + a name |
| **TEST** | How to verify the principle was applied | 1 question |
| **Sources** | Research grounding | Inline citation |

ClarityEngine's `Philosophy.md` is the canonical example of this structure.

---

## Incorporating New Research

When new research, evidence, or expertise needs to enter a skill:

### Step 1: Extract the Insight

Distill the research to its actionable core. What behavior should change? What was wrong about the previous understanding? A finding that doesn't change behavior doesn't belong in a skill.

### Step 2: Find the Home

Look at the skill's existing principles or philosophy. The new insight almost always:

- **Strengthens** an existing principle (add evidence, sharpen the WHY)
- **Extends** an existing principle (new anti-pattern, new test, broader application)
- **Challenges** an existing principle (update or replace)

Only if genuinely orthogonal — not covered by any existing principle — does it warrant a new principle.

### Step 3: Integrate, Don't Append

**If strengthening:** Update the existing principle's WHY or sources. The principle's text may not change at all — just its evidence base.

**If extending:** Add the new anti-pattern, test, or application to the existing principle. Keep the principle concise — if it's growing past 5-6 sentences, it may be two principles.

**If challenging:** Rewrite the principle. Old version is gone. Principles are living documents, not append-only logs.

**If genuinely new:** Create a new principle following the anatomy above. First confirm it's truly orthogonal by testing: "Can I explain this as a special case of an existing principle?" If yes, integrate instead.

### Step 4: Source Attribution

Cite the source inline with the principle it supports. Evidence lives next to the claim, not in a separate references section.

---

## The Research Behind This Approach

This approach is grounded in the agent behavior research that governs all skill design:

- **Attention Is Finite** (AgentBehavior P1) — Fewer, deeper principles consume less attention budget than many shallow rules
- **Examples Beat Rules** (AgentBehavior P8) — Principles with anti-patterns and tests function as implicit examples; rules without worked demonstrations are abstract
- **Positive Framing Beats Prohibition** (AgentBehavior P10) — Principles describe what TO do and WHY; rules often describe what NOT to do
- **Context Rot** (AgentBehavior P3) — Philosophical integration produces shorter files than discrete rule collections, reducing performance degradation

---

## The Litmus Test

When deciding whether to add a rule or integrate a principle:

> "If the agent understood WHY, would it do the right thing without this specific instruction?"

If yes: integrate the WHY into existing philosophy.
If no: the requirement is mechanical — use a discrete rule or tooling enforcement.
