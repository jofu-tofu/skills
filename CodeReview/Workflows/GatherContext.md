# GatherContext Workflow

> Internal workflow — invoked by Review.md, not user-facing.

## Input / Output

**Input:**
- Review target: commit range (diff mode) or target path (audit mode)
- Requested lenses: any `/SkillName` arguments from user
- Review mode: diff or audit

**Output:**
- Writes context layer to `$REVIEW_DIR/context.md`
- Returns the absolute path to `context.md`

Gather everything a fresh orchestrator needs to intelligently partition code review into focused, disjoint review agents — not just the changes, but the full landscape of standards, rules, and context that determine what "good" looks like for these specific changes.

## First Principles

This workflow exists because **code review is a delegation problem**. The orchestrator receiving this context is a fresh session. It has never seen the codebase, the changes, or the project's conventions. It must:

1. **Understand what changed** — the diff, the scope, the intent
2. **Understand what "correct" means for these changes** — which standards, rules, skills, and conventions apply
3. **Partition review intelligently** — split into disjoint dimensions where each agent goes deep with the right rules

Without comprehensive context, the orchestrator either delegates blindly (agents review without knowing the rules) or doesn't delegate at all (single shallow pass). The context layer is the difference between a review that catches "this violates your TypeScript conventions" and one that only catches "this variable is unused."

**Why comprehensiveness matters more than brevity here:** Every piece of context that the orchestrator doesn't have is a review dimension it can't construct. A missed coding standard is a class of issues that won't be caught. A missed user argument is a lens the user asked for that gets silently dropped. The context layer should be dense signal — not bloated, but complete.

## Step 1: Gather Review Target Context

This step operates differently depending on review mode. Both produce a fingerprint for dimension construction.

### Diff Mode — Gather Change Context

Establish the commit range, then capture everything about what changed and why.

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
- Files changed (categorized by type: `.ts`, `.tsx`, `.md`, config, test, etc.)
- Total lines added/removed
- New files vs modifications vs deletions
- Commit messages (these reveal intent)

