# EstablishQuality

Internal procedure; called by workflows, not automatically loaded at entry.

## Contract

**Input:** A target's intent, task context, existing criteria, authority, and available evidence.

**Output:** A scoped, versioned quality profile with outcome relationships, relevant capability contributions and unresolved questions. Simple outcomes need no artificial hierarchy.

## Steps

1. Bound the workflow, audience, evaluation unit, and claim. State the job in terms of the user's need and useful result, independently of the current tools, file layout or agent pipeline. Use existing intent as evidence of authorized purpose; expose conflicts or stale assumptions rather than silently replacing it. Reuse adequate reasoning instead of restarting it for every focused change.
2. Derive expected outcomes from that job and record each criterion's source and why it matters. Decompose broad outcomes into more specific user-relevant results where different consequential failures would otherwise be hidden. Keep parent outcome IDs so the detailed results remain connected to the purpose. Consider [operational efficiency](#operational-efficiency) within the requested scope. Do not convert every existing implementation step into a requirement or choose outcomes because they are easy to score.
3. Separate requirements, preferences, assumptions, and process choices; record tradeoffs and authority. Preserve explicit constraints unless changing them is authorized; a mechanism can be a required constraint without being the outcome itself.
4. Challenge the proposed outcomes before selecting measures: could a result satisfy them yet fail the user's need, or serve the need yet be rejected? Use concrete failures, misleading passes and valid alternatives to expose missing or misplaced criteria. Stop decomposing when an outcome distinguishes a meaningful failure from a valid alternative and can guide a check or improvement; split further only where it changes a decision. Follow the contribution mapping below to check coverage and inform the target's design. Record resulting revisions and unresolved conflicts. This checks the adequacy of the outcomes, not the validity of a scoring method.
5. Call [DesignMeasurement](DesignMeasurement.md) for every new, materially changed, unsupported or out-of-scope measure, including new skills with no reported incident. Reuse an existing qualified specification only after checking its scope and evidence still apply. Link its version, status, limits and revision triggers from Feedback. Outcome clarification belongs here; a new definition does not itself qualify a measurement. In design-only work return its planned qualification without running unrequested tests.
6. Hand off the outcome relationships and relevant contribution map with an improvement target, protected behavior, and unresolved questions to PlanChange. Do not invent a change when only evaluation is requested.

## Operational efficiency

Consider the effort needed to deliver the required result: loaded context, navigation, tool/model calls, repeated work, latency and user intervention. Treat operational efficiency as a cross-cutting outcome where relevant, with mandatory quality and correctness preserved. Broad improvement examines avoidable effort across the supported task surface; focused work examines affected paths only. Routine maintenance keeps its short path. Record a material opportunity, a justified no-change conclusion, or an unresolved cost question in existing outcomes; do not create a separate efficiency programme for every skill.

Navigation, shared rule ownership, selective loading and compact records are possible mechanisms, not outcomes by themselves. Fewer words/files/steps do not establish lower total effort: extra lookups, retries or missing exceptions may cost more. Choose task-relevant observations through DesignMeasurement, compare equivalent outcomes and conditions, and distinguish static instruction volume from observed execution cost. Unknown usage remains unknown. No universal token ceiling or mandatory numerical efficiency score applies.

## Outcome contribution mapping

For broad improvement, use the active parent inventory owned by [ComprehensiveImprovement](ComprehensiveImprovement.md); establish it if absent, rather than recursively starting another improvement process. Inventory the full supported task surface and challenge omissions before selecting test cases. A few outcomes per existing component are not necessarily comprehensive: inspect workflow families, distinct failure modes, alternate/early routes and compositions, including missing responsibilities. Maintain parent coverage separately from the current round; exclusions need a purpose/user-scope basis, not convenience. No row-count quota establishes completeness.

After deriving and challenging outcomes, map them to the target's existing dimensions, capabilities or workflow responsibilities where useful. For each relevant outcome, record contributors, their distinct contributions and the reason for the mapping. Primary/shared roles are optional; several contributors may serve one outcome, and one contributor may serve several outcomes. Keep cross-cutting requirements attached to every applicable outcome. Use the [Outcomes template](../Templates/Quality/Outcomes.md) or equivalent existing records.

Inspect the map both ways: which outcomes have no clear contributor, and which existing components lack an outcome-based reason? Missing coverage, duplicated work or an unclear boundary can motivate a proposal to refine, add, combine or remove responsibilities. Shared outcomes alone do not establish waste: contributors may offer complementary evidence. Derive proposed component goals from the specific outcomes, then check that their combined coverage still serves the overall purpose. Preserve explicit design constraints; the map does not authorize restructuring by itself.

This is a contribution hypothesis, not proof that a component caused a gain. Evaluate final outcomes and qualify measures separately; do not duplicate a finding or observed benefit just because several dimensions contributed. A new or simple skill need not acquire dimensions, extra levels or separate files to satisfy this procedure. Focused repairs revisit only affected mappings; assessment-only mappings stay in the evaluation workspace.

When the user requests human involvement, present the purpose, derived outcomes, relevant contribution map and unresolved tradeoffs at the agreed checkpoint before dependent measurement or change decisions. Agreement on broad outcomes does not resolve newly introduced detailed requirements or responsibility changes. Otherwise proceed within existing authority, asking only about material unresolved choices. Do not add a universal approval step.

## Acceptance and failure checks

Another evaluator can identify applicable criteria and evidence gaps. Stale criteria are revised only with reasons and authority; conflicting requirements remain visible.

## References and limits

Use the [quality templates](../Templates/Quality/Context.md) when records are missing; follow their links through all five files. Existing records can be referenced instead of duplicated.

Status: proposed and unvalidated. Shared requirements: [Quality/Shared](../Quality/Shared.md). Test this procedure with fixed input artifacts independently, then test its handoffs.
