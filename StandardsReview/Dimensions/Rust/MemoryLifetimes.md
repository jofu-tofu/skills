# Memory & Lifetimes -- Rust

> Understand where values live, how long they live, and who is responsible for cleaning them up -- then encode those decisions in the type system so the compiler enforces them.

## Mental Model

Rust's memory model is built on a simple physical reality: every value lives either on the stack or the heap, and exactly one owner is responsible for deallocating it. The stack is fast, cache-friendly, and automatically cleaned up when a function returns. The heap is flexible, dynamically sized, and requires explicit allocation and deallocation (handled by `Box`, `Vec`, `String`, and friends through the `Drop` trait). The default choice should always be the stack. Reaching for `Box<T>` on a small struct is like renting a storage unit for your keys -- the overhead of managing the indirection exceeds the cost of just carrying the value.

Lifetimes are the compiler's way of tracking how long borrows are valid. Every reference in Rust has a lifetime, but most are inferred through elision rules. When the compiler cannot infer, you annotate -- and those annotations become part of your API contract. A function signature like `fn merge<'left, 'right>(a: &'left Index, b: &'right Index) -> Merged<'left, 'right>` tells callers exactly which inputs the output borrows from. Good lifetime design minimizes explicit parameters (own data when borrowing adds complexity) and names them descriptively when they must appear.

`Pin<T>` enters the picture when values contain self-referential pointers -- most commonly in async futures. After an async function yields at an `.await` point, the future's state machine may hold references into its own stack frame. Moving that future would invalidate those references. `Pin` is a wrapper that prevents moves, making it safe for the future to hold self-references. Stack pinning (`pin!()`) is for local futures; heap pinning (`Box::pin()`) is for futures that must be stored, returned, or sent across threads.

RAII (Resource Acquisition Is Initialization) is Rust's mechanism for deterministic cleanup. The `Drop` trait runs when a value goes out of scope -- on every path: normal returns, early `?` returns, and panics. This makes guard types extremely powerful: a `LockFile` that deletes itself on drop, a `MutexGuard` that releases the lock, a database transaction that rolls back if not committed. The key insight is that manual cleanup code is fragile because every new `return` or `?` adds an exit path that might skip it, while `Drop` is structurally guaranteed by the compiler.

For complex data structures like graphs and trees with shared or cyclic references, Rust's ownership model creates friction. The naive `Rc<RefCell<Node>>` pattern works but introduces runtime reference counting, dynamic borrow checking, and panic risk. Arena allocation offers a cleaner alternative: allocate all nodes in a contiguous arena and reference them by index. The borrow checker works naturally because you borrow the arena, not individual nodes, and there is no reference counting overhead.

Finally, Rust guarantees memory safety but not that destructors run. `mem::forget`, `Box::leak`, and `Rc` cycles all prevent `Drop` from executing. Code that relies on `Drop` for correctness (not just cleanup) has a latent bug. Design types so that leaking them wastes resources but does not violate invariants, and document intentional leaks clearly.

## Consumer Guide

### When Reviewing Code

Look for these signals: `Box::new()` wrapping small structs that could live on the stack; lifetime parameters named `'a`, `'b` with no indication of what they borrow; manual resource cleanup (explicit close/delete/unlock calls) instead of `Drop`-based guards; `Rc<RefCell<T>>` in graph structures where arena indices would eliminate runtime overhead; `Box::leak()` without a comment explaining why the leak is intentional and safe; and async functions returning unboxed futures that callers struggle to pin. Each of these indicates a memory or lifetime design decision that could be improved.

### When Designing / Planning

Decide ownership strategy early. For each data structure, ask: who owns this value, how long does it live, and who needs to borrow it? If a value is created and consumed within a single function, it belongs on the stack. If it must outlive the creating scope, it moves to the heap. If multiple consumers need shared access, choose between borrowing (lifetimes), shared ownership (`Arc` for concurrent, `Rc` for single-threaded), or arena allocation (for graph-like structures). Plan RAII guards for any resource with cleanup obligations: files, locks, network connections, temporary directories.

### When Implementing

