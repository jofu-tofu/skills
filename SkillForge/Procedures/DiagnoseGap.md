# DiagnoseGap

Shared procedure for reported or observed gaps; called by UpdateSkill and EvaluateSkill before planning changes or freezing evaluation. Status: proposed; routing checks do not establish diagnostic effectiveness.

## Contract

**Input:** User request and authorized scope, target intent/version, observed incident or concern, relevant quality records and available evidence.

**Output:** A linked gap record distinguishing observation from suspected cause, affected outcome/measure IDs, baseline reproduction state, diagnosis with uncertainty, next check, and handoff. Several causes may coexist. An unsupported report remains a concern; a captured input/output with a source-backed expectation demonstrates that incident even when it has not been reproduced. Neither alone establishes its cause or current failure frequency.

## References

Read [GapRecord](../Templates/Improvement/GapRecord.md) when recording a gap and [EstablishQuality](EstablishQuality.md) for missing/disputed outcomes. For a missing, changed or defective measurement, call the bundled [DesignMeasurement](DesignMeasurement.md); it owns specification and qualification. Its optional Task 3 references provide background, not a required external execution dependency.

## Steps

1. Preserve the incident: input, actual output, expected behavior and its source, version/context, consequence, and available evidence. Ask only for missing information needed for the next check; continue with an explicitly bounded hypothesis when possible.
2. Compare the expectation with target intent and applicable outcome IDs. A new preference or changed purpose needs EstablishQuality; do not silently rewrite the outcome to match a proposed fix.
3. Inspect whether current cases and scoring would detect the incident. For a repair, establish the [baseline red case](#baseline-red-case-for-a-repair) before selecting or drafting a repair candidate. Record missing tools, references or uncertainty. Keep alternative explanations visible.
4. Select the smallest justified response using the table below. Do not add a metric merely because an incident occurred.
5. Save the gap record and its next check. The incident is a development/regression case; later confirmation needs different cases. Hand off only the actions authorized by the current workflow.

| Evidence suggests | Next action |
|---|---|
| Existing outcome and measurement detect the failure | UpdateSkill: PlanChange for the skill; EvaluateSkill: report the observed shortfall. Keep the measure. |
| Outcome is covered but benchmark cases omit this failure family | Add/propose a benchmark stratum and case coverage; retain the metric if adequate. |
| Scoring rewards a misleading pass or rejects a valid result | Design and qualify a corrected checker; distinguish false acceptance from false rejection. |
| Intended outcome is missing, stale or disputed | EstablishQuality first, then measurement design if needed. |
| Evidence is insufficient or conditions differ | Collect the cheapest distinguishing evidence, narrow the claim, or defer; do not choose a cause by assertion. |

For measurement changes, record old/new definitions, reasons, provenance and qualification status. Compare both baseline and candidate under the same revised measurement before attributing a gain to the skill. Preserve old results. When no candidate exists, qualify the measurement on fixed artifacts first.

## Handoffs and boundaries

UpdateSkill sends the diagnosis to [PlanChange](PlanChange.md); the result may be a measurement-only plan or no target edit. EvaluateSkill stores diagnosis and proposed criteria in its evaluation workspace, then assesses or reports insufficient evidence; it does not change the target or its canonical quality records. [RecordLearning](RecordLearning.md) preserves links to the incident, diagnosis, measurement version and next action for a later session.

## Baseline red case for a repair

A red case is an executed baseline outcome that violates an independently supported requirement. Preserve the task/input, expected outcome and its source, actual output, baseline identity, available context/tools and checker version in the existing gap record. Check that the failure is the reported behavior, not a broken runner, missing dependency or unsupported grader. Accept valid alternative outputs; do not test for the proposed implementation's wording.

Start with the actual incident and faithful information access. Record any changed conditions: pruning an archive, supplying decisive facts or simplifying a task can remove the failure opportunity. Such a case may help diagnosis but cannot replace the incident and prove repair. Never hide valid baseline evidence or weaken the baseline to manufacture red.

For variable model behavior, predeclare the next observations and stopping decision, preserve every outcome, and distinguish a captured failure, reproduced failure and passing replay. Justify repeats by the uncertainty; neither an arbitrary quota nor running until a failure appears establishes reliability. One passing replay does not erase the incident, and one failure does not establish a population rate.

If red is not established, continue the cheapest feasible reproduction, context or measurement check before another repair candidate. If the original context cannot be recovered, label reconstructed evidence and keep repair claims unverified; an explicitly provisional design is not a confirmed fix. Do not close the repair merely because easier tests pass or the chosen pilot ended.

New capabilities and optimizations need acceptance examples or measurable benefit headroom, not an invented historical failure. Assessment-only requests may report uncertainty without a candidate. Mechanical maintenance keeps its short path. After a repair candidate, rerun the red case unchanged, protect existing behavior, and check fresh cases before broadening the claim.

## Acceptance and failure checks

A later reader can identify what happened, why the expectation applies, what remains uncertain, and which artifact should change. Check clean cases, wrong-checker cases, omitted benchmark categories and unsupported expectations. Failure examples: adding a new score for every complaint; calling a suspected cause proven; changing the success rule only for the candidate; treating an assessment request as edit authorization.
