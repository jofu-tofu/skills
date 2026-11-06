# Compact focused-attempt record

Optional for focused changes. Keep one record for shared facts; use adequate existing records instead. [PlanChange](../../Procedures/PlanChange.md) owns planning, [EvaluateCandidate](../../Procedures/EvaluateCandidate.md) owns evidence, and [ApproveSkill](../../Procedures/ApproveSkill.md) owns decisions. This format does not reduce required evidence or replace a broad parent inventory.

## Before editing or execution

- Request/scope, target and baseline identities, authorized result and exclusions.
- Desired outcome, observed gap or hypothesis, protected behavior and affected handoffs. Link existing criteria, diagnosis and measurement qualification; state unresolved questions.
- Smallest change and falsifying evidence. Cases/checks, comparison conditions, next-run budget and result-dependent next action. Freeze this section; append dated amendments rather than overwriting it.
- Decision rule: separate benefit and preservation; record cost tradeoffs. Link the pre-edit completion contract and coverage map where required.

## Evidence and decision — append after execution

| Check | Baseline observation | Candidate observation | Evidence / status / limitation |
|---|---|---|---|
| Intended benefit and each required preservation check | Unmeasured | Unmeasured | Unverified until evidence exists |

Record failures, unknowns and deviations. Link raw outputs and required `results.json`; do not copy their full contents here. Record retention separately from task status, governing rule/version, unresolved outcomes and next action. Run the required completion check and link its output. Index this record for later recovery.

### Worked example — illustrative, not execution evidence

Request: remove duplicate loading of an unchanged glossary in a two-stage extraction skill. Preserve extraction of signed amounts and the existing missing-input response. Baseline/candidate hashes and three cases are linked from the frozen plan. Benefit check: actual glossary reads per equivalent completed task. Preservation checks: exact extracted amounts and missing-input response. A shorter instruction file alone cannot pass the benefit check.

After a hypothetical run, reads fall from two to one but negative amounts are omitted. Record the read reduction and failed preservation separately; reject or revise the candidate. If the repair is authorized and feasible, task status is `continue`. Keep the failed output and append the next action. If all required outcomes are established, the gate may return `complete`; a compact record is never the reason to close.
