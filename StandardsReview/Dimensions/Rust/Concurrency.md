# Concurrency & Async -- Rust

> Write concurrent code that leverages the type system to prevent data races at compile time and respects the async runtime's cooperative scheduling contract.

## Mental Model

Rust's concurrency story is built on three pillars: the ownership system, the Send/Sync marker traits, and the async runtime's cooperative scheduling model. Understanding how these interact is essential to writing correct concurrent Rust.

**Safe Rust prevents data races when its unsafe abstractions are sound.** Borrowing and Send/Sync constrain conflicting access; synchronization can enforce access dynamically. Logic races, deadlocks, and bugs in unsafe implementations remain possible. Reborrowing is permitted under the reference access rules.

**Send and Sync define the thread-safety contract.** `Send` means a type can be transferred to another thread. `Sync` means a type can be shared between threads via reference. These are auto-traits -- the compiler derives them from the type's fields. `Rc` is not Send (its reference count is not atomic); `Arc<T>` is Send + Sync when `T: Send + Sync` (for the default allocator); atomic reference counting does not make its contents thread-safe. When you write `tokio::spawn(async { ... })`, the future must be `Send + 'static` because the runtime may move it between worker threads at any .await point. Types that are alive across .await points become part of the future's state and must satisfy these bounds. Understanding this is the key to deciphering the otherwise cryptic error messages that arise from non-Send types in async code.

**The async runtime is cooperatively scheduled.** An `.await` is a potential suspension point, not a guaranteed task switch. Awaiting a ready future continues in the same poll; even a loop containing many `ready(()).await` expressions can monopolize a worker. The executor regains control when polling returns. Bound work per poll and use actual yielding or offloading where the workload requires it. This means CPU-intensive work that does not yield will starve every other task on that thread. It also means that std::sync::Mutex -- which blocks the OS thread -- will block the worker thread and potentially deadlock the runtime if the lock holder is suspended on the same worker. The solution is to use async-aware primitives (tokio::sync::Mutex) when locks must be held across .await, and spawn_blocking for CPU-bound work.

**Channels encode protocols in the type system.** Arc<Mutex<T>> gives every holder unrestricted read-write access with no indication of the intended data flow. Channels (mpsc, oneshot, broadcast, watch) make the communication pattern explicit: who sends, who receives, how many messages, whether it is one-shot or streaming. This makes data flow explicit; channel closure is reported at runtime through send/receive results, not rejected by the compiler.

## Consumer Guide

### When Reviewing Code

Scan for these patterns: std::sync::Mutex guards that are alive across .await points (look for `let guard = mutex.lock()` without a closing brace before the next `.await`). Arc<Mutex<T>> used where a channel would make the data flow explicit. tokio::spawn of CPU-intensive closures that do not use spawn_blocking. Rc held across suspension in a future passed to tokio::spawn, or shared RefCell without the required Sync bound. Unbounded channels in production paths. Multiple mutexes acquired without a consistent ordering convention. async-trait use where native traits meet the required MSRV, dispatch, and Send contracts. Flag any fire-and-forget tokio::spawn where the JoinHandle is discarded -- errors from that task are silently lost.

### When Designing / Planning

Decide on communication patterns early. For request-response between tasks, use oneshot channels. For streaming data pipelines, use bounded mpsc channels with explicit capacity based on expected throughput. For shared configuration or state that is read far more often than written, use tokio::sync::watch or Arc<RwLock<T>>. Reserve Arc<Mutex<T>> for cases where the shared data structure requires random-access mutation and cannot be serialized through a channel. Document the lock ordering convention if multiple locks exist. Plan CPU-intensive work to run on spawn_blocking from the start -- retrofitting it later is a source of subtle regressions.

### When Implementing

Default to channels over shared state. Use bounded channels and choose capacity based on the expected burst size and acceptable latency. Drop std::sync::Mutex guards before .await -- use block scoping to make this visually obvious. Reach for tokio::sync::Mutex only when you genuinely need to hold a lock across an await point; it is slower than std::sync::Mutex for non-async use. Offload blocking or lengthy CPU work according to measured scheduling needs; limit concurrent CPU jobs with a semaphore or dedicated CPU pool. Use JoinSet to manage groups of spawned tasks -- it aborts remaining async tasks on drop and returns results for explicit error handling; started spawn_blocking jobs cannot generally be aborted. Prefer native async fn in traits on Rust 1.75+ when static dispatch and the future bounds meet the API contract; retain async-trait for appropriate dyn dispatch or compatibility needs.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| NoMutexAcrossAwait | CRITICAL | Never hold a std::sync::Mutex guard across an .await point |
| MessagePassingOverSharedState | HIGH | Prefer channels over Arc<Mutex<T>> to make data flow explicit |
| SpawnBlockingForCpuWork | CRITICAL | Offload CPU-intensive work to spawn_blocking to avoid starving the async runtime |
| SendSyncAwareness | HIGH | Ensure types across .await points are Send + 'static for spawned tasks |
| StructuredConcurrency | HIGH | Use JoinSet, select!, or FuturesUnordered instead of fire-and-forget spawns |
| ChannelCapacityBounds | HIGH | Bound queues where producer backlog can exceed the memory budget |
| AsyncTraitConsiderations | MEDIUM | Prefer native async traits (compiler 1.75+) when dispatch and future bounds permit |
| DeadlockPrevention | HIGH | Establish consistent lock ordering and prefer RwLock for read-heavy workloads |


---

### RS3.1 NoMutexAcrossAwait

**Impact: CRITICAL (Holding std::sync::Mutex across .await can deadlock the entire tokio runtime)**

A std::sync::Mutex blocks the OS thread while waiting to acquire the lock. In an async runtime, that thread is a worker thread shared among many tasks. Holding the guard while suspended does not itself block a worker. A contending synchronous lock call blocks that worker and can prevent the suspended holder from resuming, especially on a current-thread runtime. Deadlock does not require load.

**Incorrect: Mutex guard held across .await**

```rust
use std::sync::Mutex;
use std::sync::Arc;

