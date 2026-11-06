# Async Patterns -- C\#

> Async/await composes asynchronous operations. Use asynchronous I/O to avoid blocking and deliberate CPU offloading for responsiveness; assess blocking and cancellation against the actual execution context.

## Mental Model

The async/await machinery in C# is fundamentally about **thread efficiency during waiting**. If an awaited I/O task is incomplete, the method suspends without blocking its caller. Continuation scheduling depends on the awaiter and current context; an already-completed await can continue synchronously. Async I/O need not dedicate a blocked thread to the wait. This is the entire value proposition: under load, a server can handle thousands of concurrent I/O operations without thousands of blocked threads.

The model breaks down in three predictable ways, and the four rules in this dimension address each failure mode. First, developers apply async to **CPU-bound work** where no waiting occurs. `Task.FromResult(Compute())` computes synchronously before wrapping the result. `Task.Run` moves CPU work to a pool thread and can preserve UI responsiveness, though it does not make CPU work free. **AsyncForIoBound** prefers a synchronous computational core with deliberate offloading when the application needs it.

Second, developers **mix async and sync** by calling `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()` on a task from synchronous code. In environments with a synchronization context (ASP.NET pre-Core, WPF, WinForms), this can deadlock when completion requires a continuation on the blocked context. Already-completed tasks and continuations independent of that context do not have this particular cycle. **NoMixingAsyncSync** enforces the principle of "async all the way" -- prefer task-aware callers up to the entry point; forwarding a Task does not require the async keyword.

Third, long-running operations ignore **cancellation tokens**. A user navigates away or a request times out, but the server continues processing a report nobody wants. **CancellationTokens** recommends a token for cancellable operations, propagation to supporting dependencies, and checks during long loops.

Fourth, **library code captures the synchronization context** unnecessarily. An incomplete Task await normally schedules its continuation through an applicable SynchronizationContext or non-default TaskScheduler. Blocking that executor can deadlock the chain. **ConfigureAwaitContext** establishes the rule: context-independent library awaits prefer `ConfigureAwait(false)`; code requiring a particular context preserves it. ASP.NET Core has no custom synchronization context by default.

These four rules form a complete async discipline. Use asynchronous I/O and deliberate CPU offloading. Prefer awaiting over blocking. Support cancellation where operations can honor it. And configure the context correctly based on whether you are writing library or application code.

## Consumer Guide

### When Reviewing Code

- Inspect CPU wrappers: `Task.FromResult` does not offload; `Task.Run` may intentionally preserve responsiveness. Prefer a synchronous core with caller-controlled offloading as house policy.
- Search for `.Result`, `.Wait()`, and `.GetAwaiter().GetResult()` in the codebase. Each is a potential deadlock. Assess captured contexts, schedulers, locks, and pool starvation; absence of a synchronization context alone does not prove blocking is safe.
- Verify that every async method accepting a `CancellationToken` actually uses it: passing it to inner async calls and checking `ThrowIfCancellationRequested()` in loops.
- In context-independent library or shared code, prefer `.ConfigureAwait(false)` for supported awaits. In ASP.NET Core application code, `ConfigureAwait` is unnecessary (no sync context by default).

### When Designing / Planning

- Identify which operations in your feature are I/O-bound (database, HTTP, file system) versus CPU-bound (calculations, transformations). Use asynchronous I/O; offload CPU work only when responsiveness or scheduling requirements justify it.
- Plan the async chain from the entry point (controller action, event handler) down to the lowest I/O call. Each caller must handle task completion appropriately; a forwarding method can return a Task without the `async` keyword. Do not plan for synchronous wrappers around async internals.
- Include `CancellationToken` in service methods whose operations support cancellation. Adding it later requires changing every implementation and caller.
- Decide whether code is library-level (shared across projects/contexts) or application-level. This determines `ConfigureAwait` usage.

### When Implementing

