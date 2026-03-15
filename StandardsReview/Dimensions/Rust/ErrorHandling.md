# Error Handling -- Rust

> Make every failure mode explicit in the type system, preserve the full causal chain, and place the recovery decision at the correct layer of the call stack.

## Mental Model

Rust's error handling is built on a single design choice: errors are values, not control flow. `Result<T, E>` forces every caller to acknowledge that a function can fail, and the compiler refuses to let you ignore it. This is the foundation, but it is not enough on its own. Without discipline, Rust code accumulates `unwrap()` calls that turn recoverable errors into panics, monolithic error enums that force callers to handle impossible variants, and bare `?` chains that propagate errors without any context about what the program was trying to do.

The error handling dimension organizes around a key architectural boundary: **libraries vs. applications**. Libraries exist to serve callers they cannot predict, so they must expose structured, typed errors that callers can match on. Applications exist to serve users, so they need ergonomic error reporting with full context chains. This boundary determines which crate to use (`thiserror` vs. `anyhow`), whether to panic or return `Result`, and how granular the error types should be.

Within libraries, the primary constraint is **no panics in public APIs**. A panic in a library is a unilateral decision to terminate the caller's process. The library does not know whether the caller is a CLI tool (where a crash is acceptable) or an HTTP server (where a crash kills all in-flight requests). Every public function should return `Result`, and `expect()` should only appear where the invariant is provably guaranteed at compile time.

Error type granularity follows from the caller's needs. If callers need to match on failure modes -- retry on timeout, abort on invalid input, prompt on authentication failure -- the error must be a typed enum with one variant per actionable case. If callers only need to report the error to a user or log, an erased error (`anyhow::Error`) eliminates the maintenance cost of variant enums nobody inspects.

The final principle is **context preservation**. Rust's `?` operator is powerful but lossy: it converts and propagates the error but does not explain what the program was trying to accomplish. Adding `.context()` or `.map_err()` at every `?` site produces error chains like "failed to initialize pipeline: failed to read config: config.toml: permission denied" -- messages that are immediately actionable without a debugger.

## Consumer Guide

### When Reviewing Code

Look for these signals: `unwrap()` or `expect()` in library code without a comment justifying the invariant. Bare `?` without `.context()` or `.map_err()` in functions more than a few lines long. A single error enum shared across the entire crate with variants that only apply to one module. `anyhow::Result` in a public library API. Manual `impl Error` that omits `source()`. `match` on `Result` where every arm just propagates -- this should be `?`. These patterns each indicate a specific failure in the error handling strategy.

### When Designing / Planning

Decide the library/application boundary first. For each public module, list the failure modes callers need to distinguish and create one error enum per module with only those variants. For internal modules, decide whether callers need to match on errors or just report them -- this determines typed vs. erased. Plan the context strategy: each layer of the call stack should add one sentence of context describing the operation it was attempting.

### When Implementing

Use `thiserror` for every library error type. Use `anyhow` in application code and binary crate entry points. Never call `unwrap()` in library code; use `ok_or()`, `ok_or_else()`, or `expect()` with an invariant explanation. Add `.context()` or `.with_context()` to every `?` in functions that are not trivial one-liners. Prefer `?` over `match` for propagation; use `match` only when you need to handle specific variants. Implement `source()` on every custom error that wraps another error.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| ThiserrorForLibsAnyhowForApps | CRITICAL | Use thiserror in libraries for typed errors; anyhow in applications for ergonomic reporting |
| NoPanicInLibraries | CRITICAL | Libraries must never panic; return Result and let callers decide on recovery |
| ErrorTypeGranularity | HIGH | Define error enums at module level with only variants the caller can encounter |
| ContextualErrors | HIGH | Attach .context() or .map_err() when propagating with ? to preserve the causal chain |
| ErrorTraitImplementation | HIGH | Custom errors must implement Error + Display + Debug with source() for chain traversal |
| QuestionMarkOverMatch | MEDIUM | Prefer ? for propagation, match for variant-specific handling, combinators for transforms |
| TypedVsErasedErrors | MEDIUM | Typed enums when callers match on variants; erased errors when callers only report |


---

### RS2.1 ThiserrorForLibsAnyhowForApps

**Impact: CRITICAL (Mixing error crates breaks the library/application contract and forces callers into a single error strategy)**

Libraries must expose structured, typed errors so callers can match on variants and decide how to handle each case. Applications consume those typed errors and only need to report them, so erased errors via `anyhow` are appropriate. Using `anyhow::Error` in a library's public API strips callers of the ability to handle errors programmatically; using `thiserror` in a top-level application adds ceremony with no benefit since no downstream code will match on the variants.

