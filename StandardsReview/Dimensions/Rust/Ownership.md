# Ownership & Borrowing -- Rust

> Every value has exactly one owner; every reference has a provable lifetime. Design APIs that express ownership intent through the type system rather than working around it.

## Mental Model

Ownership is Rust's defining feature and its primary source of both safety and confusion. The ownership system enforces three rules at compile time: every value has exactly one owner, when the owner goes out of scope the value is dropped, and you can have either one mutable reference or any number of shared references -- but not both simultaneously. These rules eliminate data races, use-after-free, and double-free bugs without a garbage collector. The cost is that developers must think about who owns data and how long borrows last, decisions that other languages defer to runtime.

The fundamental design question in Rust is not "how do I make this compile" but "who should own this data." When the answer is clear, the code compiles naturally. When the answer is unclear, developers reach for escape hatches -- `.clone()`, `Rc<T>`, `RefCell<T>`, raw pointers -- that silence the compiler but leave the ownership question unresolved. This dimension exists to ensure that ownership decisions are made intentionally and expressed through the type system, not papered over with runtime mechanisms.

Borrowing is the mechanism that makes ownership practical. Without borrowing, every function call would require transferring ownership and returning it -- an ergonomic nightmare. References (`&T` and `&mut T`) allow functions to access data without taking ownership, and the borrow checker ensures these references never outlive the data they point to. The hierarchy of access is clear: prefer `&T` (shared, immutable) over `&mut T` (exclusive, mutable) over owned `T` (full control). Each step up the hierarchy increases the caller's burden and narrows the set of valid call sites.

Smart pointers (`Box<T>`, `Rc<T>`, `Arc<T>`) and interior mutability (`Cell<T>`, `RefCell<T>`) are legitimate tools, but each one trades a compile-time guarantee for runtime flexibility. `Rc<T>` replaces the single-owner rule with reference counting and the possibility of reference cycles. `RefCell<T>` replaces the compile-time borrow check with a runtime check that panics on violation. `Arc<T>` adds atomic operations to every clone and drop. These costs are acceptable when the problem genuinely requires shared ownership or interior mutation, but they should never be the first tool reached for. The hierarchy is: `&T` first, then `Box<T>`, then `Rc<T>`, then `Arc<T>`, and interior mutability only with documented justification.

## Consumer Guide

### When Reviewing Code

Look for these signals that ownership is being handled poorly: `.clone()` calls that exist only to satisfy the borrow checker (especially inside loops or on `String` / `Vec` types), functions that accept `&Vec<T>` or `&String` instead of `&[T]` or `&str`, `Rc<T>` or `Arc<T>` used in single-threaded contexts where a reference would suffice, `RefCell<T>` without a comment explaining why `&mut self` is not viable, and self-referential struct attempts using raw pointers or excessive `Pin` gymnastics. Each of these patterns indicates an ownership design decision that was deferred rather than made. Ask: "who should own this data?" and verify the code's answer matches the architecture's intent.

### When Designing / Planning

Map out data ownership before writing code. For each major data structure, decide: who creates it, who needs read access, who needs write access, and when it should be destroyed. If multiple components need access, determine whether they can share a borrow from a single owner (the common case) or whether they genuinely need shared ownership (the `Rc`/`Arc` case). Design function signatures to take the weakest reference that satisfies the requirement: `&str` over `&String`, `&[T]` over `&Vec<T>`, `&T` over `T` when the function only reads. For constructors and builders that store the data, use `impl Into<String>` to give callers control over allocation.

### When Implementing

