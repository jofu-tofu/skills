# GatherContext Workflow

> Internal workflow — invoked by Review.md, not user-facing.

Read [ReviewContract](../Standards/ReviewContract.md) for scope/path/artifact semantics. Use native available tools; shell snippets illustrate information to gather, not a mandatory shell.

## Input / Output

**Input:**
- Review target: commit range (diff mode) or target path (audit mode)
- Review mode: diff or audit

**Output:**
- Writes context layer to `$REVIEW_DIR/context.md`
- Returns the absolute path to `context.md`

Gather everything a fresh orchestrator needs to intelligently partition a language-specific standards review into focused, disjoint review agents — the changes, the languages present, and the file-to-language mapping that determines which dimensions activate.

## First Principles

This workflow exists because **standards review is a routing problem**. The orchestrator receiving this context is a fresh session. It has never seen the codebase, the changes, or the project's language mix. It must:

1. **Understand what changed** — the diff, the scope, the intent
2. **Understand what languages are present** — file extensions, framework signals, config files
3. **Route files to language dimensions** — each file maps to one or more language dimension sets

Without comprehensive context, the orchestrator either delegates blindly (agents review without knowing the rules) or routes incorrectly (TypeScript files sent to a React agent, or vice versa).

## Step 1: Gather Review Target Context

This step operates differently depending on review mode.

### Diff Mode — Gather Change Context

Resolve the exact requested range to base/head commits. Distinguish literal endpoint comparison from merge-base branch comparison and record the chosen semantics. Never substitute main...HEAD for an explicit range. Missing history/PR access or unresolved scope stays explicit; gather independent available evidence without inventing a base.

**Commit range** (ask or infer):
- Branch name (vs main/master)
- Specific commit SHA range
- PR URL or number
- "Last N commits"

```bash
# Get the full picture
git diff <resolved-base> <resolved-head> --stat
git diff <resolved-base> <resolved-head> -U5
git log <resolved-base>..<resolved-head> --format="%H %s%n%b"
git diff <resolved-base> <resolved-head> --name-status
```

**Capture:**
- Files changed (categorized by extension)
- Total lines added/removed
- New files vs modifications vs deletions
- Commit messages (these reveal intent)

**Change fingerprint:**
```
- Languages: [TypeScript, React/TSX, Rust, Python, ...]
- Domains: [API endpoints, UI components, data models, config, tests, ...]
- Patterns: [New feature, refactor, bug fix, dependency update, ...]
- Size tier: [Small (1-50 lines) / Medium (50-300) / Large (300+)]
```

### Audit Mode — Gather Target Context

Establish the target path, then capture the target's language composition.

Enumerate the actual target with `rg --files` or native tools, including all supported extensions and relevant configuration. Record generated/vendor exclusions, inaccessible paths and unsupported files. Do not silently truncate at a fixed count or treat an empty/missing target as clean. Keep the complete scoped manifest even when gathering in batches. An audit need not have Git history.

**Target fingerprint:**
```
- Languages: [TypeScript, React/TSX, Rust, Python, ...]
- Domains: [API endpoints, UI components, data models, config, tests, ...]
- Structure: [Flat / Nested / Deep hierarchy]
- Size tier: [Small (1-10 files) / Medium (10-50 files) / Large (50+ files)]
```

## Step 2: Detect Languages

From the complete file list, identify language and framework responsibilities using extensions plus module roles, imports, directives, routes and configuration. The following signals are nonexclusive. React server actions/loaders may be JS/TS without JSX; SvelteKit loaders/actions/endpoints and hooks may be JS/TS without a Svelte component. Include those framework owners when the project evidence supports them. Do not infer a framework for an unrelated TypeScript utility merely from its extension.

| Extensions | Language | Dimension Directory |
|-----------|----------|-------------------|
| `.tsx`, `.jsx` | React | `Dimensions/React/` |
| `.rs` | Rust | `Dimensions/Rust/` |
| `.svelte`, `.svelte.ts` | Svelte | `Dimensions/Svelte/` |
| `.ts` (non-React context) | TypeScript | `Dimensions/TypeScript/` |
| `.cs` | C# | `Dimensions/CSharp/` |
| `.py` | Python | `Dimensions/Python/` |
| `.m`, `.mac`, `.int` | MUMPS | `Dimensions/MUMPS/` |

**Tailwind:** inspect utility usage, CSS imports/directives (including v4 `@theme`), plugins and configuration. A CSS-only or configuration-only change can require Tailwind dimensions without class-bearing markup. Maps to `Dimensions/Tailwind/`; establish the version and role from actual project evidence.

**File-to-language mapping:** Assign every applicable responsibility. TSX can require React, TypeScript and Tailwind; Svelte with `lang="ts"` or `.svelte.ts` can require Svelte, TypeScript and Tailwind. Confirm framework/configuration/version signals rather than suffixes alone. In particular `.m` can be another language: require MUMPS syntax/project evidence. Deleted files remain relevant change evidence without pretending they are currently readable.

## Step 3: Gather Config Context

Check for configuration files that encode standards:
- `tsconfig.json` — strict mode, compiler options
- `Cargo.toml` — edition, features
- `biome.json`, `.eslintrc` — existing linting rules (to avoid duplication)
- `.prettierrc` — formatting config
- `svelte.config.*` — SvelteKit settings
- `pyproject.toml` — Python tooling settings

Note which linters/formatters are already configured — the review should focus on deeper standards, not things linters catch.

## Step 4: Produce Context Layer

Compress everything into a structured context layer:

```markdown
## StandardsReview Context Layer

**Mode:** [diff | audit]

### Review Target
<!-- Diff mode -->
**Commit range:** [SHA..SHA or branch..HEAD]
**Changed files:** [N files — list with extension categorization]
**Size:** [+X / -Y lines | Size tier]

<!-- Audit mode -->
**Target path:** [directory or file list]
**Target files:** [N files — list with extension categorization]
**Size:** [N files, M total lines | Size tier]

### Languages Detected
- [Language 1]: [N files] — [list of extensions found]
- [Language 2]: [N files] — [list of extensions found]

### File-to-Language Map
[For each file, which language(s) it maps to]

### Config Context
[For each relevant config file found, what standards it enforces]
[Note which linters/formatters are active — avoid duplicating their work]
[Framework/runtime versions, project exceptions, requested exclusions and unresolved applicability]

### Size Tier
[Small (1-50 lines / 1-10 files) | Medium (50-300 / 10-50) | Large (300+ / 50+)]

### Full Diff
[Attached below or referenced by path]

### Coverage limits
[Complete scoped manifest; unavailable history/source, generated/vendor exclusions and unsupported languages. No silent sampling.]
```

Write context layer to: `$REVIEW_DIR/context.md`

**This Write is the handoff contract.** The orchestrator checks for the existence of `context.md` before spawning the next agent — if this file is missing, the pipeline cannot proceed. Use the Write tool to create the file. After writing, verify it exists.

Do NOT pass context inline or in memory. The file on disk IS the context delivery mechanism.

All downstream workflows write their outputs to this same directory (`dimension-[id].md`, `verified-findings.md`, `report.md`).

## Follow-Up

Returns the path to `context.md` to the orchestrator. The orchestrator passes this path to the next agent (SelectDimensions).