**Incorrect: anyhow in a library's public API**

```rust
// lib.rs of a published crate
use anyhow::Result;

/// Callers cannot match on specific failure modes.
/// They receive an opaque error with no variants to inspect.
pub fn parse_config(input: &str) -> Result<Config> {
    let raw: RawConfig = serde_json::from_str(input)?;  // erased into anyhow
    if raw.version < MIN_VERSION {
        anyhow::bail!("unsupported version: {}", raw.version);  // string, not typed
    }
    Ok(Config::from(raw))
}
```

**Correct: thiserror in libraries, anyhow in applications**

```rust
// lib.rs -- library exposes typed errors
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("invalid JSON: {0}")]
    InvalidJson(#[from] serde_json::Error),
    #[error("unsupported config version: {version} (minimum: {min})")]
    UnsupportedVersion { version: u32, min: u32 },
}

pub fn parse_config(input: &str) -> Result<Config, ConfigError> {
    let raw: RawConfig = serde_json::from_str(input)?;
    if raw.version < MIN_VERSION {
        return Err(ConfigError::UnsupportedVersion {
            version: raw.version,
            min: MIN_VERSION,
        });
    }
    Ok(Config::from(raw))
}

// main.rs -- application uses anyhow for ergonomic reporting
use anyhow::{Context, Result};

fn main() -> Result<()> {
    let input = std::fs::read_to_string("config.json")
        .context("failed to read config file")?;
    let config = mylib::parse_config(&input)
        .context("failed to parse config")?;
    run(config)
}
```

**When acceptable:**
- Internal/private modules within an application may use `anyhow` throughout since there is no external caller
- Prototype or throwaway code where the library/application boundary does not yet exist
- Binary-only crates that will never be consumed as a library dependency

---

### RS2.2 NoPanicInLibraries

