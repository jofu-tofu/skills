# Testing -- Rust

> Use Rust's built-in test framework, doc tests as living documentation, and property-based testing to verify every path through your code.

## Mental Model

Rust's testing story is unusually strong because the language embeds testing into its core toolchain rather than treating it as an afterthought. The `#[cfg(test)]` attribute means test code is compiled away in release builds, so there is zero cost to placing tests directly alongside the code they verify. This co-location is not just convenient -- it creates a structural guarantee that when you modify a function, its tests are right there demanding your attention.

The framework provides three distinct testing levels, each with a clear purpose. Unit tests live in `#[cfg(test)] mod tests` blocks inside source files and can access private items. Integration tests live in `/tests/` and can only access the public API, verifying the crate as an external consumer would. Doc tests live in `///` comments and serve double duty as documentation and verification -- when a doc example compiles and passes, the documentation is provably correct.

Beyond the built-in framework, Rust's type system creates a natural seam for testability. Because traits define behavior contracts, you can design components against trait interfaces and substitute mocks or fakes in tests without runtime reflection or monkey-patching. This is not a workaround; it is idiomatic Rust design that happens to make testing straightforward.

Property-based testing with `proptest` fills the gap that hand-written examples leave open. A developer writing test cases will think of the obvious boundaries; proptest generates thousands of inputs including empty strings, maximum-length values, unicode edge cases, and combinations that no human would anticipate. When proptest finds a failure, it shrinks the input to the minimal reproducing case and saves it in `.proptest-regressions` files that become permanent regression tests.

For security-sensitive code -- parsers, deserializers, protocol handlers -- fuzzing with `cargo fuzz` takes property testing further by feeding truly random byte sequences into your functions. If any input can cause a panic, buffer overread, or undefined behavior, fuzzing will find it. Snapshot testing with `insta` addresses the opposite problem: complex structured outputs where manual assertions are fragile and review-unfriendly.

The common failure mode in Rust testing is not "no tests" but "only happy-path tests." Error handling in Rust is explicit and pervasive thanks to `Result`, but the error branches are only as reliable as their test coverage. Testing error paths with `unwrap_err()`, `matches!`, and `#[should_panic]` is what turns Rust's type-level safety guarantees into runtime confidence.

## Consumer Guide

### When Reviewing Code

Check that every source file with logic has a `#[cfg(test)] mod tests` block. Look for `unwrap()` in production code that lacks a corresponding test proving the unwrap is safe. Verify that error variants returned by functions have dedicated test cases, not just the success path. For public API items, confirm doc comments include runnable `/// # Examples` blocks. If the crate uses proptest, ensure `.proptest-regressions` files are checked into version control. Flag integration tests that import private modules via `#[path]` hacks -- they should use only the public API.

### When Designing / Planning

Identify external dependencies (HTTP clients, databases, file systems) early and define trait interfaces for them so that test doubles can be substituted without architectural gymnastics. Decide which modules handle untrusted input and plan fuzz targets for them. For modules producing complex structured output (reports, serialized formats, rendered templates), plan snapshot tests from the start rather than writing brittle string assertions.

### When Implementing

Place `#[cfg(test)] mod tests` at the bottom of every file that contains logic. Start with a test for the happy path, then immediately write tests for each error variant your function can return. Add `/// # Examples` to every public function and type. Use `proptest` for any function that transforms, encodes, or parses data -- the roundtrip property (`decode(encode(x)) == x`) is almost always applicable. Run `cargo test --doc` in CI to catch stale documentation. For parsing or deserialization code that handles untrusted input, set up a `cargo fuzz` target early.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| UnitTestsInSameFile | HIGH | Place `#[cfg(test)] mod tests` at the bottom of each source file with `use super::*` |
| IntegrationTestsInTestsDir | HIGH | Use `/tests/` for public API tests; shared helpers in `/tests/common/mod.rs` |
| PropertyTestingWithProptest | MEDIUM | Use proptest for input-space exploration; check in `.proptest-regressions` |
| TraitBasedMocking | HIGH | Design with traits for testability; use mockall for auto-generated mocks |
| DocTestsAsExamples | MEDIUM | Write `///` examples that serve as both documentation and tests |
| TestErrorPaths | HIGH | Test error cases with `unwrap_err()`, `matches!`, `#[should_panic]`, and `-> Result` |
| SnapshotAndFuzzTesting | MEDIUM | Use insta for snapshot tests; cargo fuzz for security-sensitive parsing |