Default to stack allocation. Use `Box` only for recursive types, trait objects, and genuinely large buffers. Name lifetime parameters after what they borrow (`'conn`, `'input`, `'query`), not with single letters. Wrap every resource that needs cleanup in a type with a `Drop` impl -- never rely on callers remembering to call a cleanup method. For graph structures, reach for `slotmap`, `typed-arena`, or `bumpalo` before `Rc<RefCell<T>>`. When pinning futures, use `pin!()` for stack-local futures and `Box::pin()` for returned or stored futures. When using `Box::leak()`, add a comment documenting why the leak is intentional and that `Drop` is not required for correctness.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| StackOverHeapDefault | HIGH | Stack allocation by default; Box only for recursive types, trait objects, and large buffers |
| PinForAsyncAndSelfRef | HIGH | Pin futures for self-referential state; pin!() for stack, Box::pin() for heap |
| LifetimeParameterDesign | MEDIUM | Minimize lifetime params in public APIs; name descriptively when required |
| RAIIResourceManagement | HIGH | Drop for deterministic cleanup; guard types over manual cleanup code |
| ArenaForGraphStructures | MEDIUM | Arena allocation with index references for graphs and trees over Rc<RefCell<T>> |
| AvoidLeakingMemory | MEDIUM | Don't rely on Drop for correctness; document intentional leaks |


---

### RS9.1 StackOverHeapDefault

**Impact: HIGH (Stack allocation avoids heap overhead and improves cache locality)**

Rust defaults to stack allocation, which is faster and requires no allocator interaction. Reserve `Box<T>` for cases that genuinely require indirection: recursive types, trait objects, and large buffers that would overflow the stack. Unnecessarily boxing small structs adds allocation cost and pointer chasing for zero benefit.

**Incorrect: Boxing small structs that fit on the stack**

```rust
// Pointless heap allocation for a 24-byte struct
struct Point3D {
    x: f64,
    y: f64,
    z: f64,
}

fn compute_centroid(points: &[Box<Point3D>]) -> Box<Point3D> {
    let mut sum = Box::new(Point3D { x: 0.0, y: 0.0, z: 0.0 });
    for p in points {
        sum.x += p.x;
        sum.y += p.y;
        sum.z += p.z;
    }
    let n = points.len() as f64;
    sum.x /= n;
    sum.y /= n;
    sum.z /= n;
    sum
}
```

**Correct: Stack-allocated structs with Box only where required**

```rust
struct Point3D {
    x: f64,
    y: f64,
    z: f64,
}

// Recursive type genuinely needs indirection
enum Expr {
    Literal(f64),
    Add(Box<Expr>, Box<Expr>),
    Mul(Box<Expr>, Box<Expr>),
}

fn compute_centroid(points: &[Point3D]) -> Point3D {
    let n = points.len() as f64;
    Point3D {
        x: points.iter().map(|p| p.x).sum::<f64>() / n,
        y: points.iter().map(|p| p.y).sum::<f64>() / n,
        z: points.iter().map(|p| p.z).sum::<f64>() / n,
    }
}
```

**When acceptable:**
- Recursive data structures (trees, linked lists, ASTs) where indirection is required by the type system
- Trait objects (`Box<dyn Trait>`) for dynamic dispatch
- Very large structs (>= several KB) that risk stack overflow, especially in deeply recursive call chains
- FFI boundaries where heap allocation is required by the C API contract

---

### RS9.2 PinForAsyncAndSelfRef

**Impact: HIGH (Incorrect pinning causes undefined behavior or compiler errors with async futures)**

Async futures in Rust are state machines that may contain self-referential pointers across `.await` points. Moving such a future after it has been polled invalidates those internal pointers. `Pin<T>` guarantees the value will not be moved, making it safe to hold self-references. Use `pin!()` for stack-pinned locals and `Box::pin()` when the future must be heap-allocated or returned from a function.

**Incorrect: Attempting to use a self-referential future without pinning**

```rust
use std::future::Future;

// Returning an unboxed future that the caller cannot pin correctly
fn make_retry_future(url: &str) -> impl Future<Output = Result<String, Error>> {
    // This future holds references to its own state across awaits
    async {
        let client = reqwest::Client::new();
        let response = client.get(url).send().await?;
        // After this await, the future is self-referential --
        // moving it would invalidate internal pointers
        let body = response.text().await?;
        Ok(body)
    }
}

// Caller tries to store futures in a Vec and poll them --
// without pinning, this is unsound or won't compile
let mut futures: Vec<Box<dyn Future<Output = Result<String, Error>>>> = vec![];
futures.push(Box::new(make_retry_future("https://example.com")));
```

