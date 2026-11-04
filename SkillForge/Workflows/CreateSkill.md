# CreateSkill Workflow

> **Trigger:** "create a skill"

## Reference Material

- [Intent](../SkillIntent.md) and [shared requirements](../Quality/Shared.md): read at entry.
- [Context](../Quality/CreateSkill/Context.md) and [Outcomes](../Quality/CreateSkill/Outcomes.md): read at entry.
- [Tradeoffs](../Quality/CreateSkill/Tradeoffs.md): read before planning or deciding.
- [Feedback](../Quality/CreateSkill/Feedback.md): read before evaluation.
- [ChallengeCases](../Quality/CreateSkill/ChallengeCases.md): read when designing cases.
- [DesignMeasurement](../Procedures/DesignMeasurement.md): called through EstablishQuality for new/changed/unsupported measures, even without an incident.
- [EstablishQuality](../Procedures/EstablishQuality.md), [PlanChange](../Procedures/PlanChange.md), [DraftCandidate](../Procedures/DraftCandidate.md), [ReviewDesign](../Procedures/ReviewDesign.md), [EvaluateCandidate](../Procedures/EvaluateCandidate.md), [ApproveSkill](../Procedures/ApproveSkill.md), [RecordLearning](../Procedures/RecordLearning.md): read the relevant procedure when called.

## Purpose

Deliver a candidate skill for a defined user need, with a scoped assessment or explicit unverified status.

## Workflow Steps

1. Scope the need and check whether an existing skill already covers it. Read the target intent if extending existing work; route that change to UpdateSkill.
2. Call EstablishQuality for each owned target workflow, including DesignMeasurement for new or unsupported measures. Separate user outcomes from shared internal procedures. Link the measurement specification, qualification status and pending evidence before planning; design-only requests may deliver planned qualification.
3. Call PlanChange, using a no-skill or named alternative baseline when claiming benefit. For design-only work record behavioral checks as pending.
4. Call DraftCandidate to create instructions and supporting files in the authorized destination.
   Read [Authoring](../Standards/Authoring.md); include target intent, user-facing routing, relevant examples, and explicit completion/evidence conditions. Run the bundled structural validator where the target follows its supported format. Check local references separately.
   Call ReviewDesign on the candidate and its handoffs; resolve blocking findings and recheck affected paths before structural completion, recording deferred risks.
5. If execution is authorized, call EvaluateCandidate then ApproveSkill. Otherwise deliver the candidate as unverified.
6. Call RecordLearning and return the candidate, evidence status, and remaining limitations.

## Completion

The user receives the owned result, evidence status, and unresolved limitations. Do not silently expand a design-only or assessment-only request into execution, edits, installation, or release.
