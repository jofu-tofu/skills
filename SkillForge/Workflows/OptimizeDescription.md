# OptimizeDescription Workflow

> **Trigger:** "optimize description", "fix triggering", "skill not triggering", "improve triggers", "optimize skill description", "trigger accuracy"

## Reference Material

- **Prompting Standards:** `../Standards/PromptingStandards.md` — Prompt engineering reference. Read first.
- **Run Loop Script:** `../Tools/scripts/run_loop.py` — Iterative description optimizer
- **Run Eval Script:** `../Tools/scripts/run_eval.py` — Single-eval runner using `claude -p`
- **Eval Review HTML:** `../Tools/assets/eval_review.html` — Interactive eval set review/editing UI
- **Schemas:** `../Standards/Schemas.md` — JSON structures for eval data

## Purpose

Optimize a skill's description (the `USE WHEN` clause in YAML frontmatter) for better triggering accuracy. The description is the primary mechanism that determines whether Claude invokes a skill. An untested description is a reliability risk.

This workflow generates should-trigger and should-not-trigger test queries, evaluates trigger accuracy via `claude -p`, and iterates on the description to improve it.

**Dependency:** This workflow requires the `claude` CLI tool (`claude -p`). In Claude.ai environments, skip the automated loop and provide manual description improvement guidance instead.

## Workflow Steps

### Step 1: Load Standards

Read `../Standards/PromptingStandards.md`. All description changes must align with its principles.

### Step 2: Read Current Description

Identify the target skill. Read its `SKILL.md` and extract the current `description:` field from YAML frontmatter.

### Step 3: Generate Trigger Eval Queries

Create 15-20 eval queries — a mix of should-trigger (~8-10) and should-not-trigger (~8-10). Save as JSON:

```json
[
  {"query": "the user prompt", "should_trigger": true},
  {"query": "another prompt", "should_trigger": false}
]
```

Queries must be realistic — something a real user would actually type. Include file paths, personal context, column names, company names, URLs. Mix different lengths. Focus on edge cases rather than clear-cut matches.

**For should-trigger queries:** Different phrasings of the same intent — some formal, some casual. Include cases where the user doesn't explicitly name the skill but clearly needs it. Include uncommon use cases and cases where this skill competes with another but should win.

**For should-not-trigger queries:** Near-misses are the most valuable — queries that share keywords or concepts with the skill but actually need something different. Think adjacent domains, ambiguous phrasing. Don't make negatives obviously irrelevant.

**Bad:** `"Format this data"`, `"Extract text from PDF"`, `"Create a chart"`
**Good:** `"ok so my boss just sent me this xlsx file (its in my downloads, called something like 'Q4 sales final FINAL v2.xlsx') and she wants me to add a column that shows the profit margin as a percentage"`

### Step 4: Present Eval Set for User Review

Use the HTML template for interactive review:

1. Read `../Tools/assets/eval_review.html`
2. Replace placeholders:
   - `__EVAL_DATA_PLACEHOLDER__` with the JSON array (no quotes — it's a JS variable assignment)
   - `__SKILL_NAME_PLACEHOLDER__` with the skill name
   - `__SKILL_DESCRIPTION_PLACEHOLDER__` with the current description
3. Write to a temp file (e.g., `/tmp/eval_review_<skill-name>.html`) and open it
4. The user can edit queries, toggle should-trigger, add/remove entries, then click "Export Eval Set"
5. The exported file downloads as `eval_set.json` — check Downloads folder for it

This step matters — bad eval queries lead to bad descriptions.

### Step 5: Run the Optimization Loop

Tell the user this will take some time, then run in background:

```bash
cd <SkillForge-Tools-dir> && python -m scripts.run_loop \
  --eval-set <path-to-eval-set.json> \
  --skill-path <path-to-skill> \
  --model <model-id-powering-this-session> \
  --max-iterations 5 \
  --verbose
```

Use the model ID from the current session so triggering tests match what the user actually experiences.

The script handles the full optimization loop automatically:
1. Splits eval set into 60% train and 40% held-out test
2. Evaluates current description (each query run 3 times for reliability)
3. Calls Claude with extended thinking to propose improvements based on failures
4. Re-evaluates on both train and test sets
5. Iterates up to 5 times
6. Opens an HTML report showing results per iteration
7. Returns JSON with `best_description` (selected by test score to avoid overfitting)

Periodically tail the output to give the user progress updates.

### Step 6: Apply the Result

Take `best_description` from the JSON output and update the skill's SKILL.md frontmatter. Show the user before/after and report the scores.

### How Skill Triggering Works

Skills appear in Claude's available_skills list with their name + description. Claude decides whether to consult a skill based on that description. Claude only consults skills for tasks it can't easily handle on its own — simple, one-step queries may not trigger a skill even with a perfect description. Complex, multi-step, or specialized queries reliably trigger skills when the description matches.

Eval queries should be substantive enough that Claude would actually benefit from consulting a skill.

### Manual Mode (When claude CLI Is Unavailable)

If `claude -p` is not available (Claude.ai, environments without CLI):

1. Generate the eval queries as in Step 3
2. Review with user as in Step 4
3. Instead of the automated loop, manually analyze the description against the eval set
4. Propose an improved description based on PromptingStandards.md principles:
   - Intent-based triggers over exact phrase matching
   - Cover the domain conceptually
   - Be "pushy" — err toward triggering (Claude undertriggers by default)
   - Keep under 1024 characters
   - Focus on user intent, not implementation details
5. Show before/after to user for approval
