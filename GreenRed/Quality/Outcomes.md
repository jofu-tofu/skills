# GreenRed outcomes

Purpose: Produce behavior-focused tests, either a passing characterization of existing behavior (Green) or expected-red tests for requested missing behavior (Red), without implementation, dependency installation or build-configuration changes. Components: SKILL router, two workflows, IOContract rule, SkillIntent. Both workflows discover existing runner/conventions and deliver a behavior-to-proof map. TestDriven reference material resolves through sibling skill paths or the available catalog; unavailable references are explicit.

## Comprehensive evaluation coverage

2026-11-05. Parent improvement continues. Each row names an accountable result and contributing owner. **Unverified** means the full judgment remains open; bounded passing observations do not disappear or certify the whole row. Qualify valid alternatives and consequential failures, then inspect actual final task results. No universal score or case quota.

### G-ROUTE / intent router

- **G-ROUTE-1 — pass:** Mode follows requested characterization versus desired missing behavior regardless of implementation presence; genuine ambiguity is disclosed/resolved rather than silently changing intent. Scope: Stateful API, real CLI, injected clock, operational runner with unrelated failure, conflicting intent and missing-input contrasts.

Prior inventory: Executed explicit Red with existing implementation only. Ordinary Green, no-code Red and ambiguous requests untested.

Current bounded evidence: stateful: valid implementations accepted; consequential mutants rejected; CLI: contractual diagnostics and expected-red/preservation results separated; runner: isolated pass/full-suite pre-existing failure honestly distinguished; uncertainty: conflicting mode and absent interface remain blocked, no invented tests; dependency: unavailable optional TestDriven reference explicitly recorded. Evidence: ledger-checks-candidate/results.json, cli-checks/qualification.json, runs/diagnostic-cli-candidate/report.md, runs/greenred-boundaries-candidate/report.md, greenred-boundaries-checks-baseline/results.json, greenred-boundaries-checks-candidate/results.json

Next: No concrete unaddressed gap in these supported task families after qualified contrasts; no claim for every possible project/framework.

### G-INFRA / shared Step0

- **G-INFRA-1 — pass:** The appropriate package, runner and conventions are used and actual infrastructure failure is distinguished from pre-existing failing/flaky behavior without unrequested dependency or configuration changes. Scope: Stateful API, real CLI, injected clock, operational runner with unrelated failure, conflicting intent and missing-input contrasts.

Prior inventory: Simple single-package Node runner passed. Monorepo, absent runner/deps and pre-existing failing/flaky suite untested.

Current bounded evidence: stateful: valid implementations accepted; consequential mutants rejected; CLI: contractual diagnostics and expected-red/preservation results separated; runner: isolated pass/full-suite pre-existing failure honestly distinguished; uncertainty: conflicting mode and absent interface remain blocked, no invented tests; dependency: unavailable optional TestDriven reference explicitly recorded. Evidence: ledger-checks-candidate/results.json, cli-checks/qualification.json, runs/diagnostic-cli-candidate/report.md, runs/greenred-boundaries-candidate/report.md, greenred-boundaries-checks-baseline/results.json, greenred-boundaries-checks-candidate/results.json

Next: No concrete unaddressed gap in these supported task families after qualified contrasts; no claim for every possible project/framework.

### G-GREEN / map → public tests

- **G-GREEN-1 — pass:** Generated characterization tests pass the unchanged implementation and accurately capture current observable behavior, including known defects, without silently imposing desired corrections. Scope: Stateful API, real CLI, injected clock, operational runner with unrelated failure, conflicting intent and missing-input contrasts.
- **G-GREEN-2 — pass:** Tests reject consequential behavior changes and accept valid internal rewrites while leaving production unchanged; repeated/stateful sequences preserve contractual ordering and side effects without test-order dependence or leaked fixture resources. Scope: Stateful API, real CLI, injected clock, operational runner with unrelated failure, conflicting intent and missing-input contrasts.

Prior inventory: Untested.

Current bounded evidence: stateful: valid implementations accepted; consequential mutants rejected; CLI: contractual diagnostics and expected-red/preservation results separated; runner: isolated pass/full-suite pre-existing failure honestly distinguished; uncertainty: conflicting mode and absent interface remain blocked, no invented tests; dependency: unavailable optional TestDriven reference explicitly recorded. Evidence: ledger-checks-candidate/results.json, cli-checks/qualification.json, runs/diagnostic-cli-candidate/report.md, runs/greenred-boundaries-candidate/report.md, greenred-boundaries-checks-baseline/results.json, greenred-boundaries-checks-candidate/results.json

Next: No concrete unaddressed gap in these supported task families after qualified contrasts; no claim for every possible project/framework.

### G-RED / requested contract → runnable tests

- **G-RED-1 — pass:** Runnable tests fail meaningfully for requested missing behavior while preservation tests can pass; asserted requirements are grounded in the request rather than invented policy or setup failure. Scope: Stateful API, real CLI, injected clock, operational runner with unrelated failure, conflicting intent and missing-input contrasts.
- **G-RED-2 — pass:** The suite rejects consequential partial/wrong implementations and accepts valid implementations across applicable boundary, state, async and side-effect requirements, including repeated/stateful sequences with contractual ordering, isolated test state and fixture resource cleanup. Scope: Stateful API, real CLI, injected clock, operational runner with unrelated failure, conflicting intent and missing-input contrasts.

