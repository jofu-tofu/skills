# UpdateSkill Workflow

> **Trigger:** "update a skill"

## Reference Material

- [Intent](../SkillIntent.md), [shared requirements](../Quality/Shared.md), [Context](../Quality/UpdateSkill/Context.md) and [Outcomes](../Quality/UpdateSkill/Outcomes.md): read at entry.
- [Tradeoffs](../Quality/UpdateSkill/Tradeoffs.md): before planning/deciding; [Feedback](../Quality/UpdateSkill/Feedback.md): before evaluation; [ChallengeCases](../Quality/UpdateSkill/ChallengeCases.md): when designing cases.
- Read each linked procedure when called. Procedures are reusable operations, not separate required agent calls; reference adequate existing records.

For focused attempts, prose templates are optional layouts, not an additional required reading chain. Record the fields required by the procedures in an adequate existing plan/report; load a prose template only when a needed field is unclear or a consumer requires that format. This applies to linked quality-profile and plan/results/decision templates, including redirect pages. It does not waive intent, shared/profile requirements, called procedures, relevant standards, machine-readable schemas, the completion-contract format, qualification evidence, evaluation or the completion check. Preserve raw evidence and link it once rather than duplicating it across handoff records.

## Purpose and scope

Deliver a scoped revision and a justified retain/reject/defer decision while preserving required existing behavior.

Classify by the requested effect. Short approvals inherit the preceding goal and evaluation scope; choosing a mechanism does not mean design-only. Changes to agent decisions or execution are behavioral even when written only in Markdown. Broad improvement uses [ComprehensiveImprovement](../Procedures/ComprehensiveImprovement.md); an easy first round cannot narrow its parent scope. Explicit focused repairs and maintenance remain proportional.

| Requested result | Path |
|---|---|
| Typo, formatting or wording without intended behavior change | Read target intent and affected text, edit, inspect diff/relevant links; validate if structure/routing changed. Skip quality regeneration, experiments and gate. |
| Add/rename workflow or refactor structure | A fixed mechanical move/rename with no remaining structural choice uses [Authoring](../Standards/Authoring.md), relevant validation/link checks and affected-handoff checks. If the work chooses or revises structure, use the numbered loop and [PlanChange's activation rule](../Procedures/PlanChange.md#alternative-generation-activation), even when focused. Keep the requested scope; this does not make it comprehensive. |
| Integrate research or add intent | Read Authoring and its KnowledgeIntegration reference. Preserve rationale/limits and use existing explicit user goals. Citation/rationale-only maintenance stays narrow; changed decisions/behavior use the loop below. |
| Repair description/triggering | Use [TestTriggering](../Procedures/TestTriggering.md), authoring review below, ApproveSkill and RecordLearning. Missing/failed confirmation cannot establish improvement. |
| Improve behavior or repair failure | Use the loop below, including proportionate outcome evaluation. |
| Explicit design-only revision | Plan/draft and complete authoring review; record unexecuted behavioral checks and next step. Return unverified without unrequested execution. |

After substantive edits on any path, call [ReviewDesign](../Procedures/ReviewDesign.md) on affected instructions/callers. Resolve blocking contradictions and missing handoffs, recheck affected paths and record deferred risks. Typo/formatting-only edits keep lightweight checks.

## Improvement loop

1. Read target intent, applicable workflows/quality and latest decisions; preserve the baseline. Freeze a pre-edit [completion contract](../Templates/Improvement/Completion.md). For broad work, first establish ComprehensiveImprovement's reviewed parent inventory and whole-skill structural baseline; focused work uses a compact contract.
2. For a reported/observed gap, call [DiagnoseGap](../Procedures/DiagnoseGap.md). Call [EstablishQuality](../Procedures/EstablishQuality.md) for purpose-derived outcomes, relevant contribution mapping and operational efficiency, revisiting only affected scope for focused work. Preserve criterion IDs and record authorized changes. Its [DesignMeasurement](../Procedures/DesignMeasurement.md) handoff qualifies new/changed/unsupported measures; a requested enhancement need not invent a prior failure.
3. Call [PlanChange](../Procedures/PlanChange.md) for the smallest useful change, protected behavior, evidence, budget and decision rule. Apply its research decision when required and experiment-adequacy check before trials. Name actual outcome evaluation and separate benefit/preservation gates, including affected shared branches and handoffs. Compare baseline/candidate under the same applicable measures and conditions. A checker/case gap may justify retaining the skill unchanged.
4. Call [DraftCandidate](../Procedures/DraftCandidate.md); complete authoring review above before evaluation. Avoid unrelated changes.
5. Call [EvaluateCandidate](../Procedures/EvaluateCandidate.md), then [ApproveSkill](../Procedures/ApproveSkill.md). Evaluate the intended result and required preservation, not just instruction compliance or structure. For SkillForge itself, distinguish better improvement decisions from improved downstream skill behavior; evidence for one does not establish the other.
6. For broad work, reconcile each round through ComprehensiveImprovement and execute the next useful round. Consume ApproveSkill's owning-task status: `continue` executes its named next action through planning/evaluation/repair; `blocked` reports the evidenced limit and resume action; `complete` permits closure. [RecordLearning](../Procedures/RecordLearning.md) preserves round and parent decisions separately, including failures and ties. Retention is not task completion.

## Authority and completion

Behavioral improvement includes evaluation within scope; missing measures or a completed edit do not make it design-only. Qualify/refine checks and continue feasible required work. ApproveSkill owns scope/composition checks, evidence gates, completion rules and the required CheckCompletion invocation; consume its result rather than substituting a structural pass or local round verdict.

Honor agreed human checkpoints with a concrete artifact. Once resolved, continue without requesting the same authorization again. Otherwise decide within existing authority; ordinary experiment choices need no invented approval. Report genuine runtime/resource/authority limits and missing evidence accurately. Preserve explicit design-only and maintenance completion rules, and do not expand into unrelated repairs, installation or release.
