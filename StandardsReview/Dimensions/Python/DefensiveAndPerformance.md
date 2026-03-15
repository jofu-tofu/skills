# Defensive Programming and Performance — Python

> Robust Python code validates inputs and handles failures explicitly, while choosing data structures and patterns that avoid unnecessary overhead.

## Mental Model

Defensive programming and performance optimization are two sides of the same coin: both require understanding what Python actually does at runtime rather than what it appears to do in source code. Defensive coding means validating inputs at boundaries, handling exceptions explicitly instead of silently swallowing them, and using immutable data structures to prevent accidental mutation. Performance awareness means choosing the right data structure (sets for membership, generators for streaming, slots for memory), avoiding patterns that create hidden overhead (repeated string concatenation, unnecessary list materialization), and profiling before optimizing. Together, they produce code that is both correct under unexpected inputs and efficient under expected loads — without sacrificing readability for either goal.

## Consumer Guide

### When Reviewing Code

- Check that boundary inputs are validated before processing.
- Flag bare except clauses and silently swallowed exceptions.
- Verify mutable default arguments are not used.
- Look for repeated string concatenation in loops.
- Check membership tests use sets instead of lists.
- Flag unnecessary list materialization where generators suffice.

### When Designing / Planning

- Plan input validation at system boundaries.
- Choose immutable data structures by default.
- Select data structures based on access patterns (dict for lookup, set for membership).

### When Implementing

- Use explicit exception handling with specific exception types.
- Prefer `__slots__` for data-heavy classes.
- Use generators for large sequences and f-strings for concatenation.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| DefensiveLbyl | CRITICAL | Prefer Look Before You Leap over exception-based flow to make intent explicit |
| DefensiveNeverSwallow | CRITICAL | Never catch exceptions without handling, transforming, or re-raising them |
| DefensivePathChecking | CRITICAL | Verify file and directory existence before performing file system operations |
| DefensiveVerifyCasts | CRITICAL | Validate types at runtime before or instead of using typing.cast() |
| PerfMagicMethodsO1 | HIGH | Magic methods must be O(1) to prevent implicit quadratic behavior in loops |
| PerfDeferImportTime | HIGH | Defer expensive computation from import time to first access |
| OrgNoMutableDefaults | HIGH | Never use mutable objects as default argument values |

#### DefensiveProgramming

---

### PY1.1 LBYL over EAFP

**Impact: CRITICAL (Makes intent explicit, reader sees conditions immediately)**

"Look Before You Leap" makes code intent visible at the point of execution. When you check conditions first, readers understand the logic without tracing exception handlers.

**Incorrect: Exception-based flow hides intent**

```python
# Reader must trace exception to understand the fallback
try:
    value = config[key]
except KeyError:
    value = default

# Exception handling for expected conditions
try:
    result = int(user_input)
except ValueError:
    result = 0
```

**Correct: Explicit checks show intent**

```python
# Intent is immediately clear
value = config.get(key, default)

# Explicit validation before conversion
if user_input.isdigit():
    result = int(user_input)
else:
    result = 0
```

**When EAFP is acceptable:**
- Race conditions where checking and acting aren't atomic (file existence)
- Performance-critical paths where exceptions are rare
- Third-party APIs that only signal errors via exceptions

---

### PY1.2 Never Swallow Exceptions

**Impact: CRITICAL (Silent failures cause data corruption)**

Catching exceptions without handling them hides bugs that corrupt data or leave systems in invalid states. Silent failures are worse than crashes because they go undetected until damage spreads.

**Incorrect: Exception swallowed silently**

```python
# Bug hidden - order may be in corrupted state
try:
    process_order(order)
except Exception:
    pass

# Logging without re-raising loses the failure signal
try:
    save_to_database(record)
except DatabaseError as e:
    logger.error(f"Failed: {e}")
    # Function returns normally despite failure
```

**Correct: Handle, transform, or re-raise**

```python
# Option 1: Handle meaningfully
try:
    process_order(order)
except ValidationError as e:
    order.status = "invalid"
    order.error_reason = str(e)
    notify_support(order, e)

# Option 2: Log and re-raise
try:
    save_to_database(record)
except DatabaseError as e:
    logger.error(f"Database save failed: {e}")
    raise  # Caller must handle

# Option 3: Transform to domain exception
try:
    external_api.call()
except RequestException as e:
    raise ServiceUnavailableError("External service down") from e
```

