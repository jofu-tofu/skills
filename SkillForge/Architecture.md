# Entry points and procedure boundaries

Status: proposed, 2026-11-03. This replaces the earlier four-entry-point sketch. ApproveSkill is now a shared procedure.

```text
SKILL.md
  Workflows/CreateSkill.md
    EstablishQuality → PlanChange → DraftCandidate → ReviewDesign
      → EvaluateCandidate → ApproveSkill → RecordLearning
  Workflows/UpdateSkill.md
    DiagnoseGap (when a gap motivates the request) → EstablishQuality → PlanChange → DraftCandidate → ReviewDesign
      → EvaluateCandidate → ApproveSkill → RecordLearning
  Workflows/EvaluateSkill.md
    DiagnoseGap (when a gap motivates the request) → EstablishQuality → EvaluateCandidate
      → ApproveSkill (when readiness is requested) → RecordLearning
```

These are summaries; [CreateSkill](Workflows/CreateSkill.md), [UpdateSkill](Workflows/UpdateSkill.md) and [EvaluateSkill](Workflows/EvaluateSkill.md) own execution order and branch conditions. Design-only Create/Update drafts, completes structural review and records behavior as unverified; it skips runtime evaluation. Evaluation-only returns an assessment; it does not automatically ask for approval or modify the target.

Gap-driven requests use [DiagnoseGap](Procedures/DiagnoseGap.md), a shared procedure rather than a fourth entry point. A request to fix routes to Update; a request to investigate or a bare complaint routes to Evaluate. Diagnosis may return an unchanged skill with a benchmark/checker plan or insufficient evidence. [GapRecord](Templates/Improvement/GapRecord.md) preserves incident → diagnosis → measurement version → next action.

All three workflows reach [DesignMeasurement](Procedures/DesignMeasurement.md) through EstablishQuality. ConstructCases materializes its qualification cases; EvaluateCandidate checks qualification and scope before interpreting target results. DiagnoseGap also uses it when an incident exposes a measurement problem. The bundled procedure and [measurement template](Templates/Quality/Measurement.md) define the execution contract; Task 3 research and its CodeReview example are optional background.

A measurement may be designed before it is qualified. Qualification tests whether its observations support the intended claim, using independent references and informative contrasts. Required unsupported measurements leave target claims unverified. A confirmed mandatory failure may still decide not-ready. Design-only delivery needs a qualification plan, not invented execution evidence. [Grader](Standards/Grader.md) and the [canonical results contract](Standards/Schemas.md#canonical-resultsjson) govern these decisions.

## Separation rule

ReviewDesign is required during creation and substantive updates; typo/formatting-only edits retain lightweight checks. ConstructCases and TestTriggering are selected when relevant alongside the existing gap diagnosis. EvaluateSkill selects review, cases-only, triggering, or execution mode. UpdateSkill selects a short maintenance path or the full behavioral loop. No new top-level workflow is required. Bundled standards and tools load only where relevant; see [tool status](Tools/README.md).

Create a user workflow when the request has a distinct end result and completion condition. Extract a procedure when several workflows reuse an operation with a stable input/output contract. A heading or reasoning step alone does not need its own file or agent.

Create and Update share much of the sequence, but differ in starting state, baseline, preservation duties, and acceptance claims. Keep their orchestration files short. Do not duplicate procedure instructions.

## Records and ownership

- SkillForge's Quality folders assess how well its own workflows perform.
- The target skill's quality records define what good target behavior means.
- Workflows load their own Context and Outcomes first; load Tradeoffs at planning/decision, Feedback before evaluation, and ChallengeCases during test design.
- Procedures read only relevant target records. EstablishQuality reads its five templates when creating missing records.
- Attempts belong to the target being changed. Improvements here records attempts to improve SkillForge itself.
- Reserved assessment cases stay in a separate evaluation workspace inaccessible to the candidate-authoring context.

## Quality coverage

Each user workflow has five quality documents. Procedure contracts also include acceptance checks and failure examples; they do not each need five more files.

Quality/ImproveSkill is the preserved earlier design profile. Active routes use CreateSkill, UpdateSkill, and EvaluateSkill profiles instead. The older SF-Q IDs remain historical references, not a second active source of requirements.

## Independent and combined tests

Test procedures with fixed inputs: incomplete criteria, baseline/candidate evidence packets, or conflicting requirements. Test orchestration with stubbed procedure results to check routing, scope, and handoffs. Then test actual end-to-end behavior; component success does not prove the full workflow works.

The [routing cases](Checks/RoutingCases.md) are proposed fixtures. They have not been executed by a fresh agent.