async fn update_and_notify(
    state: Arc<Mutex<Vec<String>>>,
    msg: String,
) {
    let mut guard = state.lock().unwrap();
    guard.push(msg);
    // Guard remains locked across suspension; a contending lock()
    // can block the worker needed to resume this task.
    notify_subscribers(&guard).await;
    // guard dropped here, far too late
}
```

**Correct: Drop guard before .await**

```rust
use std::sync::Mutex;
use std::sync::Arc;

async fn update_and_notify(
    state: Arc<Mutex<Vec<String>>>,
    msg: String,
) {
    // Scope the lock so the guard is dropped before .await
    let snapshot = {
        let mut guard = state.lock().unwrap();
        guard.push(msg);
        guard.clone() // take a snapshot if needed downstream
    };
    // Guard is dropped, worker thread is free
    notify_subscribers(&snapshot).await;
}

// Alternative: use tokio::sync::Mutex when you truly need
// to hold the lock across an await point
use tokio::sync::Mutex as AsyncMutex;

async fn update_and_notify_async(
    state: Arc<AsyncMutex<Vec<String>>>,
    msg: String,
) {
    let mut guard = state.lock().await; // async-aware lock
    guard.push(msg);
    notify_subscribers(&guard).await; // safe to hold across .await
}
```

**When acceptable:**
- Using tokio::sync::Mutex, which is designed to be held across .await points
- The critical section is guaranteed to contain no .await points and is wrapped in a block scope that makes this visually obvious
- A current-thread runtime is NOT an exception: a contending blocking lock can deadlock its only worker.

---

### RS3.2 MessagePassingOverSharedState

**Impact: HIGH (Shared mutable state via Arc<Mutex<T>> scatters synchronization logic and invites deadlocks)**

Channels encode the communication protocol in the type system: a sender and receiver make the data flow direction explicit and mpsc provides one receiver, whereas broadcast distributes messages to multiple receivers. Arc<Mutex<T>> hides the protocol -- any holder can read or write at any time, and the synchronization discipline exists only in the developer's head. Channels can reduce application-level shared locking, but their synchronization has costs and receive operations may wait for a sender. Bounded sends wait for capacity.

**Incorrect: Shared counter with Arc<Mutex<T>>**

```rust
use std::sync::{Arc, Mutex};
use tokio::task;

