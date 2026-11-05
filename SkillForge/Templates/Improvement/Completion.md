# Completion contract and assessment

Use for behavioral updates before editing; keep the record small and link the existing plan. [ApproveSkill](../../Procedures/ApproveSkill.md#task-completion) owns the decision. This records the user's required result, not a new permission checkpoint. Explicit design-only, assessment and maintenance scopes may use the same format when useful; routine typos do not acquire this paperwork.

Save the relevant user request and preceding proposal as `request.txt`. Derive scope from their intended effect. A short approval does not erase that context. The quote below must occur in that source; the checker verifies the bytes, not the interpretation.

`contract.json` before the edit (replace placeholders and hash the actual source):

```json
{
  "schema_version": 1,
  "scope": "behavioral",
  "requested_result": "The user's required outcome, including the reported failure when applicable",
  "scope_basis": {"path": "request.txt", "sha256": "SHA256_OF_REQUEST", "quote": "EXACT_RELEVANT_USER_TEXT"},
  "required_checks": [
    {"id": "result", "kind": "outcome", "description": "Requested behavior established at its required outcome level"},
    {"id": "execution", "kind": "behavioral_execution", "description": "Actual relevant baseline/candidate execution, or justified existing execution evidence"},
    {"id": "preservation", "kind": "preservation", "description": "Required existing behavior preserved"}
  ]
}
```

For a reported failure, the result check must cover the missed decision under relevant conditions. Ties on unrelated or over-coached cases do not establish it. Do not manufacture an observed failure for a requested enhancement. If criteria change, preserve the old contract, explain the amendment from user intent or evidence, and reassess both versions fairly.

`assessment.json` after collecting evidence (start unresolved; never copy a pass):

```json
{
  "schema_version": 1,
  "contract_sha256": "SHA256_OF_CONTRACT_FILE",
  "candidate_decision": "defer",
  "checks": [
    {"id": "result", "status": "unverified", "evidence": []},
    {"id": "execution", "status": "unverified", "evidence": []},
    {"id": "preservation", "status": "unverified", "evidence": []}
  ],
  "actions": [
    {"id": "evaluate", "description": "Run the next relevant comparison", "resolves": ["result", "execution", "preservation"], "authorized": true, "feasible": true}
  ],
  "blockers": []
}
```

A supported check uses `status: "pass"`, `qualification: "qualified"`, and nonempty `evidence: [{"path": "relative-file", "sha256": "ACTUAL_SHA256"}]`. `fail` and `unverified` remain distinct. `deliverable` checks in a bounded nonbehavioral contract need evidence but no behavioral measurement qualification. Required IDs cannot be omitted or silently redefined by the assessment. Candidate decisions are `retain_candidate`, `retain_baseline`, `reject_candidate`, `revise` or `defer`; none determines task completion by itself.

An actual blocker has `id`, `affects` (required IDs), `reason` and hashed `evidence`. A genuine permission/runtime limit can block; an unknown next experiment cannot. Actions state actual authorization and feasibility as booleans. References resolve inside the attempt root, including after symlink resolution. Compute SHA-256 from file bytes, e.g. Node's `crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')`.

Run with Node or Bun:

```text
node <skill>/Tools/CheckCompletion.cjs contract.json assessment.json --root <attempt-directory>
```

Preserve the JSON result. Exit 0 means `complete`; 3 means `continue`; 4 means `blocked`; 2 means invalid input that must be repaired. These nonzero exits are deliberate decisions, not permission to abandon the workflow. Preserve earlier assessments/results when resuming. If neither runtime is available, apply the same decision table manually and label enforcement manual; do not pretend the checker ran.

The tool checks status consistency, contract identity and evidence integrity. It cannot establish that the contract captures user intent, that evidence proves the claimed result, or that a grader is qualified. Review those before invoking it; a hash of irrelevant prose is not behavioral evidence. It is a workflow check, not an application hook that intercepts every final answer.