**Correct: Pin futures appropriately for stack and heap contexts**

```rust
use std::pin::{Pin, pin};
use std::future::Future;

// Return a pinned, boxed future for dynamic dispatch or storage
fn make_retry_future(
    url: String,
) -> Pin<Box<dyn Future<Output = Result<String, reqwest::Error>> + Send>> {
    Box::pin(async move {
        let client = reqwest::Client::new();
        let response = client.get(&url).send().await?;
        let body = response.text().await?;
        Ok(body)
    })
}

// Stack-pinning with pin!() for local futures
async fn fetch_with_timeout(url: &str) -> Result<String, reqwest::Error> {
    let future = pin!(reqwest::get(url));
    // `future` is now Pin<&mut impl Future> and cannot be moved
    future.await?.text().await
}
```

**When acceptable:**
- Simple futures that do not hold self-references across `.await` points (the compiler will tell you)
- When using `tokio::spawn` or `tokio::select!`, which handle pinning internally
- When a combinator like `.map()` or `.then()` already returns a pinned future

---

### RS9.3 LifetimeParameterDesign

**Impact: MEDIUM (Descriptive lifetimes make borrow relationships readable; excessive parameters create API friction)**

Lifetime parameters are part of your public API surface. Minimize their count by relying on elision where possible, and when explicit lifetimes are necessary, name them descriptively to communicate what they borrow. Names like `'a` and `'b` force readers to trace data flow manually; names like `'input`, `'conn`, or `'query` make the borrowing relationship self-documenting.

**Incorrect: Excessive and opaque lifetime parameters**

```rust
// Three single-letter lifetimes -- reader cannot tell what each borrows
struct QueryResult<'a, 'b, 'c> {
    connection: &'a Connection,
    query: &'b str,
    params: &'c [Value],
}

// Unnecessary lifetime parameter -- could return owned String
fn format_name<'a>(first: &'a str, last: &'a str) -> &'a str {
    // This can't actually work -- you'd need to allocate
    // The lifetime param here signals a misunderstanding
    todo!()
}

impl<'a, 'b, 'c> QueryResult<'a, 'b, 'c> {
    fn execute(&self) -> Vec<Row> { todo!() }
}
```

**Correct: Minimal, descriptively named lifetime parameters**

```rust
// Single lifetime when all borrows share the same scope
struct QueryResult<'conn> {
    connection: &'conn Connection,
    query: String,        // Owned -- no lifetime needed
    params: Vec<Value>,   // Owned -- no lifetime needed
}

// Elision handles the common case -- no annotation needed
fn first_word(s: &str) -> &str {
    s.split_whitespace().next().unwrap_or("")
}

// When multiple lifetimes are genuinely needed, name them
fn merge_results<'left, 'right>(
    left: &'left SearchIndex,
    right: &'right SearchIndex,
) -> MergedView<'left, 'right> {
    todo!()
}
```

**When acceptable:**
- Single-letter lifetimes (`'a`) in short, private helper functions where the scope is obvious
- Trait implementations where the trait definition dictates the lifetime parameter names
- Closure or iterator adaptor chains where descriptive names would add noise to already dense generic bounds

---

### RS9.4 RAIIResourceManagement

**Impact: HIGH (Drop-based cleanup prevents resource leaks on every exit path including panics)**

Rust's `Drop` trait provides deterministic resource cleanup that runs on every exit path: normal returns, early returns with `?`, and panics (in unwind mode). Manual cleanup code is fragile because every new `return` or `?` introduces a path that can skip the cleanup. Wrap resources in RAII guard types so that cleanup is structurally guaranteed by the compiler.

**Incorrect: Manual cleanup that leaks on early return**

```rust
fn process_file(path: &Path) -> Result<Stats, Error> {
    let lock_path = path.with_extension("lock");
    std::fs::write(&lock_path, "locked")?;

    let data = std::fs::read_to_string(path)?; // <-- early return leaks lock file

    let parsed = parse_data(&data)?;            // <-- early return leaks lock file

    let stats = compute_stats(&parsed);

    std::fs::remove_file(&lock_path)?;          // cleanup only runs on success
    Ok(stats)
}
```

