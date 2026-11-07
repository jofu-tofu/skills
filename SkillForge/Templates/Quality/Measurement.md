# Measurement specification

Template owned by [DesignMeasurement](../../Procedures/DesignMeasurement.md). Store one compact record per distinct claim/method, or equivalent sections in Feedback; link rather than duplicate. Reserved assessment data remains outside routine skill context.

| Field | Required content |
|---|---|
| Identity | Measure/checker/case-set IDs and versions; author/date; scope of proposed or authorized changes. |
| Intended claim | Outcome IDs, rationale, users/task family, evaluation unit, decision and exclusions. |
| Observation | Observable consequence; direct evidence/proxy/constraint; rival explanations and omitted dimensions. |
| Alternatives | Existing methods/benchmarks inspected or search limits; executable, external, human and model options considered; choice and cost rationale. |
| Reference | Expected-behavior source, independence, completeness, provenance, conflicts and adjudication rules. |
| Collection | Who records what/when; task strata/sampling; controls; allowed input and protected-key boundaries. |
| Scoring | Numerator/denominator or anchors; direction; duplicates, missing data, unresolved cases, zero-denominator and aggregation rules. |
| Decision | Meaningful gain, protected regressions, uncertainty, error/cost tradeoffs and unresolved priorities. |
| Qualification | State per intended use: known-fault discrimination, fresh-case prediction/selection, optimization robustness; outside-scope uses need no added trial. Record designed/qualified/unqualified, evidence links, reference uncertainty, false acceptance/rejection and denominators, threshold and transfer boundary. Direct deterministic contracts need no population correlation; see [use-specific qualification](../../Procedures/DesignMeasurement.md#qualification-by-intended-use). |
| Next experiment | Competing predictions, decision impact, effort, stopping rule and fresh confirmation needs. |
| Reuse/change | Prior version, revised assumptions, affected comparisons to repeat, drift triggers and unsupported claims. |

Qualification pending is a valid design output. It is not a passing target assessment. A number needs a defined interpretation; a rubric needs evidence-backed anchors; neither is automatically preferable.