**Impact: CRITICAL (A library panic terminates the caller's entire process with no recovery path)**

Libraries must never assume that a failure is unrecoverable -- that decision belongs to the caller. Every `unwrap()`, `expect()`, `panic!()`, and array index without bounds checking is a potential process abort that the caller cannot catch in safe code. Use `Result` to push the decision to the caller. When invariants truly cannot be violated, use `expect()` with a message explaining the invariant rather than bare `unwrap()`.

**Incorrect: Library function that panics on invalid input**

```rust
// lib.rs -- this kills the caller's process
pub fn get_user(users: &[User], id: usize) -> &User {
    // bare unwrap -- no context, no recovery
    users.iter().find(|u| u.id == id).unwrap()
}

pub fn parse_port(s: &str) -> u16 {
    // panics on non-numeric input; caller cannot handle gracefully
    s.parse().unwrap()
}
```

**Correct: Library returns Result, caller decides**

```rust
// lib.rs -- errors are the caller's decision
use thiserror::Error;

#[derive(Debug, Error)]
pub enum LookupError {
    #[error("user with id {0} not found")]
    UserNotFound(usize),
    #[error("invalid port number: {0}")]
    InvalidPort(#[from] std::num::ParseIntError),
}

pub fn get_user(users: &[User], id: usize) -> Result<&User, LookupError> {
    users.iter()
        .find(|u| u.id == id)
        .ok_or(LookupError::UserNotFound(id))
}

pub fn parse_port(s: &str) -> Result<u16, LookupError> {
    Ok(s.parse()?)
}

// Internal code where the invariant is provably guaranteed:
fn internal_init() {
    // expect() documents the invariant instead of bare unwrap()
    let regex = Regex::new(KNOWN_VALID_PATTERN)
        .expect("KNOWN_VALID_PATTERN is a compile-time constant and always valid");
}
```

**When acceptable:**
- `expect()` on provably infallible operations (e.g., regex compiled from a string literal, `Vec::push` on a non-full vec)
- Assertion macros (`assert!`, `debug_assert!`) that guard internal invariants which would indicate a bug in the library itself
- Implementing traits like `Index` where the trait signature requires a panic on out-of-bounds access

---

### RS2.3 ErrorTypeGranularity

**Impact: HIGH (Monolithic error enums force callers to handle impossible variants and obscure the actual failure modes)**

Define error enums at the module or function-group level so that each variant represents a failure the caller can actually encounter. When a single error enum covers the entire crate, callers must write wildcard arms for variants that cannot occur in their code path, and the compiler cannot help verify exhaustiveness in a meaningful way.

**Incorrect: One error enum for the entire crate**

```rust
// error.rs -- every error in the crate lives here
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),
    #[error("template error: {0}")]
    Template(#[from] tera::Error),
    #[error("authentication failed")]
    AuthFailed,
    #[error("not found: {0}")]
    NotFound(String),
}

// Caller must handle Database, Http, Template even when calling parse_config
pub fn parse_config(input: &str) -> Result<Config, AppError> {
    Ok(serde_json::from_str(input)?)  // only Json variant is possible
}
```

**Correct: Module-scoped error enums with actionable variants**

```rust
// config/error.rs -- only config-related failures
#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("invalid config JSON: {0}")]
    InvalidJson(#[from] serde_json::Error),
    #[error("missing required field: {field}")]
    MissingField { field: &'static str },
    #[error("invalid value for {field}: {reason}")]
    InvalidValue { field: &'static str, reason: String },
}

pub fn parse_config(input: &str) -> Result<Config, ConfigError> {
    let raw: RawConfig = serde_json::from_str(input)?;
    let host = raw.host.ok_or(ConfigError::MissingField { field: "host" })?;
    Ok(Config { host })
}

// db/error.rs -- only database-related failures
#[derive(Debug, thiserror::Error)]
pub enum DbError {
    #[error("query failed: {0}")]
    Query(#[from] sqlx::Error),
    #[error("record not found: {entity} with id {id}")]
    NotFound { entity: &'static str, id: i64 },
}
```

**When acceptable:**
- Small single-module crates where all functions share the same failure modes
- Top-level application error enums that aggregate module errors using `#[from]` for final reporting
- Prototyping where the error taxonomy is not yet settled

---

### RS2.4 ContextualErrors

**Impact: HIGH (Bare `?` propagation strips the "what was I trying to do" context, producing error messages that point at the symptom instead of the cause)**

When an error is propagated with `?`, the original error describes what went wrong at the lowest level (e.g., "No such file or directory") but not what the program was trying to accomplish. Adding `.context()` or `.map_err()` before `?` attaches the high-level operation, producing error chains like "failed to load user profile: config.toml: No such file or directory" that are immediately actionable.

**Incorrect: Bare ? loses operational context**

```rust
use std::fs;

fn load_pipeline(path: &str) -> anyhow::Result<Pipeline> {
    // Error: "No such file or directory (os error 2)"
    // Which file? What operation? Caller has no idea.
    let content = fs::read_to_string(path)?;
    let config: PipelineConfig = toml::from_str(&content)?;
    let db = Database::connect(&config.db_url)?;
    Ok(Pipeline::new(config, db))
}
```

**Correct: Every ? carries context about the operation**

```rust
use anyhow::Context;
use std::fs;

fn load_pipeline(path: &str) -> anyhow::Result<Pipeline> {
    let content = fs::read_to_string(path)
        .with_context(|| format!("failed to read pipeline config from {path}"))?;
    let config: PipelineConfig = toml::from_str(&content)
        .context("failed to parse pipeline config as TOML")?;
    let db = Database::connect(&config.db_url)
        .context("failed to connect to pipeline database")?;
    Ok(Pipeline::new(config, db))
}

// In library code without anyhow, use map_err:
fn parse_port(s: &str) -> Result<u16, ConfigError> {
    s.parse()
        .map_err(|e| ConfigError::InvalidValue {
            field: "port",
            reason: format!("{e}"),
        })
}
```

**When acceptable:**
- When the error type already carries sufficient context (e.g., a typed error variant that includes the file path)
- Internal helper functions where the caller immediately adds context
- One-liner conversions where the `From` impl provides adequate information

---

### RS2.5 ErrorTraitImplementation

**Impact: HIGH (Errors that skip Display, Debug, or source() break error reporting chains and lose causal information)**

Custom error types must implement `std::error::Error`, `Display`, and `Debug`. The `source()` method must return the underlying cause when one exists, so that error reporters (like anyhow's `{:?}` chain) can walk the full causal chain. Manual implementations are verbose and error-prone; `thiserror` generates correct implementations from annotations.

**Incorrect: Manual impl that drops the error chain**

```rust
use std::fmt;

#[derive(Debug)]
pub struct ConfigError {
    message: String,
    cause: Option<Box<dyn std::error::Error>>,
}

impl fmt::Display for ConfigError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.message)
        // cause is never displayed -- caller sees "config error"
        // but not "invalid JSON at line 12"
    }
}

impl std::error::Error for ConfigError {
    // source() not implemented -- error chain is broken
    // anyhow's {:#} and {:?} formats cannot walk the chain
}
```

**Correct: thiserror derives complete Error + Display + source()**

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("failed to read config file: {path}")]
    ReadFailed {
        path: String,
        #[source]  // source() returns this, enabling error chain traversal
        cause: std::io::Error,
    },
    #[error("invalid config JSON")]
    InvalidJson(#[from] serde_json::Error),  // #[from] implies #[source]
    #[error("missing required field: {0}")]
    MissingField(&'static str),
}

// If manual impl is needed, always implement source():
impl std::error::Error for LegacyError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        self.cause.as_deref()  // preserves the causal chain
    }
}
```

**When acceptable:**
- Leaf errors with no underlying cause (e.g., validation errors with only a message) may omit `source()`
- Error types in `#[no_std]` environments where `thiserror` is not available
- Wrapper types around foreign errors that do not implement `std::error::Error`

