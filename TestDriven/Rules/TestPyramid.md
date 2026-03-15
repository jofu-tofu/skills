### Test Pyramid

**Source:** Martin Fowler, "TestPyramid" (2012)

**Impact: HIGH (fast, reliable test suite vs slow, flaky mess)**

The test pyramid is a model for balancing different types of tests. Many fast unit tests at the bottom, fewer integration tests in the middle, even fewer E2E tests at the top.

---

## The Shape

```
               /\
              /  \
             / E2E \              <- Few: 10 critical user journeys
            /‾‾‾‾‾‾‾‾\
           /Integration\          <- Some: 50 tests at boundaries
          /‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
         /   Unit Tests    \      <- Many: 500+ tests for logic
        ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

**Result:** 2-5 minute test runs, reliable, easy to debug

**Proper distribution:**
- Unit tests: 500 tests, 10 seconds
- Integration tests: 50 tests, 2 minutes
- E2E tests: 10 tests, 3 minutes

---

## The Anti-Pattern: Ice Cream Cone

```
          /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
         /   Manual Tests   \
        /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
       /      E2E Tests        \      <- Many: 200 tests, 45 min runtime
      /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
     /    Integration Tests      \    <- Some: 50 tests
     ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
            Unit Tests               <- Few: 20 tests
```

**Result:** 45+ minute test runs, constant flakiness, painful debugging

**Symptoms of the ice cream cone:**
- Test suite takes 30+ minutes
- Developers don't run tests locally (too slow)
- "That test is flaky, just re-run it"
- Test failures are hard to diagnose
- Most tests require full system running
- CI queue backs up waiting for tests

---

## What Belongs at Each Level

### Unit Tests (Many, Fast)

Test business logic, algorithms, calculations, validations in isolation.

```pseudocode
function test_discount_calculation():
    calculator = PriceCalculator()

    result = calculator.apply_discount(100, percent=10)

    assert result == 90

function test_email_validation():
    validator = EmailValidator()

    assert validator.is_valid("user@example.com") == true
    assert validator.is_valid("invalid") == false
```

**Characteristics:**
- No I/O (no database, no network, no filesystem)
- Milliseconds to run
- Test one concept
- Use test doubles for external dependencies

### Integration Tests (Some, Medium Speed)

Test database queries, API contracts, service interactions at boundaries.

```pseudocode
function test_user_repository_persists_data():
    db = create_test_database()
    repo = UserRepository(db)
    user = User(name="alice", email="alice@example.com")

    repo.save(user)
    retrieved = repo.find_by_email("alice@example.com")

    assert retrieved.name == "alice"

function test_payment_api_contract():
    client = PaymentClient(sandbox_url)

    response = client.charge(amount=100, card=test_card)

    assert response.status == "approved"
    assert response.transaction_id is not None
```

**Characteristics:**
- Real database (test instance)
- Real HTTP calls (sandbox/mock server)
- Seconds to run
- Test boundary behavior

### E2E Tests (Few, Slow)

Test critical user journeys through the full stack.

```pseudocode
function test_user_can_complete_checkout():
    browser = launch_browser()
    browser.login_as(test_user)
    browser.add_to_cart(product_1)
    browser.go_to_checkout()
    browser.enter_payment(test_card)
    browser.submit_order()

    assert browser.sees("Order confirmed")
    assert test_user.orders.count == 1
```

**Characteristics:**
- Full system running
- Real browser or API client
- Minutes to run
- Only critical paths
- High maintenance cost

---

## The Stability Gradient

Higher-level tests are more stable against internal changes but slower and harder to debug.

```
Most Stable    │ E2E / Feature tests (test whole journeys)
               │ API / Integration tests (test boundaries)
               │ Component tests (test module interfaces)
Least Stable   │ Unit tests (test individual classes)
```

**Trade-off guidance:**
- If tests constantly break after refactoring → move up a level
- If tests are too slow → move down a level
- If failures are hard to debug → move down a level
- If bugs slip through → add tests at the level where bugs occur

---

## Problem: Over-Investment in Low-Level Tests

```pseudocode
// Testing every internal class separately
class UserValidator: ...
class UserRepository: ...
class UserNotifier: ...
class UserService: ...

// 4 test files, one per class
// test_user_validator.py - 10 tests
// test_user_repository.py - 8 tests
// test_user_notifier.py - 5 tests
// test_user_service.py - 12 tests (mocking all collaborators)

// Refactoring: Combine validator into service, change repo interface
// Result: 3 of 4 test files need significant rewrites
```

---

## Solution: More Tests at Feature Level

```pseudocode
// Test the user creation feature, not individual classes
function test_create_user_with_valid_data():
    service = create_user_service(test_database, fake_email)

    result = service.create(valid_user_data)

    assert result.id is not None
    assert test_database.find_user(result.id).email == valid_user_data.email
    assert fake_email.was_sent_to(valid_user_data.email)

function test_create_user_rejects_invalid_email():
    service = create_user_service(test_database, fake_email)

    error = expect_error(service.create, invalid_user_data)

    assert error.field == "email"
    assert test_database.count_users() == 0
    assert fake_email.was_not_called()

// Internal class boundaries can now shift freely
// Combine, split, rename, reorganize - tests survive
```

---

## How to Fix an Ice Cream Cone

1. **Identify what E2E tests are actually testing**
   - Many E2E tests are really testing business logic

2. **Push tests down**
   - If it tests logic, make it a unit test
   - If it tests integration, make it an integration test

3. **Keep E2E only for critical journeys**
   - Login flow
   - Checkout flow
   - Core happy paths

4. **New features: start at the bottom**
   - Write unit tests first
   - Add integration tests for boundaries
   - Add E2E only if critical

---

## The Test Questions

1. **"How long does our test suite take?"**
   - Under 10 minutes is healthy
   - Over 30 minutes indicates ice cream cone

2. **"How often do tests flake?"**
   - Flaky tests usually mean too many E2E/integration tests

3. **"Can developers run tests locally before pushing?"**
   - If not, pyramid is inverted

---

## Balancing the Pyramid

| Symptom | Action |
|---------|--------|
| Slow CI | Push tests down the pyramid |
| Flaky tests | Push tests down or improve isolation |
| Bugs slip through | Add tests at level where bugs occur |
| Refactoring breaks tests | Move tests up to feature level |
| Hard to debug failures | Move tests down for specificity |

**Key insight:** More tests doesn't mean more stability. A few well-placed integration tests often provide more confidence than many unit tests that mock everything.
