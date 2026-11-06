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

Either can prevent reliable attribution of a failure; whether the whole run passes depends on the framework. Apply FIRST (→ `Rules/FIRST.md`) — specifically the "Self-Validating" property: if the test can pass silently without running its required assertion, it is not self-validating.

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
        if err:
            done(err)
            return
        try:
            assert user.name == "alice"
            done()  // signal test is complete
        catch assertion_error:
            done(assertion_error)  // propagate callback failure to the runner
    )
```

### Pattern D — Event emitter / stream

```pseudocode
async function test_stream_emits_data():
    received = []
    stream = create_data_stream()

    await new Promise((resolve, reject) =>
        settled = false
        function finish(error):
            if settled: return
            settled = true
            clearTimeout(timer)
            stream.off("data", on_data)
            stream.off("end", on_end)
            stream.off("error", on_error)
            if error: reject(error)
            else: resolve()

        on_data = chunk => received.push(chunk)
        on_end = () => finish(null)
        on_error = error => finish(error)
        timer = setTimeout(() => finish(new Error("timeout")), 5000)
        stream.on("data", on_data)
        stream.on("end", on_end)
        stream.on("error", on_error)
    )

    assert length(received) > 0
```

Release test-owned timers and listeners on success, source failure and timeout; do not remove another consumer's listeners. Verify cleanup against the state before the test installed its resources, including any outer test observers: a producer may already own valid listeners. An unconditional zero-listener or empty-event-list assertion rejects such valid implementations even when cleanup is correct. Preserve pre-existing listener identities and remove only the test's additions. Cancel or close a test-owned source when its API supports that and it can keep producing after completion. Choose a deadline appropriate to the fixture, then verify error/timeout paths and repeated execution. A passing content assertion alone does not prove cleanup.

### Pattern E — Parallel operations

Separate a concurrency ceiling from a throughput or scheduling requirement. An API promising at most N active operations may validly run fewer; do not require exactly N immediate starts or a particular microtask sequence unless the contract says so. Use controllable completion and observe maximum active work, final ordering and error behavior. Drive whichever work has actually started so a valid serial alternative can complete; qualify it alongside an unbounded or wrongly ordered implementation. In error tests, distinguish already-running work from forbidden new starts after the failure is observed.

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

An async test can pass without checking its contract when the runner does not observe its assertion or failure (→ `Rules/AntiPatterns.md`). Deleting an assertion is not a diagnostic check: a correct awaited test also passes after its assertion is removed.

**Sensitivity check:** Apply the detection and restoration procedure in `Rules/AntiPatterns.md` → The Liar using this test's actual runner. A setup/import failure does not demonstrate assertion sensitivity.

Check the complete runner result. Some frameworks report late assertions or unhandled rejections as failures even after the test callback ends; do not call those silent passes. Still repair missing completion ownership when it makes timing or cleanup unreliable. Preserve a valid awaited/returned test as a control, and use the actual contract to judge whether its assertions are useful. One observed assertion failure does not prove every branch is covered.

---

## Related

- `Rules/FIRST.md` — Self-Validating property
- `Rules/AntiPatterns.md` — The Liar (always-passing test)
- `Rules/BehaviorOverImplementation.md` — Test behavior, not implementation
