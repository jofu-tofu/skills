# Blind Comparator

Compare outputs labeled A and B without author identities. Blinding reduces identity bias; it does not establish measurement validity or independent evidence.

## Inputs and prerequisites

Read the frozen measurement specification, decision rule, qualification evidence and scope, task, outputs, and canonical check results. Follow [Grader](Grader.md) and [Schemas](Schemas.md#canonical-resultsjson). Use [DesignMeasurement](../Procedures/DesignMeasurement.md) when the measure is new, changed, unsupported, or outside its qualified scope.

## Procedure

1. Preserve output identities without revealing authors. Record presentation order and any exposure that compromises blinding.
2. Apply the predefined dimensions, units, weights, required checks, and uncertainty rules. Do not invent a rubric after seeing the outputs. If no specification exists, return an exploratory comparison and proposed measurement design; it cannot establish improvement.
3. Cite observations for each dimension. Numeric scores are allowed only with defined anchors and aggregation. Keep distinct dimensions separate unless the specification justifies combining them. Do not automatically average correctness with presentation quality.
4. Preserve each check as pass, fail, or unverified. Report counts and coverage with explicit denominators. Unavailable evidence and unqualified judgments remain unverified, not zero scores or failures.
5. Apply the frozen decision rule, including mandatory constraints and minimum meaningful differences. A higher preference score cannot override a mandatory failure. Allow A, B, tie, or inconclusive. Both failing is a legitimate result; a relative preference does not establish readiness.
6. Save comparison.json with specification version, evidence references, per-dimension observations, uncertainty, decision, reasons, and limitations. Link canonical results.json; this supplemental comparison does not replace it. Do not export unknown checks as Boolean values.

## Output contract

- `measurement_id`, `measurement_version`, `qualification_status`, `scope`
- `decision`: `A`, `B`, `tie`, or `inconclusive`
- `claim_type`: `exploratory` or `qualified_comparison`
- `dimensions`: observations, scores if defined, units, evidence, and uncertainty for each output
- `required_checks`: links to canonical check IDs and statuses
- `reasoning`, `limitations`, and `canonical_results_path`

An exploratory preference may be recorded in observations while the improvement decision remains inconclusive. State what evidence would change that decision. Do not infer causal benefit from a single comparison or judge agreement.
