### Characterization Tests

**Source:** Michael Feathers, "Working Effectively with Legacy Code" (2004)

**Impact: HIGH (safe refactoring of legacy code)**

When you need to change code you don't fully understand, first capture its current behavior. Characterization tests don't verify correctness - they detect change. They're your safety net while refactoring legacy code.

---

## When to Use Characterization Tests

- Inheriting legacy code without tests
- Before large refactoring efforts
- When documentation is missing or outdated
- When the original developers are unavailable
- Before replacing a system (to ensure parity)

---

## Problem: Refactoring Without a Safety Net

```pseudocode
// 200 lines of legacy code, no tests, no documentation
function process_order(order):
    // Complex business logic accumulated over years
    // Some of it is obviously correct
    // Some of it handles edge cases you don't know about
    // Some of it might be bugs that customers now depend on

    // Changing anything could break unknown dependencies
    // How do you know if your refactoring changed behavior?
```

---

## Solution: Characterize Before Changing

### Step 1: Gather Realistic Inputs

```pseudocode
// Load from production logs or create representative samples
sample_orders = load_from_production_logs()

// Or manually create samples covering known scenarios
sample_orders = [
    Order(type="standard", total=100),
    Order(type="premium", total=500, member=true),
    Order(type="international", country="CA"),
    // ... more variations
]
```

### Step 2: Record Current Behavior

```pseudocode
for order in sample_orders:
    result = process_order(order)
    save_expected_result(order.id, result)  // Golden master
```

### Step 3: Create Characterization Test

```pseudocode
function test_process_order_characterization():
    sample_orders = load_sample_orders()

    for order in sample_orders:
        result = process_order(order)
        expected = load_expected_result(order.id)

        assert result == expected
```

### Step 4: Refactor With Confidence

```pseudocode
// Now you can refactor safely
// - If test passes: behavior preserved
// - If test fails: you changed behavior - investigate if intentional
```

### Step 5: Evolve to Behavioral Tests

```pseudocode
// As you understand the code, add semantic tests
function test_process_order_applies_member_discount():
    member_order = Order(customer_type="member", total=100)

    result = process_order(member_order)

    assert result.discount == 10  // Now you understand this rule
```

---

## Golden Master Technique

For complex output (reports, HTML, file formats), compare against a saved snapshot.

**Problem: Complex output is hard to test**

```pseudocode
function generate_monthly_report(data):
    // Returns 500-line formatted report
    // How do you test this?

function test_generate_report():
    result = generate_monthly_report(data)

    // Asserting on every line is unmaintainable
    assert result.line[0] == "Monthly Report - January 2024"
    assert result.line[1] == "================================"
    // ... 500 more assertions
```

**Solution: Golden master comparison**

```pseudocode
function test_monthly_report_golden_master():
    data = load_test_fixture("january_data")

    result = generate_monthly_report(data)

    golden = load_golden_master("january_report.txt")
    assert result == golden

// To update after intentional changes:
// 1. Review the diff carefully
// 2. If correct, save new output as golden master
// 3. Commit updated golden master
```

**Golden master workflow:**
1. Generate output with known input
2. Review output manually (or get stakeholder approval)
3. Save as golden master
4. Future tests compare against golden master
5. On failure: diff shows exactly what changed
6. Developer decides: bug or intentional change?

**Best practices for golden masters:**
- Use deterministic inputs (no random, no timestamps)
- Normalize output (sort collections, consistent formatting)
- Store in version control
- Include review step before accepting updates

---

## Evolving from Characterization to Behavioral Tests

Characterization tests are scaffolding, not permanent fixtures. As you understand the system, replace them with proper behavior tests.

**Problem: Keeping characterization tests forever**

```pseudocode
// Written 2 years ago when we inherited the code
function test_process_payment_characterization():
    inputs = load_all_fixtures()
    for input in inputs:
        result = process_payment(input)
        assert result == load_golden_master(input.id)

// Problems:
// - No one knows WHY certain behaviors exist
// - Golden masters may encode bugs
// - Hard to modify when requirements change
// - Test failures are cryptic ("output differs at line 47")
```

**Solution: Evolve to behavior tests**

```pseudocode
// After understanding the system, write proper tests

// Characterization revealed: member orders get 10% discount
function test_member_orders_receive_10_percent_discount():
    order = Order(customer_type="member", subtotal=100)

    result = process_payment(order)

    assert result.discount == 10
    assert result.total == 90

// Characterization revealed: orders over $500 require approval
function test_large_orders_require_approval():
    order = Order(subtotal=501)

    result = process_payment(order)

    assert result.status == "pending_approval"

// Now delete the characterization test - behavior is documented
```

---

## Transition Strategy

1. Keep characterization test as safety net
2. Write behavior test for one understood aspect
3. Verify both tests pass/fail together
4. Once confident, remove that case from characterization test
5. Repeat until characterization test is empty
6. Delete characterization test

---

## When to Replace vs Keep

**Replace when you understand:**
- You can explain WHY it behaves this way
- You can name the test after the intent, not the output
- Stakeholders have confirmed behavior is correct (not a bug)

**Keep when uncertain:**
- "I think it does this because..."
- "It must be for..."
- "Probably legacy from..."
- If you're guessing, keep the characterization test

---

## Important Caveats

| Reality | Implication |
|---------|-------------|
| Characterization tests may encode bugs as "expected" | They detect change, not correctness |
| They're temporary scaffolding | Replace as understanding grows |
| They don't explain WHY | Behavior tests document intent |
| Golden masters can be brittle | Normalize output, use realistic data |

---

## The Test Questions

1. **"Would I notice if this code's behavior changed subtly?"**
   - If no, add characterization tests

2. **"Do I understand this code well enough to explain WHY it behaves this way?"**
   - If no, keep characterization tests
   - If yes, write behavior tests

3. **"Is this a safety net or documentation?"**
   - Characterization = safety net (temporary)
   - Behavior test = documentation (permanent)
