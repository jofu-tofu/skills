# SkillIntent: CodeReview

## Purpose

Comprehensive multi-agent code review that is trustworthy, proportional, and single-session. The skill exists because AI code review has two failure modes. The obvious one: flagging pre-existing issues and producing noise that reviewers learn to ignore. The subtle one: being so afraid of false positives that it misses systemic risks, leaving the reviewer with a clean bill of health on code that degrades the system. Both are credibility failures. A review that catches five null checks but misses an architectural boundary violation is thorough about the wrong things.

This skill solves all three problems with three core mechanisms:
1. **Parallel specialization** — multiple agents each go deep in one domain rather than one agent going shallow across all
2. **Claim verification** — every issue is git-blame confirmed to have been introduced in the changed commits
3. **Report design** — output is structured so the user reads every word, not skims

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

### Judgment Over Triggers

Dimension selection uses agent judgment, not trigger conditions. Trigger syntax was another layer of indirection that agents skipped reading. The SelectDimensions agent reads context, reads dimension descriptions, and picks what's relevant. Baseline dimensions (COR, SIM, RES) are always included as a guard rail, but non-baselines (CLA, STR) are pure judgment.

### Self-Contained Dimensions

Each dimension file has everything the review agent needs: persona, mental model, illustrative examples, severity calibration, language-specific notes, and output format. No indirection to INDEX.md or other files. The agent reads ONE file and adopts its philosophical stance. Dimensions were consolidated from 13 to 5 — reorganized by philosophical lens (how the agent thinks) rather than defect taxonomy (what the agent checks for).

### Context Compression Before Dispatch

Agents are expensive. Giving each agent the full codebase context + full diff + full skill knowledge risks context overflow and reduces focus. The context layer (GatherContext) gives agents exactly what they need and nothing else.

### Two-Pass Verification: Relevance Then Evidence

Verification has two failure modes. The obvious one: rubber-stamping agent findings without checking if the code actually changed. The subtle one: confirming that every finding is *technically correct* while letting through a flood of nitpicks, preferences, and theoretical fragility that trains the reader to skim. A report with 20 verified findings where 12 are nitpicks is worse than a report with 8 findings — the reader loses trust in the signal and stops reading carefully.

Pass 1 (Relevance) asks three questions before any git-blame work: Is this finding in scope? Does it describe a concrete failure mode or just a preference? Is the severity proportional to the actual risk? Findings that fail any filter are discarded with a tag (OUT-OF-SCOPE, NITPICK, DISPROPORTIONATE). The key test for substance: *"If this finding were ignored, what specific bad thing would happen?"* — if you can't name a concrete failure, it's not a finding.

Pass 2 (Evidence) is the git-blame verification that was always there — confirming findings trace to actual changed lines. But it now operates on a pre-filtered set, which means the evidence check focuses attention on findings that matter rather than spending tokens confirming nitpicks are technically accurate.

The relevance tally in the report is as important as the evidence tally — it shows the verifier actively curated the report rather than passing through everything the agents produced.

### Report Dispositions

Findings have three dispositions after verification:

- **VERIFIED** — finding confirmed against changed commits (diff mode) or actual code (audit mode). Kept in the main findings section.
- **FALSE POSITIVE** — finding matches a documented convention (CLAUDE.md, ADR, linter config, inline code comment) or has an explicit safeguard in code (catch-and-rethrow, validation check, circuit breaker). Discarded.
- **RISK-ACKNOWLEDGED** — code is plausibly intentional but creates risk conditions with no documented safeguard. Kept in a separate "Risk-Acknowledged Patterns" section so the fixer can make an informed decision.

RISK-ACKNOWLEDGED lifecycle: the fixer either (1) fixes the risk, (2) adds a safeguard or code comment explaining why it's safe — converting future occurrences to FALSE POSITIVE, or (3) accepts the risk and moves on. The category makes risk acceptance explicit rather than silent. Review agents follow the Evidence Standard defined in Review.md Step 4.

### Credibility Through Evidence of Work

The absence of issues is signal, not silence. The report includes a "What Looks Good" section that names what each agent reviewed and found clean. This proves agents actually looked, not just that they didn't flag anything.

## Success Criteria

1. Every flagged issue exists in lines introduced by the commit range being reviewed
2. Agent count and skill selection are proportional to the size and nature of the changes
3. The full review runs in a single session without context overflow
4. The report is readable without skimming — the user engages with every finding
5. Verified claim count is surfaced ("17/19 findings verified")
6. Architecture map gives a coherent picture of what changed structurally

## Explicit Out-of-Scope

- **Refactoring suggestions on unchanged code** (diff mode) — only review what changed in the commit range
- **Style nitpicks** — only surface if they create bugs or maintainability problems; suggestions section at most
- **Linter-catchable issues** — assume linters run in CI; don't duplicate their work
- **Full-repository security sweeps** — audit mode targets user-specified directories/modules, not the entire repo
- **Test generation** — a separate concern; note missing test coverage as a finding, but don't write tests

