# Project Structure -- Rust

> Structure Rust projects around Cargo workspaces, additive feature flags, and semver discipline so that crates compose safely across the ecosystem.

## Mental Model

Rust's project structure is inseparable from Cargo. Unlike ecosystems where project layout is a matter of convention, Cargo's workspace system, feature flags, and semver resolution are Cargo and compiler mechanisms that directly affect whether code compiles, how large the binary is, and whether downstream consumers can use your crate at all.

For related crates maintained together, prefer a **workspace** with shared dependency declarations. It shares a lockfile and build directory. Cargo ordinarily unifies compatible requirements such as `serde = "1.0.180"` and `"1.0.193"` even without workspace inheritance. Workspaces do not prevent all duplicate versions, particularly incompatible requirements.

**Feature flags** are Cargo's mechanism for conditional compilation, and they carry a critical constraint: features must be additive. Cargo resolves features by taking the union of all features requested by all crates in the dependency tree. If crate A enables your `json` feature and crate B enables your `yaml` feature, both features are active simultaneously. If those features are mutually exclusive -- defining the same module, the same function, or toggling incompatible behavior -- compilation can fail; consumers may need to change dependency or feature selections. For composable libraries, design additive features. Cargo permits mutually exclusive features, but they constrain downstream composition.

Default features deserve equal care. They determine what every consumer gets unless they explicitly opt out with `default-features = false`. Overly broad defaults force unnecessary dependencies (and compile time) on every consumer. Overly narrow defaults force every consumer to discover and enable the features they need. Choose defaults from the actual consumer needs; an 80% target is a house heuristic, not a measured Cargo rule. Disabling defaults on one dependency edge does not prevent another edge from enabling them.

**Module organization** follows from Rust's visibility system. The `pub(crate)` modifier enables feature-based module layouts where each domain concept lives in its own subtree, exposes a narrow public API through `mod.rs`, and keeps private implementation details hidden; `pub(crate)` items remain accessible across the crate. Choose a layout that fits actual change patterns; neither feature nor layer organization is required by Rust.

**Public dependency types** create semver obligations whether or not they are re-exported. When your public API returns or accepts types from a dependency, consumers are transitively coupled to that dependency's version. A re-export gives callers a naming path; otherwise they may use type inference or declare a compatible dependency. Incompatible changes to exposed dependency types require semver review either way.

**Semver discipline** ties everything together. The Rust ecosystem's dependency resolution assumes that semver is followed faithfully. A breaking change in a patch release can cascade through the dependency tree, breaking builds for crates that never directly depend on yours. Automated checking with `cargo-semver-checks` catches the most common accidental breakages: removed public items, changed signatures, tightened trait bounds.

## Consumer Guide

### When Reviewing Code

Check workspace setup first: if the repository contains more than one `Cargo.toml` with `[package]`, verify that a root `[workspace]` exists and that shared dependencies use `dep.workspace = true`. Inspect resolved duplicates and their constraints; differing manifest requirements alone do not establish duplicate compiled crates. Examine feature flags for additivity: search for `#[cfg(feature = "...")]` blocks that define the same item name or module. Check default, no-default, and supported individual/combined feature configurations in CI; `--all-features` tests only the all-enabled configuration. Verify that public API types from dependencies are re-exported with `pub use`. Look for `use foo::*` outside of test modules and preludes.

### When Designing / Planning

Decide on workspace structure before writing code. Identify the crate boundaries: a library crate for the core logic, a binary crate for the CLI or server, and optionally a types crate if the data model is shared across multiple consumers. Plan feature flags as additive modules from the start -- retrofitting additivity onto mutually exclusive features requires API redesign. Identify which dependencies will appear in your public API and plan re-exports. If the crate will be published, establish a semver policy and CI gate before the first release.

### When Implementing

Use `[workspace.dependencies]` for every shared dependency. Use the `dep:` syntax in feature definitions to avoid implicit feature activation. Prefer feature-domain organization when it fits the project; technical-layer organization is also valid. Mark internal types `pub(crate)`. Import symbols explicitly rather than with wildcards. Re-export any dependency type that appears in a public function signature, struct field, or trait bound. Add `cargo-semver-checks` to CI for any published crate.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| WorkspaceForMultiCrate | HIGH | Use Cargo workspaces with shared dependencies for multi-crate projects |
| AdditiveFeatureFlags | CRITICAL | Feature flags must be additive; test supported feature combinations in CI |
| MinimalDefaultFeatures | MEDIUM | Default features cover the 80% use case; core works without defaults |
| ModulePerFeature | MEDIUM | Prefer domain grouping when useful; restrict internal visibility |
| AvoidWildcardImports | MEDIUM | No wildcard imports except in tests and curated preludes |
| ReExportPublicDependencies | HIGH | Re-export dependency types exposed in public API signatures |
| SemverDiscipline | HIGH | Run cargo-semver-checks in CI; understand what constitutes a breaking change |


