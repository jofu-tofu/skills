# ReuseEvidence

**Input:** Present decision/question, target and measure versions, accessible attempt index and source records.
**Output:** A brief reuse note in the existing plan: consulted evidence, applicability, effect on the decision and remaining uncertainty. No separate database or mandatory artifact.

Called by PlanChange when prior evidence may change trial selection. Keep maintenance short paths unchanged. Use the target's existing index; SkillForge's [evidence map](../Evidence/DecisionMap.md) is a bounded example, not a required archive for other skills.

1. State the decision before searching. Search the index for outcome, failure mechanism and task conditions, including failed/tied attempts and rival explanations. Open only plausible source records; broaden once if a consequential question remains. Record the searched scope when nothing is found; absence from an index is not evidence that no experiment exists.
2. Check each consequential finding against its source: observation, tested version/task, measure/reference, and limits. Separate observed behavior from the author's interpretation and retention/deployment decision. Missing or unverifiable provenance makes the finding a lead, not established support. A source hash verifies identity, not truth.
3. Check applicability to this decision. Changed versions, inputs, tools, measures or outcome levels require a reasoned bridge or a new check. An activation result cannot establish solution benefit; a repaired checker cannot retroactively turn missing observations into passes. A tie can rule out repeating an unchanged contrast without proving equivalence.
4. Follow dated corrections and supersession links. Name exactly which claim changed; preserve unaffected observations. New deployment status does not rewrite comparative benefit, and a newer record does not automatically supersede every older finding. If records conflict without resolution, retain the conflict.
5. Record what this changes: reuse an applicable check, reject/revise a candidate, stop a saturated trial, narrow a claim, or run the smallest missing check. If it changes nothing, say so. Return to PlanChange; do not repeat an experiment just to regenerate known evidence. Keep source IDs/paths and unresolved gaps sufficient for the next operator.

RecordLearning owns indexing the new observation and decision, including failures. Assessment-only work writes its reuse note in the evaluation workspace. Do not modify historical sources to make them agree with current conclusions.

Completion: a reader can locate support and explain why it applies, what decision changed (or did not), and what still requires evidence. Merely finding relevant words or producing a longer summary is not success. This procedure's comparative benefit remains subject to the linked attempt's results.
