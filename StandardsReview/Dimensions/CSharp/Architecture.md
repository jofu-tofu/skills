# Architecture -- C\#

> Sound type design is the foundation of maintainable C# systems; every class should have one job, depend on narrow interfaces, favor composition over inheritance, and guard its own state.

## Mental Model

C# architecture revolves around a single governing idea: **boundaries define quality**. Every type in your system is a boundary -- between what callers can see and what remains internal, between one responsibility and another, between stable contracts and volatile implementations. When those boundaries are drawn well, changes stay local, tests stay simple, and the codebase scales without accumulating friction.

Think of a well-architected C# project as a collection of small, sealed rooms connected by narrow doors. Each room (class) does one thing. The doors (interfaces) expose only what the next room needs. No room reaches into another's drawers (encapsulation), and rooms are bolted together with screws (composition), not welded into a rigid frame (inheritance). When requirements change, you unbolt and replace a single room rather than re-welding the frame.

The four rules in this dimension enforce that mental model from different angles. **SingleResponsibility** ensures each class has one reason to change, so a modification to email logic never risks breaking database persistence. **InterfaceSegregation** keeps the doors narrow: a consumer that only reads users should never see write or notification methods. **PreferComposition** replaces fragile inheritance trees with pluggable behavior objects, allowing runtime flexibility; either design still needs to honor its behavioral contracts. **EncapsulateState** locks the drawers: internal collections and fields are hidden behind controlled methods, so callers cannot corrupt invariants.

These four rules reinforce each other. A class that follows SingleResponsibility naturally produces small interfaces (InterfaceSegregation). A class assembled from composed behaviors (PreferComposition) has less internal state to protect, and what remains is easier to encapsulate (EncapsulateState). Violating any one rule weakens the others -- a god class with public mutable fields and a deep inheritance tree is the predictable result when all four fail simultaneously.

## Consumer Guide

### When Reviewing Code

- Check that each class has a single, clearly statable responsibility. If you struggle to describe what a class does in one sentence without the word "and", it likely violates SingleResponsibility.
- Look for interfaces with more than five or six methods. Large interfaces are a smell -- consumers depend on methods they never call.
- Inspect deeper inheritance for concrete coupling or substitution problems. Depth beyond two levels is a house heuristic, not a defect; composition is an alternative when it improves the actual contract.
- Scan for public fields, public setters on collection properties, or methods that return mutable internal collections. Each is an encapsulation breach that invites external corruption.

### When Designing / Planning

