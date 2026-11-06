# Session identity repair

2026-11-05. B-SESSION partial outcome; parent evaluation continues.

Actual CLI tests with isolated state and localhost stubs showed `stop` sent its control request to both a different session ID and a non-JSON health service, then reported success. The recorded port alone did not identify the browser. Shared health validation now requires the expected session ID and successful Browser health shape before reuse, startup readiness or lifecycle control. Unreachable services remain distinct from identity mismatch; an occupied default port without matching state is not adopted. Stop HTTP failure no longer claims success.

Matched controls: owned session stop preserved; foreign session and malformed health both rejected before control. Original baseline passed only the owned control; candidate passed all three. Existing actual Chromium diagnostics, late-navigation isolation and durable lifecycle checks also passed. Root independently reviewed the runtime diff without a blocking issue.

This protects against stale state and unrelated services. It is not authentication or protection against a service deliberately impersonating identity, and does not eliminate a check/use race. Full cold-start/restart and supported-host behavior remain open.

Portable regression: `Tests/SessionIdentity.test.ts` uses actual CLI invocation and disposable localhost fixtures, not a mocked internal function. Evidence: SkillForge project `20-working-T1-T3/RemainingSkills20261104/deep/engineering/browser-session-{baseline,candidate}/result.json`; prior diagnostic preservation at `engineering/browser-candidate4/`, `navigation-candidate4/`, and frozen `engineering/candidate4/Browser`. These external records are not runtime dependencies.