## Evolution Notes

*2026-02-18: Initial shell created. Workflows GatherContext and DelegateAgents are specified; SynthesizeFindings, VerifyClaims, and GenerateReport are stubbed with TODOs. Priority for next iteration: define SynthesizeFindings deduplication strategy and GenerateReport template.*

*2026-02-21: Retrospective from Bridge Convention App session (f3950440). Root cause: agent never read Review.md, bypassed entire 5-stage pipeline, did single-agent review with no git blame verification. Fixes applied: (1) Pipeline Discipline section added to SKILL.md with mandatory enforcement language, (2) SynthesizeFindings completed with dedup strategy and architectural map generation, (3) VerifyClaims completed with git blame commands and decision tree, (4) GenerateReport completed with finding card format and report template, (5) Notification placement fixed in Review.md — now appears before any actions, (6) Agent-count announcement added to DelegateAgents.md Step 5.*

*2026-02-21: Follow-up — context-driven dimensionality. User passed `/StandardsReview` as argument but it was silently ignored. Root insight: agent dimensionality should emerge from ALL context signals (fingerprint + requested lenses + intent + architecture), not from separate special-cased paths. Fixes: (1) DelegateAgents Step 2 rewritten as unified "Construct Review Dimensions" from context signals, (2) Skill arguments folded into Review.md Step 1 scope as "additional lenses", (3) GatherContext context layer includes "Requested lenses" field, (4) SKILL.md examples updated showing `/CodeReview /SkillName` pattern.*

*2026-02-22: Audit mode — added codebase audit alongside diff-based review. Gap: entire pipeline (Review.md, GatherContext, DelegateAgents, VerifyClaims, GenerateReport) assumed a commit range existed, so dimensionality never activated for "audit this module" requests. Fixes: (1) Review.md Step 1 gets mode detection (diff vs audit) with routing table, (2) GatherContext gets audit target gathering (file inventory, module structure, target fingerprint), (3) DelegateAgents gets unified scaling by review target size/complexity (file count + module count for audits, lines changed for diffs), audit-specific agent prompt templates (full file set instead of filtered diff), and audit-mode dimension trigger matching, (4) VerifyClaims gets audit-mode verification (file-presence checks instead of git blame), (5) GenerateReport gets audit-mode headers and verdict framing (health assessment vs merge readiness), (6) Both INDEX.md files get dual trigger conditions (Diff: X, Audit: Y), (7) SKILL.md updated with audit triggers, examples, and dual-mode scaling table. Key invariant: diff-mode pipeline unchanged — audit mode is purely additive.*

*2026-02-22: Agent spawning hardening — DelegateAgents never actually specified HOW to spawn agents. Root cause: workflow said "spawn agents" and "run_in_background: true" but never specified the Task tool with subagent_type="general-purpose". Also: dimension document paths were relative (../Dimensions/) instead of repo-root-anchored, agent prompts said "read this file" without specifying the Read tool, and StandardsReview integration had no concrete filepaths. Fixes: (1) DelegateAgents Step 5 now has complete Task tool call examples with all parameters, (2) all agent prompt templates use [REPO_ROOT]/skills/CodeReview/Dimensions/ absolute paths with Read tool instructions, (3) StandardsReview INDEX paths explicitly listed in both DelegateAgents prompts and GatherContext Step 2, (4) Step 1.5 uses absolute glob path for INDEX discovery, (5) key spawning rules codified (parallel launch, subagent_type always general-purpose, output_file collection).*

*2026-02-22: Structured review dimensions — three-tier dimension system. Gap analysis: StandardsReview has 188 language-specific rules but no coverage for cross-cutting concerns (code simplification, architectural quality). These belong in CodeReview, not StandardsReview — StandardsReview = language-specific correctness only. Solution: `Dimensions/` directory with three tiers: (1) Top-level split into Architecture/ and Simplification/, (2) INDEX.md per category with trigger conditions for dynamic activation, (3) Single-agent dimension documents (~500-800 words each) with concrete detection heuristics, severity calibration, and code examples. 10 dimensions total: 5 Architecture (Modularity, Modifiability, Consistency, DependencyHealth, DesignIntent) and 5 Simplification (BloatDetection, CouplingAnalysis, DispensabilityScan, ComplexityReduction, ChangeResistance). DelegateAgents.md modified: Step 1.5 discovers INDEX files via glob (new categories auto-discovered), Step 2 combines structured + context-emergent dimensions, Step 3 uses dynamic scaling (Small:4, Medium:8, Large:12 replacing fixed 8 cap), Step 4 uses hardened agent prompts with MANDATORY file-read instruction. Key invariant: agents READ structured rule files and CITE specific heuristics — no generic "review the architecture" prompts. Sources: Mäntylä code smell taxonomy, SonarSource cognitive complexity, ATAM quality attributes, ISO 25010 Maintainability, Google code review dimensions.*

