# EvaluateSkill Workflow

> **Trigger:** "evaluate a skill"

## Reference Material

- [Intent](../SkillIntent.md) and [shared requirements](../Quality/Shared.md): read at entry.
- [Context](../Quality/EvaluateSkill/Context.md) and [Outcomes](../Quality/EvaluateSkill/Outcomes.md): read at entry.
- [Tradeoffs](../Quality/EvaluateSkill/Tradeoffs.md): read before planning or deciding.
- [Feedback](../Quality/EvaluateSkill/Feedback.md): read before evaluation.
- [ChallengeCases](../Quality/EvaluateSkill/ChallengeCases.md): read when designing cases.
- [DesignMeasurement](../Procedures/DesignMeasurement.md): design/qualify new, changed, unsupported or out-of-scope measures in the evaluation workspace; required unsupported measures prevent confirmed readiness/improvement.
- [DiagnoseGap](../Procedures/DiagnoseGap.md): read and call for a reported gap or suspected evaluation failure.
- [EstablishQuality](../Procedures/EstablishQuality.md), [PlanChange](../Procedures/PlanChange.md), [DraftCandidate](../Procedures/DraftCandidate.md), [EvaluateCandidate](../Procedures/EvaluateCandidate.md), [ApproveSkill](../Procedures/ApproveSkill.md), [RecordLearning](../Procedures/RecordLearning.md): read the relevant procedure when called.

## Purpose

Produce a trustworthy assessment of a named skill version without silently modifying it.

## Workflow Steps

Select a mode: review/audit invokes [ReviewDesign](../Procedures/ReviewDesign.md); cases-only invokes [ConstructCases](../Procedures/ConstructCases.md) and stops before execution; triggering assessment invokes [TestTriggering](../Procedures/TestTriggering.md); execution/comparison follows the steps below. In every mode, invoke DesignMeasurement if proposing or relying on a new, changed or unsupported outcome measure; a structural review need not invent measurements for claims it does not make. A request to test with no suite composes ConstructCases then EvaluateCandidate. None of these modes silently edits the target.

1. Identify whether the request asks for assessment, comparison, or readiness. Load the target's intent, criteria, and supplied evidence.
2. For a reported gap or suspected evaluation failure, call DiagnoseGap before freezing the specification. Call EstablishQuality to resolve or expose missing criteria. Keep proposed measurement changes in the evaluation workspace; preserve target files and canonical quality records. Then freeze the applicable specification. A readiness request without a gap need not run diagnosis.
3. Call EvaluateCandidate using existing evidence or authorized executions. A single-version assessment need not invent a baseline.
4. If readiness was requested, call ApproveSkill with the assessment and declared gate. Otherwise return the assessment directly.
5. If ApproveSkill returned `continue`, perform its named check within assessment-only scope before closing; do not edit the target. Report an actual `blocked` limit when applicable. A trustworthy assessment may complete with an insufficient-evidence finding when that is the requested result. Call RecordLearning in the evaluation workspace, including failures, disagreements, and unchecked behavior.

## Completion

The user receives the owned result, evidence status, and unresolved limitations. Do not silently expand a design-only or assessment-only request into execution, edits, installation, or release.
