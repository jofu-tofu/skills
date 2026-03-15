# AIValidation Workflow

> **Trigger:** "AI refactored", "AI generated", "validate AI", "copilot", "claude refactored"

Validate AI-refactored code and AI-generated tests. Ensures AI changes preserve behavior and AI tests actually catch regressions.

## Reference Material

- **Behavior Over Implementation:** `../Rules/BehaviorOverImplementation.md`
- **Characterization Tests:** `../Rules/CharacterizationTests.md`
- **FIRST Principles:** `../Rules/FIRST.md`

## When to Use

- AI (Claude, Copilot, etc.) refactored your code
- AI generated tests for you
- Verifying AI changes haven't broken behavior
- Reviewing AI-assisted code before merge
- Deciding whether to trust AI-generated test coverage

---

## Part 1: Validating AI-Refactored Code

### The Risk

AI may change implementation in ways that subtly alter behavior. Existing tests that pass don't guarantee correctness if those tests are weak (implementation-coupled).

**Dangerous pattern:**
```
1. Code has tests that pass
2. AI refactors the code
3. Tests still pass
4. But tests were testing HOW, not WHAT
5. Behavior actually changed - tests didn't catch it
```

### Validation Process

#### Step 1: Assess Existing Test Quality

Before trusting AI refactoring, evaluate the tests:

```pseudocode
// Check: Do tests assert on behavior or implementation?

// WEAK (implementation-coupled) - AI refactor might silently break behavior
function test_get_users():
    mock_db = mock()
    mock_db.execute.returns([user])
    service.get_users()
    assert mock_db.execute.was_called_with("SELECT * FROM users")

// STRONG (behavior-focused) - Would catch behavior changes
function test_get_users():
    db.insert(User("alice", active=true))
    db.insert(User("bob", active=false))
    result = service.get_active_users()
    assert result == [alice]
```

**Quick Assessment:**
- Do tests mock internal classes? → Weak
- Do tests assert on method calls? → Weak
- Do tests assert on observable outcomes? → Strong

#### Step 2: Add Characterization Tests If Needed

If existing tests are weak, add characterization tests BEFORE trusting the refactor:

```pseudocode
// Capture current behavior with known inputs
function test_characterization_before_ai_refactor():
    // Use realistic production-like data
    inputs = [
        {"type": "standard", "amount": 100},
        {"type": "premium", "amount": 500},
        {"type": "edge", "amount": 0}
    ]

    for input in inputs:
        result = process(input)
        save_snapshot(input, result)

// After AI refactor, compare
function test_behavior_preserved_after_ai_refactor():
    for input, expected in load_snapshots():
        result = process(input)
        assert result == expected, f"Behavior changed for {input}"
```

#### Step 3: Run Behavioral Assertions

Focus on end-state verification:

```pseudocode
// BEFORE AI refactor - record behavior
original_service = OriginalService()
original_result = original_service.calculate(test_input)

// AFTER AI refactor - compare behavior
refactored_service = RefactoredService()
refactored_result = refactored_service.calculate(test_input)

// Behavioral comparison
assert refactored_result == original_result
assert refactored_result.side_effects == original_result.side_effects
```

### AI-Refactored Code Checklist

- [ ] Existing tests verify behavior, not implementation
- [ ] If tests are weak, characterization tests added first
- [ ] Edge cases have explicit coverage
- [ ] Error handling behavior preserved
- [ ] Side effects (files, database, events) verified
- [ ] Performance characteristics acceptable

### Decision Matrix

| Test Quality | AI Refactor Action |
|--------------|-------------------|
| Strong behavioral tests | Trust the refactor if tests pass |
| Weak implementation-coupled tests | Add characterization tests first |
| No tests | Add characterization tests first |
| Mixed quality | Add tests for uncovered behavior |

---

## Part 2: Validating AI-Generated Tests

### The Risk

AI may write tests that:
- Pass but don't catch regressions
- Are coupled to current implementation
- Miss edge cases
- Have incorrect assertions
- Test the obvious but miss the important

### Validation Process

#### Step 1: The Mutation Test

**The ultimate test of a test:** Does it fail when you break the code?

```pseudocode
// AI generated this test
function test_calculate_discount():
    result = calculate_discount(100, "SAVE10")
    assert result == 90

// MUTATION: Introduce a bug
function calculate_discount(amount, code):
    // Original: return amount * 0.9
    return amount * 0.8  // Bug: wrong discount

// Does the test catch it?
// If test still passes → test is useless
// If test fails → test has value
```

**Manual mutation testing:**
1. Change a return value
2. Remove a condition
3. Swap a comparison operator
4. Does the AI test fail? If not, it's weak.

