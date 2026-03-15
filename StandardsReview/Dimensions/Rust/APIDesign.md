# API Design -- Rust

> Design APIs that are hard to misuse, communicate cost through naming, and can evolve across minor versions without breaking downstream code.

## Mental Model

Rust's API design philosophy emerges from two forces that do not exist in most languages: the ownership system and semver-as-contract. Every public function signature is a promise about who owns data, how long it lives, and whether it can be mutated. Unlike languages where API breakage is a social convention enforced by changelogs, Rust's type system makes breakage a compile error for every downstream consumer. This means every `pub` item is a commitment with teeth.

The ownership system gives Rust a unique naming convention for conversions. The `as_`/`to_`/`into_` prefix convention is not stylistic decoration -- it encodes cost and ownership transfer into the method name. `as_str()` tells the caller "this is a zero-cost view"; `to_string()` tells them "this allocates"; `into_inner()` tells them "this consumes me." Violating these conventions does not cause a compile error, but it causes something worse: callers write code under false assumptions about performance and ownership, and the bugs surface only under load.

The semver dimension is equally critical. Adding a variant to a public enum is a breaking change. Adding a field to a public struct (if constructible by downstream) is a breaking change. Making a private function public is easy; making a public function private requires a major version bump. This asymmetry means the correct default is maximum privacy: start private, promote to `pub(crate)`, and only reach `pub` when you have a genuine external consumer. The `#[non_exhaustive]` attribute is the escape valve for types that need to grow -- it forces downstream code to handle the unknown, preserving your ability to evolve.

The builder pattern connects these ideas. A constructor with six positional parameters is unreadable, fragile to reorder, and impossible to extend without breakage. A builder names each parameter at the call site, provides defaults for optional ones, and lets you add new options in minor versions. Combined with `impl Into<T>` on builder methods, it creates APIs that are simultaneously type-safe and ergonomic.

Finally, `Debug` and `Display` are not afterthoughts -- they are infrastructure. Without `Debug`, your types cannot appear in test assertions, log lines, or error chains. Without `Display` on error types, you cannot use the `?` operator in functions returning `Result`. These traits are the minimum interface tax for participating in the Rust ecosystem.

## Consumer Guide

### When Reviewing Code

Check conversion methods for correct prefix conventions: `as_` must be O(1) borrow-to-borrow, `to_` may allocate and borrows self, `into_` must consume self. Flag any `impl Into<T>` on a type -- it should be `impl From<T>` instead (the blanket impl provides `Into` for free). Look for constructors with more than three parameters, especially when multiple parameters share a type -- suggest a builder. Verify that all public types derive or implement `Debug`, and that error types implement `Display`. Check for public enums without `#[non_exhaustive]` that are likely to grow. Verify that public items have doc comments with `# Examples`, `# Errors`, and `# Panics` sections where applicable.

### When Designing / Planning

Sketch your public API surface first and ask: "What is the minimum set of types and functions a consumer needs?" Everything else stays private or `pub(crate)`. For types that will be constructed with configuration, plan a builder from the start. For enums that represent extensible categories (error variants, event types, database backends), apply `#[non_exhaustive]` in the initial design. When designing conversion traits, decide the cost category first (view, clone, or move) and name accordingly.

### When Implementing

Apply `#[derive(Debug)]` to every public struct and enum as the first line after the doc comment. Implement `Display` for any type that will appear in user-facing output or error messages. Use `impl Into<T>` in function parameters and `impl From<T>` on your types. Write doc comments before implementing the function body -- the act of describing the contract often reveals design issues. Run `cargo test --doc` to verify examples compile and pass. Use `#![warn(missing_docs)]` at the crate root to catch undocumented public items.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| ConversionNaming | HIGH | Follow as_/to_/into_ conventions to communicate cost and ownership |
| ImplementFromNotInto | HIGH | Implement From (blanket gives Into); accept impl Into in parameters |
| BuilderForComplexConstruction | HIGH | Use builder pattern for types with 3+ configuration options |
| TypesOverBooleans | MEDIUM | Use enums instead of bool parameters to make call sites self-documenting |
| DebugAndDisplayForAll | HIGH | Derive Debug on all public types; implement Display for user-facing types |
| NonExhaustiveForEvolution | MEDIUM | Use #[non_exhaustive] on public enums and structs that may grow |
| DocumentPublicAPI | HIGH | Doc comments with examples, errors, panics; verified by cargo test --doc |
| MinimizePublicSurface | MEDIUM | Start private; promote to pub(crate), then pub only when needed |


