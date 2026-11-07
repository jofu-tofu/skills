# PlanChange

Internal procedure; called by workflows, not automatically loaded at entry.

## Contract

**Input:** A target quality profile and a creation, change, comparison or assessment request, with authorized scope and budget.

**Output:** A frozen plan naming the target/version, requested claim, checks, budget and stopping rule; baseline and change hypothesis only where applicable.

## Steps

1. Identify the requested claim and available evidence. For creation or change, identify the desired difference and distinguish observed failure from design hypothesis. For assessment-only work, name the question and target version; mark change hypothesis not applicable. For a reported gap, load its [DiagnoseGap](DiagnoseGap.md) record or call that procedure if missing. Identify whether the target skill, outcome, case set or checker needs revision; a plan need not include a skill edit.
2. For comparison or benefit claims, name the baseline or alternative and preserve its version. A single-version assessment or readiness check needs no comparison baseline; record it as not applicable.
   For broad improvement, complete the research decision below after clarifying outcomes and diagnosing any gap, before ranking changes. For a focused repair, use it only when a consequential uncertainty warrants research.
   Apply [alternative-generation activation](#alternative-generation-activation) before ranking changes. When it applies, read and call [GenerateAlternatives](GenerateAlternatives.md); reuse its comparison while applicable. It owns mechanism-diverse exploration, not selection or research policy. Order plausible changes by expected contribution to the agreed outcomes, evidence, total effort, regression risk and dependencies. Start with the smallest useful, reversible experiment, which may test a substantial structural alternative; give the reason for that order. New folders or conformity to SkillForge's layout are not benefits by themselves. Keep later stages provisional and revisit them after each result; a useful plan may defer structural changes or make no skill edit.
   Use EstablishQuality's outcome contribution map when present: tie a proposed component change to the specific result it should improve, the gap or overlap motivating it, and the other contributions it must preserve. A shared goal alone does not justify merging dimensions, and an unmapped goal does not automatically require a new one. Keep responsibility changes as hypotheses until checked against the final outcome and affected handoffs. This map informs the regression-coverage map below; it does not replace execution evidence.
3. Define protected behavior, affected dependencies, assessment or comparison cases and measurement specifications with qualification evidence/status. Call [DesignMeasurement](DesignMeasurement.md) if missing, changed or unsupported; design-only plans may retain pending qualification. Select evidence methods before defaulting to a judge, and name unsupported outcomes explicitly.
   For behavioral changes or workflow-level readiness, apply [RegressionCoverage](../Standards/RegressionCoverage.md). Record the requirement-to-branch/dependency-to-evidence map, justified exclusions and untested scope. Declare targeted benefit and preservation gates separately; match coverage to claim breadth and preserve lightweight/design-only limits.
4. Declare assessment, improvement or readiness rules, budget, and error handling before execution. For staged work, state the next step's benefit and preservation checks and what would justify continuing, revising or stopping; do not bundle later hypotheses into a single untestable overhaul. This plan owns attempt policy. ConstructCases derives execution details from its identified version; resolve policy conflicts here through an explicit amendment, preserving the prior plan and affected evidence.
5. Record design-only limits where execution is outside scope.

## Alternative-generation activation

Call GenerateAlternatives before selecting a change for broad improvement, an explicit alternatives request, a stalled approach, or **a focused improvement that chooses or revises structure**. Structure includes responsibility/file boundaries, context loading or isolation, stage order/count, shared handoffs, and allocation between instructions and tools. A request to reduce unnecessary loading, split responsibilities or simplify a workflow qualifies even when labeled focused, small, or refactoring. Decide from the intended effect and remaining design choices, not those labels; the user need not say “brainstorm.”

Keep the comparison within the requested scope and record the chosen mechanism with its rivals in the existing plan. Do not expand a focused task into comprehensive improvement. Reuse applicable alternatives rather than regenerating them each round. This trigger adds no mandatory research, agent, separate artifact or candidate-count quota.

Skip for assessment-only work, typo/formatting maintenance, a fixed mechanical move/rename, or an established local repair **when no structural choice remains**. For example, moving a named file to a specified path and fixing its links is maintenance; choosing which rules should move or when callers load them is structural design. If a supposedly local repair exposes that choice, generate alternatives before making it.

## Research decision

Keep this decision brief and within the task budget; it is not a mandatory literature review.

1. Name the unresolved question that could change which improvement to try. Inspect relevant existing evidence first: prior attempts, target references and research summaries. Check relevance and limits; do not load the whole archive.
2. If a consequential question remains and academic evidence could inform it, search academic literature before selecting the change. Bound the search to the question and available budget; prefer primary papers and inspect methods, task conditions and limitations before transferring a finding. Stop when evidence is sufficient to choose the next bounded step, or the search budget is reached.
3. Record the question, evidence consulted, implications for candidate changes and uncertainty. If no new search is useful, record why existing evidence is sufficient or literature would not inform this decision. If access or budget prevents a useful search, record that limitation separately; do not call the evidence sufficient.
4. Feed findings into change ranking, including a no-change option. Treat transfer to the target skill as a hypothesis to evaluate, not proven benefit. When incorporating findings, follow [KnowledgeIntegration](../Standards/KnowledgeIntegration.md). Reuse evidence for [DesignMeasurement](DesignMeasurement.md) when applicable; its measurement research requirement remains independent.

Assessment-only work and lightweight maintenance do not acquire a new research phase. Missing research access may leave a justified provisional candidate; it does not authorize invented support or a confirmed improvement claim.

## Experiment adequacy

Before spending on trials, record these answers briefly in the plan. Reuse existing evidence and records. A small experiment is useful only if it can change the intended decision.

- **Decision and reach:** What decision will this evidence change, and which user outcome must it reach? Trace the claim through affected handoffs to an observable result. A component probe may diagnose a cause but cannot replace a required end-to-end check. A proposal-only task cannot establish execution follow-through; a task that forbids testing cannot test autonomous evaluation.
- **Credible alternatives:** Name the important rival explanations and observations that distinguish them. Include already-adequate baseline behavior, a faulty checker or environment, and harmful candidate changes when plausible. Do not assume a skill edit is the answer.
- **Opportunity and sensitivity:** Reproduce the reported baseline failure on development material for a fix claim. Check whether the comparison already succeeds and whether the test notices a consequential bad result while accepting a valid alternative. If saturated, retain that case for preservation and identify relevant untested decisions; do not add difficulty merely to obtain a win.
- **Realistic information:** Give subjects the context and authority they would actually have. Do not put the intervention's missing steps into both user prompts unless explicit coaching is the intended use. Keep reference answers separate from executor inputs. Record partial context, scaffolding, unavailable tools and isolation limits.
- **Useful breadth:** Select distinct consequential situations, including affected handoffs, nonapplication and no-change cases, before repeating one easy case. Explain what the selected cases leave unanswered. Repeats measure run variation, not new task-family coverage. Match breadth to the claim without imposing a fixed suite size.
- **Interpretation before execution:** Establish reference provenance and qualify checks before confirmation. Freeze what favorable, unfavorable, tied and unavailable results mean. Exploratory runs may resolve a named uncertainty; they cannot substitute for missing confirmation.
- **Cost and next action:** Explain why this is the smallest sufficient experiment, not merely the cheapest runnable one. Name the next action after each plausible result. Redesign a test whose possible results all leave the original decision unanswered. Preserve null results and avoid repeated proposal-only pilots when the unresolved question requires execution.

For a focused repair, a small complete decision loop may resolve the request: reproduce the failure, contrast a valid alternative, exercise the affected handoff and decide. For broad improvement, that same loop is **one round** inside [ComprehensiveImprovement](ComprehensiveImprovement.md), not a stopping rule. Select it from the reviewed parent coverage inventory and structural findings, state which outcomes it can resolve, and preserve the rest as subsequent work. Passing samples and a per-round budget do not establish whole-skill adequacy. Test distinct consequential situations rather than repeatedly sampling an easy case; no arbitrary suite size or round count establishes completeness.

Commit resources only to the next decision. Later stages are conditional options, not a fully budgeted research programme. Do not invent large run counts, effect-size thresholds or noninferiority margins without task evidence and a decision that needs them. If deployment reliability or a population claim requires broader sampling, explain why and derive the budget from that claim and available variance. Do not silently shrink such a claim to fit a cheap test.

Keep the execution brief usable: question/decision, contrasting cases and reference basis, actual outcome checks, next-trial budget, and result-dependent next action. Combine overlapping records and link existing evidence. Detailed schemas and repeated prose are not deliverables unless another tool or operator needs them; retain enough raw evidence to audit the result. Missing thresholds may remain unresolved for broader claims while a bounded diagnostic decision proceeds.

Small means proportionate evidence, not a self-selected subset of the user's required result. When an identified uncertainty could violate that same result at an adjacent handoff or boundary, check the contract and use the available discriminating test before declaring the task handled. Do not relabel an in-scope requirement as an optional future domain merely because the first repair passes. If the gap is genuinely outside the request, explain that boundary from the user's intent; if execution is unavailable or materially exceeds the budget, preserve it as an unresolved requirement rather than a completed outcome. This does not require solving unrelated defects or proving all possible inputs correct.

These checks do not require a large benchmark or human approval. For autonomous work, resolve ordinary design choices and continue through authorized execution. Ask only for material intent or authority that cannot be established. The optional [evidence guide](../ResearchLibrary/Experiment%20Design%20-%20Evidence%20and%20Use.md) provides background, not another mandatory phase.

## Acceptance and failure checks

The plan permits findings that contradict the claim and does not require a candidate to win. An assessment-only plan can be executed without inventing a revision or baseline. Mandatory unknowns prevent a confirmed verdict, not an honest draft.

## References and limits

Use [Plan](../Templates/Improvement/Plan.md).

For a focused attempt, the optional [CompactAttempt](../Templates/Improvement/CompactAttempt.md) combines plan, results and decision prose. Use an adequate existing record instead when available. Keep required machine-readable contracts/results and raw evidence; link them rather than repeating their contents. Broad work retains its parent inventory.

Status: proposed and unvalidated. Shared requirements: [Quality/Shared](../Quality/Shared.md). Test this procedure with fixed input artifacts independently, then test its handoffs.
