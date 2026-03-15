### Side-Effect Isolation

**Source:** Gary Bernhardt, "Boundaries" (RubyConf 2012); Michael Feathers, "Working Effectively with Legacy Code" (2004); Robert C. Martin, "Clean Architecture" (2017)

**Impact: CRITICAL (code that is structurally easy to test vs code that fights you at every assertion)**

If testing a function requires extensive mocking, the problem is not your tests — it is your code. Code that mixes decisions with side effects is structurally hard to test regardless of technique. Separate pure logic from side-effectful I/O, and testing becomes trivial.

---

## The Core Principle

**Functional Core, Imperative Shell:** Push side effects to the edges. Keep core logic as pure functions — deterministic output from inputs, no hidden dependencies, no mutations.

```
┌────────────────────────────────────┐
│         Imperative Shell           │  Reads files, calls APIs, queries DB
│  (thin, side-effectful, hard to    │  Passes data INTO the core
│   unit test — integration-test it) │  Takes results OUT to the world
│                                    │
│   ┌────────────────────────────┐   │
│   │     Functional Core        │   │  Pure functions
│   │  (no side effects, easy    │   │  Data in → data out
│   │   to unit test, no mocks)  │   │  Trivially testable
│   └────────────────────────────┘   │
│                                    │
└────────────────────────────────────┘
```

Pure functions are trivially testable because:
- Given the same inputs, they always return the same output
- They don't read from or write to external state
- They don't need mocks — there is nothing to mock
- They are fast, independent, and repeatable (FIRST by default)

---

## Problem: Logic Tangled with Side Effects

```pseudocode
// This function DECIDES and DOES in the same place
function process_order(order_id):
    order = database.get(order_id)          // side effect: DB read
    if order.total > 100:
        discount = order.total * 0.1        // pure logic
    else:
        discount = 0                        // pure logic
    order.total = order.total - discount    // pure logic
    database.save(order)                    // side effect: DB write
    email_service.send(order.customer,      // side effect: email
        "Your order total is " + order.total)
    return order

// Testing this requires mocking everything
function test_process_order():
    db = mock()
    db.get.returns(Order(total=150))
    email = mock()
    service = OrderService(db, email)

    service.process_order("order-1")

    // Assertions coupled to implementation wiring
    assert db.save.was_called()
    assert email.send.was_called()
    // Hard to verify the LOGIC (discount calculation) in isolation
```

**What's wrong:**
- Business logic (discount calculation) is trapped inside I/O operations
- Testing the discount rule requires setting up DB mocks and email mocks
- Adding a new side effect (logging, analytics) forces test rewrites
- The test verifies wiring, not decisions

---

## Solution: Separate Decisions from Effects

```pseudocode
// PURE FUNCTION: decides, doesn't do
function calculate_order_result(order, discount_threshold=100, discount_rate=0.1):
    if order.total > discount_threshold:
        discount = order.total * discount_rate
    else:
        discount = 0
    return OrderResult(
        total = order.total - discount,
        discount = discount,
        message = "Your order total is " + (order.total - discount)
    )

// IMPERATIVE SHELL: does, doesn't decide
function process_order(order_id):
    order = database.get(order_id)
    result = calculate_order_result(order)    // pure call
    order.total = result.total
    database.save(order)
    email_service.send(order.customer, result.message)
    return order

// Testing the LOGIC is trivial — no mocks needed
function test_discount_applied_over_threshold():
    order = Order(total=150)

    result = calculate_order_result(order)

    assert result.discount == 15
    assert result.total == 135

function test_no_discount_under_threshold():
    order = Order(total=50)

    result = calculate_order_result(order)

    assert result.discount == 0
    assert result.total == 50
```

**What's better:**
- Business logic is tested without any mocks, stubs, or fakes
- Tests are fast, deterministic, and independent
- Adding side effects to the shell doesn't break logic tests
- The shell is thin enough to verify through integration tests

---

## The Design Signal

**Needing lots of mocks is a code smell, not a test problem.** When you find yourself constructing elaborate mock setups to test a function, stop. The function is doing too much. It is mixing decisions with effects.

| Signal | Diagnosis | Action |
|--------|-----------|--------|
| 3+ mocks to test one function | Logic tangled with I/O | Extract pure function for the decision |
| Mock setup longer than test body | Too many dependencies | Push dependencies to the caller |
| Test breaks when adding a new side effect | Logic and effects coupled | Separate core from shell |
| Can't test without a database/network | Side effects in the critical path | Make the function take data, not fetch it |

---

## The Refactoring Pattern

When you encounter hard-to-test code, apply this extraction:

1. **Identify the decision.** What is the function actually deciding? (discount amount, validation result, next state, formatted output)
2. **Extract it as a pure function.** Inputs in, result out. No I/O, no state mutation, no dependency injection needed.
3. **Leave the shell as a thin coordinator.** It reads data, calls the pure function, writes results. The shell is boring — that's the point.
4. **Test the core exhaustively** (unit tests, property-based tests, edge cases). Test the shell lightly (integration test that the wiring works).

---

## When This Applies

Not all code needs this separation. Use it when:

- A function has business logic AND side effects in the same body
- Testing requires mocking internal collaborators (not just system boundaries)
- You want to test edge cases and boundary conditions but can't without complex setup
- The same logic needs to work in different contexts (CLI, web, batch)

Don't force it when:
- The function is already a thin pass-through (just I/O, no logic)
- The logic is trivial (one-liner with no branching)
- You're writing an integration test that intentionally covers the full path

---

## Relationship to Other Principles

| Principle | Connection |
|-----------|------------|
| **Behavior Over Implementation** | Side-effect isolation makes behavioral tests natural — pure functions have clear input/output contracts |
| **Mock at Boundaries** | When logic is pure, mocks are only needed at the shell level (system boundaries) — exactly where they belong |
| **FIRST** | Pure functions produce tests that are Fast, Independent, Repeatable, Self-validating by default |
| **Test Pyramid** | More pure functions = more unit-testable code = healthier pyramid shape |
| **Over-Mocked Tests** (anti-pattern) | The structural fix for over-mocking — extract logic so mocks aren't needed |

---

## The Test Questions

1. **"Could I test this function's logic without any mocks?"**
   - If no, the function likely mixes decisions with effects

2. **"If I removed all I/O from this function, what decision would remain?"**
   - That decision is the pure function waiting to be extracted

3. **"Is my test setup (mocks, fakes, fixtures) longer than the actual assertion?"**
   - If yes, the code under test is doing too much — separate core from shell
