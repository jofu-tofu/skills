# Type System & Traits -- Rust

> Use Rust's type system as a design tool: encode invariants in types so that incorrect programs fail to compile rather than fail at runtime.

## Mental Model

Rust's type system is not just a bug-prevention mechanism -- it is a design language. Every struct, enum, trait bound, and generic parameter is a statement about what a program means and what it is allowed to do. The goal of this dimension is to shift correctness guarantees from runtime checks and documentation into the type system itself, where the compiler enforces them for free.

The foundational insight is **zero-cost abstraction at the type level**. Newtypes, phantom types, and typestate markers are all erased by the compiler -- they exist only during type checking and generate no runtime code. This means you can encode rich invariants (units of measurement, state machine transitions, semantic identity) without paying any performance cost. The only cost is a few lines of type definitions, and the payoff is that entire categories of bugs become impossible.

Traits are Rust's primary tool for abstraction. The choice between generics (static dispatch) and trait objects (dynamic dispatch) is a fundamental architecture decision. Generics produce specialized machine code for each concrete type -- the compiler can inline and optimize across the abstraction boundary, giving you the performance of hand-written specialized code with the expressiveness of polymorphism. Trait objects (`dyn Trait`) use vtable indirection, which costs a pointer dereference per call but enables heterogeneous collections and runtime polymorphism. The default should be generics; reach for `dyn Trait` when you need runtime flexibility or want to reduce binary size.

Associated types and generic parameters serve different purposes. An associated type says "there is exactly one natural choice of this type for each implementor" (e.g., `Iterator::Item`). A generic parameter says "this trait can be implemented multiple times for different type arguments" (e.g., `From<T>`). Choosing correctly eliminates ambiguity and reduces annotation noise.

Trait design has a forward-compatibility dimension that is unique to Rust's ecosystem. Because adding a required method to a trait is a breaking change for all implementors, library authors must think ahead. Sealed traits prevent external implementations, preserving the freedom to evolve the trait. Default method implementations let you add new methods without breaking existing code. These patterns are not optional niceties -- they are structural requirements for any public trait that will exist across semver boundaries.

Finally, the "derive what you can" principle recognizes that types in Rust are social contracts. A type that lacks `Debug` cannot appear in assert messages. A type that lacks `Clone` cannot be duplicated when ownership rules demand it. A type that lacks `PartialEq` cannot be compared in tests. Eagerly deriving common traits on public types is not boilerplate -- it is the minimum social contract that makes a type a good citizen in the ecosystem.

## Consumer Guide

### When Reviewing Code

Look for these signals: bare primitive types used for semantically distinct values (two `u64` parameters that mean different things), boolean flags tracking state that could be encoded in the type system, `dyn Trait` in performance-critical paths where generics would suffice, traits with many required methods that could have defaults, and public types missing `Debug`/`Clone`/`PartialEq` derives. Check for `PhantomData` usage without clear documentation of what invariant it encodes. Flag generic trait parameters that should be associated types (the telltale sign is turbofish annotations cluttering call sites).

### When Designing / Planning

Identify the domain invariants that should be compile-time guarantees. Map out state machines and ask whether typestate encoding is appropriate for the number of states. Decide trait boundaries early: which traits will be sealed (library-controlled implementation set) vs. open (user-extensible). Choose between associated types and generics based on whether the relationship is one-to-one or one-to-many. Plan the derive strategy for public types at the struct definition, not as an afterthought.

### When Implementing

Start every new domain concept by asking: "Should this be a newtype?" If two values of the same primitive type have different meanings, the answer is almost always yes. Use `PhantomData` for type-level tags that carry no data. Default to generics for trait bounds; switch to `dyn Trait` only when you need heterogeneous collections or plugin-style extensibility. Provide default implementations for trait methods where a sensible baseline exists. Derive `Debug, Clone, PartialEq, Eq, Hash, Default` on every public struct unless a specific trait is semantically inappropriate for the type.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| NewtypeForSemantics | HIGH | Wrap primitives in newtypes to prevent accidental mixing of semantically distinct values |
| TypestatePattern | MEDIUM | Encode state machines in generics so invalid transitions are compile errors |
| AssociatedTypesOverGenerics | MEDIUM | Use associated types when a trait has one natural implementation per type |
| TraitObjectsVsGenerics | HIGH | Default to generics for performance; use dyn Trait for runtime polymorphism |
| SealedTraitsForExtensibility | MEDIUM | Seal public traits to preserve the ability to add methods across versions |
| PhantomDataForTypeConstraints | MEDIUM | Use PhantomData for type parameters that encode invariants without storing data |
| DefaultTraitImplementations | MEDIUM | Provide default method implementations to reduce implementor burden |
| EagerCommonTraitImpls | HIGH | Derive Debug, Clone, PartialEq, Eq, Hash, Default on public types |


