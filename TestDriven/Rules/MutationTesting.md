# Mutation Testing

**Source:** Richard Lipton, "Fault Diagnosis of Computer Programs" (1971) / PiTest (Java) / Stryker (JS/TS) / mutmut (Python)

**Impact: High** — Reveals coverage theater: tests that run code but don't verify it. The most powerful tool for evaluating test suite quality.

---

## The Problem

Code coverage is a proxy metric. It measures "which lines ran", not "which behaviors were verified".

```
Coverage = 100%
Test assertions = 0
```

This is legal. And it's useless.

Mutation testing directly answers: **"Do my tests catch bugs?"**

---

## How It Works

A mutation testing tool automatically generates "mutants" — versions of your code with small deliberate bugs introduced:

| Mutation Type | Example | What it tests |
|--------------|---------|---------------|
| Conditional boundary | `> 0` → `>= 0` | Off-by-one detection |
| Negate conditional | `if valid` → `if !valid` | Branch coverage |
| Return value | `return true` → `return false` | Return value assertions |
| Arithmetic operator | `a + b` → `a - b` | Calculation verification |
| Void method call removal | `cache.clear()` removed | Side effect verification |

For each mutant:
- **Killed:** At least one test failed → tests detected the bug ✅
- **Survived:** All tests passed → tests missed this bug ❌

**Mutation Score = Killed Mutants / Total Mutants × 100%**

---

## The Test Question

*"If I change this line of code, will my tests catch it?"*

High mutation score → Yes, reliably.
Low mutation score → No, and your coverage report is lying to you.

---

## Interpreting Scores

| Score | Assessment | Action |
|-------|-----------|--------|
| > 80% | Strong | Maintain; focus effort elsewhere |
| 60-80% | Adequate | Target boundary conditions and return values |
| 40-60% | Weak | Tests run code but don't verify it |
| < 40% | Coverage theater | Major gaps; treat as untested |

---

## Equivalent Mutants (the known limitation)

Some mutants survive legitimately because the mutation produces code that is semantically identical:

```pseudocode
// Original
return x * 1

// Mutant: x * 1 → x + 0
return x + 0  // semantically identical — surviving is correct
```

Expect ~5-10% of mutants to be equivalent. A 100% kill rate is impossible and suspicious.

---

## When to Run Mutation Testing

| Timing | Approach |
|--------|---------|
| Before releasing critical code | Full analysis on changed modules |
| After writing tests for a bug fix | Targeted: mutate the fixed line |
| CI quality gate | Run on changed files only (fast) |
| Quarterly audit | Full codebase analysis |

---

## Tools

| Language | Tool | Notes |
|----------|------|-------|
| Java | PiTest | Mature, widely used |
| JavaScript/TypeScript | Stryker | Excellent TypeScript support |
| Python | mutmut | Simple, effective |
| .NET | Stryker.NET | Same team as JS Stryker |
| Rust | cargo-mutants | Growing ecosystem |

---

## Relationship to Coverage

Mutation testing and code coverage are complementary:

| Metric | Measures | Blind spot |
|--------|---------|------------|
| Coverage | Lines executed | Whether assertions verified anything |
| Mutation score | Assertion effectiveness | Whether covered scenarios are representative |

Aim for: **≥ 80% coverage AND ≥ 70% mutation score** on business-critical code.

---

## Survived Mutant Analysis

When a mutant survives, it reveals a specific testing gap. Common patterns:

**Boundary survived:** `if count > 0` → `if count >= 0` survived
→ Missing test: what happens when count == 0 exactly?

**Return value survived:** `return isValid` → `return false` survived
→ Missing assertion: test never checks the return value

**Condition survived:** `if user.isAdmin` → `if true` survived
→ Missing test: behavior when user is NOT admin

---

## Related

- `Workflows/MutationTesting.md` — Step-by-step workflow for running mutation tests
- `Rules/PropertyBasedTesting.md` — Complementary: generates inputs mutation testing can't
- `Rules/FIRST.md` — Self-Validating property: mutation testing enforces this mechanically
- `Rules/AntiPatterns.md` — Coverage Theater: mutation testing is the cure
