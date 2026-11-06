# Type System -- Python

> Treat type annotations as executable documentation that prevents entire categories of bugs before any code runs.

## Mental Model

Python's type system is optional and gradual -- the interpreter ignores annotations at runtime, and you can add types to some functions while leaving others untyped. This flexibility is both its greatest strength and its greatest risk. The strength is that you can adopt types incrementally in a million-line codebase. The risk is that developers treat types as optional decoration rather than as a structural contract, leading to codebases where some paths are verified and others are not, with `Any` silently bridging the gaps.

The mental model for this dimension is: **types are the first line of defense**. Before defensive runtime checks (dimension PY1), before tests, before code review, the type checker can verify that functions receive and return the correct types, that nullable values are handled, that string constants match a known set, and that generic containers preserve their element types through transformations. Every function signature without type hints is a missed opportunity to catch bugs automatically.

`Any` allows unchecked operations and can propagate through derived expressions. It does not disable all checking in every consumer: an explicitly annotated variable can retain its declared static type after assignment from `Any`. Review the actual loss of checking against the project contract. Gradual migration and intentional dynamic boundaries may legitimately use `Any`; its presence alone does not establish critical harm. See [mypy dynamic typing](https://mypy.readthedocs.io/en/stable/dynamic_typing.html) and the [typing specification](https://typing.python.org/en/latest/spec/special-types.html#any).

`Literal` types take this a step further by restricting values, not just types. A parameter typed as `str` accepts any string; a parameter typed as `Literal["GET", "POST", "PUT", "DELETE"]` only accepts those four values. The type checker catches typos at development time rather than runtime, and the set of valid values is documented directly in the signature. This is especially valuable for configuration options, status strings, mode flags, and any parameter where only specific values are meaningful.

`Optional[X]` (or `X | None`) records that absence is permitted. A configured checker can reject operations requiring a non-null value until the type is narrowed; operations that already accept `None` remain valid. Incorrect annotations, `Any`, casts and suppressed diagnostics can still hide a mismatch, so inspect the actual boundary rather than treating annotations as runtime enforcement.

Set the checking goal from project policy and migration scope. A clean strict-checker run supplies useful static evidence, but does not prove that every closed set uses `Literal`, every dynamic boundary is justified, or runtime inputs satisfy annotations. Inspect those contracts separately and preserve checker/version limits.

## Consumer Guide

### When Reviewing Code

Read the project's typing policy and checker configuration first. Check required annotations, unintended loss of checking through `Any`, closed value sets that could use `Literal`, and mismatches between nullable results and caller assumptions. Generic types can preserve input/output relationships. Documented gradual migration, dynamic boundaries and checker-specific suppressions may be valid. Narrow suppression codes where the checker supports them; establish an actual policy violation or hidden error rather than assigning severity from syntax alone.

### When Designing / Planning

When designing interfaces, start with the type signatures before writing implementation. The signature is the contract: it tells consumers what they must provide and what they will receive. Use `Protocol` for structural typing when you need duck-typing compatibility but still want type safety. Plan your generic types (`TypeVar`, `ParamSpec`) for utility functions that must work across multiple types. When designing APIs that accept configuration options or mode strings, define `Literal` type aliases up front so the valid values are centralized and enforced. When designing return types, explicitly decide whether `None` is a valid return and annotate accordingly -- do not let implicit `None` returns leak through.

### When Implementing

Follow the project's typing and gradual-migration policy; complete annotations where that contract requires them. Use modern syntax: `list[int]` instead of `List[int]`, `dict[str, Any]` instead of `Dict[str, Any]`, `X | None` instead of `Optional[X]` (Python 3.10+, or with `from __future__ import annotations`). Prefer `collections.abc` abstract types (`Mapping`, `Sequence`, `Iterator`) over concrete types (`dict`, `list`) in function parameters to accept the widest range of compatible inputs. Use `TypeVar` for functions that preserve input types. Create `Literal` type aliases for any parameter where the set of valid values is known and small. When dealing with third-party untyped libraries, create typed wrapper functions rather than letting `Any` propagate into your codebase.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| TypeHintsRequired | Context-dependent | Apply the project typing policy; allow documented gradual-migration boundaries |
| TypeLiteralValues | Context-dependent | Use Literal types instead of bare str/int for parameters with known value sets |
| TypeAvoidAny | Context-dependent | Avoid Any -- use specific types, generics, or Protocol for structural typing |
| TypeOptionalNullable | Context-dependent | Describe nullable contracts accurately and check callers under the configured checker |


---

### PY2.1 Type Hints Required

**Impact: Context-dependent (Check the project typing contract and demonstrated consequence)**

Type hints can expose errors to a configured checker and support IDE navigation. They are not guaranteed accurate documentation or runtime enforcement; inspect actual checked boundaries and deliberate dynamic interfaces before reporting a defect.

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

**Impact: Context-dependent (Check the project typing contract and demonstrated consequence)**

`Literal` describes allowed constants to a static checker. It can catch incompatible checked calls, but Python does not enforce it at runtime; unchecked callers, `Any` and external data can bypass that evidence. Keep runtime validation at untrusted boundaries. A validated internal caller need not repeat the same check solely because annotations exist.

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

**Correct: Literal supports checked calls; the public boundary still validates**

```python
from typing import Literal

LogLevel = Literal["DEBUG", "INFO", "WARNING", "ERROR"]

def set_log_level(level: LogLevel) -> None:
    if level not in {"DEBUG", "INFO", "WARNING", "ERROR"}:
        raise ValueError(f"Invalid level: {level}")
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

**Impact: Context-dependent (Check the project typing contract and demonstrated consequence)**

`Any` permits operations without ordinary static type constraints and can propagate through inferred expressions. It does not erase unrelated checking or explicit type boundaries. Determine whether that loss of checking is intentional and acceptable before proposing a narrower type.

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

**Impact: Context-dependent (Check the project typing contract and demonstrated consequence)**

Use `X | None` (or `Optional[X]`) to mark permitted absence. A configured checker can catch an operation that requires a non-null value without appropriate narrowing; operations that accept `None` need no extra guard. An annotation does not validate runtime input.

**Incorrect: Implicit nullability**

```python
# Return type doesn't indicate possible None
def find_user(user_id: int) -> User:
    result = db.query(User).filter_by(id=user_id).first()
    return result  # Could be None!

# Caller assumes non-null
user_id = 123
user = find_user(user_id)
print(user.name)  # AttributeError if user is None
```

**Correct: Explicit nullable return**

```python
def find_user(user_id: int) -> User | None:
    return db.query(User).filter_by(id=user_id).first()

# Type checker forces null handling
user_id = 123
user = find_user(user_id)
print(user.name)  # Error: user might be None

# Caller must handle null
user_id = 123
user = find_user(user_id)
if user is not None:
    print(user.name)  # OK - type narrowed to User

# Or use guard clause
user_id = 123
user = find_user(user_id)
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
from enum import Enum

class _Missing(Enum):
    TOKEN = 0

_UNSET = _Missing.TOKEN

def update(value: str | None | _Missing = _UNSET) -> None:
    if value is _Missing.TOKEN:
        return  # Not provided, don't update
    # value is str | None here - explicitly provided

# Optional in containers
def get_values() -> dict[str, int | None]:
    return {"a": 1, "b": None, "c": 3}
```


## Rule Interactions

**TypeHintsRequired + TypeAvoidAny**: These form a progression. TypeHintsRequired ensures annotations exist; TypeAvoidAny ensures they are meaningful. A function annotated as `def process(data: Any) -> Any` has annotations but does not constrain that input/output relationship. Check whether it is an intentional dynamic or migration boundary before reporting a policy violation.

**TypeLiteralValues + TypeAvoidAny**: Literal types are a stronger alternative to `str` the same way specific types are a stronger alternative to `Any`. Both rules push in the same direction: narrowing types to carry maximum information about valid values.

**TypeOptionalNullable + DefensiveProgramming dimension**: Explicit nullability documents the static contract. Choose runtime handling from the actual boundary and required behavior: a guard, pattern match, deliberate exception policy or operation accepting `None` may be appropriate. Neither an annotation nor a `None` guard validates every aspect of an external value.

**TypeHintsRequired + Performance dimension (OrgNoMutableDefaults)**: Type annotations on default parameters reveal mutable default bugs. `def f(items: list[str] = [])` is visually obvious when typed -- the annotation draws attention to the mutable default in a way that untyped code does not.

## Review prompts and severity calibration

The categories below group review prompts, not predetermined finding severities. First establish the applicable project/version contract, valid alternatives and concrete consequence. A style or design preference alone is LOW or omitted; HIGH/CRITICAL requires corresponding demonstrated harm.

### Check potentially consequential contract failures

- **Untyped public API functions**: Public functions without type annotations cannot be verified by the type checker and force all consumers to guess at the contract. This is the most impactful typing failure because it disables verification across module boundaries.
- **`Any` as a convenience type**: Using `Any` because the correct type is complex (e.g., nested generics) rather than investing in a proper type alias or Protocol. The short-term convenience creates long-term verification blackholes.
- **Implicit None returns**: A function that has a code path returning `None` but whose return type does not include `| None`. The type checker may not catch the `None` and callers will crash with `AttributeError`.

### Check behavior and workload consequences

- **Bare `# type: ignore` without error code**: Suppresses all type errors on the line, masking unrelated issues. Prefer a specific code such as `# type: ignore[assignment]` when supported by the configured checker and project policy.
- **Using `dict` where `TypedDict` fits**: When a dictionary has a known, fixed schema (configuration objects, API response shapes), `TypedDict` provides key-level type checking that `dict[str, Any]` cannot.
- **String parameters that should be Literal**: A function parameter typed as `str` that only accepts a known set of values (log levels, HTTP methods, sort directions). Runtime validation catches mistakes late; `Literal` catches them at development time.

### Check maintainability and explicit policy

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
# Any leaves this attribute access unchecked unless the boundary is constrained elsewhere
def serialize(obj: Any) -> str:
    return json.dumps(obj.to_dict())  # No guarantee .to_dict() exists

# GOOD: Protocol defines the structural contract
class Serializable(Protocol):
    def to_dict(self) -> dict[str, Any]: ...

def serialize(obj: Serializable) -> str:
    return json.dumps(obj.to_dict())  # Type checker verifies .to_dict() exists
```

**Explicit nullability documents permitted absence:**

```python
# BAD: implicit None confuses callers
def find_user(user_id: int) -> User:
    result = db.query(User).filter_by(id=user_id).first()
    return result  # Could be None, but signature says User

# Explicit None supports narrowing before operations requiring a User
def find_user(user_id: int) -> User | None:
    return db.query(User).filter_by(id=user_id).first()

user_id = 123
user = find_user(user_id)
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
- [Python typing: annotations are not enforced at runtime](https://docs.python.org/3/library/typing.html)