---

### RS8.1 UnitTestsInSameFile

**Impact: HIGH (Unit tests co-located with code catch regressions immediately and document expected behavior inline)**

Rust's built-in convention places unit tests in a `#[cfg(test)] mod tests` block at the bottom of each source file. This keeps tests physically adjacent to the code they verify, making it trivial to update tests when logic changes and impossible to forget they exist.

**Incorrect: Tests in a separate file mirroring the module**

```rust
// src/parser.rs
pub fn parse_header(input: &str) -> Option<Header> {
    let parts: Vec<&str> = input.splitn(2, ':').collect();
    if parts.len() == 2 {
        Some(Header {
            key: parts[0].trim().to_string(),
            value: parts[1].trim().to_string(),
        })
    } else {
        None
    }
}

// tests/test_parser.rs  <-- separate file, easy to forget, no access to private items
#[test]
fn test_parse_header() {
    let h = parser::parse_header("Content-Type: text/html").unwrap();
    assert_eq!(h.key, "Content-Type");
}
```

**Correct: Test module inside the same file**

```rust
// src/parser.rs
pub fn parse_header(input: &str) -> Option<Header> {
    let parts: Vec<&str> = input.splitn(2, ':').collect();
    if parts.len() == 2 {
        Some(Header {
            key: parts[0].trim().to_string(),
            value: parts[1].trim().to_string(),
        })
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_valid_header() {
        let h = parse_header("Content-Type: text/html").unwrap();
        assert_eq!(h.key, "Content-Type");
        assert_eq!(h.value, "text/html");
    }

    #[test]
    fn returns_none_for_missing_colon() {
        assert!(parse_header("InvalidHeader").is_none());
    }
}
```

**When acceptable:**
- Integration tests that exercise the public API across multiple modules belong in `/tests/`, not inline
- Benchmark tests using Criterion belong in `/benches/`

---

### RS8.2 IntegrationTestsInTestsDir

**Impact: HIGH (Integration tests verify the public API as an external consumer would, catching interface regressions)**

Integration tests live in the `/tests/` directory and can only access your crate's public API. This enforces a clean separation: unit tests verify internal logic, integration tests verify that the published interface works correctly. Shared test utilities go in `/tests/common/mod.rs` to avoid Cargo treating them as standalone test files.

**Incorrect: Shared helpers as top-level test files or integration logic in unit tests**

```rust
// tests/helpers.rs  <-- Cargo treats this as its own test binary
pub fn setup_test_db() -> TestDb {
    TestDb::new(":memory:")
}

// src/lib.rs  <-- integration-level tests crammed into unit test module
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn full_workflow() {
        let db = Database::connect(":memory:");
        let user = create_user(&db, "alice");
        let order = place_order(&db, &user, vec![item("widget", 3)]);
        let receipt = checkout(&db, &order);
        assert!(receipt.is_ok());
    }
}
```

**Correct: Integration tests in /tests/ with shared helpers in common/mod.rs**

```rust
// tests/common/mod.rs  <-- shared helpers, not treated as a test binary
pub fn setup_test_db() -> TestDb {
    TestDb::new(":memory:")
}

pub fn seed_user(db: &TestDb, name: &str) -> User {
    db.insert_user(name).expect("seed user")
}

// tests/order_workflow.rs  <-- true integration test
mod common;

use my_crate::{create_user, place_order, checkout, item};

#[test]
fn full_order_workflow_produces_receipt() {
    let db = common::setup_test_db();
    let user = common::seed_user(&db, "alice");
    let order = place_order(&db, &user, vec![item("widget", 3)]);
    let receipt = checkout(&db, &order);
    assert!(receipt.is_ok());
    assert_eq!(receipt.unwrap().total(), 3 * item("widget", 1).price());
}
```

**When acceptable:**
- Small libraries with no public API surface beyond a few functions may not need a separate `/tests/` directory
- When the entire crate is `#[doc(hidden)]` or not intended for external consumption

---

### RS8.3 PropertyTestingWithProptest

**Impact: MEDIUM (Discovers edge cases that hand-written examples miss by exploring the input space systematically)**

