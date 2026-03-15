# Member Design -- C\#

> Well-designed members -- methods, properties, and fields -- form the API surface that other code touches daily; getting signatures, visibility, and size right determines whether a codebase is a pleasure or a burden to work in.

## Mental Model

If architecture is about the shape of classes and their relationships, member design is about the shape of each class's surface. Every public method, property, and field is a promise to callers. The promise says: "Call me with these inputs, and I will give you this output, at this cost, with these guarantees." When those promises are well-crafted -- specific parameters, immutable returns, cheap property access, small focused methods, meaningful constants, and minimal visibility -- callers can write correct code almost by instinct. When they are poorly crafted, callers make assumptions that the implementation violates.

The six rules in this dimension address complementary aspects of member surface quality:

**ReturnImmutableCollections** ensures that returning a collection does not hand callers a reference to internal state. A `List<T>` return is a backdoor: callers can add, remove, or clear items and corrupt the object's invariants. Returning `IReadOnlyList<T>` closes that door while still allowing efficient enumeration and indexing.

**MethodOverProperty** draws the boundary between cheap access and expensive operations. Properties should behave like field access -- fast, idempotent, side-effect free. When an operation queries a database, generates a report, or performs any non-trivial computation, it should be a method. The naming convention alone (`report.Title` vs. `report.GenerateFullReport()`) signals to callers whether caching is needed.

**SpecificParameters** enforces minimal coupling at the method level. A method that accepts an entire `Order` object when it only uses `Order.TotalWeight` is coupled to the `Order` class and harder to test. Accepting `decimal totalWeight` or `IEnumerable<decimal> itemWeights` reduces coupling and makes the method reusable with any source of weight data.

**SmallMethods** limits method complexity. A method that fits on one screen (roughly 20-30 lines) has a single purpose, is easy to name, and is straightforward to test. Long methods mix multiple concerns: validation, data fetching, computation, and persistence interleaved in a single block. Extracting each concern into a named helper method makes the orchestration method read like a narrative.

**NoMagicNumbers** requires that literal values in code carry names. The number `0.08m` means nothing; `TaxRate` is self-documenting. Named constants also centralize changes: updating a rate in one constant propagates everywhere, while hunting for scattered `0.08m` literals risks missed updates.

**PrivateByDefault** establishes the visibility rule: everything starts `private` and is promoted only when a concrete need arises. Every public member is a commitment. Making something public that could be private creates coupling that constrains future refactoring.

Together these six rules create a coherent design philosophy: expose the minimum surface, make it self-documenting, keep it cheap and safe, and ensure each member has one clear purpose.

## Consumer Guide

### When Reviewing Code

- Check every method that returns a collection. If the return type is `List<T>`, `Dictionary<TKey, TValue>`, or another mutable type, flag it. The return should be `IReadOnlyList<T>`, `IReadOnlyDictionary<TKey, TValue>`, or an immutable equivalent.
- Look at property getters for expensive operations: database queries, file I/O, complex calculations, or network calls. These should be methods, not properties.
- Examine method signatures for over-broad parameter types. A method accepting `User user` but only accessing `user.Email` should accept `string email` instead.
- Flag methods longer than 30 lines. Look for natural boundaries where the method can be decomposed into named helpers.
- Search for literal numbers in logic (especially in conditionals, loop bounds, and arithmetic). Each should be a named constant unless it is a universally obvious value like 0, 1, or 100.
- Check visibility modifiers. If a method or property is `public` or `internal` but is only called from within the same class, it should be `private`.

### When Designing / Planning

- Define the public API of a class before implementing it. List only the methods and properties that external callers genuinely need. Everything else is private.
- For each public method, decide what the minimum set of parameters is. Accept interfaces (`IEnumerable<T>`, `IReadOnlyList<T>`) rather than concrete types when possible.
- Plan collection-returning methods to use read-only interfaces from the start. Changing a return type from `List<T>` to `IReadOnlyList<T>` later is a breaking change for callers that relied on mutability.
- Identify business constants (rates, limits, thresholds) during design and name them in a central location or within the relevant class.