---

### RS5.1 NewtypeForSemantics

**Impact: HIGH (Prevents accidental mixing of semantically distinct values that share a primitive type)**

When two parameters have the same primitive type but different meanings, nothing stops you from swapping them at the call site. The compiler sees two `u64` values and is satisfied. A newtype wrapper -- `struct UserId(u64)` -- makes each meaning a distinct type, turning argument-order bugs into compile errors at zero runtime cost.

**Incorrect: Bare primitives allow silent misuse**

```rust
// Two u64 params with different meanings -- easy to swap
fn transfer(from_account: u64, to_account: u64, amount_cents: u64) {
    println!("Transfer {amount_cents} from {from_account} to {to_account}");
}

fn main() {
    let alice_id: u64 = 1001;
    let bob_id: u64 = 2002;
    let amount: u64 = 500;

    // Oops: arguments swapped, but compiles fine
    transfer(bob_id, alice_id, amount);
    // Worse: amount passed as an account ID -- still compiles
    transfer(amount, alice_id, bob_id);
}
```

**Correct: Newtypes make misuse a compile error**

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
struct AccountId(u64);

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct Cents(u64);

fn transfer(from: AccountId, to: AccountId, amount: Cents) {
    println!("Transfer {:?} from {:?} to {:?}", amount, from, to);
}

fn main() {
    let alice = AccountId(1001);
    let bob = AccountId(2002);
    let amount = Cents(500);

    transfer(alice, bob, amount); // correct -- types guide the call
    // transfer(amount, alice, bob); // compile error: expected AccountId, found Cents
}
```

**When acceptable:**
- Internal helper functions where only one value of that type exists and confusion is impossible
- Performance-sensitive FFI boundaries where the newtype wrapper would require constant unwrapping
- Throwaway scripts or prototypes where the type safety overhead is not justified

---

### RS5.2 TypestatePattern

**Impact: MEDIUM (Encodes state machines in the type system so invalid transitions are compile errors)**

The typestate pattern uses generic type parameters to represent the current state of an object. Transitions between states consume the old value and return a new value with a different type parameter, making it impossible to call methods that are invalid for the current state. The state types are zero-sized, so the pattern has no runtime cost.

**Incorrect: Runtime state checks that can be forgotten**

```rust
struct Connection {
    addr: String,
    connected: bool,
}

impl Connection {
    fn send(&self, data: &[u8]) -> Result<(), String> {
        if !self.connected {
            return Err("Not connected".into()); // runtime check, easy to forget
        }
        println!("Sending {} bytes to {}", data.len(), self.addr);
        Ok(())
    }

    fn connect(&mut self) {
        self.connected = true;
    }
}

fn main() {
    let conn = Connection { addr: "10.0.0.1".into(), connected: false };
    // Compiles fine, fails at runtime
    let _ = conn.send(b"hello");
}
```

**Correct: Typestate makes invalid transitions a compile error**

```rust
use std::marker::PhantomData;

struct Disconnected;
struct Connected;

struct Connection<State> {
    addr: String,
    _state: PhantomData<State>,
}

impl Connection<Disconnected> {
    fn new(addr: &str) -> Self {
        Connection { addr: addr.into(), _state: PhantomData }
    }

    fn connect(self) -> Connection<Connected> {
        println!("Connecting to {}", self.addr);
        Connection { addr: self.addr, _state: PhantomData }
    }
}

impl Connection<Connected> {
    fn send(&self, data: &[u8]) {
        println!("Sending {} bytes to {}", data.len(), self.addr);
    }

    fn disconnect(self) -> Connection<Disconnected> {
        Connection { addr: self.addr, _state: PhantomData }
    }
}