async fn count_events(urls: Vec<String>) -> usize {
    let counter = Arc::new(Mutex::new(0usize));
    let mut handles = Vec::new();

    for url in urls {
        let counter = Arc::clone(&counter);
        handles.push(task::spawn(async move {
            let count = fetch_event_count(&url).await;
            // Every task contends on the same lock
            let mut guard = counter.lock().unwrap();
            *guard += count;
        }));
    }

    for h in handles {
        h.await.unwrap();
    }
    *counter.lock().unwrap()
}
```

**Correct: Message-passing with mpsc channel**

```rust
use tokio::sync::mpsc;
use tokio::task;

async fn count_events(urls: Vec<String>) -> usize {
    let (tx, mut rx) = mpsc::channel::<usize>(urls.len().max(1));

    for url in urls {
        let tx = tx.clone();
        task::spawn(async move {
            let count = fetch_event_count(&url).await;
            let _ = tx.send(count).await;
        });
    }
    drop(tx); // close the sender so rx.recv() returns None when done

    let mut total = 0;
    while let Some(count) = rx.recv().await {
        total += count;
    }
    total
}
```

**When acceptable:**
- Read-heavy caches where RwLock contention is minimal and the data structure cannot be practically serialized through a channel
- Small, simple state (e.g., an AtomicBool shutdown flag) where channels add unnecessary ceremony
- When multiple tasks need random-access reads of a shared data structure and message-passing would require duplicating the entire structure

---

### RS3.3 SpawnBlockingForCpuWork

**Impact: CRITICAL (CPU-bound work on the async runtime starves all other tasks on that worker thread)**

Tokio's async runtime uses a small pool of worker threads (typically equal to CPU cores). Each worker cooperatively multiplexes thousands of tasks by switching at .await points. A task that performs CPU-intensive computation without yielding monopolizes its worker thread -- every other task scheduled on that thread stops making progress. Under load this cascades: timeouts fire, health checks fail, and the service appears hung even though only one task is doing heavy computation.

**Incorrect: CPU-intensive hash on the async runtime**

```rust
use sha2::{Sha256, Digest};

async fn hash_password(password: String) -> Vec<u8> {
    // This burns CPU for milliseconds, blocking the worker thread.
    // Every other task on this thread is frozen.
    let mut hasher = Sha256::new();
    for _ in 0..100_000 {
        hasher.update(password.as_bytes());
    }
    hasher.finalize().to_vec()
}
```

**Correct: Offload to spawn_blocking**

```rust
use sha2::{Sha256, Digest};
use tokio::task;

async fn hash_password(password: String) -> Vec<u8> {
    // Runs on a dedicated blocking thread pool, async runtime stays free
    task::spawn_blocking(move || {
        let mut hasher = Sha256::new();
        for _ in 0..100_000 {
            hasher.update(password.as_bytes());
        }
        hasher.finalize().to_vec()
    })
    .await
    .expect("blocking task panicked")
}
```

**When acceptable:**
- Computation completes in microseconds (e.g., a single SHA-256 hash of a short input) where the overhead of spawn_blocking exceeds the work itself
- You are already running on a dedicated thread (inside spawn_blocking or a non-async context)
- A larger async worker pool alone is not a guarantee against starvation; bound work per poll and measure responsiveness.

---

### RS3.4 SendSyncAwareness

**Impact: HIGH (Using non-Send types across .await points causes confusing compiler errors and incorrect fixes)**

When you spawn a tokio task, the future must be Send + 'static because the runtime may move it between worker threads at any .await point. Rc and std::sync::MutexGuard are not Send. RefCell<T> is Send when T is Send, but is not Sync. If they are alive across an .await, the compiler rejects the future with an error that points at the spawn call, not at the offending type -- making diagnosis difficult. Understanding Send/Sync boundaries prevents developers from reaching for incorrect fixes like unsafe impl Send.

**Incorrect: Rc<RefCell<T>> across .await**

```rust
use std::cell::RefCell;
use std::rc::Rc;