- Suffix async methods with `Async`: `GetUserAsync`, `SaveOrderAsync`. This convention signals to callers that they must await or handle the Task.
- Accept `CancellationToken ct` as the last parameter for cancellable operations. Pass it to supporting calls in that scope: `await _db.SaveChangesAsync(ct)`.
- In loops that process items with async calls, add `ct.ThrowIfCancellationRequested()` at the beginning of each iteration.
- For CPU-bound work that must run off the calling thread, let the caller use `Task.Run(() => CpuBoundMethod())` rather than hiding `Task.Run` inside the method.
- In context-independent library code, prefer `.ConfigureAwait(false)` on supported awaits. In ASP.NET Core controllers and middleware, omit it.
- Never return `async void` except in event handlers. Use `async Task` so callers can observe exceptions and await completion.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| AsyncForIoBound | Impact-dependent | Use async I/O and intentional CPU offloading; prefer a synchronous CPU core |
| NoMixingAsyncSync | Impact-dependent | Prefer awaiting; assess exceptional synchronous bridges for completion dependencies |
| CancellationTokens | Impact-dependent | Honor supported cancellation according to the operation contract |
| ConfigureAwaitContext | LOW policy; impact-dependent | Use ConfigureAwait(false) in library code to prevent context capture |


---

### CS3.1 Async I/O and Deliberate CPU Offloading

**Impact: Depends on responsiveness and resource cost; CPU offloading can be valid**

Async/await supports asynchronous composition, including awaiting CPU work scheduled with `Task.Run`. Asynchronous I/O avoids blocked waits; CPU work still consumes a thread. Choose offloading for responsiveness, not automatic throughput gains.

**CPU wrappers: needless wrapping versus deliberate offloading**

```csharp
// Wasteful: async for computation
public async Task<int> CalculatePrimeAsync(int n)
{
    // CPU-bound work - async adds overhead, doesn't help
    return await Task.FromResult(CalculatePrime(n));
}

// Valid for responsiveness; house policy prefers caller-controlled offloading
public async Task<Report> GenerateReportAsync(Data data)
{
    // Moves CPU work to a pool thread so the caller can remain responsive
    return await Task.Run(() => GenerateCpuIntensiveReport(data));
}
```

**Correct: Async for I/O, sync or Task.Run for CPU**

```csharp
// Async for I/O: thread released while waiting for database
public async Task<User?> GetUserAsync(int id, CancellationToken ct)
{
    return await _dbContext.Users
        .FirstOrDefaultAsync(u => u.Id == id, ct);
}

// Async for I/O: thread released while waiting for HTTP response
public async Task<string> FetchDataAsync(string url, CancellationToken ct)
{
    using var response = await _httpClient.GetAsync(url, ct);
    return await response.Content.ReadAsStringAsync(ct);
}

// Sync method for CPU-bound work
public int CalculatePrime(int n)
{
    // Pure computation - no async needed
    return ComputeNthPrime(n);
}

// Let caller decide about Task.Run for CPU work
public Report GenerateReport(Data data)
{
    return GenerateCpuIntensiveReport(data);
}

// Caller can use Task.Run if they need to offload
var report = await Task.Run(() => service.GenerateReport(data));
```

**I/O-bound (use async):**
- Database queries
- HTTP requests
- File I/O
- Network calls

**CPU-bound (prefer synchronous core; await deliberate offloading when needed):**
- Calculations
- Data transformations
- Image processing
- Compression

---

### CS3.2 Never Mix Async and Sync

**Impact: HIGH when blocking prevents completion or exhausts resources**

Calling `.Result` or `.Wait()` on a task from synchronous code blocks the thread. In UI or classic ASP.NET contexts this can deadlock if completion needs that blocked context. ASP.NET Core lacks such a context by default, but blocking can still waste threads or contribute to pool starvation.

**Incorrect: Blocking on async from sync code**

