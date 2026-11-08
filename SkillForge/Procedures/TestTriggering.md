# TestTriggering

**Input:** Target description/version, actual target runtime, intended triggering scope, and budget.
**Output:** A trigger test suite or assessment with provisional selection, fresh-confirmation evidence/status and original/candidate identities; candidate descriptions only when updates are authorized. Final retention belongs to ApproveSkill.

1. Check the measurement specification through [DesignMeasurement](DesignMeasurement.md) when new, changed or unsupported. Construct realistic positive, negative, and near-miss queries. Use task scope to justify labels; resolve uncertain labels rather than treating them as facts. Validate the runtime selection observation separately from prompt labels and context isolation.
2. Specify actual native discovery and record whether the skill is selected/loaded. Injecting the skill or registering a command is a different test.
3. Use the applicable [PlanChange](PlanChange.md) plan/version, creating one if absent, for comparison policy, acceptance rules and budget. Freeze development/selection cases and separate fresh final assessment cases. Record model, runtime, repetitions, false triggers, missed triggers, errors, time and tokens.
4. In UpdateSkill, propose a bounded description revision and compare with the original under matched conditions. Treat development selection as provisional; EvaluateSkill reports without editing.
5. Run final confirmation on fresh cases not used for selection. Report failed confirmation as failure and unavailable runtime access as unverified. For updates, return the assessment to the calling workflow for ApproveSkill and RecordLearning before final retention; preserve the original while confirmation or the decision is pending. Assessment-only calls return evidence without a retention decision.

Legacy scripts in Tools/scripts/run_eval.py and run_loop.py require Claude CLI and create command files. They are retained for historical compatibility, not qualified native skill-discovery tests for Codex or modern Claude. Their repeatedly used selection split is validation data, not untouched final test evidence. Do not automatically launch them as proof of triggering accuracy. A runtime-specific adapter must be qualified first.

Reference: [ConstructCases](ConstructCases.md). Bad labels and mismatched discovery paths can produce impressive but irrelevant scores.

Optional Codex evidence extraction: [file-loading observer](../Tools/README.md#codex-file-loading-observer).
Its bounded read observations still require this procedure's native-runtime qualification;
unknown selection, compliance and outcome remain separate.
