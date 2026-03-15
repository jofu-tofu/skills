# SkillIntent — ContextLayer

> **For agents modifying this skill:** Read this document before making any changes. It captures the original design decisions, constraints, and explicit out-of-scope boundaries that updates must not contradict.

---

## First Principles

**Code tells you what. CLAUDE.md tells you what code can't.**

Source code shows what is implemented. It cannot show:
- *Why* a decision was made this way and not another way
- *Why* a workaround exists and what it's working around
- *What went wrong* in a past implementation that informed this one
- *What convention governs* an entire directory that isn't obvious from any one file
- *What to avoid* — the hidden constraint that looks fine until you violate it

These are the things CLAUDE.md captures. It is **additive to code, not a substitute for it.** An agent that reads source files and CLAUDE.md together makes better decisions than an agent that reads only one of them.

**Operational why vs. architectural why**

The *why* captured in CLAUDE.md is *operational why*: context that, if missing, causes an agent to act incorrectly — "this workaround exists because X will break without it," "don't touch this path or Y fails." This is distinct from *architectural why* — the rationale behind system design choices (what was considered, what was rejected, which constraints shaped the decision). Architectural why belongs in Architecture Decision Records (ADRs).

The falsifiability test separates them naturally: operational why passes ("removing this causes an agent to break X"); architectural why typically fails ("removing this rationale doesn't change what agents do, only what they understand about history").

**The knowledge gradient:**

```
Most specific ←————————————————————————→ Most general
Code itself → Comments → subdir CLAUDE.md → root CLAUDE.md
```

Each layer captures non-obvious knowledge at the right granularity:
- **Code comments** — why this specific line/function works this way; visible only when reading that file
- **Subdir CLAUDE.md** — why this module is structured this way; conventions, past decisions, local constraints that span all files in the directory
- **Root CLAUDE.md** — why the project is organized this way; cross-cutting constraints, subsystem relationships, project-wide conventions

**The placement rule:** A CLAUDE.md belongs in a directory when an agent would make at least one wrong decision without it, and that knowledge cannot be expressed efficiently as a code comment (too broad, too historical, or about convention rather than implementation).

**Agentic tool use changes what belongs here:** Modern agents (Claude Code and equivalents) actively use Glob, Grep, and Read to discover information. File structure, which files exist, and individual file contents can all be found through tool use. CLAUDE.md is not a substitute for tool use — it captures what tool use cannot reveal: *why* a non-obvious structure exists, *what* to avoid, and *which conventions* span the entire directory without being visible in any single file. If an agent would discover a fact in one Glob call, that fact does not belong in CLAUDE.md.

The positive corollary: encode the *search pattern* rather than the *search result*. `Run grep -r "authMiddleware" src/ to locate protected routes` is better than listing the routes — the pattern produces fresh results every time while a static list rots. Where the answer is dynamic, CLAUDE.md should tell agents *how to look*, not *what was there at the time of writing*.

**Session-fresh invariant:** Each agent session begins with zero prior context. CLAUDE.md cannot assume the reader has memory of previous sessions. Every file must be written for a cold-start agent — facts that "everyone knows from last week" must be stated as if the reader has never seen them. Cold-start is an invariant constraint, not an incidental property: future updates that introduce assumptions about persistent agent state violate it.

**Persistent memory coexistence:** In projects using persistent agent memory (PAI hooks, Cursor memory, etc.), CLAUDE.md is authoritative for codebase-specific rules. The memory system and CLAUDE.md must not duplicate or contradict each other — if they diverge on the same rule, CLAUDE.md governs for any agent operating in the codebase, including agents without access to the persistent memory store.

**The success metric:** Maximum decision quality per token consumed — not minimum total tokens. A 200-token CLAUDE.md entry that prevents an agent from making a wrong assumption — which would require reading 5 source files to discover and correct — is a win on both dimensions. The goal is not smaller context; it is better decisions with whatever context is loaded.

**Load-timing determines falsifiability bar:** Root CLAUDE.md is always-on — every interaction pays its token cost, permanently. Subdir CLAUDE.md files are on-demand — cost is paid only while an agent works in that directory. This asymmetry raises the falsifiability bar for root content above what subdir content requires. A line worth including in a scoped subdir session may not justify permanent root-level cost.