---

### RS10.1 WorkspaceForMultiCrate

**Impact: HIGH when uncoordinated builds cause demonstrated maintenance or compatibility problems**

Prefer a Cargo workspace for related crates maintained together. Independent builds can have separate lockfiles and build outputs; this is a maintenance concern, not proof of incompatible dependency types.

**Less centralized for related projects: Separate dependency declarations**

```rust
// crate-a/Cargo.toml
[package]
name = "crate-a"
version = "0.1.0"

[dependencies]
serde = "1.0.193"
tokio = { version = "1.35", features = ["full"] }

// crate-b/Cargo.toml
[package]
name = "crate-b"
version = "0.1.0"

[dependencies]
serde = "1.0.180"  # different lower bound, compatible with crate-a
tokio = { version = "1.35", features = ["rt"] }  # different features
crate-a = { path = "../crate-a" }
// These compatible requirements normally resolve to one serde version.
// This example demonstrates duplicated declarations, not incompatible types.
```

**Correct: Workspace with shared dependency definitions**

```rust
// Cargo.toml (workspace root)
[workspace]
members = ["crate-a", "crate-b"]

[workspace.dependencies]
serde = { version = "1.0.193", features = ["derive"] }
tokio = { version = "1.35", features = ["full"] }

// crate-a/Cargo.toml
[package]
name = "crate-a"
version = "0.1.0"

[dependencies]
serde = { workspace = true }
tokio = { workspace = true }

// crate-b/Cargo.toml
[package]
name = "crate-b"
version = "0.1.0"

[dependencies]
serde = { workspace = true }
tokio = { workspace = true }
crate-a = { path = "../crate-a" }
// Shared declarations, Cargo.lock and build directory; transitive duplicates remain possible.
```

**When acceptable:**
- Truly independent projects that share a repository but have no dependency relationship
- Prototyping a single-crate project that has not yet split into multiple crates

---

### RS10.2 AdditiveFeatureFlags

**Impact: CRITICAL (Mutually exclusive features cause compilation failures in dependency trees)**

For libraries intended to compose freely, require additive features as policy: supported combinations should compile and preserve existing functionality. When a downstream crate enables features from two of its dependencies that transitively activate conflicting features in your crate, compilation fails or behavior silently changes. Consumers may have to change dependency or feature selections; additivity avoids imposing that constraint.

**Incorrect: Mutually exclusive features that break when combined**

```rust
// Cargo.toml
[features]
default = ["json"]
json = ["serde_json"]
yaml = ["serde_yaml"]

// src/lib.rs
#[cfg(feature = "json")]
mod serializer {
    pub fn serialize(data: &Data) -> String {
        serde_json::to_string(data).unwrap()
    }
}

#[cfg(feature = "yaml")]
mod serializer {  // ERROR: duplicate module when both features enabled
    pub fn serialize(data: &Data) -> String {
        serde_yaml::to_string(data).unwrap()
    }
}
// A dependency tree that activates both "json" and "yaml" fails to compile
```

**Correct: Additive features that compose safely**

```rust
// Cargo.toml
[features]
default = ["json"]
json = ["serde_json"]
yaml = ["serde_yaml"]

// src/lib.rs
#[cfg(feature = "json")]
pub mod json {
    pub fn serialize(data: &Data) -> String {
        serde_json::to_string(data).unwrap()
    }
}

#[cfg(feature = "yaml")]
pub mod yaml {
    pub fn serialize(data: &Data) -> String {
        serde_yaml::to_string(data).unwrap()
    }
}

// CI: test feature combinations
// cargo test --no-default-features
// cargo test --no-default-features --features json
// cargo test --no-default-features --features yaml
// cargo test --all-features
```

**When acceptable:**
- Binary crates (not libraries) where the author controls the full feature matrix
- Features gated behind `#[cfg(target_os = ...)]` where mutual exclusion is enforced by the platform

---