**The only acceptable "swallow":**
- Cleanup code in `finally` blocks where you must continue regardless
- Even then, log the suppressed exception

---

### PY1.3 Check Path Existence

**Impact: CRITICAL (Prevents OSError on non-existent paths)**

File operations on non-existent paths raise `FileNotFoundError` or `OSError`. Checking paths before operations provides clear error messages and prevents cascading failures.

**Incorrect: Assume paths exist**

```python
# Crashes with cryptic OSError if path missing
with open(config_path) as f:
    config = json.load(f)

# Parent directory may not exist
output_path.write_text(content)
```

**Correct: Verify paths explicitly**

```python
from pathlib import Path

# Check file exists with clear error
config_path = Path(config_path)
if not config_path.exists():
    raise ConfigurationError(f"Config file not found: {config_path}")

with open(config_path) as f:
    config = json.load(f)

# Ensure parent directory exists before write
output_path = Path(output_path)
output_path.parent.mkdir(parents=True, exist_ok=True)
output_path.write_text(content)
```

**Additional defensive checks:**

```python
# Check it's actually a file, not a directory
if not config_path.is_file():
    raise ConfigurationError(f"Expected file, got directory: {config_path}")

# Check permissions before attempting write
if output_path.exists() and not os.access(output_path, os.W_OK):
    raise PermissionError(f"Cannot write to: {output_path}")
```

---

### PY1.4 Verify Casts at Runtime

**Impact: CRITICAL (cast() only affects type checker, not runtime)**

`typing.cast()` tells the type checker to trust you, but performs no runtime verification. If your assumption is wrong, you get silent type mismatches that corrupt data downstream.

**Incorrect: Trust cast() blindly**

```python
from typing import cast

# Type checker believes this is User, but runtime doesn't verify
user = cast(User, get_entity(user_id))
# If get_entity returns None or wrong type, user.name crashes later
print(user.name)

# Casting API response without validation
data = cast(dict[str, int], api_response.json())
# If response has wrong structure, bugs appear far from this line
```

**Correct: Validate then cast, or use isinstance**

```python
from typing import cast

# Option 1: isinstance guard (preferred)
entity = get_entity(user_id)
if not isinstance(entity, User):
    raise TypeError(f"Expected User, got {type(entity).__name__}")
user = entity  # Type narrowed automatically
print(user.name)

# Option 2: Validate structure before cast
response_data = api_response.json()
if not isinstance(response_data, dict):
    raise ValueError("Expected dict response")
if not all(isinstance(v, int) for v in response_data.values()):
    raise ValueError("Expected all int values")
data = cast(dict[str, int], response_data)

# Option 3: Use TypeGuard for reusable validation
from typing import TypeGuard

def is_user(obj: object) -> TypeGuard[User]:
    return isinstance(obj, User)

entity = get_entity(user_id)
if not is_user(entity):
    raise TypeError("Expected User")
# entity is now typed as User
```

#### Performance

---

### PY3.1 Magic Methods Must Be O(1)

**Impact: HIGH (Called implicitly/frequently, O(n) becomes O(n²))**

Magic methods like `__len__`, `__bool__`, `__hash__`, and `__eq__` are called implicitly and frequently. An O(n) implementation turns simple operations into O(n²) performance traps.

**Incorrect: O(n) magic methods**

```python
class ItemCollection:
    def __init__(self):
        self._items = []

    def __len__(self) -> int:
        # O(n) - called every time len() is used
        return sum(1 for _ in self._items if _.is_active)

    def __contains__(self, item: Item) -> bool:
        # O(n) - called for every 'in' check
        return any(i.id == item.id for i in self._items)

# This loop is O(n²)
for item in collection:
    if item in collection:  # O(n) contains check
        ...
```

**Correct: O(1) magic methods with cached state**

```python
class ItemCollection:
    def __init__(self):
        self._items: list[Item] = []
        self._active_count: int = 0
        self._item_ids: set[int] = set()

    def add(self, item: Item) -> None:
        self._items.append(item)
        self._item_ids.add(item.id)
        if item.is_active:
            self._active_count += 1

    def __len__(self) -> int:
        # O(1) - return cached count
        return self._active_count

    def __contains__(self, item: Item) -> bool:
        # O(1) - set lookup
        return item.id in self._item_ids

# This loop is now O(n)
for item in collection:
    if item in collection:  # O(1) contains check
        ...
```

