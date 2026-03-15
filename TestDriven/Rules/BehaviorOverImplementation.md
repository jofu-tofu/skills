### Behavior Over Implementation

**Source:** Kent Beck, "Test-Driven Development by Example" (2002); Michael Feathers, "Working Effectively with Legacy Code" (2004)

**Impact: CRITICAL (tests that survive refactoring vs tests that break constantly)**

Tests should verify WHAT the code does, not HOW it does it. If you could rewrite the entire implementation with a different algorithm and the test should still pass, the test is correct.

---

## The Core Principle

**The Refactoring Test:** If you restructure internals without changing behavior, tests should still pass.

These refactorings should leave tests green:
- Extracting a method
- Inlining a method
- Changing internal data structures
- Renaming private variables
- Reorganizing internal code flow
- Extracting or inlining a class

If tests break on any of these, the tests are coupled to implementation.

---

## Problem: Testing Implementation Details

```pseudocode
// This test is coupled to HOW we get users
function test_get_active_users():
    db = mock()
    db.execute.returns([{id: 1, active: true}])
    service = UserService(db)

    service.get_active_users()

    // BREAKS if we change to ORM, add caching, or restructure query
    assert db.execute.was_called_with("SELECT * FROM users WHERE active = 1")
```

**What's wrong:**
- Tests the SQL query, not the behavior
- Breaks if you add an index hint
- Breaks if you switch to an ORM
- Breaks if you add caching
- Breaks if you rename a column

---

## Solution: Testing Observable Behavior

```pseudocode
// This test verifies WHAT we get, survives any implementation change
function test_get_active_users_returns_only_active():
    service = UserService(test_database)
    service.create_user("alice", active=true)
    service.create_user("bob", active=false)

    result = service.get_active_users()

    assert length(result) == 1
    assert result[0].name == "alice"
```

**What survives:**
- Query rewrites
- ORM changes
- Caching layer added
- Database migration
- Index changes
- Column renames

---

## What to Test vs What to Ignore

**Test these (observable behavior):**
- Return values
- State changes visible through public interface
- Side effects at system boundaries (files written, HTTP calls made)
- Exceptions thrown for invalid inputs
- Observable outputs

**Let these vary freely (implementation details):**
- Which internal methods are called
- The order of internal operations
- Which data structures are used internally
- Exact SQL queries or internal APIs
- Number of times internal functions execute

---

## Test at Abstraction Boundaries

Test through public interfaces, not internal classes. Public APIs form stable contracts; internal structure changes frequently.

**Problem: Testing internal classes directly**

```pseudocode
// Internal implementation detail
class HelperFormatter:
    function format(data): ...

// Public API
class ReportGenerator:
    helper = HelperFormatter()
    function generate(data):
        return helper.format(data)

// BAD: Test targets internal class
function test_helper_formatter():
    helper = HelperFormatter()  // Testing internals
    result = helper.format(sample_data)
    assert result == expected
```

**Solution: Test through public interface**

```pseudocode
// Test the public API - internal structure can change freely
function test_report_generator_outputs_correct_format():
    generator = ReportGenerator()

    result = generator.generate(sample_data)

    assert result.contains("Expected Header")
    assert result.contains(sample_data.key_value)

// Now free to: inline helper, split it, replace with library
```

**The Question:** "Is this class/function part of the public API, or could I delete it during refactoring?"

---

## Test the Contract

Test input/output - the contract between caller and callee. The contract is what callers rely on; implementation is how you deliver it.

**Problem: Testing internal mechanics**

```pseudocode
function test_sort_uses_quicksort():
    sorter = Sorter()
    spy_on(sorter, "partition")  // Spying on internals

    sorter.sort(array)

    assert sorter.partition.was_called()  // HOW, not THAT
```

**Solution: Test the contract**

```pseudocode
function test_sort_returns_ascending_order():
    sorter = Sorter()

    result = sorter.sort([3, 1, 4, 1, 5])

    assert result == [1, 1, 3, 4, 5]  // WHAT matters to caller
```

**A contract includes:**
- Given valid input X, return output Y
- Given invalid input, throw specific error
- Side effects callers depend on

**A contract does NOT include:**
- Which algorithm is used
- Internal data structures
- Order of internal operations
- Which helper methods are called

