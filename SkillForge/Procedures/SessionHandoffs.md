# Session handoffs

The main SkillForge session coordinates the task. It owns the user's request, the target version, the order of work, and the completion decision. Continue locally whenever the current session can do the work. Use a fresh session only when the work requires independent execution and an appropriate runner is already available. Give it one bounded assignment, ask it to return evidence, and keep further scheduling and final decisions with the coordinator.

## Checkpoint between sessions

Use the existing attempt directory. Put durable inputs, run results, assessments and decisions there. If work will cross a session boundary, write one `skillforge-handoff.json` with the current task, target version, phase, status, evidence and next action. Update it only after accepting returned work or recording a blocker. Keep one active coordinator for the attempt, including after a restart. Work that finishes in the current session needs no handoff.

The handoff refers to a [completion contract](../Templates/Improvement/Completion.md). Reuse the behavioral update contract when there is one. For creation or a design-only task, use a small contract with the deliverable and any required behavioral outcomes. The contract stays in the attempt record. If the scope changes, record the amendment and link the next attempt to the original so the prior evidence remains traceable.

With Node or Bun, pipe a JSON payload to `ManageHandoff.cjs checkpoint <attempt-directory>`:

```json
{
  "workflow": "update",
  "target": "EstimateCheck/SKILL.md",
  "targetVersion": "commit-or-content-identity",
  "status": "blocked",
  "phase": "baseline",
  "nextAction": "Run the original review again once the runner is available.",
  "contract": "contract.json",
  "evidence": ["baseline-run.txt"]
}
```

Use `create` or `update`, `continue` or `blocked`, and the next phase `baseline`, `draft` or `evaluate`. Keep paths to records relative to the attempt. Keep the prior baseline assessment separate from the final assessment. The tool records the file hashes and checks them on resume.

## Resume or finish

1. Independently identify the current target version and run `node Tools/ManageHandoff.cjs resume <attempt-directory> <current-target-version>`. Read the verified handoff and the evidence needed for its next action. Reconcile changes to scope, version or evidence before continuing. Reuse completed checks when their inputs and conditions still match.
2. For a repair, run the baseline on the unchanged target before drafting. Use a local check when it actually exercises the missed behavior. If the runner errors and an equivalent check is available, use it within the current task. If the result remains unavailable, checkpoint the blocked baseline and leave the target untouched. A repair handoff can advance to `draft` or `evaluate` only with a passing before-edit result. Include `"preEditAssessment": "before-edit-assessment.json"` so the tool can rerun the check when the next session resumes.
3. Record the outcome and preserve evidence through [RecordLearning](RecordLearning.md). When the task is complete, run `node Tools/ManageHandoff.cjs finish <attempt-directory> <final-assessment.json>`. The tool checks completion against the saved contract and removes only the handoff. Pending and blocked attempts keep it. An existing final assessment and the evidence stay available after cleanup.

Without Node or Bun, keep the same compact handoff in the attempt directory, apply the [completion rules](ApproveSkill.md#task-completion) manually and record that verification method. Delete the handoff after recording completion. Never treat the handoff itself as proof that the target changed, the baseline failed, or the task completed. The tool controls the handoff record. The coordinator still owns all target edits.

## Apply this to the target skill

When a skill's own workflow can span sessions, give its main session responsibility for the result. Specify the smallest set of inputs and evidence a later session needs, the next action, and when temporary notes can be removed. Reuse the target's own terms and completion rules. Apply this requirement where the skill actually needs continuity.
