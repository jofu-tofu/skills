# ReviewTests Workflow

> **Trigger:** "review tests", "test quality", "PR review", "audit tests"

Evaluate test quality for code review, audit, or improvement. Uses TestDriven principles to identify weak tests and suggest fixes.

## Reference Material

- **FIRST Principles:** `../Rules/FIRST.md`
- **Behavior Over Implementation:** `../Rules/BehaviorOverImplementation.md`
- **Test Pyramid:** `../Rules/TestPyramid.md`
- **Anti-Patterns:** `../Rules/AntiPatterns.md`

## When to Use

- Reviewing a PR that includes tests
- Auditing test quality for a codebase
- Evaluating test coverage gaps
- Improving existing test suites
- Deciding if tests are sufficient for merge

---

## Quick Checklist (2 minutes)

Run through these checks in order. Any "No" is a finding.

| # | Check | Question | Principle |
|---|-------|----------|-----------|
| 1 | FIRST | Fast, Independent, Repeatable, Self-Validating, Timely? | `Rules/FIRST.md` |
| 2 | Behavior | Tests verify WHAT, not HOW? | `Rules/BehaviorOverImplementation.md` |
| 3 | Pyramid | Many unit, fewer integration, even fewer E2E? | `Rules/TestPyramid.md` |
| 4 | Public API | Tests go through public interface only? | `Rules/BehaviorOverImplementation.md` |
| 5 | Mocking | Mocks only at system boundaries? | `Rules/BehaviorOverImplementation.md` |

---

## Detailed Review Process

### Step 1: FIRST Principles Check

Scan each test for FIRST violations:

**Fast:**
```pseudocode
// RED FLAG: Real I/O in unit test
function test_user_creation():
    db = connect_to_database()  // Slow!
    send_email(user)            // External call!

// GREEN FLAG: Test doubles
function test_user_creation():
    db = InMemoryDatabase()
    email = FakeEmailService()
```

**Independent:**
```pseudocode
// RED FLAG: Shared state between tests
global_user = None

function test_create_user():
    global_user = create_user()

function test_delete_user():
    delete_user(global_user)  // Depends on test above!

// GREEN FLAG: Each test has own setup
function test_delete_user():
    user = create_user()  // Own setup
    delete_user(user)
```

**Repeatable:**
```pseudocode
// RED FLAG: Non-deterministic
function test_random_selection():
    result = select_random_item()
    assert result in items  // Passes sometimes

// GREEN FLAG: Controlled randomness
function test_random_selection():
    rng = FakeRandom(seed=42)
    result = select_random_item(rng)
    assert result == expected_item
```

**Self-Validating:**
```pseudocode
// RED FLAG: Manual verification needed
function test_report_generation():
    report = generate_report()
    print(report)  // "Check that it looks right"

// GREEN FLAG: Explicit assertions
function test_report_generation():
    report = generate_report()
    assert "Summary" in report.sections
    assert report.total == 100
```

**Timely:**
- Were tests written before/with the code? (Check commit history)
- Or added after bugs were found? (Indicates missing TDD)

---

### Step 2: Behavior vs Implementation Check

**Red Flags - Testing Implementation:**

```pseudocode
// Asserting on method calls instead of outcomes
mock_service.process.assert_called_with(order)
mock_db.execute.assert_called_with("SELECT * FROM users WHERE active = 1")

// Accessing private state
assert obj._internal_cache == expected
assert obj._private_method() == value

// Verifying internal orchestration
assert step1.was_called_before(step2)
assert validator.calls == 3
```

**Green Flags - Testing Behavior:**

```pseudocode
// Asserting on observable outcomes
assert result.status == "success"
assert len(result.users) == 3
assert output_file.exists()

// Testing through public interface
assert service.get_active_users() == [alice, bob]
assert processor.process(order).total == 100
```

**Review Question:** "If the implementation were rewritten with a different algorithm, would this test still be valid?"

---

### Step 3: Test Pyramid Check

Count tests by type:

| Type | Healthy Ratio | Red Flag |
|------|---------------|----------|
| Unit | 70-80% | < 50% |
| Integration | 15-25% | > 40% |
| E2E | 5-10% | > 20% |

**Signs of Ice Cream Cone:**
- Test suite takes > 30 minutes
- "That test is flaky, re-run it"
- Most tests require full system running
- Developers skip local tests (too slow)

