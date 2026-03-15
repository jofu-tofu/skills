### FIRST Principles

**Source:** Robert C. Martin, "Clean Code" (2008), Chapter 9

**Impact: HIGH (individual test quality)**

The FIRST acronym defines what makes a good unit test. Tests that violate FIRST principles become maintenance burdens and provide false confidence.

**The Acronym:**

| Letter | Principle | What It Means |
|--------|-----------|---------------|
| **F** | Fast | Tests run in milliseconds so developers run them constantly |
| **I** | Independent | Tests don't depend on each other; run in any order |
| **R** | Repeatable | Same result in any environment, every time |
| **S** | Self-Validating | Pass or fail with no manual interpretation needed |
| **T** | Timely | Written before or with the code, not as afterthought |

---

**Problem: Tests that violate FIRST**

```pseudocode
// SLOW - Takes 30 seconds, developers skip it
function test_user_registration_slow():
    browser = launch_real_browser()
    browser.navigate_to("/register")
    browser.fill_form(user_data)
    browser.click("submit")
    wait_for_email(30_seconds)  // Slow!
    verify_email_received()

// NOT INDEPENDENT - Test B depends on Test A
function test_A_create_order():
    global order_id = create_order()  // Sets global state

function test_B_cancel_order():
    cancel_order(order_id)  // Fails if test A didn't run first

// NOT REPEATABLE - Random failures
function test_concurrent_users():
    result = simulate_100_users()  // Sometimes passes, sometimes fails
    assert result.success_rate > 0.95

// NOT SELF-VALIDATING - Requires human inspection
function test_report_generation():
    report = generate_report()
    print(report)  // "Check that it looks right"

// NOT TIMELY - Written after bugs found in production
function test_edge_case_discovered_in_prod():
    // Added 6 months after feature shipped
    // After customers reported bugs
```

---

**Solution: FIRST-compliant tests**

```pseudocode
// FAST - Milliseconds, uses test doubles
function test_user_registration_fast():
    email_service = FakeEmailService()
    user_service = UserService(email_service)

    result = user_service.register(valid_user_data)

    assert result.success == true
    assert email_service.sent_to == valid_user_data.email

// INDEPENDENT - Each test sets up its own state
function test_create_order():
    service = OrderService(fresh_test_db())

    order = service.create(order_data)

    assert order.id is not None

function test_cancel_order():
    service = OrderService(fresh_test_db())
    order = service.create(order_data)  // Own setup

    result = service.cancel(order.id)

    assert result.status == "cancelled"

// REPEATABLE - Deterministic, no external dependencies
function test_concurrent_logic():
    // Test the logic, not actual concurrency
    queue = TaskQueue()
    queue.add(task_1)
    queue.add(task_2)

    results = queue.process_all()

    assert all(r.success for r in results)

// SELF-VALIDATING - Clear pass/fail
function test_report_contains_required_sections():
    report = generate_report(sample_data)

    assert "Summary" in report.sections
    assert "Details" in report.sections
    assert report.total == expected_total

// TIMELY - Written with the feature
function test_new_feature_edge_case():
    // Written BEFORE implementing the feature
    // Defines expected behavior upfront
    result = process(edge_case_input)

    assert result.handled_gracefully == true
```

---

**The Test Question:**

> "Is this test Fast, Independent, Repeatable, Self-Validating, and Timely?"

If any letter fails, refactor the test.

---

**Tests as Living Documentation**

When tests follow FIRST, they become executable specifications. A new team member can read tests to understand system behavior. Unlike written docs, tests can't lie - they're executed.

```pseudocode
// Good: Test name documents behavior
function test_expired_coupons_are_rejected():
    coupon = create_coupon(expires=yesterday)

    result = apply_coupon(order, coupon)

    assert result.error == "Coupon expired"

// Bad: Test name says nothing
function test_1():
    x = f(y)
    assert x == 42
```

---

**Keep Tests Simple**

Tests are untested code. Every line of test logic is unverified code that can contain bugs. Keep tests obvious and straightforward.

```pseudocode
// BAD: Complex test logic (might have bugs itself)
function test_complex():
    items = []
    for i in range(5):
        weight = random.randint(1, 100) if i % 2 == 0 else 50
        items.append(create_item(weight))
    expected = sum(i.weight * 0.5 for i in items)

    result = calculate_shipping(items)

    assert abs(result - expected) < 0.01  // Is expected even correct?

// GOOD: Obvious test values
function test_shipping_50_cents_per_pound():
    items = [create_item(weight=10), create_item(weight=20)]

    result = calculate_shipping(items)

    assert result == 15.00  // 30 lbs * $0.50 = $15 (obvious)
```

---

**Applying FIRST:**

| Symptom | Violated Principle | Fix |
|---------|-------------------|-----|
| "Tests are too slow to run locally" | Fast | Use test doubles, avoid I/O |
| "Test B fails when run alone" | Independent | Give each test its own setup |
| "Works on my machine" | Repeatable | Remove external dependencies |
| "Check the output looks right" | Self-Validating | Add concrete assertions |
| "We'll add tests after release" | Timely | Write tests first (TDD) |
