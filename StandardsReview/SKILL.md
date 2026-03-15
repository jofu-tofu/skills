---
name: StandardsReview
description: "Language-specific coding standards review. Reviews code against 283 rules across 8 languages (React, Rust, Svelte, Tailwind, TypeScript, C#, Python, MUMPS). USE WHEN review code standards OR review coding standards OR check my code standards OR standards review OR review my TypeScript OR review my React OR review my Rust OR review my Python OR review my Svelte OR review my C# OR check language best practices OR lint my code with standards."
compatibility: Designed for Claude Code and Devin (or similar agent products)
metadata:
  author: pai
  version: "1.0.0"
---

# StandardsReview

Multi-agent language-specific standards review with **process-boundary enforcement**. **283 rules across 8 languages.** Operates in two modes: **diff mode** (review changes against a commit range) and **audit mode** (evaluate existing code in a directory/module). Achieves depth through parallelism — agents review different language dimensions simultaneously while a slim context layer prevents token waste. Diff mode verifies claims against changed commits; audit mode verifies claims against actual file contents.

Complementary to CodeReview (cross-cutting concerns like architecture, logic errors, complexity). This skill reviews language-specific correctness: type safety, naming conventions, framework patterns, performance idioms.

## Success Criteria

These criteria orient every workflow decision:

1. **Language-specific** — Every finding traces to a specific rule ID from the dimension files
2. **Single-session** — Entire review fits in one context window, achieved via agents + context compression
3. **Credible** — Every flagged issue traces to an actual changed line in the specified commit range; no false positives from pre-existing code
4. **Believable output** — Report is clear and concise enough that the user reads every word, not skims. No wall-of-text syndrome.
5. **Proportional** — Agent count and dimension selection scale with the size and nature of the changes
6. **Verified claims** — Issues discovered are cross-checked against the correct diff before reporting

## Orchestrator Architecture (MANDATORY)

**This skill uses a thin orchestrator that spawns separate agents for each pipeline step.**

### Core Invariant

**The orchestrator (Review.md) NEVER reads workflow step files.** It only:
- Passes file paths to agents (agent prompts include the path to the workflow file the agent should read)
- Checks that artifacts exist between steps (e.g., `context.md` exists after GatherContext)
- Reads `dimensions.json` to know which review agents to spawn

Each pipeline step runs as a **separate agent invocation** (separate LLM session), creating real process boundaries that prevent bypass.

### Why Process Boundaries Matter

Previous architecture had all workflow files read in a single LLM session. The LLM would read the enforcement text and bypass it — rationalizing that the full pipeline was "overkill" and doing an ad-hoc review instead. Process boundaries solve this: the orchestrator can't skip what it never reads.

### Pipeline Steps

| Step | Agent | Input | Output | Artifact Check |
|------|-------|-------|--------|---------------|
| 1 | Setup | User request | `$REVIEW_DIR` created | Directory exists |
| 2 | GatherContext | Commit range or target path | `context.md` | File exists, non-empty |
| 3 | SelectDimensions | `context.md` + `Dimensions/` | `dimensions.json` | Valid JSON with dimension array |
| 4 | Review Agents (parallel) | Dimension file + `context.md` + file list | `dimension-[id].md` per agent | All agent output files exist |
| 5 | VerifyAndReport | Agent output file paths + `context.md` | `verified-findings.md` + `report.md` | File exists, output to user |

When triggered, you MUST:
1. Read `Workflows/Review.md` FIRST — before reading any source code or diffs
2. Follow Review.md's orchestrator steps — each step spawns an agent with a workflow file path
3. Check artifacts between steps as specified
4. Do NOT read workflow files (GatherContext.md, SelectDimensions.md, etc.) yourself — agents read their own instructions

## Workflow Routing

**When executing a workflow, output this notification IMMEDIATELY upon reading Review.md — before any other actions:**

