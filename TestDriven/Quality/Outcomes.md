# Outcome coverage

Tests should detect consequential wrong behavior, accept valid implementations, and report only what actual execution establishes. Workflow outcomes include scope-correct test writing, useful test review and diagnosis, AI-change validation, reliable async tests, boundary-contract proof, appropriate LLM evaluation, mutation interpretation and proportionate strategy. Each has independent failure modes; a green suite or coverage percentage is not a whole-skill score.

## Async detection

- **T-ASYNC-1:** The actual runner observes relevant assertions and error paths, with valid awaited tests accepted. Qualification must distinguish assertion failures from setup failures and inspect the complete run, including late failures.
- **T-ASYNC-2:** Callback/event/stream/concurrent tests preserve required behavior and release test-owned resources across success, error, timeout and repeated execution.

Qualified bounded evidence exists for T-ASYNC-1's awaited, missing-assertion, false-assertion and late-failure diagnosis on Node's built-in runner. This does not certify all async patterns or runners. Later stream, callback and concurrency trials extend this initial evidence; current per-outcome judgments below take precedence. See [attempt record](../Improvements/AsyncSensitivity.md). Later evaluations should preserve separate pass, fail and unverified judgments, valid alternatives, source versions and actual final artifacts.

## Comprehensive evaluation coverage

2026-11-05. Parent improvement continues. Each row names an accountable result and contributing owner. **Unverified** means the full judgment remains open; bounded passing observations do not disappear or certify the whole row. Qualify valid alternatives and consequential failures, then inspect actual final task results. No universal score or case quota.

### T-WRITE / WriteTests + behavior/RGR

- **T-WRITE-1 — pass:** Runnable tests encode the actual public contract and negative/side-effect requirements and distinguish consequential wrong behavior from valid implementations. Scope: Tests-only and full TDD; stateful API, callbacks, streams and controlled concurrent work.
- **T-WRITE-2 — pass:** Production edits and red/green/refactor steps follow requested scope: tests-only/characterization preserve implementation, while authorized full TDD delivers actual stage evidence. Scope: Tests-only and full TDD; stateful API, callbacks, streams and controlled concurrent work.

Prior inventory: Untested.

Current bounded evidence: scope: tests-only preserves production; full TDD records actual red/green/refactor; scheduling: earlier tests reject valid serial; candidate2 accepts; stream ownership: earlier tests reject producer listener; candidate2 accepts; faults: unbounded/order/error/content faults rejected; completion: actual awaited assertion/rejection paths and cleanup observed. Evidence: tdd-independent-candidate/result.json, tdd-independent-candidate2/result.json, runs/tdd-async-candidate2/report.md, stream-listener-candidate2/result.json, stream-checks-candidate2/results.json, test-workflow-checks-candidate/results.json

Next: Retain demonstrated contract/ownership gains; no exhaustive scheduling/framework guarantee.

### T-REVIEW / ReviewTests + FIRST/pyramid/doubles

- **T-REVIEW-1 — pass:** Review identifies consequential vacuous, flaky, coupled or missing-behavior tests with actionable evidence while accepting valid boundary spies and appropriate test mixes. Scope: Public quote API, bounded integer domain, actual brittle/clock-dependent tests repaired; example, exhaustive single-line and seeded-array strategy.
- **T-REVIEW-2 — pass:** Quality conclusions reflect fault detection and accepted valid alternatives rather than coverage percentages or universal pyramid ratios. Scope: Vacuous-versus-public-boundary review, independent fault/alternative checks and explicit mutation-denominator limits.

Prior inventory: Untested; Diagnose boundary-spy case does not execute ReviewTests' rules.

Current bounded evidence: review: Actual tests accept loop and reduce implementations and reject wrong subtotal, count and missing public notification; diagnosis: Source-shape and clock-parity tests removed; no measured flake-rate claim. Evidence: runs/strategy-review-candidate/report.md, strategy-independent/results.json, runs/test-workflows-baseline/report.md, test-workflow-checks/results.json, runs/test-workflows-candidate/report.md, test-workflow-checks-candidate/results.json

Next: Retain demonstrated result; limits below are separate from supported outcomes measured here.

### T-DIAG / DiagnoseTest

- **T-DIAG-1 — pass:** Diagnosis distinguishes production regression, wrong test expectation, incidental coupling and environmental/flaky failure using evidence, and repairs the responsible owner without weakening the actual contract. Scope: Public quote API, bounded integer domain, actual brittle/clock-dependent tests repaired; example, exhaustive single-line and seeded-array strategy.

