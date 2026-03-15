# Type System -- Python

> Treat type annotations as executable documentation that prevents entire categories of bugs before any code runs.

## Mental Model

Python's type system is optional and gradual -- the interpreter ignores annotations at runtime, and you can add types to some functions while leaving others untyped. This flexibility is both its greatest strength and its greatest risk. The strength is that you can adopt types incrementally in a million-line codebase. The risk is that developers treat types as optional decoration rather than as a structural contract, leading to codebases where some paths are verified and others are not, with `Any` silently bridging the gaps.

The mental model for this dimension is: **types are the first line of defense**. Before defensive runtime checks (dimension PY1), before tests, before code review, the type checker can verify that functions receive and return the correct types, that nullable values are handled, that string constants match a known set, and that generic containers preserve their element types through transformations. Every function signature without type hints is a missed opportunity to catch bugs automatically.

The key insight is that `Any` is viral. When a function accepts or returns `Any`, every downstream consumer inherits that `Any`, and the type checker stops verifying their code too. A single `Any` at a system boundary can disable type checking across an entire call chain. This is why avoiding `Any` is rated CRITICAL -- it is not about one function, it is about the cascading loss of verification across the codebase.

`Literal` types take this a step further by restricting values, not just types. A parameter typed as `str` accepts any string; a parameter typed as `Literal["GET", "POST", "PUT", "DELETE"]` only accepts those four values. The type checker catches typos at development time rather than runtime, and the set of valid values is documented directly in the signature. This is especially valuable for configuration options, status strings, mode flags, and any parameter where only specific values are meaningful.

`Optional` (or the modern `X | None` syntax) forces callers to handle the null case. Without it, a function that sometimes returns `None` appears to always return a value, and callers skip the null check. With explicit nullability, the type checker flags every use site that does not handle `None`, turning a category of `AttributeError: 'NoneType' has no attribute` crashes into compile-time errors.

The practical goal is a codebase where `mypy --strict` (or `pyright` in strict mode) passes with zero errors. This means every function has complete annotations, `Any` is used only in genuinely dynamic code (JSON parsing boundaries, gradual migration stubs), `Literal` replaces bare `str` for known value sets, and `X | None` replaces implicit nullability. The type checker then becomes a continuous verification tool that catches regressions automatically on every commit.

## Consumer Guide

### When Reviewing Code

Check that every function and method has complete type annotations on all parameters and the return type. Look specifically for: functions with no annotations, functions that use `Any` where a specific type or generic would work, string parameters that accept only a known set of values (candidates for `Literal`), and functions that can return `None` but whose return type does not include `| None`. Verify that `TypeVar` is used for generic functions instead of `Any`. Check that class attributes are annotated, especially in `__init__` methods and dataclasses. Flag any `# type: ignore` comment that does not include a specific error code (e.g., `# type: ignore[arg-type]` is acceptable; bare `# type: ignore` is not).

### When Designing / Planning

When designing interfaces, start with the type signatures before writing implementation. The signature is the contract: it tells consumers what they must provide and what they will receive. Use `Protocol` for structural typing when you need duck-typing compatibility but still want type safety. Plan your generic types (`TypeVar`, `ParamSpec`) for utility functions that must work across multiple types. When designing APIs that accept configuration options or mode strings, define `Literal` type aliases up front so the valid values are centralized and enforced. When designing return types, explicitly decide whether `None` is a valid return and annotate accordingly -- do not let implicit `None` returns leak through.

### When Implementing

Annotate every function signature completely. Use modern syntax: `list[int]` instead of `List[int]`, `dict[str, Any]` instead of `Dict[str, Any]`, `X | None` instead of `Optional[X]` (Python 3.10+, or with `from __future__ import annotations`). Prefer `collections.abc` abstract types (`Mapping`, `Sequence`, `Iterator`) over concrete types (`dict`, `list`) in function parameters to accept the widest range of compatible inputs. Use `TypeVar` for functions that preserve input types. Create `Literal` type aliases for any parameter where the set of valid values is known and small. When dealing with third-party untyped libraries, create typed wrapper functions rather than letting `Any` propagate into your codebase.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| TypeHintsRequired | CRITICAL | Every function must have complete type annotations on parameters and return type |
| TypeLiteralValues | CRITICAL | Use Literal types instead of bare str/int for parameters with known value sets |
| TypeAvoidAny | CRITICAL | Avoid Any -- use specific types, generics, or Protocol for structural typing |
| TypeOptionalNullable | CRITICAL | Mark nullable values explicitly with X | None to force callers to handle None |


