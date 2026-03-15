# Anti-Patterns in Testing

Common testing anti-patterns that produce tests that don't actually catch bugs, break needlessly on refactoring, or make suites slow and brittle.

---

## 1. The Ice Cream Cone (Inverted Test Pyramid)

**Pattern:** More E2E tests than unit tests — the opposite of what Test Pyramid recommends.

**Problem:** Slow CI (hours instead of minutes), flaky tests due to infrastructure, poor error localization — when an E2E test fails you don't know which layer broke.

**Fix:** Invert back to the pyramid. Push logic down to unit tests. Keep E2E tests for critical user journeys only.

```
BAD (Ice Cream Cone):        GOOD (Pyramid):
         ▲                         ▲
        /E2E\        →            /E2E\ (few)
       /─────\                   /─────\
      / Integ \                 / Integ \ (moderate)
     /─────────\               /─────────\
    /           \             /   Unit    \ (many)
   / (very few) \            /─────────────\
  /─────────────\
     Unit tests
```

See: `Rules/TestPyramid.md`

---

## 2. Wet Tests (Duplicated Setup)

**Pattern:** Each test repeats the same setup code rather than sharing it via test fixtures or builders.

**Problem:** One change to the object structure requires updating 40 test files. High maintenance cost, tests become a burden rather than an asset.

```pseudocode
// BAD: Every test creates this manually
function test_active_user_can_post():
    user = User(id: 1, name: "alice", email: "alice@example.com",
                role: "member", active: true, plan: "free")
    // ...

function test_admin_can_delete():
    user = User(id: 1, name: "alice", email: "alice@example.com",
                role: "member", active: true, plan: "free")
    // ...

// GOOD: Shared builder with sensible defaults
function make_user(**overrides):
    return User(id: 1, name: "alice", email: "alice@example.com",
                role: "member", active: true, plan: "free",
                **overrides)

function test_active_user_can_post():
    user = make_user()  // override only what matters for THIS test
    // ...

function test_admin_can_delete():
    user = make_user(role: "admin")
    // ...
```

See: `Rules/TestDataBuilders.md`

---

## 3. The Liar (Always-Passing Test)

**Pattern:** A test that always passes regardless of what the code does — often because the assertion never runs.

**Why it's dangerous:** Looks like test coverage. Provides zero protection. Usually discovered only when a real bug slips through.

**Common causes:**

```pseudocode
// CAUSE 1: Async assertion that never runs (most common)
function test_user_created():
    user_service.create_user("alice").then(user =>
        assert user.id is not None  // this never runs — test exits first
    )
    // Fix: await the Promise, or return it

// CAUSE 2: Exception swallowed before assertion
function test_invalid_email_rejected():
    try:
        result = validate_email("not-an-email")
        assert result.valid == false  // only runs if no exception
    except Exception:
        pass  // swallows the exception — hides failures
    // Fix: Don't catch exceptions you didn't cause

// CAUSE 3: Wrong variable asserted
function test_discount_applied():
    price = 100
    discounted = apply_discount(price, 0.1)
    assert price == 100  // asserting the INPUT, not the OUTPUT
    // Fix: assert discounted == 90
```

**Detection:** Delete your assertion. If the test still passes — you have a Liar.

**Fix:** Write the assertion FIRST (Red-Green-Refactor → `Rules/RedGreenRefactor.md`). A test that starts red cannot be a Liar.

See also: `Workflows/AsyncTesting.md` — async Liar tests

---

## 4. Over-Mocked Tests

**Pattern:** Testing with so many mocks that you're only testing that you called the mocks correctly.

**Problem:** Tests pass even when the real integration is broken. Mocks lie (see: Don't Mock What You Don't Own below). Tests are coupled to implementation details, not behavior.

**Root cause:** The code under test mixes business logic with side effects. When logic and I/O live in the same function, the only way to test the logic is to mock all the I/O — producing tests that verify wiring instead of behavior.

```pseudocode
// BAD: Testing the wiring, not the behavior
function test_create_user():
    db = mock()
    email = mock()
    cache = mock()
    logger = mock()

    service = UserService(db, email, cache, logger)
    service.create_user("alice@example.com")

    assert db.insert.was_called_once()       // coupling to SQL
    assert email.send.was_called_once()       // coupling to email service
    assert cache.invalidate.was_called_once() // coupling to cache
    assert logger.info.was_called()           // coupling to logging

// GOOD: Test behavior through a narrow integration slice
function test_create_user_sends_welcome_email():
    fake_email = FakeEmailSender()  // captures sent emails
    service = UserService(real_test_db, fake_email)

    service.create_user("alice@example.com")

    assert fake_email.sent_count() == 1
    assert fake_email.last_recipient() == "alice@example.com"
```