Property-based tests define invariants that must hold for all inputs, then let the framework generate thousands of random cases. This catches boundary conditions, overflow, and encoding bugs that developers do not anticipate. Always check in `.proptest-regressions` files so that discovered failures become permanent regression tests.

**Incorrect: Only hand-written examples**

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encode_decode_roundtrip() {
        let original = "hello world";
        let encoded = encode(original);
        let decoded = decode(&encoded).unwrap();
        assert_eq!(decoded, original);
        // Only tests one input; misses empty strings, unicode,
        // embedded nulls, very long strings, etc.
    }
}
```

**Correct: Property test covering the full input space**

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use proptest::prelude::*;

    // Hand-written test for documentation value
    #[test]
    fn encode_decode_basic() {
        let decoded = decode(&encode("hello")).unwrap();
        assert_eq!(decoded, "hello");
    }

    // Property test for exhaustive coverage
    proptest! {
        #[test]
        fn roundtrip_any_string(input in "\\PC*") {
            let encoded = encode(&input);
            let decoded = decode(&encoded).unwrap();
            prop_assert_eq!(decoded, input);
        }

        #[test]
        fn encoded_length_bounded(input in "\\PC{0,1000}") {
            let encoded = encode(&input);
            prop_assert!(encoded.len() <= input.len() * 4);
        }
    }
}
```

**When acceptable:**
- Pure glue code that delegates to well-tested libraries without transformation logic
- Tests for UI or I/O interactions where generating meaningful inputs is impractical
- When the invariant is difficult to express without reimplementing the function under test

---

### RS8.4 TraitBasedMocking

**Impact: HIGH (Traits decouple business logic from external dependencies, enabling fast isolated tests)**

Design components against trait interfaces rather than concrete types so that tests can substitute mocks, fakes, or stubs. Use `mockall` for auto-generated mocks when hand-written fakes are too verbose. This prevents tests from requiring network access, databases, or file systems.

**Incorrect: Business logic hardcoded to a concrete HTTP client**

```rust
use reqwest::Client;

pub struct OrderService {
    client: Client,  // concrete type -- tests must hit the network
}

impl OrderService {
    pub async fn get_price(&self, item_id: &str) -> Result<f64, Error> {
        let resp = self.client
            .get(format!("https://api.example.com/items/{item_id}"))
            .send()
            .await?;
        let data: PriceResponse = resp.json().await?;
        Ok(data.price)
    }
}

// Tests require a running API server or complex HTTP mocking
```

**Correct: Trait interface with mockall for testing**

```rust
#[cfg_attr(test, mockall::automock)]
pub trait PriceFetcher {
    async fn fetch_price(&self, item_id: &str) -> Result<f64, Error>;
}

pub struct OrderService<P: PriceFetcher> {
    price_fetcher: P,
}

impl<P: PriceFetcher> OrderService<P> {
    pub async fn get_price(&self, item_id: &str) -> Result<f64, Error> {
        self.price_fetcher.fetch_price(item_id).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn returns_fetched_price() {
        let mut mock = MockPriceFetcher::new();
        mock.expect_fetch_price()
            .with(mockall::predicate::eq("widget"))
            .returning(|_| Ok(9.99));

        let service = OrderService { price_fetcher: mock };
        assert_eq!(service.get_price("widget").await.unwrap(), 9.99);
    }
}
```

**When acceptable:**
- Small binaries where the concrete dependency is trivial to construct (e.g., an in-memory `HashMap`)
- When a hand-written fake is simpler and more readable than a mock framework
- Performance-sensitive paths where trait object or generic overhead is measurable

---

### RS8.5 DocTestsAsExamples

**Impact: MEDIUM (Doc examples that compile and run guarantee documentation never drifts from actual behavior)**

Rust's `///` doc comments with code blocks are compiled and executed by `cargo test --doc`. This turns every example in your API documentation into a living test. When the API changes and the example breaks, the test suite fails immediately, preventing stale documentation.

**Incorrect: Documentation with no runnable example**

```rust
/// Parses a duration string into seconds.
///
/// Supports formats like "5s", "3m", "2h".
/// Returns None if the format is invalid.
pub fn parse_duration(input: &str) -> Option<u64> {
    // ...
}
// No example -- users must guess the API;
// nothing verifies the documentation is correct.
```

**Correct: Doc comment with tested example**