**Correct: RAII guard ensures cleanup on all paths**

```rust
struct LockFile {
    path: PathBuf,
}

impl LockFile {
    fn acquire(path: PathBuf) -> std::io::Result<Self> {
        std::fs::write(&path, "locked")?;
        Ok(Self { path })
    }
}

impl Drop for LockFile {
    fn drop(&mut self) {
        let _ = std::fs::remove_file(&self.path);
    }
}

fn process_file(path: &Path) -> Result<Stats, Error> {
    let _lock = LockFile::acquire(path.with_extension("lock"))?;
    // Lock is released on ANY exit: normal return, ?, or panic

    let data = std::fs::read_to_string(path)?;
    let parsed = parse_data(&data)?;
    Ok(compute_stats(&parsed))
}
```

**When acceptable:**
- Trivial scopes with a single possible exit point where a guard type would be over-engineering
- Performance-critical inner loops where the Drop overhead of creating and destroying guards per iteration is measurable
- When using `ManuallyDrop` for FFI types where Rust must not run the destructor because ownership transfers to C

---

### RS9.5 ArenaForGraphStructures

**Impact: MEDIUM (Arenas eliminate reference-counting overhead and borrow checker friction for graph/tree structures)**

Graph and tree structures with shared or cyclic references are notoriously difficult to express with Rust's ownership model. The `Rc<RefCell<Node>>` pattern compiles but introduces runtime overhead (reference counting, borrow checking) and panics on borrow violations. Arena allocation with index-based references sidesteps these problems: all nodes live in a single allocation, references are plain indices, and the borrow checker works naturally because you borrow the arena, not individual nodes.

**Incorrect: Rc<RefCell<Node>> graph with runtime overhead and panic risk**

```rust
use std::cell::RefCell;
use std::rc::Rc;

type NodeRef = Rc<RefCell<Node>>;

struct Node {
    value: i32,
    children: Vec<NodeRef>,
}

fn sum_tree(node: &NodeRef) -> i32 {
    let borrowed = node.borrow(); // panics if already mutably borrowed
    let mut total = borrowed.value;
    for child in &borrowed.children {
        total += sum_tree(child);
    }
    total
}
```

**Correct: Arena with index-based references**

```rust
use slotmap::{SlotMap, new_key_type};

new_key_type! { struct NodeKey; }

struct Node {
    value: i32,
    children: Vec<NodeKey>,
}

struct Tree {
    nodes: SlotMap<NodeKey, Node>,
    root: NodeKey,
}

impl Tree {
    fn sum(&self, key: NodeKey) -> i32 {
        let node = &self.nodes[key];
        let child_keys: Vec<NodeKey> = node.children.clone();
        let mut total = node.value;
        for child_key in child_keys {
            total += self.sum(child_key);
        }
        total
    }

    fn add_child(&mut self, parent: NodeKey, value: i32) -> NodeKey {
        let child = self.nodes.insert(Node { value, children: vec![] });
        self.nodes[parent].children.push(child);
        child
    }
}
```

**When acceptable:**
- Simple trees with clear single ownership (parent owns children) where `Vec<Box<Node>>` works naturally
- Short-lived temporary structures where `Rc` overhead is negligible
- When interfacing with libraries that expect `Rc`-based APIs
- Prototyping where borrow checker friction slows iteration and correctness is verified later

---

### RS9.6 AvoidLeakingMemory

**Impact: MEDIUM (Leaked memory is permanent for the process lifetime; leaked Drop obligations silently skip cleanup)**

Rust guarantees memory safety but does not guarantee destructors will run. `std::mem::forget`, `Box::leak`, and reference cycles with `Rc` all prevent `Drop` from executing. If your program relies on `Drop` for correctness (not just cleanup), these leaks become logic bugs. Design types so that leaking them is wasteful but not incorrect, and document intentional leaks with clear comments explaining the lifetime rationale.

**Incorrect: Relying on Drop for correctness, then leaking**