async fn process(data: Rc<RefCell<Vec<String>>>) {
    // Rc is not Send -- this future cannot be spawned on tokio
    let snapshot = data.borrow().clone();
    // The Rc is still alive across this .await point
    send_report(&snapshot).await;
    data.borrow_mut().clear();
}

// ERROR: future cannot be sent between threads safely
// tokio::spawn(process(shared_data));
```

**Correct: Arc<tokio::sync::Mutex<T>> for shared async state**

```rust
use std::sync::Arc;
use tokio::sync::Mutex;

async fn process(data: Arc<Mutex<Vec<String>>>) {
    // Here Vec<String>: Send, so Arc<Mutex<Vec<String>>> is Send + Sync.
    let snapshot = {
        let guard = data.lock().await;
        guard.clone()
    };
    send_report(&snapshot).await;
    data.lock().await.clear();
}

// Compiles and runs correctly:
// tokio::spawn(process(shared_data));
```

**When acceptable:**
- Directly awaited local futures can be non-Send, but tokio::spawn still requires Send on a current-thread runtime.
- Local tasks spawned with tokio::task::spawn_local, which does not require Send
- Non-async code or synchronous threads where Rc/RefCell is the correct lightweight choice

---

### RS3.5 StructuredConcurrency

**Impact: HIGH (Unstructured task spawning leaks tasks, loses errors, and makes cancellation impossible to reason about)**

Fire-and-forget tokio::spawn scatters tasks across the runtime with no parent-child relationship. Errors from spawned tasks are silently dropped if the JoinHandle is not awaited. Cancellation requires manually tracking every handle. JoinSet owns spawned tasks and aborts remaining async tasks on drop. Errors still require explicit handling. select! drops losing branch futures, and dropping FuturesUnordered drops its contained futures; neither automatically aborts spawned tasks represented only by JoinHandles. JoinSet does not cap concurrency; add a separate limit when needed.

**Incorrect: Manual handle tracking with fire-and-forget**

```rust
use tokio::task::JoinHandle;

async fn process_batch(items: Vec<Item>) -> Vec<Result<Output, Error>> {
    let mut handles: Vec<JoinHandle<Result<Output, Error>>> = Vec::new();

    for item in items {
        // No limit on concurrency, no structured cancellation
        handles.push(tokio::spawn(async move {
            process_item(item).await
        }));
    }

    let mut results = Vec::new();
    for handle in handles {
        // If one task panics, unwrap crashes the whole collector
        results.push(handle.await.unwrap());
    }
    results
}
```

**Correct: JoinSet for structured task management**

```rust
use tokio::task::JoinSet;

async fn process_batch(items: Vec<Item>) -> Vec<Result<Output, Error>> {
    let mut set = JoinSet::new();

    for item in items {
        set.spawn(async move {
            process_item(item).await
        });
    }

    let mut results = Vec::new();
    // JoinSet handles panics gracefully via JoinError
    while let Some(result) = set.join_next().await {
        match result {
            Ok(inner) => results.push(inner),
            Err(join_err) => {
                eprintln!("Task failed: {join_err}");
                // Optionally: set.abort_all() to cancel remaining
            }
        }
    }
    // Dropping the set aborts remaining async tasks; no concurrency cap is imposed.
    results
}
```

**When acceptable:**
- Long-lived background services (metrics collectors, health checkers) that intentionally outlive any single request scope
- One-shot daemon tasks spawned at startup that run for the entire application lifetime
- Cases where FuturesUnordered with stream combinators provides better ergonomics for pipeline-style processing

---

### RS3.6 ChannelCapacityBounds

**Impact: HIGH (Unbounded channels convert back-pressure failures into OOM kills)**

An unbounded channel will accept messages as fast as the sender can produce them, regardless of how fast the receiver consumes them. If the producer outpaces the consumer -- due to a slow downstream service, a burst of traffic, or a bug -- the channel's internal buffer grows without limit until the process is killed by the OOM reaper. Bounded channels make back-pressure explicit: when the buffer is full, the sender's .send().await suspends, naturally throttling the producer to match the consumer's pace.

**Incorrect: Unbounded channel hides back-pressure**

```rust
use tokio::sync::mpsc;

