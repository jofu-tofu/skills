# GatherContext Workflow

> Internal workflow — invoked by Review.md, not user-facing.

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

Establish the commit range, then capture everything about what changed.

**Commit range** (ask or infer):
- Branch name (vs main/master)
- Specific commit SHA range
- PR URL or number
- "Last N commits"

```bash
# Get the full picture
git diff main...HEAD --stat
git diff main...HEAD -U5
git log main...HEAD --format="%H %s%n%b"
git diff main...HEAD --name-only
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

```bash
# Understand the target
find [target-path] -type f -name '*.ts' -o -name '*.tsx' -o -name '*.rs' -o -name '*.py' -o -name '*.svelte' -o -name '*.cs' -o -name '*.m' | head -200
find [target-path] -type f | wc -l
find [target-path] -type d | head -50
```

**Target fingerprint:**
```
- Languages: [TypeScript, React/TSX, Rust, Python, ...]
- Domains: [API endpoints, UI components, data models, config, tests, ...]
- Structure: [Flat / Nested / Deep hierarchy]
- Size tier: [Small (1-10 files) / Medium (10-50 files) / Large (50+ files)]
```

## Step 2: Detect Languages

From the file list, identify all languages present using file extension signals:

| Extensions | Language | Dimension Directory |
|-----------|----------|-------------------|
| `.tsx`, `.jsx` | React | `Dimensions/React/` |
| `.rs` | Rust | `Dimensions/Rust/` |
| `.svelte`, `.svelte.ts` | Svelte | `Dimensions/Svelte/` |
| `.ts` (non-React context) | TypeScript | `Dimensions/TypeScript/` |
| `.cs` | C# | `Dimensions/CSharp/` |
| `.py` | Python | `Dimensions/Python/` |
| `.m`, `.mac`, `.int` | MUMPS | `Dimensions/MUMPS/` |

**Tailwind:** detected if any HTML/JSX/Svelte file contains utility class patterns or if `tailwind.config.*` exists. Maps to `Dimensions/Tailwind/`.

**File-to-language mapping:** Build a map of which files belong to which language(s). A `.tsx` file maps to both React and TypeScript. A `.svelte` file maps to both Svelte and potentially Tailwind.

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

### Size Tier
[Small (1-50 lines / 1-10 files) | Medium (50-300 / 10-50) | Large (300+ / 50+)]

### Full Diff
[Attached below or referenced by path]
```

Write context layer to: `$REVIEW_DIR/context.md`

**This Write is the handoff contract.** The orchestrator checks for the existence of `context.md` before spawning the next agent — if this file is missing, the pipeline cannot proceed. Use the Write tool to create the file. After writing, verify it exists.

Do NOT pass context inline or in memory. The file on disk IS the context delivery mechanism.

All downstream workflows write their outputs to this same directory (`dimension-[id].md`, `verified-findings.md`, `report.md`).

## Follow-Up

Returns the path to `context.md` to the orchestrator. The orchestrator passes this path to the next agent (SelectDimensions).
