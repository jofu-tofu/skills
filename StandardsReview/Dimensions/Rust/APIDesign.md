# API Design -- Rust

> Design APIs that are hard to misuse, communicate cost through naming, and can evolve across minor versions without breaking downstream code.

## Mental Model

Public Rust signatures describe ownership, borrowing, and mutation. Changes to reachable public contracts can break downstream code at compile time or change its runtime behavior. Review compatibility against actual supported uses; a `pub` item hidden in a private module is not automatically an external API.

Conversion prefixes communicate expectations: `as_` is cheap, `to_` may be expensive, and `into_` consumes its input. They do not prove a particular allocation count. By-value `to_` methods on `Copy` types are conventional too. Treat a naming-only departure as low-severity policy unless a concrete cost or ownership problem is shown.

Plan public extension points early. `#[non_exhaustive]` reserves room for enum variants and struct fields outside the defining crate; adding the attribute later can itself break existing clients. Choose the narrowest visibility that supports consumers, and review other contracts such as auto traits when evolving types.

A builder can clarify several easily confused configuration parameters and preserve old calls when optional settings are added. Named configuration structs or ordinary constructors may also fit. Accept `impl Into<T>` where convenient without weakening the intended domain boundary.

Implement formatting traits where their contracts fit. `assert_eq!` needs `Debug`, while `assert!(predicate)` need not. `std::error::Error` requires both `Debug` and `Display`; propagating `Result` with `?` does not require either formatting trait.

## Consumer Guide

### When Reviewing Code

Check conversion names against the conventions and the actual receiver and cost; `to_` on a `Copy` receiver may take self by value. Prefer `From<T>` implementations where applicable; direct `Into` is legal and can support older compiler constraints. Look for constructors with more than three parameters, especially when multiple parameters share a type -- suggest a builder. Prefer suitable `Debug` output on public types, with redaction where necessary; types implementing `Error` must also implement `Display`. Check for public enums without `#[non_exhaustive]` that are likely to grow. Verify that public items have doc comments with `# Examples`, `# Errors`, and `# Panics` sections where applicable.

### When Designing / Planning

Sketch your public API surface first and ask: "What is the minimum set of types and functions a consumer needs?" Everything else stays private or `pub(crate)`. For complex optional configuration, consider a builder or configuration struct. For enums that represent extensible categories (error variants, event types, database backends), apply `#[non_exhaustive]` in the initial design. When designing conversion traits, decide the cost category first (view, clone, or move) and name accordingly.

### When Implementing

Provide `Debug` for public types where useful; use a manual redacted implementation for sensitive fields. Implement `Display` for any type that will appear in user-facing output or error messages. Use `impl Into<T>` in function parameters and `impl From<T>` on your types. Write doc comments before implementing the function body -- the act of describing the contract often reveals design issues. Run `cargo test --doc` to verify examples compile and pass. Use `#![warn(missing_docs)]` at the crate root to catch undocumented public items.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| ConversionNaming | LOW | Follow as_/to_/into_ conventions to communicate cost and ownership |
| ImplementFromNotInto | HIGH | Implement From (blanket gives Into); accept impl Into in parameters |
| BuilderForComplexConstruction | MEDIUM | Consider builders for confusing or extensible configuration |
| TypesOverBooleans | MEDIUM | Use enums instead of bool parameters to make call sites self-documenting |
| DebugAndDisplayForAll | MEDIUM | Provide suitable Debug and user-facing Display; respect sensitive data |
| NonExhaustiveForEvolution | MEDIUM | Use #[non_exhaustive] on public enums and structs that may grow |
| DocumentPublicAPI | HIGH | Doc comments with examples, errors, panics; verified by cargo test --doc |
| MinimizePublicSurface | MEDIUM | Start private; promote to pub(crate), then pub only when needed |


---

### RS7.1 ConversionNaming

**Impact: LOW (Naming policy; increase only for demonstrated behavioral or performance harm)**