**Magic methods that must be O(1):**
- `__len__` - called by `len()`, boolean contexts
- `__bool__` - called in every `if` statement
- `__hash__` - called for dict/set operations
- `__eq__` - called for comparisons, dict lookups
- `__contains__` - called by `in` operator

---

### PY3.2 Defer Import-Time Computation

**Impact: HIGH (Prevents startup delays, circular imports)**

Code that runs at import time delays application startup and can cause circular import errors. Defer expensive operations to first use or explicit initialization.

**Incorrect: Work at import time**

```python
# config.py
import json
from pathlib import Path

# Runs when module is imported
CONFIG = json.loads(Path("config.json").read_text())
DB_CONNECTION = create_database_connection(CONFIG["database"])

# This constant requires expensive computation
PROCESSED_DATA = expensive_computation()
```

**Correct: Defer to first access**

```python
# config.py
import json
from functools import cache
from pathlib import Path

@cache
def get_config() -> dict:
    """Load config on first access, cache for subsequent calls."""
    return json.loads(Path("config.json").read_text())

@cache
def get_db_connection() -> Connection:
    """Create connection on first access."""
    return create_database_connection(get_config()["database"])

@cache
def get_processed_data() -> ProcessedData:
    """Compute on first access."""
    return expensive_computation()
```

**Alternative: Lazy module pattern**

```python
# heavy_module.py
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    import pandas as pd  # Only for type hints

_pandas = None

def get_pandas():
    """Import pandas only when needed."""
    global _pandas
    if _pandas is None:
        import pandas as pd
        _pandas = pd
    return _pandas

def process_dataframe(data: list[dict]) -> "pd.DataFrame":
    pd = get_pandas()
    return pd.DataFrame(data)
```

**Module-level `__getattr__` for lazy attributes (Python 3.7+):**

```python
# module.py
def __getattr__(name: str):
    if name == "EXPENSIVE_CONSTANT":
        value = compute_expensive_value()
        globals()["EXPENSIVE_CONSTANT"] = value
        return value
    raise AttributeError(f"module has no attribute {name}")
```

---

### PY3.3 No Mutable Default Arguments

**Impact: HIGH (Shared mutable default causes data leaks)**

Mutable default arguments are evaluated once at function definition, not per call. All calls share the same object, causing data to leak between calls and persist unexpectedly.

**Incorrect: Mutable default**

```python
def append_item(item: str, items: list[str] = []) -> list[str]:
    items.append(item)
    return items

# Each call modifies the same list
result1 = append_item("a")  # ["a"]
result2 = append_item("b")  # ["a", "b"] - leaked from previous call!

def create_user(name: str, tags: dict[str, str] = {}) -> User:
    tags["created_by"] = "system"
    return User(name=name, tags=tags)

# All users share the same tags dict
user1 = create_user("Alice")
user2 = create_user("Bob")  # user2.tags contains user1's data!
```

**Correct: None default with creation inside**

```python
def append_item(item: str, items: list[str] | None = None) -> list[str]:
    if items is None:
        items = []
    items.append(item)
    return items

# Each call gets a fresh list
result1 = append_item("a")  # ["a"]
result2 = append_item("b")  # ["b"] - independent

def create_user(name: str, tags: dict[str, str] | None = None) -> User:
    if tags is None:
        tags = {}
    tags["created_by"] = "system"
    return User(name=name, tags=tags)
```

**Common mutable types to watch for:**
- `list` - use `None` default, create inside
- `dict` - use `None` default, create inside
- `set` - use `None` default, create inside
- Custom mutable classes - use `None` or factory functions

**Immutable defaults are safe:**

```python
# These are fine - immutable types
def process(count: int = 0) -> int: ...
def greet(name: str = "World") -> str: ...
def configure(options: tuple[str, ...] = ()) -> Config: ...
```

## Does Not Cover

- Type annotation patterns and type narrowing (see TypeSystem).
- Module organization and import conventions (see CodeOrganization).

## Sources

- Effective Python by Brett Slatkin
- Python documentation on exceptions and data model
- High Performance Python by Gorelick & Ozsvald