---

## Problem This Skill Solves

AI agents working in a codebase make wrong decisions when they lack the non-obvious knowledge that code can't show: why things were built this way, what workarounds exist and why, what past failures shaped the current design, what conventions govern a module's behavior. Without this knowledge, agents produce subtly wrong outputs — wrong paths, wrong conventions, misplaced files, avoidable mistakes.

ContextLayer solves this by maintaining a **hierarchical CLAUDE.md tree**: slim, high-signal context files that give agents immediate access to the non-obvious knowledge at the right scope (project-wide vs. directory-local), co-located with the code it describes.

---

## Success Criteria

A ContextLayer implementation is successful when it satisfies ALL of the following:

1. **High decision quality per token:** Agents make better decisions with whatever context is loaded. CLAUDE.md is additive to source files — it captures the non-obvious knowledge code can't show (why decisions, workarounds, past failures, conventions). Token budgets (root ≤ 1500 tokens, subdir ≤ 500 tokens) enforce signal density, not minimalism for its own sake. A CLAUDE.md that prevents one wrong assumption is worth its token cost regardless of context size. **Load-timing:** Root is always-on (permanent cost per interaction); subdir is on-demand (cost only during scoped work). See "Load-timing determines falsifiability bar" in First Principles.

2. **Degradation-resistant:** The context layer maintains itself over time. Embedded `## Context Maintenance` instructions guide any agent (or human) who opens the file to keep it pruned and accurate. The context layer does not require a dedicated maintenance session — it degrades gracefully and signals when it needs updating. **Drift is the staleness detector:** Before committing to a full Audit (which reads source files), run the Drift workflow — it uses git history only, identifies which CLAUDE.md files have fallen behind code changes, and reports a targeted list. Drift + Audit together form the two-tier maintenance cycle: Drift detects, Audit corrects. Run Drift after any significant refactor or when agents start producing subtly wrong outputs.

3. **Big-picture visibility during incremental edits:** When an agent makes a small, scoped change (a function edit, a bug fix, a config tweak), it can load the relevant CLAUDE.md tree and understand how that file fits into the larger system — without reading the full codebase. The CLAUDE.md tree provides the architectural frame that makes incremental work coherent. **Test:** Give an agent only the CLAUDE.md tree (not source files) and ask a navigational question — "where would you add a new authentication provider?" or "which module owns rate limiting?". A passing context layer produces the correct location. A failing one forces the agent to read source files to answer. If the agent can't answer from CLAUDE.md alone, the tree is missing architectural orientation content.

4. **Falsifiability-enforced:** Every line in every CLAUDE.md passes the falsifiability test at generation time: removing it would cause an agent to fail or produce wrong behavior. No line exists just to be thorough or to look comprehensive. Post-generation, embedded Context Maintenance instructions and the Prune workflow maintain this property; incremental edits may introduce lines that have not yet been re-validated.

5. **Hierarchically scoped:** Project-wide rules live only in root CLAUDE.md. Directory-local rules live only in that directory's CLAUDE.md. No duplication between levels.

6. **Contradiction-free:** No CLAUDE.md file contains two directives about the same behavior that conflict. When tooling or conventions change, the stale instruction is replaced — not appended alongside the new one. An agent encountering conflicting instructions follows whichever it reads first, making behavior unpredictable regardless of content quality. The Audit workflow is the primary mechanism for detecting contradictions that accumulate through incremental updates.

7. **Multi-agent self-contained:** Each CLAUDE.md file is interpretable in isolation — no line assumes the agent has read a parent, sibling, or external context source. Multi-agent sessions route different agents to different directories concurrently with no shared context; each file must work standalone. Phrases like "see root CLAUDE.md for context" are prohibited. **SC#5/SC#7 are orthogonal, not contradictory:** SC#5 governs *what lives where* (project-wide rules in root only; directory-local rules in subdirs only; no duplication). SC#7 governs *how content is written* (no cross-references in the text of any file). Both are simultaneously satisfiable: root CLAUDE.md contains the Context Tree section that instructs agents to read subdir files — this is routing logic, not a cross-reference *within* a subdir file. Subdir files themselves contain no references to root.

