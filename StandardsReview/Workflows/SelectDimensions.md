# SelectDimensions Workflow

> Internal workflow — invoked as a standalone agent by the orchestrator (Review.md), not user-facing.

Read [ReviewContract](../Standards/ReviewContract.md); it owns the selection-object schema and scheduling/coverage semantics.

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

Filter to detected language families first. For each applicable dimension file:
1. Read the first section to understand what the dimension covers and what rules it contains
2. Note which language directory it belongs to
3. Use the explicit baseline list in Step 3, not filesystem order

Build a list of all available dimensions grouped by language.

## Step 3: Select Dimensions

Using the context from Step 1 and the dimension inventory from Step 2:

1. **Only select dimensions for detected languages** — if no `.rs` files are present, no Rust dimensions are selected regardless of context.

2. **Baseline dimensions** — inspect the listed baseline for each detected family, including audits, and select it when at least one scoped file has an applicable responsibility. If no rule applies, record the baseline and the concrete reason in exclusions rather than creating an empty reviewer assignment. Never omit a consequential obligation solely because a diff is small. These names identify rule files; finding IDs come from their actual rules, not selection labels. Baselines:
   - React: Architecture
   - Rust: Ownership
   - Svelte: Reactivity
   - TypeScript: TypeSafety
   - C#: AsyncPatterns
   - Python: CodeOrganization
   - Tailwind: ClassOrganization
   - MUMPS: Standards

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

The cap controls concurrency, not coverage. Prioritize dispatch order (baselines, then consequence/relevance) and queue the rest within host capacity. Explicit user limits can leave named coverage incomplete; do not silently drop dimensions/languages. Resolve tier boundaries consistently: Small up to 50 diff lines or 10 audit files; Medium up to 300 lines or 50 files; Large above that.

## Step 5: Route Files

For each selected dimension, assign files by responsibility and framework/module role using the complete manifest. The extensions below are examples, not exclusion lists. Inspect imports, directives, routes and configuration before deciding relevance. Include React server actions/loaders in JS/TS modules (including `use server`), SvelteKit server loaders/actions/endpoints and hooks in JS/TS, and Tailwind CSS/theme/plugin/configuration owners. Server-only and CSS-only changes still need their applicable framework responsibilities. A plain unrelated TypeScript utility does not acquire framework dimensions merely from its extension. Record unsupported or omitted responsibilities explicitly.

Common examples:
- React dimensions: `.tsx`, `.jsx` files
- TypeScript dimensions: `.ts`, `.tsx`, and TypeScript-bearing `.svelte`/`.svelte.ts` files for applicable type responsibilities
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
      "reason": "Applicable boundary checks: auth and client modules handle unknown external input",
      "files": ["src/utils/auth.ts", "src/api/client.ts"]
    }
  ],
  "exclusions": [],
  "audit_summary": "Selected: N dimensions for M-line diff across K languages"
}
```

## Step 7: Print Selection Rationale

Before returning, validate unique dimension IDs, existing paths inside the supplied skill, scoped files, and selected or explicitly excluded responsibilities for every detected language. Audit summaries use audit file counts, not changed-line thresholds. A rule in multiple inlined dimensions remains one rule identity; duplicate text is not extra independent coverage.

Output to chat for user transparency:
- How many dimensions selected and why
- Which languages were detected
- Which baselines were included per language
- Which non-baselines were added and the reasoning
- Sizing tier and agent cap
