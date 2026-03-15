---
name: ContextLayer
description: Generate and maintain slim, high-signal CLAUDE.md context files for AI agents. USE WHEN the request involves creating, reviewing, correcting, shrinking, or refreshing CLAUDE.md files — whether the user says so explicitly or describes symptoms like "agents are confused", "context is stale", "CLAUDE.md is too big", "just started a new project", "agents keep putting things in the wrong place", "my skill is getting confused about its own structure", "agents don't know about our workaround", "why did we implement it this way is lost", "context hasn't been updated in a while", or "I just added a new module and agents don't know about it". Covers the full lifecycle of agent context files. For README, API docs, or non-CLAUDE.md documentation, handle directly without this skill.
compatibility: Designed for Claude Code and Devin (or similar agent products)
metadata:
  author: pai
  version: "1.0.0"
---

# ContextLayer

Generates and maintains the full hierarchical CLAUDE.md tree for a project.
Minimizes **fusion friction** — every wrong or stale line in CLAUDE.md causes
agents to operate with bad context and produce subtly wrong behavior.

**Context layer = tree**, not a single file. Root CLAUDE.md for global
orientation; subdirectory CLAUDE.md files for scoped domain context.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **Generate** | No CLAUDE.md exists, full rebuild needed, new project onboarding | `Workflows/Generate.md` |
| **Audit** | CLAUDE.md may be wrong/outdated/incomplete, agent confusion reported | `Workflows/Audit.md` |
| **Prune** | CLAUDE.md too large or noisy, token budget exceeded, reduce overhead | `Workflows/Prune.md` |
| **Drift** | Check staleness via commit-delta + structural fingerprint, cheap diagnostic | `Workflows/Drift.md` |

### Workflow Selection Guide

Choose based on what state the user's context is in:

- **Generate** — project starting fresh, existing context so wrong it's faster to rebuild than repair, onboarding a new AI agent to a codebase for the first time
- **Audit** — file exists but might be lying, user reports agent confusion, suspects stale info, codebase changed since context was written
- **Prune** — content may be correct but there's too much of it, context files bloated, hitting token limits
- **Drift** — cheap git-only diagnostic that tells you *which* files need Audit, not what's wrong with them. Run Drift before Audit to avoid auditing files that haven't changed.

## When It's Ambiguous

Some requests don't clearly signal which workflow to use. Resolve by asking one question:

- **"improve / fix / make better"** → ask: *Is the content wrong, or is it too long?*
  - Content wrong or outdated → Audit
  - Too long or noisy → Prune

- **"look at my CLAUDE.md" / bare "context layer"** → ask: *What's the problem you're trying to solve?*
  - No CLAUDE.md yet → Generate
  - Might be stale → Audit
  - Too long → Prune

When genuinely unclear, default to **Audit** — verifying the existing context is the
most common need and causes no harm if the content was already correct.

## Quick Reference

- **Generate** → parallel haiku agents per subsystem → synthesized CLAUDE.md tree
- **Audit** → new-content scan + haiku agents verify claims → auto-apply corrections
- **Prune** → content-only pass (no filesystem reads) → remove low-signal lines
- **Drift** → commit-delta + tree-sig fingerprint → diagnostic report, no file changes
- **Budget:** Root 800–1500 tokens | Subdir 200–500 tokens
- **Auto-apply:** All workflows write changes directly — reversible via git
- **Protected:** `## Context Maintenance` sections are never removed by Prune (see Prune Step 2.5)
- **Scope:** All workflows support targeted mode — specify a directory to operate on just that subtree
- **Dependency map:** Generate (targeted) maps imports + consumers → adds ## Dependencies section

## Context Files

- `ScanProtocol.md` — What to scan and in what order; haiku agent dispatch rules
- `BudgetModel.md` — Token budget math and per-file allocation
- `HaikuAgentPattern.md` — Prompt template, JSON schema, retry/fallback spec
- `PruningInstruction.md` — Template embedded at bottom of every generated CLAUDE.md
- `DesignRationale.md` — Hypothesis verdicts (H1–H6) and RedTeam findings

## Examples

```
// Explicit triggers
"generate a CLAUDE.md for this project"          → Generate
"initialize context for this codebase"           → Generate
"rebuild the context layer from scratch"         → Generate
"update the context layer"                       → Audit
"check my CLAUDE.md for issues"                  → Audit
"is my CLAUDE.md stale?"                         → Audit
"prune the context layer, it's getting bloated"  → Prune
"compress my CLAUDE.md to save tokens"           → Prune

// Diagnostic phrasings (symptom → workflow)
"agents keep putting files in the wrong place"   → Audit (stale paths)
"Claude ignores my CLAUDE.md, it's too long"     → Prune
"just started a new repo, agents have no clue"   → Generate
"we refactored last week, context is now wrong"  → Audit

// Scoped / targeted (operate on one directory, not the whole tree)
"generate context for just the auth directory"   → Generate (targeted: src/auth)
"audit only the api subdirectory's CLAUDE.md"    → Audit (targeted: src/api)
"prune just the db context file"                 → Prune (targeted: src/db)
"the workers module has no context yet"          → Generate (targeted: src/workers)

// Redirects (handle without ContextLayer)
"update my README"         → edit the README directly
"generate API docs"        → use documentation tooling
"delete context files"     → use the filesystem directly
```
