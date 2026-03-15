# Test Double Taxonomy

**Source:** Gerard Meszaros, "xUnit Test Patterns" (2007)

**Impact: High** — Using the wrong test double type leads to brittle tests, false positives, and over-mocking. The terms "mock", "stub", "fake" are often used interchangeably but mean different things.

---

## The 5 Test Double Types

All test doubles replace real dependencies in tests. They differ in what they do with calls made to them.

### Dummy

**Purpose:** Fill a parameter slot. Never actually used.

```pseudocode
// Test only cares about email validation, not the logger
function test_invalid_email_rejected():
    dummy_logger = object()  // never called, just satisfies constructor
    validator = EmailValidator(logger: dummy_logger)
    assert validator.validate("not-an-email") == false
```

**When to use:** When a dependency is required by the constructor but irrelevant to the test.

---

### Stub

**Purpose:** Returns pre-programmed responses. Does not verify how it was called.

```pseudocode
// Stub returns a fixed user regardless of input
function test_order_uses_user_name():
    stub_user_repo = StubUserRepository()
    stub_user_repo.get_user.returns(User(name: "alice"))

    order_service = OrderService(stub_user_repo)
    order = order_service.create_order(user_id: 99)

    assert order.customer_name == "alice"
    // We DON'T check how stub_user_repo was called
```

**When to use:** When you need the dependency to return something, but you don't care if/how it was called.

---

### Spy

**Purpose:** Records calls made to it. Can verify interactions after the fact.

```pseudocode
function test_welcome_email_sent_once():
    spy_email = SpyEmailSender()

    user_service = UserService(spy_email)
    user_service.register("alice@example.com")

    assert spy_email.send_call_count() == 1
    assert spy_email.last_call_recipient() == "alice@example.com"
```

**When to use:** When you want to verify that something happened (a call was made) but you still want to let the real behavior execute or capture it manually.

---

### Mock

**Purpose:** Pre-programmed with **expectations**. Verifies calls were made as expected. Fails the test if expectations aren't met.

```pseudocode
function test_payment_charged_on_order():
    mock_payment = mock(PaymentGateway)
    mock_payment.charge.expects(amount: 99.99, currency: "USD").once()

    order_service = OrderService(mock_payment)
    order_service.complete_order(order_id: 1)

    mock_payment.verify()  // fails if .charge() wasn't called correctly
```

**When to use:** When the interaction itself IS the behavior you're testing. Use sparingly — over-mocking couples tests to implementation.

**Warning:** The most commonly misused double. Before using a mock, ask: "Am I testing an interaction, or am I just checking wiring?"

---

### Fake

**Purpose:** A working implementation, but simplified. Not suitable for production.

```pseudocode
// Fake: real logic, but stores in memory instead of database
class FakeUserRepository(UserRepository):
    users = {}

    function save(user):
        users[user.id] = user

    function find_by_id(id):
        return users.get(id)

    function find_all():
        return list(users.values())
```

**When to use:** When you need realistic behavior across multiple calls (e.g., save then retrieve). Fakes are the most powerful doubles but take more effort to build.

---

## Quick Reference

| Type | Returns data | Records calls | Has expectations | Real logic |
|------|-------------|---------------|-----------------|------------|
| **Dummy** | No | No | No | No |
| **Stub** | Yes (fixed) | No | No | No |
| **Spy** | Optional | Yes | No | Optional |
| **Mock** | Optional | Yes | Yes | No |
| **Fake** | Yes (real) | No | No | Yes (simplified) |

---

## Which Double to Use?

```
Do you need realistic behavior across multiple calls?
├─ YES → Fake

Do you need to verify an interaction happened?
├─ YES (strict, pre-programmed) → Mock
├─ YES (flexible, post-hoc) → Spy

Do you just need to return something?
└─ Stub

Is the dependency not relevant to this test?
└─ Dummy
```

---

## The "Don't Mock What You Don't Own" Rule

**Source:** Gerard Meszaros (also in `Rules/AntiPatterns.md`)

Never use a Mock or Stub directly on a third-party library's API. If the library changes, your mock still reflects the old behavior — tests pass while production breaks.

```pseudocode
// BAD: Mocking third-party Stripe API directly
stripe = mock()
stripe.charges.create.returns({id: "ch_123"})

// GOOD: Wrap Stripe, mock your own interface
class PaymentGateway:
    function charge(amount, currency) -> ChargeResult: ...

class FakePaymentGateway(PaymentGateway):
    charges = []
    function charge(amount, currency):
        charges.append({amount, currency})
        return ChargeResult(id: "fake_ch_123", success: true)
```

See: `Rules/AntiPatterns.md` — Anti-Pattern 7: Don't Mock What You Don't Own

---

## Integration with Other Principles

- **Behavior Over Implementation** (`Rules/BehaviorOverImplementation.md`): Prefer Fakes over Mocks — Fakes don't couple to implementation details
- **FIRST** (`Rules/FIRST.md`): Fakes and Stubs help with Isolation (I) — tests run independently of external systems
- **Contract Testing** (`Rules/ContractTesting.md`): When mocking a service boundary, consider a contract test instead to prevent mock drift
