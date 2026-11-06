# Outcome measurement

Version CR-M 1.1, 2026-11-04: CR-M 1 plus the clean-handoff check frozen before candidate execution. Governs [Outcomes](Outcomes.md). Qualified for the bounded technical/artifact contrasts in the [attempt record](../Improvements/GranularOutcomes/Record.md); operator adjudication is grounded in executable contracts, source and actual artifacts. This does not qualify general detection, readability or maintenance-efficiency claims.

## Unit and evidence

The main evaluation unit is the final report on one scoped repository and request. Keep intermediate context, dimension selection, lens findings and verifier decisions to diagnose losses or false alarms across handoffs. Record exact skill/source versions, model/runtime, prompts, time, available usage and execution failures. A harness-enforced pipeline does not demonstrate native orchestration reliability.

Establish reference defects from executable counterexamples or a traced contract violation, independently of the review's verdict. Preserve the contract and a safe contrast. For maintenance risks, name the supported change, ownership boundary and concrete propagation burden; do not infer value from shorter code or more layers. These risks need source-grounded adjudication, and claims of actual future savings need a real change task.

## Separate observations

| Observation | Rule |
|---|---|
| Delivery and status | A completed clean inspection must reach a usable final report. Distinguish a non-empty no-findings result from unavailable inspection; the latter must not imply safety or erase another contributor's supported finding. Count neither status as a defect. Actual absence can fail delivery while final-report detection/noise remains unverified. |
| Detection | A final finding identifies the causal failure, relevant condition, consequence and location. Equivalent wording and different valid correction directions are accepted. A keyword or issue label alone does not count. |
| Unsupported claims | Inspect every actionable finding, including recommendations and risk sections, against source and contract. A novel finding absent from the reference is adjudicated, not automatically rejected. Unresolved facts remain unverified. |
| Scope | In diff mode trace the introduced/newly exposed failure to the requested commit; in audit mode existing in-scope defects are valid. Distinguish awareness notes from blocking findings. |
| Duplication | Count a shared causal issue once even if several lenses contribute. Distinct consequences may merit explanation, but not inflated defect counts. |
| Actionability | Check that trigger, consequence and correction direction follow from evidence and do not remove required safeguards. Text completeness does not establish actual human comprehension. |
| Calibration | Distinguish reproduced, traced, inferred and runtime-dependent evidence. Prioritize by supported consequence and reach; uncertainty alone does not justify higher severity. |
| Coverage | Record actual selected lenses and inspected consumers, omissions, unavailable inputs and unresolved fix paths. No finding is not proof of safety. |
| Cost | Preserve elapsed time and available tokens; do not equate less text or fewer agents with usefulness. |

Use pass/fail/unverified per declared check. Do not collapse these into a universal score or let a detection gain conceal a mandatory false-positive or scope regression. Attribute a gain to a changed lens only when the comparison isolates that contribution; final-report gains from shared verification cannot establish lens causality.

## Qualification and decision

Before a comparison, test adjudication on a real supported issue, an equivalent paraphrase, a plausible but false mechanism, a duplicate, a safe alternative and honest uncertainty. Confirm the executable reference rejects the fault and accepts valid alternatives. Check interactions: individually valid outputs can still fail at their consumer. Keep reference/checker revisions and regrade both versions under the same rule.

A bounded repair requires a reproduced baseline shortfall, candidate resolution, and preservation on the relevant negative/valid contrasts. A tie supports no comparative benefit. Different cases and affected alternate routes challenge transfer; one exposed replay does not establish population reliability. Runtime errors and absent reports are execution failures/unavailable evidence, not silently scored passes or ordinary target failures. Keep raw results, failed candidates and scope limits.

Revisit these measures when a novel valid finding is rejected, a false warning passes, a consequence is hidden by deduplication, or the task/model/environment changes. Human readability and long-term maintenance benefits remain unverified unless directly tested.

The [history-derived diagnostic specification](../Improvements/HistoryScope/Measurement.md), CR-HS-M1, extends qualification only to its named scope/maintenance contrasts. Its [attempt record](../Improvements/HistoryScope/Record.md) preserves ties, a rejected acceptance-gate regression and bounded final-report evidence; it does not extend qualification to general review reliability.

The [comprehensive historical measurement](../Improvements/ComprehensiveHistory/Measurement.md), CR-CM1, covers the frozen CR-O2/CR-W1 inventory. Its [results](../Improvements/ComprehensiveHistory/Results.json) distinguish matched stage checks, one native candidate audit and local posting-command probes. The [decision](../Improvements/ComprehensiveHistory/Decision.md) records parent completion separately from candidate retention.
