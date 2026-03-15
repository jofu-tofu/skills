# SelectDimensions Workflow

> Internal workflow — invoked as a standalone agent by the orchestrator (Review.md), not user-facing.

## Input / Output

**Input:**
- Path to `context.md` (review context from GatherContext)
- Path to `Dimensions/` directory (dimension rule files)

**Output:**
- Writes `dimensions.json` to `$REVIEW_DIR/dimensions.json`
- Returns the absolute path to `dimensions.json`

## Purpose

Select which review dimensions are relevant to this specific review, based on the context and the available dimension files. No trigger matching — use judgment based on context + dimension descriptions.

## Scope Constraint

Read `context.md` and the dimension files. That is all you need. Do NOT explore the codebase, read source files, or run git commands. The context file already contains the diff, change fingerprint, and risk areas — everything required for dimension selection. Only explore the codebase if context.md is missing critical information that prevents dimension selection (this should be rare — GatherContext already did the exploration).

## Step 1: Read Context

Read the `context.md` file provided as input. Extract:
- Languages in the change fingerprint
- Domains touched (API, UI, data, config, tests)
- Size tier (Small/Medium/Large)
- Intent (new feature, refactor, bug fix)
- Risk areas identified

## Step 2: Discover Dimensions

Glob `Dimensions/**/*.md` (relative to the skill root) to find all dimension files.

For each dimension file found:
1. Read the YAML frontmatter to get: id, name, baseline flag
2. Read the persona and mental model sections to understand what the dimension covers

Build a list of all available dimensions with their metadata.

## Step 3: Select Dimensions

Using the context from Step 1 and the dimension inventory from Step 2:

1. **Baseline dimensions always included** — any dimension with `baseline: true` in frontmatter is included unless the review has fewer than 10 changed lines. Baselines are: COR (Correctness), SIM (Simplicity), RES (Resilience).

2. **Context-driven selection** — for non-baseline dimensions, use judgment:
   - **Clarity (CLA):** Favor including when context signals: new public API surface, renamed/restructured interfaces, new abstractions, changes touching shared/exported modules, or PR description mentions "refactor" or "rename."
   - **Structure (STR):** Favor including when context signals: changes spanning 3+ directories, new files/modules created, import graph changes, dependency additions, or changes touching module boundaries/index files.
   - For medium+ diffs (50+ lines), include all 5 lenses by default.

3. **No trigger conditions** — do not parse or match trigger syntax. Read the context, read what the dimension covers, decide if it's relevant. These are guidance signals, not rigid triggers — use judgment.

## Step 4: Determine Sizing

Based on review size from context:

| Tier | Diff Lines | Audit Files | Agent Cap |
|------|-----------|-------------|-----------|
| Small | 1-50 | 1-10 | 3 |
| Medium | 50-300 | 10-50 | 5 |
| Large | 300+ | 50+ | 5 |

If selected dimensions exceed the agent cap, prioritize: baselines first, then by relevance to the specific changes.

## Step 5: Route Files

For each selected dimension, assign the subset of changed/target files relevant to its concern:
- Correctness: all changed files (universal)
- Clarity: files with new/renamed public interfaces, refactored modules
- Simplicity: files with significant additions or modifications
- Resilience: all changed files (universal)
- Structure: entire modules/directories affected, especially new files

## Step 6: Write Output

Write `dimensions.json` to `$REVIEW_DIR/dimensions.json`:

```json
{
  "mode": "diff",
  "tier": "MEDIUM",
  "agent_cap": 5,
  "dimensions": [
    {
      "id": "COR",
      "name": "Correctness",
      "path": "/absolute/path/to/Dimensions/Correctness.md",
      "reason": "Baseline — always included",
      "files": ["src/auth/login.ts", "src/api/routes.ts"]
    }
  ],
  "audit_summary": "Selected: N dimensions for M-line diff across K modules"
}
```

## Step 7: Print Selection Rationale

Output to chat for user transparency:
- How many dimensions selected and why
- Which baselines were included
- Which non-baselines were added and the reasoning
- Sizing tier and agent cap
