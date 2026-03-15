# WriteTests Workflow

> **Trigger:** "write tests", "add tests", "test this", "how do I test"

Help developers write high-quality tests for new or existing code. Applies TestDriven principles to produce tests that survive refactoring.

## Reference Material

- **Behavior Over Implementation:** `../Rules/BehaviorOverImplementation.md`
- **FIRST Principles:** `../Rules/FIRST.md`
- **Red-Green-Refactor:** `../Rules/RedGreenRefactor.md`

## When to Use

- Writing tests for a new feature
- Adding test coverage to existing code
- Unsure what to test for a given function/class
- Starting TDD for the first time

---

## Quick Start (30 seconds)

Answer these four questions:

1. **What is the public interface?** (methods/functions callers use)
2. **What are the expected behaviors?** (inputs → outputs)
3. **What are the edge cases?** (empty, null, boundary values)
4. **What should NOT happen?** (error conditions, anti-criteria)

---

## Step-by-Step Process

### Step 1: Identify What to Test

**Focus on public interface only.** Ask: "What would break if I called this wrong?"

```pseudocode
// GIVEN: UserService class
class UserService:
    function create_user(email, name): User
    function get_user(id): User | None
    function delete_user(id): bool
    function _validate_email(email): bool  // Private - don't test directly

// IDENTIFY: Public methods to test
// - create_user: happy path, invalid email, duplicate email
// - get_user: exists, doesn't exist
// - delete_user: exists, doesn't exist
// - _validate_email: NO - test through create_user
```

**Checklist:**
- [ ] Listed all public methods/functions
- [ ] Ignored private/internal helpers
- [ ] Identified the contract (inputs → outputs)

---

### Step 2: Write Failing Tests First (Red)

**Start with the simplest happy path.** One behavior per test.

```pseudocode
// Test 1: Happy path
function test_create_user_returns_user_with_provided_data():
    service = UserService(test_database)

    user = service.create_user("alice@example.com", "Alice")

    assert user.email == "alice@example.com"
    assert user.name == "Alice"
    assert user.id is not None

// Test 2: Edge case - invalid input
function test_create_user_rejects_invalid_email():
    service = UserService(test_database)

    error = expect_error(service.create_user, "invalid", "Alice")

    assert error.field == "email"
    assert "invalid email" in error.message.lower()

// Test 3: Error condition
function test_create_user_rejects_duplicate_email():
    service = UserService(test_database)
    service.create_user("alice@example.com", "Alice")

    error = expect_error(service.create_user, "alice@example.com", "Bob")

    assert error.type == "DuplicateEmail"
```