---

### PY2.1 Type Hints Required

**Impact: CRITICAL (Types are documentation that runs)**

Type hints catch bugs before runtime, serve as always-accurate documentation, and enable IDE features like autocomplete and refactoring. Untyped code accumulates maintenance debt.

**Incorrect: No type information**

```python
# What types does this accept? What does it return?
def process(data, threshold):
    return [x for x in data if x > threshold]

# Readers must trace through code to understand types
def fetch_user(user_id):
    response = api.get(f"/users/{user_id}")
    return response.json() if response.ok else None
```

**Correct: Explicit types everywhere**

```python
def process(data: list[float], threshold: float) -> list[float]:
    return [x for x in data if x > threshold]

def fetch_user(user_id: int) -> User | None:
    response = api.get(f"/users/{user_id}")
    return User(**response.json()) if response.ok else None
```

**Type hint patterns:**

```python
from typing import Callable, TypeVar
from collections.abc import Iterator, Mapping

# Generic functions
T = TypeVar("T")
def first(items: list[T]) -> T | None:
    return items[0] if items else None

# Callable types
Handler = Callable[[Request], Response]
def register(path: str, handler: Handler) -> None: ...

# Collection protocols (prefer over concrete types)
def summarize(data: Mapping[str, int]) -> int:
    return sum(data.values())

# Class attributes
class Config:
    timeout: int
    retries: int = 3
    base_url: str | None = None
```

---

### PY2.2 Use Literal Types

**Impact: CRITICAL (Catches typos at type-check time)**

`Literal` types restrict values to specific constants, catching typos and invalid values before runtime. The type checker enforces valid values at every call site.

**Incorrect: String accepts any value**

```python
def set_log_level(level: str) -> None:
    # Typo "DEUBG" won't be caught until runtime
    valid = {"DEBUG", "INFO", "WARNING", "ERROR"}
    if level not in valid:
        raise ValueError(f"Invalid level: {level}")
    ...

# Caller can pass anything
set_log_level("DEUBG")  # Typo passes type check, fails at runtime
```

**Correct: Literal restricts to valid values**

```python
from typing import Literal

LogLevel = Literal["DEBUG", "INFO", "WARNING", "ERROR"]

def set_log_level(level: LogLevel) -> None:
    # No runtime validation needed - type system guarantees valid input
    ...

# Type checker catches the typo immediately
set_log_level("DEUBG")  # Error: Argument of type "DEUBG" cannot be assigned
set_log_level("DEBUG")  # OK
```

**Common Literal patterns:**

```python
from typing import Literal

# HTTP methods
HttpMethod = Literal["GET", "POST", "PUT", "DELETE", "PATCH"]

# Status values
Status = Literal["pending", "processing", "complete", "failed"]

# Direction/mode values
SortOrder = Literal["asc", "desc"]
Mode = Literal["read", "write", "append"]

# Boolean-like with semantic meaning
OnOff = Literal["on", "off"]  # Clearer than bool for some APIs

# Combining with overloads for return type narrowing
from typing import overload

@overload
def fetch(url: str, format: Literal["json"]) -> dict: ...
@overload
def fetch(url: str, format: Literal["text"]) -> str: ...
def fetch(url: str, format: Literal["json", "text"]) -> dict | str:
    ...
```

---

### PY2.3 Avoid Any Type

**Impact: CRITICAL (Any defeats the purpose of type checking)**

`Any` is a type-checking escape hatch that disables all verification. Code using `Any` can't be validated, and `Any` spreads virally - one `Any` infects everything it touches.

