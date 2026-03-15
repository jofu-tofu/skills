# Test Data Builders

**Source:** Nat Pryce, Steve Freeman, "Growing Object-Oriented Software, Guided by Tests" (GOOS) (2009)

**Impact: High** — Eliminates the most common cause of Wet Tests (duplicated setup). Makes tests resilient to domain model changes. Reduces test maintenance cost dramatically.

---

## The Problem

When domain objects change structure, every test that creates those objects must update:

```pseudocode
// Domain model adds a required field: "tax_id"
// Now 47 tests fail because they all do this:
user = User(id: 1, name: "alice", email: "alice@example.com")
//            ^^^^^^^^^^ missing tax_id ^^^^^^^^^^
```

The builder pattern gives tests sensible defaults so most tests need no changes.

---

## The Solution: Builder with Defaults

```pseudocode
class UserBuilder:
    // Sensible defaults — tests only override what matters
    _id = 1
    _name = "alice"
    _email = "alice@example.com"
    _role = "member"
    _active = true
    _tax_id = "12-3456789"  // new field — only builders need updating

    function with_name(name): _name = name; return self
    function with_role(role): _role = role; return self
    function with_email(email): _email = email; return self
    function inactive(): _active = false; return self
    function as_admin(): _role = "admin"; return self

    function build():
        return User(id: _id, name: _name, email: _email,
                    role: _role, active: _active, tax_id: _tax_id)

// Usage: tests only override what they care about
function test_admin_can_delete():
    admin = UserBuilder().as_admin().build()
    // ...

function test_inactive_user_cannot_login():
    user = UserBuilder().inactive().build()
    // ...

function test_email_must_be_unique():
    user1 = UserBuilder().with_email("a@example.com").build()
    user2 = UserBuilder().with_email("b@example.com").build()
    // ...
```

---

## The Test Question

*"If I change the domain model, how many tests break?"*

Without builders: All of them.
With builders: Only the builders.

---

## Naming Conventions

Builders should read like specifications:

```pseudocode
// Fluent methods that express intent:
user = UserBuilder()
    .as_admin()           // role
    .with_suspended_plan() // plan state
    .inactive()           // account state
    .build()

// Better than:
user = UserBuilder()
    .with_role("admin")
    .with_plan("suspended")
    .with_active(false)
    .build()
```

---

## Builder Patterns

### Simple Builder (as above)

Best for: Single object creation with many optional fields.

### Mother Object (Object Mother pattern)

Pre-configured factories for common test scenarios:

```pseudocode
class UserMother:
    // Common test personas
    function alice() -> User:  // standard active user
        return UserBuilder().with_name("alice").build()

    function admin() -> User:  // admin user
        return UserBuilder().as_admin().build()

    function deactivated() -> User:  // inactive user
        return UserBuilder().inactive().build()
```

Best for: Domain with well-known test personas shared across many tests.

### Inline Builder (for simple cases)

When the domain object is simple enough:

```pseudocode
function make_user(**overrides):
    defaults = {id: 1, name: "alice", email: "alice@test.com", active: true}
    return User(**{**defaults, **overrides})

// Usage:
admin = make_user(role: "admin")
inactive = make_user(active: false)
```

---

## What NOT to Put in Builders

```pseudocode
// BAD: Builder with database side effects
class UserBuilder:
    function build():
        user = User(...)
        database.save(user)  // don't do this
        return user

// GOOD: Builder creates object; test decides whether to persist
class UserBuilder:
    function build() -> User:
        return User(...)  // no side effects

function test_user_saved_to_db():
    user = UserBuilder().build()
    repository.save(user)  // test controls persistence
    assert repository.find(user.id) == user
```

---

## Relationship to Other Principles

- **Anti-Patterns** (`Rules/AntiPatterns.md`): Builders eliminate Wet Tests (Anti-Pattern 2)
- **FIRST** (`Rules/FIRST.md`): Builders improve Independence (I) — tests don't share mutable state
- **Behavior Over Implementation** (`Rules/BehaviorOverImplementation.md`): Builders express intent (what the test needs), not structure (what the object looks like)

---

## Related

- `Rules/AntiPatterns.md` — Wet Tests: the problem builders solve
- `Rules/FIRST.md` — Independent property: builders help isolate tests
