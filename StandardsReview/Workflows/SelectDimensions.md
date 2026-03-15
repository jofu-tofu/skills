# SelectDimensions Workflow

> Internal workflow — invoked as a standalone agent by the orchestrator (Review.md), not user-facing.

## Input / Output

**Input:**
- Path to `context.md` (review context from GatherContext)
- Path to `Dimensions/` directory (language dimension rule files)

**Output:**
- Writes `dimensions.json` to `$REVIEW_DIR/dimensions.json`
- Returns the absolute path to `dimensions.json`

## Purpose

Select which language dimensions are relevant to this specific review, based on the detected languages and the available dimension files. No trigger matching — use judgment based on context + dimension descriptions.

## Scope Constraint

Read `context.md` and the dimension files. That is all you need. Do NOT explore the codebase, read source files, or run git commands. The context file already contains the diff, change fingerprint, and risk areas — everything required for dimension selection. Only explore the codebase if context.md is missing critical information that prevents dimension selection (this should be rare — GatherContext already did the exploration).

## Step 1: Read Context

Read the `context.md` file provided as input. Extract:
- Languages detected and file counts per language
- File-to-language map
- Size tier (Small/Medium/Large)
- Config context (what linters are active, what standards are enforced)

## Step 2: Discover Dimensions

Glob `Dimensions/**/*.md` (relative to the skill root) to find all dimension files. Exclude any INDEX.md files if present.

For each dimension file found:
1. Read the first section to understand what the dimension covers and what rules it contains
2. Note which language directory it belongs to
3. Identify if it's a baseline dimension for that language (the first/primary dimension per language is typically baseline)

Build a list of all available dimensions grouped by language.

## Step 3: Select Dimensions

Using the context from Step 1 and the dimension inventory from Step 2:

1. **Only select dimensions for detected languages** — if no `.rs` files are present, no Rust dimensions are selected regardless of context.

2. **Baseline dimensions always included** — for each detected language, the primary dimension is always included unless the review has fewer than 10 changed lines. Typical baselines:
   - React: Architecture (R1)
   - Rust: Ownership (Ru1)
   - Svelte: Reactivity (Sv1)
   - TypeScript: TypeSafety (TS1)
   - C#: AsyncPatterns (CS1)
   - Python: CodeOrganization (Py1)
   - Tailwind: ClassOrganization (TW1)
   - MUMPS: Standards (M1)

3. **Context-driven selection** — for non-baseline dimensions, use judgment:
   - What does the code actually do? (data fetching code activates DataFetching dimensions)
   - What framework features are used? (Server Components in React, Runes in Svelte)
   - What complexity is present? (generics activate TypeModeling, unsafe blocks activate UnsafeCode)

4. **No trigger conditions** — do not parse or match trigger syntax. Read the context, read what the dimension covers, decide if it's relevant.

## Step 4: Determine Sizing

Based on review size from context:

| Tier | Diff Lines | Audit Files | Agent Cap |
|------|-----------|-------------|-----------|
| Small | 1-50 | 1-10 | 4 |
| Medium | 50-300 | 10-50 | 8 |
| Large | 300+ | 50+ | 12 |

If selected dimensions exceed the agent cap, prioritize: baselines first, then by relevance to the specific changes.

## Step 5: Route Files

For each selected dimension, assign the subset of changed/target files relevant to it:
- React dimensions: `.tsx`, `.jsx` files
- TypeScript dimensions: `.ts` files (and `.tsx` for type-related dimensions)
- Rust dimensions: `.rs` files
- Python dimensions: `.py` files
- Svelte dimensions: `.svelte`, `.svelte.ts` files
- C# dimensions: `.cs` files
- Tailwind dimensions: files containing utility classes (`.tsx`, `.jsx`, `.svelte`, `.html`)
- MUMPS dimensions: `.m`, `.mac`, `.int` files

## Step 6: Write Output

Write `dimensions.json` to `$REVIEW_DIR/dimensions.json`:

```json
{
  "mode": "diff",
  "tier": "MEDIUM",
  "agent_cap": 8,
  "languages": ["TypeScript", "React"],
  "dimensions": [
    {
      "id": "TS1",
      "name": "Type Safety",
      "language": "TypeScript",
      "path": "/absolute/path/to/Dimensions/TypeScript/TypeSafety.md",
      "reason": "Baseline — always relevant for TypeScript code",
      "files": ["src/utils/auth.ts", "src/api/client.ts"]
    }
  ],
  "audit_summary": "Selected: N dimensions for M-line diff across K languages"
}
```

## Step 7: Print Selection Rationale

Output to chat for user transparency:
- How many dimensions selected and why
- Which languages were detected
- Which baselines were included per language
- Which non-baselines were added and the reasoning
- Sizing tier and agent cap