**Rules for this step:**
- Test should FAIL (function doesn't exist or behavior missing)
- Test name describes the scenario and expected outcome
- One assertion concept per test (multiple asserts OK if same concept)

---

### Step 3: Implement to Pass (Green)

Write the **minimum code** to make the test pass.

```pseudocode
// After test_create_user_returns_user... passes
function create_user(email, name):
    user = User(email=email, name=name)
    self.db.save(user)
    return user

// After test_create_user_rejects_invalid_email... add:
function create_user(email, name):
    if not is_valid_email(email):
        raise ValidationError(field="email", message="Invalid email")
    user = User(email=email, name=name)
    self.db.save(user)
    return user
```

**Rules for this step:**
- Write just enough to pass - no more
- Don't add features that aren't tested
- It's OK if code is ugly - refactor comes next

---

### Step 4: Refactor While Green

Improve design while all tests pass.

```pseudocode
// BEFORE (passes but ugly)
function create_user(email, name):
    if not is_valid_email(email):
        raise ValidationError(field="email", message="Invalid email")
    if self.db.find_by_email(email):
        raise DuplicateError(type="DuplicateEmail")
    user = User(email=email, name=name)
    self.db.save(user)
    return user

// AFTER (refactored, still passes)
function create_user(email, name):
    self._validate_new_user(email)
    user = User(email=email, name=name)
    return self._persist(user)

function _validate_new_user(email):
    if not is_valid_email(email):
        raise ValidationError(field="email", message="Invalid email")
    if self._email_exists(email):
        raise DuplicateError(type="DuplicateEmail")
```

---

## Behavior Testing Checklist

Before writing each test, verify:

| Check | Question |
|-------|----------|
| Behavior, not implementation | "Would this test pass if I rewrote with different algorithm?" |
| Public interface only | "Am I testing a public method or reaching into internals?" |
| Observable outcome | "Am I asserting on return values/state, not method calls?" |
| Single concept | "Does this test verify one thing?" |
| Descriptive name | "Could someone understand the behavior from the test name?" |

---

## Language-Specific Examples

### Python (pytest)

```python
# test_user_service.py

def test_create_user_returns_user_with_provided_data(test_db):
    service = UserService(test_db)

    user = service.create_user("alice@example.com", "Alice")

    assert user.email == "alice@example.com"
    assert user.name == "Alice"
    assert user.id is not None

def test_create_user_rejects_invalid_email(test_db):
    service = UserService(test_db)

    with pytest.raises(ValidationError) as exc:
        service.create_user("invalid", "Alice")

    assert exc.value.field == "email"

def test_get_user_returns_none_for_nonexistent_id(test_db):
    service = UserService(test_db)

    result = service.get_user("nonexistent-id")

    assert result is None
```

### TypeScript (Jest)

```typescript
// user-service.test.ts

describe('UserService', () => {
  test('create_user returns user with provided data', async () => {
    const service = new UserService(testDb);

    const user = await service.createUser('alice@example.com', 'Alice');

    expect(user.email).toBe('alice@example.com');
    expect(user.name).toBe('Alice');
    expect(user.id).toBeDefined();
  });

  test('create_user rejects invalid email', async () => {
    const service = new UserService(testDb);

    await expect(
      service.createUser('invalid', 'Alice')
    ).rejects.toMatchObject({
      field: 'email'
    });
  });

  test('get_user returns null for nonexistent id', async () => {
    const service = new UserService(testDb);

    const result = await service.getUser('nonexistent-id');

    expect(result).toBeNull();
  });
});
```

### Go (testing)

```go
// user_service_test.go

func TestCreateUserReturnsUserWithProvidedData(t *testing.T) {
    service := NewUserService(testDB)

    user, err := service.CreateUser("alice@example.com", "Alice")

    assert.NoError(t, err)
    assert.Equal(t, "alice@example.com", user.Email)
    assert.Equal(t, "Alice", user.Name)
    assert.NotEmpty(t, user.ID)
}

func TestCreateUserRejectsInvalidEmail(t *testing.T) {
    service := NewUserService(testDB)

    _, err := service.CreateUser("invalid", "Alice")

    assert.Error(t, err)
    var validationErr *ValidationError
    assert.ErrorAs(t, err, &validationErr)
    assert.Equal(t, "email", validationErr.Field)
}

func TestGetUserReturnsNilForNonexistentID(t *testing.T) {
    service := NewUserService(testDB)

    user, err := service.GetUser("nonexistent-id")

    assert.NoError(t, err)
    assert.Nil(t, user)
}
```

---

## Test Categories to Cover

| Category | Examples |
|----------|----------|
| **Happy path** | Valid input → expected output |
| **Edge cases** | Empty, null, zero, max values |
| **Error conditions** | Invalid input → appropriate error |
| **Boundary conditions** | At limits, just over/under |
| **State changes** | Before/after visible state |

---

## Output Format

When writing tests, produce:

```
## Tests for: [ClassName/FunctionName]

**Public Interface:**
- method_a(params) → return type
- method_b(params) → return type

**Test Cases:**
1. test_method_a_happy_path - [description]
2. test_method_a_edge_case - [description]
3. test_method_a_error_condition - [description]

**Code:**
[language-appropriate test code]

**Principle Applied:** Behavior Over Implementation (Rules/BehaviorOverImplementation.md)
```

---

## Related Principles

- `Rules/BehaviorOverImplementation.md` - Test WHAT, not HOW
- `Rules/FIRST.md` - Fast, Independent, Repeatable, Self-Validating, Timely
- `Rules/RedGreenRefactor.md` - Red → Green → Refactor cycle