---

### RS2.6 QuestionMarkOverMatch

**Impact: MEDIUM (Nested match arms on Result/Option obscure the happy path and inflate function length)**

The `?` operator extracts the success value and returns early on error in a single character, keeping the happy path linear and readable. Reserve `match` for cases where you need to inspect specific error variants or transform values. For Option/Result transformations, prefer combinators (`.map()`, `.and_then()`, `.ok_or()`) over match when the closure is short.

**Incorrect: Nested match obscures the happy path**

```rust
fn process_order(id: u64) -> Result<Receipt, OrderError> {
    let user = match db::get_user(id) {
        Ok(u) => u,
        Err(e) => return Err(OrderError::from(e)),
    };
    let cart = match db::get_cart(user.cart_id) {
        Ok(c) => c,
        Err(e) => return Err(OrderError::from(e)),
    };
    let total = match cart.compute_total() {
        Ok(t) => t,
        Err(e) => return Err(OrderError::from(e)),
    };
    Ok(Receipt::new(user, total))
}
```

**Correct: ? keeps the happy path linear**

```rust
fn process_order(id: u64) -> Result<Receipt, OrderError> {
    let user = db::get_user(id)?;
    let cart = db::get_cart(user.cart_id)?;
    let total = cart.compute_total()?;
    Ok(Receipt::new(user, total))
}

// Use combinators for Option/Result transforms:
fn find_user_email(id: u64) -> Result<String, AppError> {
    db::get_user(id)?
        .email                              // Option<String>
        .ok_or(AppError::NoEmail(id))       // convert None to error
}

// match is appropriate when handling specific variants:
fn handle_db_result(result: Result<User, DbError>) -> Response {
    match result {
        Ok(user) => Response::ok(user),
        Err(DbError::NotFound { .. }) => Response::not_found(),
        Err(DbError::ConnectionLost(_)) => Response::service_unavailable(),
        Err(e) => Response::internal_error(e),
    }
}
```

**When acceptable:**
- When specific error variants require different handling (routing, retry logic, fallback)
- When you need to transform both the Ok and Err sides in a single expression
- When the match arm performs side effects (logging, metrics) before propagating

---

### RS2.7 TypedVsErasedErrors

**Impact: MEDIUM (Using the wrong error strategy forces callers to downcast when they need variants, or maintain enums nobody inspects)**

Typed error enums are appropriate when callers need to match on variants and take different actions per failure mode. Erased errors (`anyhow::Error`, `Box<dyn Error>`) are appropriate when callers only need to report or log the error without inspecting it. Choosing the wrong strategy creates friction: typed errors that nobody matches on add maintenance burden, while erased errors that callers need to downcast are fragile and bypass the type system.

**Incorrect: Erased errors in a public API where callers must distinguish failures**

```rust
// lib.rs -- callers need to retry on Timeout but abort on InvalidInput
pub fn send_request(req: Request) -> Result<Response, Box<dyn std::error::Error>> {
    // Caller must downcast to figure out what happened:
    // if let Some(timeout) = e.downcast_ref::<TimeoutError>() { ... }
    // This is fragile, not checked by the compiler, and breaks on refactors.
    let body = serde_json::to_vec(&req)?;
    let resp = http_client.post(url).body(body).send()?;
    Ok(resp)
}
```

**Correct: Match the error strategy to the caller's needs**

