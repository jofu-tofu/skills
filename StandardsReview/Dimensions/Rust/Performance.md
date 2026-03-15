# Performance -- Rust

> Write code that is fast by default through zero-cost abstractions and allocation awareness, and prove it is fast through measurement.

## Mental Model

Rust's performance story rests on three pillars: zero-cost abstractions, allocation awareness, and a profiling-first culture.

**Zero-cost abstractions** are the foundation. Iterators, trait dispatch, closures, and ownership transfers compile down to the same machine code as hand-written C loops. This means that idiomatic, readable Rust is already fast Rust. The temptation to "optimize" by dropping to raw index loops, unsafe pointer arithmetic, or manual memory management is almost always counterproductive -- it sacrifices readability and safety for performance gains that do not exist. The compiler's optimizer sees through iterator chains, inlines closures, and elides bounds checks when it can prove they are unnecessary. Writing idiomatic code is not a performance compromise; it is the performance strategy.

**Allocation awareness** is the second pillar. In garbage-collected languages, allocations are invisible -- you create objects and the runtime handles the rest. In Rust, every `String`, `Vec`, `Box`, and `HashMap` is an explicit trip to the global allocator. This visibility is a superpower: you can see exactly where heap allocations happen and decide whether they are necessary. The key patterns are: accept borrowed types (`&str`, `&[T]`) instead of owned types (`String`, `Vec<T>`) when you only need to read; preallocate collections when the size is known; use small-buffer optimization (`SmallVec`, `SmallString`) when most instances are small; and avoid materializing intermediate collections in iterator pipelines. The caller-control principle -- letting the caller decide whether to allocate -- is the API design corollary.

**Profiling-first culture** is the third pillar. Even with zero-cost abstractions and allocation awareness, real performance work requires empirical measurement. Developer intuition about bottlenecks is unreliable. A function that "looks slow" may account for 0.1% of runtime, while the actual bottleneck hides in an innocent-looking loop. Cargo-flamegraph, perf, DHAT, and criterion.rs provide the tools to measure where time and memory are actually spent. The rule is simple: profile in release mode with debug symbols, identify the hot path, optimize only that path, and benchmark to confirm the improvement. Optimizing without measurement is guessing.

Data layout completes the picture. Modern CPUs are cache-line machines: accessing contiguous memory is fast, chasing pointers is slow. When a tight loop touches only one field of a struct, storing all instances of that field contiguously (Struct-of-Arrays) can reduce cache misses by an order of magnitude compared to the default Array-of-Structs layout. This is not a universal transformation -- it trades API ergonomics for cache performance -- but in hot loops over large collections, it is often the single largest optimization available.

## Consumer Guide

### When Reviewing Code

Look for these performance signals: `.clone()` calls in hot paths (covered by the Ownership dimension but relevant here), `.collect()` calls that create intermediate Vec values only to be iterated again, functions that accept `String` or `Vec<T>` when they only read the data, empty `Vec::new()` followed by a loop of known iteration count, `#[bench]` on nightly instead of criterion, and `unsafe` blocks justified by "performance" without accompanying benchmark evidence. Each of these is a location where performance is being left on the table or, worse, where readability and safety are being sacrificed for imaginary gains.

### When Designing / Planning

Decide early whether a data structure will be in a hot path. If it will be iterated thousands of times per frame or per request, plan the data layout (SoA vs AoS) at design time -- retrofitting is expensive. Design function signatures to accept borrowed types by default; this is an API decision that is hard to change later without breaking callers. Plan the benchmarking strategy alongside the feature: which operations will be benchmarked, what are the acceptable latency targets, and how will regressions be detected in CI.

### When Implementing

