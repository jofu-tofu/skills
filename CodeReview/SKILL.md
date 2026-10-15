---
name: CodeReview
description: Comprehensive multi-agent code review and codebase audit system. USE WHEN code review OR review PR OR review pull request OR review changes OR review commits OR review diff OR check my code OR audit code changes OR review this branch OR what did I change OR look over my code OR inspect my changes OR critique this PR OR give feedback on my changes OR audit this module OR audit this directory OR review this codebase OR audit code quality OR review code health OR audit architecture.
compatibility: Designed for Codex and Devin (or similar agent products). Requires git.
metadata:
  author: pai
  version: "1.0.0"
---

# CodeReview

Multi-agent code review and codebase audit system with **process-boundary enforcement**. Operates in two modes: **diff mode** (review changes against a commit range) and **audit mode** (evaluate existing code in a directory/module). Both modes achieve depth through parallelism — agents review different dimensions simultaneously while a slim context layer prevents token waste. Diff mode verifies claims against changed commits; audit mode verifies claims against actual file contents.

## Success Criteria

These criteria orient every workflow decision:

1. **Comprehensive** — No significant issue category goes unchecked (security, performance, architecture, correctness, style)
2. **Single-session** — Entire review fits in one context window, achieved via agents + context compression
3. **Credible** — Every flagged issue traces to an actual changed line in the specified commit range, or to a stated causal link from one; no false positives from pre-existing code
4. **Believable output** — Report is clear and concise enough that the user reads every word, not skims. No wall-of-text syndrome.
5. **Proportional** — Agent count and dimension selection scale with the size and nature of the changes
6. **Verified claims** — Issues discovered are cross-checked against the correct diff before reporting, and each carries an evidence label
7. **Domain-neutral core** — Domain knowledge arrives through the plug-in contract (`Standards/PluginContract.md`), never in this skill's own files

## Orchestrator Architecture (MANDATORY)

**This skill uses a thin orchestrator that spawns separate agents for each pipeline step.**

### Core Invariant

**The orchestrator (Review.md) NEVER reads workflow step files.** It only:
- Passes file paths to agents (agent prompts include the path to the workflow file the agent should read)
- Checks that artifacts exist between steps (e.g., `context.md` exists after GatherContext)
- Reads `dimensions.json` to know which review agents to spawn

Each pipeline step runs as a **separate agent invocation** (separate LLM session), creating real process boundaries that prevent bypass.

### Why Process Boundaries Matter

Previous architecture had all workflow files read in a single LLM session. The LLM would read the enforcement text and bypass it — rationalizing that the full pipeline was "overkill" and doing an ad-hoc review instead. Two rounds of text-based enforcement failed. Process boundaries solve this: the orchestrator can't skip what it never reads.

### Pipeline Steps

| Step | Agent | Input | Output | Artifact Check |
|------|-------|-------|--------|---------------|
| 1 | Setup | User request, optional `--plugin` manifest | `$REVIEW_DIR` created, `plugin.json` copied | Directory exists |
| 2 | GatherContext | Commit range or target path, manifest | `context.md` | File exists, non-empty, no `PLUGIN ERROR` |
| 3 | SelectDimensions | `context.md` + `Dimensions/` + manifest | `dimensions.json` | Valid JSON object with a `dimensions` array |
| 4 | Review Agents (parallel) | Dimension file + addenda + `context.md` + file list | `dimension-[id].md` per agent | All agent output files exist |
| 5 | VerifyAndReport | Agent output paths + `context.md` + `dimensions.json` + manifest | `verified-findings.md` + `report.md` | `report.md` exists, output to user |

When triggered, you MUST:
1. Read `Workflows/Review.md` FIRST — before reading any source code or diffs
2. Follow Review.md's orchestrator steps — each step spawns an agent with a workflow file path
3. Check artifacts between steps as specified
4. Do NOT read workflow files (GatherContext.md, SelectDimensions.md, etc.) yourself — agents read their own instructions

## Workflow Routing

**When executing a workflow, output this notification IMMEDIATELY upon reading Review.md — before any other actions:**

