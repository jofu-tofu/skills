# UpdateSkill Workflow

> **Trigger:** "update a skill"

## Reference Material

- [Intent](../SkillIntent.md) and [shared requirements](../Quality/Shared.md): read at entry.
- [Context](../Quality/UpdateSkill/Context.md) and [Outcomes](../Quality/UpdateSkill/Outcomes.md): read at entry.
- [Tradeoffs](../Quality/UpdateSkill/Tradeoffs.md): read before planning or deciding.
- [Feedback](../Quality/UpdateSkill/Feedback.md): read before evaluation.
- [ChallengeCases](../Quality/UpdateSkill/ChallengeCases.md): read when designing cases.
- [ComprehensiveImprovement](../Procedures/ComprehensiveImprovement.md): read and apply for broad or whole-skill improvement; owns parent scope, structural baseline and successive rounds.
- [DesignMeasurement](../Procedures/DesignMeasurement.md): qualify new, changed or unsupported measures before relying on them for improvement claims; reuse qualified evidence only within scope.
- [DiagnoseGap](../Procedures/DiagnoseGap.md): read and call when a gap or unexpected behavior motivates the request.
- [EstablishQuality](../Procedures/EstablishQuality.md), [PlanChange](../Procedures/PlanChange.md), [DraftCandidate](../Procedures/DraftCandidate.md), [ReviewDesign](../Procedures/ReviewDesign.md), [EvaluateCandidate](../Procedures/EvaluateCandidate.md), [ApproveSkill](../Procedures/ApproveSkill.md), [RecordLearning](../Procedures/RecordLearning.md): read the relevant procedure when called.

## Purpose

Deliver a scoped revision and a justified retain/reject/defer decision while preserving required existing behavior.

## Workflow Steps

Classify scope from the requested effect before choosing a path. A short approval such as "make that improvement" carries forward the preceding improvement goal and its evaluation scope. A user-selected mechanism is not a request for design-only delivery. Changes to when an agent researches, tests, decides or stops are behavioral changes even when implemented entirely in Markdown; use the numbered loop. Use a maintenance shortcut only when the requested effect fits that shortcut, and design-only delivery only when the user explicitly limits execution.

Choose the lightest path that fits the user's **requested result**, not the easiest experiment. Broad improvement follows ComprehensiveImprovement alongside the numbered loop: establish full supported-family outcomes and baseline structural review before choosing rounds. A small first round cannot redefine the parent task. Mentioning structure as a first step does not limit the request to formatting or mandate a rewrite. Explicitly bounded maintenance keeps the short paths below.

