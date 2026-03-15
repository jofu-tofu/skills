---
name: TestDriven
description: Test-driven development philosophy and smart testing methodology. USE WHEN writing tests OR designing test strategy OR refactoring code with tests OR reviewing test quality OR discussing TDD OR characterization testing OR catching regressions OR tests keep breaking after refactoring OR AI refactored code OR AI generated tests OR testing async code OR testing microservices OR testing LLM output OR mutation testing OR stub vs mock OR contract testing OR too many mocks OR isolate side effects OR code hard to test OR functional core imperative shell. Contains 11 core principles from authoritative sources for writing tests that survive refactoring.
compatibility: Designed for Claude Code and Devin (or similar agent products)
metadata:
  author: pai
  version: "1.0.0"
---

# TestDriven

11 core principles from authoritative sources for writing tests that **survive refactoring and catch real regressions**.

**Core insight:** If you have to change your tests to make them pass after a legitimate refactoring, your tests are testing the wrong thing.

## Skill Type: Reference + Workflow

This skill provides **principles for test quality** plus **four actionable workflows** for common testing scenarios.

**Core principle:** Code that is hard to test is poorly designed. Separate pure logic from side effects, and testing becomes trivial.

---

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Trigger | Workflow | Use When |
|---------|----------|----------|
| "write tests", "add tests", "test this", "how do I test" | `Workflows/WriteTests.md` | Writing tests for new or existing code |
| "review tests", "test quality", "PR review", "audit tests" | `Workflows/ReviewTests.md` | Evaluating test quality in code review |
| "diagnose test", "fix test", "test breaking", "test failing after refactor" | `Workflows/DiagnoseTest.md` | Fixing broken or flaky tests |
| "AI refactored", "AI generated", "validate AI", "copilot", "claude refactored" | `Workflows/AIValidation.md` | Validating AI-refactored code or AI-generated tests |
| "test async", "test promises", "test callbacks", "await in tests", "async test" | `Workflows/AsyncTesting.md` | Testing asynchronous operations and Promises |
| "contract test", "test microservices", "consumer-driven", "pact", "test services without running them" | `Workflows/ContractTesting.md` | Testing service interfaces without running all services |
| "test LLM", "test AI output", "prompt testing", "evaluate AI", "test language model" | `Workflows/LLMTesting.md` | Testing language model components and AI pipelines |
| "mutation test", "test my tests", "verify test quality", "do my tests catch bugs" | `Workflows/MutationTesting.md` | Verifying test suite actually catches bugs |

**Philosophy questions, test strategy, learning** → Use Reference Mode (see Core Principles below)

---

## Core Principles

| # | Principle | Source | Key Question |
|---|-----------|--------|--------------|
| 1 | **FIRST** | Robert C. Martin, "Clean Code" (2008) | Fast, Independent, Repeatable, Self-Validating, Timely? |
| 2 | **Behavior Over Implementation** | Kent Beck, Michael Feathers | Would test pass if I rewrote with different algorithm? |
| 3 | **Test Pyramid** | Martin Fowler (2012) | Many unit, fewer integration, even fewer E2E? |
| 4 | **Characterization Tests** | Michael Feathers, "Working Effectively with Legacy Code" (2004) | Am I changing code I don't understand? |
| 5 | **Red-Green-Refactor** | Kent Beck, "TDD by Example" (2002) | Did I write failing test first? |
| 6 | **Test Double Taxonomy** | Gerard Meszaros, "xUnit Test Patterns" (2007) | Am I using the right double — dummy, stub, spy, mock, or fake? |
| 7 | **Contract Testing** | Martin Fowler / Ian Robinson (2011) | Do my services agree on the interface without running together? |
| 8 | **Mutation Testing** | Richard Lipton (1971) / PiTest / Stryker | If I break this line, does a test fail? |
| 9 | **Property-Based Testing** | John Hughes, QuickCheck (1999) | What must be true for ALL valid inputs, not just examples I thought of? |
| 10 | **Test Data Builders** | Nat Pryce / GOOS (2009) | Do my tests only override what matters for each specific case? |
| 11 | **Side-Effect Isolation** | Gary Bernhardt (2012) / Michael Feathers (2004) / Robert C. Martin (2017) | Could I test this function's logic without any mocks? |

---

## Quick Decision Tree

**Start here when testing:**

```
Is this legacy/unfamiliar code?
├─ YES → Characterization Tests (Rules/CharacterizationTests.md)
│        Capture behavior before changing
│
└─ NO → Is this new development?
        ├─ YES → Red-Green-Refactor (Rules/RedGreenRefactor.md)
        │        Write failing test first, then implement
        │
        └─ NO → Are tests breaking on refactoring?
                ├─ YES → Behavior Over Implementation (Rules/BehaviorOverImplementation.md)
                │        Tests are coupled to implementation
                │
                └─ NO → Do tests require many mocks?
                        ├─ YES → Side-Effect Isolation (Rules/SideEffectIsolation.md)
                        │        Code mixes logic with side effects
                        │
                        └─ NO → Is test suite slow/flaky?
                                ├─ YES → Test Pyramid (Rules/TestPyramid.md)
                                │        Likely ice cream cone anti-pattern
                                │
                                └─ NO → FIRST (Rules/FIRST.md)
                                        Evaluate individual test quality
```

---

## Priority When Stuck

When multiple principles apply and conflict:

1. **Behavior Over Implementation** (wins for new/understood code)
2. **Characterization Tests** (wins for legacy/unknown code)
3. **Test Pyramid** (wins for test suite design)
4. **FIRST** (wins for individual test quality)
5. **Red-Green-Refactor** (wins for development workflow)

---

## Anti-Patterns

See `Rules/AntiPatterns.md` for all 7 anti-patterns including:

- **The Ice Cream Cone** — inverted test pyramid (too many E2E, too few unit)
- **Wet Tests** — duplicated setup code across many tests
- **The Liar** — always-passing test whose assertion never runs
- **Over-Mocked Tests** — testing wiring instead of behavior
- **Time-Dependent Tests** — tests that fail at midnight, month boundaries, or DST changes
- **God Test** — one test verifying too many unrelated behaviors
- **Don't Mock What You Don't Own** — mocking third-party libraries that can silently drift

---

## Examples

**Example 1: Implementation-Coupled Test (Bad)**

```pseudocode
// This test breaks when you change the SQL query or add caching
function test_get_users():
    db = mock()
    db.execute.returns([user_data])
    service = UserService(db)

    service.get_active_users()

    // Coupled to exact SQL - breaks on any query change
    assert db.execute.was_called_with("SELECT * FROM users WHERE active = 1")
```
→ Problem: Tests HOW (the query), not WHAT (returns active users)
→ See: `Rules/BehaviorOverImplementation.md`

**Example 2: Behavior-Based Test (Good)**

```pseudocode
// This test survives query changes, ORM migration, caching, etc.
function test_get_active_users_returns_only_active():
    service = UserService(test_database)
    service.create_user("alice", active=true)
    service.create_user("bob", active=false)

    result = service.get_active_users()

    // Tests WHAT we get, not HOW we get it
    assert length(result) == 1
    assert result[0].name == "alice"
```
→ Survives: query rewrites, ORM changes, caching layer, database migration
→ See: `Rules/BehaviorOverImplementation.md`

**Example 3: Characterization Test for Legacy Code**

```pseudocode
// Unknown legacy code - capture current behavior first
function test_process_order_characterization():
    sample_orders = load_production_samples()

    for order in sample_orders:
        result = process_order(order)
        assert result == load_expected_result(order.id)

// Now you can refactor safely - test detects unintended changes
```
→ Use: When inheriting code you don't fully understand
→ See: `Rules/CharacterizationTests.md`

---

## Principle Files

Each principle file in `Rules/` includes:
- Source attribution
- Impact level and why it matters
- Problem: Anti-pattern with code example
- Solution: Correct pattern with code example
- "The Test Question" - Self-check to evaluate your tests

### Rule File Index

| File | Principle | When to Read |
|------|-----------|--------------|
| `Rules/FIRST.md` | Fast, Independent, Repeatable, Self-Validating, Timely | Evaluating individual test quality |
| `Rules/BehaviorOverImplementation.md` | Test WHAT, not HOW | Tests break after refactoring |
| `Rules/TestPyramid.md` | Many unit, few E2E | Test suite slow or flaky |
| `Rules/CharacterizationTests.md` | Capture before changing | Working with legacy code |
| `Rules/RedGreenRefactor.md` | Red → Green → Refactor | TDD workflow |
| `Rules/TestDoubleTaxonomy.md` | Dummy, Stub, Spy, Mock, Fake | Choosing the right test double type |
| `Rules/ContractTesting.md` | Consumer-driven interface agreements | Testing distributed services |
| `Rules/MutationTesting.md` | Does your test suite catch bugs? | Evaluating test suite quality |
| `Rules/PropertyBasedTesting.md` | Properties that hold for all inputs | Testing algorithms and pure functions |
| `Rules/TestDataBuilders.md` | Resilient test setup patterns | Reducing test maintenance cost |
| `Rules/SideEffectIsolation.md` | Separate pure logic from side effects | Tests require too many mocks |
| `Rules/AntiPatterns.md` | 7 common testing anti-patterns | Diagnosing test quality problems |

---

## Integration with Other Skills

TestDriven provides testing philosophy that complements language-specific coding skills:

| TestDriven provides | Pairs with | For |
|---------------------|-----------|-----|
| WHAT to test (principles) | `PythonCoding` | Python syntax and pytest patterns |
| WHAT to test (principles) | `CSharp` | C# syntax and xUnit/NUnit patterns |
| WHAT to test (principles) | `React` | React Testing Library patterns |
| Testing philosophy | `TypeScript` | TypeScript-specific type-safe testing |
| LLMTesting workflow | `Evals` | Model-graded evaluation and pass@k metrics |
| RedGreenRefactor | `Design` | Test-first design and API design |
| Mutation/Property testing | `Science` | Hypothesis-driven quality analysis |
| Anti-patterns | `RedTeam` | Adversarial test quality review |

**When writing tests:** Apply TestDriven principles first (WHAT to test), then language-specific skill patterns (HOW to write it).

---

## Authoritative Sources

| Source | Author | Year | Key Contribution |
|--------|--------|------|------------------|
| Test-Driven Development by Example | Kent Beck | 2002 | Red-Green-Refactor, behavior testing |
| Working Effectively with Legacy Code | Michael Feathers | 2004 | Characterization tests, seams |
| Clean Code, Chapter 9 | Robert C. Martin | 2008 | FIRST principles |
| TestPyramid | Martin Fowler | 2012 | Test distribution model |
| xUnit Test Patterns | Gerard Meszaros | 2007 | Test doubles, anti-patterns |
| QuickCheck | John Hughes | 1999 | Property-based testing |
| Growing Object-Oriented Software (GOOS) | Pryce & Freeman | 2009 | Test Data Builders, mock design |
| Consumer-Driven Contracts | Ian Robinson / Martin Fowler | 2011 | Contract testing approach |
| Boundaries | Gary Bernhardt | 2012 | Functional Core, Imperative Shell |
| Clean Architecture | Robert C. Martin | 2017 | Dependency rule, side effects at edges |
| Fault Diagnosis of Computer Programs | Richard Lipton | 1971 | Mutation testing theory |