fn main() {
    let conn = Connection::new("10.0.0.1");
    // conn.send(b"hello"); // compile error: no method `send` on Connection<Disconnected>
    let conn = conn.connect();
    conn.send(b"hello"); // OK -- type proves we are connected
}
```

**When acceptable:**
- Simple objects with only two states where a boolean flag is clear enough
- Prototyping where the state machine is still being discovered and refactored frequently
- When the number of states is large and combinatorial, making typestate types unwieldy

---

### RS5.3 AssociatedTypesOverGenerics

**Impact: MEDIUM (Associated types clarify that a trait has one natural implementation per type, reducing annotation noise)**

When a trait has a type that is determined by the implementor and there is only one sensible choice per implementing type, use an associated type instead of a generic parameter. Generic parameters allow multiple implementations of the same trait for one type (`impl Trait<A> for X` and `impl Trait<B> for X`), which creates ambiguity and forces callers to use turbofish syntax. Associated types express the "one implementation per type" contract directly.

**Incorrect: Generic parameter where associated type belongs**

```rust
// Callers must always specify the output type
trait Graph<N, E> {
    fn edges(&self, node: &N) -> Vec<E>;
    fn nodes(&self) -> Vec<N>;
}

struct MyGraph;

// Could accidentally implement Graph<i32, i32> AND Graph<String, String>
impl Graph<i32, i32> for MyGraph {
    fn edges(&self, _node: &i32) -> Vec<i32> { vec![] }
    fn nodes(&self) -> Vec<i32> { vec![1, 2, 3] }
}

// Callers need turbofish everywhere
fn count_nodes<G: Graph<i32, i32>>(g: &G) -> usize {
    g.nodes().len()
}
```

**Correct: Associated types express one-to-one relationship**

```rust
trait Graph {
    type Node;
    type Edge;

    fn edges(&self, node: &Self::Node) -> Vec<Self::Edge>;
    fn nodes(&self) -> Vec<Self::Node>;
}

struct MyGraph;

impl Graph for MyGraph {
    type Node = i32;
    type Edge = i32;

    fn edges(&self, _node: &Self::Node) -> Vec<Self::Edge> { vec![] }
    fn nodes(&self) -> Vec<Self::Node> { vec![1, 2, 3] }
}

// Clean bounds, no turbofish needed
fn count_nodes<G: Graph>(g: &G) -> usize {
    g.nodes().len()
}
```

**When acceptable:**
- The trait genuinely needs multiple implementations per type (e.g., `From<T>` is generic because a type can convert from many sources)
- You want callers to select the type at the call site rather than at the impl site
- The trait is a mathematical operation where the operand type varies (e.g., `Add<Rhs>`)

---

### RS5.4 TraitObjectsVsGenerics

**Impact: HIGH (Choosing wrong dispatch mechanism costs either runtime performance or binary size)**

Static dispatch via generics (monomorphization) produces specialized machine code for each concrete type -- zero overhead at runtime but increased binary size. Dynamic dispatch via `dyn Trait` uses a vtable pointer -- single compiled function, smaller binary, but indirect call overhead and loss of inlining. Default to generics for performance-critical paths; use `dyn Trait` when you need heterogeneous collections, plugin architectures, or to reduce compile times on cold paths.

**Incorrect: Trait objects in a hot loop where static dispatch is free**

```rust
trait Processor {
    fn process(&self, value: f64) -> f64;
}

struct Doubler;
impl Processor for Doubler {
    fn process(&self, value: f64) -> f64 { value * 2.0 }
}

// Dynamic dispatch prevents inlining -- bad in a tight loop
fn process_batch(processor: &dyn Processor, data: &mut [f64]) {
    for v in data.iter_mut() {
        *v = processor.process(*v); // vtable call on every iteration
    }
}
```

**Correct: Generics allow inlining and vectorization**

```rust
trait Processor {
    fn process(&self, value: f64) -> f64;
}

struct Doubler;
impl Processor for Doubler {
    fn process(&self, value: f64) -> f64 { value * 2.0 }
}

// Static dispatch -- compiler can inline and vectorize
fn process_batch<P: Processor>(processor: &P, data: &mut [f64]) {
    for v in data.iter_mut() {
        *v = processor.process(*v); // direct call, inlineable
    }
}