### RS10.3 MinimalDefaultFeatures

**Impact: MEDIUM (Bloated defaults force unnecessary dependencies on all consumers)**

As a project policy, default features should cover the common use case without pulling in heavy or optional dependencies. Consumers who specify `default-features = false` must still get a functional core crate that compiles and passes its own tests.

**Incorrect: Kitchen-sink defaults that penalize minimal consumers**

```rust
// Cargo.toml
[features]
default = ["tls-native", "compression", "tracing-subscriber", "cli", "serde"]
tls-native = ["native-tls"]
tls-rustls = ["rustls"]
compression = ["flate2", "brotli"]
tracing-subscriber = ["tracing-subscriber/fmt"]
cli = ["clap"]
serde = ["serde", "serde_json"]

// A library consumer who just wants HTTP types now
// depends on native-tls (C library), flate2, brotli, clap, etc.
```

**Correct: Lean defaults with opt-in extras**

```rust
// Cargo.toml
[features]
default = ["tls-rustls"]
tls-native = ["dep:native-tls"]
tls-rustls = ["dep:rustls"]
compression = ["dep:flate2", "dep:brotli"]
tracing = ["dep:tracing-subscriber"]
cli = ["dep:clap"]
serde = ["dep:serde", "dep:serde_json"]

// Core crate compiles with: default-features = false
// Most consumers get TLS out of the box with just the default
// Heavy extras are explicit opt-in

// Using dep: syntax to avoid implicit feature activation
[dependencies]
native-tls = { version = "0.2", optional = true }
rustls = { version = "0.23", optional = true }
flate2 = { version = "1.0", optional = true }
```

**When acceptable:**
- Application crates where there are no downstream consumers
- Crates where the entire feature set is lightweight and nearly all users need everything

---

### RS10.4 ModulePerFeature

**Impact: MEDIUM (Layer-based organization scatters related logic and increases coupling)**

As a project organization preference, group by feature or domain when it keeps related changes together. Layer-based layouts are valid Rust and can suit the project. A change to a feature should touch files in one module subtree, not scatter across `models/`, `handlers/`, `services/`, and `repositories/`. Use `pub(crate)` for internal types to keep the public surface minimal.

**Less suitable when changes cross many layers: Layer-based organization**

```rust
// src/
//   models/
//     user.rs
//     order.rs
//   handlers/
//     user_handler.rs
//     order_handler.rs
//   services/
//     user_service.rs
//     order_service.rs
//   repositories/
//     user_repo.rs
//     order_repo.rs

// Adding "order cancellation" touches 4 directories
// user_handler.rs imports from models, services, repositories
// Inspect actual dependencies; this layout alone does not imply coupling.
```

**Correct: Feature-based organization**

```rust
// src/
//   user/
//     mod.rs        // pub struct User, pub fn endpoints()
//     auth.rs       // pub(crate) fn verify_credentials()
//     storage.rs    // pub(crate) fn save_user()
//   order/
//     mod.rs        // pub struct Order, pub fn endpoints()
//     fulfillment.rs // pub(crate) fn fulfill()
//     storage.rs    // pub(crate) fn save_order()
//   shared/
//     db.rs         // pub(crate) connection pool
//     error.rs      // pub error types

// src/order/mod.rs
pub struct Order { /* ... */ }

pub fn endpoints() -> Router {
    Router::new()
        .route("/orders", post(create))
        .route("/orders/:id/cancel", post(cancel))
}

// Visible throughout this crate, hidden from downstream crates
pub(crate) use storage::save_order;

// Adding "order cancellation" only touches src/order/
```

**When acceptable:**
- Very small crates (under ~500 lines) where a flat module structure is clearer
- Framework-mandated layouts (some ORMs expect a specific directory structure)

---

### RS10.5 AvoidWildcardImports

**Impact: MEDIUM (Wildcard imports cause name collisions and obscure where symbols originate)**

Glob imports (`use foo::*`) pull every public symbol into scope. Conflicting glob imports can coexist until an ambiguous name is used; explicit imports can disambiguate. Even without collisions, readers cannot determine where a type or function comes from without checking every imported module. Explicit imports serve as documentation.

**Incorrect: Wildcard imports causing ambiguity and collision**

