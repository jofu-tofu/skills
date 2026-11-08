# Relay release-auditor evaluation plan

Planning only. Leave both instruction sets unchanged. Treat the supplied calibration costs and scorer qualification as planning assumptions; no new results are claimed.

Use **one integrated release workflow returning four separately scored decisions**. It preserves the joint reasoning and every required decision at the lowest supplied cost: 5,900 tokens and one context per complete assessment. Four atomic checks in one context cost 6,500; separate requests cost 12,000 and four contexts. Calibration supports this choice on its packet, not broad equivalence.

| Stage | Current arm | Proposed arm | Total estimated tokens |
|---|---|---|---:|
| Development | 2 independent assessments, 2 fresh contexts | 2 independent assessments, 2 fresh contexts | 23,600 |
| Reserved confirmation, after gate | 1 assessment, 1 fresh context | 1 assessment, 1 fresh context | 11,800 |
| Maximum scheduled total | 3 assessments, 3 contexts | 3 assessments, 3 contexts | 35,400 |

All four decisions and the full packet share a context within each assessment. Never share model contexts, earlier answers, or reasoning across arms, draws, or stages. Give each current-arm session only current instructions, the packet, and the common output contract; exclude proposed instructions and proposed-arm reasoning. Match model, runtime, tools, packet, and generation settings across arms. Keep reserved content outside authoring and development contexts until the development decision is frozen.

Before execution, freeze instruction versions, packet identifiers, four scorers, output fields, generation settings, and this gate. Run the local zero-model-token negative control: a fabricated answer with a reverted receipt labeled active and handoff authorized must separately fail receipt and handoff scoring. Keep this diagnostic apart from model results; it cannot demonstrate source-record reasoning. If it fails, stop, repair/version the scoring setup, and replan affected comparisons.

Report each draw independently, with four separate pass/fail/unverified entries and scored fields:

1. Current key-generator identity, state, action.
2. Current enforcement identity, state, action.
3. Current receipt identity, state, action.
4. Combined handoff readiness and blocking features.

Retain the answer, source support, actual usage, arm/stage/draw identifiers, and scorer versions. Report paired arm differences, disagreements, missing outputs, and runtime errors. Do not let component passes conceal an incorrect handoff, aggregate away a failed decision, or retry away failures.

**Advance gate:** after both development draws in both arms are recorded, freeze the development decision. Advance only if the diagnostic passes, all required comparisons are complete, and the proposed arm passes every required decision in both draws without a mandatory regression against current. Current-arm failures remain valid comparison evidence. Missing evidence prevents advancement. Any instruction/scorer change requires a newly versioned development comparison; preserve prior outcomes and keep reserved sealed. If the gate passes, perform exactly one reserved assessment per arm and report it separately, without tuning on it.

Budget 23,600 tokens for development and 11,800 conditional tokens for confirmation: 35,400 total. Comparable schedules would cost 39,000 tokens for atomic checks or 72,000 for separate requests. Estimates use supplied complete-assessment totals including input/output/tool/context tokens, not prompt size. Actual packet/output lengths and runtime overhead may differ; record actual usage, mark unavailable usage unknown, and stop for replanning if the estimate proves inadequate. No retries or extra assessments are included. Two development draws and one reserved draw per arm provide bounded observations only; they cannot establish broad reliability or guarantee improvement.

## Exact skill files read

Paths relative to `C:/Users/fujos/Obsidian/Projects/SkillForge/TieDiagnosis20261107/skills/SkillForge/`:

- `SKILL.md`
- `SkillIntent.md`
- `Quality/Shared.md`
- `Workflows/EvaluateSkill.md`
- `Quality/EvaluateSkill/Context.md`
- `Quality/EvaluateSkill/Outcomes.md`
- `Quality/EvaluateSkill/Tradeoffs.md`
- `Procedures/EvaluateCandidate.md`

Task input read: `Evidence/CompoundCoverage20261107/planner/input.md`. No other evidence files or external sources read. No evaluation executed.