Start every function parameter as a reference (`&T` or `&str`). Escalate to owned types only when the function must store the data beyond the call or send it to another thread. Use `Cow<'a, T>` when a function sometimes needs to allocate and sometimes can return the input unchanged. Avoid self-referential structs entirely -- use index-based designs or arena allocation instead. When interior mutability is genuinely needed (shared observers, lazy initialization, thread-safe mutation), add a comment explaining why the compile-time borrow check is insufficient. Treat every `.clone()` as a decision point: either justify it or restructure to eliminate it.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| PreferBorrowOverClone | CRITICAL | Use references instead of cloning to satisfy the borrow checker |
| UseSlicesOverVecs | HIGH | Accept &[T] and &str instead of &Vec<T> and &String |
| SmartPointerHierarchy | HIGH | Start with &T, escalate to Box/Rc/Arc only when required |
| InteriorMutabilityJustification | HIGH | Cell/RefCell require documented justification for bypassing compile-time checks |
| AvoidSelfReferentialStructs | HIGH | Use arenas or index-based designs instead of self-referential types |
| CowForConditionalOwnership | MEDIUM | Use Cow<'a, T> when a function may or may not need to allocate |
| LifetimeElisionAwareness | MEDIUM | Annotate lifetimes explicitly when elision obscures the borrowing contract |
| MoveSemanticsByDefault | MEDIUM | Take ownership by default in APIs; use impl Into<T> for flexible conversion |


---

### RS1.1 PreferBorrowOverClone

**Impact: CRITICAL (Clone used to silence the borrow checker masks ownership design flaws and adds hidden allocations)**

Calling `.clone()` to make the borrow checker happy is the most common Rust anti-pattern. It converts a compile-time ownership error into a runtime performance penalty and hides the real question: who should own this data? Every clone is an allocation and a copy; in hot paths this compounds into measurable overhead. More importantly, gratuitous clones obscure the data-flow contract -- readers cannot tell whether the clone is structurally necessary or was added to "just make it compile."

**Incorrect: Cloning to satisfy the borrow checker**

```rust
// Clone hides the fact that process_name only needs a read view
fn process_name(name: String) {
    println!("Processing: {name}");
}

fn main() {
    let name = String::from("Alice");
    process_name(name.clone()); // unnecessary heap allocation
    process_name(name.clone()); // another unnecessary allocation
    println!("Original: {name}");
}

// Clone inside a loop compounds the cost
fn find_longest(items: &Vec<String>) -> String {
    let mut longest = String::new();
    for item in items {
        if item.len() > longest.len() {
            longest = item.clone(); // allocation on every improvement
        }
    }
    longest
}
```

**Correct: Borrow instead of cloning**

```rust
// Accept a reference -- no allocation needed
fn process_name(name: &str) {
    println!("Processing: {name}");
}

fn main() {
    let name = String::from("Alice");
    process_name(&name); // zero-cost borrow
    process_name(&name); // still zero-cost
    println!("Original: {name}");
}

// Return a reference tied to the input lifetime
fn find_longest<'a>(items: &'a [String]) -> &'a str {
    let mut longest: &str = "";
    for item in items {
        if item.len() > longest.len() {
            longest = item; // borrow, no allocation
        }
    }
    longest
}
```

**When acceptable:**
- Data must cross a thread boundary and the source cannot be moved (clone is the only safe option)
- Small Copy types (integers, booleans, small fixed-size structs) where clone is a bitwise copy
- Prototype or test code where allocation cost is irrelevant and clarity is prioritized
- The value is needed in a `'static` context and no borrowed alternative exists

---

### RS1.2 UseSlicesOverVecs

