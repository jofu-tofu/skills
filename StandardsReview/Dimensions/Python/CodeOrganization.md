# Code Organization -- Python

> Structure code so that each function does one thing, call sites are self-documenting, and error handling is precise and informative.

## Mental Model

Code organization in Python is about reducing the cognitive cost of reading and modifying code. Python's flexibility -- optional keyword arguments, implicit returns, broad exception catching, arbitrarily long functions -- makes it easy to write code that works but is expensive to understand. This dimension groups seven rules that address the most common organizational failures: ambiguous call sites, variables declared far from use, dangerous defaults, bloated functions, and imprecise error handling.

The central principle is **locality of understanding**. A reader should be able to understand what a piece of code does by looking at the code itself, without scrolling to distant declarations, tracing exception handlers, or guessing what positional arguments mean. Keyword arguments make call sites self-documenting. Declaring variables close to their use keeps data flow visible within a screen of context. Single responsibility keeps functions short enough to fit in working memory.

Keyword arguments are the highest-leverage organizational pattern. When a function accepts `create_user("Alice", "admin", True, False)`, the call site is opaque -- the reader must jump to the function signature to understand each argument. When the same call is `create_user(name="Alice", role="admin", active=True, notify=False)`, the call site is self-documenting. Python's `*` separator makes keyword-only enforcement a language feature, not just a convention. For any function with three or more parameters, or any function with boolean parameters, keyword-only arguments should be the default.

Default values introduce a subtler organizational problem. When a function has defaults, callers naturally omit parameters they do not think about. This is convenient but dangerous for parameters where the default is not universally appropriate. A `timeout=30` default means every caller implicitly accepts 30 seconds without making a conscious decision. For parameters where the correct value depends on the caller's context, removing the default forces an explicit decision at every call site.

Variable declaration distance is a readability issue that compounds in longer functions. When `tax_rate = 0.08` is declared 50 lines above `tax = subtotal * tax_rate`, the reader must hold `tax_rate`'s value in working memory across the intervening code, or scroll back to find it. Declaring `tax_rate` immediately before its use eliminates this cognitive overhead and makes the data flow visually apparent.

Single responsibility is the structural constraint that keeps functions short enough for the other organizational rules to matter. A 200-line function with five responsibilities cannot have variables close to use, because each responsibility creates its own variable cluster spread across the function body. Decomposition into focused functions solves this organically.

Error handling bridges organization and correctness. Context managers ensure deterministic cleanup regardless of exception paths. Specific exception types prevent bug-masking (a `NameError` from a typo should not be caught by a broad `except Exception`). Meaningful error messages provide the context needed to debug failures without reproducing them.

## Consumer Guide

### When Reviewing Code

Check function call sites for positional arguments: any call with three or more positional arguments, or any call with boolean arguments, should use keyword arguments. Look for variables declared at the top of a function that are not used until much later -- these should be moved closer to their point of use. Check for functions longer than 30-40 lines and assess whether they have multiple responsibilities that could be extracted. Verify that every try/except catches specific exception types (not bare `except` or `except Exception`), and that error messages include the values that caused the failure. Check that every resource acquisition (file opens, locks, connections) uses a context manager.

### When Designing / Planning

When designing function interfaces, start with keyword-only parameters for anything beyond the first one or two "obvious" arguments. Explicitly decide which parameters should have defaults and which should force callers to provide values. When designing a module's internal structure, plan for single-responsibility functions that can be composed in orchestrator functions. When designing error handling strategy, define domain-specific exception classes so that callers can catch specific failures without catching unrelated bugs. Plan context manager usage for any resource that requires cleanup.

### When Implementing