**Signs of Healthy Pyramid:**
- Unit tests run in seconds
- Integration tests run in 1-5 minutes
- E2E tests are few and focused on critical paths

---

### Step 4: Mocking Analysis

**Appropriate Mocking (Boundaries):**
- External HTTP APIs
- Databases (or in-memory versions)
- File system
- Time/clock
- Third-party services

**Inappropriate Mocking (Internals):**
- Classes you wrote
- Internal collaborators
- Helper functions
- Business logic components

```pseudocode
// RED FLAG: Mocking internal classes
function test_order_service():
    mock_validator = mock(OrderValidator)
    mock_calculator = mock(PriceCalculator)
    mock_formatter = mock(OrderFormatter)
    // Testing the orchestration, not the behavior

// GREEN FLAG: Real internals, mock boundaries
function test_order_service():
    db = InMemoryDatabase()
    email = FakeEmailService()  // External boundary
    service = OrderService(db, email)  // Real internals
```

---

### Step 5: Coverage Analysis

Coverage numbers without context are misleading. Evaluate:

| Metric | What It Means |
|--------|---------------|
| Line coverage | Which lines were executed (not whether tested well) |
| Branch coverage | Which decision paths were taken |
| Mutation coverage | Whether tests catch actual bugs |

**Better than coverage %:**
- Do tests fail when you break the code?
- Are edge cases explicitly covered?
- Are error paths tested?

---

## Red Flags to Call Out

| Red Flag | Problem | Fix |
|----------|---------|-----|
| `mock.assert_called_with(...)` | Testing implementation | Assert on outcomes |
| `obj._private_method()` | Breaking encapsulation | Test through public API |
| Tests named `test_1`, `test_2` | No documentation value | Descriptive names |
| Shared state between tests | Not independent | Each test owns setup |
| `// TODO: add assertion` | No real test | Add actual assertions |
| Flaky test (intermittent failures) | Not repeatable | Remove external dependencies |
| `print(result)` with no assert | Not self-validating | Add explicit assertions |
| 50+ lines of setup | Over-complicated | Simplify or use fixtures |
| Tests that never fail | May be useless | Mutation test to verify |

---

## Green Flags to Praise

| Green Flag | Why It's Good |
|------------|---------------|
| Test name describes scenario + outcome | Self-documenting |
| Arrange/Act/Assert structure | Clear, readable |
| One concept per test | Focused, debuggable |
| Test uses real implementations | Less coupling |
| Edge cases explicitly covered | Thorough |
| Error paths tested | Robust |
| Fast test suite | Developers run it |

---

## Output Format

When reviewing tests, produce:

```
## Test Review: [PR/File Name]

**Overall Assessment:** [PASS | NEEDS WORK | MAJOR ISSUES]

**FIRST Principles:**
- [ ] Fast: [status]
- [ ] Independent: [status]
- [ ] Repeatable: [status]
- [ ] Self-Validating: [status]
- [ ] Timely: [status]

**Behavior vs Implementation:**
- [x] Tests behavior: [list of good tests]
- [ ] Tests implementation: [list with specific issues]

**Test Pyramid:**
- Unit: X tests
- Integration: X tests
- E2E: X tests
- Assessment: [Healthy | Ice Cream Cone | Needs rebalancing]

**Red Flags Found:**
1. [specific issue] in [file:line] → [suggested fix]
2. [specific issue] in [file:line] → [suggested fix]

**Green Flags (Good Practices):**
1. [good pattern] in [file:line]

**Recommendations:**
1. [actionable recommendation]
2. [actionable recommendation]

**Principles Applied:**
- Rules/FIRST.md
- Rules/BehaviorOverImplementation.md
- Rules/TestPyramid.md
```

---

## Review Severity Levels

| Severity | Criteria | Action |
|----------|----------|--------|
| **Blocker** | Tests will break on any refactoring, tests don't actually test anything | Must fix before merge |
| **Major** | Implementation coupling, FIRST violations, ice cream cone | Should fix before merge |
| **Minor** | Naming, structure, missing edge cases | Can fix in follow-up |
| **Suggestion** | Style, additional coverage | Optional improvement |

---

## Related Principles

- `Rules/FIRST.md` - Individual test quality
- `Rules/BehaviorOverImplementation.md` - What to test
- `Rules/TestPyramid.md` - Test distribution
- `Workflows/DiagnoseTest.md` - Fixing specific test issues
