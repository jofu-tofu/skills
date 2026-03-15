# AsyncTesting Workflow

**Trigger phrases:** "test async", "test promises", "test callbacks", "await in tests", "async test", "test async code"

**Use when:** Writing or debugging tests for asynchronous operations (Promises, async/await, callbacks, event emitters, streams).

## Reference Material

- **FIRST Principles:** `../Rules/FIRST.md`
- **Anti-Patterns:** `../Rules/AntiPatterns.md`
- **Behavior Over Implementation:** `../Rules/BehaviorOverImplementation.md`

---

## The Core Problem

Async tests have two failure modes regular tests don't:
1. **Silent pass** — The assertion never runs because the test ends before the async operation completes
2. **Unhandled rejection** — An error is thrown but not caught by the test framework

Both make tests pass when they should fail. Apply FIRST (→ `Rules/FIRST.md`) — specifically the "Self-Validating" property: if the test can pass silently without running your assertion, it is not self-validating.

---

## Decision Tree

```
What async pattern are you testing?
│
├─ async/await function
│   → Use: async test function + await the call
│   → See: Pattern A below
│
├─ Returns a Promise
│   → Use: return the Promise OR async/await
│   → See: Pattern B below
│
├─ Callback-based (legacy)
│   → Use: Promisify or framework "done" parameter
│   → See: Pattern C below
│
├─ Event emitter / stream
│   → Use: Wrap in Promise + timeout
│   → See: Pattern D below
│
└─ Multiple concurrent operations
    → Use: Promise.all or similar
    → See: Pattern E below
```

---

## Patterns

### Pattern A — async/await (preferred)

```pseudocode
// GOOD: await makes the assertion run
async function test_fetch_user_returns_data():
    user = await user_service.get_user(123)
    assert user.name == "alice"

// BAD: assertion may never run (depends on framework)
function test_fetch_user_returns_data():
    user_service.get_user(123).then(user =>
        assert user.name == "alice"
    )
    // test exits before .then() fires
```

### Pattern B — Returning a Promise

```pseudocode
// GOOD: returning the Promise lets the framework await it
function test_fetch_user():
    return user_service.get_user(123).then(user =>
        assert user.name == "alice"
    )

// BAD: not returning means test passes before assertion
function test_fetch_user():
    user_service.get_user(123).then(user =>
        assert user.name == "alice"
    )
    // no return, test ends immediately
```

### Pattern C — Callback-based (legacy)

```pseudocode
// Option 1: Promisify (preferred)
get_user_async = promisify(get_user_callback)
async function test():
    user = await get_user_async(123)
    assert user.name == "alice"

// Option 2: Framework "done" parameter
function test(done):
    get_user(123, function(err, user):
        assert user.name == "alice"
        done()  // signal test is complete
    )
```

### Pattern D — Event emitter / stream

```pseudocode
async function test_stream_emits_data():
    received = []
    stream = create_data_stream()

    await new Promise((resolve, reject) =>
        stream.on("data", chunk => received.push(chunk))
        stream.on("end", resolve)
        stream.on("error", reject)
        setTimeout(() => reject(new Error("timeout")), 5000)
    )

    assert length(received) > 0
```

### Pattern E — Parallel operations

```pseudocode
async function test_all_users_loaded():
    [user1, user2, user3] = await Promise.all([
        fetch_user(1),
        fetch_user(2),
        fetch_user(3)
    ])
    assert user1.active == true
    assert user2.active == true
    assert user3.active == true
```

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Missing `await` | Test passes even when code throws | Add `await` before async call |
| `.then()` without return | Test passes before assertion | Return the Promise chain |
| No timeout on external calls | Test hangs forever on CI | Set timeout in test runner config |
| Swallowing rejection | Errors disappear silently | Use `await` or `.catch()` + rethrow |

---

## The "Liar" Risk

Async tests are the most common source of The Liar anti-pattern (→ `Rules/AntiPatterns.md`). If you can delete your assertion and the test still passes, the async operation is completing after the test exits.

**Quick check:** Delete your assertion. If the test still passes — you have a Liar.

---

## Related

- `Rules/FIRST.md` — Self-Validating property
- `Rules/AntiPatterns.md` — The Liar (always-passing test)
- `Rules/BehaviorOverImplementation.md` — Test behavior, not implementation