Use `*` in function signatures to enforce keyword-only arguments for functions with three or more parameters or any boolean parameters. Place variable declarations immediately before their first use, not at the top of the function. When a function exceeds 20-30 lines, look for natural responsibility boundaries and extract helper functions with clear names that describe their purpose. Use `with` statements for all resource management. Catch the most specific exception type that matches the expected failure mode. In error messages, include the actual value that failed validation, the expected value or constraint, and enough context (IDs, file paths, parameter names) to locate the problem without a debugger.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| OrgKeywordArguments | HIGH | Use keyword-only arguments for functions with 3+ parameters or boolean params |
| OrgDeclareCloseToUse | HIGH | Declare variables immediately before their first use, not at function top |
| OrgDefaultValuesDangerous | HIGH | Remove defaults from parameters where callers should make explicit decisions |
| OrgSingleResponsibility | HIGH | Each function should have exactly one responsibility |
| ErrorContextManagers | MEDIUM | Use context managers for all resource acquisition and cleanup |
| ErrorSpecificExceptions | MEDIUM | Catch specific exception types, never bare except or except Exception |
| ErrorMeaningfulMessages | MEDIUM | Include failed value, expected constraint, and context in error messages |


---

### PY4.1 Keyword Arguments for Complex Functions

**Impact: HIGH (Self-documenting call sites)**

Functions with multiple parameters of the same type become confusing at call sites. Keyword arguments make calls self-documenting and prevent argument order mistakes.

**Incorrect: Positional arguments obscure meaning**

```python
def create_rectangle(x1: int, y1: int, x2: int, y2: int) -> Rectangle:
    ...

# Which is width? Which is height? Which corner is which?
rect = create_rectangle(10, 20, 100, 200)

def send_email(
    recipient: str,
    sender: str,
    subject: str,
    body: str
) -> None:
    ...

# Easy to swap recipient and sender by mistake
send_email("alice@co.com", "bob@co.com", "Hello", "Message")
```

**Correct: Keyword-only arguments enforce clarity**

```python
def create_rectangle(
    *,  # Forces all following to be keyword-only
    x1: int,
    y1: int,
    x2: int,
    y2: int,
) -> Rectangle:
    ...

# Call site is self-documenting
rect = create_rectangle(x1=10, y1=20, x2=100, y2=200)

def send_email(
    *,
    recipient: str,
    sender: str,
    subject: str,
    body: str,
) -> None:
    ...

# Can't accidentally swap arguments
send_email(
    recipient="alice@co.com",
    sender="bob@co.com",
    subject="Hello",
    body="Message",
)
```

**Guidelines:**
- Use `*` to force keyword-only for 3+ parameters
- Use keyword-only when parameters have same type
- Use keyword-only for boolean parameters (avoid `do_thing(True, False)`)
- First 1-2 "obvious" parameters can remain positional

```python
# OK: First parameter is obvious, rest are keyword-only
def fetch(url: str, *, timeout: int = 30, retries: int = 3) -> Response:
    ...

fetch("https://api.example.com", timeout=60, retries=5)
```

---

### PY4.2 Declare Variables Close to Use

**Impact: HIGH (Reduces cognitive load, clarifies data flow)**

Variables declared far from their use force readers to scroll back and forth, increasing cognitive load. Declaring close to use makes data flow obvious and reduces the "working memory" needed to understand code.

**Incorrect: Variables declared far from use**

```python
def process_order(order: Order) -> Receipt:
    # Variables declared at top, used much later
    tax_rate = 0.08
    discount_multiplier = 0.9
    shipping_cost = 5.99

    # ... 50 lines of validation ...

    # ... 30 lines of inventory checks ...

    # Finally using the variables
    subtotal = calculate_subtotal(order.items)
    tax = subtotal * tax_rate  # Where was tax_rate defined?
    total = subtotal * discount_multiplier + tax + shipping_cost

    return Receipt(total=total)
```

**Correct: Variables declared at point of use**

```python
def process_order(order: Order) -> Receipt:
    validate_order(order)
    check_inventory(order.items)

    # Variables declared right where they're used
    subtotal = calculate_subtotal(order.items)

    tax_rate = 0.08
    tax = subtotal * tax_rate

    discount_multiplier = 0.9
    discounted = subtotal * discount_multiplier

    shipping_cost = 5.99
    total = discounted + tax + shipping_cost

    return Receipt(total=total)
```