*2026-02-23: Pipeline slimming — file-based agent outputs and synthesis merge. Two changes: (1) Review agents now write findings to individual files (`dimension-[id].md`) and return only the file path to the orchestrator — the orchestrator never reads agent output content, only collects paths. This keeps the orchestrator's context slim. (2) SynthesizeFindings merged into GenerateReport — the GenerateReport agent now handles dedup, severity conflict resolution, architectural map construction, and clean domain identification before formatting the report. SynthesizeFindings.md deleted. VerifyClaims updated to read individual agent output files (Step 0: Collect Findings) instead of a single pre-synthesized findings.md. Pipeline reduced from 7 steps to 6.*

*2026-02-24: Pipeline optimization — two changes. (1) VerifyClaims + GenerateReport merged into single VerifyAndReport agent. Root cause: VerifyClaims was the single biggest bottleneck (~2.5 min, 83K tokens) and GenerateReport re-read all the same findings. The agent that verifies claims already has the full findings context needed to write the report — the handoff was pure overhead. Pipeline reduced from 6 steps to 5. (2) SelectDimensions hardened with scope constraint: read context.md and dimension files only, do not explore the codebase. The context file already contains everything needed for dimension selection; GatherContext already did the exploration. This prevents SelectDimensions from burning tokens on redundant file reads.*

*2026-02-26: Philosophical dimension redesign — 13 → 5 lenses. The old dimensions were organized by code smell taxonomy (Fowler/SonarQube), giving agents rigid checklists with numeric thresholds that turned them into linters. The two best-performing dimensions (D3 Assumption Audit, D1 Architectural Direction) already used a different approach — philosophical stance + illustrative examples — and consistently produced better results. Consolidated all 13 into 5 orthogonal philosophical lenses: Correctness (COR, The Skeptic), Clarity (CLA, The First-Time Reader), Simplicity (SIM, The Reductionist), Resilience (RES, The Devil's Advocate), Structure (STR, The Architect). Each gives the agent a mindset and lets it use judgment, with heuristics as illustrative examples only. Baselines: COR, SIM, RES (always included). Non-baselines: CLA, STR (included by SelectDimensions judgment, default for medium+ diffs). Agent cap reduced from 5-13 to 3-5. Tradeoff: removes numeric threshold repeatability in favor of judgment quality.*

*2026-02-26: Two-pass verification — relevance filter before evidence check. Root cause: verified reports were technically correct but flooded with nitpicks, style preferences, and theoretical fragility that trained readers to skim. The verify step was only asking "is this technically accurate?" not "is this worth the reader's attention?" Fix: added Pass 1 (Relevance Filter) with three gates — SCOPE (is it about the code under review?), SUBSTANCE (does it describe a concrete failure mode or just a preference?), PROPORTIONALITY (is severity proportional to actual risk?). Pass 2 (Evidence) unchanged but now operates on pre-filtered set. Key test for substance: "If this finding were ignored, what specific bad thing would happen?" Report tally now shows both relevance and evidence counts so the reader can see active curation happened.*

*Old → New dimension mapping (for relating old IDs from past reports to new lenses):*
*B1 Boundary Errors → COR, B2 Logic Errors → COR, B3 Case Completeness → COR, B4 Data Transformation → COR, A5 Design Intent → CLA, S1 Dead Code → SIM, S4 Complexity Reduction → SIM, S2 Coupling → STR, D3 Assumption Audit → RES, B5 Testability → RES, A1 Architecture Quality → STR, A2 Modifiability → STR, D1 Architectural Direction → STR.*

*2026-02-23: Architectural overhaul — multi-agent process boundaries. Root cause: two rounds of text-based enforcement failed. The LLM read all workflow files in a single session, decided the pipeline was "overkill," and did ad-hoc reviews. Adding imperative language ("you MUST") and artifact checks didn't help — the LLM read the enforcement text and bypassed it too. Solution: restructured to thin orchestrator + separate agent invocations. (1) Review.md rewritten as orchestrator that spawns agents and checks artifacts — never reads workflow internals. (2) New SelectDimensions.md agent replaces dimension selection from DelegateAgents.md — uses judgment instead of trigger conditions. (3) DelegateAgents.md deleted — responsibilities split between SelectDimensions.md (selection) and Review.md (spawning). (4) Four INDEX.md files deleted — trigger conditions eliminated entirely. (5) Dimension files consolidated from 18 to 13: ArchitectureQuality (old A1+A3+A4), DeadCodeBloat (old S1+S3), CouplingRigidity (old S2+S5), ArchitecturalDirection (old D1+D2). (These 13 were later consolidated to 5 philosophical lenses — see 2026-02-26 entry.) (6) All 13 dimension files given YAML frontmatter (id, name, category, baseline). (7) Four workflow files (GatherContext, SynthesizeFindings, VerifyClaims, GenerateReport) updated with Input/Output headers for standalone agent use. Key invariant: orchestrator NEVER reads workflow files — process boundaries prevent bypass. Dimension selection uses agent judgment, not trigger matching.*
