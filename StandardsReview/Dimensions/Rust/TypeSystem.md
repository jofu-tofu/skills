# Type System & Traits -- Rust

> Use Rust's type system as a design tool: encode invariants in types so that incorrect programs fail to compile rather than fail at runtime.

## Mental Model

Rust's type system is not just a bug-prevention mechanism -- it is a design language. Every struct, enum, trait bound, and generic parameter is a statement about what a program means and what it is allowed to do. The goal of this dimension is to shift correctness guarantees from runtime checks and documentation into the type system itself, where the compiler enforces them for free.

Newtypes distinguish meanings while retaining their wrapped data. Zero-sized state markers and `PhantomData` can encode distinctions without storing a runtime tag. Operations, validation, and stored fields still have their normal costs; wrappers do not guarantee arbitrary implementations are costless.

Traits are Rust's primary tool for abstraction. The choice between generics (static dispatch) and trait objects (dynamic dispatch) is a fundamental architecture decision. Generics produce specialized machine code for each concrete type -- the compiler can inline and optimize across the abstraction boundary, giving you the performance of hand-written specialized code with the expressiveness of polymorphism. Trait objects (`dyn Trait`) support runtime dispatch through a vtable, enabling heterogeneous collections and runtime polymorphism; optimization may eliminate known indirect calls. The default should be generics; reach for `dyn Trait` when you need runtime flexibility or want to reduce binary size.

Associated types and generic parameters serve different purposes. An associated type says "there is exactly one natural choice of this type for each implementor" (e.g., `Iterator::Item`). A generic parameter says "this trait can be implemented multiple times for different type arguments" (e.g., `From<T>`). Choosing correctly eliminates ambiguity and reduces annotation noise.

Trait evolution needs compatibility review. Sealing controls the implementor set; default methods reduce implementation burden. Neither makes all changes nonbreaking: method-name collisions, loss of dyn compatibility, and changed behavior can affect callers. Open extension traits are also legitimate.

Implement common traits when their semantics fit. `Debug` supports diagnostic formatting, `Clone` explicit duplication, and `PartialEq` equality operators. Omit inappropriate traits: unique resources may deliberately be non-Clone, secrets may need redacted Debug, and a type without a meaningful valid default should omit Default.

## Consumer Guide

### When Reviewing Code

Look for these signals: bare primitive types used for semantically distinct values (two `u64` parameters that mean different things), boolean flags tracking state that could be encoded in the type system, `dyn Trait` in performance-critical paths where generics would suffice, traits with many required methods that could have defaults, and public types missing `Debug`/`Clone`/`PartialEq` derives. Check for `PhantomData` usage without clear documentation of what invariant it encodes. Flag generic trait parameters that should be associated types (the telltale sign is turbofish annotations cluttering call sites).

### When Designing / Planning

Identify the domain invariants that should be compile-time guarantees. Map out state machines and ask whether typestate encoding is appropriate for the number of states. Decide trait boundaries early: which traits will be sealed (library-controlled implementation set) vs. open (user-extensible). Choose between associated types and generics based on whether the relationship is one-to-one or one-to-many. Plan the derive strategy for public types at the struct definition, not as an afterthought.

### When Implementing

Start every new domain concept by asking: "Should this be a newtype?" If two values of the same primitive type have different meanings, the answer is almost always yes. Use `PhantomData` for type-level tags that carry no data. Choose generics or `dyn Trait` for the needed interface, code size, compile time, and measured performance. Provide default implementations for trait methods where a sensible baseline exists. Derive `Debug, Clone, PartialEq, Eq, Hash, Default` on every public struct unless a specific trait is semantically inappropriate for the type.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| NewtypeForSemantics | HIGH | Wrap primitives in newtypes to prevent accidental mixing of semantically distinct values |
| TypestatePattern | MEDIUM | Encode state machines in generics so invalid transitions are compile errors |
| AssociatedTypesOverGenerics | MEDIUM | Use associated types when a trait has one natural implementation per type |
| TraitObjectsVsGenerics | HIGH | Default to generics for performance; use dyn Trait for runtime polymorphism |
| SealedTraitsForExtensibility | MEDIUM | Seal library-controlled traits; still review caller compatibility |
| PhantomDataForTypeConstraints | MEDIUM | Use PhantomData for type parameters that encode invariants without storing data |
| DefaultTraitImplementations | MEDIUM | Provide default method implementations to reduce implementor burden |
| EagerCommonTraitImpls | MEDIUM | Implement common traits when their semantics fit the public contract |