**Additional benefits:**
- Easier to extract functions (related code is grouped)
- Reduces variable scope (fewer places where bugs can hide)
- Makes dead code obvious (unused variables near their declaration)

**Exception: Configuration/constants at module or class level**

```python
# OK at module level - these are configuration
TAX_RATE = 0.08
SHIPPING_BASE = 5.99

class OrderProcessor:
    # OK at class level - shared by all methods
    DEFAULT_DISCOUNT = 0.9
```

---

### PY4.3 Default Values Are Dangerous

**Impact: HIGH (Callers forget to provide, causes surprises)**

Default values seem convenient but hide required decisions. Callers rely on defaults without understanding them, leading to bugs when defaults don't match their use case.

**Incorrect: Defaults hide important decisions**

```python
def fetch_data(
    url: str,
    timeout: int = 30,
    retries: int = 3,
    verify_ssl: bool = True,
) -> Response:
    ...

# Caller uses defaults without thinking
data = fetch_data("https://api.example.com")
# Is 30s timeout appropriate? Are 3 retries right for this call?

def create_user(
    name: str,
    role: str = "user",
    active: bool = True,
) -> User:
    ...

# Accidentally creates active admin users
admin = create_user("Alice", role="admin")  # active=True by default
```

**Correct: Require explicit decisions for important parameters**

```python
def fetch_data(
    url: str,
    *,
    timeout: int,  # No default - caller must decide
    retries: int,  # No default - caller must decide
    verify_ssl: bool = True,  # OK - safe default
) -> Response:
    ...

# Caller forced to think about timeout and retries
data = fetch_data(
    "https://api.example.com",
    timeout=10,  # Appropriate for this use case
    retries=1,   # Don't retry this particular call
)

def create_user(
    name: str,
    *,
    role: str,     # No default - force explicit role assignment
    active: bool,  # No default - force explicit activation decision
) -> User:
    ...

# Caller must explicitly decide
admin = create_user("Alice", role="admin", active=False)
```

**When defaults are appropriate:**
- Truly optional parameters with safe, obvious defaults
- Backward compatibility (but consider deprecation)
- Parameters where 90%+ of callers want the same value

---

### PY4.4 Single Responsibility

**Impact: HIGH (Easier to test, modify, understand)**

Functions and classes that do one thing well are easier to test, modify, and compose. When a function has multiple responsibilities, changes to one responsibility risk breaking others.

**Incorrect: Multiple responsibilities mixed**

```python
def process_and_save_user(data: dict) -> User:
    # Responsibility 1: Validation
    if not data.get("email"):
        raise ValueError("Email required")
    if not data.get("name"):
        raise ValueError("Name required")

    # Responsibility 2: Transformation
    user = User(
        email=data["email"].lower(),
        name=data["name"].strip(),
        created_at=datetime.now(),
    )

    # Responsibility 3: Persistence
    db.session.add(user)
    db.session.commit()

    # Responsibility 4: Notification
    send_welcome_email(user)

    return user
```

**Correct: Single responsibility per function**

```python
def validate_user_data(data: dict) -> None:
    """Validate user data, raise ValueError if invalid."""
    if not data.get("email"):
        raise ValueError("Email required")
    if not data.get("name"):
        raise ValueError("Name required")

def create_user_from_data(data: dict) -> User:
    """Transform raw data into User object."""
    return User(
        email=data["email"].lower(),
        name=data["name"].strip(),
        created_at=datetime.now(),
    )

def save_user(user: User) -> None:
    """Persist user to database."""
    db.session.add(user)
    db.session.commit()

def notify_new_user(user: User) -> None:
    """Send welcome notification to new user."""
    send_welcome_email(user)

# Compose as needed
def register_user(data: dict) -> User:
    """Orchestrate user registration."""
    validate_user_data(data)
    user = create_user_from_data(data)
    save_user(user)
    notify_new_user(user)
    return user
```

