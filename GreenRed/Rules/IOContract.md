### The IO Contract Principle

**Source:** Kent Beck (TDD by Example, 2002), Michael Feathers (Working Effectively with Legacy Code, 2004), Martin Fowler (contract testing, 2011), Robert C. Martin (ATDD methodology)

**Impact: CRITICAL** — Tests coupled to implementation break on every refactor, producing false failures and eroding trust in the test suite.

---

## The Rule

A test should only know about **inputs, outputs, errors, and observable side effects**. Everything else is implementation detail.

---

## What IS Part of the IO Contract

These are the things tests should assert on:

- **Inputs:** Arguments passed to the function/method/endpoint
- **Outputs:** Return values, response bodies, emitted events
- **Errors:** Exceptions thrown, error codes returned, rejection reasons
- **Observable side effects:** Database records created, files written, HTTP calls made to external services, events published to a queue

## What is NOT Part of the IO Contract

These are implementation details — tests should never reference them:

- Internal variable names or data structures
- Algorithm choice (sorting method, search strategy, caching approach)
- Internal method call order
- Private/unexported helper functions
- Internal state that callers cannot observe
- Logging, metrics, or internal diagnostics
- How many times an internal method was called

---

## The Refactoring Test

Ask: **"Would this test pass if the internals were completely rewritten?"**

If someone replaced the implementation with a different algorithm, different data structures, different internal helpers — but kept the same inputs/outputs/errors — would the test still pass?

- **Yes** → The test is testing the IO contract. Keep it.
- **No** → The test is coupled to implementation. Rewrite it.

---

## Problem: Implementation-Coupled Test

```pseudocode
// Tests HOW the function works internally
test "calculates total with tax":
    calculator = mock()
    calculator.multiply.returns(10.80)
    service = PriceService(calculator)

    service.get_total(item)

    // Coupled to: internal method name, call order, exact operation
    assert calculator.multiply.called_with(10.00, 1.08)
```

This test breaks if you:
- Rename the internal method
- Change the tax calculation approach
- Add caching
- Use a different math library

## Solution: Behavior-Focused Test

```pseudocode
// Tests WHAT the function produces
test "total includes 8% tax":
    service = PriceService()

    total = service.get_total(item_priced_at(10.00), tax_rate=0.08)

    assert total == 10.80
```

This test survives: method renames, algorithm changes, caching layers, library swaps, internal refactoring of any kind.

---

## Domain Language Rule

Test names describe behavior in user/business terms, not technical terms.

```pseudocode
// BAD: Technical
test "should throw InvalidArgumentError when string length exceeds 255"

// GOOD: Domain
test "should reject usernames longer than 255 characters"
```

The test name should make sense to someone who knows the product but not the codebase.

---

## The Naive Implementation Check

After writing tests, ask: **"Would a hardcoded return value pass all my tests?"**

```pseudocode
// If this passes all your tests, your tests are incomplete:
function get_active_users():
    return [{ name: "Alice", active: true }]
```

If a trivially wrong implementation passes, add more tests:
- Different inputs producing different outputs
- Edge cases (empty, boundary, overflow)
- Error conditions
- Multiple calls with varying state

---

## Nondeterministic Behavior

When behavior depends on time, randomness, I/O, or external state:

- **Prefer injectable seams:** Pass clocks, RNG seeds, or service clients as parameters so tests can control them
- **Use recorded fixtures:** For external API responses, capture real responses and replay them
- **Use range assertions:** When exact values are unstable, assert on properties ("result is positive", "list is sorted", "timestamp is within last 5 seconds")
- **Last resort:** If behavior is inherently unstable with no clean seam, skip that specific assertion and document why — a missing assertion is better than a flaky test

---

## The Test Questions

1. Does this test call through the public API, or does it reach into internals?
2. If I rewrote the implementation from scratch, would this test still pass?
3. Does the test name describe behavior a user would recognize?

---

## Design Signal: When Testing Is Hard

If testing a function requires elaborate mock setups, the problem is usually the code, not the test. Functions that mix decisions with side effects force you to mock everything just to reach the logic.

**The pattern:** Extract decisions into pure functions (data in, result out, no I/O). Pure functions have clear IO contracts by definition — they are trivially testable without any mocks.

```pseudocode
// HARD TO TEST: logic tangled with I/O
function process_refund(order_id):
    order = db.get(order_id)                    // side effect
    if order.total > 50 and order.age_days < 30:  // decision
        refund = order.total * 0.9                // decision
    else:
        refund = 0                                // decision
    db.save_refund(order_id, refund)             // side effect
    return refund

// EASY TO TEST: decision extracted as pure function
function calculate_refund(total, age_days, threshold=50, window=30, rate=0.9):
    if total > threshold and age_days < window:
        return total * rate
    return 0

// Tests are trivial — no mocks, no setup
test "full refund for recent high-value order":
    assert calculate_refund(100, 5) == 90

test "no refund for old order":
    assert calculate_refund(100, 60) == 0
```

When you encounter a function that is hard to test against its IO contract, ask: "What decision is this function making, and can I extract that decision as a pure function?"
