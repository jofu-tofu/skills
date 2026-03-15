# DiagnoseTest Workflow

> **Trigger:** "diagnose test", "fix test", "test breaking", "test failing after refactor"

Diagnose test quality issues and provide actionable fixes. This workflow bridges TestDriven philosophy to concrete code changes.

## Reference Material

- **Behavior Over Implementation:** `../Rules/BehaviorOverImplementation.md`
- **FIRST Principles:** `../Rules/FIRST.md`
- **Test Pyramid:** `../Rules/TestPyramid.md`
- **Characterization Tests:** `../Rules/CharacterizationTests.md`

## When to Use

- Tests breaking after refactoring (most common)
- Reviewing test quality
- Debugging flaky tests
- Deciding whether to fix or rewrite a test

---

## Quick Diagnosis (30 seconds)

Run these checks in order. Stop at the first YES:

```
1. Does the test mock internal classes/methods?
   → YES: Implementation coupling (Rules/BehaviorOverImplementation.md)
   → Fix: Replace mocks with real implementations or test through public API

2. Does the test assert on HOW something happened (method calls, SQL queries)?
   → YES: Testing implementation (Rules/BehaviorOverImplementation.md)
   → Fix: Assert on WHAT was returned/changed, not how

3. Does the test access private fields/methods?
   → YES: Breaking encapsulation (Rules/BehaviorOverImplementation.md)
   → Fix: Test through public interface only

4. Does the test mock third-party libraries directly?
   → YES: Mocking what you don't own (Rules/BehaviorOverImplementation.md)
   → Fix: Create wrapper, mock the wrapper

5. Is this testing legacy code you don't understand?
   → YES: Need characterization first (Rules/CharacterizationTests.md)
   → Fix: Capture current behavior before changing
```

---

## Detailed Diagnosis Process

### Step 1: Identify the Symptom

| Symptom | Likely Cause | Primary Rule |
|---------|--------------|--------------|
| Test breaks on every refactor | Implementation coupling | BehaviorOverImplementation |
| Test passes but bugs slip through | Testing wrong abstraction level | BehaviorOverImplementation |
| Test is complex/hard to read | Over-mocking or testing internals | FIRST |
| Test is flaky (passes sometimes) | External dependencies or timing | FIRST |
| Test takes too long | Too many E2E, not enough unit | TestPyramid |

### Step 2: Examine the Test Structure

**Red Flags in Test Setup:**
```
setup():
    mock_internal_service = Mock()      # RED FLAG: mocking internal
    mock_database.query = Mock()        # RED FLAG: mocking exact query
    private_field = obj._internal       # RED FLAG: accessing private
```

**Green Flags in Test Setup:**
```
setup():
    test_db = create_test_database()    # GOOD: real dependency
    api_client = create_test_client()   # GOOD: testing through public interface
    external_api = MockExternalAPI()    # GOOD: mocking at boundary
```

### Step 3: Examine the Assertions

**Red Flag Assertions:**
```python
# Testing HOW (implementation)
mock_db.execute.assert_called_with("SELECT * FROM users WHERE active=1")
mock_service.process.assert_called_once()
assert obj._internal_cache == expected
```

**Green Flag Assertions:**
```python
# Testing WHAT (behavior)
assert len(result.users) == 3
assert result.status == "success"
assert "alice" in [u.name for u in result.users]
```

### Step 4: Apply the Fix Template

**For Implementation-Coupled Tests:**

```
BEFORE (breaks on refactor):
┌─────────────────────────────────────┐
│ test() {                            │
│   mock = Mock(InternalService)      │
│   result = system.doThing(mock)     │
│   assert mock.method.called         │
│ }                                   │
└─────────────────────────────────────┘

AFTER (survives refactor):
┌─────────────────────────────────────┐
│ test() {                            │
│   system = createRealSystem()       │
│   result = system.doThing(input)    │
│   assert result.hasExpectedState    │
│ }                                   │
└─────────────────────────────────────┘
```

**For Tests Mocking Third-Party Libraries:**