```csharp
// Can deadlock in classic ASP.NET/UI if completion needs the blocked context
public string GetData()
{
    // Blocks waiting for task; deadlock if its continuation needs this context
    return GetDataAsync().Result;
}

public void ProcessData()
{
    // Same problem with .Wait()
    ProcessDataAsync().Wait();  // Deadlock risk if completion needs this context
}

// Also problematic: GetAwaiter().GetResult() can deadlock
public User GetUser(int id)
{
    return GetUserAsync(id).GetAwaiter().GetResult();  // Deadlock risk
}
```

**Correct: Async all the way**

```csharp
// Async method calls async method
public async Task<string> GetDataAsync()
{
    return await FetchFromApiAsync();
}

public async Task ProcessDataAsync()
{
    var data = await GetDataAsync();
    await SaveDataAsync(data);
}

// If you must call async from sync (rare), use proper patterns
public string GetDataSync()
{
    // Exceptional bridge: requires independent completion, no shared-lock cycle,
    // and acceptable thread-pool cost; not a general deadlock cure
    return Task.Run(async () => await GetDataAsync()).Result;
}
```

**Entry points should be async:**

```csharp
// ASP.NET Controller
public async Task<IActionResult> GetUser(int id)
{
    var user = await _userService.GetUserAsync(id);
    return Ok(user);
}

// Console app Main
public static async Task Main(string[] args)
{
    await RunAsync();
}
```

**Exceptional blocking boundaries:**
- Prefer async entry points and async tests.
- If an unchangeable synchronous API needs a bridge, establish that completion does not require a blocked context, scheduler, or held lock, and assess pool starvation.
- `ConfigureAwait(false)` affects the await where it is applied; it cannot retroactively fix context capture inside another method.

---

### CS3.3 Honor Cancellation Tokens

**Impact: HIGH (Long operations need graceful cancellation)**

Cancellation tokens request cooperative cancellation; they do not forcibly abort work. Ignoring tokens wastes resources and leaves users waiting for operations they've already abandoned.

**Incorrect: Ignoring cancellation tokens**

```csharp
// Token accepted but never used
public async Task<List<Report>> GenerateReportsAsync(
    int[] ids,
    CancellationToken ct)
{
    var reports = new List<Report>();
    foreach (var id in ids)
    {
        // No cancellation check - runs to completion even if cancelled
        var data = await FetchDataAsync(id);
        reports.Add(GenerateReport(data));
    }
    return reports;
}

// Token not passed to inner async calls
public async Task<User> GetUserWithOrdersAsync(int id, CancellationToken ct)
{
    var user = await _db.Users.FindAsync(id);  // Token not passed!
    var orders = await _db.Orders.Where(o => o.UserId == id).ToListAsync();
    return user;
}
```

**Correct: Check and propagate cancellation tokens**

```csharp
// Check token in loops, pass to all async calls
public async Task<List<Report>> GenerateReportsAsync(
    int[] ids,
    CancellationToken ct)
{
    var reports = new List<Report>();
    foreach (var id in ids)
    {
        ct.ThrowIfCancellationRequested();  // Check before each iteration

        var data = await FetchDataAsync(id, ct);  // Pass token
        reports.Add(GenerateReport(data));
    }
    return reports;
}

// Pass token to all async operations
public async Task<User?> GetUserWithOrdersAsync(int id, CancellationToken ct)
{
    var user = await _db.Users.FindAsync(new object[] { id }, ct);
    if (user is null) return null;

    var orders = await _db.Orders
        .Where(o => o.UserId == id)
        .ToListAsync(ct);

    user.Orders = orders;
    return user;
}

// CPU-bound work should also check
public List<Result> ProcessItems(IEnumerable<Item> items, CancellationToken ct)
{
    var results = new List<Result>();
    foreach (var item in items)
    {
        ct.ThrowIfCancellationRequested();
        results.Add(Process(item));
    }
    return results;
}
```