**Incorrect: Any disables type safety**

```python
from typing import Any

def process(data: Any) -> Any:
    # Type checker can't verify anything about this function
    return data.foo.bar()  # Could crash, no warning

# Any spreads to callers
result = process(user)  # result is Any
result.nonexistent_method()  # No error - type checking disabled
```

**Correct: Use specific types or generics**

```python
from typing import TypeVar
from collections.abc import Mapping

# Option 1: Specific type
def process(data: UserData) -> ProcessedResult:
    return ProcessedResult(data.foo.bar())

# Option 2: Generic for flexible but type-safe code
T = TypeVar("T")
def identity(value: T) -> T:
    return value

# Option 3: Protocol for structural typing
from typing import Protocol

class HasFooBar(Protocol):
    @property
    def foo(self) -> "HasBar": ...

class HasBar(Protocol):
    def bar(self) -> str: ...

def process(data: HasFooBar) -> str:
    return data.foo.bar()  # Type-safe access
```

**When Any is acceptable:**

```python
# Truly dynamic code (rare)
def json_loads(s: str) -> Any:  # JSON can be any structure
    ...

# Gradual typing migration (temporary)
def legacy_function(x: Any) -> Any:  # TODO: Add proper types
    ...

# Third-party untyped libraries (use type: ignore comment instead)
result = untyped_library.call()  # type: ignore[no-untyped-call]
```

---

### PY2.4 Optional for Nullable

**Impact: CRITICAL (Explicit null handling prevents surprises)**

Use `X | None` (or `Optional[X]`) to explicitly mark values that can be null. This forces callers to handle the null case and lets the type checker catch missing null checks.

**Incorrect: Implicit nullability**

```python
# Return type doesn't indicate possible None
def find_user(user_id: int) -> User:
    result = db.query(User).filter_by(id=user_id).first()
    return result  # Could be None!

# Caller assumes non-null
user = find_user(123)
print(user.name)  # AttributeError if user is None
```

**Correct: Explicit nullable return**

```python
def find_user(user_id: int) -> User | None:
    return db.query(User).filter_by(id=user_id).first()

# Type checker forces null handling
user = find_user(123)
print(user.name)  # Error: user might be None

# Caller must handle null
user = find_user(123)
if user is not None:
    print(user.name)  # OK - type narrowed to User

# Or use guard clause
user = find_user(123)
if user is None:
    raise NotFoundError(f"User {user_id} not found")
print(user.name)  # OK - type narrowed to User
```

**Nullable patterns:**

```python
# Function parameters with None default
def greet(name: str | None = None) -> str:
    return f"Hello, {name or 'stranger'}!"

# Distinguishing "not provided" from "explicitly None"
from typing import Literal

_UNSET: Literal["_UNSET"] = "_UNSET"

def update(value: str | None | Literal["_UNSET"] = _UNSET) -> None:
    if value is _UNSET:
        return  # Not provided, don't update
    # value is str | None here - explicitly provided

# Optional in containers
def get_values() -> dict[str, int | None]:
    return {"a": 1, "b": None, "c": 3}
```


## Rule Interactions

**TypeHintsRequired + TypeAvoidAny**: These form a progression. TypeHintsRequired ensures annotations exist; TypeAvoidAny ensures they are meaningful. A function annotated as `def process(data: Any) -> Any` satisfies TypeHintsRequired but violates TypeAvoidAny -- the annotations exist but provide no verification.

**TypeLiteralValues + TypeAvoidAny**: Literal types are a stronger alternative to `str` the same way specific types are a stronger alternative to `Any`. Both rules push in the same direction: narrowing types to carry maximum information about valid values.

**TypeOptionalNullable + DefensiveProgramming dimension**: Explicit nullability in the type system creates the contract; defensive LBYL checks enforce it at runtime. When a function returns `User | None`, the type checker forces callers to handle `None`, and LBYL patterns (`if user is None: raise`) provide the runtime safety net.

