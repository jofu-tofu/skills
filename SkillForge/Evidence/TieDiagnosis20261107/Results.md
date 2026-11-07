# Compare benefits, not just regression passes

2026-11-07. Retain the focused guidance and qualified measurement example on the task branch. The executed comparison exposes task-specific differences between correct artifacts, preserves a real measured tie and refuses an unsupported global winner. This is evidence of bounded measurement sensitivity and a functioning caller handoff, not proof that the new instructions outperform baseline agents generally. No merge, push or installation.

## Diagnosis

The user's concern is valid as a failure mode: regression gates answer whether outputs remain acceptable, not which acceptable output better serves the user. The last memory experiment measured cued answer recovery and lacked usable discovery/effort observations. Its tie cannot establish overall equality. The earlier experiment-design repair addressed identical treatments and activation, a different prerequisite.

Some prior work already went beyond regressions: RealSkillComparison20261106 recorded opposing cache-workload advantages. This iteration does not claim to discover those historical differences. It adds an explicit obligation to qualify comparative resolution and diagnose a tie, then exercises that obligation on different frozen workloads. M0 below means a regression-only score, not the entire old SkillForge method or historical experiment.

## Executed observations

Actual frozen Prompting renderers, same output checks and task conditions. A is the path-key/32-entry artifact; B is the source-key/16-entry artifact. Original task asks to reduce repeated work while preserving semantics. Counts measure Handlebars.compile calls, not actual elapsed time or heap.

| Workload | Correct outputs A/B | Calls A | Calls B | Useful conclusion |
|---|---|---:|---:|---|
| 12 equal-source paths, 4 rounds | both pass | 12 | 1 | B avoids more compilation |
| 20 distinct paths, 4 rounds | both pass | 20 | 80 | A avoids more compilation |
| 40 paths, 3 immediate repeats each | both pass | 40 | 40 | Same measured work |
| Follow-up: 7 equal-source paths, 5 reversed rounds | both pass | 7 | 1 | B advantage persists |
| Follow-up: 18 distinct paths, 5 reversed rounds | both pass | 18 | 90 | A advantage persists |
| Follow-up: 9 distinct paths, 5 rounds | both pass | 9 | 9 | Same measured work |

M0 collapses every row to both-pass. M1 retains those gates and supplies conditional work advantages. Deployment mix and memory/latency priorities are unknown, so an overall preference remains unresolved. Neither arbitrary weighting nor more identical trials can supply those priorities. These are six designed workload pairs, twelve process executions—not independent agent tasks or a population estimate. All real-artifact source-edit, missing-source, zero and false preservation checks pass.

Qualification: three known compile calls are counted in each real execution. A deliberately broken counter is rejected before target grading. A zero-compilation wrong-output variant fails all its checks and cannot win. Swapped labels reverse the conditional winner; equal work stays equal; missing metrics remain unverified. Initial nine arithmetic/gate controls passed, but alone would not establish live instrumentation validity.

## Follow-up correction and handoff

A fresh candidate EvaluateSkill execution read the affected measurement/planning instructions, verified source hashes and matched workload specs, ran the comparison consumer, and returned the conditional choices above. It preserved a typo-only short path. This was one candidate caller execution, not a matched method-effectiveness experiment; no mechanism-name cue was sent during it. Its ledger is self-reported, not an independently exported raw trace.

That caller found the experiment consumer trusted its caller to check workload equality. We preserved v1 and strengthened the consumer to reject missing/mismatched specs or render counts while accepting equivalent key order. All thirteen controls now pass; replaying every unchanged observation preserves the six decisions. This correction concerns an evidence script, not a new runtime dependency. The caller's v1 report remains unchanged; comparison.json is the post-correction replay.

## What changed in SkillForge

- DesignMeasurement: qualify a benefit measure on ordered acceptable outputs, alongside equal and misleading controls. A working correctness gate cannot qualify a ranking it cannot resolve.
- PlanChange: distinguish missing dimensions/ceiling, coached tasks, inactive treatments, insufficient precision, real tradeoffs and scoped equality before deciding the next experiment.
- ApproveSkill: consume that diagnosis; equal regression passes cannot establish equal quality or close a feasible unresolved comparison.

No universal numeric score, winner requirement, compulsory model call or repetition quota. Existing owners, three-state verdicts, maintenance paths and completion rules remain. The operational change is limited to those three procedures. Integration overlaps with experiment-design/measurement work must be reviewed; no parallel branch was copied or cherry-picked.

## Disposition and limits

The frozen measurement-retention rule passes: adequate artifacts are differentiated in both directions, equal cases stay equal, invalid shortcuts fail and missing conditions stay unknown. Keep the scoped implementation and worked evidence. General prose quality, maintainability, discovery efficiency, real production latency/memory, broader semantic validity and population method effectiveness remain unverified.

Next discriminating application: take a real upcoming comparison, state the user-valued difference before authoring, qualify an acceptable-output ordering on independent consequences, then evaluate uncued use and a downstream decision. If the difference is judgment-based, use grounded blinded comparisons and preserve disagreement; do not substitute more decimal places. For these two renderers specifically, obtain workload/priorities before additional performance trials. No more unchanged repetitions are justified here.

Evidence: [protocol](Protocol.md), [comparison](comparison.json), [live controls](live-controls.json), [qualification](qualification.json), [caller](workflow-check.md), [review](Review.md), [reproduction](Reproduce.md). Runtime checks: 34 completion tests, 14 structural checks. Source/observation hashes are checked by replay.cjs. Completion is separately recorded in completion.json.
