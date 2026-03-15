---
name: Research
description: Evidence-based scientific literature discovery and synthesis using a multi-wave agent pipeline — seed finding, citation chaining, cross-domain reframing, and evidence quality assessment. USE WHEN literature review OR find research papers OR academic research OR scientific evidence OR what does the research say OR find papers OR systematic review OR evidence map OR citation search OR paper discovery OR cross-domain papers OR evaluate research quality OR lit review OR survey the literature OR what studies exist OR research synthesis OR find academic sources.
compatibility:
  platforms: [claude-code, windsurf]
  models: [claude-sonnet-4-20250514, claude-opus-4-20250514]
version: "2.0"
---

# Research v2.0

Multi-wave agent pipeline for scientific literature discovery and evidence
synthesis. Finds papers through citation chaining and cross-domain reframing,
evaluates evidence quality, and produces structured evidence maps.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **Review** | "literature review", "find papers on", "what does the research say" | `Workflows/Orchestrate.md` |

All requests route through the orchestrator, which manages the pipeline.

## The Pipeline

```
Step 0: Frame question + check local knowledge
Step 1: LANDSCAPE SCAN — 3 parallel agents → seed-papers.md, landscape.md
Step 2: DEEP EXPANSION  — 4 parallel agents → expansion-*.md
Step 3: EVALUATE         — 1 agent          → evaluation.md
Step 4: SYNTHESIZE       — 1 agent          → evidence-map.md
```

9 agent invocations, 4 steps. File-based handoff — all inter-agent
communication goes through markdown files in `$RESEARCH_DIR`.

| Step | Agent(s) | Reads | Writes |
|------|----------|-------|--------|
| 0 | Orchestrator | question, local files | `$RESEARCH_DIR/`, `question.md` |
| 1 | 3 parallel | `question.md` | `landscape-keyword.md`, `landscape-semantic.md`, `landscape-reviews.md` |
| — | Orchestrator | landscape-*.md | `seed-papers.md` (parsed + deduplicated) |
| 2 | 4 parallel | `seed-papers.md` | `expansion-backward.md`, `expansion-forward.md`, `expansion-crossdomain.md`, `expansion-adversarial.md` |
| 3 | 1 | all prior files | `evaluation.md` |
| 4 | 1 | `evaluation.md` + `seed-papers.md` | `evidence-map.md` |

## Examples

**Example 1: Research question**
```
User: "Do a literature review on whether spaced repetition actually improves
       long-term retention compared to massed practice"
-> Orchestrator decomposes question, checks local files for prior work
-> Wave 1: 3 agents scan landscape, find seed papers + existing meta-analyses
-> Wave 2: 4 agents expand via citations, cross-domain reframing, contradictions
-> Evaluate: 1 agent triages evidence quality, maps convergences/tensions
-> Synthesize: 1 agent produces final evidence map with confidence levels
-> All artifacts saved to research vault for future sessions
```

**Example 2: Cross-domain discovery**
```
User: "Find research papers on how teams make better decisions under uncertainty"
-> Wave 1 finds seeds in management science and organizational behavior
-> Wave 2 reframes into: behavioral economics, military science, swarm intelligence
-> Discovers relevant papers in fields the user wouldn't have searched
-> Returns: cross-domain evidence map with structural analogies identified
```

**Example 3: Thin evidence**
```
User: "What does the research say about microservices vs monoliths for performance?"
-> Wave 1 finds <5 academic papers — triggers thin-evidence path
-> Skips full Wave 2 expansion, runs targeted search instead
-> Evidence map explicitly flags: low evidence quality, mostly grey literature
-> "What This Evidence Cannot Tell You" section is substantive
```