---

## Skip Testing Private Helpers

Private/internal helper functions are implementation details. Test them through the public API they support.

**Problem: Testing private helpers directly**

```pseudocode
class OrderProcessor:
    function process(order):
        validated = self._validate(order)
        calculated = self._calculate_totals(validated)
        return self._format_result(calculated)

// BAD: Accessing private methods
function test_validate():
    processor = OrderProcessor()
    result = processor._validate(empty_order)  // Private access!
    assert result.is_invalid
```

**Solution: Test through public interface**

```pseudocode
function test_process_rejects_empty_order():
    processor = OrderProcessor()

    result = processor.process(empty_order)

    assert result.status == "rejected"
    assert result.error == "Order cannot be empty"
```

**Design signal:** If a helper is so complex it needs dedicated tests, consider extracting it to its own public class/module with its own public interface.

---

## Mock at System Boundaries Only

Don't mock internal collaborators. Use real implementations for internal code; mock only at system boundaries.

**Problem: Mocking internal collaborators**

```pseudocode
class OrderService:
    function __init__(self, repository, calculator, notifier):
        self.repo = repository
        self.calc = calculator
        self.notifier = notifier

    function place_order(order):
        saved = self.repo.save(order)
        total = self.calc.calculate(saved)
        self.notifier.send(saved, total)
        return saved

// BAD: Mocking every internal piece
function test_place_order():
    repo = mock()
    calc = mock()
    notifier = mock()
    repo.save.returns(order_with_id)
    calc.calculate.returns(100)

    service = OrderService(repo, calc, notifier)
    service.place_order(order)

    // Coupled to exact internal orchestration
    assert repo.save.was_called_with(order)
    assert calc.calculate.was_called_with(order_with_id)
    assert notifier.send.was_called_with(order_with_id, 100)
```

**Solution: Test at system boundaries**

```pseudocode
function test_place_order_saves_and_notifies():
    // Real or in-memory implementations
    repo = InMemoryOrderRepository()
    notifier = FakeNotifier()
    service = create_order_service(repo, notifier)

    result = service.place_order(order)

    // Assert on observable outcomes
    assert repo.find(result.id) == result
    assert notifier.last_notification.order_id == result.id
```

**Mock at system boundaries (external dependencies):**
- External HTTP APIs
- Databases (or use in-memory versions)
- File systems
- Time/clock
- External services you don't own

**Use real implementations for:**
- Classes and modules you wrote
- Internal collaborators and helpers
- Business logic components

---

## Don't Mock What You Don't Own

**Source:** Gerard Meszaros, "xUnit Test Patterns" (2007)

Don't mock third-party libraries directly. When the library changes, your mocks become lies. Wrap external dependencies and mock your wrapper.

**Problem: Mocking third-party libraries**

```pseudocode
function test_send_notification():
    twilio = mock()
    twilio.messages.create.returns({sid: "123"})

    notifier = Notifier(twilio)
    notifier.send_sms("+1234567890", "Hello")

    // Testing YOUR UNDERSTANDING of Twilio, not Twilio
    assert twilio.messages.create.was_called_with(
        to="+1234567890",
        body="Hello"
    )
```

**Solution: Wrap and mock your wrapper**

```pseudocode
// Create an interface you own
interface SmsGateway:
    function send(to: string, message: string): Result

// Wrap the third-party library
class TwilioGateway implements SmsGateway:
    function send(to, message):
        return twilio.messages.create(to=to, body=message)

// Mock YOUR interface
class FakeSmsGateway implements SmsGateway:
    sent_messages = []
    function send(to, message):
        self.sent_messages.append({to, message})
        return Success()

function test_send_notification():
    gateway = FakeSmsGateway()
    notifier = Notifier(gateway)

    notifier.send_sms("+1234567890", "Hello")

    assert gateway.sent_messages[0].to == "+1234567890"
```

---

## The Test Questions

1. **"If I rewrote this with a different algorithm, should the test still pass?"**
   - If no, you're testing implementation

2. **"If I restructured internals without changing behavior, would tests break?"**
   - If yes, tests are coupled to implementation

3. **"Would this test survive if I merged these two classes, or split one into three?"**
   - If no, move tests up to a more stable level