| Request | Path |
|---|---|
| Typo, formatting, or small wording correction without intended behavior change | Read target intent and affected text, edit, inspect the diff and relevant links. Validate if structure/routing changed. Report checks; skip quality regeneration, experiment plans, and approval gate. |
| Add/rename workflow or refactor structure | A fixed mechanical move/rename with no remaining structural choice uses [Authoring](../Standards/Authoring.md), relevant validation/link checks and affected-handoff checks. If the work chooses or revises structure, use the numbered loop and [PlanChange's activation rule](../Procedures/PlanChange.md#alternative-generation-activation), even when focused. Keep the requested scope; this does not make it comprehensive. |
| Integrate research or add intent | Read Authoring and its KnowledgeIntegration reference; preserve rationale and limits. If findings change decisions or behavior, continue through the numbered loop. Citation/rationale-only maintenance may remain narrow. Existing explicit user goals supply intent; clarify only material gaps. |
| Repair description/triggering | Use [TestTriggering](../Procedures/TestTriggering.md) for provisional candidates and target-runtime confirmation evidence. Apply the authoring review below, then call ApproveSkill and RecordLearning before final retention. Failed or unavailable confirmation cannot establish improvement. |
| Improve behavior or repair a failure | Use the numbered loop below. |

After substantive edits on any path, call ReviewDesign on the changed instructions and affected callers before structural completion or a retention decision. Resolve blocking contradictions and missing handoffs, recheck affected paths, and record deferred risks. Typo/formatting edits without changed meaning keep the lightweight checks above.

Shared procedures are reusable operations, not required separate agent calls. Existing adequate records can be linked. A requested behavioral enhancement needs evaluation of its desired difference and preservation, not an invented prior failure.

### Execution scope and stopping

Before launching experiments, use PlanChange's experiment adequacy check: test the user's decision at the necessary level, not only the easiest intermediate artifact. If human checkpoints are not requested or have been withdrawn, make the evidence-based decisions within existing authority and continue. Do not invent a human review dependency for ordinary experiment choices.

Before closing, resolve identified in-scope outcome uncertainties with available checks. Reporting an uncertainty honestly does not by itself finish work that is authorized and feasible. Preserve genuine scope and resource limits; do not expand a focused request into unrelated repairs.

A request to improve behavior or repair a failure includes proportionate outcome evaluation within the user's scope. Do not silently downgrade it to design-only because the change is written as instructions, measures are missing, or the first edit is finished. Qualify or refine missing checks before using them to judge improvement. Explicit requests for a proposal or design-only revision keep that narrower scope; the maintenance shortcuts above remain proportional.

For human-in-the-loop work, stop at the agreed outcome, measurement or result checkpoints with a concrete review artifact and the next action recorded. After the user resolves that checkpoint, continue the existing evaluation plan without requesting the same authorization again. Actual unavailable dependencies, resources or unresolved material choices may prevent execution: report what was attempted, the specific missing evidence and the next step, keeping improvement unverified. Do not treat a static validation pass or the candidate author's example as an outcome trial.

1. Read target intent, applicable workflows/quality records and latest decisions. Preserve the baseline. For broad work, apply ComprehensiveImprovement's parent inventory, independent scope challenge and whole-skill structural review before selecting rounds; freeze a comprehensive [completion contract](../Templates/Improvement/Completion.md). Focused behavioral repairs use a compact contract. Include actual execution and preservation. Do not replace user scope with a per-round budget or narrow it because easier checks pass.
2. For a reported or observed gap, call DiagnoseGap before planning. Then call EstablishQuality: for broad improvement, make the purpose-to-outcome reasoning visible before proposing metrics or edits; for a focused repair, revisit only the affected purpose and outcomes. Include DesignMeasurement for new/changed/unsupported measures even without a gap. Preserve criterion IDs and measurement versions; record authorized changes separately. Use the same qualified definition for baseline and candidate comparisons.
3. Call PlanChange with the diagnosis or requested change, suspected cause, protected behavior, budget, and decision rule. For broad improvement, complete its research decision before ranking changes; reuse existing evidence and search academic literature when a consequential question remains that research could inform. Name the outcome-level evaluation and when it runs; for an improvement claim compare the preserved baseline and candidate under the same applicable checks and comparable conditions. Include its regression-coverage map and separate benefit/preservation gates for behavioral updates; shared instructions may affect other branches beyond the reported failure. A design hypothesis need not be presented as an observed failure. A case/checker gap may require only evaluation changes; retain the target when no skill edit is justified.
4. Call DraftCandidate for the smallest coherent revision; avoid unrelated changes. Apply the authoring review above before evaluation.
5. For behavioral improvement or repair, call EvaluateCandidate then ApproveSkill before closing the attempt. Test the intended result and required preservation, not just instruction compliance or package structure. When improving SkillForge, separate better authoring/evaluation decisions from improved downstream skill behavior; evidence for one does not establish the other. For an explicit design-only revision, record evaluation as not run with its next step and return unverified status.
6. For broad work, reconcile the round with the parent inventory and structural findings through ComprehensiveImprovement, rerank remaining work and execute the next useful round. Then consume ApproveSkill's **parent task** status: `continue` executes the next action; `blocked` reports the evidenced limit and resume action; `complete` permits closure. Call RecordLearning for round and task decisions separately. A retained candidate, passing sample, local no-change verdict or exhausted pilot cannot close uncovered parent outcomes. Preserve prior results rather than repeating until a candidate wins.

If ApproveSkill identifies a feasible missing check for a required outcome, continue the bounded evaluation instead of advancing to final closure. Amend the plan/checker explicitly when needed, preserve earlier observations, and rerun affected comparisons fairly. If the check reveals a defect, return to the smallest justified revision. Final retention and completion are different decisions when a requested outcome remains unresolved.

## Completion

The user receives the owned result, evidence status, and unresolved limitations. Do not silently expand a design-only or assessment-only request into execution, edits, installation, or release.

For an improvement request, "draft edited; structural checks pass" is an intermediate state. Finish only when ApproveSkill returns task status `complete`, or report its actual `blocked` condition and resume action. A candidate retain/reject/defer decision is not task completion. Missing qualification prevents a confirmed improvement claim; it does not justify skipping authorized exploratory or qualification work.