**Fix:** If you need 3+ mocks to test one function, the function is doing too much. Extract the decision logic into a pure function (inputs in, result out, no I/O). Test the pure function without mocks. Integration-test the thin shell that coordinates I/O.

See: `Rules/SideEffectIsolation.md` — the structural fix for over-mocking
See: `Rules/BehaviorOverImplementation.md` (Mock at Boundaries section)

---

## 5. Time-Dependent Tests (Flaky Clock Tests)

**Pattern:** Tests that hardcode or depend on the current date/time — passing in development but failing in CI at specific times (midnight, month boundaries, DST changes, leap years).

**Common symptoms:**
- Tests fail only on certain days or times
- Tests fail in CI but pass locally (different timezone)
- Tests that worked for months suddenly fail at midnight on the 31st

```pseudocode
// BAD: Uses the real clock
function test_subscription_expired():
    sub = Subscription(expires: "2024-01-15")
    assert sub.is_expired()  // True today, False before 2024-01-15

// BAD: Hardcoded "future" date that becomes the past
function test_subscription_active():
    sub = Subscription(expires: "2025-12-31")
    assert sub.is_active()  // False after 2025-12-31

// GOOD: Inject a clock dependency
function test_subscription_expired():
    frozen_clock = FakeClock(current_date: "2024-02-01")
    sub = Subscription(expires: "2024-01-15", clock: frozen_clock)
    assert sub.is_expired()  // Always true regardless of when test runs

function test_subscription_active():
    frozen_clock = FakeClock(current_date: "2024-01-01")
    sub = Subscription(expires: "2024-01-15", clock: frozen_clock)
    assert sub.is_active()  // Always true regardless of when test runs
```

**Fix:** Never call `Date.now()`, `new Date()`, `datetime.now()`, or equivalent inside code under test. Inject a clock interface that tests can control.

See: `Rules/FIRST.md` — Repeatable property (tests should pass on any machine, any time)

---

## 6. God Test (Too Many Behaviors Per Test)

**Pattern:** One test method that verifies many unrelated behaviors. Tests hundreds of lines long. Test names like `test_user_workflow` or `test_everything`.

**Problem:** When it fails, you don't know what failed. Can't be run selectively. Takes forever. Impossible to maintain.

```pseudocode
// BAD: Testing 6 behaviors in one test
function test_user():
    user = create_user("alice")
    assert user.id is not None         // behavior 1
    assert user.created_at is not None // behavior 2

    user.update_email("new@test.com")
    assert user.email == "new@test.com" // behavior 3

    user.deactivate()
    assert user.active == false          // behavior 4
    assert user.deactivated_at is not None // behavior 5

    assert user.can_login() == false     // behavior 6

// GOOD: One behavior per test
function test_create_user_generates_id():
    user = create_user("alice")
    assert user.id is not None

function test_deactivated_user_cannot_login():
    user = create_user("alice")
    user.deactivate()
    assert user.can_login() == false
```

**Rule:** One reason to fail per test. If a test has more than one assertion group (setup → assert → new action → assert), split it.

---

## 7. Don't Mock What You Don't Own

**Source:** Gerard Meszaros, "xUnit Test Patterns" (2007)

**Pattern:** Mocking third-party libraries directly rather than wrapping them.

**Problem:** When the third-party library changes its API, your mocks still reflect the old API. Tests pass. Production breaks. Mocks became lies.

```pseudocode
// BAD: Mocking third-party library
twilio = mock()
twilio.messages.create.returns({sid: "123"})
// When Twilio changes the response shape, this mock doesn't update

// GOOD: Wrap and mock your own interface
class SmsGateway:
    function send(to: string, message: string) -> SmsResult: ...

class FakeSmsGateway(SmsGateway):
    // You control this interface
    sent_messages = []
    function send(to, message): sent_messages.append({to, message})
```

**Rule:** Only mock types you own. Wrap third-party code at the boundary and mock the wrapper.

See: `Rules/BehaviorOverImplementation.md` (Mock at Boundaries section)
See: `Rules/TestDoubleTaxonomy.md` — which test double type is right here?