8. **Routing-sufficient root:** Root CLAUDE.md alone provides enough information for an orchestrating lead agent to correctly assign sub-agents to working directories — no subdir file reads required for routing. **Test:** Give a lead agent only root CLAUDE.md and a list of tasks; it should map each task to the correct directory without reading subdir files first. If it cannot, root CLAUDE.md is missing architectural orientation content.

---

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Tree, not single file | Hierarchical CLAUDE.md at root + each subsystem | One large root CLAUDE.md | Monolithic file grows without bound; agents load irrelevant context for scoped work |
| Parallel haiku agents | One agent per subsystem reads actual source | Sequential agent or orchestrator reads everything | Speed (wall-clock); each agent has focused scope; haiku is adequate for per-file summary |
| Four separate workflows | Generate / Drift / Audit / Prune as distinct operations | One multi-modal workflow | Cost alignment: Prune reads no files (cheap), Drift reads git log only (cheap), Audit reads CLAUDE.md refs (medium), Generate reads source (expensive). Drift added to enable cheap staleness detection before committing to a full Audit. |
| Falsifiability as primary pruning heuristic | "Would removing this degrade agent behavior?" | Line count, token count, or date-based pruning | Content-based pruning survives refactors; line counts cause false removals of dense content |
| Auto-apply | Changes written immediately without confirmation | Diff-display + confirm | Friction reduction: users invoking ContextLayer want the result, not a review loop. Reversible via git. |
| Structural ownership | Any agent can maintain CLAUDE.md files using the embedded Context Maintenance template; Drift detects staleness cheaply; Audit corrects it when triggered | Single named owner per file | DocPhilosophy's Ownership Law requires one accountable owner. ContextLayer satisfies this structurally: co-location (doc lives next to the code it describes), embedded maintenance template (instructions travel with the file), and a tight failure-feedback loop (wrong CLAUDE.md content surfaces as wrong agent outputs within the same session, not silently over months) together constitute accountable ownership without a named individual. This is DocPhilosophy's highest-reliability ownership type — co-located, always-visible, automatic. The decay mechanism differs from human docs: AI context files fail loudly within sessions; the failure-feedback loop substitutes for the ownership accountability that prevents silent rot in human documentation. |
| Embedded Context Maintenance template | Every generated CLAUDE.md ends with maintenance instructions | External maintenance doc or separate audit schedule | Instructions are co-located with the content they govern; works even when the agent has no skill context loaded |
| Token budget as hard constraint | Root 800–1500 tokens, subdir 200–500 tokens | Advisory suggestion | Budget without enforcement becomes decoration; hard constraint forces falsifiability discipline |

---

## Explicit Out-of-Scope

- **README files** — ContextLayer does not generate or maintain README.md. README is human-audience documentation; CLAUDE.md is agent-audience context.
- **API documentation** — API docs (OpenAPI, JSDoc, etc.) are human or toolchain outputs. ContextLayer does not generate them.
- **Architecture Decision Records (ADRs)** — *Architectural why* (what was chosen, what was rejected, which constraints shaped the decision) belongs in ADRs, not CLAUDE.md. This is durable, human-audience context that the falsifiability test filters out: it doesn't change what agents do, only what they understand about history. ContextLayer captures *operational why* — context that, if missing, causes agents to act incorrectly. See the "Operational why vs. architectural why" note in First Principles.
- **Token budget management at the skill level** — Budgets are a constraint on generated output, not a meta-constraint on the skill's own files. ContextLayer's skill files are not subject to the budgets it enforces on generated CLAUDE.md files.
- **Non-CLAUDE.md documentation** — Any documentation whose audience is human (not an AI agent) is outside ContextLayer's scope.
- **Living Design Docs** — Evolving design thinking that hasn't crystallized into a decision belongs in a design document co-located with the code it concerns, not in CLAUDE.md. If that thinking produces a non-obvious operational constraint affecting agent behavior, capture that constraint in CLAUDE.md once it stabilizes into an unambiguous rule.