Prior inventory: One explicit dry-run regression fixed production and retained boundary spy. Legitimate internal refactor, wrong expectation, clock/order flake and dependency failure untested.

Current bounded evidence: review: Actual tests accept loop and reduce implementations and reject wrong subtotal, count and missing public notification; diagnosis: Source-shape and clock-parity tests removed; no measured flake-rate claim. Evidence: runs/strategy-review-candidate/report.md, strategy-independent/results.json

Next: Retain demonstrated result; limits below are separate from supported outcomes measured here.

### T-AI / AIValidation

- **T-AI-1 — pass:** Refactor validation compares actual behavior, adds needed characterization and reports missing runtime proof rather than treating compilation or generated assurances as preservation. Scope: Actual local refactor, controlled mutations and provider-state boundaries; unavailable broker/deployment proof explicit.
- **T-AI-2 — pass:** Generated-test validation rejects wrong/vacuous tests and accepts valid alternatives; limited successful mutations do not certify all outcomes. Scope: Actual local refactor, controlled mutations and provider-state boundaries; unavailable broker/deployment proof explicit.

Prior inventory: Untested in both parts and combined mode.

Current bounded evidence: refactor: weak original passes regression; behavior suite fails original and accepts repaired/equivalent versions; mutations: passing baseline; boundary survivor becomes assertion kill; equivalent accepted and invalid distinguished; production unchanged; provider: actual present/missing states and cleanup pass; valid object implementation accepted, wrong type and cleanup defect rejected; limits: no broker/HTTP deployment proof fabricated. Evidence: runs/validation-boundaries-candidate/report.md, runs/validation-boundaries-candidate/evidence/mutation-summary.json, validation-independent/results.json, metrics-independent-results.json

Next: No concrete unresolved gap in these bounded routes; live external integrations require their own authorized environment.

### T-ASYNC / AsyncTesting

- **T-ASYNC-1 — pass:** Async tests observe actual assertions and rejection/error paths with bounded completion; genuinely vacuous tests are rejected and valid awaited/framework-caught tests accepted by a qualified checker. Scope: Tests-only and full TDD; stateful API, callbacks, streams and controlled concurrent work.
- **T-ASYNC-2 — pass:** Callbacks, events, streams and concurrent cases clean up resources and preserve observable ordering/error behavior across repeated execution rather than silently passing or leaking listeners/timers. Scope: Tests-only and full TDD; stateful API, callbacks, streams and controlled concurrent work.

Prior inventory: Untested; see incorrect checker below.

Current bounded evidence: scope: tests-only preserves production; full TDD records actual red/green/refactor; scheduling: earlier tests reject valid serial; candidate2 accepts; stream ownership: earlier tests reject producer listener; candidate2 accepts; faults: unbounded/order/error/content faults rejected; completion: actual awaited assertion/rejection paths and cleanup observed. Evidence: tdd-independent-candidate/result.json, tdd-independent-candidate2/result.json, runs/tdd-async-candidate2/report.md, stream-listener-candidate2/result.json, stream-checks-candidate2/results.json, test-workflow-checks-candidate/results.json

Next: Retain demonstrated contract/ownership gains; no exhaustive scheduling/framework guarantee.

### T-CONTRACT / ContractTesting

- **T-CONTRACT-1 — pass:** Consumer/provider/bidirectional checks establish the compatibility evidence they claim at the actual boundary; mock-consumer success or compatible declarations alone do not certify provider implementation. Scope: Actual local refactor, controlled mutations and provider-state boundaries; unavailable broker/deployment proof explicit.
- **T-CONTRACT-2 — pass:** Provider states, incompatible versions and unavailable verification are handled with correct setup/cleanup and honest limits; broker publication remains within authorized scope. Scope: Actual local refactor, controlled mutations and provider-state boundaries; unavailable broker/deployment proof explicit.

Prior inventory: Untested.

Current bounded evidence: refactor: weak original passes regression; behavior suite fails original and accepts repaired/equivalent versions; mutations: passing baseline; boundary survivor becomes assertion kill; equivalent accepted and invalid distinguished; production unchanged; provider: actual present/missing states and cleanup pass; valid object implementation accepted, wrong type and cleanup defect rejected; limits: no broker/HTTP deployment proof fabricated. Evidence: runs/validation-boundaries-candidate/report.md, runs/validation-boundaries-candidate/evidence/mutation-summary.json, validation-independent/results.json, metrics-independent-results.json

