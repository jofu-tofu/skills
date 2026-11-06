# SkillIntent — Research

> **For agents modifying this skill:** Read this before making any changes.

## First Principles

1. **Use complementary search routes.** [Greenhalgh & Peacock (2005)](https://pmc.ncbi.nlm.nih.gov/articles/PMC1283190/) audited one review of complex evidence: snowballing found51% of its495 sources, versus30% from protocol-driven searches, with overlapping routes. This supports citation/reference chasing alongside search, not universal superiority across review types. The pipeline includes both and evaluates their actual contribution.
2. **Finding papers is necessary but not the bottleneck.** Most people fail at
   evaluating what they find. The Evaluate step exists because the replication
   crisis means ~36-50% of published findings may not replicate.

3. **The vocabulary mismatch problem is real.** Furnas et al. (1987): two people
   use the same term for a concept <20% of the time. Cross-domain reframing in
   Step 2 addresses this, but citation chaining bypasses it entirely.

4. **Search saturation, not timeouts.** Overlap informs diminishing returns, not proof of completeness. Continue a useful targeted search when material gaps, available sources and user scope justify it; preserve resource/access limits honestly.

5. **Published literature is a biased sample.** Publication bias means positive
   results are 3x more likely to be published. The adversarial agent actively
   seeks contradictory/null evidence.

6. **File-based handoff enables inspection and persistence.** All inter-agent
   communication goes through markdown files on disk, following the CodeReview
   skill's architecture. Files are inspectable, debuggable, and persist across
   sessions for future research.

## Problem This Skill Solves

General web search tools fetch content and synthesize it. Real research requires
structured paper discovery (citation chaining, cross-domain reframing),
evidence quality evaluation (triage, replication awareness, publication bias),
and persistent artifacts that accumulate knowledge across sessions.

## Design Decisions

| Decision | Chosen | Rejected | Why |
|----------|--------|----------|-----|
| File-based handoff | Agents write/read markdown files in `$RESEARCH_DIR` | In-memory context passing | Inspectable, debuggable, persistent across sessions. Follows CodeReview pattern. |
| Heavier orchestrator | Orchestrator does decomposition + seed extraction | Thin orchestrator (CodeReview style) | Research has sequential dependencies (seeds needed before citation chaining). Orchestrator must parse Wave 1 output to build seed context. |
| Split Evaluate + Synthesize | Separate agents for judgment vs. communication | Single Wave 3 agent | Evaluation requires skepticism; synthesis requires integration. Different cognitive modes. |
| Local knowledge check first | Search codebase before launching agents | Jump straight to web search | Prior work in the repo or past research artifacts saves redundant searching. |
| Training knowledge fallback | Mark with `[FROM TRAINING — verify]` | Return nothing if web fails | Some results with confidence markers > no results. User can verify later. |
| Thin-evidence path | Reduced pipeline for <5 papers | Full pipeline regardless | Running 4 expansion agents on 3 seed papers wastes time and produces noise. |
| Agent F autonomous discovery | Cross-domain agent discovers its own fields | Orchestrator prescribes all fields | Vocabulary ceiling: orchestrator can only reframe into domains it knows. Agent F should explore beyond the orchestrator's framing. |
| Structured saturation checks | Count overlap between waves, output percentage | Eyeball "does this look saturated" | Concrete metrics make the "run another round?" decision evidence-based. |

## Explicit Out-of-Scope

- **General web content retrieval** — this skill can use ordinary web search for
  source discovery, but it is optimized for evidence-backed research rather than
  broad scraping or content extraction workflows
- **Full systematic review** — produces evidence maps, not PRISMA-compliant reviews
- **Meta-analysis** — no quantitative effect size pooling
- **Primary research** — finds and evaluates existing research, not conducts new

## Success Criteria

1. Wave 1 preserves all relevant identified sources and their provenance; zero or thin evidence is valid.
2. Expansion investigates justified gaps and reports its actual contribution, including no new sources.
3. Cross-domain search tests relevant alternate vocabulary while preserving applicability limits; no unrelated paper is required.
4. Adversarial search investigates plausible null/replication/boundary evidence; no contradiction is fabricated.
5. The evidence map contains explicit confidence levels per finding
6. The evidence map contains a non-empty "What This Evidence Cannot Tell You"
7. All artifacts are written to `$RESEARCH_DIR` and persist after the session
8. Papers from training knowledge are marked `[FROM TRAINING — verify]`

## Constraints

- Every step must complete before the next begins (dependency chain)
- The orchestrator passes seed papers via `seed-papers.md`, not inline context
- Evaluate and Synthesize are separate agents (skepticism vs. integration)
- Agents that can't reach web search fall back to training knowledge with markers
- The evidence map must be useful standalone — readable without other artifacts

## Architecture Notes

### Why Heavier Orchestrator?

Unlike CodeReview's thin orchestrator, the Research orchestrator reads
intermediate output (landscape-*.md) to build seed-papers.md. This is
necessary because:
- Wave 2 agents need a deduplicated, ranked seed list
- The orchestrator must count saturation metrics
- The thin-evidence gate (<5 papers) requires reading Wave 1 output

The orchestrator still never edits agent output content — it reads, parses,
and deduplicates, then writes a new file.

### File Artifact Chain

```
question.md                          ← Orchestrator writes
landscape-keyword.md                 ← Agent A writes
landscape-semantic.md                ← Agent B writes
landscape-reviews.md                 ← Agent C writes
seed-papers.md                       ← Orchestrator writes (parsed from landscape-*)
expansion-backward.md                ← Agent D writes
expansion-forward.md                 ← Agent E writes
expansion-crossdomain.md             ← Agent F writes
expansion-adversarial.md             ← Agent G writes
evaluation.md                        ← Evaluate agent writes
evidence-map.md                      ← Synthesize agent writes
```

### v1.0 → v2.0 Changes

- Added file-based handoff (was inline context passing)
- Added local codebase search before Wave 1
- Added structured saturation detection with counts
- Split Wave 3 into Evaluate + Synthesize (was one overloaded agent)
- Added thin-evidence path for <5 papers
- Gave Agent F autonomous field discovery
- Added artifact persistence in `$RESEARCH_DIR`
- Added training knowledge fallback with `[FROM TRAINING — verify]` markers

## Empirical Basis

| Claim | Source |
|-------|--------|
| Complementary methods in one complex-evidence review; not a universal ranking | Greenhalgh & Peacock (2005, BMJ), DOI10.1136/bmj.38636.593461.68 |
| Vocabulary mismatch limits single-query recall | Furnas et al. (1987, CACM) |
| Cross-domain combinations drive breakthroughs | Uzzi et al. (2013, Science) |
| Replication rates are low in many fields | Open Science Collaboration (2015, Science) |
| Publication bias suppresses null results | Franco et al. (2014, Science) |
| Multiple strategies are essential | Cochrane Handbook, Ch. 4 |
| Iterative search (berrypicking model) | Bates (1989) |
| Process-level feedback > task-level feedback | Hattie & Timperley (2007) |