async fn ingest_events(mut stream: EventStream) {
    // No limit -- if processing is slow, memory grows unbounded
    let (tx, mut rx) = mpsc::unbounded_channel::<Event>();

    tokio::spawn(async move {
        while let Some(event) = stream.next().await {
            // unbounded_send never blocks, never signals overload
            tx.send(event).unwrap();
        }
    });

    while let Some(event) = rx.recv().await {
        process_event(event).await; // if this is slow, queue grows forever
    }
}
```

**Correct: Bounded channel with explicit capacity**

```rust
use tokio::sync::mpsc;

async fn ingest_events(mut stream: EventStream) {
    // Bounded: sender suspends when buffer is full
    let (tx, mut rx) = mpsc::channel::<Event>(1024);

    tokio::spawn(async move {
        while let Some(event) = stream.next().await {
            // Awaits when buffer is full -- applies back-pressure
            if tx.send(event).await.is_err() {
                break; // receiver dropped, stop producing
            }
        }
    });

    while let Some(event) = rx.recv().await {
        process_event(event).await;
    }
}
```

**When acceptable:**
- Command channels with guaranteed-small message volumes (e.g., shutdown signals, configuration reloads)
- Test harnesses where simplicity matters more than memory safety
- Situations where the producer is strictly slower than the consumer by design and this invariant is documented

---

### RS3.7 AsyncTraitConsiderations

**Impact: MEDIUM (The async-trait crate introduces hidden heap allocations and obscures error messages)**

Since Rust 1.75, async fn is supported natively in traits. async-trait is one compatibility approach; its default expansion returns a boxed trait-object future. The default expansion uses boxed Send futures (with ?Send available), which can add allocation and dynamic-dispatch costs. Native async methods avoid this mandatory boxing but are not dyn-compatible and do not automatically promise Send futures to generic callers. Performance and diagnostic quality depend on the program.

**Policy preference: consider replacing async-trait when static dispatch and bounds suffice**

```rust
use async_trait::async_trait;

#[async_trait]
trait DataStore {
    // Desugars to: fn get(&self, key: &str)
    //   -> Pin<Box<dyn Future<Output = Option<Vec<u8>>> + Send + '_>>
    async fn get(&self, key: &str) -> Option<Vec<u8>>;
    async fn set(&self, key: &str, value: Vec<u8>) -> Result<(), StoreError>;
}

#[async_trait]
impl DataStore for RedisStore {
    async fn get(&self, key: &str) -> Option<Vec<u8>> {
        self.client.get(key).await.ok()
    }
    async fn set(&self, key: &str, value: Vec<u8>) -> Result<(), StoreError> {
        self.client.set(key, value).await.map_err(StoreError::from)
    }
}
```

**Correct: Native async fn in trait (Rust 1.75+)**

```rust
trait DataStore {
    // Zero-cost: compiler generates an opaque future type per impl
    async fn get(&self, key: &str) -> Option<Vec<u8>>;
    async fn set(&self, key: &str, value: Vec<u8>) -> Result<(), StoreError>;
}