```rust
/// Parses a duration string into seconds.
///
/// Supports formats like `"5s"`, `"3m"`, `"2h"`.
/// Returns `None` if the format is invalid.
///
/// # Examples
///
/// ```
/// use my_crate::parse_duration;
///
/// assert_eq!(parse_duration("5s"), Some(5));
/// assert_eq!(parse_duration("3m"), Some(180));
/// assert_eq!(parse_duration("2h"), Some(7200));
/// assert_eq!(parse_duration("bad"), None);
/// ```
pub fn parse_duration(input: &str) -> Option<u64> {
    // ...
}
```

**When acceptable:**
- Private functions or internal helpers that are not part of the public API
- Functions whose usage requires complex setup (database, network) where a doc test would be misleading -- use `no_run` or `ignore` annotations with a comment explaining why
- Trait implementations where the trait-level docs already provide examples

---

### RS8.6 TestErrorPaths

**Impact: HIGH (Untested error paths silently rot; when they finally execute in production, they panic or return wrong values)**

Error handling code is code. It needs tests. Use `#[should_panic]` for functions that must panic under specific conditions, and return `Result<(), E>` from test functions to use `?` for setup while asserting specific error variants. Testing only the happy path leaves the majority of branches unverified.

**Incorrect: Only testing the success path**

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_valid_config() {
        let cfg = Config::from_str("port=8080\nhost=localhost").unwrap();
        assert_eq!(cfg.port, 8080);
        assert_eq!(cfg.host, "localhost");
    }
    // No test for missing fields, invalid port, malformed lines,
    // empty input, duplicate keys...
}
```

**Correct: Comprehensive error path coverage**

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_valid_config() {
        let cfg = Config::from_str("port=8080\nhost=localhost").unwrap();
        assert_eq!(cfg.port, 8080);
    }

    #[test]
    fn rejects_missing_port() {
        let err = Config::from_str("host=localhost").unwrap_err();
        assert!(matches!(err, ConfigError::MissingField(f) if f == "port"));
    }

    #[test]
    fn rejects_invalid_port() {
        let err = Config::from_str("port=abc\nhost=localhost").unwrap_err();
        assert!(matches!(err, ConfigError::InvalidValue { field, .. } if field == "port"));
    }

    #[test]
    fn rejects_empty_input() {
        let err = Config::from_str("").unwrap_err();
        assert!(matches!(err, ConfigError::EmptyInput));
    }

    #[test]
    #[should_panic(expected = "invariant violated")]
    fn panics_on_invariant_violation() {
        Config::dangerous_unchecked(0, "");
    }

    #[test]
    fn result_returning_test() -> Result<(), ConfigError> {
        let cfg = Config::from_str("port=8080\nhost=localhost")?;
        assert_eq!(cfg.port, 8080);
        Ok(())
    }
}
```

**When acceptable:**
- Infallible functions that genuinely cannot fail (pure arithmetic on bounded inputs, newtype wrappers)
- Error paths that are already covered by integration or property-based tests at a higher level

---

### RS8.7 SnapshotAndFuzzTesting

**Impact: MEDIUM (Snapshots catch unintended output changes; fuzzing discovers crashes and panics in parsing code)**

Use `insta` for snapshot testing when outputs are complex structures, formatted text, or serialized data where manual assertions would be fragile. Use `cargo fuzz` for security-sensitive parsing, deserialization, and protocol handling where malformed input could cause panics or undefined behavior.

**Incorrect: Brittle manual assertions on complex output**

```rust
#[test]
fn test_error_report() {
    let report = generate_report(&errors);
    // Fragile: breaks on any formatting change, hard to review
    assert_eq!(report, "Error Report\n============\n\n1. FileNotFound: config.toml\n   at line 12\n\n2. ParseError: invalid syntax\n   at line 45\n");
    // Adding a new field or changing whitespace requires
    // updating this entire string manually
}
```

**Correct: Snapshot testing with insta and fuzz targets**