```rust
use std::io::*;
use std::fmt::*;

// Both modules export `Result` and `Error`
// This fails to compile:
fn process() -> Result<String> {  // ambiguous: io::Result or fmt::Result?
    Ok("done".to_string())
}

// Even without collision, the reader cannot tell where `BufReader` comes from
use crate::parsing::*;
use crate::networking::*;

fn handle(stream: TcpStream) {
    let reader = BufReader::new(stream);  // from parsing? networking? std::io?
    let msg = decode(reader);             // which module defines decode()?
}
```

**Correct: Explicit imports document origin**

```rust
use std::io::{self, BufReader, Read};
use std::fmt;

fn process() -> io::Result<String> {
    Ok("done".to_string())
}

use crate::parsing::decode;
use crate::networking::TcpStream;

fn handle(stream: TcpStream) {
    let reader = BufReader::new(stream);  // clearly from std::io
    let msg = decode(reader);             // clearly from crate::parsing
}
```

**When acceptable:**
- Test modules: `use super::*` in `#[cfg(test)] mod tests` is idiomatic for accessing all items under test
- Crate-defined preludes: `use mycrate::prelude::*` when the prelude is intentionally curated and small
- Enum variants in match arms: `use MyEnum::*` inside a function to reduce repetition

---

### RS10.6 ReExportPublicDependencies

**Impact: HIGH when unmanaged public dependency changes break consumers**

When your public API exposes types from a dependency (in function signatures, trait bounds, or struct fields), consider re-exporting those types so callers can name them without another dependency declaration. Re-exports do not remove version coupling: incompatible public dependency changes can break callers either way.

**Incorrect: Public API leaks dependency types without re-export**

```rust
// my-http-client/src/lib.rs
use http::StatusCode;  // from the `http` crate

pub struct Response {
    pub status: StatusCode,  // naming this type requires a public path; inference may suffice
    pub body: Vec<u8>,
}

pub fn get(url: &str) -> Response { /* ... */ }

// To name http::StatusCode directly, the consumer can add:
//   http = "0.2"  # compatible with the exposed type
// Inference can avoid explicitly naming the type.
// If my-http-client upgrades to http 1.0, consumer's code silently breaks
// because http::StatusCode 0.2 != http::StatusCode 1.0
```

**Correct: Re-export dependency types used in public API**

```rust
// my-http-client/src/lib.rs
pub use http::StatusCode;  // re-exported: consumers use my_http_client::StatusCode

pub struct Response {
    pub status: StatusCode,
    pub body: Vec<u8>,
}

pub fn get(url: &str) -> Response { /* ... */ }

// Consumer code:
//   use my_http_client::{get, StatusCode};
//   let resp = get("https://example.com");
//   assert_eq!(resp.status, StatusCode::OK);
// No need to independently depend on `http` crate
// Version upgrades are handled by my-http-client's semver
```

**When acceptable:**
- Types from `std` which are always available and version-stable
- Internal (non-public) API boundaries within a workspace where version coupling is intentional

---

### RS10.7 SemverDiscipline

**Impact: HIGH (Undetected breaking changes in patch releases corrupt downstream dependency trees)**

Rust's ecosystem depends on semver for safe dependency resolution. A breaking change released as a patch or minor version can cause compilation failures across the entire dependency tree. Use `cargo-semver-checks` in CI to catch accidental breaking changes before they ship.

**Incorrect: No automated semver verification**

```rust
// Cargo.toml
[package]
name = "my-lib"
version = "1.2.3"

// src/lib.rs -- v1.2.3 -> v1.2.4 (patch release)
// Removed a public function (BREAKING!)
// pub fn parse(input: &str) -> Result<Data, Error> { ... }  // deleted

// Changed a public struct field type (BREAKING!)
pub struct Config {
    pub timeout: u64,  // was Duration in v1.2.3
}

// CI: only runs cargo test
// Breaking changes ship undetected as a patch release
```

**Correct: Semver-checks enforced in CI**

```rust
// .github/workflows/ci.yml (or equivalent CI config)
// jobs:
//   semver:
//     runs-on: ubuntu-latest
//     steps:
//       - uses: actions/checkout@v4
//       - uses: obi1kenobi/cargo-semver-checks-action@v2
//
//   test:
//     runs-on: ubuntu-latest
//     steps:
//       - uses: actions/checkout@v4
//       - run: cargo test --all-features

// Common breaking changes cargo-semver-checks catches:
// - Removing or renaming public items
// - Changing function signatures
// - Adding required fields to public structs
// - Tightening trait bounds
// - Removing trait implementations
// - Changing types in public API

// Release checklist:
// 1. cargo semver-checks (passes for minor/patch)
// 2. cargo test --all-features
// 3. Update CHANGELOG.md
// 4. cargo publish
```