```rust
// Public API: callers need to act on specific failures -> typed enum
#[derive(Debug, thiserror::Error)]
pub enum RequestError {
    #[error("request timed out after {duration:?}")]
    Timeout { duration: Duration },
    #[error("invalid request payload")]
    InvalidPayload(#[from] serde_json::Error),
    #[error("connection refused: {0}")]
    ConnectionRefused(String),
}

pub fn send_request(req: Request) -> Result<Response, RequestError> {
    let body = serde_json::to_vec(&req)?;
    let resp = http_client.post(url).body(body).send()
        .map_err(|e| classify_http_error(e))?;
    Ok(resp)
}

// Internal plumbing: callers only report errors -> anyhow is fine
fn sync_background_cache() -> anyhow::Result<()> {
    let data = fetch_remote_data()
        .context("cache sync failed")?;
    write_cache(&data)
        .context("failed to write cache file")?;
    Ok(())
}
```

**When acceptable:**
- `Box<dyn Error>` in trait objects where the concrete error type cannot be named
- Erased errors in test helpers where matching on variants is unnecessary
- Migration periods when converting from stringly-typed errors to typed enums


## Rule Interactions

**ThiserrorForLibsAnyhowForApps + TypedVsErasedErrors**: These two rules address the same decision from different angles. The library/application boundary (RS2.1) determines the crate; the typed/erased distinction (RS2.7) determines the strategy within each side. A library uses thiserror and typed enums; an application uses anyhow and erased errors. Together they form a complete error architecture.

**NoPanicInLibraries + ErrorTypeGranularity**: The no-panic rule (RS2.2) forces library functions to return `Result`, which creates the need for well-designed error types. Granularity (RS2.3) ensures those error types are useful rather than a dumping ground of every possible failure.

**ContextualErrors + ErrorTraitImplementation**: Context (RS2.4) attaches operational meaning at each call site; the Error trait's `source()` method (RS2.5) ensures those layers form a traversable chain. If either is missing, the error message is incomplete: no context means "what was I doing?" is lost, no `source()` means "what went wrong underneath?" is lost.

**QuestionMarkOverMatch + ContextualErrors**: The `?` operator (RS2.6) makes propagation concise, but bare `?` drops context. These rules work together: use `?` for propagation, but attach `.context()` before the `?` to preserve meaning.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **`unwrap()` in library public APIs**: Converts a recoverable error into a process-terminating panic. The caller has no opportunity to handle the failure, retry, or report gracefully. This is the highest-severity error handling defect in Rust.
- **`anyhow::Result` as a library's public return type**: Strips callers of the ability to match on error variants. The library has made a unilateral decision that all callers only need to report errors, which is rarely true.

### HIGH

- **Bare `?` propagation through multiple layers**: Produces error messages like "No such file or directory" with no indication of which file or what operation failed. Debugging requires a stack trace or stepping through code.
- **Single crate-wide error enum with 15+ variants**: Forces every caller to handle or wildcard-match variants that cannot occur in their code path. The compiler's exhaustiveness checking becomes noise rather than signal.
- **Manual `impl Error` without `source()`**: Breaks the error chain so that error reporters (anyhow's `{:#}`, tracing's error fields) cannot display the root cause.

### MEDIUM

- **`match` on Result where every arm just returns Err(e.into())**: This is `?` with extra syntax. The match provides no additional handling, only visual noise.
- **Typed error enums that no caller ever matches on**: If every call site uses `?` to propagate and no code inspects the variants, the enum is wasted ceremony. Switch to anyhow or `Box<dyn Error>`.

## Does Not Cover

- **Panic recovery and catch_unwind** -- this dimension covers preventing panics, not recovering from them. `catch_unwind` is a separate concern for FFI boundaries and thread isolation.
- **Async error handling** -- Pin, futures, and the interaction between `?` and async blocks have additional complexity not covered here.
- **Logging and observability** -- this dimension ensures errors carry context; the choice of tracing framework, log levels, and structured logging fields is a separate concern.
- **Retry and backoff strategies** -- deciding whether to retry is an application-level concern that sits above the error type design covered here.
- **Error serialization for APIs** -- converting Rust errors to HTTP status codes, JSON error bodies, or gRPC status is an API design concern.

## Sources

- Effective Rust (ER) -- Items 3, 4, 18 on error handling idioms
- Luca Palmieri, "Error Handling In Rust - A Deep Dive" (thiserror/anyhow architecture)
- anyhow documentation (context chaining, error reporting)
- thiserror documentation (derive macros, source/from attributes)
- Rust API Guidelines (C-GOOD-ERR): error type design for public APIs
- The Rust Book, Chapter 9.2: Recoverable Errors with Result
- Comprehensive Rust (CRUST) -- error propagation patterns
