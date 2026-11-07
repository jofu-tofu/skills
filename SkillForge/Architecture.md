# Rule owners and loading boundaries

Optional lookup for finding or maintaining instructions. Start ordinary tasks at [SKILL.md](SKILL.md); read its entry requirements and the selected workflow. This map does not add required reads or replace the linked owners. Follow their conditions, not every link here.

## Find the current owner

| Need | Authoritative instruction / working artifact |
|---|---|
| Choose Create, Update or Evaluate; distinguish a complaint from a repair request | [Entry routing](SKILL.md#workflow-routing); [Create](Workflows/CreateSkill.md), [Update](Workflows/UpdateSkill.md), [Evaluate](Workflows/EvaluateSkill.md) own execution order and branches |
| Choose the scope of a typo, fixed move, structural revision or behavioral change | [Update scope](Workflows/UpdateSkill.md#purpose-and-scope); [alternative-generation activation](Procedures/PlanChange.md#alternative-generation-activation) owns when to compare mechanisms |
| Diagnose a reported gap | [DiagnoseGap](Procedures/DiagnoseGap.md); [gap record](Templates/Improvement/GapRecord.md) |
| Define outcomes, map capability contributions, consider avoidable effort | [EstablishQuality](Procedures/EstablishQuality.md); [outcome contribution mapping](Procedures/EstablishQuality.md#outcome-contribution-mapping); [quality templates](Templates/Quality/Context.md) |
| Design or qualify a measure | [DesignMeasurement](Procedures/DesignMeasurement.md); [measurement specification](Templates/Quality/Measurement.md) |
| Choose changes, research, comparisons and stopping rules | [PlanChange](Procedures/PlanChange.md); [GenerateAlternatives](Procedures/GenerateAlternatives.md) supplies options when called; [plan](Templates/Improvement/Plan.md) |
| Preserve whole-task coverage across rounds | [ComprehensiveImprovement](Procedures/ComprehensiveImprovement.md); [regression coverage](Standards/RegressionCoverage.md) |
| Draft or review instruction boundaries and handoffs | [DraftCandidate](Procedures/DraftCandidate.md), [ReviewDesign](Procedures/ReviewDesign.md), [Authoring](Standards/Authoring.md) |
| Construct cases or test triggering | [ConstructCases](Procedures/ConstructCases.md), [TestTriggering](Procedures/TestTriggering.md) |
| Execute checks and interpret pass/fail/unverified | [EvaluateCandidate](Procedures/EvaluateCandidate.md), [Grader](Standards/Grader.md); [schemas](Standards/Schemas.md) own result formats |
| Decide readiness/retention separately from task completion | [ApproveSkill](Procedures/ApproveSkill.md); [completion contract and invocation](Templates/Improvement/Completion.md); [tool capabilities](Tools/README.md) |
| Record an attempt and its retained version | [RecordLearning](Procedures/RecordLearning.md); [attempt index](Improvements/Index.md) for changes to SkillForge itself |
| Check what this package has actually demonstrated | [ValidationSummary](Evidence/ValidationSummary.md) and [release scope](RELEASE.md); linked historical results retain their original scope |

## Current requirements versus history

- [SkillIntent](SkillIntent.md) owns durable purpose and design reasons. [Shared quality](Quality/Shared.md) applies across workflows. Each selected workflow's Reference Material section names its current Context/Outcomes and when to load Tradeoffs, Feedback and ChallengeCases. SkillForge's profiles assess SkillForge; the target's records define target behavior.
- Procedures read relevant target records. EstablishQuality uses the five quality templates when records are missing. Attempts belong to the target being changed; assessment-only work keeps its records in the evaluation workspace. Reserved assessment cases stay separate from candidate-authoring context.
- `Quality/ImproveSkill` and its SF-Q IDs preserve the earlier design profile. Current routing uses CreateSkill, UpdateSkill and EvaluateSkill profiles. Historical observations are evidence, not a competing current policy.
- `Improvements`, `Checks` and linked external experiments preserve attempts and provenance. [ValidationSummary](Evidence/ValidationSummary.md) scopes current evidence; old statuses do not override later integration decisions. [ResearchLibrary](ResearchLibrary/SkillForge%20Research%20Library.md) is optional background, selected for the question at hand. Historical and external raw records are not runtime prerequisites.

## Maintaining the boundaries

A workflow owns a distinct user result and completion condition. A procedure owns a reusable operation with a stable input/output contract. A heading alone does not need another file or agent. Approval remains shared, not a fourth entry point. Keep Create and Update distinct for their starting state, baseline, preservation duties and acceptance claims; keep their orchestration short and delegate shared rules.

Edit the linked owner when changing a rule; update this map only when its location or responsibility changes. Summaries and callers must agree with that owner. Test affected procedure contracts, caller branches and actual downstream behavior separately: passing a component does not establish that the workflow works. [ReviewDesign](Procedures/ReviewDesign.md#responsibility-checks) owns these checks; [routing cases](Checks/RoutingCases.md) are proposed fixtures, not proof of fresh-agent behavior.
