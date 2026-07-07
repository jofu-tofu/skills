# CaptureSession Workflow

> **Trigger:** "capture this session", "save session recap", "record agent session", "summarize for vault"

## Reference Material

- **Continuity Principles:** `../Standards/ContinuityPrinciples.md` — trust levels and session continuity model
- **Syntax:** `../Syntax.md` — wikilinks, embeds, and block references
- **Properties:** `../Properties.md` — YAML/frontmatter and property types

## Purpose

Convert an agent session into durable Obsidian project memory that lowers future restart cost. A session capture is useful context, but it is not automatically a decision.

## Workflow Steps

### Step 1: Locate routing rules

Read the nearest project `AGENTS.md`. Use its artifact routing, trust rubric, and promotion authority. If it lacks those sections, suggest adding them through `StructureProjectVault`.

### Step 2: Classify session outputs

Separate content into trust-aware buckets:

- summary and state of work -> `20-working-T1-T3/session-recaps/` or project equivalent
- raw sources or pasted material -> `10-sources-T0-T2/raw/`
- source-backed claims -> `10-sources-T0-T2/` or project equivalent
- open questions -> `20-working-T1-T3/open-questions/` or recap section
- accepted user decisions -> `30-decisions-T4/` only when explicitly confirmed
- active deliverable drafts -> `20-working-T1-T3/drafts/`
- accepted or delivered outputs -> `40-artifacts-T5/`

### Step 3: Create recap

Use this structure:

```markdown
---
trust_level: T3
artifact_type: session-recap
status: active
created:
updated:
source: agent-session
human_confirmed: false
related_decisions: []
supersedes:
superseded_by:
---

# Session Recap - YYYY-MM-DD - Topic

## Summary

## Key Facts Learned

## Decisions Confirmed

## Open Questions

## Risks Or Uncertainties

## Next Actions

## Files / Pages / Tickets To Revisit

## Source Links
```

If a decision was discussed but not explicitly confirmed, keep it under open questions or proposed decisions.

### Step 4: Link related notes

Add wikilinks to relevant sources, working notes, decisions, and artifacts. Prefer a few high-signal links over exhaustive linking.

### Step 5: Update index when useful

If the session changes current goal, open questions, active artifacts, or canonical decisions, update `_index.md` or propose the exact change.

### Step 6: Report

Return the recap path, trust level, related decisions, and any decision-worthy items that still need user confirmation.