**When acceptable:**
- Pre-1.0 releases still follow Cargo compatibility ranges: `0.1.x` patch releases are compatible; breaking changes normally move to `0.2.0`. For `0.0.x`, each patch version is incompatible.
- Internal crates in a workspace that are never published to crates.io


## Rule Interactions

**AdditiveFeatureFlags + MinimalDefaultFeatures**: These rules work together to define the feature surface. Additive feature design supports composition; test the supported matrix to catch implementation defects. Small defaults can reduce dependency work, but actual build cost depends on enabled features and use.

**ReExportPublicDependencies + SemverDiscipline**: Re-exporting supplies a convenient type path, but does not isolate consumers from incompatible public dependency changes. An exposed type changing from `http` 0.2 to 1.0 requires compatibility review. Automated checks supplement review; a pass is not proof that every source or behavioral compatibility issue is absent.

**WorkspaceForMultiCrate + ModulePerFeature**: Workspaces coordinate packages; domain grouping is an independent organization preference. A workspace does not impose module boundaries.

**AvoidWildcardImports + ModulePerFeature**: Feature-based modules with narrow `pub(crate)` exports make explicit imports natural -- there are fewer symbols to import, and each one maps directly to a domain concept.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Mutually exclusive feature flags in a library crate**: Two features that define the same symbol or toggle incompatible behavior. Cargo feature unification can force both on; resolving the conflict may require dependency changes. Resolver versions also have documented contexts where features are not unified.
- **Shipping breaking changes in patch releases**: Removing public items, changing function signatures, or tightening trait bounds in a patch or minor release. Silent build failures cascade through the dependency tree.

### HIGH

- **Missing workspace for jointly maintained crates**: Consider shared tooling and build outputs under project policy; absence alone does not establish type incompatibility.
- **Unmanaged public dependency coupling**: Re-exports can simplify naming, but compatibility must be reviewed with or without them; a compatible requirement need not pin the exact version.
- **Missing feature-matrix checks**: Test supported configurations, including defaults disabled. `--all-features` alone misses code under `cfg(not(feature = "..."))`.

### MEDIUM

- **Wildcard imports in production code**: Name collisions surface as cryptic "ambiguous import" errors, and readers lose the ability to trace where symbols originate.
- **Layout mismatched to project needs**: Evaluate actual change locality; a layer-based layout alone is not a correctness defect.
- **Kitchen-sink default features**: Every consumer pays the compile-time and binary-size cost of dependencies they do not use.

## Does Not Cover

- **Build script (`build.rs`) best practices** -- code generation, linking C libraries, and build-time configuration are separate concerns.
- **Cross-compilation and target-specific configuration** -- `#[cfg(target_os)]` and `.cargo/config.toml` target settings are outside this dimension.
- **Dependency auditing and supply chain security** -- `cargo-audit`, `cargo-vet`, and `cargo-deny` address security, not structural organization.
- **Benchmarking and profiling setup** -- covered by the Performance dimension.

## Sources

- Cargo Book: Workspaces (`[workspace]`, `[workspace.dependencies]`)
- Cargo Book: Features (additivity requirement, `dep:` syntax, default features)
- Cargo Book: SemVer Compatibility
- Effective Rust, Item 21: Understand semver
- Effective Rust, Item 23: Avoid wildcard imports
- Effective Rust, Item 24: Re-export dependencies whose types appear in your public API
- Effective Rust, Item 26: Be wary of feature creep
- The Rust Programming Language, Chapter 7: Managing Growing Projects with Packages, Crates, and Modules
- The Rust Programming Language, Chapter 14.3: Cargo Workspaces
- Rust API Guidelines, C-STABLE: Public dependencies of a stable crate are stable

### Verified primary references for candidate corrections

- https://doc.rust-lang.org/cargo/reference/resolver.html
- https://doc.rust-lang.org/cargo/reference/workspaces.html
- https://doc.rust-lang.org/cargo/reference/features.html
- https://doc.rust-lang.org/cargo/reference/semver.html
- https://doc.rust-lang.org/cargo/reference/specifying-dependencies.html
- https://doc.rust-lang.org/reference/visibility-and-privacy.html
- https://doc.rust-lang.org/reference/items/use-declarations.html
