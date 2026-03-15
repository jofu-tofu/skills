# Property-Based Testing

**Source:** John Hughes, "QuickCheck: A Lightweight Tool for Random Testing of Haskell Programs" (1999) / Hypothesis (Python) / fast-check (JS/TS) / jqwik (Java)

**Impact: High** — Finds edge cases you would never think to write. Especially powerful for algorithms, data transformations, and domain logic.

---

## The Problem

Example-based testing has a fundamental blind spot: you can only test scenarios you can imagine.

```pseudocode
// You test these cases:
test_sort([3, 1, 2])   → [1, 2, 3] ✓
test_sort([1])         → [1] ✓
test_sort([])          → [] ✓

// You don't think to test:
test_sort([1, 1, 1])   // duplicates
test_sort([-1, 0, 1])  // negatives and zero together
test_sort([MAX_INT, MIN_INT]) // integer overflow on comparison
```

Property-based testing generates hundreds of random inputs and finds the cases you missed.

---

## What Is a Property?

A property is a statement about code that should be true for **all** valid inputs:

```pseudocode
// Property: sort is idempotent (sorting twice = sorting once)
for all lists L:
    sort(sort(L)) == sort(L)

// Property: sort preserves length
for all lists L:
    len(sort(L)) == len(L)

// Property: sort output is ordered
for all lists L, all adjacent pairs (a, b) in sort(L):
    a <= b
```

These are "properties" — invariants that must hold regardless of input.

---

## The Test Question

*"What must be true about the OUTPUT regardless of what the INPUT is?"*

If you can answer this, you have a property to test.

---

## Common Property Patterns

### Roundtrip (encode/decode pairs)
```pseudocode
// Serialize → Deserialize → get original
for all data D:
    deserialize(serialize(D)) == D
```

### Commutativity
```pseudocode
// Order doesn't matter
for all (a, b):
    add(a, b) == add(b, a)
```

### Idempotence
```pseudocode
// Applying twice = applying once
for all X:
    f(f(X)) == f(X)
```

### Oracle Comparison (slow correct vs. fast optimized)
```pseudocode
// New fast algorithm should match old slow correct one
for all inputs I:
    fast_sort(I) == reference_sort(I)
```

### Invariant Preservation
```pseudocode
// Operation preserves a constraint
for all accounts A, amounts M:
    after(A.withdraw(M)):
        if M <= A.balance: A.balance >= 0
        else: exception raised
```

---

## Example: Property Test for a Discount Calculator

```pseudocode
// Example-based: tests a few cases
test_discount():
    assert calculate_price(100, 0.1) == 90
    assert calculate_price(50, 0.5) == 25

// Property-based: tests structural guarantees
property_test_discount():
    for all (price >= 0, discount in [0, 1]):
        result = calculate_price(price, discount)
        // Properties that must ALWAYS hold:
        assert result >= 0                    // never negative
        assert result <= price                // never more than original
        assert result == price * (1 - discount) // mathematically correct
```

---

## Shrinking: Why PBT Failures Are Useful

When property testing finds a failing input, it automatically "shrinks" it to the minimal failing case:

```
Found failing: [3, 17, -4, 0, 999, 2, -1]
Shrunk to:     [-1, 0]
// Minimal reproduction — much easier to debug
```

---

## When to Use Property-Based Testing

| Great fit | Poor fit |
|-----------|---------|
| Algorithms with mathematical properties | UI rendering |
| Serialization / encoding | Workflows with side effects |
| Pure functions | Stateful multi-step processes |
| Data validation | Interactions with external services |
| Domain invariants | Tests requiring specific scenarios |

---

## Tools

| Language | Tool |
|----------|------|
| Python | Hypothesis |
| JavaScript/TypeScript | fast-check |
| Java | jqwik, QuickTheories |
| Haskell | QuickCheck (original) |
| Scala | ScalaCheck |
| .NET | FsCheck |
| Go | gopter, rapid |

---

## Relationship to Other Principles

- **Complements example-based tests** — PBT finds cases you can't imagine; examples document specific behaviors
- **Complements mutation testing** (`Rules/MutationTesting.md`) — Mutation tests your test assertions; PBT generates inputs to exercise code paths
- **Pairs with FIRST** (`Rules/FIRST.md`) — Properties must be Repeatable; use seeded generators for determinism in CI

---

## Related

- `Rules/MutationTesting.md` — Verify your properties actually catch mutations
- `Workflows/MutationTesting.md` — Use mutation testing to validate PBT properties are strong