---

### RS7.1 ConversionNaming

**Impact: HIGH (Communicates cost and ownership semantics through naming alone)**

Rust's standard library follows a strict naming convention for conversions: `as_` means a cheap reference-to-reference view (O(1), no allocation), `to_` means an expensive conversion that may allocate, and `into_` means a consuming conversion that takes ownership. When your API deviates from these conventions, callers misjudge performance characteristics and ownership transfer, leading to unnecessary clones or surprising allocations in hot paths.

**Incorrect: Naming that misleads about cost and ownership**

```rust
pub struct Name {
    inner: String,
}

impl Name {
    // Misleading: "get_" says nothing about cost or ownership
    pub fn get_string(&self) -> String {
        self.inner.clone() // hidden allocation
    }

    // Misleading: "as_" implies cheap, but this allocates
    pub fn as_uppercase(&self) -> String {
        self.inner.to_uppercase() // allocation hidden behind as_ name
    }

    // Misleading: "to_" implies non-consuming, but this takes ownership
    pub fn to_inner(self) -> String {
        self.inner // consuming, should be into_
    }
}
```

**Correct: Names that match cost and ownership semantics**

```rust
pub struct Name {
    inner: String,
}

impl Name {
    // as_: cheap borrow-to-borrow, O(1), no allocation
    pub fn as_str(&self) -> &str {
        &self.inner
    }

    // to_: expensive, allocates a new value, borrows self
    pub fn to_uppercase(&self) -> String {
        self.inner.to_uppercase()
    }

    // into_: consumes self, moves ownership, no allocation
    pub fn into_inner(self) -> String {
        self.inner
    }
}
```

**When acceptable:**
- FFI boundary wrappers where Rust naming conventions conflict with the C API being wrapped
- When implementing standard library traits (e.g., `ToString`) that dictate the method name
- Internal private helpers where the audience is the same module and the cost is obvious from context

---

### RS7.2 ImplementFromNotInto

**Impact: HIGH (Blanket Into implementation comes free; accepting impl Into in parameters enables ergonomic coercion)**

Always implement `From<T>` rather than `Into<T>`. The standard library provides a blanket `impl<T, U> Into<U> for T where U: From<T>`, so implementing `From` gives you `Into` for free. Implementing `Into` directly skips this blanket and also prevents callers from using `Type::from(value)` syntax. On the consumption side, accepting `impl Into<T>` in function parameters lets callers pass either `T` or any type that converts into `T` without explicit conversion at the call site.

**Incorrect: Implementing Into directly and requiring exact types in parameters**

```rust
pub struct UserId(u64);

// Wrong direction: implement Into instead of From
impl Into<UserId> for u64 {
    fn into(self) -> UserId {
        UserId(self)
    }
}

// Requires callers to convert manually
fn lookup_user(id: UserId) -> Option<String> {
    Some(format!("User {}", id.0))
}

fn main() {
    // Caller must write explicit conversion every time
    let user = lookup_user(42u64.into());
}
```

**Correct: Implement From, accept impl Into in parameters**

```rust
pub struct UserId(u64);

// From gives Into for free via blanket impl
impl From<u64> for UserId {
    fn from(val: u64) -> Self {
        UserId(val)
    }
}

// Accept impl Into<UserId> -- callers pass u64 directly
fn lookup_user(id: impl Into<UserId>) -> Option<String> {
    let id = id.into();
    Some(format!("User {}", id.0))
}

fn main() {
    let user = lookup_user(42u64);     // implicit conversion
    let explicit = UserId::from(42);    // From syntax also works
}
```