### When Implementing

- Return `IReadOnlyList<T>` for ordered collections and `IReadOnlyCollection<T>` when order does not matter. Use `.AsReadOnly()` or collection expressions `[.._items]` for the backing implementation.
- Convert properties with side effects, I/O operations, or O(n) or worse complexity into methods. Name them as verbs: `CalculateTotal()`, `FetchCurrentPrice()`.
- Accept the narrowest parameter type that satisfies the method's needs. Prefer `string email` over `User user`, and `IEnumerable<decimal> weights` over `List<OrderItem> items`.
- Extract methods when a block of code within a method serves a distinct purpose. Name the extracted method to describe that purpose, making the calling method read as a sequence of steps.
- Declare constants with `const` for compile-time values and `static readonly` for values that require runtime initialization. Group related constants together.
- Start every new field, method, and class as `private`. Promote to `internal` when needed by another class in the same assembly, and to `public` only for the intentional external API.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| ReturnImmutableCollections | HIGH | Return IReadOnlyList/IReadOnlyCollection to prevent callers from mutating internal state |
| MethodOverProperty | HIGH | Use methods for expensive or side-effecting operations; properties should be cheap |
| SpecificParameters | HIGH | Accept only the data a method needs, not entire parent objects |
| SmallMethods | MEDIUM | Keep methods under 30 lines with a single clear purpose |
| NoMagicNumbers | MEDIUM | Replace literal values with named constants that explain intent |
| PrivateByDefault | MEDIUM | Start with private visibility and widen only when explicitly needed |


---

### CS4.1 Return Immutable Collections

**Impact: HIGH (Prevents callers from mutating internal state)**

Returning mutable collections exposes internal state. Callers can modify the returned collection, corrupting the object's data. Return immutable or read-only views instead.

**Incorrect: Returning mutable internal collection**

```csharp
public class ShoppingCart
{
    private readonly List<Item> _items = [];

    public List<Item> GetItems()
    {
        return _items;  // Caller gets reference to internal list
    }
}

// Caller can corrupt internal state
var cart = new ShoppingCart();
cart.AddItem(new Item("Book"));

var items = cart.GetItems();
items.Clear();  // Cart's internal state destroyed!
items.Add(new Item("Fake"));  // Injected unauthorized item
```

**Correct: Return read-only views**

```csharp
public class ShoppingCart
{
    private readonly List<Item> _items = [];

    // Option 1: IReadOnlyList property (preferred)
    public IReadOnlyList<Item> Items => _items;

    // Option 2: AsReadOnly() for List<T>
    public IReadOnlyList<Item> GetItems() => _items.AsReadOnly();

    // Option 3: Return copy if mutation of copy is needed
    public List<Item> GetItemsCopy() => [.._items];

    // Option 4: ImmutableList for full immutability guarantees
    public ImmutableList<Item> GetImmutableItems() => [.._items];
}

// Caller can read but not modify
var items = cart.Items;
// items.Clear();  // Won't compile - no Clear on IReadOnlyList
// items.Add(...); // Won't compile - no Add on IReadOnlyList
```

