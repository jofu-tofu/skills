# ReviewSkill Workflow

> **Trigger:** "review skill", "audit skill", "improve skill", "retrospective on skill", "what's wrong with this skill", "skill health check", "diagnose and fix skill"

## Reference Material

- **Prompting Standards:** `../Standards/PromptingStandards.md` — Prompt engineering reference. Read first.
- **Agent Behavior Research:** `../Standards/AgentBehavior.md`

## Purpose

Evaluate whether a skill is designed for how agents actually behave — not just whether it passes structural validation. Produces prioritized findings ranked by impact on agent compliance.

Note: This workflow does NOT run structural validation (TitleCase, frontmatter, routing table). For structural checks, run `ValidateSkill.ts` separately.

## Workflow Steps

1. Read `../Standards/PromptingStandards.md` to load prompt engineering principles
2. Read `Standards/AgentBehavior.md` to load the evaluation framework
3. Read the target skill's full file tree (SKILL.md, workflows, standards, tools)
4. For each principle in AgentBehavior.md, evaluate how the target skill aligns or violates it
5. Produce prioritized findings (highest impact on agent compliance first)
6. Ask user which improvements to apply, then execute selected changes

## Output Format

Prioritized findings, each with:

- **Finding:** What the issue is
- **Impact:** Why this affects agent compliance (cite the relevant AgentBehavior.md principle)
- **Recommendation:** Concrete change to make
- **Effort:** Quick fix / moderate / significant rework

## Worked Example

Target: A skill with a 400-line SKILL.md, no examples, and process rules like "ALWAYS run validation after every change."

**Finding 1:**
- **Finding:** SKILL.md is 400 lines — well beyond the point where context rot degrades agent attention to all content.
- **Impact:** Context rot (Principle 3) — performance degrades proportionally with token count. A 400-line SKILL.md competes with the agent's ~100-150 available instruction slots after system prompt.
- **Recommendation:** Extract reference material into Standards/ files loaded only by workflows that need it. Target SKILL.md under 100 lines.
- **Effort:** Moderate

**Finding 2:**
- **Finding:** No examples section. Workflow routing relies entirely on rule descriptions.
- **Impact:** Examples beat rules (Principle 8) — few-shot examples improve tool selection from 72% to 90%. Without examples, the agent must infer behavior from abstract descriptions.
- **Recommendation:** Add 2-3 concrete examples showing realistic user requests and expected skill behavior.
- **Effort:** Quick fix

**Finding 3:**
- **Finding:** Process rules use prohibition framing: "ALWAYS run validation after every change."
- **Impact:** Positive framing beats prohibition (Principle 10) and tooling beats instructions (Principle 9). ALWAYS/NEVER rules are frequently violated. Without tool enforcement, process instructions are treated as suggestions.
- **Recommendation:** Reframe as positive pattern ("Run ValidateSkill.ts after completing a workflow") and consider adding automated enforcement via post-workflow hooks.
- **Effort:** Quick fix
