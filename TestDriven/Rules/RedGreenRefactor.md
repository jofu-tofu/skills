### Red-Green-Refactor

**Source:** Kent Beck, "Test-Driven Development by Example" (2002)

**Impact: CRITICAL (foundation of test-driven development)**

The fundamental TDD rhythm: write a failing test (red), make it pass with minimal code (green), then improve the design (refactor). This cycle ensures tests drive design and every line of production code exists because a test required it.

---

## The Cycle

```
    ┌─────────────┐
    │   1. RED    │  Write a failing test
    │  (failing)  │  that defines expected behavior
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  2. GREEN   │  Write minimal code
    │  (passing)  │  to make the test pass
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ 3. REFACTOR │  Improve design
    │  (still     │  while keeping tests green
    │   passing)  │
    └──────┬──────┘
           │
           └──────► Back to RED
```

---

## Problem: Writing Tests After Code

```pseudocode
// Code written first, tests bolted on after
function calculate_discount(order):
    // Complex logic written without test guidance
    if order.total > 100:
        if order.customer.is_premium:
            return order.total * 0.2
        return order.total * 0.1
    return 0

// Tests written after - often miss edge cases
// and tend to test the implementation that exists
function test_calculate_discount():
    assert calculate_discount(order_101) == 10.1  // Just verifies what code does
```

**What's wrong:**
- Tests written after code tend to verify implementation, not requirements
- Edge cases discovered by bugs in production
- Tests can't guide design - design already exists
- No proof the test can fail (might always pass due to bug)

---

## Solution: Red-Green-Refactor in Action

### Step 1: RED - Write Failing Test First

```pseudocode
// Define expected behavior BEFORE implementation
function test_no_discount_under_100():
    order = Order(total=99)

    result = calculate_discount(order)

    assert result == 0  // FAILS - function doesn't exist yet
```

The test fails. This is correct. It proves:
- The test can actually fail
- We know what behavior we're implementing

### Step 2: GREEN - Make It Pass

```pseudocode
// Write the MINIMUM code to pass
function calculate_discount(order):
    return 0  // Passes first test

// Now test the next behavior
function test_10_percent_over_100():
    order = Order(total=150)

    result = calculate_discount(order)

    assert result == 15  // FAILS

// Extend implementation
function calculate_discount(order):
    if order.total > 100:
        return order.total * 0.1
    return 0  // Now both tests pass
```

### Step 3: REFACTOR - Improve While Green

```pseudocode
// After tests pass, improve the design
// Tests give you confidence to refactor aggressively

BEFORE:
function calculate_discount(order):
    if order.total > 100:
        if order.customer.is_premium:
            return order.total * 0.2
        return order.total * 0.1
    return 0

AFTER (refactored, tests still pass):
function calculate_discount(order):
    if order.total <= 100:
        return 0

    base_discount = 0.1
    premium_bonus = 0.1 if order.customer.is_premium else 0

    return order.total * (base_discount + premium_bonus)
```

**Key refactoring goals:**
- **Isolate side effects.** Push I/O to the edges and keep core logic as pure functions. If a function both decides and does, extract the decision into a pure function that takes data and returns a result. The shell coordinates I/O; the core computes. Pure functions are trivially testable — no mocks needed. (See `Rules/SideEffectIsolation.md`)
- **Remove duplication.** Extract shared logic, apply DRY within the tested unit.
- **Clarify intent.** Rename, restructure, simplify — guided by the tests you just wrote.

---

## The Goal: Clean Code That Works

Kent Beck's summary of TDD's goal. TDD isn't just about testing - it's a design methodology that produces code which is both:
- **Correct** (works) - tests prove it
- **Maintainable** (clean) - refactor step ensures it

**The refactor step is NOT optional.** "Green" code is often ugly - you wrote the fastest thing that works. Without refactoring, technical debt accumulates.

---

## Why Failing-First Matters

| Without Failing First | With Failing First |
|----------------------|-------------------|
| Test might always pass (bug in test) | Proves test can fail |
| No proof code is needed | Each line exists for a reason |
| Tests verify implementation | Tests verify requirements |
| Design already locked in | Tests guide design |

---

## Common Mistakes

### Mistake 1: Skipping Red

```pseudocode
// Writing test after code
function calculate_tax(amount):
    return amount * 0.08

// Test written after - can't know if it CAN fail
function test_tax():
    assert calculate_tax(100) == 8
    // This always passes - but would it catch bugs?
```

### Mistake 2: Skipping Refactor

```pseudocode
// Test passes, move on immediately
function process_payment(order, card):
    // First test made it pass
    if card.type == "visa":
        // Second test made it pass
        if order.total > 1000:
            // Third test made it pass
            if order.customer.verified:
                // ... 50 more nested conditions
                // Never refactored, accumulated mess
```

### Mistake 3: Writing Too Much Code at Green

```pseudocode
// Test asks for: reject empty orders
function test_rejects_empty_orders():
    order = Order(items=[])
    assert process_order(order).error == "Empty order"

// WRONG: Writing more than needed
function process_order(order):
    if len(order.items) == 0:
        return Error("Empty order")
    if order.total > 10000:        // Not tested yet!
        return Error("Limit exceeded")
    // ... more unneeded code

// RIGHT: Just enough to pass
function process_order(order):
    if len(order.items) == 0:
        return Error("Empty order")
    return Success()  // Minimal
```

---

## The TDD Rhythm in Practice

```
1. Think: What behavior do I need next?
2. RED: Write a test that fails (proves behavior missing)
3. GREEN: Write minimum code to pass (no more)
4. REFACTOR: Clean up while green (improve design)
5. Repeat
```

---

## The Test Questions

1. **"Did I write my test before the code it tests?"**
   - If no, you're not doing TDD

2. **"Did the test fail first?"**
   - If not, how do you know it can fail?

3. **"After making it green, did I look for design improvements?"**
   - If not, you're accumulating technical debt

4. **"Did I write more code than the test required?"**
   - If yes, you're guessing at requirements