Prefer the standard conversion naming conventions. `as_` suggests a cheap borrowed view, `to_` a potentially expensive conversion, and `into_` ownership transfer. A `Copy` receiver may be passed by value to `to_`; consuming conversions can still allocate. The examples below involve an owned `String`, so their receiver and allocation comments are specific to that implementation.

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

Prefer implementing `From<T>` rather than `Into<T>` when coherence and the supported compiler version allow it. The standard library provides a blanket `impl<T, U> Into<U> for T where U: From<T>`, so implementing `From` gives you `Into` for free. Implementing `Into` directly skips this blanket and also prevents callers from using `Type::from(value)` syntax. On the consumption side, accepting `impl Into<T>` in function parameters lets callers pass either `T` or any type that converts into `T` without explicit conversion at the call site.

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
    let user = lookup_user(42u64);     // conversion performed explicitly inside lookup_user
    let explicit = UserId::from(42);    // From syntax also works
}
```

**When acceptable:**
- Supporting Rust before 1.41, where some local-to-foreign conversions required direct `Into`; this does not allow implementing a foreign trait for two wholly foreign types
- When the conversion is fallible -- use `TryFrom` instead of `From` in that case

---

### RS7.3 BuilderForComplexConstruction

**Impact: MEDIUM (Contextual API policy for complex configuration)**

For APIs with several easily confused or optional configuration values, prefer a builder when it improves call-site clarity. The parameter-count threshold is a house heuristic, not a Rust requirement. Preserve existing defaults and behavior when adding options; a builder alone does not guarantee compatibility.

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

Boolean parameters force readers to look up the function signature to understand what `true` and `false` mean at each call site. An enum with named variants communicates intent directly. Distinct enum types prevent swapping parameters with different roles. Adding a variant to an existing exhaustive public enum breaks downstream exhaustive matches; establish `#[non_exhaustive]` in the initial API if future variants are intended.

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
#[non_exhaustive]
pub enum ArrowHead {
    None,
    Forward,
    Both, // included initially; non_exhaustive permits future variants
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

**Impact: MEDIUM (Formatting support appropriate to the public contract)**

As an API policy, provide `Debug` where diagnostics benefit, and `Display` for an appropriate human-readable representation. `dbg!`, `assert_eq!`, and `{:?}` formatting require `Debug`; other assertions and logging can use different representations. `Error` requires `Debug + Display`, whereas arbitrary `Result<T, E>` and `?` do not. Do not expose secrets through derived formatting.

**Missing support when diagnostic formatting is part of the contract**

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

**Correct for these types: Debug and user-facing Display**

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
- Types containing fields without Debug (such as some trait objects) -- consider a manual placeholder representation; function pointers themselves support Debug
- Internal types in a private module that are never logged, asserted on, or formatted
- Types where Debug output would expose sensitive data (secrets, tokens) -- implement Debug manually to redact fields

---

### RS7.6 NonExhaustiveForEvolution

**Impact: MEDIUM (Reserves specific public enum and struct extension points)**

An added variant can break exhaustive downstream matches; an added field can break permitted downstream struct construction. `#[non_exhaustive]`, established before release, restricts those uses outside the defining crate. It does not guarantee that every future change is compatible: preserve auto traits and other public contracts too.

**Incorrect: Public enum without non_exhaustive -- adding a variant is a semver break**

```rust
// crate: my_lib v1.0
pub enum DatabaseError {
    ConnectionFailed,
    QueryFailed,
}

// downstream code -- exhaustive match
use my_lib::DatabaseError;
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
use my_lib::DatabaseError;
fn handle(err: my_lib::DatabaseError) {
    match err {
        DatabaseError::ConnectionFailed => retry(),
        DatabaseError::QueryFailed => report(),
        _ => log_unknown(err), // required, handles future variants
    }
}

// v1.1 alternative definition: adding this fieldless variant preserves these matches
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

**Documentation sketch: examples, errors, and panics**

This is an API sketch: supply `RateLimitExceeded`, the limiter implementation, and the example crate name before running its doctest. `todo!()` is not a successful limiter implementation.

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

Start private and choose the narrowest scope needed: `pub(super)` exposes an item to its parent scope, `pub(crate)` to the whole crate, and reachable `pub` items to downstream crates. Incompatible changes to that external contract are breaking; not every internal `pub` item or behavioral change is externally observable. A minimal public surface reduces the maintenance burden, shrinks the documentation footprint, and gives you freedom to refactor internals without releasing a new major version.

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

**NonExhaustiveForEvolution + MinimizePublicSurface**: Both rules serve semver safety from different angles. MinimizePublicSurface reduces the number of items that are part of the contract. NonExhaustiveForEvolution reserves specific extension points for public types; other compatibility obligations still apply. Apply both: make fewer things public, and protect the public things with `#[non_exhaustive]`.

**DebugAndDisplayForAll + DocumentPublicAPI**: Debug output and documentation are complementary windows into a type. Debug is the runtime representation (logging, assertions); documentation is the compile-time representation (IDE tooltips, rendered docs). Provide each where it supports the intended public contract.

## Anti-Patterns (Severity Calibration)

### HIGH

- **Hidden conversion cost with demonstrated impact**: Check allocation behavior at the actual call site; an owned return type alone does not prove a fresh allocation. Naming-only `as_`/`to_`/`into_` departures belong at LOW severity.
- **Conversion interoperability**: Prefer `From` to also provide `Into`; direct `Into` is valid and a preference-only departure should not be treated as a high-severity correctness issue.
- **Missing required diagnostic support**: Missing `Debug` prevents `dbg!` and `assert_eq!`, but is not inherently a high-severity defect. Consider manual redaction and the actual API requirements.
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
- **Error type hierarchy design** -- covered by RS2 Error Handling dimension.
- **Macro-based API generation** (proc macros, derive macros) -- a specialized topic beyond general API design.
- **C FFI API design** (`#[repr(C)]`, extern functions) -- FFI has its own conventions that sometimes conflict with idiomatic Rust API guidelines.
- **Unsafe API contracts** (safety invariants, `# Safety` doc sections) -- warrants its own dimension due to the distinct verification requirements.

## See Also

- **RS5 Type System**: The Type System dimension covers internal modeling (newtypes, phantom types, sealed traits) while API Design covers how those types are exposed to consumers. A well-designed internal type model (RS5) becomes a well-designed external API (RS7) through careful visibility control and conversion traits.

## Sources

- Rust API Guidelines (C-CONV, C-BUILDER, C-DEBUG, C-CUSTOM-TYPE, C-STRUCT-PRIVATE, C-CRATE-DOC)
- Effective Rust (Items 5, 7, 22, 27) -- conversion traits, builder pattern, visibility, documentation
- Rust Reference -- `#[non_exhaustive]` attribute semantics

## Verification Sources

- https://rust-lang.github.io/api-guidelines/naming.html
- https://doc.rust-lang.org/std/convert/trait.Into.html
- https://doc.rust-lang.org/reference/items/implementations.html#trait-implementation-coherence
- https://doc.rust-lang.org/std/error/trait.Error.html
- https://doc.rust-lang.org/reference/expressions/operator-expr.html#the-question-mark-operator
- https://rust-lang.github.io/api-guidelines/interoperability.html
- https://rust-lang.github.io/api-guidelines/type-safety.html
- https://doc.rust-lang.org/reference/attributes/type_system.html#the-non_exhaustive-attribute
- https://doc.rust-lang.org/cargo/reference/semver.html
- https://doc.rust-lang.org/reference/visibility-and-privacy.html
- https://doc.rust-lang.org/rustdoc/write-documentation/documentation-tests.html
