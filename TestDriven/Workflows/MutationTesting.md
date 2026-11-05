# MutationTesting Workflow

**Trigger phrases:** "mutation test", "test my tests", "verify test quality", "do my tests catch bugs", "how good are my tests", "test effectiveness", "mutation score"

**Use when:** Evaluating whether your test suite actually catches bugs — not just whether tests pass.

## Reference Material

- **Mutation Testing:** `../Rules/MutationTesting.md`
- **Property-Based Testing:** `../Rules/PropertyBasedTesting.md`
- **FIRST Principles:** `../Rules/FIRST.md`
- **Anti-Patterns:** `../Rules/AntiPatterns.md`

---

## The Core Problem

100% code coverage doesn't mean your tests catch bugs. Coverage measures *which lines execute*, not *whether removing your logic breaks a test*. You can have full coverage with tests that never actually verify anything.

Mutation testing answers: **"If I break the code, do the tests fail?"**

See: `Rules/MutationTesting.md` for the full principle.

---

## How Mutation Testing Works

```
1. Take your working code + passing test suite
2. Tool creates "mutants" — small code changes:
   - if (x > 0) → if (x >= 0)
   - return true → return false
   - sum = a + b → sum = a - b
3. Run tests against each mutant
4. KILLED: tests failed → good, tests detected the bug
5. SURVIVED: tests passed → bad, tests missed this bug
6. Report the tool denominator and a separately justified behavioral score
```

A score describes the selected mutants, not overall readiness. Verify a passing baseline first; separate assertion-detected faults from invalid mutants, harness failures, unclassified timeouts and proven equivalents. Preserve raw statuses and restore source after each controlled mutation.

---

## Decision Tree

```
What's your goal?
│
├─ "Is my test suite any good?" (assessment)
│   → Run full mutation analysis
│   → See: Full Analysis Workflow below
│
├─ "I fixed a bug — did I add a test for it?"
│   → Run targeted mutation on the fixed code
│   → See: Targeted Mutation below
│
├─ "My mutation score is low — what do I fix?"
│   → Analyze survived mutants by category
│   → See: Improving Score below
│
└─ "I want mutation testing in CI"
    → See: CI Integration below
```

---

## Full Analysis Workflow

```bash
# JavaScript/TypeScript
npx stryker run

# Java
mvn org.pitest:pitest-maven:mutationCoverage

# Python
mutmut run
mutmut results

# .NET
dotnet stryker
```

**Interpret results:** classify each outcome before computing a score. A timeout needs investigation; compilation or harness failure is not proof an assertion detected a behavioral fault. Prioritize consequential survivors and report unavailable baseline/equivalence evidence.

---

## Targeted Mutation

When you fix a bug or add a feature, verify the test you wrote actually catches the regression:

```pseudocode
// You fixed: off-by-one in discount calculation
// Mutate: change > to >= in the condition
// Your test should FAIL with the mutant (meaning it catches the bug)

// If your test PASSES with the mutant → your test doesn't cover the fix
```

Run mutation only on the changed file to keep it fast.

---

## Improving Score

When mutants survive, they reveal test gaps. Group survived mutants by type:

| Survived Mutant Type | What It Means | Fix |
|---------------------|---------------|-----|
| Boundary changes (`>` → `>=`) | Missing boundary tests | Add tests at exact boundary values |
| Return value changes (`true` → `false`) | Return values not verified | Assert return values explicitly |
| Condition removals | Conditions not tested | Add test for when condition is false |
| Arithmetic changes (`+` → `-`) | Calculations not verified | Assert calculated values, not just that code ran |

**Prioritize:** Fix survived mutants in business-critical code first.

---

## CI Integration

Mutation testing is slow — don't run it on every commit.

```yaml
# Run on PR merges to main, not on every push
on:
  push:
    branches: [main]

# Stryker config: only mutate changed files
stryker:
  mutate: ["src/**/*.ts", "!src/**/*.spec.ts"]
  thresholds:
    high: 80
    low: 60
    break: 50  # Fail CI if score drops below 50%
```

---

## What Mutation Testing Doesn't Cover

| Limitation | Workaround |
|-----------|------------|
| Slow on large codebases | Run on changed files only, or sample-based |
| Doesn't test integration behavior | Combine with integration tests |
| Equivalent mutants (logically same) | Justify equivalence within the actual supported domain; do not assume a fixed rate |
| Uncontrolled nondeterminism can obscure results | Control available seams and report residual uncertainty; property tests also need an oracle |

---

## Related

- `Rules/MutationTesting.md` — Mutation Testing principle and theory
- `Rules/PropertyBasedTesting.md` — Complementary approach for finding edge cases
- `Rules/FIRST.md` — Self-Validating: are your tests actually validating?
- `Rules/AntiPatterns.md` — Coverage Theater (high coverage, low quality)