**Benefits:**
- Each function is independently testable
- Responsibilities can be reused (validate without save)
- Changes to one responsibility don't affect others
- Clear names describe what each function does

---

### PY4.5 Use Context Managers

**Impact: MEDIUM (Guarantees resource cleanup)**

Context managers ensure resources are properly released even when exceptions occur. Without them, files stay open, locks remain held, and connections leak under error conditions.

**Incorrect: Manual resource management**

```python
# File may stay open if exception occurs
f = open("data.txt")
data = f.read()
process(data)
f.close()  # Never reached if process() raises

# Lock may stay held
lock.acquire()
do_critical_work()
lock.release()  # Never reached if work raises

# Connection may leak
conn = database.connect()
result = conn.execute(query)
conn.close()  # Never reached if execute raises
```

**Correct: Context managers guarantee cleanup**

```python
# File always closed, even on exception
with open("data.txt") as f:
    data = f.read()
    process(data)

# Lock always released
with lock:
    do_critical_work()

# Connection always returned to pool
with database.connect() as conn:
    result = conn.execute(query)
```

**Custom context managers:**

```python
from contextlib import contextmanager

@contextmanager
def timed_operation(name: str):
    """Log duration of an operation."""
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        logger.info(f"{name} took {elapsed:.2f}s")

with timed_operation("data_processing"):
    process_large_dataset()

# Class-based for complex state
class DatabaseTransaction:
    def __init__(self, connection):
        self.conn = connection

    def __enter__(self):
        self.conn.begin()
        return self.conn

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self.conn.commit()
        else:
            self.conn.rollback()
        return False  # Don't suppress exceptions
```

---

### PY4.6 Catch Specific Exceptions

**Impact: MEDIUM (Bare except hides bugs)**

Catching `Exception` or using bare `except:` hides bugs by treating all failures the same. A typo causing `NameError` looks identical to the network error you intended to handle.

**Incorrect: Overly broad exception handling**

```python
# Bare except catches everything, including bugs
try:
    result = process_data(data)
except:
    result = default_value

# Catching Exception hides programming errors
try:
    user = users[user_id]  # KeyError if missing
    email = user.email.lower()  # AttributeError if no email
    send_notification(emial)  # NameError: typo in 'email'
except Exception:
    logger.error("Failed to send notification")
    # Bug hidden - typo never discovered
```

**Correct: Catch specific expected exceptions**

```python
# Catch only what you expect and can handle
try:
    result = process_data(data)
except ValueError as e:
    logger.warning(f"Invalid data format: {e}")
    result = default_value
except ConnectionError as e:
    logger.error(f"Network error: {e}")
    raise  # Re-raise if we can't handle it

# Multiple specific exceptions
try:
    user = users[user_id]
    email = user.email.lower()
    send_notification(email)
except KeyError:
    logger.warning(f"User {user_id} not found")
except AttributeError:
    logger.warning(f"User {user_id} has no email")
except NotificationError as e:
    logger.error(f"Notification failed: {e}")
# NameError from typo will propagate and be discovered
```

**Group related exceptions when appropriate:**

```python
# OK to group when handling is identical
try:
    data = fetch_from_api(url)
except (ConnectionError, TimeoutError, HTTPError) as e:
    logger.error(f"API request failed: {e}")
    raise ServiceUnavailableError("External service down") from e
```

---

### PY4.7 Meaningful Error Messages

**Impact: MEDIUM (Debugging without context wastes time)**

Error messages without context require developers to reproduce the issue and add logging to understand what went wrong. Good error messages include what failed, why, and relevant state.

**Incorrect: Vague error messages**

```python
# No context about what failed
if not user:
    raise ValueError("Invalid user")

# No information about the bad value
if age < 0:
    raise ValueError("Invalid age")

# No guidance on what's expected
if not re.match(r"^\d{3}-\d{4}$", phone):
    raise ValueError("Invalid phone number")
```