**TypeHintsRequired + Performance dimension (OrgNoMutableDefaults)**: Type annotations on default parameters reveal mutable default bugs. `def f(items: list[str] = [])` is visually obvious when typed -- the annotation draws attention to the mutable default in a way that untyped code does not.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Untyped public API functions**: Public functions without type annotations cannot be verified by the type checker and force all consumers to guess at the contract. This is the most impactful typing failure because it disables verification across module boundaries.
- **`Any` as a convenience type**: Using `Any` because the correct type is complex (e.g., nested generics) rather than investing in a proper type alias or Protocol. The short-term convenience creates long-term verification blackholes.
- **Implicit None returns**: A function that has a code path returning `None` but whose return type does not include `| None`. The type checker may not catch the `None` and callers will crash with `AttributeError`.

### HIGH

- **Bare `# type: ignore` without error code**: Suppresses all type errors on the line, masking unrelated issues. Always specify the error code: `# type: ignore[assignment]`.
- **Using `dict` where `TypedDict` fits**: When a dictionary has a known, fixed schema (configuration objects, API response shapes), `TypedDict` provides key-level type checking that `dict[str, Any]` cannot.
- **String parameters that should be Literal**: A function parameter typed as `str` that only accepts a known set of values (log levels, HTTP methods, sort directions). Runtime validation catches mistakes late; `Literal` catches them at development time.

### MEDIUM

- **Using concrete collection types in parameters**: `def process(items: list[int])` rejects tuples and other sequences. Using `Sequence[int]` or `Iterable[int]` accepts a wider range of compatible inputs without losing type safety.
- **Missing TypeVar in utility functions**: A utility function that accepts one type and returns the same type, annotated as `def identity(x: object) -> object`, loses the input type. `TypeVar` preserves it: `def identity(x: T) -> T`.

## Examples

**Progressive type narrowing from Any to Literal:**

```python
# Level 0: No types (worst)
def set_log_level(level):
    ...

# Level 1: Basic types (better, still allows invalid values)
def set_log_level(level: str) -> None:
    ...

# Level 2: Literal types (best, catches typos at check time)
LogLevel = Literal["DEBUG", "INFO", "WARNING", "ERROR"]

def set_log_level(level: LogLevel) -> None:
    ...

set_log_level("DEUBG")  # Type error caught immediately
```

**Protocol for structural typing instead of Any:**

```python
# BAD: Any disables all checking
def serialize(obj: Any) -> str:
    return json.dumps(obj.to_dict())  # No guarantee .to_dict() exists

# GOOD: Protocol defines the structural contract
class Serializable(Protocol):
    def to_dict(self) -> dict[str, Any]: ...

def serialize(obj: Serializable) -> str:
    return json.dumps(obj.to_dict())  # Type checker verifies .to_dict() exists
```

**Explicit nullability forcing null handling:**

```python
# BAD: implicit None confuses callers
def find_user(user_id: int) -> User:
    result = db.query(User).filter_by(id=user_id).first()
    return result  # Could be None, but signature says User

# GOOD: explicit None forces handling
def find_user(user_id: int) -> User | None:
    return db.query(User).filter_by(id=user_id).first()

user = find_user(123)
if user is None:
    raise NotFoundError(f"User {user_id} not found")
# Type narrowed to User from here
```

## Does Not Cover

- **Runtime type enforcement** (pydantic, attrs, beartype) -- this dimension covers static type annotations checked by mypy/pyright, not runtime validation libraries.
- **typing.cast() safety** -- runtime cast verification is covered by the Defensive Programming dimension (DefensiveVerifyCasts).
- **Schema validation** for external data (JSON Schema, marshmallow, pydantic models) -- complements type annotations but is a separate concern.
- **Type stub creation** for third-party libraries -- a packaging concern, not a coding standards concern.

## Sources

- minimaxir's Python CLAUDE.md (type hints required, Literal preference, avoid Any)
- Dagster's "Dignified Python" (strict typing philosophy)
- mypy documentation on strict mode and type narrowing
- PEP 484 (Type Hints), PEP 586 (Literal Types), PEP 604 (Union syntax with |)