```
Running the **Review** workflow from the **CodeReview** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **Review** | "code review", "review my PR", "review this branch", "review my changes", "review my commits", "review last N commits", "check my code", "audit my changes", "what did I change", "do a code review", "run a review", "audit this module", "audit this directory", "review this codebase", "audit code quality", "review code health", "audit architecture" | `Workflows/Review.md` |
| **ReReview** | "re-review my fix", "did my fix work", "check fix for regressions", "review the fix delta" | `Workflows/ReReview.md` |
| **SeriesReview** | "review commit series", "review this commit stack", "commit by commit review" | `Workflows/SeriesReview.md` |

> **Pipeline stages** (GatherContext, SelectDimensions, VerifyAndReport) are internal — each runs as a separate agent. Review.md is the orchestrator. ReReview and SeriesReview reuse Review.md's steps with the differences their files describe.

## Dimension System

8 review **lenses**, each a philosophical stance: a different way of looking at the same code. Lenses are self-contained with persona, mental model, illustrative examples, severity calibration, boundaries, and output format. A new lens has to pass the lens test in `SkillIntent.md`, and every lens stays within the size budget (`Tools/CheckDimensionBudget.ts`).

| ID | Lens | Stance | Runs |
|----|------|--------|------|
| COR | **Correctness** | The Skeptic — "Is this right, and would a test catch it if it weren't?" | Baseline |
| RES | **Resilience** | The Devil's Advocate — "What will break this?" | Baseline |
| SIM | **Simplicity** | The Reductionist — "Is this the simplest version?" | Baseline |
| CLA | **Clarity** | The First-Time Reader — "Does this explain itself?" | Baseline |
| SEC | **Security** | The Attacker — "Which input do you trust that I control?" | Triggered, any size |
| IMP | **Impact & Compatibility** | The Downstream Consumer — "What did you just break for me?" | Triggered |
| INT | **Intent Conformance** | The Spec Checker — "Where was this asked for?" | When intent is stated |
| STR | **Structure** | The Architect — "Is this where it belongs?" | Medium+ or new modules |

SelectDimensions picks lenses by what the change touches as well as by its size, and never drops SEC or INT for the agent cap.

**Standards dimensions** (`kind: standards`) are rule-based checks routed by file type. They come from plug-ins, run as their own agents (at most 3), and report in the report's Standards section.

## Plug-in Contract

A wrapper skill adds a domain without changing this skill. It passes `--plugin <manifest>` with four optional, file-only inputs: standards dimension directories, per-lens addenda (200 words or fewer), context fragments, and external findings. A plug-in can't add a lens. See `Standards/PluginContract.md`.

## Examples

**Example 1: Branch review**
```
User: "Do a code review of my last 3 commits"
-> Invokes Review workflow
-> Orchestrator spawns agents: GatherContext → SelectDimensions → N Review Agents → VerifyAndReport
```

**Example 2: PR review**
```
User: "Review my PR"
-> Invokes Review workflow
-> Asks for branch name or PR number if not provided
```

**Example 3: Scoped review**
```
User: "Review just the auth changes"
-> Invokes Review workflow
-> Scopes diff to auth-related files only
```

**Example 4: Codebase audit**
```
User: "Audit the src/auth/ module"
-> Invokes Review workflow in audit mode
-> Agents review full file set, not a diff
```

**Example 5: Follow-up after fixes**
```
User: "I fixed the review findings, did my fix work?"
-> Invokes ReReview workflow
-> Reviews the fix delta with COR, RES and IMP and assigns each prior finding Fixed, Partly fixed, Not fixed or Regressed
```

**Example 6: Wrapper with a plug-in**
```
A domain wrapper skill runs its own scripts and lookups, writes a manifest, then calls the Review workflow with --plugin
-> GatherContext merges the wrapper's context fragments
-> SelectDimensions adds the wrapper's standards dimensions and attaches its addenda to lenses
-> VerifyAndReport reports the wrapper's script findings in the Standards section
```

## Architecture Notes

The skill uses a **layered compression strategy**:
- Raw diff → Context Layer (slim, structured, agent-ready)
- Context Layer → Dimension Selection (which dimensions are relevant)
- Dimension Selection → Agent prompts (each agent gets one dimension file + context)
- Agent outputs → Per-dimension files (each agent writes its own, returns path only)
- Per-dimension files → VerifyAndReport (claim-check + synthesis + dedup + human-readable report, severity-ordered)

Agent count scales with **review target size and complexity**:

| Tier | Diff Lines | Audit Files | Lens Cap | Standards Cap |
|------|-----------|-------------|----------|---------------|
| Small | 1-50 | 1-10 | 4 | 3 |
| Medium | 50-300 | 10-50 | 6 | 3 |
| Large | 300+ | 50+ | 8 | 3 |