**Correct: Contextual error messages**

```python
# Include what was attempted and what was found
if not user:
    raise ValueError(f"User not found for id={user_id}")

# Include the invalid value
if age < 0:
    raise ValueError(f"Age must be non-negative, got {age}")

# Include what was expected and what was received
if not re.match(r"^\d{3}-\d{4}$", phone):
    raise ValueError(
        f"Phone number must be in format XXX-XXXX, got {phone!r}"
    )
```

**Error message patterns:**

```python
# Include operation context
def process_file(path: Path) -> Data:
    if not path.exists():
        raise FileNotFoundError(
            f"Cannot process file: {path} does not exist"
        )
    if not path.is_file():
        raise ValueError(
            f"Expected file, got directory: {path}"
        )

# Include relevant IDs for debugging
def transfer_funds(from_account: str, to_account: str, amount: Decimal):
    if amount <= 0:
        raise ValueError(
            f"Transfer amount must be positive, got {amount} "
            f"(from={from_account}, to={to_account})"
        )

# Chain exceptions to preserve original context
try:
    data = json.loads(raw_content)
except json.JSONDecodeError as e:
    raise ConfigurationError(
        f"Invalid JSON in config file {config_path}: {e}"
    ) from e
```


## Rule Interactions

**OrgKeywordArguments + OrgDefaultValuesDangerous**: These two rules work in tension and complement. Keyword arguments make defaults visible at call sites (`fetch(url, timeout=30)` shows the default being used). But OrgDefaultValuesDangerous warns that some defaults should not exist at all. The combination is: use keyword arguments to make parameters explicit, and remove defaults where callers should be forced to decide.

**OrgDeclareCloseToUse + OrgSingleResponsibility**: Single responsibility naturally solves declaration distance. When a function does one thing, its variables cluster tightly around the operations that use them. Long declaration distances are often a symptom of multi-responsibility functions.

**ErrorSpecificExceptions + DefensiveProgramming dimension (DefensiveNeverSwallow)**: SpecificExceptions determines which exceptions to catch; NeverSwallow determines what to do with them. Together: catch specific types, then handle meaningfully, transform to domain exceptions, or re-raise. Never catch broad and never swallow.

**ErrorContextManagers + ErrorSpecificExceptions**: Context managers handle the cleanup path; specific exceptions handle the error path. A `with` block ensures resources are released, while the except blocks inside or outside the `with` handle specific failure modes. The `__exit__` method must not suppress exceptions (`return False`); leave exception handling to explicit except blocks.

**ErrorMeaningfulMessages + OrgKeywordArguments**: When functions use keyword arguments, the parameter names are available at the call site and in error messages. A meaningful error message can reference parameter names that match the call site, making it easy to trace from error message back to the exact call that caused it.

**OrgSingleResponsibility + ErrorContextManagers**: When each function has a single responsibility, the resource lifecycle is contained within one function. This makes context manager usage straightforward -- the `with` block wraps the entire function body rather than being nested alongside unrelated logic.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Bare `except:` or `except Exception:` in production code**: Catches programming errors (`NameError`, `TypeError`, `AttributeError`) alongside operational errors. Bugs become invisible. The only acceptable broad catch is in top-level error handlers that log and terminate.
- **Boolean positional arguments**: `process(data, True, False, True)` is completely unreadable. Boolean parameters must always be keyword-only because their meaning cannot be inferred from the value.

### HIGH

- **Function with 5+ responsibilities**: A function that validates, transforms, persists, notifies, and logs is untestable in isolation and changes for five different reasons. Extract each responsibility into a named function and compose them in an orchestrator.
- **Variables declared 20+ lines before use**: Forces readers to hold values in working memory across unrelated code. Move declarations to the line immediately before first use.
- **Dangerous defaults on security-sensitive parameters**: `verify_ssl=True` as a default is fine (secure by default). `verify_ssl=False` as a default is dangerous. `role="admin"` as a default is dangerous. Parameters that affect security or authorization must require explicit values.
- **Error messages without the failing value**: `raise ValueError("Invalid input")` gives no debugging context. Always include what was received and what was expected.

