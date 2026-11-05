# SkillIntent: StandardsReview

## Purpose

Multi-agent language-specific standards review that is trustworthy, proportional, and single-session. The skill exists because language-specific coding standards need active checking — generic code review catches architectural issues but misses language-specific idioms, type safety patterns, framework conventions, and performance idioms.

This skill solves the problem with three core mechanisms:
1. **Language isolation** — each agent reviews one dimension from one language, preventing cross-contamination
2. **Claim verification** — diff findings are supported by causal change evidence; audits use current source. Blame is supporting provenance, not a mandatory changed-line filter
3. **Inlined rules** — 283 rules across 8 languages, directly in dimension files so agents always have the full rule text

## Design Philosophy

### The Process Boundary Principle

Prior experience reported bypass of imperative instructions in a single shared context. This motivates separate stage contexts and observable artifacts; it does not establish that text never works or that process boundaries guarantee compliance.

The orchestrator spawns separate agents and checks shared interfaces without interpreting workflow internals. Each stage owns its substantive work. Verify actual dispatch, outputs and coverage; unavailable agents or failed stages remain explicit. [ReviewContract](Standards/ReviewContract.md) owns the common handoff schema and status rules.

### The Thin Orchestrator Pattern

The orchestrator does exactly three things:
1. **Pass file paths** — agent prompts include the path to the workflow file the agent should read
2. **Check artifacts** — verify that each step produced its output file before proceeding
3. **Read dimensions.json** — the only structured artifact the orchestrator parses, to know which review agents to spawn

Everything else happens inside agents. The orchestrator has no opinion about how context is gathered, how dimensions are selected, or how findings are synthesized. It only knows the pipeline shape and the artifact contract.

### Language Isolation

Each language's rules live in `Dimensions/[Language]/`. A reviewer receives one dimension plus shared review context/contract. Mixed-language files can be assigned to several appropriate reviewers. This focuses responsibility; it does not guarantee correct findings or eliminate overlap.

### Self-Contained Dimensions

Each dimension inlines its rule IDs, detection guidance and examples without an INDEX lookup. The shared ReviewContract owns artifact, applicability and coverage semantics; actual source and project context determine whether a rule applies. Rule examples and nominal impact labels are not proof of a defect. Rules use `### ID RuleName` format for machine-parseable identity.

### Judgment Over Triggers

Dimension selection uses agent judgment, not trigger conditions. INDEX.md "Load When" triggers were another layer of indirection that agents skipped reading. The SelectDimensions agent reads context, reads what each dimension covers, and picks what's relevant. Baseline dimensions per language are always included as a guard rail.

### Context Compression Before Dispatch

Agents are expensive. Giving each agent the full codebase context + full diff + full skill knowledge risks context overflow and reduces focus. The context layer (GatherContext) gives agents exactly what they need and nothing else.

### Git Blame Verification

A diff review must distinguish change-caused issues from unrelated pre-existing ones. Inspect patches and endpoint state: an unchanged line can fail because a guard or caller changed. Audits deliberately cover existing code and need no introducing commit. This distinction matters more than the age of a cited line.

### Credibility Through Evidence of Work

The report names actual files/rules examined and scoped no-finding results. This makes coverage inspectable but prose alone does not prove execution. Missing, omitted and failed reviewers remain distinct from clean work.

## Success Criteria

1. Every flagged issue traces to a specific rule ID from the dimension files
2. Diff findings have actual change-causation evidence; audit findings have current-source evidence; uncertainty and unrelated pre-existing issues stay distinct
3. Agent count and dimension selection are proportional to the size and nature of the changes
4. Scoped stages support a manageable review session, with real capacity limits reported rather than hidden coverage loss
5. Language isolation is maintained — no cross-language rule contamination
6. The report includes rule IDs so users can trace findings back to specific standards

## Explicit Out-of-Scope

- **Unbounded cross-cutting review** — General architecture redesign and unrelated logic review belong in CodeReview. Concrete type, framework, resource, encapsulation and performance consequences of a named dimension remain in scope, including its architecture rules. Do not exclude a language-specific defect merely because it also affects correctness.
- **Creating a separate Rules/ directory** — All rules are inlined in dimension files
- **Merging language content** — Each language's rules stay isolated in their own dimension directory
- **Integration with CodeReview** — These skills are deliberately decoupled
- **Style nitpicks** — Only surface if they violate a specific rule; no subjective preferences
- **Routine linter duplication** — Use actual CI/linter context; do not assume an unspecified checker runs. A pure formatting/naming preference is at most a policy note when explicitly requested/relevant, never invented correctness harm. Prioritize consequential standards findings.

## Evolution Notes

*2026-02-18: Initial creation, migrated from React, TypeScript, CSharp, PythonCoding skills.*

*2026-02-19: SkillForge audit: added First Principles, Problem, Design Decisions, Constraints sections.*

*2026-02-23: v2.0.0 — Restructured from knowledge base to review skill. Removed per-language workflows. Added Review.md orchestrator with multi-agent pipeline. All 283 rules inlined in dimension files. Decoupled from CodeReview.*

*2026-02-23: v3.0.0 — Copied CodeReview's process-boundary architecture. Review.md rewritten as thin orchestrator. Added GatherContext, SelectDimensions, VerifyClaims, GenerateReport as standalone agent workflows. Removed INDEX.md files (agent judgment replaces trigger conditions). Pipeline: 6 steps (Setup, GatherContext, SelectDimensions, Review Agents, VerifyClaims, GenerateReport). Review agents write individual files (dimension-[id].md), orchestrator never reads agent output content. GenerateReport handles synthesis + report generation in two phases.*

*2026-02-24: v3.1.0 — Merged VerifyClaims + GenerateReport into single VerifyAndReport workflow (pipeline 6→5 steps), matching CodeReview's optimized structure where the verifying agent already has the full findings context needed to write the report. Added false positive filtering to both diff-mode and audit-mode decision trees (ported from CodeReview). Added scope constraint to SelectDimensions to prevent unnecessary codebase exploration.*