**Collection expression patterns (C# 12+):**

```csharp
public class UserGroup
{
    private readonly List<User> _members = [];

    // Return as read-only
    public IReadOnlyList<User> Members => _members;

    // Filter and return new immutable collection
    public IReadOnlyList<User> GetActiveMembers() =>
        [.. _members.Where(m => m.IsActive)];

    // Combine collections into new immutable result
    public IReadOnlyList<User> GetAllUsers(IEnumerable<User> additional) =>
        [.. _members, .. additional];
}
```

---

### CS4.2 Use Methods for Expensive Operations

**Impact: HIGH (Properties imply cheap access)**

Properties should be fast and side-effect free. Developers expect properties to behave like field access - reading a property multiple times should be safe and cheap. Use methods when operations are expensive or have side effects.

**Incorrect: Expensive operations as properties**

```csharp
public class ReportGenerator
{
    // Looks cheap, actually expensive
    public Report FullReport
    {
        get
        {
            // Takes seconds, called every time property is read
            return GenerateFullReport(_data);
        }
    }

    // Side effect in property getter
    public User CurrentUser
    {
        get
        {
            _accessCount++;  // Side effect!
            return _user;
        }
    }

    // Network call hidden in property
    public decimal StockPrice => FetchCurrentPrice(_symbol);
}

// Caller assumes this is cheap
for (int i = 0; i < 10; i++)
{
    Console.WriteLine(generator.FullReport.Title);  // 10 full reports generated!
}
```

**Correct: Methods signal cost, properties are cheap**

```csharp
public class ReportGenerator
{
    // Method signals this might take time
    public Report GenerateFullReport()
    {
        return GenerateFullReport(_data);
    }

    // Property is just field access
    public User CurrentUser => _user;

    // Separate property for access tracking
    public int AccessCount => _accessCount;
    public void RecordAccess() => _accessCount++;

    // Method for network operations
    public async Task<decimal> FetchStockPriceAsync()
    {
        return await FetchCurrentPrice(_symbol);
    }
}

// Caller knows to cache the result
var report = generator.GenerateFullReport();
for (int i = 0; i < 10; i++)
{
    Console.WriteLine(report.Title);  // Reuses single report
}
```

**Property guidelines:**
- Should complete instantly (O(1) or close)
- Should be idempotent (same value on repeated reads)
- Should have no visible side effects
- Use `Async` suffix for async operations (always methods)

---

### CS4.3 Accept Specific Parameters

**Impact: HIGH (Accept only needed data, not entire objects)**

Methods should accept only the data they need, not entire objects containing that data. This reduces coupling, improves testability, and makes dependencies explicit.

**Incorrect: Accepting entire objects**

```csharp
// Takes entire User when only email is needed
public void SendWelcomeEmail(User user)
{
    _emailService.Send(user.Email, "Welcome!");
}

// Takes entire Order when only calculating shipping
public decimal CalculateShipping(Order order)
{
    return order.Items.Sum(i => i.Weight) * _ratePerKg;
}

// Hard to test - must construct entire Order
[Test]
public void CalculateShipping_ReturnsCorrectAmount()
{
    var order = new Order
    {
        Id = 1,
        UserId = 1,
        CreatedAt = DateTime.Now,
        Status = OrderStatus.Pending,
        // ... many other required properties
        Items = [new OrderItem { Weight = 2.5m }]
    };
    var result = _service.CalculateShipping(order);
}
```

**Correct: Accept only what's needed**

```csharp
// Takes only what's needed
public void SendWelcomeEmail(string email)
{
    _emailService.Send(email, "Welcome!");
}

// Takes the specific data required
public decimal CalculateShipping(IEnumerable<decimal> itemWeights)
{
    return itemWeights.Sum() * _ratePerKg;
}

// Or with a focused interface
public interface IShippable
{
    decimal TotalWeight { get; }
}

public decimal CalculateShipping(IShippable item)
{
    return item.TotalWeight * _ratePerKg;
}

// Easy to test
[Test]
public void CalculateShipping_ReturnsCorrectAmount()
{
    var weights = new[] { 2.5m, 1.0m };
    var result = _service.CalculateShipping(weights);
    Assert.Equal(3.5m * _ratePerKg, result);
}
```

**Benefits:**
- Clearer API - parameters show what's actually used
- Easier testing - no need to construct complex objects
- Better reusability - works with any source of the data
- Reduced coupling - method doesn't depend on User/Order structure

---

### CS4.4 Keep Methods Small

**Impact: MEDIUM (Easier to understand, test, and modify)**

Small methods with clear names are easier to read, test, and modify. Long methods mix multiple concerns, making bugs harder to find and changes riskier.

**Incorrect: Large method with multiple concerns**

```csharp
public async Task<OrderResult> ProcessOrder(Order order)
{
    // Validation (lines 1-20)
    if (order.Items.Count == 0)
        return OrderResult.Failed("No items");
    if (order.CustomerId <= 0)
        return OrderResult.Failed("Invalid customer");
    foreach (var item in order.Items)
    {
        if (item.Quantity <= 0)
            return OrderResult.Failed("Invalid quantity");
        // ... more validation
    }

    // Inventory check (lines 21-40)
    foreach (var item in order.Items)
    {
        var stock = await _inventory.GetStock(item.ProductId);
        if (stock < item.Quantity)
            return OrderResult.Failed("Insufficient stock");
        // ... more inventory logic
    }

    // Price calculation (lines 41-70)
    decimal subtotal = 0;
    foreach (var item in order.Items)
    {
        var price = await _pricing.GetPrice(item.ProductId);
        subtotal += price * item.Quantity;
        // ... discounts, taxes
    }

    // Payment processing (lines 71-100)
    // ... payment logic

    // Order creation (lines 101-130)
    // ... persistence logic

    return OrderResult.Success(orderId);
}
```

**Correct: Small methods with single purpose**

```csharp
public async Task<OrderResult> ProcessOrder(Order order)
{
    var validation = ValidateOrder(order);
    if (!validation.IsValid)
        return OrderResult.Failed(validation.Error);

    var stockCheck = await CheckInventoryAsync(order.Items);
    if (!stockCheck.Available)
        return OrderResult.Failed("Insufficient stock");

    var pricing = await CalculatePricingAsync(order.Items);

    var payment = await ProcessPaymentAsync(order.CustomerId, pricing.Total);
    if (!payment.Success)
        return OrderResult.Failed(payment.Error);

    var orderId = await CreateOrderAsync(order, pricing, payment);

    return OrderResult.Success(orderId);
}

private ValidationResult ValidateOrder(Order order)
{
    if (order.Items.Count == 0)
        return ValidationResult.Invalid("No items");
    if (order.CustomerId <= 0)
        return ValidationResult.Invalid("Invalid customer");
    // Focused validation logic
    return ValidationResult.Valid();
}

private async Task<StockCheckResult> CheckInventoryAsync(IEnumerable<OrderItem> items)
{
    // Focused inventory logic
}

private async Task<PricingResult> CalculatePricingAsync(IEnumerable<OrderItem> items)
{
    // Focused pricing logic
}
```

**Guideline: Methods should fit on one screen (~20-30 lines)**

---

### CS4.5 No Magic Numbers

**Impact: MEDIUM (Named constants explain intent)**

Literal numbers scattered through code are "magic" - their meaning is unclear. Named constants make code self-documenting and changes safer (update one place, not many).

**Incorrect: Magic numbers**

```csharp
public class OrderProcessor
{
    public decimal CalculateTotal(decimal subtotal)
    {
        // What is 0.08? Tax rate? Which jurisdiction?
        var tax = subtotal * 0.08m;

        // What is 100? Minimum for free shipping?
        if (subtotal > 100)
            return subtotal + tax;

        // What is 5.99? Shipping cost?
        return subtotal + tax + 5.99m;
    }

    public bool IsValidOrder(Order order)
    {
        // What do these numbers mean?
        return order.Items.Count <= 50
            && order.Items.All(i => i.Quantity <= 999)
            && order.TotalWeight <= 70;
    }
}
```

**Correct: Named constants**

```csharp
public class OrderProcessor
{
    private const decimal TaxRate = 0.08m;
    private const decimal FreeShippingThreshold = 100m;
    private const decimal StandardShippingCost = 5.99m;

    private const int MaxItemsPerOrder = 50;
    private const int MaxQuantityPerItem = 999;
    private const decimal MaxShippingWeightKg = 70m;

    public decimal CalculateTotal(decimal subtotal)
    {
        var tax = subtotal * TaxRate;

        if (subtotal > FreeShippingThreshold)
            return subtotal + tax;

        return subtotal + tax + StandardShippingCost;
    }

    public bool IsValidOrder(Order order)
    {
        return order.Items.Count <= MaxItemsPerOrder
            && order.Items.All(i => i.Quantity <= MaxQuantityPerItem)
            && order.TotalWeight <= MaxShippingWeightKg;
    }
}
```

**When literals are acceptable:**
- 0, 1, -1 in obvious contexts (initialization, increment)
- Mathematical constants (2 for doubling, 100 for percentage)
- Array indices when meaning is clear from context

```csharp
// These are fine
for (int i = 0; i < items.Count; i++)  // 0 is obvious
var doubled = value * 2;  // 2 is obvious
var percentage = ratio * 100;  // 100 is obvious
```

---

### CS4.6 Private by Default

**Impact: MEDIUM (Start restrictive, open up as needed)**

Making members public exposes implementation details and creates maintenance burden. Start with `private`, only increase visibility when there's a clear need. It's easy to make private things public later, but hard to make public things private.

**Incorrect: Everything public**

```csharp
public class UserService
{
    public IDbConnection Connection;  // Internal detail exposed
    public ILogger Logger;  // Internal detail exposed

    public string ConnectionString;  // Sensitive data exposed
    public int RetryCount = 3;  // Configuration as public field

    public void ValidateInternal(User user) { }  // Helper exposed
    public User TransformUser(User user) { }  // Helper exposed

    public User GetUser(int id)
    {
        ValidateInternal(user);  // Implementation detail
        return TransformUser(LoadFromDb(id));
    }
}

// Users depend on internal details
var service = new UserService();
service.Connection = null;  // Can break internal state
service.ValidateInternal(user);  // Calling internal helper
```

**Correct: Minimal public surface**

```csharp
public class UserService
{
    private readonly IDbConnection _connection;
    private readonly ILogger _logger;
    private readonly UserServiceOptions _options;

    public UserService(
        IDbConnection connection,
        ILogger logger,
        UserServiceOptions options)
    {
        _connection = connection;
        _logger = logger;
        _options = options;
    }

    // Only truly public operations
    public User? GetUser(int id)
    {
        Validate(id);
        return Transform(LoadFromDb(id));
    }

    public void CreateUser(User user)
    {
        ValidateUser(user);
        SaveToDb(user);
    }

    // Internal helpers are private
    private void Validate(int id) { }
    private void ValidateUser(User user) { }
    private User? LoadFromDb(int id) { }
    private void SaveToDb(User user) { }
    private User Transform(User? user) { }
}
```

**Visibility guidelines:**
- `private` - default for fields and helper methods
- `private protected` - subclass access in same assembly
- `protected` - subclass access (use sparingly)
- `internal` - assembly access for shared utilities
- `public` - only for intentional API surface


## Rule Interactions

- **ReturnImmutableCollections + PrivateByDefault**: Encapsulation works at two levels. PrivateByDefault hides the member entirely; ReturnImmutableCollections protects the data that must be exposed. A private backing `List<T>` exposed through a public `IReadOnlyList<T>` property is a textbook combination.
- **SpecificParameters + SmallMethods**: Methods with specific, narrow parameters tend to be small because they do less. A method that accepts three scalar values rather than an entire entity has a naturally constrained scope.
- **MethodOverProperty + SmallMethods**: Converting an expensive property into a method often reveals that the computation itself can be decomposed into smaller helper methods, further improving readability.
- **NoMagicNumbers + SmallMethods**: Named constants improve readability in any method, but the effect is most pronounced in small methods where the constant's role in the logic is immediately visible.
- **PrivateByDefault + SpecificParameters**: When internal helper methods are private, their parameter types can be changed freely without breaking external callers. This freedom encourages using the most specific parameter type.
- **ReturnImmutableCollections + SpecificParameters**: A method that returns `IReadOnlyList<T>` and accepts `IEnumerable<T>` communicates a clear contract: "Give me any sequence, I will give you back an immutable snapshot."

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Mutable collection return exposing internal state**: `public List<Item> Items => _items;` allows callers to `.Clear()` or `.Add()` arbitrary items, bypassing all validation and invariant enforcement. This can corrupt data silently.

### HIGH

- **Expensive property with database access**: A property getter that executes a SQL query. Callers will read it repeatedly (in loops, in templates, in logging) without realizing each read hits the database. Convert to an async method.
- **God method**: A single method of 200+ lines handling validation, business logic, persistence, and notification. Bugs hide in the interleaved concerns and the method is untestable as a unit.
- **Accepting entire entity when one field is needed**: A method taking `User user` but only accessing `user.Email` forces test code to construct full User objects and couples the method to User's structure.

### MEDIUM

- **Magic numbers in business logic**: `if (total > 100)` and `var tax = subtotal * 0.08m` scattered through code. When the threshold or rate changes, developers must find every occurrence. Named constants centralize the change.
- **Public helper methods**: Internal utility methods (`FormatDateString`, `SanitizeInput`) marked `public` when no external code calls them. This inflates the class's apparent API surface and constrains refactoring.
- **Premature optimization through visibility**: Making everything `internal` "in case another class needs it" rather than starting private. This weakens the signal of what the true public API is.

## Examples

**Immutable collection return with specific parameters**:

```csharp
public class OrderService
{
    private readonly List<Order> _orders = [];

    // Immutable return type, specific parameter
    public IReadOnlyList<Order> GetOrdersByStatus(OrderStatus status)
    {
        return [.. _orders.Where(o => o.Status == status)];
    }

    // Method (not property) for expensive operation
    public async Task<OrderSummary> CalculateSummaryAsync(
        int userId,
        CancellationToken ct)
    {
        var orders = await _repository.GetByUserAsync(userId, ct);
        return BuildSummary(orders);
    }

    // Private helper -- not exposed
    private OrderSummary BuildSummary(IReadOnlyList<Order> orders)
    {
        return new OrderSummary
        {
            Count = orders.Count,
            Total = orders.Sum(o => o.Total),
            AverageValue = orders.Average(o => o.Total)
        };
    }
}
```

**Small methods with named constants**:

```csharp
public class ShippingCalculator
{
    private const decimal FreeShippingThreshold = 75.00m;
    private const decimal StandardRate = 5.99m;
    private const decimal ExpressRate = 12.99m;
    private const decimal HeavyItemSurchargePerKg = 2.50m;
    private const decimal HeavyItemThresholdKg = 10.0m;

    public decimal Calculate(IEnumerable<decimal> itemWeights, bool express)
    {
        var totalWeight = itemWeights.Sum();
        var baseRate = express ? ExpressRate : StandardRate;

        if (QualifiesForFreeShipping(totalWeight))
            return 0m;

        return baseRate + CalculateHeavySurcharge(totalWeight);
    }

    private bool QualifiesForFreeShipping(decimal totalWeight) =>
        totalWeight <= HeavyItemThresholdKg;

    private decimal CalculateHeavySurcharge(decimal totalWeight) =>
        totalWeight > HeavyItemThresholdKg
            ? (totalWeight - HeavyItemThresholdKg) * HeavyItemSurchargePerKg
            : 0m;
}
```

## Does Not Cover

- **Class-level architecture** -- how to structure classes, choose between composition and inheritance, and define responsibilities is covered by the Architecture dimension (CS1).
- **Null safety in return types** -- whether methods should return null or empty collections is addressed by the Null Safety dimension (CS2).
- **Async method patterns** -- how to structure async method signatures, cancellation, and context is covered by the Async Patterns dimension (CS3).
- **Naming conventions** -- specific naming rules (PascalCase for methods, camelCase for parameters) are language conventions outside the scope of member design principles.
- **XML documentation** -- whether and how to document public members is a documentation concern.

## Sources

- C# Coding Guidelines (csharpcodingguidelines.com) -- AV1500 series (Member Design), AV1515 (Properties), AV1521 (Parameters)
- .NET Framework Design Guidelines -- Member Design Guidelines
- Robert C. Martin, *Clean Code* -- Functions chapter (small methods, single purpose)