**When acceptable:**
- Implementing conversions for types from external crates where orphan rules prevent `From` (you own neither the source nor the target type)
- When the conversion is fallible -- use `TryFrom` instead of `From` in that case

---

### RS7.3 BuilderForComplexConstruction

**Impact: HIGH (Eliminates positional parameter confusion and supports backward-compatible addition of options)**

When a struct requires three or more configuration options -- especially when several share the same type or have sensible defaults -- a constructor with positional parameters becomes unreadable and fragile. A builder pattern names every parameter at the call site, makes defaults explicit, and lets you add new options in future versions without breaking existing callers.

**Incorrect: Constructor with many positional parameters**

```rust
pub struct HttpClient {
    base_url: String,
    timeout_ms: u64,
    max_retries: u32,
    follow_redirects: bool,
    user_agent: String,
    keep_alive: bool,
}

impl HttpClient {
    // Six positional params -- call sites are unreadable
    pub fn new(
        base_url: String, timeout_ms: u64, max_retries: u32,
        follow_redirects: bool, user_agent: String, keep_alive: bool,
    ) -> Self {
        Self { base_url, timeout_ms, max_retries, follow_redirects, user_agent, keep_alive }
    }
}

// What do true, "agent", true mean?
let client = HttpClient::new("https://api.example.com".into(), 5000, 3, true, "myapp/1.0".into(), true);
```

**Correct: Builder with named options and defaults**

```rust
pub struct HttpClient {
    base_url: String,
    timeout_ms: u64,
    max_retries: u32,
    follow_redirects: bool,
    user_agent: String,
    keep_alive: bool,
}

pub struct HttpClientBuilder {
    base_url: String,
    timeout_ms: u64,
    max_retries: u32,
    follow_redirects: bool,
    user_agent: String,
    keep_alive: bool,
}

impl HttpClientBuilder {
    pub fn new(base_url: impl Into<String>) -> Self {
        Self {
            base_url: base_url.into(),
            timeout_ms: 30_000,
            max_retries: 3,
            follow_redirects: true,
            user_agent: "rust-client/1.0".into(),
            keep_alive: true,
        }
    }

    pub fn timeout_ms(mut self, ms: u64) -> Self { self.timeout_ms = ms; self }
    pub fn max_retries(mut self, n: u32) -> Self { self.max_retries = n; self }
    pub fn user_agent(mut self, ua: impl Into<String>) -> Self { self.user_agent = ua.into(); self }

    pub fn build(self) -> HttpClient {
        HttpClient {
            base_url: self.base_url,
            timeout_ms: self.timeout_ms,
            max_retries: self.max_retries,
            follow_redirects: self.follow_redirects,
            user_agent: self.user_agent,
            keep_alive: self.keep_alive,
        }
    }
}

let client = HttpClientBuilder::new("https://api.example.com")
    .timeout_ms(5000)
    .user_agent("myapp/1.0")
    .build();
```

**When acceptable:**
- Structs with 1-2 required fields and no optional configuration
- Internal types used in a single module where the constructor is called once
- When the `derive_builder` or `bon` crate already generates the builder and manual implementation would be redundant

---

### RS7.4 TypesOverBooleans

**Impact: MEDIUM (Eliminates ambiguous boolean parameters and makes call sites self-documenting)**

Boolean parameters force readers to look up the function signature to understand what `true` and `false` mean at each call site. An enum with named variants communicates intent directly. Enums also prevent the silent swap of two booleans in adjacent parameter positions and make it easy to add a third option later without a breaking API change.

**Incorrect: Boolean parameters with opaque meaning at call sites**