Use iterators as the default loop construct. Preallocate with `with_capacity` when the size is known. Accept `&str` and `&[T]` in function parameters. Chain iterator adaptors lazily and call a single terminal operation. When serialization or deserialization is on the hot path, use `#[serde(borrow)]` or zerocopy to avoid per-field allocations. Set up criterion benchmarks for any function whose performance matters, and use `black_box` to prevent dead-code elimination. Profile with cargo-flamegraph before reaching for unsafe or exotic optimizations.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| IteratorsOverLoops | HIGH | Prefer iterator chains over manual index loops for equivalent or better compiled output |
| PreallocateCollections | HIGH | Use Vec::with_capacity when the collection size is known or estimable |
| AvoidUnnecessaryAllocations | HIGH | Accept &str over String, use SmallVec for small collections, let callers control allocation |
| BenchmarkWithCriterion | MEDIUM | Use criterion.rs with black_box for statistically rigorous benchmarks on stable Rust |
| CacheFriendlyDataLayouts | MEDIUM | Use Struct-of-Arrays over Array-of-Structs for hot loops that touch few fields |
| CollectLazilyConsumeEagerly | HIGH | Chain iterators lazily without intermediate .collect() calls |
| ProfileBeforeOptimizing | MEDIUM | Use cargo flamegraph and DHAT to identify real bottlenecks before optimizing |
| ZeroCopyDeserialization | MEDIUM | Use serde borrow, zerocopy, or rkyv to avoid per-field allocations in deserialization |


---

### RS4.1 IteratorsOverLoops

**Impact: HIGH (Iterator chains compile to equivalent or better machine code than manual loops while being more readable and less error-prone)**

Rust's iterator adaptors are zero-cost abstractions. The compiler inlines and optimizes iterator chains into the same LLVM IR as hand-written index loops -- and often produces better code because bounds checks are elided. Manual index loops introduce opportunities for off-by-one errors, unchecked indexing, and obscure intent behind loop mechanics.

**Incorrect: Manual index loop with bounds tracking**

```rust
fn sum_of_squares_of_evens(data: &[i32]) -> i64 {
    let mut result: i64 = 0;
    for i in 0..data.len() {
        if data[i] % 2 == 0 {
            result += (data[i] as i64) * (data[i] as i64);
        }
    }
    result
}

fn find_first_negative(values: &[f64]) -> Option<f64> {
    for i in 0..values.len() {
        if values[i] < 0.0 {
            return Some(values[i]);
        }
    }
    None
}
```

**Correct: Iterator chains express intent directly**

```rust
fn sum_of_squares_of_evens(data: &[i32]) -> i64 {
    data.iter()
        .filter(|&&x| x % 2 == 0)
        .map(|&x| (x as i64) * (x as i64))
        .sum()
}

fn find_first_negative(values: &[f64]) -> Option<f64> {
    values.iter().copied().find(|&v| v < 0.0)
}
```

**When acceptable:**
- Mutating multiple elements in-place where the borrow checker makes iterator-based mutation awkward
- Complex loop bodies with multiple break/continue conditions and mutable state that does not map cleanly to fold or scan
- Interfacing with C-style APIs that require raw pointer arithmetic within the loop body

---

### RS4.2 PreallocateCollections

**Impact: HIGH (Vec::with_capacity avoids repeated reallocations that each copy the entire buffer, turning O(n) amortized into O(1) per push)**

When you know the final size of a collection -- or a reasonable upper bound -- preallocating eliminates the geometric reallocation strategy that Vec, HashMap, and String use internally. Each reallocation copies all existing elements to a new, larger buffer. For large collections built in loops, this means multiple full-buffer copies that are entirely avoidable.

**Incorrect: Growing from empty with repeated reallocations**

```rust
fn build_lookup(names: &[String]) -> Vec<String> {
    let mut result = Vec::new(); // capacity 0, will reallocate ~log2(n) times
    for name in names {
        result.push(name.to_uppercase());
    }
    result
}

fn read_all_lines(path: &std::path::Path) -> std::io::Result<String> {
    let mut output = String::new(); // unknown capacity
    let content = std::fs::read_to_string(path)?;
    for line in content.lines() {
        output.push_str(line);
        output.push('\n');
    }
    Ok(output)
}
```

**Correct: Preallocate when size is known or estimable**

```rust
fn build_lookup(names: &[String]) -> Vec<String> {
    let mut result = Vec::with_capacity(names.len());
    for name in names {
        result.push(name.to_uppercase());
    }
    result
}

fn read_all_lines(path: &std::path::Path) -> std::io::Result<String> {
    let content = std::fs::read_to_string(path)?;
    let mut output = String::with_capacity(content.len());
    for line in content.lines() {
        output.push_str(line);
        output.push('\n');
    }
    Ok(output)
}
```