impl DataStore for RedisStore {
    async fn get(&self, key: &str) -> Option<Vec<u8>> {
        self.client.get(key).await.ok()
    }
    async fn set(&self, key: &str, value: Vec<u8>) -> Result<(), StoreError> {
        self.client.set(key, value).await.map_err(StoreError::from)
    }
}
```

**When acceptable:**
- Targeting compiler versions before Rust 1.75; 1.75 is a compiler release, not an edition.
- The trait must be object-safe (dyn Trait) -- native async methods are not dyn-compatible; async-trait or a manually boxed-future interface can support dyn dispatch. trait_variant supplies Send variants, not automatic dyn support
- Libraries that must support a wide range of Rust compiler versions where async-trait provides compatibility

---

### RS3.8 DeadlockPrevention

**Impact: HIGH (Inconsistent lock ordering causes deadlocks that only manifest under specific scheduling conditions)**

Deadlock occurs when two tasks each hold a lock the other needs. This is a product of ordering: if task A locks X then Y, and task B locks Y then X, they can permanently block each other. The fix is a global lock ordering convention -- always acquire locks in the same order everywhere in the codebase. For read-heavy workloads, RwLock reduces contention by allowing concurrent readers, but the ordering discipline still applies to multiple RwLocks.

**Incorrect: Inconsistent lock ordering invites deadlock**

```rust
use std::sync::{Arc, Mutex};

struct Bank {
    accounts: Vec<Arc<Mutex<Account>>>,
}

impl Bank {
    // Task 1 calls transfer(a, b) -- locks a then b
    // Task 2 calls transfer(b, a) -- locks b then a
    // DEADLOCK: each holds what the other needs
    fn transfer(&self, from: usize, to: usize, amount: f64) {
        let mut from_acc = self.accounts[from].lock().unwrap();
        let mut to_acc = self.accounts[to].lock().unwrap();
        from_acc.balance -= amount;
        to_acc.balance += amount;
    }
}
```

**Correct: Consistent lock ordering by account ID**

```rust
use std::sync::{Arc, Mutex};

struct Bank {
    accounts: Vec<Arc<Mutex<Account>>>,
}

impl Bank {
    fn transfer(&self, from: usize, to: usize, amount: f64) {
        // Account slots must refer to distinct mutexes.
        if from == to { return; } // do not recursively lock one mutex
        // Always lock the lower-indexed account first
        let (first, second) = if from < to {
            (from, to)
        } else {
            (to, from)
        };

        let mut first_guard = self.accounts[first].lock().unwrap();
        let mut second_guard = self.accounts[second].lock().unwrap();

        if from < to {
            first_guard.balance -= amount;
            second_guard.balance += amount;
        } else {
            second_guard.balance -= amount;
            first_guard.balance += amount;
        }
    }
}
```

**When acceptable:**
- Single-lock scenarios where only one mutex is ever held at a time (ordering is irrelevant)
- Using try_lock with fallback logic to detect and break potential deadlocks at runtime
- Lock-free data structures (atomics, crossbeam) that eliminate the deadlock class entirely


## Rule Interactions

**NoMutexAcrossAwait + SendSyncAwareness**: These rules address complementary aspects of the same problem. NoMutexAcrossAwait prevents runtime deadlocks from blocking the worker thread; SendSyncAwareness prevents compile-time errors from non-Send types in futures. Together they guide developers toward the correct synchronization primitive: tokio::sync::Mutex when a lock must span .await, std::sync::Mutex (scoped) for synchronous critical sections, and Arc for shared ownership.

**MessagePassingOverSharedState + ChannelCapacityBounds**: Adopting channels without bounding them trades one failure mode (deadlock) for another (OOM). These rules form a pair: first choose channels over shared state, then choose bounded channels with explicit capacity.

**SpawnBlockingForCpuWork + StructuredConcurrency**: spawn_blocking returns a JoinHandle that must be awaited to retrieve the result and detect panics. StructuredConcurrency ensures these handles are not discarded. JoinSet can track spawn_blocking results, but dropping or aborting the set cannot stop blocking jobs that have already started; use cooperative shutdown for such work.

**DeadlockPrevention + NoMutexAcrossAwait**: Deadlock prevention through lock ordering applies to both sync and async contexts. In async code, the additional constraint from NoMutexAcrossAwait means that even correctly-ordered std::sync::Mutex locks can deadlock the runtime if held across .await. Both rules must be satisfied simultaneously.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **std::sync::Mutex guard held across .await**: A contending lock call can block the worker needed to resume the holder, causing deadlock.
- **CPU-intensive loop in an async fn without spawn_blocking**: Starves all tasks on the same worker thread. Under load, cascades into timeout failures and apparent service hangs.

### HIGH

- **Arc<Mutex<T>> as the default sharing mechanism**: Scatters synchronization logic across the codebase, makes data-flow direction invisible, and introduces lock contention. Prefer channels as a house policy when they clarify ownership and flow; short synchronous mutex sections are valid for shared data.
- **Unbounded channels in production code**: Converts back-pressure failures into silent memory growth that ends with an OOM kill. The process gives no warning before termination.
- **Fire-and-forget tokio::spawn**: Discarding the JoinHandle means panics and errors in the spawned task are silently lost. The parent task has no way to detect or recover from child failures.
- **Inconsistent lock ordering across multiple mutexes**: Creates deadlocks that only manifest under specific thread scheduling, making them nearly impossible to reproduce in testing.

### MEDIUM

- **Unnecessary async-trait boxing**: Review only when static dispatch, MSRV, and future bounds permit replacement; dyn dispatch can justify it.
- **Non-Send future passed to tokio::spawn**: Rc can prevent Send; RefCell<T> itself is Send for T: Send, while sharing it across threads requires Sync, which it lacks.

## Examples

**Choosing the right synchronization primitive:**

```rust
// SITUATION: Multiple tasks need to read a configuration, one task updates it occasionally
// BAD: Arc<Mutex<Config>> -- every reader blocks on the writer
// GOOD: tokio::sync::watch channel
use tokio::sync::watch;