```
Running the **Review** workflow from the **StandardsReview** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **Review** | "review code standards", "review coding standards", "check standards", "review my TypeScript", "review my React code", "standards review", "lint with standards", "check language best practices" | `Workflows/Review.md` |

> **Pipeline stages** (GatherContext, SelectDimensions, VerifyAndReport) are internal — each runs as a separate agent. Review.md is the orchestrator.

## Language Coverage

| Language | File Signals | Dimensions | Rules |
|----------|-------------|------------|-------|
| React / Next.js | `.tsx`, `.jsx`, React imports, `next.config.*`, `use client`, `use server` | Architecture, DataFetching, ServerComponents, RenderingPerf, BundleSize, JavaScriptPerf | 65 |
| Rust | `.rs`, `Cargo.toml`, `Cargo.lock`, `build.rs` | Ownership, ErrorHandling, Concurrency, Performance, TypeSystem, UnsafeCode, APIDesign, Testing, MemoryLifetimes, ProjectStructure | 73 |
| Svelte / SvelteKit | `.svelte`, `.svelte.ts`, `svelte.config.*`, `+page.svelte` | Reactivity, Architecture, TypeSystem, DataForms, PerformanceSSR | 36 |
| Tailwind CSS | `tailwind.config.*`, `@tailwind`, `@apply`, `@theme`, utility classes | ClassOrganization, LayoutAndTheming, Accessibility, Philosophy | 32 |
| TypeScript | `.ts` (non-React), `tsconfig.json`, generics, Zod imports | TypeSafety, TypeModeling, ErrorHandling, Conventions | 19 |
| C# / .NET | `.cs`, `.csproj`, `.sln` | AsyncPatterns, MemberDesign, NullSafety, Architecture | 18 |
| Python | `.py`, `pyproject.toml`, `requirements.txt` | CodeOrganization, DefensiveAndPerformance, TypeSystem | 18 |
| MUMPS / M | `.m`, `.mac`, `.int`, M commands, globals (`^`) | Standards, SafetyPatterns | 22 |

## Dimension System

38 review dimensions organized by language. Each dimension file is self-contained with inlined rules, detection heuristics, severity calibration, and examples.

**Baseline dimensions** per language are always included unless the review has <10 changed lines. Non-baseline dimensions are selected by the SelectDimensions agent based on context.

> **Architecture note:** All rule content is inlined directly in dimension files. There is no separate Rules/ directory. Each rule uses `### ID RuleName` format.

## Examples

**Example 1: Standards review of a branch**
```
User: "Review my code against standards"
-> Invokes Review workflow
-> Orchestrator spawns agents: GatherContext -> SelectDimensions -> N Review Agents -> VerifyAndReport
```

**Example 2: TypeScript-specific review**
```
User: "Review my TypeScript for standards violations"
-> Invokes Review workflow
-> Detects TypeScript, selects TS dimensions
-> Agents check against TypeScript rules
```

**Example 3: Multi-language review**
```
User: "Check my React + TypeScript code against standards"
-> Invokes Review workflow
-> Detects React + TypeScript
-> Spawns agents for both language dimension sets
```

**Example 4: Codebase audit**
```
User: "Audit the src/ directory against coding standards"
-> Invokes Review workflow in audit mode
-> Agents review full file set, not a diff
```

## Architecture Notes

The skill uses a **layered compression strategy**:
- Raw diff -> Context Layer (slim, structured, agent-ready with language detection)
- Context Layer -> Dimension Selection (which language dimensions are relevant)
- Dimension Selection -> Agent prompts (each agent gets one dimension file + context)
- Agent outputs -> Per-dimension files (each agent writes its own, returns path only)
- Per-dimension files -> VerifyAndReport (claim-check against commit range, synthesize, generate report in single pass)

Agent count scales with **review target size and complexity**:

| Tier | Diff Lines | Audit Files | Agent Cap |
|------|-----------|-------------|-----------|
| Small | 1-50 | 1-10 | 4 |
| Medium | 50-300 | 10-50 | 8 |
| Large | 300+ | 50+ | 12 |