---

### RS5.1 NewtypeForSemantics

**Impact: HIGH (Prevents accidental mixing of semantically distinct values that share a primitive type)**

When two parameters have the same primitive type but different meanings, nothing stops you from swapping them at the call site. The compiler sees two `u64` values and is satisfied. Different wrappers, such as `AccountId` and `Cents`, reject cross-domain arguments. Two values of the same `AccountId` type can still be swapped; distinguishing source and destination would require separate role types or another API choice.

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

**Correct: Newtypes reject mixing amounts with account IDs**

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

    transfer(alice, bob, amount); // types distinguish IDs from money
    transfer(bob, alice, amount); // also compiles: AccountId does not encode direction
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

The typestate pattern uses generic type parameters to represent the current state of an object. Transitions between states consume the old value and return a new value with a different type parameter, making it impossible to call methods that are invalid for the current state. Zero-sized state markers need no runtime tag; connecting, storing data, and transitions can still perform work. The state records the API protocol, not proof that a remote connection remains live.

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

When a trait has a type that is determined by the implementor and there is only one sensible choice per implementing type, use an associated type instead of a generic parameter. Generic parameters allow multiple implementations of the same trait for one type (`impl Trait<A> for X` and `impl Trait<B> for X`), which can require disambiguation when inference cannot determine the intended implementation. Associated types express the "one implementation per type" contract directly.

**Incorrect: Generic parameter where associated type belongs**

```rust
// The implementation may support several Node/Edge pairs
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

// This bound fixes the pair; callers can often rely on inference
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

Generics permit specialization for concrete types. Trait objects dispatch through a vtable unless optimization resolves the target. Specialization can help optimization and increase code size, but neither dispatch choice guarantees speed, inlining, vectorization, or binary size. Prefer generics where useful in hot paths; retain intentional dynamic dispatch and measure before treating it as a performance defect.

**Potential cost: Trait-object dispatch in a measured hot loop**

```rust
trait Processor {
    fn process(&self, value: f64) -> f64;
}

struct Doubler;
impl Processor for Doubler {
    fn process(&self, value: f64) -> f64 { value * 2.0 }
}