**Impact: HIGH (Accepting &Vec<T> or &String restricts callers unnecessarily and signals misunderstanding of Rust's borrowing model)**

Functions that accept `&Vec<T>` instead of `&[T]`, or `&String` instead of `&str`, force callers to allocate a heap container even when they already have data in a different form (array, slice, string literal). Accepting the borrowed slice type makes the API generic over all contiguous storage and communicates that the function only reads the data without caring about its container.

**Incorrect: Accepting owned container references**

```rust
// Forces caller to have a Vec, even if they have an array or slice
fn sum_values(values: &Vec<i32>) -> i32 {
    values.iter().sum()
}

// Forces caller to have a String, even for string literals
fn greet(name: &String) {
    println!("Hello, {name}!");
}

fn main() {
    let arr = [1, 2, 3, 4, 5];
    // Caller must allocate a Vec just to call sum_values
    let v = arr.to_vec();
    let total = sum_values(&v);

    // Caller must allocate a String just to call greet
    let name = String::from("Alice");
    greet(&name);
    // greet(&"Alice".to_string()); // forced allocation for a literal
}
```

**Correct: Accepting slices and string slices**

```rust
// Accepts any contiguous i32 data: &[i32], &Vec<i32>, &[i32; N]
fn sum_values(values: &[i32]) -> i32 {
    values.iter().sum()
}

// Accepts &str, &String (via Deref), and string literals
fn greet(name: &str) {
    println!("Hello, {name}!");
}

fn main() {
    let arr = [1, 2, 3, 4, 5];
    let total = sum_values(&arr); // no allocation needed

    greet("Alice");               // string literal, zero allocation
    let name = String::from("Bob");
    greet(&name);                 // String auto-derefs to &str
}
```

**When acceptable:**
- The function needs to inspect `Vec`-specific metadata like `capacity()` that slices do not expose
- The function will call `Vec`-mutating methods (push, pop, truncate) on a `&mut Vec<T>`
- FFI boundaries where the exact container type is part of the ABI contract

---

### RS1.3 SmartPointerHierarchy

**Impact: HIGH (Reaching for Arc or Rc prematurely adds synchronization overhead and obscures ownership boundaries)**

Rust provides a hierarchy of pointer types with increasing capability and cost: `&T` (zero-cost borrow) < `Box<T>` (single owner, heap) < `Rc<T>` (reference-counted, single-thread) < `Arc<T>` (atomic reference-counted, thread-safe). Each step up the hierarchy adds runtime overhead: `Box` adds a heap allocation, `Rc` adds a reference count increment/decrement on clone and drop, and `Arc` adds atomic operations that inhibit CPU caching optimizations. Start at the cheapest level that satisfies the ownership requirement and escalate only when the compiler or architecture demands it.

**Incorrect: Jumping to Arc when simpler alternatives work**

```rust
use std::sync::Arc;

// Arc used for single-threaded shared config -- atomic overhead is wasted
fn process_items(items: &[String], config: Arc<Config>) {
    for item in items {
        handle_item(item, Arc::clone(&config)); // atomic increment each iteration
    }
}

fn handle_item(item: &str, config: Arc<Config>) {
    println!("{}: {}", item, config.prefix);
}

// Arc used when a simple reference would suffice
fn format_report(data: Arc<ReportData>) -> String {
    format!("{}: {}", data.title, data.summary)
}
```

**Correct: Use the cheapest pointer that satisfies the requirement**

```rust
// A shared reference is sufficient -- no heap allocation or ref counting
fn process_items(items: &[String], config: &Config) {
    for item in items {
        handle_item(item, config); // zero-cost borrow
    }
}

fn handle_item(item: &str, config: &Config) {
    println!("{}: {}", item, config.prefix);
}

// Plain reference for read-only access
fn format_report(data: &ReportData) -> String {
    format!("{}: {}", data.title, data.summary)
}

// Arc only when data genuinely crosses thread boundaries
fn spawn_workers(data: Arc<Config>) {
    for i in 0..4 {
        let data = Arc::clone(&data);
        std::thread::spawn(move || {
            println!("Worker {i}: {}", data.prefix);
        });
    }
}
```

**When acceptable:**
- `Rc<T>` is appropriate when multiple owners in a single thread genuinely need to keep data alive (tree structures with parent back-references, observer patterns)
- `Arc<T>` is required when shared data must cross thread or async task boundaries
- `Box<T>` is needed for recursive types, trait objects, or large stack values that must move to the heap

---

### RS1.4 InteriorMutabilityJustification

**Impact: HIGH (Cell/RefCell bypass compile-time borrow checking, moving safety guarantees to runtime where violations become panics)**

Interior mutability types (`Cell<T>`, `RefCell<T>`, `OnceCell<T>`, `Mutex<T>`) allow mutation through a shared reference, deliberately circumventing Rust's core compile-time borrow-checking guarantee. This is sometimes necessary, but every use should be accompanied by a comment explaining why compile-time borrowing is insufficient. Without justification, readers cannot distinguish intentional design from a workaround that hides an ownership modeling problem. `RefCell` in particular replaces compile-time borrow errors with runtime panics, which are strictly worse.

**Incorrect: RefCell used without justification or where restructuring would eliminate it**

```rust
use std::cell::RefCell;

struct Processor {
    // RefCell used because process() takes &self but needs to mutate cache
    // No comment explaining why &mut self is not viable
    cache: RefCell<HashMap<String, String>>,
    data: Vec<Record>,
}

impl Processor {
    fn process(&self, key: &str) -> String {
        if let Some(val) = self.cache.borrow().get(key) {
            return val.clone();
        }
        let result = expensive_compute(key);
        // Runtime panic if someone else holds a borrow
        self.cache.borrow_mut().insert(key.to_owned(), result.clone());
        result
    }
}
```

**Correct: Justify interior mutability or restructure to avoid it**

```rust
// Option A: Restructure to use &mut self (preferred)
struct Processor {
    cache: HashMap<String, String>,
    data: Vec<Record>,
}

impl Processor {
    fn process(&mut self, key: &str) -> &str {
        if !self.cache.contains_key(key) {
            let result = expensive_compute(key);
            self.cache.insert(key.to_owned(), result);
        }
        &self.cache[key]
    }
}

// Option B: Interior mutability with documented justification
struct SharedProcessor {
    // Justification: SharedProcessor is stored in an Rc and shared across
    // multiple UI components that each call process() through &self.
    // Restructuring to &mut self would require a single owner, breaking
    // the shared-observer architecture.
    cache: RefCell<HashMap<String, String>>,
}
```

**When acceptable:**
- The type is behind a shared reference (`Rc<T>`, `Arc<T>`) and mutation is genuinely needed by multiple holders
- Implementing lazy initialization patterns with `OnceCell` or `OnceLock` where the value is set once and read many times
- Mocking or test doubles that need to record calls through a shared trait interface
- `Mutex<T>` / `RwLock<T>` for thread-safe interior mutability in concurrent contexts (these already carry self-documenting synchronization semantics)

---

### RS1.5 AvoidSelfReferentialStructs

**Impact: HIGH (Self-referential structs fight Rust's move semantics and lead to unsafe code, pin complexity, or runtime crashes)**

A struct that holds a reference to its own data is fundamentally at odds with Rust's ownership model. When a value moves in memory (which Rust does freely), all internal pointers become dangling. The language prevents this at compile time, so developers reach for `unsafe`, raw pointers, or `Pin` -- all of which add significant complexity and maintenance burden. Index-based designs and arena allocators achieve the same logical relationships without fighting the borrow checker.

**Incorrect: Self-referential struct requiring unsafe or Pin**

```rust
// This will not compile -- Rust prevents self-referential borrows
struct Parser {
    input: String,
    current_token: &str, // wants to reference a slice of `input`
}

// Attempting to work around it with raw pointers
struct UnsafeParser {
    input: String,
    current_token: *const str, // raw pointer -- unsafe to dereference
}

impl UnsafeParser {
    fn new(input: String) -> Self {
        let ptr = input.as_str() as *const str;
        // BUG: if UnsafeParser moves, ptr is dangling
        Self { input, current_token: ptr }
    }
}
```

**Correct: Use indices or arena allocation**

```rust
// Index-based design -- no self-references, fully moveable
struct Parser {
    input: String,
    token_start: usize,
    token_end: usize,
}

impl Parser {
    fn current_token(&self) -> &str {
        &self.input[self.token_start..self.token_end]
    }

    fn advance(&mut self) {
        // Update indices instead of pointers
        self.token_start = self.token_end;
        self.token_end = self.find_next_boundary();
    }
}

// Arena-based design for graph-like structures
struct Graph {
    nodes: Vec<Node>,              // arena: nodes stored contiguously
    edges: Vec<(usize, usize)>,   // relationships via indices, not references
}

impl Graph {
    fn neighbors(&self, node_idx: usize) -> Vec<usize> {
        self.edges.iter()
            .filter(|(from, _)| *from == node_idx)
            .map(|(_, to)| *to)
            .collect()
    }
}
```

**When acceptable:**
- Using well-tested crates like `ouroboros` or `self_cell` that encapsulate the unsafe code behind a safe API
- Pinned futures generated by `async fn` (the compiler manages the self-referential state)
- Performance-critical systems code where the author fully understands `Pin<T>` and `Unpin` semantics and the self-referential nature is documented and tested

---

### RS1.6 CowForConditionalOwnership

**Impact: MEDIUM (Cow eliminates unnecessary allocations when a function may or may not need to modify borrowed data)**

`Cow<'a, T>` (Clone on Write) defers allocation until mutation is actually needed. Functions that sometimes return input unchanged and sometimes return a modified copy benefit from `Cow` because the common path avoids allocation entirely. Without `Cow`, developers either always clone (wasteful) or return an enum they invent themselves (reinventing `Cow` poorly). The standard library type communicates the intent clearly and integrates with `Deref` for transparent read access.

**Incorrect: Always cloning or using ad-hoc enums**

```rust
// Always allocates, even when no transformation is needed
fn normalize_path(path: &str) -> String {
    if path.contains("//") {
        path.replace("//", "/")     // allocation needed
    } else {
        path.to_owned()             // unnecessary allocation
    }
}

// Ad-hoc enum reinventing Cow
enum MaybeOwned<'a> {
    Borrowed(&'a str),
    Owned(String),
}

fn normalize_path_v2(path: &str) -> MaybeOwned<'_> {
    if path.contains("//") {
        MaybeOwned::Owned(path.replace("//", "/"))
    } else {
        MaybeOwned::Borrowed(path)
    }
}
```

**Correct: Use Cow for conditional ownership**

```rust
use std::borrow::Cow;

// Zero allocation on the common path (no double slashes)
fn normalize_path(path: &str) -> Cow<'_, str> {
    if path.contains("//") {
        Cow::Owned(path.replace("//", "/"))  // allocate only when needed
    } else {
        Cow::Borrowed(path)                  // zero-cost borrow
    }
}

fn main() {
    let clean = normalize_path("/usr/local/bin");    // Cow::Borrowed, no alloc
    let fixed = normalize_path("/usr//local//bin");  // Cow::Owned, one alloc

    // Both variants deref transparently to &str
    println!("clean: {clean}");
    println!("fixed: {fixed}");
}
```

**When acceptable:**
- The function always modifies the input -- returning `String` (or `Vec<T>`) directly is simpler and more honest
- The optimization is in a cold path where the allocation savings are negligible and `Cow` adds cognitive overhead
- The borrowed lifetime would propagate uncomfortably through the call stack, making `String` the pragmatic choice

---

### RS1.7 LifetimeElisionAwareness

**Impact: MEDIUM (Elided lifetimes hide the borrowing contract, leading to confusion when the implicit rules do not match the actual data flow)**

Rust's lifetime elision rules allow omitting lifetime annotations in common cases: single input reference gets its lifetime assigned to the output, and `&self` / `&mut self` methods assign the self lifetime to all outputs. These rules cover the majority of cases, but when a function has multiple reference inputs, or when the output lifetime is not tied to the obvious input, explicit annotations prevent misunderstandings. Annotate lifetimes when the elision rules would produce a different contract than what the function actually implements.

**Incorrect: Elided lifetimes obscure the actual contract**

```rust
// Which input does the return value borrow from? Elision says `s`
// (first input), but the function actually borrows from `default`.
fn get_or_default(s: &str, default: &str) -> &str {
    if s.is_empty() {
        default  // Returns a borrow of `default`, not `s`
    } else {
        s
    }
}

// Elision hides that the iterator borrows from the struct
struct DataStore {
    items: Vec<String>,
}

impl DataStore {
    // Elision assigns &self lifetime to the return, which is correct
    // here but not obvious to readers unfamiliar with the rules
    fn find(&self, prefix: &str) -> Option<&str> {
        self.items.iter()
            .find(|item| item.starts_with(prefix))
            .map(|s| s.as_str())
    }
}
```

**Correct: Explicit lifetimes clarify the borrowing contract**

```rust
// Explicit: return value may borrow from either input
fn get_or_default<'a>(s: &'a str, default: &'a str) -> &'a str {
    if s.is_empty() {
        default
    } else {
        s
    }
}

// Explicit lifetime makes the borrow relationship clear in the API
struct DataStore {
    items: Vec<String>,
}

impl DataStore {
    // Explicit: return borrows from self, not from prefix
    fn find<'a>(&'a self, prefix: &str) -> Option<&'a str> {
        self.items.iter()
            .find(|item| item.starts_with(prefix))
            .map(|s| s.as_str())
    }
}
```

**When acceptable:**
- Single input reference, single output reference -- the elision rules are unambiguous and universally understood
- `&self` / `&mut self` methods returning a reference -- the convention that output borrows from self is well-known
- Private helper functions where the caller and callee are in the same module and the contract is obvious from context

---

### RS1.8 MoveSemanticsByDefault

**Impact: MEDIUM (APIs that take ownership by default give callers maximum flexibility over allocation and lifetime management)**

Rust's default is move semantics: when a function takes a parameter by value, ownership transfers to the callee. This is the most flexible default for API design because callers who have owned data can pass it directly (zero-cost move), while callers who need to retain ownership can explicitly clone. Using `impl Into<String>` or `impl AsRef<T>` at API boundaries lets callers pass either owned or borrowed data, with conversion handled at the call site. This follows the Rust API Guidelines principle of caller-controlled allocation.

**Incorrect: Borrowing when the function will clone internally anyway**

```rust
// Takes a reference but immediately clones -- caller pays for the
// clone whether they needed the original or not
struct User {
    name: String,
    email: String,
}

impl User {
    fn new(name: &str, email: &str) -> Self {
        Self {
            name: name.to_owned(),   // hidden allocation
            email: email.to_owned(), // hidden allocation
        }
    }
}

// Caller who has an owned String must still pay for the clone
let name = get_name_from_db(); // returns String
let email = get_email_from_db(); // returns String
let user = User::new(&name, &email); // borrows then clones internally
// name and email are still alive but often unused after this point
```

**Correct: Take ownership or use Into for flexible conversion**

```rust
struct User {
    name: String,
    email: String,
}

impl User {
    // impl Into<String> accepts both &str and String
    fn new(name: impl Into<String>, email: impl Into<String>) -> Self {
        Self {
            name: name.into(),   // String passes through, &str allocates
            email: email.into(), // caller controls the cost
        }
    }
}

// Caller with owned data -- zero-cost move, no clone
let name = get_name_from_db();
let email = get_email_from_db();
let user = User::new(name, email); // moved, not cloned

// Caller with string literals -- single allocation each
let user = User::new("Alice", "alice@example.com");
```

**When acceptable:**
- The function only reads the data and does not store it -- accept `&T` or `&str` to avoid forcing the caller to give up ownership
- The function is called in a tight loop and the parameter is reused across iterations -- borrowing avoids repeated allocation
- Generic trait implementations where the trait signature dictates `&self` or `&T` parameters


## Rule Interactions

**PreferBorrowOverClone + UseSlicesOverVecs**: These rules reinforce the same principle from different angles. Accepting slices instead of container references makes it easier for callers to pass borrows without cloning. When a function takes `&[T]` instead of `&Vec<T>`, the caller does not need to clone data into a Vec just to satisfy the signature.

**PreferBorrowOverClone + MoveSemanticsByDefault**: These rules create a tension that must be resolved per-function. If the function will store the data, MoveSemanticsByDefault says take ownership (avoiding a hidden clone). If the function only reads, PreferBorrowOverClone says take a reference. The deciding question is: does this function need the data to outlive the call?

**SmartPointerHierarchy + InteriorMutabilityJustification**: Interior mutability types are most commonly found inside `Rc<T>` or `Arc<T>` containers. When reviewing `Rc<RefCell<T>>` or `Arc<Mutex<T>>`, both rules apply: verify that shared ownership is genuinely needed (SmartPointerHierarchy) and that the interior mutability has documented justification (InteriorMutabilityJustification).

**AvoidSelfReferentialStructs + LifetimeElisionAwareness**: Self-referential structs often arise when developers try to store a reference alongside the data it borrows from. Understanding lifetime elision and explicit annotation helps developers recognize why the compiler rejects these patterns and guides them toward index-based alternatives.

**CowForConditionalOwnership + PreferBorrowOverClone**: `Cow` is the bridge between borrowing and owning. When PreferBorrowOverClone pushes toward references but the function sometimes must allocate, `Cow` provides the optimal solution without forcing the caller to always clone.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Gratuitous `.clone()` in hot paths**: Cloning strings, vectors, or complex structs inside loops to satisfy the borrow checker. Each iteration allocates and copies data that could be borrowed. This is the single most common performance bug in Rust codebases.
- **`.clone()` as the default response to borrow checker errors**: When a developer's first instinct is to add `.clone()` whenever the compiler complains, the ownership model is not being used -- it is being silenced. The resulting code has the syntax of Rust but the allocation profile of a garbage-collected language.

### HIGH

- **`Rc<RefCell<T>>` without documented justification**: This pattern completely opts out of compile-time borrow checking. It has legitimate uses (shared mutable state in single-threaded event loops, tree structures with mutable nodes), but without a comment explaining why, reviewers cannot verify the design decision.
- **`Arc<T>` in single-threaded code**: Atomic reference counting has measurable overhead compared to `Rc<T>` (which itself has overhead compared to references). Using `Arc` when the data never crosses a thread boundary wastes CPU cycles on atomic operations.
- **Self-referential structs with raw pointers**: Using `*const T` or `*mut T` to create self-referential structures introduces undefined behavior risk that the borrow checker was designed to prevent. The resulting `unsafe` blocks are difficult to audit and easy to break during refactoring.
- **Accepting `&String` or `&Vec<T>` in public API signatures**: Forces callers to allocate containers they may not need and signals unfamiliarity with Rust's deref coercion system.

### MEDIUM

- **Missing lifetime annotations on multi-reference functions**: When a function accepts two or more reference parameters and returns a reference, relying on elision can produce incorrect lifetime relationships that only manifest as confusing compiler errors at the call site.
- **Always returning `String` when `Cow<str>` would avoid allocation**: Functions that sometimes transform input and sometimes return it unchanged allocate unnecessarily when they always return `String`.
- **Taking `&str` for a constructor that stores the value**: The constructor will call `.to_owned()` internally, hiding the allocation from the caller. `impl Into<String>` communicates the ownership transfer and lets callers who have a `String` avoid the clone.

## Does Not Cover

- **Unsafe code and raw pointer manipulation** -- this dimension covers safe ownership patterns; `unsafe` blocks, raw pointer arithmetic, and FFI pointer contracts are a separate concern.
- **Concurrency primitives beyond Arc** -- `Mutex`, `RwLock`, channels, and atomics are synchronization tools that build on top of ownership but form their own dimension.
- **Allocator-aware programming** -- custom allocators, `GlobalAlloc`, and allocation-free (`#[no_std]`) patterns are performance concerns beyond ownership modeling.
- **Drop order and destructor semantics** -- while related to ownership, explicit `Drop` implementations and drop order guarantees are a distinct topic.
- **Lifetime variance and subtyping** -- covariance, contravariance, and invariance of lifetime parameters are advanced type-system topics covered in the Rustonomicon.

## Sources

- *Effective Rust* by David Drysdale -- Item 15 (avoid unnecessary clones), Item 8 (smart pointer hierarchy), Item 5 (move semantics and Into conversions)
- *Rust API Guidelines* -- C-GENERIC (accept generic types over concrete containers), C-CALLER-CONTROL (let the caller decide allocation)
- *The Rustonomicon* -- interior mutability, variance, and lifetime mechanics
- *Rust Design Patterns* -- Clone anti-pattern, Cow idiom, borrowed vs. owned type selection
- *The Rust Programming Language* (The Rust Book) -- Chapter 4 (ownership), Chapter 10 (lifetimes), Chapter 15 (smart pointers), Chapter 15.5 (interior mutability)
- Cloudflare Engineering Blog -- "Pin, Unpin, and why Rust needs them" (self-referential struct motivation)
- Clippy lint documentation -- `ptr_arg` lint (prefer slices over container references)

## See Also

- **RS9 Memory & Lifetimes** -- covers lifetime mechanics in depth, including lifetime variance, higher-ranked trait bounds (`for<'a>`), and `'static` lifetime semantics. The LifetimeElisionAwareness rule (RS1.7) in this dimension addresses when to annotate lifetimes for clarity; RS9 covers the full lifetime system including complex multi-lifetime structs, lifetime bounds on trait implementations, and the interaction between lifetimes and async/await. If a review finding involves lifetime annotations beyond simple function signatures, escalate to the RS9 dimension.