```rust
fn draw_line(
    start: (f64, f64),
    end: (f64, f64),
    dashed: bool,
    arrow_head: bool,
) {
    // ...
}

// What do true, false mean here? Reader must check the signature.
draw_line((0.0, 0.0), (10.0, 10.0), true, false);

// Easy to accidentally swap the two booleans -- still compiles
draw_line((0.0, 0.0), (10.0, 10.0), false, true);
```

**Correct: Enums make every call site readable**

```rust
#[derive(Debug, Clone, Copy)]
pub enum LineStyle {
    Solid,
    Dashed,
}

#[derive(Debug, Clone, Copy)]
pub enum ArrowHead {
    None,
    Forward,
    Both, // easy to add a third variant later
}

fn draw_line(
    start: (f64, f64),
    end: (f64, f64),
    style: LineStyle,
    arrow: ArrowHead,
) {
    // ...
}

// Self-documenting -- no ambiguity at the call site
draw_line((0.0, 0.0), (10.0, 10.0), LineStyle::Dashed, ArrowHead::None);
```

**When acceptable:**
- Single boolean parameter with an unambiguous name like `enabled` or `recursive`
- Private helper functions where the call site is immediately adjacent and obvious
- Feature flags or toggles where the boolean semantics are universally understood (e.g., `verbose: bool`)

---

### RS7.5 DebugAndDisplayForAll

**Impact: HIGH (Enables logging, error messages, and assert output for every public type)**

Every public type should derive or implement `Debug` so it can appear in `dbg!()`, `assert_eq!` failure messages, log output, and error chains. Types that are user-facing -- errors, identifiers, status values -- should also implement `Display` to provide human-readable formatting. Without `Debug`, generic code that bounds on `Debug` (including most test assertion macros and logging frameworks) cannot use your types.

**Incorrect: Public types without Debug or Display**

```rust
// No Debug -- cannot use in dbg!(), assert_eq!, or format!("{:?}", ...)
pub struct Config {
    pub host: String,
    pub port: u16,
}

pub enum AppError {
    NotFound(String),
    PermissionDenied,
}

fn handle(err: AppError) {
    // Cannot print err -- no Debug or Display
    // println!("{err}");   // compile error
    // println!("{err:?}"); // compile error
}
```

**Correct: Debug on all public types, Display on user-facing types**

```rust
#[derive(Debug, Clone)]
pub struct Config {
    pub host: String,
    pub port: u16,
}

#[derive(Debug)]
pub enum AppError {
    NotFound(String),
    PermissionDenied,
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::NotFound(resource) => write!(f, "not found: {resource}"),
            Self::PermissionDenied => write!(f, "permission denied"),
        }
    }
}

impl std::error::Error for AppError {}

fn handle(err: AppError) {
    println!("{err}");     // human-readable via Display
    println!("{err:?}");   // structured via Debug
}
```

**When acceptable:**
- Types that contain fields which cannot implement Debug (e.g., raw function pointers, certain FFI types) -- implement Debug manually with placeholder output
- Internal types in a private module that are never logged, asserted on, or formatted
- Types where Debug output would expose sensitive data (secrets, tokens) -- implement Debug manually to redact fields

---

### RS7.6 NonExhaustiveForEvolution

**Impact: MEDIUM (Prevents semver-breaking changes when adding enum variants or struct fields)**

Adding a variant to a public enum or a field to a public struct is a breaking change in Rust because downstream code may have exhaustive match arms or struct literals. Marking public enums and structs with `#[non_exhaustive]` forces downstream users to include a wildcard arm in match and prevents them from constructing the struct directly, preserving your ability to evolve the API in minor versions.

**Incorrect: Public enum without non_exhaustive -- adding a variant is a semver break**

```rust
// crate: my_lib v1.0
pub enum DatabaseError {
    ConnectionFailed,
    QueryFailed,
}

// downstream code -- exhaustive match
fn handle(err: my_lib::DatabaseError) {
    match err {
        DatabaseError::ConnectionFailed => retry(),
        DatabaseError::QueryFailed => report(),
        // Adding Timeout in v1.1 breaks this match
    }
}
```