---

## Constraints

These must remain true through any refactoring or content update:

1. **Budget hard constraints preserved** — Root ≤ 1500 tokens, subdir ≤ 500 tokens. Any workflow that removes these constraints contradicts the token-efficiency success criterion.
2. **Falsifiability test is always the primary filter** — No workflow may add content to CLAUDE.md files without applying the falsifiability test. Thoroughness is not a valid reason to add content.
3. **Context Maintenance template embedded in every generated file** — Degradation-resistance depends on this template being present. Removing it from generated output breaks the maintenance property.
4. **Workflows remain cost-tiered** — Cost ordering: Prune (content-only) < Drift (git metadata only) < Audit (reads referenced files) < Generate (reads source files). This ordering must not invert.
5. **Scope separation enforced** — Root CLAUDE.md must not contain directory-local rules. Subdirectory CLAUDE.md files must not duplicate root content. Cross-contamination degrades the hierarchical scoping property.
6. **Content ordered by criticality** — Within each CLAUDE.md file, the most critical rules appear first and supplementary context last. Context window position affects retrieval reliability; content in the middle of long files is less reliably attended to than content at the start or end (Chroma Research, 2024). The falsifiability test determines *what* to include; criticality ordering determines *where* to place it.

7. **Format enforces signal density** — Content uses tables and bullet lists over prose paragraphs. Operational why is expressed as terse annotations alongside the rule, not as standalone explanatory text: `"Use pnpm, not npm [migrated 2024-03, lockfile conflicts]"` not a paragraph explaining the migration. Agents parse structured formats more reliably than prose (AIContextLayers evidence). A CLAUDE.md that reads like documentation has failed the format constraint.

8. **Content is self-contained per file** — No CLAUDE.md line assumes the agent has read a parent directory's CLAUDE.md, a skill file, or any other context source. Phrases like "see root CLAUDE.md for context" or "as noted in the architecture docs" are prohibited. Multi-agent sessions route different agents to different directories; each subdir CLAUDE.md must be interpretable in isolation. This also means content cannot duplicate across layers — each file states facts that aren't expressed anywhere else in the loaded context.

9. **Canonical section headings** — Generated CLAUDE.md files use five canonical section headings enabling grep-targeted reads: `## Commands`, `## Conventions`, `## Constraints`, `## Architecture`, `## Gotchas`. These headings provide a stable addressing scheme so agents using targeted reads can locate sections without consuming the full file. Custom headings must be drawn from these five categories; "Warnings" is a prohibited alias for "Constraints" (a warning implies optional caution; a constraint signals a hard rule).

---

## Evolution Notes

