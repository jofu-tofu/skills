# Null Safety -- C\#

> Null reference exceptions are the most common runtime crash in C# codebases; the nullable reference types system, combined with disciplined API design, moves null from a runtime surprise to a compile-time decision.

## Mental Model

Every C# reference type historically carried an invisible second value: null. This shadow value flows silently through assignments, method returns, and collection elements until it reaches a member access and detonates as a `NullReferenceException`. The nullable reference types feature, introduced in C# 8, makes that shadow visible. When you enable the nullable context, the compiler tracks which references can be null (`string?`) and which cannot (`string`), and it warns when you treat a maybe-null value as definitely-not-null.

Think of null safety as a contract system. Each method signature becomes a promise: "I will never return null here" or "I might return null here, and you must handle it." When those contracts are enforced by the compiler, the burden shifts from runtime vigilance to compile-time verification. Callers no longer need defensive null checks at every call site -- they only check where the type system says null is possible.

The four rules in this dimension build a complete null safety strategy. **EnableNullableContext** turns on the compiler's tracking, making nullability an explicit part of every type signature. **NeverReturnNull** for collections eliminates the most common source of unnecessary null checks -- when "no results" is represented as an empty collection rather than null, every caller can iterate safely without a guard clause. **NullConditionalOperators** provide concise syntax for navigating nullable chains, replacing deeply nested `if (x != null)` blocks with readable `x?.Property?.Method()` expressions. **RequiredProperties** close the construction gap by ensuring that objects cannot be created with missing mandatory data, catching incomplete initialization at compile time rather than discovering it as a null field at runtime.

Together these rules create a layered defense: the nullable context provides the warning infrastructure, return-type discipline eliminates unnecessary nulls at API boundaries, operators provide safe navigation when null is genuinely possible, and required properties prevent null from entering through object construction.

## Consumer Guide

### When Reviewing Code