**Correct: non_exhaustive preserves semver compatibility**

```rust
// crate: my_lib v1.0
#[non_exhaustive]
#[derive(Debug)]
pub enum DatabaseError {
    ConnectionFailed,
    QueryFailed,
}

// downstream code -- wildcard required by non_exhaustive
fn handle(err: my_lib::DatabaseError) {
    match err {
        DatabaseError::ConnectionFailed => retry(),
        DatabaseError::QueryFailed => report(),
        _ => log_unknown(err), // required, handles future variants
    }
}

// v1.1 safely adds Timeout -- no downstream breakage
#[non_exhaustive]
#[derive(Debug)]
pub enum DatabaseError {
    ConnectionFailed,
    QueryFailed,
    Timeout,
}
```

**When acceptable:**
- Enums that are genuinely closed and will never gain variants (e.g., `enum Ordering { Less, Equal, Greater }`)
- Internal types not exposed in the public API (`pub(crate)` enums and structs)
- Types in binary crates (applications) that have no downstream consumers

---

### RS7.7 DocumentPublicAPI

**Impact: HIGH (Doc comments serve as the primary contract between library author and consumer)**

Every public item should have a doc comment (`///`) that explains what it does, documents error conditions with `# Errors`, panic conditions with `# Panics`, and includes a runnable example under `# Examples`. Runnable examples are tested by `cargo test --doc`, which means they serve double duty as documentation and regression tests. Missing docs can be enforced with `#![warn(missing_docs)]` at the crate root.

**Incorrect: Public API with no documentation**

```rust
pub struct RateLimiter {
    pub max_requests: u32,
    pub window_secs: u64,
}

impl RateLimiter {
    pub fn new(max_requests: u32, window_secs: u64) -> Self {
        Self { max_requests, window_secs }
    }

    pub fn check(&self, key: &str) -> bool {
        // Is true "allowed" or "rate-limited"? No way to tell without reading source.
        todo!()
    }
}
```

**Correct: Doc comments with examples, errors, and panics**

```rust
/// A sliding-window rate limiter that tracks request counts per key.
///
/// # Examples
///
/// ```
/// use my_crate::RateLimiter;
///
/// let limiter = RateLimiter::new(100, 60);
/// assert!(limiter.check("user-42").is_ok());
/// ```
pub struct RateLimiter {
    max_requests: u32,
    window_secs: u64,
}

impl RateLimiter {
    /// Creates a new rate limiter.
    ///
    /// # Panics
    ///
    /// Panics if `window_secs` is zero.
    pub fn new(max_requests: u32, window_secs: u64) -> Self {
        assert!(window_secs > 0, "window must be nonzero");
        Self { max_requests, window_secs }
    }

    /// Returns `Ok(())` if the request is allowed, or `Err(RateLimitExceeded)`
    /// if the key has exceeded `max_requests` within the current window.
    ///
    /// # Errors
    ///
    /// Returns [`RateLimitExceeded`] when the key's request count
    /// has reached the configured maximum.
    pub fn check(&self, key: &str) -> Result<(), RateLimitExceeded> {
        todo!()
    }
}
```

**When acceptable:**
- Private and `pub(crate)` items where the audience is the same team and the intent is obvious
- Trait implementations where the trait's own documentation fully describes the contract (e.g., `impl Display`)
- Generated code or FFI bindings where doc comments would be immediately stale

---

### RS7.8 MinimizePublicSurface

**Impact: MEDIUM (Every public item is a semver commitment -- less surface means more freedom to evolve)**

Start every item as private. Promote to `pub(crate)` when other modules in the same crate need access, then to `pub(super)` or `pub` only when genuinely required by external consumers. Every `pub` item becomes a permanent contract: changing its signature, removing it, or altering its behavior is a semver-breaking change. A minimal public surface reduces the maintenance burden, shrinks the documentation footprint, and gives you freedom to refactor internals without releasing a new major version.

**Incorrect: Everything public by default**

```rust
// lib.rs -- entire internal machinery is exposed
pub mod parser;
pub mod optimizer;
pub mod codegen;