// Use dyn Trait when you need heterogeneous collections
fn run_pipeline(steps: &[Box<dyn Processor>], value: f64) -> f64 {
    steps.iter().fold(value, |acc, step| step.process(acc))
}
```

**When acceptable:**
- Heterogeneous collections where elements have different concrete types (`Vec<Box<dyn Trait>>`)
- Plugin or extension systems where concrete types are not known at compile time
- Reducing compile times and binary size on non-performance-critical paths
- Recursive types that would be infinite without indirection (`Box<dyn Trait>` breaks the cycle)

---

### RS5.5 SealedTraitsForExtensibility

**Impact: MEDIUM (Sealed traits let library authors add methods without breaking downstream crates)**

A sealed trait is one that external crates cannot implement. This is achieved by requiring a private supertrait that lives in a private module. Because no external type can implement the private supertrait, the library author retains the freedom to add new required methods, change default implementations, or refine the trait's contract without causing a semver-breaking change. Without sealing, adding any required method to a public trait is a breaking change.

**Incorrect: Public trait that anyone can implement -- adding methods breaks users**

```rust
// Any crate can implement this trait
pub trait Backend {
    fn read(&self, key: &str) -> Option<Vec<u8>>;
    fn write(&self, key: &str, value: &[u8]);
    // Adding this method later breaks every external implementor:
    // fn delete(&self, key: &str);
}
```

**Correct: Sealed trait preserves freedom to evolve**

```rust
// Private module with private supertrait
mod private {
    pub trait Sealed {}
}

// Public trait requires the private supertrait
pub trait Backend: private::Sealed {
    fn read(&self, key: &str) -> Option<Vec<u8>>;
    fn write(&self, key: &str, value: &[u8]);
    // Safe to add later -- no external implementors exist
    fn delete(&self, key: &str);
}

// Only types in this crate can implement Sealed
pub struct FileBackend;

impl private::Sealed for FileBackend {}

impl Backend for FileBackend {
    fn read(&self, key: &str) -> Option<Vec<u8>> { todo!() }
    fn write(&self, key: &str, value: &[u8]) { todo!() }
    fn delete(&self, key: &str) { todo!() }
}

// External crates can USE Backend but cannot IMPLEMENT it
```

**When acceptable:**
- The trait is intentionally designed as an extension point for downstream crates (e.g., serialization frameworks)
- The trait is application-internal where semver compatibility is not a concern
- The trait is unlikely to gain new methods and sealing adds complexity without benefit

---

### RS5.6 PhantomDataForTypeConstraints

**Impact: MEDIUM (PhantomData lets you use type parameters without storing data, enabling zero-cost type-level distinctions)**

When a struct has a generic type parameter that does not correspond to any stored field, Rust requires `PhantomData<T>` to tell the compiler how the type parameter relates to the struct. This enables patterns like units of measurement, tagged IDs, and typestate markers where the type parameter exists solely for compile-time safety -- it occupies zero bytes at runtime.

**Incorrect: Storing unnecessary data or ignoring type safety**

```rust
// No type-level distinction between meters and seconds
struct Measurement {
    value: f64,
    // unit: String, // runtime check -- forgettable and allocates
}

fn add_measurements(a: Measurement, b: Measurement) -> Measurement {
    // Nothing prevents adding meters to seconds
    Measurement { value: a.value + b.value }
}

fn main() {
    let distance = Measurement { value: 100.0 };
    let time = Measurement { value: 9.58 };
    let nonsense = add_measurements(distance, time); // compiles, meaningless
}
```

**Correct: PhantomData encodes units at zero cost**

```rust
use std::marker::PhantomData;
use std::ops::Add;

struct Meters;
struct Seconds;

struct Measurement<Unit> {
    value: f64,
    _unit: PhantomData<Unit>,
}

impl<Unit> Measurement<Unit> {
    fn new(value: f64) -> Self {
        Measurement { value, _unit: PhantomData }
    }
}

impl<Unit> Add for Measurement<Unit> {
    type Output = Self;
    fn add(self, rhs: Self) -> Self {
        Measurement::new(self.value + rhs.value)
    }
}

