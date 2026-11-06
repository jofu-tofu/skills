# Read-only status and corrupt state

2026-11-05. Actual candidate15 status checks reproduced two problems: a corrupt state file was reported as no session, and querying stale state started a replacement browser and rewrote ownership. Candidate16 validates essential state fields, preserves invalid/unreadable state with an actionable error, and reads only the recorded session for status. Missing state is described as no recorded session; stale/mismatched state does not trigger startup.

Evidence: `RemainingSkills20261104/deep/engineering/status-candidate15/results.json` and `status-candidate16/results.json`. The baseline-created synthetic browser was stopped. Both versions used isolated reserved ports, with only the disposable DEFAULT_PORT adapted. Candidate16 preserves corrupt/stale/absent state; actual owned status reports the same session identity and preserves it. `owned-status-candidate16/checks.json` passes six lifecycle/current-state controls, and `browser-candidate16-portable.log` passes all three portable regressions.

Missing-browser startup was also executed with a nonexistent synthetic executable path: nonzero result with startup/dependency guidance and no fabricated success (`startup-failure-candidate16/start.json`). No installation occurred. Other runtimes/hosts and optional codegen/open helpers remain outside the measured claim.

Structural follow-up after independent review: removed the unreferenced isSessionRunning helper and its obsolete delete-state catch. The active behavior remains candidate16's measured behavior; Node syntax check passes. No lifecycle caller used that helper.