let (tx, rx) = watch::channel(Config::load()?);

// borrow() holds an internal read lock; clone promptly and release it.
let config = rx.borrow().clone();

// Writer: sends new config, all readers see it on next borrow
tx.send(new_config)?;
```

**Structured concurrency with cancellation:**

```rust
use tokio::task::JoinSet;
use tokio::time::{timeout, Duration};

async fn fetch_all(urls: Vec<String>) -> Vec<Response> {
    let mut set = JoinSet::new();
    for url in urls {
        set.spawn(async move { reqwest::get(&url).await });
    }

    let mut responses = Vec::new();
    // Timeout the entire batch -- JoinSet::drop cancels remaining tasks
    let result = timeout(Duration::from_secs(30), async {
        while let Some(res) = set.join_next().await {
            if let Ok(Ok(response)) = res {
                responses.push(response);
            }
        }
    }).await;

    if result.is_err() {
        eprintln!("Batch timed out, returning partial results");
    }
    responses
    // JoinSet dropped here -- any still-running tasks are cancelled
}
```

## Does Not Cover

- **Atomic operations and lock-free data structures** -- low-level concurrency primitives (AtomicU64, crossbeam) are a separate domain requiring memory-ordering expertise.
- **Async runtime selection** (tokio vs async-std vs smol) -- this dimension assumes tokio but the principles apply broadly.
- **Distributed concurrency** (consensus, distributed locks) -- this dimension covers single-process concurrency only.
- **Signal handling and graceful shutdown** -- related to cancellation but involves OS-level concerns beyond concurrency primitives.

## See Also

- **RS9 (Advanced Type System)**: Pin<&mut Self> is fundamental to how async futures are represented in memory. Understanding Pin is necessary when implementing custom futures or working with self-referential async state machines.

## Sources

- Tokio documentation: Shared State, Channels, Select, Bridging with Sync Code
- Effective Rust by David Drysdale, Item 17: Prefer channels over shared state
- The Rust Programming Language, Chapter 16: Fearless Concurrency
- Rust Blog: async fn in traits (stabilized in 1.75)
- Tokio API documentation: JoinSet, sync::Mutex, sync::RwLock, sync::mpsc