**Intent signals** (attempt in priority order):
1. PR description — `gh pr view [number] --json title,body,labels`
2. Linked tickets — look for references in commit messages (JIRA-123, #456)
3. Recent conversation — has the user explained what they're building?
4. Commit messages — extract stated reasons from `git log`

If no intent available: note "Intent: unavailable — review will focus on technical correctness"

**Change fingerprint:**
```
- Languages: [TypeScript, React/TSX, CSS, ...]
- Domains: [API endpoints, UI components, data models, config, tests, ...]
- Patterns: [New feature, refactor, bug fix, dependency update, ...]
- Risk areas: [Auth-related, DB queries, external API calls, user data, ...]
- Size tier: [Small (1-50 lines) / Medium (50-300) / Large (300+)]
```

### Audit Mode — Gather Target Context

Establish the target path, then capture everything about the codebase section being audited.

**Target path** (from Review.md Step 1):
- Directory path, module path, or explicit file list

```bash
# Understand the target
find [target-path] -type f -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.py' -o -name '*.svelte' | head -200
find [target-path] -type f | wc -l
find [target-path] -type d | head -50
wc -l [target-path]/**/* 2>/dev/null | tail -1
```

**Capture:**
- Files in target (categorized by type: `.ts`, `.tsx`, `.md`, config, test, etc.)
- Total line count of the target
- Directory structure and nesting depth
- Module boundaries (directories with their own index/barrel files)

**Intent signals** (attempt in priority order):
1. User's stated concern — "audit for architecture issues", "check simplification opportunities"
2. Recent conversation — has the user explained what they're looking for?
3. Target README or CLAUDE.md — extract stated purpose of this module

If no intent available: note "Intent: general health audit — all dimensions activated"

**Target fingerprint:**
```
- Languages: [TypeScript, React/TSX, CSS, ...]
- Domains: [API endpoints, UI components, data models, config, tests, ...]
- Structure: [Flat / Nested / Deep hierarchy]
- Risk areas: [Auth-related, DB queries, external API calls, user data, ...]
- Size tier: [Small (1-10 files) / Medium (10-50 files) / Large (50+ files)]
- Complexity signals: [Multi-language, deep imports, generated code present]
```

## Step 2: Gather Review Context

This is the step most review systems skip. Beyond the diff, gather everything that tells the orchestrator what rules and standards apply to these changes. Context sources are open-ended — scan for whatever is available.

**Context source categories:**

| Category | What to look for | Examples |
|----------|-----------------|----------|
| **Coding standards** | Language-specific rules, style guides, best practices | `.eslintrc`, `biome.json`, `.prettierrc`, `tsconfig.json` strict settings, project style guides, `CONTRIBUTING.md` |
| **Testing philosophy** | How this project approaches tests, what coverage expectations exist | TestDriven skill (10 core principles), test config files, existing test patterns |
| **Project conventions** | Architecture decisions, patterns, constraints documented in the project | `CLAUDE.md`, `DEVELOPMENT.md`, ADRs (`docs/adr/`), `CONTRIBUTING.md` |
| **Domain-specific rules** | Security policies, accessibility standards, performance budgets | WebDesign skill (WCAG rules), security policies, performance configs |
| **User-specified lenses** | Skills or focus areas the user explicitly requested | Any `/SkillName` arguments passed alongside `/CodeReview` |
| **Architectural decisions** | Past decisions that constrain what "correct" looks like | ADR files, decision logs, `DECISIONS.md`, git blame for contested areas |
| **Revision history** | Past reviews, known tech debt, deferred decisions | Previous review reports, TODO comments in changed files, linked ticket history |

**How to gather:**
1. Check what the user passed as arguments — these are mandatory lenses
2. Read `CLAUDE.md` and any project convention files in the repo root
3. For other matched PAI skills (TestDriven, WebDesign, etc.), read their key rules/principles — extract the SUBSET relevant to the changed files, not the entire skill
4. Check for config files that encode standards (`.eslintrc`, `tsconfig.json`, `biome.json`, etc.)
5. Look for ADRs or decision documents if the changes touch architectural boundaries

**The goal is not to load everything** — it's to identify which rules and standards the review agents need to know about so they can evaluate the changes against the right criteria. Extract the relevant subset, not the full content.

## Step 3: Produce Context Layer

Compress everything into a structured context layer — designed to be injected into the orchestrator's working memory. This document must enable the orchestrator to construct review dimensions without re-scanning.

```markdown
## CodeReview Context Layer

**Mode:** [diff | audit]

### Review Target
<!-- Diff mode -->
**Commit range:** [SHA..SHA or branch..HEAD]
**Changed files:** [N files — list with type categorization]
**Size:** [+X / -Y lines | Size tier]

<!-- Audit mode -->
**Target path:** [directory or file list]
**Target files:** [N files — list with type categorization]
**Size:** [N files, M total lines | Size tier]
**Structure:** [Flat / Nested / Deep hierarchy | N modules]

### Intent
[1-3 sentences: what this change is trying to accomplish (diff) or what the user wants evaluated (audit)]

### Fingerprint
- Languages: [list]
- Domains: [list]
- Patterns: [list] (diff: New feature, refactor, etc. | audit: Module health, architecture review, etc.)
- Risk areas: [list]

### Review Context Sources
[For each context source discovered, summarize what rules/standards it contributes:]

**[Category]: [Source name]**
- [Key rules/principles relevant to these changes, extracted — not full content]
- [Number of relevant rules/configs found]

**[Category]: [Source name]**
- [Key rules/principles relevant to these changes]

### Requested Lenses
[Skill names passed as arguments, or "none — dimensions constructed from fingerprint + discovered context only"]

### Dimension Signals
[Based on the change fingerprint + review context sources, list the natural dimension partitions:]
- [Dimension 1]: [What it covers] — [Which context sources feed it]
- [Dimension 2]: [What it covers] — [Which context sources feed it]
- [Dimension N]: ...

[These are suggestions, not prescriptions — the orchestrator decides final partitioning]

### Full Diff
[Attached below or referenced by path]
```

Create a timestamped review directory and write the context layer there:

```
REVIEW_DIR=_output/contexts/[context-slug]/reviews/codereview/[YYYYMMDD-HHMMSS]
```

Write context layer to: `$REVIEW_DIR/context.md`

**This Write is the handoff contract.** The orchestrator checks for the existence of `context.md` before spawning the next agent — if this file is missing, the pipeline cannot proceed. Use the Write tool to create the file. After writing, verify it exists.

Do NOT pass context inline or in memory. The file on disk IS the context delivery mechanism.

All downstream workflows write their outputs to this same directory (`dimension-[id].md`, `verified-findings.md`, `report.md`).

## Follow-Up

Returns the path to `context.md` to the orchestrator. The orchestrator passes this path to the next agent (SelectDimensions).