### MEDIUM

- **Three positional parameters of the same type**: `create_rect(10, 20, 100, 200)` -- which is x, which is y, which is width? Same-type positional arguments invite ordering mistakes.
- **Context manager not used for file operations**: `f = open(path); data = f.read(); f.close()` -- if `f.read()` raises, `f.close()` is never reached. Always use `with open(path) as f:`.
- **Overly granular exception handling**: Catching five specific exceptions with identical handling in separate except blocks. Group related exceptions: `except (ConnectionError, TimeoutError) as e:`.

## Examples

**Self-documenting call sites vs. opaque calls:**

```python
# BAD: positional arguments obscure meaning
send_email("alice@co.com", "bob@co.com", "Hello", "Message body", True, False)

# GOOD: keyword arguments are self-documenting
send_email(
    recipient="alice@co.com",
    sender="bob@co.com",
    subject="Hello",
    body="Message body",
    html=True,
    track_opens=False,
)
```

**Single responsibility decomposition:**

```python
# BAD: one function with four responsibilities
def handle_order(data: dict) -> Order:
    # Validate
    if not data.get("items"):
        raise ValueError("No items")
    # Transform
    order = Order(items=[Item(**i) for i in data["items"]])
    # Persist
    db.session.add(order)
    db.session.commit()
    # Notify
    send_confirmation(order.customer_email, order.id)
    return order

# GOOD: composed single-responsibility functions
def validate_order_data(data: dict) -> None:
    if not data.get("items"):
        raise ValueError(f"Order data missing 'items' key, got keys: {list(data.keys())}")

def build_order(data: dict) -> Order:
    return Order(items=[Item(**i) for i in data["items"]])

def persist_order(order: Order) -> None:
    db.session.add(order)
    db.session.commit()

def handle_order(data: dict) -> Order:
    validate_order_data(data)
    order = build_order(data)
    persist_order(order)
    send_confirmation(order.customer_email, order.id)
    return order
```

**Precise error handling with context:**

```python
# BAD: broad catch with vague message
try:
    user = db.get_user(user_id)
    process_payment(user.account, amount)
except Exception as e:
    logger.error("Payment failed")

# GOOD: specific catches with meaningful messages
try:
    user = db.get_user(user_id)
except UserNotFoundError:
    raise PaymentError(f"Cannot process payment: user {user_id} not found")

try:
    process_payment(user.account, amount)
except InsufficientFundsError as e:
    raise PaymentError(
        f"Insufficient funds for user {user_id}: "
        f"required={amount}, available={e.balance}"
    ) from e
except PaymentGatewayError as e:
    logger.error(f"Gateway error for user {user_id}, amount {amount}: {e}")
    raise
```

## Does Not Cover

- **Module and package organization** (directory structure, `__init__.py` design, circular import resolution) -- this dimension covers intra-function and function-interface organization, not inter-module architecture.
- **Naming conventions** (PEP 8 naming, variable name quality) -- complementary but not in scope for this structural dimension.
- **Documentation and docstrings** -- related to readability but a separate concern from code structure.
- **Class design patterns** (inheritance hierarchies, mixins, metaclasses) -- higher-level design decisions outside the scope of these rules.
- **Mutable default arguments** -- covered in the Performance dimension (OrgNoMutableDefaults) due to its data-leak characteristics.

## Sources

- minimaxir's Python CLAUDE.md (keyword arguments, single responsibility, declare close to use)
- Dagster's "Dignified Python" (dangerous defaults, context managers, specific exceptions)
- PEP 3102 (keyword-only arguments)
- Python documentation on context managers and the `with` statement
