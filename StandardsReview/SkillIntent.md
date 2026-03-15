# SkillIntent: StandardsReview

## Purpose

Multi-agent language-specific standards review that is trustworthy, proportional, and single-session. The skill exists because language-specific coding standards need active checking — generic code review catches architectural issues but misses language-specific idioms, type safety patterns, framework conventions, and performance idioms.

This skill solves the problem with three core mechanisms:
1. **Language isolation** — each agent reviews one dimension from one language, preventing cross-contamination
2. **Claim verification** — every issue is git-blame confirmed to have been introduced in the changed commits
3. **Inlined rules** — 283 rules across 8 languages, directly in dimension files so agents always have the full rule text

## Design Philosophy

### The Process Boundary Principle

Text-based enforcement does not work on LLMs. Imperative language ("you MUST follow this pipeline"), artifact checks, and mandatory notification steps all failed in practice — the LLM read the enforcement text in the same session and rationalized bypassing it. The fundamental insight: **if the orchestrator can read a workflow file, it can decide not to follow it.**

The solution is architectural, not textual: separate LLM sessions. The orchestrator (Review.md) spawns agents and checks artifacts. It never reads workflow internals. Each pipeline step runs as a separate agent invocation with its own context window. The orchestrator can't skip what it never sees.

### The Thin Orchestrator Pattern

The orchestrator does exactly three things:
1. **Pass file paths** — agent prompts include the path to the workflow file the agent should read
2. **Check artifacts** — verify that each step produced its output file before proceeding
3. **Read dimensions.json** — the only structured artifact the orchestrator parses, to know which review agents to spawn

Everything else happens inside agents. The orchestrator has no opinion about how context is gathered, how dimensions are selected, or how findings are synthesized. It only knows the pipeline shape and the artifact contract.

### Language Isolation

Each language's rules live in their own `Dimensions/[Language]/` subdirectory. No cross-language contamination. A TypeScript review agent receives ONLY TypeScript dimension files. This prevents the LLM from getting confused by rules from other languages and ensures focused, accurate reviews.

### Self-Contained Dimensions

Each dimension file has everything the review agent needs: inlined rules with IDs, detection heuristics, severity calibration, code examples, and output format. No indirection to INDEX.md or external files. The agent reads ONE file and knows exactly what rules to check. Rules use `### ID RuleName` format for machine-parseable rule identification.

### Judgment Over Triggers

Dimension selection uses agent judgment, not trigger conditions. INDEX.md "Load When" triggers were another layer of indirection that agents skipped reading. The SelectDimensions agent reads context, reads what each dimension covers, and picks what's relevant. Baseline dimensions per language are always included as a guard rail.

### Context Compression Before Dispatch

Agents are expensive. Giving each agent the full codebase context + full diff + full skill knowledge risks context overflow and reduces focus. The context layer (GatherContext) gives agents exactly what they need and nothing else.

### Git Blame Verification

The most important credibility mechanism. An AI review that flags pre-existing issues — that the team already knows about and has decided to live with — immediately loses credibility. Every finding is verified against the commit range before it reaches the user.

### Credibility Through Evidence of Work

The absence of issues is signal, not silence. The report includes a "What Looks Good" section that names what each agent reviewed and found clean. This proves agents actually looked, not just that they didn't flag anything.

## Success Criteria

1. Every flagged issue traces to a specific rule ID from the dimension files
2. Every flagged issue exists in lines introduced by the commit range being reviewed
3. Agent count and dimension selection are proportional to the size and nature of the changes
4. The full review runs in a single session without context overflow
5. Language isolation is maintained — no cross-language rule contamination
6. The report includes rule IDs so users can trace findings back to specific standards

## Explicit Out-of-Scope

- **Cross-cutting review concerns** — Architecture, logic errors, complexity reduction belong in CodeReview, not here
- **Creating a separate Rules/ directory** — All rules are inlined in dimension files
- **Merging language content** — Each language's rules stay isolated in their own dimension directory
- **Integration with CodeReview** — These skills are deliberately decoupled
- **Style nitpicks** — Only surface if they violate a specific rule; no subjective preferences
- **Linter-catchable issues** — Assume linters run in CI; focus on deeper standards

## Evolution Notes

*2026-02-18: Initial creation, migrated from React, TypeScript, CSharp, PythonCoding skills.*

*2026-02-19: SkillForge audit: added First Principles, Problem, Design Decisions, Constraints sections.*

*2026-02-23: v2.0.0 — Restructured from knowledge base to review skill. Removed per-language workflows. Added Review.md orchestrator with multi-agent pipeline. All 283 rules inlined in dimension files. Decoupled from CodeReview.*

*2026-02-23: v3.0.0 — Copied CodeReview's process-boundary architecture. Review.md rewritten as thin orchestrator. Added GatherContext, SelectDimensions, VerifyClaims, GenerateReport as standalone agent workflows. Removed INDEX.md files (agent judgment replaces trigger conditions). Pipeline: 6 steps (Setup, GatherContext, SelectDimensions, Review Agents, VerifyClaims, GenerateReport). Review agents write individual files (dimension-[id].md), orchestrator never reads agent output content. GenerateReport handles synthesis + report generation in two phases.*

*2026-02-24: v3.1.0 — Merged VerifyClaims + GenerateReport into single VerifyAndReport workflow (pipeline 6→5 steps), matching CodeReview's optimized structure where the verifying agent already has the full findings context needed to write the report. Added false positive filtering to both diff-mode and audit-mode decision trees (ported from CodeReview). Added scope constraint to SelectDimensions to prevent unnecessary codebase exploration.*