Prior inventory: Executed bulk threshold9/10/11 with 2 pass/2 fail, valid alternative accepted, three wrong implementations rejected. Error/state/side-effect/asynchronous/no-implementation cases untested.

Current bounded evidence: stateful: valid implementations accepted; consequential mutants rejected; CLI: contractual diagnostics and expected-red/preservation results separated; runner: isolated pass/full-suite pre-existing failure honestly distinguished; uncertainty: conflicting mode and absent interface remain blocked, no invented tests; dependency: unavailable optional TestDriven reference explicitly recorded. Evidence: ledger-checks-candidate/results.json, cli-checks/qualification.json, runs/diagnostic-cli-candidate/report.md, runs/greenred-boundaries-candidate/report.md, greenred-boundaries-checks-baseline/results.json, greenred-boundaries-checks-candidate/results.json

Next: No concrete unaddressed gap in these supported task families after qualified contrasts; no claim for every possible project/framework.

### G-BOUNDARY / IOContract + caller discovery

- **G-BOUNDARY-1 — pass:** Tests exercise the actual caller-observable contract, including explicitly contractual diagnostics/events/boundary calls, without binding to incidental private implementation details. Scope: Stateful API, real CLI, injected clock, operational runner with unrelated failure, conflicting intent and missing-input contrasts.

Prior inventory: Simple exported function only. Multi-entry HTTP/CLI/event surface and explicitly observable diagnostics untested.

Current bounded evidence: stateful: valid implementations accepted; consequential mutants rejected; CLI: contractual diagnostics and expected-red/preservation results separated; runner: isolated pass/full-suite pre-existing failure honestly distinguished; uncertainty: conflicting mode and absent interface remain blocked, no invented tests; dependency: unavailable optional TestDriven reference explicitly recorded. Evidence: ledger-checks-candidate/results.json, cli-checks/qualification.json, runs/diagnostic-cli-candidate/report.md, runs/greenred-boundaries-candidate/report.md, greenred-boundaries-checks-baseline/results.json, greenred-boundaries-checks-candidate/results.json

Next: No concrete unaddressed gap in these supported task families after qualified contrasts; no claim for every possible project/framework.

### G-UNCERTAIN / seams + proof map

- **G-UNCERTAIN-1 — pass:** Available seams control unstable time/random/I/O behavior without changing production; unknown requirements and unavailable proof remain explicit uncovered behavior rather than guessed or skipped success. Scope: Stateful API, real CLI, injected clock, operational runner with unrelated failure, conflicting intent and missing-input contrasts.

Prior inventory: Untested.

Current bounded evidence: stateful: valid implementations accepted; consequential mutants rejected; CLI: contractual diagnostics and expected-red/preservation results separated; runner: isolated pass/full-suite pre-existing failure honestly distinguished; uncertainty: conflicting mode and absent interface remain blocked, no invented tests; dependency: unavailable optional TestDriven reference explicitly recorded. Evidence: ledger-checks-candidate/results.json, cli-checks/qualification.json, runs/diagnostic-cli-candidate/report.md, runs/greenred-boundaries-candidate/report.md, greenred-boundaries-checks-baseline/results.json, greenred-boundaries-checks-candidate/results.json

Next: No concrete unaddressed gap in these supported task families after qualified contrasts; no claim for every possible project/framework.

### G-HANDOFF / suite → implementation user

- **G-HANDOFF-1 — pass:** The delivered executable suite and behavior-proof map identify exact commands and actual expected-red, preserved-pass, blocked and not-run results so the next implementation step is clear. Scope: Stateful API, real CLI, injected clock, operational runner with unrelated failure, conflicting intent and missing-input contrasts.

Prior inventory: Basic Red handoff executed; infrastructure-red, mixed suite, skipped assertions and Green proof map untested.

Current bounded evidence: stateful: valid implementations accepted; consequential mutants rejected; CLI: contractual diagnostics and expected-red/preservation results separated; runner: isolated pass/full-suite pre-existing failure honestly distinguished; uncertainty: conflicting mode and absent interface remain blocked, no invented tests; dependency: unavailable optional TestDriven reference explicitly recorded. Evidence: ledger-checks-candidate/results.json, cli-checks/qualification.json, runs/diagnostic-cli-candidate/report.md, runs/greenred-boundaries-candidate/report.md, greenred-boundaries-checks-baseline/results.json, greenred-boundaries-checks-candidate/results.json

Next: No concrete unaddressed gap in these supported task families after qualified contrasts; no claim for every possible project/framework.

Source and raw evidence: SkillForge project `20-working-T1-T3/RemainingSkills20261104/deep/engineering-coverage.json`, `engineering-scope.md`, `scope-review.md`, and `engineering/open-outcome-map.json`. Per-outcome records preserve applicable contrasts, qualification and specific trial evidence. These external files are evidence indexes, not runtime dependencies. Structural ownership/portability/schema findings remain required work until explicitly resolved; consult local Improvements records for retained scoped changes.
