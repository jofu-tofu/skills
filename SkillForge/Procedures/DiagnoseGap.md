# DiagnoseGap

Shared procedure for reported or observed gaps; called by UpdateSkill and EvaluateSkill before planning changes or freezing evaluation. Status: proposed; routing checks do not establish diagnostic effectiveness.

## Contract

**Input:** User request and authorized scope, target intent/version, observed incident or concern, relevant quality records and available evidence.

**Output:** A linked gap record distinguishing observation from suspected cause, affected outcome/measure IDs, diagnosis with uncertainty, next check, and handoff. Several causes may coexist. A report without a reproducible example remains a concern, not a demonstrated failure.

## References

Read [GapRecord](../Templates/Improvement/GapRecord.md) when recording a gap and [EstablishQuality](EstablishQuality.md) for missing/disputed outcomes. For a missing, changed or defective measurement, call the bundled [DesignMeasurement](DesignMeasurement.md); it owns specification and qualification. Its optional Task 3 references provide background, not a required external execution dependency.

## Steps

1. Preserve the incident: input, actual output, expected behavior and its source, version/context, consequence, and available evidence. Ask only for missing information needed for the next check; continue with an explicitly bounded hypothesis when possible.
2. Compare the expectation with target intent and applicable outcome IDs. A new preference or changed purpose needs EstablishQuality; do not silently rewrite the outcome to match a proposed fix.
3. Inspect whether current cases and scoring would detect the incident. Use available evidence or a bounded reproduction within scope; record missing tools, references or uncertainty. Keep alternative explanations visible.
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

## Acceptance and failure checks

A later reader can identify what happened, why the expectation applies, what remains uncertain, and which artifact should change. Check clean cases, wrong-checker cases, omitted benchmark categories and unsupported expectations. Failure examples: adding a new score for every complaint; calling a suspected cause proven; changing the success rule only for the candidate; treating an assessment request as edit authorization.