fn main() {
    let d1 = Measurement::<Meters>::new(100.0);
    let d2 = Measurement::<Meters>::new(50.0);
    let _total = d1 + d2; // OK -- same units
    // let t = Measurement::<Seconds>::new(9.58);
    // let _ = d1 + t; // compile error: Meters != Seconds
}
```

**When acceptable:**
- The struct only has one meaningful interpretation and adding a phantom type parameter would be over-engineering
- The generic is used only in a single internal location where the type distinction provides no safety benefit
- You are working with FFI types where phantom data may confuse layout expectations

---

### RS5.7 DefaultTraitImplementations

**Impact: MEDIUM (Default methods minimize the burden on implementors and make traits evolvable)**

A trait with many required methods forces every implementor to write boilerplate even when most methods have an obvious default behavior. Providing default implementations for methods that have a sensible baseline lets implementors override only what differs for their type. This also makes traits forward-compatible: adding a new method with a default does not break existing implementors.

**Incorrect: All methods required -- implementor writes redundant boilerplate**

```rust
trait Logger {
    fn log_debug(&self, msg: &str);
    fn log_info(&self, msg: &str);
    fn log_warn(&self, msg: &str);
    fn log_error(&self, msg: &str);
    fn enabled(&self) -> bool;
}

// Every implementor must define all 5 methods even if behavior is standard
struct FileLogger;

impl Logger for FileLogger {
    fn log_debug(&self, msg: &str) { eprintln!("[DEBUG] {msg}"); }
    fn log_info(&self, msg: &str)  { eprintln!("[INFO] {msg}"); }
    fn log_warn(&self, msg: &str)  { eprintln!("[WARN] {msg}"); }
    fn log_error(&self, msg: &str) { eprintln!("[ERROR] {msg}"); }
    fn enabled(&self) -> bool { true }
}
```

**Correct: One required method, defaults handle the rest**

```rust
trait Logger {
    // Single required method -- the core abstraction
    fn log(&self, level: Level, msg: &str);

    // Defaults built on the required method
    fn debug(&self, msg: &str) { self.log(Level::Debug, msg); }
    fn info(&self, msg: &str)  { self.log(Level::Info, msg); }
    fn warn(&self, msg: &str)  { self.log(Level::Warn, msg); }
    fn error(&self, msg: &str) { self.log(Level::Error, msg); }
    fn enabled(&self) -> bool  { true }
}

#[derive(Debug, Clone, Copy)]
enum Level { Debug, Info, Warn, Error }

struct FileLogger;

// Implementor only provides the core method
impl Logger for FileLogger {
    fn log(&self, level: Level, msg: &str) {
        eprintln!("[{level:?}] {msg}");
    }
}
```

**When acceptable:**
- Every method is genuinely independent with no sensible default (e.g., `Read` and `Write` on an I/O trait)
- The trait is a marker trait with no methods at all
- Providing a default would hide important implementation decisions that each type must make explicitly

---

### RS5.8 EagerCommonTraitImpls

**Impact: HIGH (Missing common trait derives make public types painful to use in collections, debugging, and tests)**

Public types that lack `Debug`, `Clone`, `PartialEq`, or `Hash` become second-class citizens in the Rust ecosystem. They cannot be printed in assert messages, stored in `HashSet`/`HashMap`, compared in tests, or cloned when needed. Deriving these traits eagerly on public types costs nothing at the definition site and prevents friction everywhere the type is used. Omitting them forces downstream users to wrap your type or write boilerplate.

**Incorrect: Missing derives make the type unusable in common contexts**

```rust
// No derives -- callers cannot debug-print, compare, or hash this type
pub struct Config {
    pub name: String,
    pub max_retries: u32,
    pub timeout_ms: u64,
}

fn main() {
    let a = Config { name: "prod".into(), max_retries: 3, timeout_ms: 5000 };
    let b = Config { name: "prod".into(), max_retries: 3, timeout_ms: 5000 };

    // println!("{:?}", a);  // error: Config doesn't implement Debug
    // assert_eq!(a, b);     // error: Config doesn't implement PartialEq
    // let copy = a.clone(); // error: Config doesn't implement Clone
}
```

**Correct: Eagerly derive common traits on public types**

```rust
#[derive(Debug, Clone, PartialEq, Eq, Hash, Default)]
pub struct Config {
    pub name: String,
    pub max_retries: u32,
    pub timeout_ms: u64,
}