- Verify that the project or file has `#nullable enable` or the `.csproj` contains `<Nullable>enable</Nullable>`. Without the nullable context, none of the other rules have compiler backing.
- Flag any method that returns `null` for a collection type. The return type should be `IReadOnlyList<T>` (non-nullable), and the "no results" case should return an empty collection or `[]`.
- Look for verbose nested null checks (`if (x != null) { if (x.Y != null) { ... } }`). Replace these with null-conditional chains (`x?.Y?.Z`).
- Check DTOs, request objects, and configuration classes for properties that must always be set. These should use the `required` modifier (C# 11+) so the compiler rejects incomplete initialization.
- Watch for nullable suppression (`!`) operator usage. Each use is an assertion that bypasses the compiler's null tracking. Flag every instance and verify it is justified with a comment.

### When Designing / Planning

- Decide at the project level whether nullable reference types will be enabled globally (recommended) or file-by-file. Global enablement provides consistent guarantees.
- For every method return type, ask: "Can this legitimately be absent?" If yes, use `T?`. If no, use `T` and ensure the implementation never returns null.
- Design collection-returning APIs to always return non-null collections. Use `IReadOnlyList<T>` as the return type and `[]` or `Array.Empty<T>()` for empty cases.
- For data transfer objects and configuration classes, identify which properties are mandatory at construction time. Mark them `required` and use `init` setters to prevent post-construction mutation.

### When Implementing

- Enable nullable context at the project level in `.csproj`: `<Nullable>enable</Nullable>`. Avoid per-file `#nullable enable` unless migrating incrementally.
- Use `string?`, `User?`, etc. for values that can legitimately be absent. Use non-nullable types for values that must always exist.
- Replace `return null` with `return []` for collection returns. Use `Array.Empty<T>()` when targeting older frameworks without collection expressions.
- Chain null-conditional operators with null-coalescing for defaults: `user?.Address?.City ?? "Unknown"`.
- Use pattern matching (`is not null`, `is { Property: var x }`) for more complex null handling scenarios rather than `!= null`.
- Apply `required` to properties that must be set during initialization. Use `[SetsRequiredMembers]` on constructors that fulfill all requirements.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| EnableNullableContext | CRITICAL | Turn on compiler null tracking to catch null bugs before runtime |
| NeverReturnNull | CRITICAL | Return empty collections instead of null to eliminate caller null checks |
| NullConditionalOperators | CRITICAL | Use `?.` and `??` instead of nested null-check blocks |
| RequiredProperties | CRITICAL | Mark mandatory properties `required` to prevent incomplete construction |


---

### CS2.1 Enable Nullable Reference Types

**Impact: CRITICAL (Compiler catches null bugs before runtime)**

Nullable reference types make null a compile-time concern rather than a runtime crash. The compiler tracks nullability flow and warns about potential null dereferences.

**Incorrect: Nullable context disabled**

```csharp
// Nullable not enabled - compiler doesn't track null
public class UserService
{
    public User GetUser(int id)
    {
        return _repository.Find(id);  // Might return null
    }

    public string GetDisplayName(User user)
    {
        return user.Name;  // NullReferenceException if user is null
    }
}

// Caller has no indication that null is possible
var user = service.GetUser(123);
Console.WriteLine(user.Name);  // Crash at runtime
```

**Correct: Nullable context enabled**

```csharp
#nullable enable

public class UserService
{
    public User? GetUser(int id)
    {
        return _repository.Find(id);  // Return type shows null is possible
    }

    public string GetDisplayName(User user)
    {
        return user.Name ?? "Unknown";  // Handle potential null name
    }
}

// Compiler enforces null checks
var user = service.GetUser(123);
Console.WriteLine(user.Name);  // Warning: user may be null

// Fixed with null check
var user = service.GetUser(123);
if (user is not null)
{
    Console.WriteLine(user.Name);  // OK - null checked
}

// Or with null-conditional
Console.WriteLine(user?.Name ?? "Not found");
```

**Enable project-wide in .csproj:**

```xml
<PropertyGroup>
    <Nullable>enable</Nullable>
</PropertyGroup>
```

**Nullable annotations:**
- `string` - never null
- `string?` - might be null
- `[NotNull]` - parameter validated to be non-null
- `[MaybeNull]` - return value might be null even if type says otherwise

---

### CS2.2 Never Return Null Collections

**Impact: CRITICAL (Eliminates null checks at every call site)**

Returning null for "no items" forces every caller to check for null before iterating. Return empty collections instead - callers can safely iterate without null checks.

**Incorrect: Null for empty collections**

```csharp
public class OrderService
{
    public List<Order>? GetOrdersByUser(int userId)
    {
        var orders = _repository.FindByUser(userId);
        return orders.Any() ? orders : null;  // Null for "no orders"
    }
}

// Every caller must check for null
var orders = service.GetOrdersByUser(userId);
if (orders != null)  // Required null check
{
    foreach (var order in orders)
    {
        // ...
    }
}

// Easy to forget the check
var total = service.GetOrdersByUser(userId).Sum(o => o.Total);  // NullReferenceException
```

**Correct: Empty collection for no items**

```csharp
public class OrderService
{
    public IReadOnlyList<Order> GetOrdersByUser(int userId)
    {
        var orders = _repository.FindByUser(userId);
        return orders;  // Empty list if no orders, never null
    }
}

// Callers can iterate safely without null checks
var orders = service.GetOrdersByUser(userId);
foreach (var order in orders)  // Works for empty list
{
    // ...
}

// LINQ operations work directly
var total = service.GetOrdersByUser(userId).Sum(o => o.Total);  // Returns 0 for empty
```

**Use collection expressions (C# 12+) for empty returns:**

```csharp
public IReadOnlyList<Order> GetPendingOrders()
{
    if (!_hasPendingOrders)
        return [];  // Empty collection expression

    return _repository.GetPending();
}
```

**Standard empty collection patterns:**

```csharp
// Arrays
return Array.Empty<Order>();  // Cached empty array

// Lists (return interface, not concrete type)
return Enumerable.Empty<Order>().ToList();

// Modern C# 12+
return [];  // Collection expression - compiler picks optimal type
```

---

### CS2.3 Use Null-Conditional Operators

**Impact: CRITICAL (Cleaner than nested null checks)**

Null-conditional operators (`?.` and `?[]`) replace verbose nested null checks with concise, readable expressions. They short-circuit on null, returning null instead of throwing.

**Incorrect: Nested null checks**

```csharp
// Deeply nested null checks
string? city = null;
if (user != null)
{
    if (user.Address != null)
    {
        if (user.Address.City != null)
        {
            city = user.Address.City;
        }
    }
}

// Verbose conditional for method calls
string? displayName = null;
if (user != null)
{
    displayName = user.GetDisplayName();
}
```

**Correct: Null-conditional operators**

```csharp
// Chain through nullable references
string? city = user?.Address?.City;

// Method calls
string? displayName = user?.GetDisplayName();

// Array/indexer access
string? firstTag = user?.Tags?[0];

// Combined with null-coalescing for defaults
string city = user?.Address?.City ?? "Unknown";

// Combined with null-coalescing assignment
user ??= new User();  // Assign only if null
```

**Null-conditional with delegates:**

```csharp
// Instead of checking delegate for null
if (OnUserCreated != null)
{
    OnUserCreated(user);
}

// Use null-conditional invoke
OnUserCreated?.Invoke(user);
```

**Pattern matching for more complex scenarios:**

```csharp
// When you need to do more than just access
if (user?.Address is { City: var city, PostalCode: var zip })
{
    Console.WriteLine($"{city}, {zip}");
}

// Switch expression with null handling
var status = user?.Status switch
{
    UserStatus.Active => "Active",
    UserStatus.Pending => "Pending",
    null => "Unknown",
    _ => "Other"
};
```

---

### CS2.4 Required Properties

**Impact: CRITICAL (Prevents incomplete object construction) - C# 11+**

The `required` modifier ensures properties must be set during object initialization. This catches missing required data at compile time rather than discovering it as null at runtime.

**Incorrect: Optional properties with runtime validation**

```csharp
public class CreateUserRequest
{
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string? Password { get; set; }
}

// Compiler allows incomplete initialization
var request = new CreateUserRequest
{
    Email = "user@example.com"
    // Name and Password forgotten - compiles fine
};

// Must validate at runtime
if (string.IsNullOrEmpty(request.Name))
    throw new ValidationException("Name is required");  // Runtime crash
```

**Correct: Required properties enforce initialization**

```csharp
public class CreateUserRequest
{
    public required string Email { get; init; }
    public required string Name { get; init; }
    public required string Password { get; init; }
    public string? OptionalNickname { get; init; }  // Truly optional
}

// Compiler error if required properties are missing
var request = new CreateUserRequest
{
    Email = "user@example.com"
    // Error CS9035: Required member 'Name' must be set
    // Error CS9035: Required member 'Password' must be set
};

// Must provide all required properties
var request = new CreateUserRequest
{
    Email = "user@example.com",
    Name = "John Doe",
    Password = "secure123"
    // OptionalNickname can be omitted
};
```

**With primary constructors (C# 12+):**

```csharp
public class User(string email, string name)
{
    public string Email { get; } = email;
    public string Name { get; } = name;
    public string? Bio { get; init; }  // Optional via init
}

// Constructor enforces required parameters
var user = new User("user@example.com", "John");
```

**SetsRequiredMembers for constructor initialization:**

```csharp
public class Config
{
    public required string ConnectionString { get; init; }
    public required int Timeout { get; init; }

    [SetsRequiredMembers]
    public Config(string connectionString, int timeout)
    {
        ConnectionString = connectionString;
        Timeout = timeout;
    }
}
```


## Rule Interactions

- **EnableNullableContext + NeverReturnNull**: The nullable context makes the non-nullable return type a compiler-enforced contract. When `GetOrders()` returns `IReadOnlyList<Order>` (not `IReadOnlyList<Order>?`), the compiler guarantees callers will never receive null, and the compiler will warn inside the implementation if a code path could return null.
- **EnableNullableContext + NullConditionalOperators**: The nullable context tells you where null is possible. Null-conditional operators are the tool for safely navigating those nullable paths. Without the context, you cannot tell which chains genuinely need `?.`.
- **NeverReturnNull + RequiredProperties**: Both rules attack the same problem from opposite ends. NeverReturnNull ensures methods do not produce unnecessary nulls. RequiredProperties ensures objects are not constructed with missing data. Together they minimize the number of nullable references flowing through the system.
- **NullConditionalOperators + RequiredProperties**: When required properties guarantee that an object's mandatory fields are populated, null-conditional navigation is only needed for genuinely optional nested properties, reducing operator noise.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Nullable context disabled on a project with runtime NullReferenceExceptions**: The compiler cannot help if the feature is off. Enable it globally and address warnings incrementally.
- **Returning null for collections**: `return null` where `return []` should be used forces every caller into a null check. A single missed check produces a runtime crash.

### HIGH

- **Excessive nullable suppression (`!`)**: Each `!` is an unchecked assertion. More than a few per file suggests the nullable annotations are wrong or the code is fighting the type system.
- **Using `string.IsNullOrEmpty()` checks instead of nullable types**: When the nullable context is enabled, relying on runtime string checks rather than `string?` annotations bypasses compile-time safety.

### MEDIUM

- **Optional properties that should be required**: A DTO where `Email` is `string?` but every consumer throws if it is null. The property should be `required string Email { get; init; }`.
- **Overusing null-coalescing assignment**: `x ??= new Foo()` is convenient but can mask design issues where the value should have been required at construction time.

## Examples

**Nullable context with safe collection returns**:

```csharp
#nullable enable

public class OrderService
{
    private readonly IOrderRepository _repository;

    public OrderService(IOrderRepository repository) => _repository = repository;

    // Non-nullable return: callers never need to check for null
    public IReadOnlyList<Order> GetOrdersByUser(int userId)
    {
        var orders = _repository.FindByUser(userId);
        return orders.Any() ? orders : [];
    }

    // Nullable return: caller must handle absence
    public Order? GetOrderById(int id)
    {
        return _repository.Find(id);
    }
}

// Caller code -- compiler guides usage
var orders = service.GetOrdersByUser(userId);
foreach (var order in orders) // Safe: never null
{
    Console.WriteLine(order.Total);
}

var order = service.GetOrderById(42);
if (order is not null) // Required: type is Order?
{
    Console.WriteLine(order.Total);
}
```

**Required properties preventing incomplete construction**:

```csharp
public class CreateUserRequest
{
    public required string Email { get; init; }
    public required string Name { get; init; }
    public required string Password { get; init; }
    public string? Nickname { get; init; } // Genuinely optional
}

// Compile error if required properties are missing
var request = new CreateUserRequest
{
    Email = "user@example.com",
    Name = "Jane Doe",
    Password = "secure"
    // Nickname can be omitted -- it is truly optional
};
```

## Does Not Cover

- **Type design and class structure** -- deciding how many classes to create and how they relate is covered by the Architecture dimension (CS1).
- **Async null patterns** -- how to handle null in async method returns (e.g., `Task<User?>`) is covered by the Async Patterns dimension (CS3).
- **Validation frameworks** -- runtime validation with FluentValidation or DataAnnotations is a separate concern from compile-time null safety.
- **Database NULL mapping** -- how Entity Framework maps nullable columns is an ORM concern, not a language-level null safety rule.

## Sources

- Microsoft Learn -- Nullable reference types documentation
- C# Coding Guidelines (csharpcodingguidelines.com) -- AV1130, AV1135 (Null Safety)
- .NET API Design Guidelines -- Null and empty collection conventions