**When acceptable:**
- Collection size is truly unknown and no reasonable upper bound exists
- The collection is small (fewer than ~16 elements) where the default capacity strategy is sufficient
- Building a collection lazily from an async stream where the total count is not available upfront

---

### RS4.3 AvoidUnnecessaryAllocations

**Impact: HIGH (Accepting &str instead of String avoids forcing callers to allocate; SmallVec eliminates heap allocation for small collections)**

Every heap allocation involves a call to the global allocator, which is orders of magnitude slower than stack access. Functions that accept owned types when they only need to read force callers to clone or allocate unnecessarily. The caller-control principle says: let the caller decide whether to allocate; the callee should accept the most general borrowed form.

**Incorrect: Requiring ownership when only reading**

```rust
fn greet(name: String) {
    println!("Hello, {name}!");
}

fn contains_keyword(words: Vec<String>, keyword: String) -> bool {
    words.iter().any(|w| w == &keyword)
}

fn main() {
    let name = String::from("Alice");
    greet(name.clone()); // forced allocation just to say hello
    greet(name);         // moves, cannot reuse

    let words = vec!["foo".into(), "bar".into()];
    contains_keyword(words, "foo".into()); // two unnecessary allocations
}
```

**Correct: Borrow when possible, use small-buffer optimization**

```rust
fn greet(name: &str) {
    println!("Hello, {name}!");
}

fn contains_keyword(words: &[String], keyword: &str) -> bool {
    words.iter().any(|w| w == keyword)
}

// SmallVec for collections that are usually small
use smallvec::SmallVec;

fn gather_errors(input: &[&str]) -> SmallVec<[String; 4]> {
    let mut errors = SmallVec::new(); // stack-allocated for <= 4 items
    for &item in input {
        if item.is_empty() {
            errors.push("empty item found".into());
        }
    }
    errors
}
```

**When acceptable:**
- The function genuinely needs to store the value beyond the call (inserting into a HashMap, sending to another thread)
- Using Cow<str> when the function sometimes needs to mutate and sometimes does not
- Builder patterns where the API is designed around owned values for ergonomic chaining

---

### RS4.4 BenchmarkWithCriterion

