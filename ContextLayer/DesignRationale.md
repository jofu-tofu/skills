# DesignRationale

Design decisions for ContextLayer. Not loaded at runtime — for future maintainers.
Records Science hypothesis verdicts and RedTeam attack outcomes that shaped the design.

---

## Science Hypothesis Verdicts (H1–H6)

| Hypothesis | Verdict | Evidence Summary |
|-----------|---------|-----------------|
| H1: Build/test commands are highest-value content | **CONFIRMED** | Commands prevent immediate agent failure (wrong runtime, wrong entry point); conventions drift more slowly and agent can sometimes recover |
| H2: package.json + README + file tree = 80% of useful content | **REFUTED** | Coverage is ~60-70%; conventions, prohibitions, and non-obvious patterns require reading actual source files — metadata alone is insufficient |
| H3: Inline cross-boundary summaries > file-path references | **CONFIRMED (with caveat)** | Agents don't follow "See: path" references; inline summaries are immediately consumed. Caveat: summaries rot when the code changes, requiring Audit workflow to specifically target them |
| H4: Embedded pruning instruction reduces context rot | **CONFIRMED (limited scope)** | Agents DO follow embedded meta-instructions; Phase 1 bridge is effective. Limitation: only works when agent is actively in the file, not autonomous |
| H5: Falsifiability test is best pruning heuristic | **CONFIRMED (with amendment)** | Excellent primary heuristic but misses infrequent-but-critical project-specific rules. Amendment: secondary heuristic added — keep if removing causes wrong behavior even 10% of the time in this specific project |
| H6: Prune/Audit should only scan what CLAUDE.md references | **CONFIRMED (split verdict)** | Prune: fully confirmed — content-only analysis needs no filesystem reads. Audit: confirmed but nuanced — scans only files referenced in the CLAUDE.md being audited, not the full project |

---

## RedTeam Attack Outcomes

| Attack | Severity | Design Response |
|--------|----------|----------------|
| Auto-apply is unsafe — CLAUDE.md is agent control plane, not documentation | Critical | Noted and documented. Plan explicitly requires no-confirmation for friction reduction (reversible via git). Phase 2 will add diff-display before apply. |
| Falsifiability instruction has no enforcement mechanism | Critical | Acknowledged as design limitation of Phase 1. Embedded instruction is passive; Prune + Audit workflows are primary enforcement. Phase 2/3 hooks will automate. |
| Prune workflow solves wrong problem — can't detect external staleness | Significant | Confirmed by design. Prune = content quality only (redundancy, verbosity, obviousness). Audit = external accuracy. The separation is intentional and correct. |
| Subsystem decomposition is underspecified | Significant | Addressed in ScanProtocol.md: default to directory-level decomposition; any dir with 3+ files gets its own haiku agent |
| Haiku capability insufficient for complex subsystems | Moderate | Documented as assumption. Fallback: orchestrator reads subsystem directly if haiku agent fails twice. Haiku is adequate for most subsystems; complex cases degrade gracefully. |
| Fixed token budgets can't adapt to subsystem complexity | Moderate | Noted. Budget model has headroom (~450 tokens) for root CLAUDE.md. Complex subsystems can use more of that headroom; simple ones will naturally produce less. Not solved perfectly. |
| No error handling for partial agent failures | Moderate | Added retry (1x) + orchestrator fallback to HaikuAgentPattern.md |

---

## Live Stress Test Results (2026-02-17)

Eight scenarios run against the PAI codebase using real parallel haiku agent dispatch. Findings drove 4 patches to skill files.

| Scenario | Outcome | Patch Applied |
|----------|---------|--------------|
| S1: Prune on root CLAUDE.md | **PASS** — Falsifiability test correctly protected "read DEVELOPMENT.md first" imperative; imperative vs. passive-reference distinction holds | None — design confirmed |
| S2: Audit on root CLAUDE.md | **Partial** — Zero stale entries correct, but 8 "missing" entries would have been over-added from DEVELOPMENT.md (delegation pattern hole) | `Audit.md` Step 4: delegation check added — don't add entries that belong in intentionally delegated files |
| S3: Haiku agent dispatch | **Retry required** — Both dispatched agents returned markdown fences despite explicit "no fences" instruction; content was correct, format failed | `HaikuAgentPattern.md`: Step 0 fence-strip added before JSON.parse(); retry protocol confirmed to work |
| S4: Generate overwrite behavior | **Hole confirmed** — Generate.md had no explicit "overwrite vs. merge" instruction for existing CLAUDE.md files | `Generate.md` Step 6: explicit overwrite behavior documented |
| S5: Scale cap | **Hole confirmed** — No agent cap; PAI's 31 skill subdirectories would have triggered 31 simultaneous haiku agents | `ScanProtocol.md`: 8-agent batch cap added with priority rule (most files first) |
| S6: Audit + deleted directory | **Hole confirmed** — Audit would dispatch haiku agent to read a directory that no longer exists; spec had no "path not found" handling; agent could silently pass stale entries | `Audit.md` Step 3: pre-flight path existence check; missing paths immediately marked stale without dispatching agent |
| S7: Audit + config-only directory | **Partial** — Spec's falsifiability test handles this correctly but no explicit guidance for config-data directories with no code patterns; agent might add data values that fail falsifiability | `Audit.md` Step 4: explicit note that data values (port numbers, timeouts) from config files fail falsifiability — do not add them |
| S8: Generate + binary files | **Hole confirmed** — Binary files (`.png`, `.ico`, `.db`, etc.) not in skip list; haiku agent dispatched to read binary content would produce garbage or malformed JSON | `ScanProtocol.md`: binary file extension exclusion list added; binary-only directory rule: skip agent, root notes "static assets only" |