// parser.rs
pub struct TokenStream { pub tokens: Vec<Token> }
pub struct Token { pub kind: TokenKind, pub span: Span }
pub fn tokenize(input: &str) -> TokenStream { todo!() }
pub fn skip_whitespace(input: &str) -> &str { todo!() }  // internal helper, now public API
pub fn merge_adjacent_strings(tokens: &mut Vec<Token>) { todo!() }  // optimization detail, now public API
```

**Correct: Expose only the intended API surface**

```rust
// lib.rs -- only the facade is public
mod parser;
mod optimizer;
mod codegen;

// Re-export the public API
pub use parser::{parse, Ast};

// parser.rs
pub(crate) struct TokenStream { tokens: Vec<Token> }
struct Token { kind: TokenKind, span: Span }

/// Parses the input string into an AST.
pub fn parse(input: &str) -> Result<Ast, ParseError> { todo!() }

// Internal helpers -- private, free to change at any time
fn tokenize(input: &str) -> TokenStream { todo!() }
fn skip_whitespace(input: &str) -> &str { todo!() }
fn merge_adjacent_strings(tokens: &mut [Token]) { todo!() }
```

**When acceptable:**
- Binary crates (applications) that have no downstream consumers -- visibility is less critical
- Types in integration test modules that need broad access for testing convenience
- When you explicitly want to expose internals for advanced users via a `pub mod internals` escape hatch, documented as unstable


## Rule Interactions

**ConversionNaming + ImplementFromNotInto**: These rules work together to create a coherent conversion API. ConversionNaming governs the method-style conversions (`as_str()`, `to_string()`, `into_inner()`), while ImplementFromNotInto governs the trait-based conversions (`From<T>`, `Into<T>`). A type might offer both: `From<String>` for generic conversion contexts and `into_inner()` as a named method for explicit call sites.

**BuilderForComplexConstruction + ImplementFromNotInto**: Builders benefit from accepting `impl Into<T>` on their setter methods, allowing callers to pass `&str` where `String` is stored internally. This combination creates APIs that are both type-safe and ergonomic.

**NonExhaustiveForEvolution + MinimizePublicSurface**: Both rules serve semver safety from different angles. MinimizePublicSurface reduces the number of items that are part of the contract. NonExhaustiveForEvolution protects the items that must be public by ensuring they can grow without breakage. Apply both: make fewer things public, and protect the public things with `#[non_exhaustive]`.

**DebugAndDisplayForAll + DocumentPublicAPI**: Debug output and documentation are complementary windows into a type. Debug is the runtime representation (logging, assertions); documentation is the compile-time representation (IDE tooltips, rendered docs). Both must exist for a type to be a full citizen of the Rust ecosystem.

## Anti-Patterns (Severity Calibration)

### HIGH

- **`as_` method that allocates**: An `as_foo()` method that returns an owned `String` or `Vec` violates the zero-cost expectation. Callers will use it in loops without realizing they are allocating on every iteration. Rename to `to_foo()`.
- **Implementing `Into` directly instead of `From`**: Skips the blanket impl, prevents `Type::from()` syntax, and is flagged by `clippy::from_over_into`. Always implement `From`.
- **Public types without `Debug`**: Breaks `assert_eq!` in downstream tests, prevents `dbg!()` usage, and makes log output useless. There is almost never a reason to omit Debug.
- **Undocumented public function that returns `Result`**: Callers cannot know what errors to expect without reading the source. The `# Errors` section is the contract.

### MEDIUM

- **Constructor with 4+ positional parameters of the same type**: `new(u64, u64, u64, u64)` is an invitation for argument-swap bugs. Use a builder or a config struct.
- **Public enum without `#[non_exhaustive]` in a library**: Every new variant will be a semver-major change. Apply the attribute proactively unless the enum is provably closed.
- **Boolean parameters in public functions**: `process(true, false, true)` is unreadable. Use enums with named variants.