```
BEFORE (fragile):
┌─────────────────────────────────────┐
│ test() {                            │
│   mock_stripe = Mock()              │
│   mock_stripe.charge.returns(ok)    │
│   service = PaymentService(stripe)  │
│   service.process(order)            │
│ }                                   │
└─────────────────────────────────────┘

AFTER (stable):
┌─────────────────────────────────────┐
│ // Create wrapper                   │
│ class PaymentGateway {              │
│   charge(amount) { stripe.charge }  │
│ }                                   │
│                                     │
│ test() {                            │
│   mock_gateway = Mock(PaymentGateway)│
│   service = PaymentService(gateway) │
│   service.process(order)            │
│ }                                   │
└─────────────────────────────────────┘
```

---

## Language-Specific Examples

### Python (pytest)

**Implementation-Coupled (Bad):**
```python
def test_get_users_bad(mocker):
    mock_db = mocker.patch('app.services.user_service.db')
    mock_db.execute.return_value = [{'id': 1, 'name': 'alice'}]

    service = UserService()
    service.get_active_users()

    # Coupled to exact SQL
    mock_db.execute.assert_called_with(
        "SELECT * FROM users WHERE active = 1"
    )
```

**Behavior-Based (Good):**
```python
def test_get_users_good(test_db):
    # Arrange: use real test database
    test_db.insert_user('alice', active=True)
    test_db.insert_user('bob', active=False)

    service = UserService(test_db)

    # Act
    result = service.get_active_users()

    # Assert: test WHAT, not HOW
    assert len(result) == 1
    assert result[0].name == 'alice'
```

### TypeScript (Jest)

**Implementation-Coupled (Bad):**
```typescript
test('getUsers bad', () => {
  const mockQuery = jest.fn().mockResolvedValue([{id: 1}]);
  const db = { query: mockQuery };

  const service = new UserService(db);
  await service.getActiveUsers();

  // Coupled to exact query
  expect(mockQuery).toHaveBeenCalledWith(
    'SELECT * FROM users WHERE active = true'
  );
});
```

**Behavior-Based (Good):**
```typescript
test('getUsers good', async () => {
  // Arrange: use test database
  const db = await createTestDb();
  await db.insertUser({ name: 'alice', active: true });
  await db.insertUser({ name: 'bob', active: false });

  const service = new UserService(db);

  // Act
  const result = await service.getActiveUsers();

  // Assert: test WHAT
  expect(result).toHaveLength(1);
  expect(result[0].name).toBe('alice');
});
```

### Go (testing)

**Implementation-Coupled (Bad):**
```go
func TestGetUsers_Bad(t *testing.T) {
    mockDB := &MockDB{}
    mockDB.On("Query", "SELECT * FROM users WHERE active = 1").Return(users)

    service := NewUserService(mockDB)
    service.GetActiveUsers()

    // Coupled to exact query
    mockDB.AssertCalled(t, "Query", "SELECT * FROM users WHERE active = 1")
}
```

**Behavior-Based (Good):**
```go
func TestGetUsers_Good(t *testing.T) {
    // Arrange: use test database
    db := setupTestDB(t)
    db.InsertUser(User{Name: "alice", Active: true})
    db.InsertUser(User{Name: "bob", Active: false})

    service := NewUserService(db)

    // Act
    result := service.GetActiveUsers()

    // Assert: test WHAT
    assert.Len(t, result, 1)
    assert.Equal(t, "alice", result[0].Name)
}
```

---

## Decision Matrix: Fix vs Rewrite

| Condition | Action |
|-----------|--------|
| Test has 1-2 red flags, logic is sound | Fix in place |
| Test has 3+ red flags | Rewrite from scratch |
| Test is for legacy code you don't understand | Write characterization test first |
| Test covers critical business logic | Extra caution - characterize then fix |

---

## Output Format

When diagnosing a test, output:

```
## Test Diagnosis: [test name]

**Symptom:** [what triggered the diagnosis]

**Red Flags Found:**
1. [red flag] → [relevant rule]

**Root Cause:** [primary issue]

**Fix:**
```[language]
[fixed test code]
```

**Principle Applied:** [link to Rules/X.md]
```

---

## Related Principles

- `Rules/BehaviorOverImplementation.md` - Most test issues trace here
- `Rules/FIRST.md` - For flaky/slow/complex tests
- `Rules/TestPyramid.md` - For test suite distribution issues
- `Rules/CharacterizationTests.md` - For legacy code situations
