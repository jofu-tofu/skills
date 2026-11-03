# EstablishQuality

Internal procedure; called by workflows, not automatically loaded at entry.

## Contract

**Input:** A target's intent, task context, existing criteria, authority, and available evidence.

**Output:** A scoped, versioned quality profile with unresolved questions.

## Steps

1. Bound the workflow, audience, evaluation unit, and claim.
2. Elicit intended outcomes and record each criterion's source.
3. Separate requirements, preferences, assumptions, and process choices; record tradeoffs and authority.
4. Challenge criteria with failures, misleading passes, and valid alternatives.
5. Call [DesignMeasurement](DesignMeasurement.md) for every new, materially changed, unsupported or out-of-scope measure, including new skills with no reported incident. Reuse an existing qualified specification only after checking its scope and evidence still apply. Link its version, status, limits and revision triggers from Feedback. Outcome clarification belongs here; a new definition does not itself qualify a measurement. In design-only work return its planned qualification without running unrequested tests.
6. Hand off an improvement target, protected behavior, and unresolved questions to PlanChange. Do not invent a change when only evaluation is requested.

## Acceptance and failure checks

Another evaluator can identify applicable criteria and evidence gaps. Stale criteria are revised only with reasons and authority; conflicting requirements remain visible.

## References and limits

Use the [quality templates](../Templates/Quality/Context.md) when records are missing; follow their links through all five files. Existing records can be referenced instead of duplicated.

Status: proposed and unvalidated. Shared requirements: [Quality/Shared](../Quality/Shared.md). Test this procedure with fixed input artifacts independently, then test its handoffs.