### LOW

- **Over-exposing internal modules via `pub mod`**: Adds items to the public surface that you did not intend to maintain. Use private modules with selective `pub use` re-exports.

## Examples

**Conversion trio showing consistent naming:**

```rust
pub struct Path {
    inner: String,
}

impl Path {
    // as_: O(1) borrow, no allocation
    pub fn as_str(&self) -> &str {
        &self.inner
    }

    // to_: allocates a new String, borrows self
    pub fn to_normalized(&self) -> String {
        self.inner.replace("\\", "/").to_lowercase()
    }

    // into_: consumes self, transfers ownership, no allocation
    pub fn into_string(self) -> String {
        self.inner
    }
}

// Trait-based conversion via From
impl From<String> for Path {
    fn from(s: String) -> Self {
        Self { inner: s }
    }
}

// Accept impl Into in parameters
fn join_paths(base: impl Into<Path>, child: &str) -> Path {
    let base = base.into();
    Path { inner: format!("{}/{}", base.as_str(), child) }
}
```

**Builder pattern with non_exhaustive and full documentation:**

```rust
/// Configuration for the retry policy.
///
/// Use [`RetryPolicyBuilder`] to construct instances.
///
/// # Examples
///
/// ```
/// let policy = RetryPolicyBuilder::new()
///     .max_attempts(5)
///     .base_delay_ms(100)
///     .build();
/// ```
#[non_exhaustive]
#[derive(Debug, Clone)]
pub struct RetryPolicy {
    pub max_attempts: u32,
    pub base_delay_ms: u64,
    pub backoff_factor: f64,
}

#[derive(Debug)]
pub struct RetryPolicyBuilder {
    max_attempts: u32,
    base_delay_ms: u64,
    backoff_factor: f64,
}

impl RetryPolicyBuilder {
    pub fn new() -> Self {
        Self { max_attempts: 3, base_delay_ms: 1000, backoff_factor: 2.0 }
    }
    pub fn max_attempts(mut self, n: u32) -> Self { self.max_attempts = n; self }
    pub fn base_delay_ms(mut self, ms: u64) -> Self { self.base_delay_ms = ms; self }
    pub fn backoff_factor(mut self, f: f64) -> Self { self.backoff_factor = f; self }

    pub fn build(self) -> RetryPolicy {
        RetryPolicy {
            max_attempts: self.max_attempts,
            base_delay_ms: self.base_delay_ms,
            backoff_factor: self.backoff_factor,
        }
    }
}
```

## Does Not Cover

- **Async API design** (async trait patterns, `Send + Sync` bounds on futures) -- covered by concurrency dimensions.
- **Error type hierarchy design** -- covered by RS3 Error Handling dimension.
- **Macro-based API generation** (proc macros, derive macros) -- a specialized topic beyond general API design.
- **C FFI API design** (`#[repr(C)]`, extern functions) -- FFI has its own conventions that sometimes conflict with idiomatic Rust API guidelines.
- **Unsafe API contracts** (safety invariants, `# Safety` doc sections) -- warrants its own dimension due to the distinct verification requirements.

## See Also

- **RS5 Type System**: The Type System dimension covers internal modeling (newtypes, phantom types, sealed traits) while API Design covers how those types are exposed to consumers. A well-designed internal type model (RS5) becomes a well-designed external API (RS7) through careful visibility control and conversion traits.

## Sources

- Rust API Guidelines (C-CONV, C-BUILDER, C-DEBUG, C-CUSTOM-TYPE, C-STRUCT-PRIVATE, C-CRATE-DOC)
- Effective Rust (Items 5, 7, 22, 27) -- conversion traits, builder pattern, visibility, documentation
- Rust Reference -- `#[non_exhaustive]` attribute semantics
