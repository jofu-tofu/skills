# Async assertion sensitivity correction

2026-11-05. Scoped source-correctness repair; no demonstrated model outcome advantage or whole-skill readiness.

The previous AsyncTesting and shared AntiPatterns guidance said deleting an assertion and still passing identifies an unobserved async assertion. A correct awaited test also passes when its successful assertion is removed. Controlled Node tests demonstrated this false positive. They also showed that this runner fails the complete run after a late assertion, contradicting the blanket claim that late errors necessarily produce passing runs.

The shared AntiPatterns owner now defines a deliberately false assertion in a disposable copy, actual runner evidence and restoration. AsyncTesting refers to that owner and explains completion ownership. Setup failure is not assertion sensitivity; observed assertion execution alone is not meaningful behavioral coverage; an old red result is not permanent proof. Existing example purposes and cross-references remain.

Alternatives considered: retain the heuristic (disproved by counterexample), delete all detection guidance (loses useful help), or qualify the sensitivity procedure (selected). Academic research was not needed to settle the executable counterexample; broader methodology claims are not established by it.

Matched configured-model trials reviewed the same four synthetic tests with original instructions, a first workflow-only candidate, and the final shared-owner candidate. All correctly identified valid awaited, missing assertion, deliberate assertion failure and runner-detected late failure, preserving read-only scope. The baseline explicitly compensated for the bad instruction. Result: behavioral tie, with a directly demonstrated correction to instruction accuracy. The first candidate's duplicated stale shared rule was found during structural review and corrected before this retained draft.

Evidence workspace: `20-working-T1-T3/RemainingSkills20261104/deep/engineering/` in the SkillForge project. Relevant records: `async-plan.md`, `checker-qualification.json`, `async-results.json`, `runs/async-baseline/`, `runs/async-candidate/`, `runs/async-candidate2/`; each trial preserves prompt, frozen skill, fixtures, runner events and report. These are external raw evidence, not runtime dependencies.

Remaining: qualify and evaluate callback/rejection/concurrency and actual generated stream cleanup tests, plus the other TestDriven workflows. A controlled stream pseudocode translation found retained listeners/timers, but is not evidence that subject-generated tests fail or that this sensitivity edit fixes cleanup. Parent improvement work continues.