```rust
struct TempDir {
    path: PathBuf,
}

impl Drop for TempDir {
    fn drop(&mut self) {
        // Correctness depends on this running -- leaked TempDir
        // leaves orphaned directories forever
        std::fs::remove_dir_all(&self.path).ok();
    }
}

fn setup_environment() -> &'static Path {
    let dir = Box::new(TempDir {
        path: PathBuf::from("/tmp/myapp-work"),
    });
    std::fs::create_dir_all(&dir.path).unwrap();
    // Leak to get 'static reference -- Drop NEVER runs
    let leaked: &'static TempDir = Box::leak(dir);
    &leaked.path
}
```

**Correct: Intentional leaks documented; Drop not required for correctness**

```rust
/// Application-wide configuration loaded once at startup.
/// Intentionally leaked to get a 'static reference because:
/// 1. The config lives for the entire process lifetime
/// 2. No cleanup is needed -- it's read-only data
/// 3. The OS reclaims memory on process exit
fn init_config() -> &'static Config {
    let config = Box::new(Config::load_from_env().expect("config required"));
    Box::leak(config)
}

/// Temporary directory with explicit cleanup method.
/// Drop serves as a safety net, but callers should use cleanup()
/// for guaranteed removal since Drop may not run.
struct TempDir {
    path: PathBuf,
    cleaned: bool,
}

impl TempDir {
    fn cleanup(mut self) -> std::io::Result<()> {
        std::fs::remove_dir_all(&self.path)?;
        self.cleaned = true;
        Ok(())
    }
}

impl Drop for TempDir {
    fn drop(&mut self) {
        if !self.cleaned {
            eprintln!("warning: TempDir dropped without explicit cleanup: {:?}", self.path);
            std::fs::remove_dir_all(&self.path).ok();
        }
    }
}
```

**When acceptable:**
- Leaking process-lifetime singletons (logger, config, thread pool) where the OS reclaims memory on exit
- `Box::leak` for string literals or lookup tables that genuinely live for `'static`
- Test harnesses where leaked allocations are cleaned up by process exit


## Rule Interactions

**StackOverHeapDefault + RAIIResourceManagement**: Stack allocation and RAII reinforce each other. Stack-allocated guard types get their `Drop` called automatically when the enclosing scope exits, with zero heap overhead. This is the ideal pattern for short-lived resources like lock guards, transaction scopes, and timing measurements.

**RAIIResourceManagement + AvoidLeakingMemory**: These two rules are in tension. RAII says "put cleanup in Drop"; AvoidLeakingMemory says "don't rely on Drop for correctness." The resolution is layered defense: implement `Drop` as a safety net, but provide an explicit cleanup method (like `commit()` or `close()`) that callers should use for operations where cleanup failure matters. Drop handles the common case; the explicit method handles the critical case.

**PinForAsyncAndSelfRef + StackOverHeapDefault**: Pin adds nuance to the stack-vs-heap decision. Stack-pinned futures (`pin!()`) are cheaper but cannot be returned from functions or stored in collections. When a future must be stored or sent, `Box::pin()` is the correct heap allocation -- this is one of the legitimate reasons to use `Box`.

**ArenaForGraphStructures + LifetimeParameterDesign**: Arenas simplify lifetime management for graph structures. Instead of threading lifetime parameters through every node reference, the arena owns all nodes and hands out `Copy`-able index keys. This often eliminates lifetime parameters entirely from graph-traversal functions.

## Anti-Patterns (Severity Calibration)

### HIGH

- **Boxing small structs by default**: Wrapping types under 128 bytes in `Box` without a structural reason (recursion, trait object, `'static` requirement). Adds allocation overhead and pointer indirection for no benefit.
- **Manual resource cleanup without RAII**: Explicit `file.close()`, `lock.release()`, or `fs::remove_file()` calls at the end of a function. Every early return or `?` added later will skip the cleanup, creating resource leaks.
- **Unpinned future storage**: Storing `Box<dyn Future>` without `Pin` in collections or struct fields. The future may contain self-references and moving it causes undefined behavior or compilation errors.

### MEDIUM