fn main() {
    let a = Config { name: "prod".into(), max_retries: 3, timeout_ms: 5000 };
    let b = a.clone();

    println!("{a:?}");     // works: Debug
    assert_eq!(a, b);      // works: PartialEq + Eq
    let mut set = std::collections::HashSet::new();
    set.insert(a);         // works: Hash + Eq
}
```

**When acceptable:**
- Types containing fields that cannot derive the trait (e.g., `f64` prevents `Eq` and `Hash` -- derive what you can)
- Types where `Clone` would be semantically misleading (e.g., unique handles, RAII guards)
- Internal types with very narrow usage where the derive would be dead code
- Types where `PartialEq` has domain-specific semantics that differ from field-by-field comparison


## Rule Interactions

**NewtypeForSemantics + PhantomDataForTypeConstraints**: Newtypes wrap a concrete value to give it a distinct type. PhantomData goes further -- it attaches a type parameter that carries no data at all. Together they cover the spectrum from "this u64 means AccountId" (newtype) to "this struct is parameterized by a unit of measurement" (phantom).

**TypestatePattern + PhantomDataForTypeConstraints**: The typestate pattern relies on PhantomData to carry the state type parameter. Understanding phantom types is prerequisite to implementing typestate.

**TraitObjectsVsGenerics + AssociatedTypesOverGenerics**: The dispatch mechanism (static vs. dynamic) interacts with how trait type parameters are defined. Traits with associated types work naturally with both generics and trait objects. Traits with generic parameters can be used as trait objects only when the generic is specified (`dyn Trait<Concrete>`).

**SealedTraitsForExtensibility + DefaultTraitImplementations**: Both patterns address trait evolution. Sealing prevents external implementations so you can add required methods. Defaults let you add methods without breaking existing implementations. In practice, library traits often use both: sealed to control the implementation set, and defaults to minimize boilerplate.

**EagerCommonTraitImpls + NewtypeForSemantics**: Newtypes must manually derive common traits since they do not inherit them from the wrapped type. Forgetting to derive `Debug` or `Clone` on a newtype makes it less usable than the bare primitive it replaced.

## Anti-Patterns (Severity Calibration)

### HIGH

- **Primitive obsession**: Using `u64`, `String`, or `bool` for semantically distinct domain concepts. Two `u64` parameters in a function signature that mean "user ID" and "account ID" are a swap-bug waiting to happen.
- **Missing derives on public types**: A public struct without `Debug` cannot be printed in test assertions. A public struct without `Clone` forces users to restructure their ownership model. This is a usability defect.
- **`dyn Trait` in hot loops**: Virtual dispatch prevents inlining and auto-vectorization. In tight loops, the cost per iteration adds up. Use generics when the concrete type is known at compile time.

### MEDIUM

- **Turbofish everywhere**: If callers constantly need `::<Type>` annotations to disambiguate, the trait likely uses generic parameters where associated types would be cleaner.
- **Boolean state flags**: `is_connected: bool` fields that control which methods are valid. The compiler cannot help if you call `send()` when `is_connected` is false. Typestate makes this a compile error.
- **All-required trait methods**: A trait with 8 required methods when 6 could have defaults. Every implementor writes the same boilerplate for the methods that rarely vary.
- **Unsealed library traits**: A public trait in a library crate that anyone can implement. The first time you need to add a method, you face a semver-breaking change.

## Does Not Cover

- **Lifetime annotations and borrowing** -- covered by RS1 Ownership & Borrowing.
- **Error type design** (`thiserror`, `anyhow`, custom error enums) -- covered by RS2 Error Handling.
- **Macro-generated trait implementations** -- procedural macros are a separate concern from trait design.
- **Unsafe trait implementations** -- unsafe Rust is a distinct dimension with its own rules.
- **Async trait design** (`async_trait`, RPITIT) -- async patterns have unique constraints around object safety and pinning.

## See Also

- **RS7 API Design**: Trait surface area, naming conventions, and method signatures overlap with type system design. Rules in RS7 address how traits appear to consumers; rules here address how traits encode invariants.

## Sources

- Rust Design Patterns (RDP) -- Newtype pattern, Typestate pattern
- Rust API Guidelines (RAG) -- C-NEWTYPE, C-SEALED, C-COMMON-TRAITS
- Effective Rust (ER) -- Item 6 (newtypes), Item 10 (common traits), Item 12 (generics vs trait objects), Item 13 (default implementations)
- The Rust Programming Language (RBOOK) -- Ch 18.2 (trait objects), Ch 20.2 (associated types)
- Rust by Example (RBE) -- Phantom Types, Associated Types
- Cliffle -- Typestate pattern in Rust