#### Step 2: Implementation Coupling Check

**Red flags in AI-generated tests:**

```pseudocode
// AI often generates tests like this:
function test_process_order():
    mock_validator = mock()
    mock_calculator = mock()
    mock_notifier = mock()

    service = OrderService(mock_validator, mock_calculator, mock_notifier)
    service.process(order)

    // Testing the wiring, not the behavior
    assert mock_validator.validate.called_with(order)
    assert mock_calculator.calculate.called_with(order)
    assert mock_notifier.notify.called_once()
```

**What it should be:**

```pseudocode
function test_process_order_calculates_total_and_notifies():
    db = TestDatabase()
    notifications = FakeNotificationService()
    service = OrderService(db, notifications)

    result = service.process(order_with_items([item_50, item_30]))

    assert result.total == 80
    assert db.find_order(result.id).status == "processed"
    assert notifications.last_sent.order_id == result.id
```

#### Step 3: Edge Case Coverage

AI often tests the happy path but misses edges:

```pseudocode
// AI generated: Happy path only
function test_divide():
    assert divide(10, 2) == 5

// Missing: What about edge cases?
// - divide(10, 0) → should raise error
// - divide(0, 5) → should return 0
// - divide(-10, 2) → should return -5
// - divide(10, -2) → should return -5
```

**Checklist for edge cases:**
- [ ] Empty/null inputs
- [ ] Zero values
- [ ] Negative values
- [ ] Boundary values (max, min)
- [ ] Invalid inputs
- [ ] Error conditions

#### Step 4: FIRST Principles Check

AI-generated tests often violate FIRST:

| Principle | Common AI Violation |
|-----------|-------------------|
| Fast | Uses real external services |
| Independent | Shares state between tests |
| Repeatable | Uses current time, random values |
| Self-Validating | Prints output instead of asserting |
| Timely | Generated after code (tests verify implementation) |

### AI-Generated Test Checklist

- [ ] Test fails when code is broken (mutation test)
- [ ] Test asserts on behavior, not method calls
- [ ] Test is independent (no shared state)
- [ ] Edge cases covered
- [ ] Error paths tested
- [ ] Test name describes scenario + expected outcome
- [ ] No implementation coupling (mocking internals)

---

## Decision Matrix

| Situation | Verdict | Action |
|-----------|---------|--------|
| AI refactored, strong behavioral tests pass | TRUST | Merge with confidence |
| AI refactored, weak tests pass | DISTRUST | Add characterization tests, re-evaluate |
| AI refactored, tests fail | INVESTIGATE | May be behavior change or test was implementation-coupled |
| AI generated tests, pass mutation test | USEFUL | Accept the tests |
| AI generated tests, fail mutation test | USELESS | Rewrite tests to verify behavior |
| AI generated tests, implementation-coupled | REWRITE | Convert to behavioral tests |
| AI generated tests, missing edge cases | ENHANCE | Add edge case coverage |

---

## Output Format

When validating AI work, produce:

```
## AI Validation Report

**Type:** [AI Refactored Code | AI Generated Tests | Both]

### Part 1: Code Refactoring (if applicable)

**Existing Test Assessment:**
- Test quality: [Strong | Weak | None]
- Implementation coupling: [Yes | No]
- Recommendation: [Trust | Add characterization tests first]

**Characterization Tests Added:** [Yes | No | N/A]

**Behavioral Verification:**
- [ ] Edge cases covered
- [ ] Error handling preserved
- [ ] Side effects verified

**Verdict:** [TRUST | NEEDS MORE TESTING | REJECT]

### Part 2: Generated Tests (if applicable)

**Mutation Test Results:**
- Tests that caught mutations: X/Y
- Tests that missed mutations: [list]

**Implementation Coupling:**
- [ ] Mocks at boundaries only
- [ ] Asserts on behavior, not calls
- [ ] No private state access

**Coverage Assessment:**
- Happy path: [Covered | Missing]
- Edge cases: [Covered | Missing: list]
- Error paths: [Covered | Missing: list]

**FIRST Principles:**
- [ ] Fast
- [ ] Independent
- [ ] Repeatable
- [ ] Self-Validating
- [ ] Timely

**Verdict:** [ACCEPT | REWRITE | ENHANCE]

### Recommendations

1. [Specific action]
2. [Specific action]
```

---

## Related Principles

- `Rules/BehaviorOverImplementation.md` - Core principle for both parts
- `Rules/CharacterizationTests.md` - For capturing behavior before trusting AI refactors
- `Rules/FIRST.md` - For evaluating AI-generated test quality
- `Workflows/ReviewTests.md` - Detailed test review process