**Additional finding (S1-S5 batch):** Haiku agents consistently use absolute paths in `key_files` despite schema example showing relative paths. Schema now explicitly requires relative paths and Output Validation Step 4 strips project root prefix.

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Parallel haiku agents (not sequential) | Correctness requires reading actual files; parallelism keeps wall-clock time acceptable |
| JSON intermediate representation | Validated, parseable, and separates agent output from synthesis — same pattern as compiler IR |
| Two-tier budgets (root vs subdir) | Root needs global context; subdirs need only local context — different audiences, different budgets |
| Tiered cost model (Generate > Audit > Prune) | Aligns expensive operations with low frequency; Prune is cheapest because it reads no source files |
| Auto-apply (Phase 1) | Explicit user requirement: friction reduction. Changes are reversible via git. Phase 2 adds diff-display. |
| No DocPhilosophy runtime dependency | It's a thinking tool; baking its concepts into static files saves tokens on every invocation |
| Context layer = tree, not single file | Hierarchical context: root for global orientation, subdirs for scoped domain context |

---

## Self-Sufficiency Analysis (2026-02-19)

First-principles analysis of ContextLayer's self-maintenance mechanisms. Full analysis in session notes; key findings preserved here for future maintainers.

**Method:** FirstPrinciples Deconstruct → Challenge → Reconstruct on the five self-sufficiency components (embedded template, post-action trigger, falsifiability test, trigger escalation, failure-feedback loop) under skill-only constraint.

### Hidden Assumptions Identified

| # | Assumption | Status | Evidence |
|---|-----------|--------|----------|
| SA-1 | "Auto-loaded = attended to" — root CLAUDE.md being in context means agents follow its instructions | **FALSE** | Being in context window ≠ attended to, especially for instructions competing with primary task |
| SA-2 | "H4 validates the post-action trigger" — H4 proves agents maintain CLAUDE.md after editing | **PARTIAL** | H4 tested during-file compliance only. Post-action recall after primary task completion is untested |
| SA-3 | "Self-maintenance is achievable through embedded instructions alone" | **OVERCLAIMED** | Embedded instructions achieve partial maintenance. Honest term: "degradation-resistant," not "self-sustaining" |
| SA-4 | "Trigger escalation is useful outside PAI" | **MOSTLY FALSE** | Audit/Generate skill references are inert in repos without PAI skill system |
| SA-5 | "Bottom-of-file is the right position for maintenance instructions" | **UNVALIDATED** | Chosen for aesthetics ("after all content"), not compliance optimization |
| SA-6 | "Root placement is the single highest-impact change" | **LIKELY TRUE, OVERSTATED** | Highest-impact single change (~40-60% compliance vs. 15-25% current), but moderate improvement, not transformative |

### Reliability Gradient (Validated)

The self-sufficiency reliability gradient was confirmed through analysis:

| Level | Mechanism | Reliability | Rationale |
|-------|-----------|-------------|-----------|
| 1 | Root CLAUDE.md (auto-loaded) | MODERATE-HIGH | Auto-loaded but competes with primary task for attention. Not HIGH in absolute terms. |
| 2 | Subdir CLAUDE.md (on-demand) | MEDIUM | Only read when agent works in that directory |
| 3 | Post-action trigger | LOW-MEDIUM | 6-step causal chain; each step is probabilistic; overall compliance is product of individual probabilities |
| 4 | Cross-session | ZERO | No mechanism exists without hooks |

### Key Structural Finding: The 6-Step Causal Chain

The post-action trigger ("After modifying files...") requires 6 sequential steps, each probabilistic:
1. Agent loaded this CLAUDE.md earlier
2. Agent remembers the instruction after primary task
3. Agent prioritizes maintenance over finishing faster
4. Agent re-reads or recalls CLAUDE.md content
5. Agent compares old content against new state
6. Agent edits CLAUDE.md

Failure at any step breaks the chain. Real compliance = product of individual step probabilities, not any single step's probability. H4 tested steps 1+3 in isolation; the full chain is untested.

### Fundamental Truths (Hard Constraints)

1. Text in a file has no agency — instructions are passive, processed only when an LLM reads them
2. Language models have finite attention budgets — every instruction competes with every other instruction and the primary task
3. Primary tasks always win the attention competition — maintenance instructions always lose to user intent
4. Auto-loaded ≠ attended to ≠ complied with — three distinct failure points
5. Compliance probability = f(relevance × specificity × position × task-alignment)

### Reconstruction Verdict

Within the skill-only constraint, the highest-impact improvements are:
1. **Root CLAUDE.md as maintenance anchor** — moves from level-2 to level-1 visibility (moderate impact)
2. **Task-aligned maintenance** — make maintenance a byproduct of primary task, not a competing obligation (structurally sound)
3. **Measurement infrastructure** — Audit self-sufficiency score to validate whether improvements work (necessary but measures structure, not behavior)

**Honest framing:** Embedded instructions achieve partial self-maintenance, not self-sufficiency. The term "self-sustaining" in SC #2 should be understood as "degradation-resistant with maintenance prompts" — not "autonomously self-correcting."