**Guidelines:**
- Accept `CancellationToken ct` as last parameter
- Pass the token to operations that support cancellation and belong to the cancellable scope
- Check `ThrowIfCancellationRequested()` in loops
- Use `ct.Register()` only when an API requires a cancellation callback; dispose registrations appropriately and use `finally`/disposal for normal resource cleanup

---

### CS3.4 ConfigureAwait Correctly

**Impact: LOW policy alone; higher when context dependence causes concrete harm**

For Task awaits, the default scheduling considers a custom SynchronizationContext, then a non-default TaskScheduler. Context-independent libraries should prefer `ConfigureAwait(false)` to avoid that scheduling dependency. It neither guarantees a thread switch nor suppresses ExecutionContext (including AsyncLocal data), and it is not a universal deadlock cure.

**Incorrect: Library code captures context**

```csharp
// Library code without ConfigureAwait
public class DataService  // Shared library
{
    public async Task<Data> GetDataAsync()
    {
        // Captures sync context - can cause deadlock when called from UI
        using var response = await _httpClient.GetAsync(url);
        var content = await response.Content.ReadAsStringAsync();
        return Parse(content);
    }
}

// UI code calls library
public void Button_Click()
{
    // Can deadlock if an incomplete await captured this blocked UI context
    var data = _dataService.GetDataAsync().Result;
}
```

**Correct: Library uses ConfigureAwait(false)**

```csharp
// Library code doesn't capture context
public class DataService  // Shared library
{
    public async Task<Data> GetDataAsync()
    {
        using var response = await _httpClient.GetAsync(url)
            .ConfigureAwait(false);
        var content = await response.Content.ReadAsStringAsync()
            .ConfigureAwait(false);
        return Parse(content);
    }
}

// UI code retains its synchronization context to update controls.
// ASP.NET Core has no custom synchronization context by default.
public async void Button_Click()
{
    var data = await _dataService.GetDataAsync();
    // This runs on UI thread, can update UI
    _label.Text = data.Name;
}
```

**Guidelines:**

| Code Type | ConfigureAwait |
|-----------|---------------|
| Context-independent library/shared code | Prefer `ConfigureAwait(false)`; preserve a context when the contract requires it |
| ASP.NET Core | Not needed (no sync context by default) |
| UI applications | Omit when you need UI thread, use `false` otherwise |
| Console applications | Usually unnecessary unless a custom context/scheduler is installed |

**ExecutionContext flow is a separate mechanism:**

`ExecutionContext.SuppressFlow()` returns an `AsyncFlowControl` implementing synchronous `IDisposable`, not `IAsyncDisposable`; `await using` is invalid. It does not replace `ConfigureAwait(false)`. If suppression is deliberately needed when scheduling work, restore it synchronously on the originating thread before awaiting the scheduled task. Do not span an await with the suppression scope.


## Rule Interactions

- **AsyncForIoBound + NoMixingAsyncSync**: Await I/O and deliberately offloaded CPU work rather than blocking for either. CPU offloading can be appropriate for UI responsiveness.
- **NoMixingAsyncSync + ConfigureAwaitContext**: Deadlocks from `.Result` occur because the awaiter tries to resume on a captured sync context while the thread owning that context is blocked. `ConfigureAwait(false)` mitigates (but does not eliminate) this by not capturing the context. Both rules together provide defense in depth.
- **CancellationTokens + AsyncForIoBound**: Cancellation is most valuable in I/O-bound chains where operations involve external latency. An HTTP operation that honors the token can stop its local wait; cancellation does not roll back remote effects; cancelling a CPU computation inside `Task.Run` requires cooperative checks via the same token mechanism.
- **All four together**: A well-structured async method awaits its asynchronous work, propagates supported cancellation, and chooses context behavior deliberately. These practices reduce risks but do not eliminate lock cycles, resource limits, or uncooperative work.

## Anti-Patterns (Severity Calibration)

