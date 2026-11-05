# Stateful characterization and desired behavior

2026-11-05. Scoped structural repair with tied behavioral preservation; broad evaluation continues.

Quick routing previously selected Green solely because code existed, despite Red explicitly supporting existing code missing desired behavior. Routing now follows the requested current-versus-desired behavior and preserves explicit mode. Red completion distinguishes failing missing-behavior tests from passing preservation tests. IOContract distinguishes incidental diagnostics from explicitly contractual audit/diagnostic outputs.

Matched baseline/candidate tasks generated Green characterization and Red idempotency tests for synthetic ledgers. Both preserved production, exercised repeated/interleaved calls and independent ledger instances, and reported actual pass/expected-failure evidence. Independent replay accepted three valid implementations (including different internal storage/copy behavior) and rejected five meaningful faults: omitted event, shared ledger state, changed retry amount, duplicate event and last-key-only caching. Result: tied on these tasks, with contradictory instruction contracts reconciled. No demonstrated model superiority.

Evidence: SkillForge project `20-working-T1-T3/RemainingSkills20261104/deep/engineering/runs/ledger-{baseline,candidate}/` and `ledger-checks-{baseline,candidate}/results.json`. The API oracle qualifies alternatives/mutants before generated-test results are interpreted. Source files and existing tests remain preserved in frozen trials.

Open: ambiguous/conflicting intent, absent interface/runner, monorepo and pre-existing failed suites, explicit diagnostic CLI output, unstable async seams and portable TestDriven references. These concrete coverage gaps remain in Quality/Outcomes; a passing stateful ledger does not close the skill.
