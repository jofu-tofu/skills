# DesignMeasurement

Shared procedure for turning intended outcomes into measurements and qualifying their use. Called by EstablishQuality, ConstructCases, EvaluateCandidate and DiagnoseGap. It is not a fourth user workflow. Status: proposed; the procedure itself is not empirically validated.

## Contract

**Input:** Outcome IDs and rationale, intended decision, users/task family, available evidence and measures, authorized scope and budget. An incident is optional.

**Output:** A versioned [measurement specification](../Templates/Quality/Measurement.md), linked from target Feedback or the assessment workspace, with candidate methods, collection/scoring rules, qualification evidence/status, permitted claim, next check and limits. Separate observations from their interpretation and from the decision made using them.

Run when a measure is new, materially changed, unsupported, or used beyond its qualified scope. Reuse an existing specification only after checking its version, outcome, population, checker/runtime, evidence and revision triggers still apply. Reuse records the supporting evidence; an existing score or confident judge is insufficient. A typo or formatting-only change does not require measurement redesign.

## Steps

1. **Bound the claim.** Identify the evaluation unit and decision. Distinguish output quality, skill-version effects, downstream user benefit and improvement-method effectiveness. Return unresolved purpose or tradeoffs to EstablishQuality; do not select values for measurement convenience.
2. **Derive observations.** For each outcome ask what would change if it were achieved, what would contradict it, and what irrelevant factor could produce the same score. Keep dimensions separate unless aggregation is justified. Record whether each indicator is direct evidence, a proxy or a constraint.
3. **Compare evidence methods.** Inspect relevant existing research, instruments or benchmarks before inventing a new measure; record findings or why search is not useful/available. Consider executable contracts/reproductions, independent external records, intended-user task performance, and qualified human/model judgment. Choose by fit, validity limits and cost, not convenience or a blanket preference for numeric scores. Record candidate alternatives and why each is retained or rejected. Public datasets, deterministic scoring and human labels still need qualification.
4. **Specify collection and scoring.** Define cases/strata and controls, source/reference provenance, who collects what and when, allowed inputs and hidden keys, unit, numerator/denominator or rubric anchors, missingness, duplicates, unresolved claims, aggregation, meaningful gain and protected regressions. Specify task-sampling, run and assessor uncertainty separately where relevant. Retain ambiguous or novel findings for adjudication; absence from a reference does not prove falsity.
5. **Qualify the method.** Check independently established positive/negative cases, valid alternatives, misleading passes, irrelevant transformations and borderline cases. Verify agreement between requirements, reference evidence and checks. Test sensitivity to real changes and false-improvement signals, including failures missed by every candidate measure. Preserve disagreements. A model may propose fixtures, but its unsupported labels cannot independently qualify its own scoring. Personas/fresh contexts limit shared conversation; they do not eliminate correlated errors. Record tested scope and remaining uncertainty, not universal validity.
6. **Choose the next experiment.** List rival explanations, predicted results, evidence needed, decision each result could change, cost and stopping rule. Prefer the cheapest useful discriminating test. Expected information gain and decision value differ; do not invent probabilities or utility weights. Diagnostic contrasts test weaknesses; fresh representative cases support performance estimates. Compare candidate measures on the same artifacts before using them to select skill revisions where practical.
7. **Return status and handoff.** Use the states below. Freeze qualified versions and decision rules before confirmatory comparisons. A changed measure requires reassessing both baseline and candidate under that definition; preserve old results. Hand case construction to ConstructCases, execution to EvaluateCandidate, and readiness to ApproveSkill. These procedures consume this record rather than recursively requesting another design for the same unchanged version.

## Qualification states

| State | Meaning and permitted use |
|---|---|
| designed | Specification and qualification plan exist; qualification evidence is pending. May deliver design or construct cases; cannot establish improvement/readiness. |
| qualified | Recorded evidence supports this method for the stated claim, context and version, under declared criteria. May support that bounded comparison; retain limitations. |
| unqualified | Evidence contradicts the intended use, is inadequate/conflicted, or the method is outside its qualified scope. Narrow, revise, gather evidence or defer; do not certify with it. |

Qualification itself uses justified reference evidence and declared criteria; it is not a majority vote. These states describe the instrument, not whether a target skill passed. Case construction and exploratory/qualification runs can proceed within scope without a qualified measure, but are labeled accordingly and cannot yield a confirmed skill benefit from unsupported scores. Design-only work stops with designed/unqualified status, not a demand for unrequested experiments.

## Qualification by intended use

Attach the state to the use being claimed; do not promote evidence between these uses automatically. One compact record may cover several uses with different states. Mark unrequested uses outside scope rather than adding mandatory experiments.

| Use | Evidence needed for that use |
|---|---|
| Known-fault discrimination | Independently grounded fixed artifacts, including valid alternatives and misleading passes. Report which faults and acceptable results the measure separates. |
| Fresh-case prediction or selection | Freeze the measure and decision threshold before observing independent outcomes on new cases from the intended task family. Record exposure, reference uncertainty, selection errors and transfer limits. Known-fault success alone is insufficient. |
| Optimization robustness | Test revisions actually selected or produced using the measure against separate outcome evidence; include plausible shortcuts and protected regressions. Retrospective rankings or repeated reuse of a holdout do not establish prospective robustness. Bound the tested optimization process and distribution. |

For a direct deterministic contract, independently justified expected behavior and executable checks can establish that bounded result; no population correlation or model calibration is required. Do not extend source membership into factual truth, or a finite contract into all future inputs. Use an independent reference appropriate to the outcome, not the measure's own unsupported judgment.

Choose thresholds from the intended decision and error costs, not a universal coefficient. Report false acceptance of unacceptable results and false rejection of valid results separately, with denominators; keep unresolved references and unavailable execution outside confirmed pass/fail counts and visible in coverage. If reasonable resolutions of a disputed reference would change the selection, defer that selection or narrow its scope. Requalify affected uses when the outcome, task family, reference, checker or optimization process changes.

## Ownership and references

EstablishQuality owns intended outcomes; this procedure owns measurement reasoning. ConstructCases materializes the benchmark and may execute authorized qualification checks; EvaluateCandidate verifies qualification before relying on evidence. Assess-only work stores proposed specs externally and preserves canonical target records. [Grader](../Standards/Grader.md) and [Schemas](../Standards/Schemas.md#canonical-resultsjson) govern result semantics.

This procedure is self-contained for execution. Optional background: the project Task 3 workflow (external research record: `../../Tasks/03-metrics-and-comparisons/Measurement design workflow v0.1.md`) and CodeReview example (external research record: `../../Tasks/03-metrics-and-comparisons/CodeReview measurement worked example v0.1.md`). Missing optional research files do not justify inventing evidence or block use of this contract.

For experiment sensitivity, controls, paired comparisons and uncertainty, consult the optional [experiment design evidence guide](../ResearchLibrary/Experiment%20Design%20-%20Evidence%20and%20Use.md). It includes the prior pilot's ceiling result and distinguishes published findings from proposed local tests; it does not supply universal sample sizes or replace qualification.

## Acceptance and failure checks

A reader can reconstruct why the observation supports the outcome, reproduce scoring, locate qualification evidence, and identify unsupported claims. Challenge a new-skill case with no incident, a changed benchmark, a judge agreeing with itself, a valid alternative rejected by a checker, a small real gain hidden by noise, and an assessment-only request. A longer specification or a completed checklist is not evidence of usefulness.
