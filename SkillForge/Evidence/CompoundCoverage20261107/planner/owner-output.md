# Relay evaluation plan v1 — not_executed

Use **one integrated release workflow returning four separately scored decisions**. The supplied calibration observations (assumed for planning, not independently measured here) preserve all four decisions and error visibility at 5,900 tokens per assessment. Four atomic checks in one context also preserve coverage but cost 6,500; four separate contexts cost 12,000. Select integration for its measured shared-context economy, not because a harder prompt is inherently better. Keep atomic checks as a diagnostic fallback if an integrated failure cannot be located; no new method pilot is needed now.

## Frozen schedule and isolation

| Stage | Current arm | Proposed arm | Total assessments / fresh contexts | Estimated tokens |
|---|---|---|---|---:|
| Development packet | C-D1, C-D2: 2 assessments / 2 contexts | P-D1, P-D2: 2 assessments / 2 contexts | 4 / 4 | 23,600 |
| Reserved packet, conditional | C-R1: 1 assessment / 1 context | P-R1: 1 assessment / 1 context | 2 / 2 | 11,800 |
| Maximum planned total | 3 / 3 | 3 / 3 | 6 / 6 | 35,400 |

Each assessment receives its arm's frozen instructions and the same complete stage packet, and returns all four decisions. Only those four decisions within that assessment share context. Never share reasoning, previous answers, grader feedback, or conversation between arms, draws, or stages. Current sessions cannot see proposed instructions or reasoning. Hold model/runtime/settings constant. Reserved content and reference answers remain outside author and development contexts; open reserved material only for the fresh confirmation executor after the development decision is frozen.

Before later execution, pin hashes for current/proposed instructions, development/reserved packets, four scorer versions, hidden reference keys, and runtime. These concrete identities were not supplied and remain pending, not invented. Preflight actual loaded instructions and first traces for arm exposure; identical delivered treatments invalidate an instruction-effect comparison. This plan authorizes no instruction edits or evaluation now.

## Coverage, checks, and records

Use the existing frozen finite-field scorers, not a model judge. Record their qualification support from the supplied calibration: correct cases accepted and injected single-decision errors separately detected; actual provenance and applicability must be verified before relying on them. No new measurement or academic search is needed for this narrow plan. Qualification is pending verification here.

| Required check | Observation in every draw | Dependency covered |
|---|---|---|
| KEY | Current key-generator identity, state, action | Source records to generated keys |
| ENFORCE | Current enforcement identity, state, action | Generated keys to enforcement |
| RECEIPT | Current receipt identity, state, action | Enforcement to receipt |
| JOINT | Combined handoff readiness and blocking features | All three component results to final authorization |

DEV and RESERVED each retain the full packet: merges, production receipts, partial integration and later unrelated release. Their chronology and dependencies must reach the final JOINT decision; three correct component statements cannot compensate for wrong handoff authorization. No branch or decision is dropped to save tokens. Scope is two supplied packets, not whole-workflow reliability.

Before model trials, run the local deterministic negative control: fabricated reverted-receipt-as-active plus authorized handoff must independently fail RECEIPT and JOINT. Retain it even though it costs zero model tokens. If it fails to reject either, stop and repair/qualify the checker under an amended plan before comparing arms. This tests scoring, not source-based model reasoning; it cannot replace any of the six model assessments. Keep hidden expected values outside executor prompts; ask for the four decisions without disclosing their answers.

For each run ID above, save raw answer/trace, packet and instruction identities, completion/error status, and each check's raw finite fields, expected-reference link, pass/fail/unverified verdict and reason. Report input, output, tool/context usage without double counting; record cached input separately without subtracting it. Keep per-draw vectors and individual field errors visible; 24 decision observations across six executions are not 24 independent trials. Missing evidence stays unverified, separate from execution failure. Store planned evals.json, evaluation-plan.json and eventual results.json under a dedicated Relay evaluation workspace linked to this v1 plan; paths/hashes and scorer commands must be resolved before execution, not guessed in this planning-only deliverable.

## Advancement, interpretation, and budget

After all four development draws, freeze a written development decision before accessing reserved content. Advance both arms together only if scoring/control and isolation checks are sound, all four development outputs are assessable, proposed passes every mandatory decision in both draws, and no protected decision regresses against current. Current errors may be the intended improvement opportunity and do not alone prohibit advancement. An all-pass tie may advance for the required fresh preservation check, labeled no demonstrated development benefit. Freeze instructions, checks and the development conclusion; never tune using reserved output.

Proposed failures/regressions: stop before confirmation and report them. Missing outputs, checker faults, contamination or uncertain references: stop as unresolved, preserve evidence and require a versioned plan amendment before new runs. No automatic retries or extra draws. If an integrated result is diagnostically ambiguous, split only the affected check in a separately budgeted amendment; retain original results and charge extra diagnostic tokens. It cannot replace an independent required draw.

On reserved confirmation, require all proposed decisions to pass and preserve the protected behavior. Report improvements only for observed baseline errors resolved without regressions; all-pass ties show no correctness advantage on these packets. Mixed advantages remain conditional, and unavailable checks prevent confirmation. Do not infer broad reliability or a universal instruction winner from this sample. Calibration is saturated for correctness but useful for choosing a cheaper covered arrangement; no harder cases are added merely to force a winner.

The six-assessment estimate is **35,400 tokens**, or 17,700 per arm. Comparable full schedules would be 39,000 for shared-context atomic checks or 72,000 for separate contexts: estimated savings 3,600 (9.2%) and 36,600 (50.8%). Development commits only 23,600; confirmation adds 11,800 if its gate passes. These are estimates from another comparable calibration packet, not hard ceilings or fresh measurements. Actual retries, diagnosis and any model grading must count toward total costs; none are scheduled. Deterministic scoring uses zero model tokens but local computation/preparation effort is unmeasured. Stop at the scheduled draws; a forecast overrun or added work requires an explicit budget amendment. This delivers the planning request only; all evaluations remain not_executed.

## Exact read list

Local workflow notes (outside the target):
- C:/Users/fujos/.codex/local-notes/index.md
- C:/Users/fujos/.codex/local-notes/worktrees.md (requested in full; tool output truncated)

All following paths are relative to C:/Users/fujos/Obsidian/Projects/SkillForge/TieDiagnosis20261107/skills/SkillForge/:
- Procedures/PlanChange.md
- Procedures/ConstructCases.md
- Evidence/CompoundCoverage20261107/planner/input.md
- Procedures/GenerateAlternatives.md
- Procedures/DesignMeasurement.md
- Standards/RegressionCoverage.md
- Standards/Grader.md
- Standards/Schemas.md (bulk read had truncated output; reread first 125 lines; evaluation-plan and canonical-results sections visible in bulk output)
- Templates/Improvement/Plan.md
- Improvements/Templates/Plan.md
- Quality/Shared.md
- Quality/EvaluateSkill/Feedback.md
- Templates/Quality/Measurement.md

No other Evidence, expected-contract.md, reserved packet, or other output file was read. No evaluations were executed and no skill instructions were changed.