```rust
// Snapshot test -- complex output verified against saved snapshot
#[cfg(test)]
mod tests {
    use super::*;
    use insta::assert_snapshot;

    #[test]
    fn error_report_format() {
        let report = generate_report(&sample_errors());
        assert_snapshot!(report);
        // First run: creates snapshots/error_report_format.snap
        // Subsequent runs: compares against saved snapshot
        // Review changes with: cargo insta review
    }

    #[test]
    fn structured_output() {
        let output = build_manifest(&config());
        insta::assert_yaml_snapshot!(output);
    }
}

// Fuzz target -- in fuzz/fuzz_targets/parse_message.rs
#![no_main]
use libfuzzer_sys::fuzz_target;
use my_crate::parse_message;

fuzz_target!(|data: &[u8]| {
    // Must not panic on any input
    let _ = parse_message(data);
});
```

**When acceptable:**
- Simple return values where `assert_eq!` is clear and stable (booleans, small numbers, single strings)
- Fuzz testing is overkill for pure business logic that does not handle untrusted binary input
- When snapshot churn from frequent format changes would make reviews noisy -- stabilize the format first


## Rule Interactions

**UnitTestsInSameFile + IntegrationTestsInTestsDir**: These rules define a clear two-tier testing strategy. Unit tests in the source file verify internal logic and can access private items. Integration tests in `/tests/` verify the public API as an external consumer. Mixing these levels (integration logic in unit tests, or private-access hacks in integration tests) undermines the separation.

**TraitBasedMocking + UnitTestsInSameFile**: Trait-based design makes unit tests fast and deterministic by eliminating external dependencies. When a struct depends on a trait, the co-located unit test module can substitute a mock without any infrastructure setup.

**PropertyTestingWithProptest + TestErrorPaths**: Property tests naturally exercise error paths because generated inputs include invalid, empty, and boundary values. A roundtrip property test that exercises `parse(serialize(x))` will hit error paths in the parser that hand-written tests miss.

**DocTestsAsExamples + IntegrationTestsInTestsDir**: Doc tests verify that individual API items work as documented. Integration tests verify that multiple API items compose correctly. Together, they cover both the "does each piece work?" and "do the pieces fit together?" questions.

## Anti-Patterns (Severity Calibration)

### HIGH

- **No `#[cfg(test)]` module in files with logic**: Every file that contains conditional logic, error handling, or data transformation should have co-located tests. Files without tests are files whose behavior is unverified.
- **Only happy-path tests**: A test suite that only calls `.unwrap()` on results and never tests error variants provides false confidence. The error branches will execute first in production, not in the test suite.
- **Concrete dependencies in business logic**: Hardcoding `reqwest::Client`, `std::fs`, or database connection types into structs makes testing require live infrastructure. Extract a trait first.
- **Integration tests importing private modules**: Using `#[path = "../src/internal.rs"]` in integration tests defeats their purpose. Integration tests must use only the public API.

### MEDIUM

- **Missing doc tests on public API**: Public functions and types without `/// # Examples` blocks are undocumented in a way that will not be caught by CI. Even `cargo doc` will not warn about missing examples.
- **`.proptest-regressions` not in version control**: When proptest finds a failing case, it writes the minimal reproduction to a regressions file. If this file is gitignored, the regression will be rediscovered and re-reported on every CI run.
- **Snapshot tests without `cargo insta review` in workflow**: Snapshots that are updated blindly with `--accept` without human review defeat the purpose of snapshot testing.

## Does Not Cover

- **CI pipeline configuration** -- how to set up `cargo test`, `cargo fuzz`, and `cargo insta` in CI systems is operational, not a coding standard.
- **Test data management** -- fixtures, factory patterns, and test database seeding strategies are project-specific.
- **Code coverage thresholds** -- this dimension prescribes what to test, not a numeric coverage target.
- **Performance benchmarking** -- Criterion-based benchmarking is a separate concern from correctness testing.

## Sources

- The Rust Programming Language (RBOOK), Chapter 11: Writing Automated Tests (11.1 unit tests, 11.3 integration tests)
- The Rust Programming Language (RBOOK), Chapter 14.2: Publishing a Crate -- documentation examples
- Effective Rust (ER), Item 30: Write more than unit tests
- Rust API Guidelines, C-EXAMPLE: Function examples
- proptest crate documentation: https://docs.rs/proptest
- Palmieri, "Property-Based Testing in Rust with Proptest"
- mockall crate documentation: https://docs.rs/mockall
- insta crate documentation: https://docs.rs/insta
- cargo-fuzz documentation: https://rust-fuzz.github.io/book/cargo-fuzz.html
