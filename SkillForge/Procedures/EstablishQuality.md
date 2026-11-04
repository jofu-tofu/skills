# EstablishQuality

Internal procedure; called by workflows, not automatically loaded at entry.

## Contract

**Input:** A target's intent, task context, existing criteria, authority, and available evidence.

**Output:** A scoped, versioned quality profile with unresolved questions.

## Steps

1. Bound the workflow, audience, evaluation unit, and claim. State the job in terms of the user's need and useful result, independently of the current tools, file layout or agent pipeline. Use existing intent as evidence of authorized purpose; expose conflicts or stale assumptions rather than silently replacing it. Reuse adequate reasoning instead of restarting it for every focused change.
2. Derive expected outcomes from that job and record each criterion's source and why it matters. Do not convert every existing implementation step into a requirement or choose outcomes because they are easy to score.
3. Separate requirements, preferences, assumptions, and process choices; record tradeoffs and authority. Preserve explicit constraints unless changing them is authorized; a mechanism can be a required constraint without being the outcome itself.
4. Challenge the proposed outcomes before selecting measures: could a result satisfy them yet fail the user's need, or serve the need yet be rejected? Use concrete failures, misleading passes and valid alternatives to expose missing or misplaced criteria. Record resulting revisions and unresolved conflicts. This checks the adequacy of the outcomes, not the validity of a scoring method.
5. Call [DesignMeasurement](DesignMeasurement.md) for every new, materially changed, unsupported or out-of-scope measure, including new skills with no reported incident. Reuse an existing qualified specification only after checking its scope and evidence still apply. Link its version, status, limits and revision triggers from Feedback. Outcome clarification belongs here; a new definition does not itself qualify a measurement. In design-only work return its planned qualification without running unrequested tests.
6. Hand off an improvement target, protected behavior, and unresolved questions to PlanChange. Do not invent a change when only evaluation is requested.

When the user requests human involvement, present the purpose, derived outcomes and unresolved tradeoffs at the agreed checkpoint before dependent measurement or change decisions. Otherwise proceed within existing authority, asking only about material unresolved choices. Do not add a universal approval step.

## Acceptance and failure checks

Another evaluator can identify applicable criteria and evidence gaps. Stale criteria are revised only with reasons and authority; conflicting requirements remain visible.

## References and limits

Use the [quality templates](../Templates/Quality/Context.md) when records are missing; follow their links through all five files. Existing records can be referenced instead of duplicated.

Status: proposed and unvalidated. Shared requirements: [Quality/Shared](../Quality/Shared.md). Test this procedure with fixed input artifacts independently, then test its handoffs.