- Start every new feature by identifying responsibilities. Each responsibility maps to one class. If a feature touches users, persistence, and notifications, plan three classes, not one.
- Define interfaces before implementations. Write the narrowest contract a consumer needs, then implement behind it. This naturally drives InterfaceSegregation.
- Default to composition. Reach for inheritance only when there is a true "is-a" relationship with a stable base class (e.g., inheriting from ASP.NET's `ControllerBase`).
- Decide early which state is internal. Mark fields private, expose read-only views of collections, and provide mutation through well-named methods that enforce invariants.

### When Implementing

- Apply the "one constructor, few dependencies" heuristic. If a constructor takes more than three or four dependencies, the class likely has too many responsibilities.
- When two classes share behavior, extract a shared component and inject it rather than creating a base class.
- Prefer get-only properties, `private set`, or `init` where appropriate. Use `readonly` for backing fields; it is not a general class-property modifier.
- Expose a read-only wrapper or immutable collection through `IReadOnlyList<T>` or `IReadOnlyCollection<T>`. The interface alone does not protect a backing `List<T>` from a cast.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| SingleResponsibility | LOW policy; impact-dependent | Each class should have exactly one reason to change |
| InterfaceSegregation | LOW policy; impact-dependent | Keep interfaces small so consumers depend only on what they use |
| PreferComposition | LOW policy; impact-dependent | Assemble behavior from injected components instead of inheriting it |
| EncapsulateState | Impact-dependent | Hide internal fields and collections behind controlled access |


---

### CS1.1 Single Responsibility Principle

**Impact: LOW design policy; raise only for demonstrated harm**

A class should have only one reason to change. When a class handles multiple concerns, a change to one concern risks breaking unrelated functionality.

**Incorrect: Multiple responsibilities mixed**

```csharp
public class UserService
{
    private readonly IDbConnection _db;

    // Responsibility 1: User validation
    public bool ValidateUser(User user)
    {
        if (string.IsNullOrEmpty(user.Email)) return false;
        if (!user.Email.Contains("@")) return false;
        return true;
    }

    // Responsibility 2: Database persistence
    public void SaveUser(User user)
    {
        _db.Execute("INSERT INTO Users ...", user);
    }

    // Responsibility 3: Email notification
    public void SendWelcomeEmail(User user)
    {
        var smtp = new SmtpClient();
        smtp.Send(new MailMessage("noreply@app.com", user.Email));
    }
}
```

**Correct: Single responsibility per class**

```csharp
public class UserValidator
{
    public bool Validate(User user)
    {
        if (string.IsNullOrEmpty(user.Email)) return false;
        if (!user.Email.Contains("@")) return false;
        return true;
    }
}

public class UserRepository
{
    private readonly IDbConnection _db;

    public UserRepository(IDbConnection db) => _db = db;

    public void Save(User user)
    {
        _db.Execute("INSERT INTO Users ...", user);
    }
}

public class WelcomeEmailSender
{
    private readonly IEmailService _email;

    public WelcomeEmailSender(IEmailService email) => _email = email;

    public void Send(User user)
    {
        _email.Send("noreply@app.com", user.Email, "Welcome!");
    }
}
```

**Benefits:**
- Each class is independently testable
- Changes to validation don't affect persistence
- Email implementation can change without touching user logic

---

### CS1.2 Interface Segregation

**Impact: LOW design policy; raise only for demonstrated harm**

Clients shouldn't depend on methods they don't use. Large interfaces can burden implementations that do not provide all operations; consumers need not implement the interfaces they use. Splitting cohesive roles is a design preference, not a language requirement.

**Incorrect: Fat interface**

```csharp
public interface IUserService
{
    User GetById(int id);
    IEnumerable<User> GetAll();
    void Create(User user);
    void Update(User user);
    void Delete(int id);
    void SendEmail(int userId, string message);
    void ResetPassword(int userId);
    void VerifyEmail(int userId);
    AuditLog GetAuditHistory(int userId);
}

// Poor design choice: making a reader component implement the service.
// A consumer can instead depend on IUserService without implementing it.
public class UserDisplayComponent : IUserService
{
    public User GetById(int id) { /* actual implementation */ }
    public IEnumerable<User> GetAll() { /* actual implementation */ }

    // Forced to stub all these unused methods
    public void Create(User user) => throw new NotImplementedException();
    public void Update(User user) => throw new NotImplementedException();
    public void Delete(int id) => throw new NotImplementedException();
    // ... more stubs
}
```

**Correct: Segregated interfaces**

```csharp
public interface IUserReader
{
    User? GetById(int id);
    IEnumerable<User> GetAll();
}

public interface IUserWriter
{
    void Create(User user);
    void Update(User user);
    void Delete(int id);
}

public interface IUserNotification
{
    void SendEmail(int userId, string message);
    void ResetPassword(int userId);
    void VerifyEmail(int userId);
}

public interface IUserAudit
{
    AuditLog GetHistory(int userId);
}

// Component depends only on what it needs
public class UserDisplayComponent
{
    private readonly IUserReader _users;

    public UserDisplayComponent(IUserReader users) => _users = users;

    public void Display(int id)
    {
        var user = _users.GetById(id);
        // ...
    }
}
```

**Benefits:**
- Easy to mock in tests (fewer methods to setup)
- Components declare their actual dependencies
- Implementation classes can implement only relevant interfaces

---

### CS1.3 Prefer Composition Over Inheritance

**Impact: LOW design policy; raise only for demonstrated harm**

Inheritance creates tight coupling between base and derived classes. Changes to base classes ripple through all descendants, and deep hierarchies become difficult to understand and modify.

**Incorrect: Inheritance hierarchy**

```csharp
public class Animal
{
    public virtual void Move() { /* default movement */ }
    public virtual void Eat() { /* default eating */ }
}

public class Bird : Animal
{
    public override void Move() { /* fly */ }
    public virtual void Sing() { /* tweet */ }
}

public class Penguin : Bird
{
    // A problem only if Bird.Move promises flight to callers
    public override void Move() { /* walk - violates a flight contract, if one exists */ }
    public override void Sing() { /* ... */ }
}

// A flight-only MigrateSouth contract would be unsuitable for Penguin
```

**Correct: Composition with behaviors**

```csharp
public interface IMovementBehavior
{
    void Move();
}

public interface IFeedingBehavior
{
    void Eat();
}

public class FlyingBehavior : IMovementBehavior
{
    public void Move() { /* fly */ }
}

public class WalkingBehavior : IMovementBehavior
{
    public void Move() { /* walk */ }
}

public class Animal
{
    private readonly IMovementBehavior _movement;
    private readonly IFeedingBehavior _feeding;

    public Animal(IMovementBehavior movement, IFeedingBehavior feeding)
    {
        _movement = movement;
        _feeding = feeding;
    }

    public void Move() => _movement.Move();
    public void Eat() => _feeding.Eat();
}

// Penguin gets walking behavior without inheriting flying
var penguin = new Animal(new WalkingBehavior(), new FishEatingBehavior());
var eagle = new Animal(new FlyingBehavior(), new MeatEatingBehavior());
```

**When inheritance is appropriate:**
- True "is-a" relationships with stable base classes
- Framework requirements (Controller, DbContext)
- Sealing an appropriate derived class can prevent further extension; a sealed class cannot itself be a base class

---

### CS1.4 Encapsulate State

**Impact: Depends on the exposed invariants and actual misuse risk**

Public fields and settable properties expose internal state, allowing callers to put objects in invalid states. Encapsulation protects invariants and makes changes safe.

**Incorrect: Exposed internal state**

```csharp
public class BankAccount
{
    public decimal Balance;  // Public field - anyone can set
    public List<Transaction> Transactions;  // Mutable collection exposed

    public BankAccount()
    {
        Balance = 0;
        Transactions = new List<Transaction>();
    }
}

// Callers can corrupt state
var account = new BankAccount();
account.Balance = -1000;  // Invalid negative balance
account.Transactions.Clear();  // History destroyed
account.Transactions = null;  // Breaks future operations
```

**Correct: Encapsulated with controlled access**

```csharp
public class BankAccount
{
    private readonly List<Transaction> _transactions = [];

    public decimal Balance { get; private set; }

    public IReadOnlyList<Transaction> Transactions => _transactions.AsReadOnly();

    public void Deposit(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive", nameof(amount));

        Balance += amount;
        _transactions.Add(new Transaction(TransactionType.Deposit, amount));
    }

    public void Withdraw(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive", nameof(amount));
        if (amount > Balance)
            throw new InvalidOperationException("Insufficient funds");

        Balance -= amount;
        _transactions.Add(new Transaction(TransactionType.Withdrawal, amount));
    }
}

// Collection membership changes only through controlled methods.
// Transaction elements must also be immutable or independently protected.
var account = new BankAccount();
account.Deposit(100);  // Valid operation
// account.Balance = -1000;  // Won't compile - private set
// account.Transactions.Add(...);  // Won't compile - IReadOnlyList
```

**Guidelines:**
- Use `private set` or `init` for properties that shouldn't change externally
- Return a wrapper or immutable collection through read-only interfaces. `AsReadOnly()` is a live view; use a copy for snapshot membership. Neither makes mutable elements immutable.
- Validate all inputs in mutation methods


## Rule Interactions

- **SingleResponsibility + InterfaceSegregation**: Splitting a class into single-responsibility units often reveals the natural interface boundaries. A reader component and a writer component expose two small interfaces rather than one large one.
- **PreferComposition + EncapsulateState**: Composed dependencies are stored as private readonly fields. The encapsulation rule ensures those fields remain hidden and that no external code can swap implementations after construction.
- **InterfaceSegregation + PreferComposition**: Narrow interfaces become the injection points for composed behaviors. A class accepts `IMovementBehavior` rather than a concrete `Bird` base class, enabling runtime flexibility.
- **All four together**: A class with one responsibility, narrow interface contracts, composed dependencies, and encapsulated state is inherently testable, loosely coupled, and resilient to change.

## Review prompts and severity calibration

The categories below group review prompts, not predetermined finding severities. First establish the applicable project/version contract, valid alternatives and concrete consequence. A style or design preference alone is LOW or omitted; HIGH/CRITICAL requires corresponding demonstrated harm.

The architectural thresholds above are house heuristics, not language guarantees. Method counts, dependency counts, and inheritance depth alone are low-severity design preferences. Apply HIGH/CRITICAL only when a concrete contract breach and corresponding harm are established.

### Potentially CRITICAL when invariants or data are actually compromised

- **Multiple responsibilities**: Consider extracting independently changing concerns. This is a design heuristic, not a critical defect by itself.
- **Publicly mutable collections**: `public List<Order> Orders { get; set; }` allows callers to replace or clear the collection. Internal invariants (ordering, capacity limits) are unenforceable.

### Check behavior and workload consequences

- **Deep inheritance hierarchies**: Review coupling and behavioral contracts; three levels alone do not demonstrate a high-severity defect. Composition is the house default when it simplifies those contracts.
- **Fat interfaces**: An interface with ten methods forces every implementer and mock to address all ten, even when only two are relevant. Split into focused role interfaces.

### Check maintainability and explicit policy

- **Premature abstraction**: Creating interfaces and composition layers for code that has a single implementation and no foreseeable variation. This adds indirection without benefit. Wait for the second use case before abstracting.
- **Anemic domain models**: Classes that are pure data bags with no behavior, where all logic lives in external service classes. Some state and its directly related behavior should live together.

## Examples

**Composition replacing inheritance**:

```csharp
// Before: Fragile hierarchy
public class SqlRepository : BaseRepository { ... }
public class CachedRepository : SqlRepository { ... } // Tight coupling

// After: Composed behaviors
public class CachedRepository : IRepository
{
    private readonly IRepository _inner;
    private readonly ICache _cache;

    public CachedRepository(IRepository inner, ICache cache)
    {
        _inner = inner;
        _cache = cache;
    }

    public async Task<User?> GetByIdAsync(int id, CancellationToken ct)
    {
        if (_cache.TryGet(id, out User? user)) return user;
        user = await _inner.GetByIdAsync(id, ct);
        if (user is not null) _cache.Set(id, user);
        return user;
    }
}
```

**Encapsulated aggregate root**:

```csharp
public class ShoppingCart
{
    private readonly List<CartItem> _items = [];

    public IReadOnlyList<CartItem> Items => _items.AsReadOnly();
    public decimal Total => _items.Sum(i => i.Price * i.Quantity);

    public void AddItem(CartItem item)
    {
        ArgumentNullException.ThrowIfNull(item);
        if (item.Quantity <= 0)
            throw new ArgumentException("Quantity must be positive", nameof(item));

        _items.Add(item);
    }

    public bool RemoveItem(int productId) =>
        _items.RemoveAll(i => i.ProductId == productId) > 0;
}
```

## Does Not Cover

- **Project structure and folder conventions** -- this dimension addresses type-level design, not solution organization or layer naming.
- **Dependency injection container configuration** -- how to register services in `IServiceCollection` is a framework concern, not an architectural principle.
- **Null safety** -- nullable reference types and null-return patterns are covered by the Null Safety dimension (CS2).
- **Async patterns** -- how to structure async methods and cancellation is covered by the Async Patterns dimension (CS3).
- **Method-level design** -- parameter specificity, return types, and method size are covered by the Member Design dimension (CS4).

## Sources

- C# Coding Guidelines (csharpcodingguidelines.com) -- AV1000 series (Type Design)
- .NET Framework Design Guidelines -- Type Design Guidelines
- Robert C. Martin, *Clean Architecture* -- Single Responsibility Principle, Dependency Inversion

### Primary verification references

- https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.ireadonlylist-1?view=net-10.0
- https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.asreadonly?view=net-10.0
- https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/readonly
- https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/sealed
- https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/basic-concepts
