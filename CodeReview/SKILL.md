---
name: CodeReview
description: Comprehensive multi-agent code review and codebase audit system. USE WHEN code review OR review PR OR review pull request OR review changes OR review commits OR review diff OR check my code OR audit code changes OR review this branch OR what did I change OR look over my code OR inspect my changes OR critique this PR OR give feedback on my changes OR audit this module OR audit this directory OR review this codebase OR audit code quality OR review code health OR audit architecture.
compatibility: Designed for Claude Code and Devin (or similar agent products). Requires git.
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

Previous architecture had all workflow files read in a single LLM session. The LLM would read the enforcement text and bypass it — rationalizing that the full pipeline was "overkill" and doing an ad-hoc review instead. Two rounds of text-based enforcement failed. Process boundaries solve this: the orchestrator can't skip what it never reads.

### Pipeline Steps

| Step | Agent | Input | Output | Artifact Check |
|------|-------|-------|--------|---------------|
| 1 | Setup | User request | `$REVIEW_DIR` created | Directory exists |
| 2 | GatherContext | Commit range or target path | `context.md` | File exists, non-empty |
| 3 | SelectDimensions | `context.md` + `Dimensions/` | `dimensions.json` | Valid JSON with dimension array |
| 4 | Review Agents (parallel) | Dimension file + `context.md` + file list | `dimension-[id].md` per agent | All agent output files exist |
| 5 | VerifyAndReport | Agent output file paths + `context.md` | `verified-findings.md` + `report.md` | `report.md` exists, output to user |

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

> **Pipeline stages** (GatherContext, SelectDimensions, VerifyAndReport) are internal — each runs as a separate agent. Review.md is the orchestrator.

## Dimension System

5 review dimensions organized by philosophical lens — each gives the agent a different way of looking at the same code. Dimensions are self-contained with persona, mental model, illustrative examples, severity calibration, and output format.

| ID | Dimension | Stance | Baseline |
|----|-----------|--------|----------|
| COR | **Correctness** | The Skeptic — "Is this right?" | Yes |
| CLA | **Clarity** | The First-Time Reader — "Does this explain itself?" | No |
| SIM | **Simplicity** | The Reductionist — "Is this the simplest version?" | Yes |
| RES | **Resilience** | The Devil's Advocate — "What will break this?" | Yes |
| STR | **Structure** | The Architect — "Is this where it belongs?" | No |

**Baseline dimensions** (COR, SIM, RES) are always included unless the review has <10 changed lines. Non-baseline dimensions (CLA, STR) are selected by the SelectDimensions agent based on context — included by default for medium+ diffs.

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

## Architecture Notes

The skill uses a **layered compression strategy**:
- Raw diff → Context Layer (slim, structured, agent-ready)
- Context Layer → Dimension Selection (which dimensions are relevant)
- Dimension Selection → Agent prompts (each agent gets one dimension file + context)
- Agent outputs → Per-dimension files (each agent writes its own, returns path only)
- Per-dimension files → VerifyAndReport (claim-check + synthesis + dedup + human-readable report, severity-ordered)

Agent count scales with **review target size and complexity**:

| Tier | Diff Lines | Audit Files | Agent Cap |
|------|-----------|-------------|-----------|
| Small | 1-50 | 1-10 | 3 |
| Medium | 50-300 | 10-50 | 5 |
| Large | 300+ | 50+ | 5 |
