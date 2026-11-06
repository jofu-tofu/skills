# Async stream resource ownership

2026-11-05. Demonstrated bounded generated-test improvement; broader async/workflow coverage remains open.

The original stream example left event listeners and timeout resources after success/error/timeout. Its callback example ignored error arguments. Updated examples propagate callback failures, own completion and release test-owned resources. Controlled executable translations preserved stream outcomes while reducing retained test listeners/timers to zero on the original no-producer-listener fixture.

Actual baseline and first candidate generated runnable tests that accepted the original source and valid alternate scheduling, and rejected wrong data, swallowed source errors and false completion. Independent cleanup instrumentation confirmed the tested fixture's resources were released. However, both suites rejected a qualified valid implementation with an existing harmless producer-owned data listener: their unconditional final zero-listener assertions coupled tests to incidental implementation state.

The final guidance checks cleanup against the pre-test ownership baseline, including outer test observers, instead of demanding an empty emitter. A matched follow-up with unchanged task/source generated a suite that accepts the producer-owned-listener alternative while retaining original/alternate-scheduling success and rejection of all three substantive faults. This is actual test-artifact improvement for the declared ownership distinction, not a claim that every async test is now correct.

Qualification amendment was recorded before interpreting candidate results and applied to all versions. The alternative's documented data/error/stalled behavior was independently exercised; a no-op internal observer does not change that public contract. Preserve the failed baseline and first candidate; do not replace them with the final pass.

Evidence: SkillForge project `20-working-T1-T3/RemainingSkills20261104/deep/engineering/stream-plan.md`, `stream-qualification.json`, `runs/stream-{baseline,candidate,candidate2}/`, `stream-checks-{baseline,candidate,candidate2}/`, and `stream-listener-{baseline,candidate,candidate2}/`. Raw logs are external evidence, not runtime dependencies. Remaining callback/concurrency/error branches and other workflows retain separate unverified outcomes.