Next: No concrete unresolved gap in these bounded routes; live external integrations require their own authorized environment.

### T-LLM / LLMTesting→Evals

- **T-LLM-1 — pass:** The selected evaluation method and metric answer the actual structural, semantic, regression or consistency question using qualified truth/judgment and meaningful task outputs. Scope: Offline metric/grounding checks plus actual available TestDriven to frozen Evals standalone semantic-regression consumer on synthetic policy outputs; no production benchmark.
- **T-LLM-2 — pass:** Results retain failures, variation, model/version and dependency limits; unavailable Evals/tool/ground truth and format-only success are not promoted to task readiness. Scope: Offline metric/grounding checks plus actual available TestDriven to frozen Evals standalone semantic-regression consumer on synthetic policy outputs; no production benchmark.

Prior inventory: Untested.

Current bounded evidence: available consumer: Reads actual Evals contract and executes model-led rubric, calibration3/3, baseline3/3 vs candidate1/3 and valid alternatives2/2 in both recorded passes; independent reference: All16 judgments agree with separate predeclared reference; packet unchanged; limits: Same-context repeated judging, held-out text visible at intake, same-vendor reference; not independent generation trials, human calibration or population reliability. Evidence: metrics-contracts-plan.md, metrics-independent-results.json, runs/metrics-contracts-baseline/report.md, runs/metrics-contracts-candidate/report.md, runs/evals-available-candidate/report.md, evals-available-independent.json

Next: Retain scoped available-consumer and prior mechanics evidence; no skill rewrite justified by this passing followup.

### T-MUTATE / MutationTesting

- **T-MUTATE-1 — pass:** Mutation assessment starts from a verified baseline and distinguishes killed, survived, equivalent, invalid and timeout results with a defensible scope/denominator. Scope: Actual local refactor, controlled mutations and provider-state boundaries; unavailable broker/deployment proof explicit.
- **T-MUTATE-2 — pass:** Improvements address consequential uncovered behavior while accepting valid alternatives, restoring source and avoiding universal score-based readiness claims. Scope: Actual local refactor, controlled mutations and provider-state boundaries; unavailable broker/deployment proof explicit.

Prior inventory: Untested as skill. GreenRed generated-test mutation checks are not evidence that this workflow interprets mutants correctly.

Current bounded evidence: refactor: weak original passes regression; behavior suite fails original and accepts repaired/equivalent versions; mutations: passing baseline; boundary survivor becomes assertion kill; equivalent accepted and invalid distinguished; production unchanged; provider: actual present/missing states and cleanup pass; valid object implementation accepted, wrong type and cleanup defect rejected; limits: no broker/HTTP deployment proof fabricated. Evidence: runs/validation-boundaries-candidate/report.md, runs/validation-boundaries-candidate/evidence/mutation-summary.json, validation-independent/results.json, metrics-independent-results.json

Next: No concrete unresolved gap in these bounded routes; live external integrations require their own authorized environment.

### T-STRATEGY / reference mode + properties/builders/side effects

- **T-STRATEGY-1 — pass:** The chosen strategy and runnable examples use justified properties/oracles, useful data builders and appropriate side-effect boundaries without needless architecture changes or invented behavior. Scope: Public quote API, bounded integer domain, actual brittle/clock-dependent tests repaired; example, exhaustive single-line and seeded-array strategy.

Prior inventory: Untested.

Current bounded evidence: review: Actual tests accept loop and reduce implementations and reject wrong subtotal, count and missing public notification; diagnosis: Source-shape and clock-parity tests removed; no measured flake-rate claim. Evidence: runs/strategy-review-candidate/report.md, strategy-independent/results.json

Next: Retain demonstrated result; limits below are separate from supported outcomes measured here.

Source and raw evidence: SkillForge project `20-working-T1-T3/RemainingSkills20261104/deep/engineering-coverage.json`, `engineering-scope.md`, `scope-review.md`, and `engineering/open-outcome-map.json`. Per-outcome records preserve applicable contrasts, qualification and specific trial evidence. These external files are evidence indexes, not runtime dependencies. Structural ownership/portability/schema findings remain required work until explicitly resolved; consult local Improvements records for retained scoped changes.