**Impact: MEDIUM (criterion provides statistically rigorous benchmarks with warmup, outlier detection, and regression tracking that #[bench] lacks)**

The built-in `#[bench]` attribute is nightly-only and provides minimal statistical analysis. criterion.rs runs on stable Rust, uses configurable warmup periods, detects outliers, compares against previous runs, and generates HTML reports. Without `black_box()`, the optimizer may eliminate the computation you are trying to measure, producing misleadingly fast results.

**Incorrect: Nightly-only bench with no statistical rigor**

```rust
#![feature(test)]
extern crate test;
use test::Bencher;

#[bench]
fn bench_sort(b: &mut Bencher) {
    b.iter(|| {
        let mut v = vec![5, 3, 1, 4, 2];
        v.sort(); // optimizer may discard result entirely
    });
}
```

**Correct: criterion with black_box and proper setup**

```rust
// benches/sorting.rs
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn bench_sort(c: &mut Criterion) {
    c.bench_function("sort_small_vec", |b| {
        b.iter(|| {
            let mut v = black_box(vec![5, 3, 1, 4, 2]);
            v.sort();
            black_box(&v); // prevent dead-code elimination
        });
    });
}

criterion_group!(benches, bench_sort);
criterion_main!(benches);

// Cargo.toml
// [[bench]]
// name = "sorting"
// harness = false
//
// [dev-dependencies]
// criterion = { version = "0.5", features = ["html_reports"] }
```

**When acceptable:**
- Quick one-off timing during development where `std::time::Instant` suffices
- Benchmarks in nightly-only projects that already depend on unstable features
- Micro-benchmarks inside unit tests using `#[cfg(test)]` for smoke-check timing (not rigorous measurement)

---

### RS4.5 CacheFriendlyDataLayouts

**Impact: MEDIUM (Struct-of-Arrays layout keeps hot fields contiguous in memory, reducing cache misses in tight loops by an order of magnitude)**

Modern CPUs fetch memory in cache lines (typically 64 bytes). When you iterate over a Vec of structs (AoS) but only touch one field, every cache line loads the other fields as wasted bytes. Splitting into separate Vecs per field (SoA) ensures the hot data is packed contiguously, maximizing cache utilization. This matters most in tight loops over thousands of elements.

**Incorrect: Array-of-Structs wastes cache on cold fields**

```rust
struct Particle {
    position: [f64; 3], // 24 bytes -- hot in physics step
    velocity: [f64; 3], // 24 bytes -- hot in physics step
    color: [u8; 4],     // 4 bytes  -- cold in physics step
    name: String,        // 24 bytes -- cold in physics step
}

fn update_positions(particles: &mut Vec<Particle>, dt: f64) {
    // Each cache line loads color and name alongside position/velocity
    for p in particles.iter_mut() {
        p.position[0] += p.velocity[0] * dt;
        p.position[1] += p.velocity[1] * dt;
        p.position[2] += p.velocity[2] * dt;
    }
}
```

**Correct: Struct-of-Arrays keeps hot data contiguous**

```rust
struct Particles {
    positions: Vec<[f64; 3]>,  // contiguous in memory
    velocities: Vec<[f64; 3]>, // contiguous in memory
    colors: Vec<[u8; 4]>,      // separate, not loaded during physics
    names: Vec<String>,         // separate, not loaded during physics
}

fn update_positions(particles: &mut Particles, dt: f64) {
    // Only positions and velocities are in cache -- no waste
    for (pos, vel) in particles.positions.iter_mut()
        .zip(particles.velocities.iter())
    {
        pos[0] += vel[0] * dt;
        pos[1] += vel[1] * dt;
        pos[2] += vel[2] * dt;
    }
}
```

**When acceptable:**
- Small collections (fewer than ~100 elements) where cache behavior is irrelevant
- All fields are accessed together in every operation, making AoS and SoA equivalent
- Code clarity is more important than performance (configuration structs, domain models not in hot loops)

---

### RS4.6 CollectLazilyConsumeEagerly

**Impact: HIGH (Each .collect() materializes an entire intermediate Vec; chaining iterators lazily fuses operations into a single pass with zero intermediate allocations)**

Rust iterators are lazy -- adaptors like `map`, `filter`, and `flat_map` build a pipeline that executes only when a terminal operation (`collect`, `sum`, `for_each`, `count`) consumes it. Calling `.collect()` between pipeline stages forces a full materialization of the intermediate result, allocating a Vec that exists only to be iterated again. Keep the chain lazy until the final terminal.

**Incorrect: Collecting intermediate results**

```rust
fn active_user_emails(users: &[User]) -> Vec<String> {
    let active: Vec<&User> = users.iter()
        .filter(|u| u.is_active)
        .collect(); // unnecessary Vec<&User> allocation

    let emails: Vec<String> = active.iter()
        .map(|u| u.email.clone())
        .collect(); // final collection

    emails
}

fn total_line_count(files: &[String]) -> usize {
    let all_lines: Vec<&str> = files.iter()
        .flat_map(|f| f.lines())
        .collect(); // allocates a Vec just to count it
    all_lines.len()
}
```

**Correct: Single lazy chain with one terminal operation**

```rust
fn active_user_emails(users: &[User]) -> Vec<String> {
    users.iter()
        .filter(|u| u.is_active)
        .map(|u| u.email.clone())
        .collect() // single allocation for the final result
}

fn total_line_count(files: &[String]) -> usize {
    files.iter()
        .flat_map(|f| f.lines())
        .count() // no allocation at all
}
```

**When acceptable:**
- You need to iterate the intermediate collection multiple times (lazy iterators are single-pass)
- Debugging requires inspecting intermediate results during development
- The intermediate Vec is passed to a function that requires a slice and cannot accept an iterator

---

### RS4.7 ProfileBeforeOptimizing

**Impact: MEDIUM (Optimizing without profiling wastes effort on cold code paths; cargo flamegraph and DHAT identify the actual bottlenecks in minutes)**

Developer intuition about where time is spent is wrong more often than it is right. Optimizing code that accounts for 2% of runtime while ignoring the function that accounts for 60% is a common failure mode. Profiling tools like cargo-flamegraph, perf, and DHAT provide empirical evidence of where CPU time and allocations actually go. Always profile in release mode with debug symbols enabled -- debug builds have fundamentally different performance characteristics.

**Incorrect: Guessing at bottlenecks without measurement**

```rust
// "This loop looks slow, let me optimize it with unsafe"
fn process(data: &[u8]) -> u64 {
    let mut sum: u64 = 0;
    // Switched to unsafe indexing "for performance" -- but this function
    // is called once at startup and accounts for 0.1% of total runtime
    unsafe {
        for i in 0..data.len() {
            sum += *data.get_unchecked(i) as u64;
        }
    }
    sum
}

// Cargo.toml -- default release profile, no debug symbols
// [profile.release]
// (empty)
```

**Correct: Profile first, then optimize the proven bottleneck**

```rust
// Cargo.toml -- enable debug symbols in release for profiling
// [profile.release]
// debug = true
//
// [profile.profiling]
// inherits = "release"
// debug = true
// strip = false

// Step 1: cargo flamegraph --release -- <args>
// Step 2: identify that `parse_records` is 58% of runtime
// Step 3: optimize parse_records specifically

fn parse_records(data: &[u8]) -> Vec<Record> {
    // Optimization justified by flamegraph evidence:
    // - preallocate based on estimated record count
    // - use memchr for fast delimiter scanning
    let estimated = data.len() / AVG_RECORD_SIZE;
    let mut records = Vec::with_capacity(estimated);
    // ... optimized parsing logic ...
    records
}
```

**When acceptable:**
- Applying well-known zero-cost improvements (using iterators, preallocating known-size collections) that have no readability cost
- Performance-critical libraries where benchmarks are part of the CI pipeline and regressions are caught automatically
- When the profiling infrastructure itself is being set up for the first time

---

### RS4.8 ZeroCopyDeserialization

**Impact: MEDIUM (Borrowing from the input buffer instead of allocating owned Strings eliminates per-field heap allocations during deserialization of large payloads)**

Standard deserialization allocates a new String for every string field in the input. For large payloads with many string fields -- log records, API responses, configuration files -- these allocations dominate parse time. Zero-copy deserialization borrows directly from the input buffer, replacing per-field allocations with lifetime-tracked references. The serde `#[serde(borrow)]` attribute, the zerocopy crate, and rkyv provide different levels of zero-copy support.

**Incorrect: Owning all deserialized strings**

```rust
use serde::Deserialize;

#[derive(Deserialize)]
struct LogEntry {
    timestamp: String,  // allocates
    level: String,      // allocates
    message: String,    // allocates
    source: String,     // allocates -- 4 allocations per log entry
}

fn parse_logs(json_bytes: &[u8]) -> Vec<LogEntry> {
    // Each entry allocates 4 Strings from the allocator
    serde_json::from_slice(json_bytes).unwrap()
}
```

**Correct: Borrow from the input buffer**

```rust
use serde::Deserialize;

#[derive(Deserialize)]
struct LogEntry<'a> {
    #[serde(borrow)]
    timestamp: &'a str,  // points into input buffer
    #[serde(borrow)]
    level: &'a str,      // points into input buffer
    #[serde(borrow)]
    message: &'a str,    // points into input buffer
    #[serde(borrow)]
    source: &'a str,     // zero allocations per log entry
}

fn parse_logs(json_bytes: &[u8]) -> Vec<LogEntry<'_>> {
    // Borrows string data directly from json_bytes -- no per-field allocation
    serde_json::from_slice(json_bytes).unwrap()
}

// For binary formats, zerocopy provides truly zero-cost access:
// use zerocopy::{FromBytes, Immutable, KnownLayout};
// #[derive(FromBytes, Immutable, KnownLayout)]
// #[repr(C)]
// struct Header { version: u32, length: u64 }
// let header = Header::read_from_prefix(bytes).unwrap();
```

**When acceptable:**
- Deserialized data must outlive the input buffer (stored in a cache, sent to another thread)
- The payload is small and allocation cost is negligible compared to network latency
- String fields require transformation (trimming, case conversion) that would invalidate borrowed references anyway


## Rule Interactions

**IteratorsOverLoops + CollectLazilyConsumeEagerly**: These rules form a pipeline. IteratorsOverLoops establishes that iterator chains are the default loop construct; CollectLazilyConsumeEagerly ensures those chains remain lazy until the final terminal operation. Together they produce single-pass, zero-intermediate-allocation pipelines.

**AvoidUnnecessaryAllocations + PreallocateCollections**: Complementary allocation strategies. AvoidUnnecessaryAllocations eliminates allocations that should not happen at all (borrowing instead of owning). PreallocateCollections optimizes the allocations that must happen by doing them once upfront instead of incrementally.

**ProfileBeforeOptimizing + BenchmarkWithCriterion**: ProfileBeforeOptimizing identifies where to optimize; BenchmarkWithCriterion measures whether the optimization worked. Profiling without benchmarking leaves improvements unverified; benchmarking without profiling risks optimizing the wrong code.

**CacheFriendlyDataLayouts + IteratorsOverLoops**: SoA layouts pay off when iteration is tight and touches few fields. Iterator chains over SoA Vecs with zip produce the cache-optimal access pattern that makes the layout transformation worthwhile.

## Anti-Patterns (Severity Calibration)

### HIGH

- **Intermediate .collect() in iterator chains**: Each collect allocates and fills a Vec that is immediately iterated again. In hot paths, this can double or triple allocation pressure for zero semantic benefit.
- **Functions accepting String/Vec when they only read**: Forces every caller to allocate or clone, even when they already have a borrowed view. This is an API-level performance bug that propagates to all call sites.
- **Growing a Vec from empty when the size is known**: Each geometric reallocation copies the entire buffer. For a million-element Vec, this means ~20 full-buffer copies instead of zero.

### MEDIUM

- **Array-of-Structs in tight numerical loops**: When a loop touches 8 bytes of a 200-byte struct, 96% of every cache line is wasted. The effect is measurable at ~1000 elements and dominant at ~100,000.
- **Using unsafe for "performance" without benchmark evidence**: Unsafe code that is not proven faster by measurement is pure risk with no reward. The compiler's optimizer handles the common cases.
- **Benchmarking in debug mode**: Debug builds disable optimizations, inline nothing, and include overflow checks. Performance measurements in debug mode are meaningless for production behavior.

### LOW

- **Not using black_box in benchmarks**: The optimizer may eliminate the computation under test, producing misleadingly fast results. The benchmark passes but measures nothing.
- **Missing debug symbols in release profile for profiling**: Flamegraphs without debug symbols show mangled or missing function names, making the profile unreadable.

## Does Not Cover

- **Async runtime tuning** (tokio worker threads, task budgeting) -- this dimension covers synchronous computation performance, not async scheduling.
- **SIMD intrinsics and explicit vectorization** -- a specialized topic that builds on top of the data layout and profiling foundations here.
- **Unsafe performance tricks** (unchecked indexing, transmute) -- the Ownership and Safety dimensions govern when unsafe is acceptable; this dimension focuses on safe performance.
- **Compile-time performance** (build times, incremental compilation) -- a separate concern from runtime performance.
- **Database query optimization and I/O tuning** -- external system performance is outside the scope of language-level coding standards.

## Sources

- The Rust Book, Chapter 13.4: Comparing Performance -- Loops vs. Iterators
- Effective Rust, Item 9: Consider using iterator transforms instead of explicit loops
- Effective Rust, Item 20: Optimize only when necessary, measure before and after
- Rust API Guidelines, C-CALLER-CONTROL: Functions minimize assumptions about parameters
- Clippy lint documentation: uninlined_format_args, manual_memcpy, needless_collect
- Criterion.rs documentation: benchmarking methodology, black_box, HTML reports
- cargo-flamegraph documentation: profiling Rust applications with perf and dtrace
- Data-Oriented Design in Rust: SoA vs AoS patterns and cache performance
- serde documentation: zero-copy deserialization with lifetimes and #[serde(borrow)]
- zerocopy crate documentation: safe transmutation and zero-copy parsing