Policy deviations alone are LOW severity. Escalate based on demonstrated blocking, cancellation, or exception consequences; overhead claims need measurement.

### CRITICAL

- **Deadlock from sync-over-async**: A blocked UI/classic ASP.NET context can prevent a required continuation from completing. Establish that dependency before claiming a deadlock; `.Result` alone is not proof.
- **async void in non-event-handler methods**: Callers cannot await completion or catch asynchronous exceptions through a returned task. Unhandled exceptions can terminate the process depending on the host/context.

### HIGH

- **Ignoring CancellationToken parameter**: Accepting a token but never passing it to inner calls or checking it in loops. The operation runs to completion regardless of cancellation, wasting server resources and delaying responses.
- **Wrapping CPU-bound work in Task.FromResult**: The computation remains synchronous. Simplify if the task-shaped API is unnecessary; overhead alone is a LOW preference without measurements.

### LOW policy unless concrete harm is established

- **Missing ConfigureAwait(false) in context-independent library code**: Review the intended contexts and completion dependencies. Its absence is not itself a deadlock, including in UI consumers that await correctly.
- **Unnecessary async method wrapping**: Consider returning the inner Task directly when equivalent. Allocation depends on completion/runtime, and removing await can change exception timing or disposal/try-finally scope; this is not automatically a defect.

## Examples

**Correct async chain with cancellation**:

```csharp
// Controller entry point -- no ConfigureAwait needed in ASP.NET Core
public async Task<IActionResult> GetUserOrders(int userId, CancellationToken ct)
{
    var orders = await _orderService.GetByUserAsync(userId, ct);
    return Ok(orders);
}

// Service layer
public async Task<IReadOnlyList<Order>> GetByUserAsync(int userId, CancellationToken ct)
{
    var orders = await _repository.FindByUserAsync(userId, ct);

    foreach (var order in orders)
    {
        ct.ThrowIfCancellationRequested();
        order.StatusLabel = ComputeStatusLabel(order); // CPU: sync
    }

    return orders;
}

// Repository -- library code uses ConfigureAwait(false)
public async Task<List<Order>> FindByUserAsync(int userId, CancellationToken ct)
{
    return await _dbContext.Orders
        .Where(o => o.UserId == userId)
        .ToListAsync(ct)
        .ConfigureAwait(false);
}
```

**CPU-bound work kept synchronous**:

```csharp
// The method is synchronous because it does CPU work
public Report GenerateReport(ReportData data)
{
    var summary = CalculateSummary(data.Entries);
    var charts = BuildCharts(data.Entries);
    return new Report(summary, charts);
}

// Caller offloads to thread pool if needed
var report = await Task.Run(() => _generator.GenerateReport(data));
```

## Does Not Cover

- **Parallel processing** -- `Parallel.ForEachAsync`, `Task.WhenAll` for concurrent execution, and thread-safe collections are parallelism concerns beyond basic async/await patterns.
- **Reactive extensions (Rx)** -- observable streams and reactive patterns are a distinct programming model.
- **SignalR and WebSocket patterns** -- long-lived async connections have additional concerns around connection lifetime management.
- **Type design** -- how async methods fit into class architecture is covered by the Architecture dimension (CS1).
- **Return type design** -- whether async methods return null or empty collections is covered by the Null Safety dimension (CS2).

## Sources

- Microsoft Learn -- Asynchronous programming with async and await
- Stephen Cleary, *Concurrency in C# Cookbook* -- async/await best practices
- C# Coding Guidelines (csharpcodingguidelines.com) -- AV2235 (Async patterns)
- .NET documentation -- ConfigureAwait FAQ

### Primary verification references

- https://devblogs.microsoft.com/dotnet/configureawait-faq/
- https://learn.microsoft.com/en-us/dotnet/api/system.threading.asyncflowcontrol?view=net-10.0
- https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/async-scenarios
