# Tests-only scope

2026-11-05. WriteTests now chooses requested scope before the red/green/refactor sequence: characterization preserves production; authorized full TDD retains the complete cycle.

Matched writer/review/diagnosis tasks preserve production and produce useful stateful tests in both versions. Independent suites accept a valid implementation rewrite and reject wrong returns, invalid-input state corruption, and shared state. Both reviews correctly distinguish a useful public event assertion from tautological equality. Both repair the wrong test expectation, preserving correct production. This is a behavioral tie with clearer source routing. Full-TDD preservation subsequently passes in ConcurrencyContract.md, including valid serial scheduling and callback/error controls.

Evidence: `RemainingSkills20261104/deep/engineering/runs/test-workflows-{baseline,candidate}`, `test-workflow-checks/results.json`, `test-workflow-checks-candidate/results.json`.
