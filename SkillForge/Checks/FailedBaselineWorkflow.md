# Failed baseline during a skill repair

This test runs a fresh Codex session against this checkout's SkillForge workflow and a disposable skill. The user asks for a behavioral repair. The baseline runner returns exit 23 before producing a review. The test checks that the runner actually reached that failure, the target remained unchanged, and the session reported the repair as pending.

From the SkillForge directory, with a Codex executable that supports automatic review:

```text
node Checks/FailedBaselineWorkflow.cjs <codex-executable> <new-run-directory> <model>
node Checks/FailedBaselineWorkflow.cjs <codex-executable> <another-new-run-directory> <model> --with-prior-review
```

The second case adds a manual review of the original lesson. This covers the situation where a diagnosis of the lesson exists but the original skill has produced no review in the replay. Keep the model, executable and case option fixed in a before-and-after comparison.

The local fixture tools handle file reads, test-workspace writes and the failed baseline command. They also expose the checkout's completion checker. The test saves the model events, fixture calls and final report in the run directory. A launch failure, a timeout, or a session that never runs the injected baseline cannot establish workflow behavior. This test checks one model run at a time.

## First runs

Both cases passed on SkillForge commit `5dbfe96` with GPT-6.1 Sol. Each baseline command reached exit 23, the pre-edit checker kept the repair open, the target remained unchanged, and the final report said pending. The second run also read the prior manual review. Earlier attempts could not launch the nested shell, connect to a supported model, or access fixture tools. They never reached the injected failure. The reported premature edit did not recur in either completed replay, so the workflow instructions stayed unchanged.