// Indirect dispatch may constrain optimization; inspect and measure the actual build
fn process_batch(processor: &dyn Processor, data: &mut [f64]) {
    for v in data.iter_mut() {
        *v = processor.process(*v); // runtime dispatch unless optimized away
    }
}
```

**Alternative: Generics expose a concrete target to optimization**

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

**Impact: MEDIUM (Sealing controls who implements a trait)**

A sealed trait is one that external crates cannot implement. This is achieved by requiring a private supertrait that lives in a private module. Sealing lets the author update the known implementors when adding required methods. It does not protect callers from method ambiguity, loss of dyn compatibility, or changed behavior. Adding a required method to an open trait can break downstream implementations.

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
    // All implementors are controlled here; still review caller compatibility
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

A struct cannot leave a type parameter unused. A suitable `PhantomData` field can express its relationship without storing a value of that type. `PhantomData<T>` is one form; choose the marker to reflect intended variance, auto traits, and drop checking. The marker has size zero and alignment one.

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
- At FFI boundaries, verify the complete representation and ABI; PhantomData itself has size zero and alignment one

---

### RS5.7 DefaultTraitImplementations

**Impact: MEDIUM (Default methods minimize the burden on implementors and make traits evolvable)**

A trait with many required methods forces every implementor to write boilerplate even when most methods have an obvious default behavior. Providing default implementations for methods that have a sensible baseline lets implementors override only what differs for their type. A new defaulted method avoids requiring a new method body from implementors, but can still affect name resolution or dyn compatibility.

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

**Impact: MEDIUM (Applicable common traits improve interoperability)**

Consider each common trait against the domain contract. `Debug` enables debug formatting and `assert_eq!` diagnostics; `Eq + Hash` are needed for hash keys and set elements, not arbitrary map values. `Clone` permits duplication and may share underlying state. Derive `Default` only when field defaults form a useful valid value, and redact sensitive diagnostics. These are API choices, not mandatory derives.

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

**Correct when these fieldwise operations and defaults fit the domain**

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
- Types without a useful valid default; omit Default or implement an appropriate valid default
- Types containing secrets; redact Debug manually or omit it if no suitable representation exists
- Internal types with very narrow usage where the derive would be dead code
- Types where `PartialEq` has domain-specific semantics that differ from field-by-field comparison


## Rule Interactions

**NewtypeForSemantics + PhantomDataForTypeConstraints**: Newtypes wrap a concrete value to give it a distinct type. PhantomData goes further -- it attaches a type parameter that carries no data at all. Together they cover the spectrum from "this u64 means AccountId" (newtype) to "this struct is parameterized by a unit of measurement" (phantom).

**TypestatePattern + PhantomDataForTypeConstraints**: PhantomData is one way to carry a zero-sized state parameter; typestate can also store an actual state value. Choose its marker form with variance, auto traits, and drop checking in mind.

**TraitObjectsVsGenerics + AssociatedTypesOverGenerics**: The dispatch mechanism (static vs. dynamic) interacts with how trait type parameters are defined. Traits with associated types work naturally with both generics and trait objects. Traits with generic parameters can be used as trait objects only when the generic is specified (`dyn Trait<Concrete>`).

**SealedTraitsForExtensibility + DefaultTraitImplementations**: Both patterns address trait evolution. Sealing controls implementations and defaults reduce required bodies; both still need caller-compatibility review. In practice, library traits often use both: sealed to control the implementation set, and defaults to minimize boilerplate.

**EagerCommonTraitImpls + NewtypeForSemantics**: Newtypes must manually derive common traits since they do not inherit them from the wrapped type. Derive only traits whose semantics remain appropriate for the new domain type.

## Anti-Patterns (Severity Calibration)

### HIGH

- **Primitive obsession**: Using `u64`, `String`, or `bool` for semantically distinct domain concepts. Two `u64` parameters in a function signature that mean "user ID" and "account ID" are a swap-bug waiting to happen.
- **Missing required trait support**: Report a missing implementation only when the domain contract calls for it; deliberately non-Clone resources and types without meaningful defaults are valid.
- **Measured dispatch overhead**: An indirect call can inhibit optimization, but `dyn Trait` alone is not a defect. Compare representative builds before replacing an intentional interface.

### MEDIUM

- **Turbofish everywhere**: If callers constantly need `::<Type>` annotations to disambiguate, the trait likely uses generic parameters where associated types would be cleaner.
- **Boolean state flags**: `is_connected: bool` fields that control which methods are valid. The compiler cannot help if you call `send()` when `is_connected` is false. Typestate makes this a compile error.
- **All-required trait methods**: A trait with 8 required methods when 6 could have defaults. Every implementor writes the same boilerplate for the methods that rarely vary.
- **Unplanned trait evolution**: Choose an open trait for extension or a sealed trait for library-controlled implementations. Review additions for implementor and caller compatibility.

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

## Verification Sources

- https://doc.rust-lang.org/book/ch20-03-advanced-types.html
- https://doc.rust-lang.org/std/marker/struct.PhantomData.html
- https://doc.rust-lang.org/reference/items/traits.html
- https://doc.rust-lang.org/reference/types/trait-object.html
- https://doc.rust-lang.org/book/ch18-02-trait-objects.html
- https://doc.rust-lang.org/cargo/reference/semver.html
- https://doc.rust-lang.org/reference/items/traits.html#dyn-compatibility
- https://rust-lang.github.io/api-guidelines/interoperability.html
- https://doc.rust-lang.org/std/default/trait.Default.html
- https://doc.rust-lang.org/std/clone/trait.Clone.html
