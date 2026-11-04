# UpdateSkill Workflow

> **Trigger:** "update a skill"

## Reference Material

- [Intent](../SkillIntent.md) and [shared requirements](../Quality/Shared.md): read at entry.
- [Context](../Quality/UpdateSkill/Context.md) and [Outcomes](../Quality/UpdateSkill/Outcomes.md): read at entry.
- [Tradeoffs](../Quality/UpdateSkill/Tradeoffs.md): read before planning or deciding.
- [Feedback](../Quality/UpdateSkill/Feedback.md): read before evaluation.
- [ChallengeCases](../Quality/UpdateSkill/ChallengeCases.md): read when designing cases.
- [DesignMeasurement](../Procedures/DesignMeasurement.md): qualify new, changed or unsupported measures before relying on them for improvement claims; reuse qualified evidence only within scope.
- [DiagnoseGap](../Procedures/DiagnoseGap.md): read and call when a gap or unexpected behavior motivates the request.
- [EstablishQuality](../Procedures/EstablishQuality.md), [PlanChange](../Procedures/PlanChange.md), [DraftCandidate](../Procedures/DraftCandidate.md), [ReviewDesign](../Procedures/ReviewDesign.md), [EvaluateCandidate](../Procedures/EvaluateCandidate.md), [ApproveSkill](../Procedures/ApproveSkill.md), [RecordLearning](../Procedures/RecordLearning.md): read the relevant procedure when called.

## Purpose

Deliver a scoped revision and a justified retain/reject/defer decision while preserving required existing behavior.

## Workflow Steps

Choose the lightest path before the numbered behavioral loop:

| Request | Path |
|---|---|
| Typo, formatting, or small wording correction without intended behavior change | Read target intent and affected text, edit, inspect the diff and relevant links. Validate if structure/routing changed. Report checks; skip quality regeneration, experiment plans, and approval gate. |
| Add/rename workflow or refactor structure | Read [Authoring](../Standards/Authoring.md), preserve intent and routing, change only the affected structure, run bundled validation and link checks. Evaluate affected handoffs before claiming behavioral equivalence. |
| Integrate research or add intent | Read Authoring and its KnowledgeIntegration reference; preserve rationale and limits. Existing explicit user goals supply intent; clarify only material gaps. |
| Repair description/triggering | Use [TestTriggering](../Procedures/TestTriggering.md) for provisional candidates and target-runtime confirmation evidence. Apply the authoring review below, then call ApproveSkill and RecordLearning before final retention. Failed or unavailable confirmation cannot establish improvement. |
| Improve behavior or repair a failure | Use the numbered loop below. |

After substantive edits on any path, call ReviewDesign on the changed instructions and affected callers before structural completion or a retention decision. Resolve blocking contradictions and missing handoffs, recheck affected paths, and record deferred risks. Typo/formatting edits without changed meaning keep the lightweight checks above.

Shared procedures are reusable operations, not required separate agent calls. Existing adequate records can be linked. A request to make a design change authorizes that change; no fabricated behavioral failure is needed.

1. Read target intent, affected workflows, applicable quality records, and the latest relevant decision. Preserve the baseline.
2. For a reported or observed gap, call DiagnoseGap before planning. Then call EstablishQuality to check context drift or clarify affected outcomes, including DesignMeasurement for new/changed/unsupported measures even without a gap. Preserve criterion IDs and measurement versions; record authorized changes separately. Use the same qualified definition for baseline and candidate comparisons.
3. Call PlanChange with the diagnosis or requested change, suspected cause, protected behavior, budget, and decision rule. Include its regression-coverage map and separate benefit/preservation gates for behavioral updates; shared instructions may affect other branches beyond the reported failure. A design hypothesis need not be presented as an observed failure. A case/checker gap may require only evaluation changes; retain the target when no skill edit is justified.
4. Call DraftCandidate for the smallest coherent revision; avoid unrelated changes. Apply the authoring review above before evaluation.
5. When execution is authorized, call EvaluateCandidate then ApproveSkill. For a design-only revision, return unverified status rather than claiming improvement.
6. Call RecordLearning. Report which version was retained and the evidence scope. Further attempts need remaining budget and a new explicit hypothesis.

## Completion

The user receives the owned result, evidence status, and unresolved limitations. Do not silently expand a design-only or assessment-only request into execution, edits, installation, or release.