| Version | Change | Rationale |
|---|---|---|
| Initial | Generate, Audit, Prune workflows | Core lifecycle: create, verify, compress |
| Added | ScanProtocol.md, BudgetModel.md, HaikuAgentPattern.md | Factored shared reference material out of workflow files |
| Added | DesignRationale.md | Hypothesis verdicts (H1–H6) and RedTeam findings preserved for future maintainers |
| Stress test (2026-02-17) | 8 scenarios run against PAI codebase; 4 patches applied | Haiku fence-strip, overwrite behavior, 8-agent batch cap, binary file exclusion, Audit delegation check, deleted-path pre-flight |
| Added | SkillIntent.md | Success criteria and design intent captured for future updaters; fills gap identified during ContextLayer-on-PAI retrospective |
| Added | Drift workflow | Cheap git-based staleness detection before committing to a full Audit; completes the four-tier cost ladder (Prune → Drift → Audit → Generate) |
| Updated (2026-02-18) | SkillIntent.md v2 | 7 improvements: Drift in success criterion 2, load-timing distinction in criterion 1, concrete test in criterion 3, format constraint (#7), multi-agent self-contained constraint (#8), sharpened distributed ownership row (DocPhilosophy Ownership law tension acknowledged), agentic tool-use note in First Principles |
| Updated (2026-02-18) | SkillIntent.md v3 | DocPhilosophy alignment audit: load-timing promoted to First Principles standalone section; ownership row rewritten with positive defense (failure-feedback loop rationale); SC #7 added (multi-agent self-contained, promoted from Constraint #8); Living Design Docs added to Out-of-Scope; SC #1 load-timing parenthetical shortened to reference First Principles. Future: proactive capture hook in Generate workflow (not yet implemented). |
| Updated (2026-02-18) | SkillIntent.md v4 | Council debate (4 agents, 3 rounds) on 7 proposed improvements. Consensus: IMPLEMENT 3 changes, DEFER 2, DROP 2. Applied: SC #8 routing-sufficient root (lead agent can route sub-agents from root CLAUDE.md alone); persistent memory coexistence added to First Principles (CLAUDE.md authoritative over memory stores for codebase rules); Constraint #9 canonical headings (Commands/Conventions/Constraints/Architecture/Gotchas, "Warnings" prohibited alias). Deferred: ownership failure conditions (2-2 split, wording unresolved), proactive capture hook scope (unanimous defer until implementation). Dropped: token budget rationale reframe (evidence supports placement rules, not philosophy change), contextual framing category (no behavioral evidence). |
| Updated (2026-02-18) | SkillIntent.md v6 | SkillForge audit (WorkflowDecompose + StressTest + ValidateSkill) + RedTeam (8 GAPs) + Council (3 rounds, 4 agents). IMPLEMENT 5 changes: (1) Prune Step 2.5 protected-section check — ## Context Maintenance exempt from falsifiability removal (GAP-4); (2) Audit Step 4.5 budget check — after adding content, verify ≤token caps, flag over-budget files for Prune (GAP-2); (3) Prune.md + Drift.md ## Reference Material sections added (structural); (4) DesignRationale.md wired into Generate.md Reference Material — institutional memory now reachable at runtime (GAP-7); (5) SC#7 clarified — SC#5/SC#7 orthogonality documented inline. DEFERRED: GAP-6 auto-apply diff-display (Phase 2). DROPPED: governance pre-flight layer (violates Prune's no-filesystem-reads design). |
| Updated (2026-02-21) | Change-based staleness detection | Drift workflow upgraded from time-based to commit-delta (`dir-commits-at-audit`) + structural fingerprint (`tree-sig`) as primary signals. Time demoted to tiebreaker (>90 days with clean signals). Generate/Audit updated to compute and persist new fields. Legacy format backward-compatible fallback preserved. Rationale: elapsed time is a weak proxy for actual codebase drift; commit count and structural changes directly measure what makes CLAUDE.md stale. |
| Updated (2026-02-21) | Task tracking rule added to Context Maintenance template | PruningInstruction.md, Generate.md template, and Audit.md Step 2.5 updated with "Track follow-up work" rule. Closes self-sustainability gap: generated CLAUDE.md files now instruct agents to track incomplete work and phase changes, not just keep context accurate. Audit detects missing rule in legacy files via `[MISSING TASK TRACKING RULE]` flag. |
| Updated (2026-02-18) | SkillIntent.md v5 | DocPhilosophy full alignment audit + Council debate (4 agents, 3 rounds). IMPLEMENT 3, DROP 1. Applied: (P1) "Distributed ownership" → "Structural ownership" in Design Decisions — positive rationale names the mechanism (co-location + embedded template + failure-feedback = DocPhilosophy's highest-reliability ownership type); (P2) Session-fresh invariant added to First Principles — cold-start is an invariant constraint, not incidental; future updates that assume persistent agent state violate it (3-1 majority: Ava's "naming prevents implicit-to-forgotten drift" argument moved Aditi and Marcus); (P3) Tool-use positive corollary added to First Principles — encode search patterns not search results; where the answer is dynamic tell agents how to look, not what was there. Dropped: (P4) KnowledgeIsPerishable inline-capture analog — governance gap (which agents have authority to edit mid-session? contradiction risk with Constraint #6), twice-deferred in v3/v4, incompatible with current Drift+Audit architecture. Future revisit requires: governance policy, merge-conflict protocol, Drift integration spec. |