- **Opaque single-letter lifetimes in public APIs**: `fn process<'a, 'b, 'c>(...)` in a public function signature forces every reader and caller to trace which lifetime corresponds to which borrow. Descriptive names make the API self-documenting.
- **`Rc<RefCell<T>>` for graph structures**: Compiles and works but introduces runtime reference counting, dynamic borrow checking with panic risk, and poor cache locality compared to arena-based alternatives.
- **`Box::leak()` without documentation**: Intentional leaks are sometimes correct (process-lifetime singletons), but without a comment explaining the rationale, reviewers cannot distinguish intentional leaks from bugs.

### LOW

- **Unnecessary lifetime annotations where elision applies**: Writing `fn first(s: &'_ str) -> &'_ str` when `fn first(s: &str) -> &str` works identically. The explicit annotations add visual noise without information.

## Examples

**Stack vs heap decision tree:**

```rust
// STACK: small, fixed-size, short-lived
let point = Point { x: 1.0, y: 2.0 };
let config = AppConfig { timeout: 30, retries: 3 };

// HEAP (Box): recursive type -- compiler requires indirection
enum Json {
    Null,
    Array(Vec<Json>),
    Object(Box<HashMap<String, Json>>),  // Box breaks infinite size
}

// HEAP (Box): trait object for dynamic dispatch
fn make_handler(admin: bool) -> Box<dyn RequestHandler> {
    if admin { Box::new(AdminHandler) } else { Box::new(UserHandler) }
}

// HEAP (Vec/String): dynamically sized, unknown at compile time
let names: Vec<String> = load_names_from_file()?;
```

**RAII guard pattern for database transactions:**

```rust
struct Transaction<'conn> {
    conn: &'conn mut Connection,
    committed: bool,
}

impl<'conn> Transaction<'conn> {
    fn begin(conn: &'conn mut Connection) -> Result<Self, DbError> {
        conn.execute("BEGIN")?;
        Ok(Self { conn, committed: false })
    }

    fn commit(mut self) -> Result<(), DbError> {
        self.conn.execute("COMMIT")?;
        self.committed = true;
        Ok(())
    }
}

impl Drop for Transaction<'_> {
    fn drop(&mut self) {
        if !self.committed {
            let _ = self.conn.execute("ROLLBACK");
        }
    }
}

// Usage: transaction rolls back automatically if process_order fails
fn transfer_funds(conn: &mut Connection, amount: u64) -> Result<(), DbError> {
    let tx = Transaction::begin(conn)?;
    debit_account(&tx, amount)?;   // if this fails, tx drops and rolls back
    credit_account(&tx, amount)?;  // if this fails, tx drops and rolls back
    tx.commit()                    // explicit commit on success
}
```

## Does Not Cover

- **Ownership and borrowing fundamentals** -- covered by the Ownership dimension (RS1). This dimension assumes familiarity with move semantics, borrowing rules, and `Clone` vs `Copy`.
- **Concurrent memory access patterns** -- `Arc`, `Mutex`, atomics, and `Send`/`Sync` are covered by the Concurrency dimension (RS3).
- **Allocator customization** -- custom allocators (`GlobalAlloc`, `#[global_allocator]`) are a specialized topic beyond typical application code.
- **Unsafe memory operations** -- raw pointer manipulation, `ManuallyDrop`, and `MaybeUninit` are covered by safety-related rules.

## See Also

- **RS1 Ownership**: Borrowing, move semantics, and `Clone` vs `Copy` -- the foundation that this dimension builds on. Understanding ownership is prerequisite to understanding when heap allocation and lifetime annotations are necessary.
- **RS3 Concurrency**: `Pin` is critical in async concurrent code, and `Arc` (shared heap allocation across threads) connects memory management to concurrency patterns. `Send`/`Sync` bounds interact with lifetime and pinning decisions.

## Sources

- *The Rust Programming Language* (Rust Book) -- Ch 4 (Ownership), Ch 10.3 (Lifetimes), Ch 15 (Smart Pointers)
- *The Rustonomicon* -- Drop, Leaking, `Pin` and self-referential types
- *Effective Rust* by David Drysdale -- Item 8 (Smart Pointers), Item 11 (Drop), Item 14 (Lifetimes)
- *Rust Design Patterns* -- RAII Guards pattern
- Cloudflare Blog -- "Pin, Unpin, and why Rust needs them"
- `std::pin` module documentation
- `typed-arena`, `bumpalo`, `slotmap` crate documentation
- *The Rust Reference* -- Lifetime Elision rules
