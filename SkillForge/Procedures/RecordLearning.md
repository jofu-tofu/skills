# RecordLearning

Internal procedure; called by workflows, not automatically loaded at entry.

## Contract

**Input:** Plan, assessment or explicit unexecuted status, decision if made, and version identities.

**Output:** A retrievable attempt record and current index, with justified updates to reusable knowledge.

## Steps

1. Preserve raw evidence and links to exact versions.
2. Record observations separately from interpretations and decisions. Preserve the owning workflow's task status, unresolved required outcomes and next action separately from candidate retention; recording a `continue` decision does not close the task.
3. Index every recorded attempt, including failed, inconclusive and unexecuted attempts. Use the evaluation workspace's index for assessment-only work; otherwise use the target's attempt index. Update the retained-version pointer only when a retention decision exists.
   Make the entry searchable by decision/outcome and tested conditions: source/version, observation, interpretation, applicability limits and next action. Link dated corrections to the exact conclusion they supersede; do not replace old observations or let deployment status imply benefit. Reuse an adequate existing index format. [ReuseEvidence](ReuseEvidence.md) consumes these leads before later trials; a compact entry and source link are enough.
   For broad improvement, preserve the parent coverage inventory and structural findings separately from round decisions. Record each round's resolved and remaining outcomes, next useful action and any scope amendment. A passing sample/no-change record must not become a whole-skill complete pointer while required coverage is unresolved. Keep reusable criteria and structural rationale retrievable in the improved skill, with raw evidence referenced externally when appropriate.
4. Update reusable criteria only with supported reasons; preserve prior versions.
   Retain measurement specifications, qualification evidence and scope, rejected alternatives, and the next discriminating experiment. Changed measurement versions require an explicit comparison or rerun; do not silently compare unlike scores.
5. State the next useful check and any changed assumptions. Link each gap record, outcome/measurement versions, diagnosis, and unresolved next action from the target's attempt index. In assessment-only scope, retain these in the evaluation workspace and return its entry point instead of editing target records.

## Acceptance and failure checks

A later run can recover the decision and applicable criteria without the chat. Failed attempts remain visible; no fictitious run is created for a draft.

## References and limits

See [Improvements/Index](../Improvements/Index.md). Evaluation-only records may remain in an external evaluation workspace.

Status: proposed and unvalidated. Shared requirements: [Quality/Shared](../Quality/Shared.md). Test this procedure with fixed input artifacts independently, then test its handoffs.
