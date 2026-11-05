# Unsafe Code -- Rust

> Treat `unsafe` as an escape hatch with a proof obligation, not a free-for-all that disables the borrow checker.

## Mental Model

Rust's safety guarantees rest on a contract: safe Rust prevents undefined behavior provided the unsafe abstractions and foreign contracts it relies on are sound. The `unsafe` keyword does not break this contract -- it transfers the proof obligation from the compiler to the programmer. Every `unsafe` block is a claim: "I, the author, have manually verified that this code upholds all of Rust's safety invariants." If that claim is wrong, the entire program's safety collapses, because the optimizer assumes UB cannot happen and will transform code accordingly.

This means `unsafe` is not a permission to "do whatever C can do." It is a scoped assertion that you have completed a soundness proof for a specific operation. The proof has four components: (1) the operation itself is correct (no aliasing violations, no dangling pointers, no data races), (2) the invariants it depends on are documented, (3) those invariants are protected by module privacy so that safe code cannot violate them, and (4) the unsafe surface is as small as possible so the proof is auditable.

The module boundary is the critical architectural concept. A sound unsafe abstraction exposes a safe public API and uses `pub(crate)` or private fields to prevent external code from breaking internal invariants. If a public field lets safe callers violate an invariant relied on by unchecked operations, the abstraction has a soundness hole. Public fields whose types or checks preserve the invariant are not inherently unsound.

FFI (Foreign Function Interface) is where unsafe is most frequently required and most frequently wrong. C has no concept of Rust's ownership, borrowing, or `repr(Rust)` layout. Match the foreign ABI, layout, validity, lifetimes, and ownership contract. C-layout structs generally use repr(C) (repr(transparent) is appropriate for compatible wrappers). Copy is neither sufficient nor required for FFI compatibility. CString/CStr serve NUL-terminated contracts through pointers; byte-plus-length APIs can borrow ordinary byte buffers. Bindgen can reduce manual transcription mistakes by generating declarations from C headers; the resulting ABI, ownership and safety contracts still need review.

Finally, undefined behavior is never acceptable, even inside `unsafe`. The `unsafe` keyword lifts compile-time checks, not the rules themselves. Data races, invalid references, aliasing violations, and reads of uninitialized memory are UB regardless of context. `cargo miri test` is the primary tool for detecting UB at runtime and should be part of every project's CI that uses unsafe code.

## Consumer Guide

### When Reviewing Code

Look for these signals: `unsafe` blocks without `// SAFETY:` comments, `unsafe fn` without a `# Safety` doc section, public fields on types whose methods contain unsafe operations, `extern "C"` blocks without `repr(C)` on shared structs, Rust-specific types passed directly through an incompatible ABI, or non-NUL-terminated bytes passed to C-string APIs, and hand-written FFI declarations for libraries that ship headers. Flag any `unsafe` block that spans more than the minimum necessary operation. Check that `cargo miri test` is in the CI pipeline for any crate that contains `unsafe`.

### When Designing / Planning

Identify which operations truly require unsafe: raw pointer manipulation, FFI calls, inline assembly, and certain concurrency primitives. Design the module structure so that unsafe operations live behind safe public APIs. Plan the invariant documentation strategy alongside the implementation -- the `// SAFETY:` comments are not afterthoughts, they are part of the design. For FFI-heavy projects, set up bindgen in `build.rs` before writing any Rust wrappers. Decide whether to use `cargo miri test` in CI or as a periodic audit tool.

### When Implementing

Write the safe API first, then introduce the minimal unsafe block inside it. Write the `// SAFETY:` comment before writing the unsafe code -- if you cannot articulate why the operation is sound, you are not ready to write it. Keep fields that unsafe depends on private. Use an ABI-compatible representation for shared layouts. For NUL-terminated C strings use CString and pass its pointer; constructing a CStr from a pointer requires readable termination and a valid lifetime. Byte-plus-length APIs have different contracts. Run `cargo miri test` after every change to unsafe code. Enable Clippy's `undocumented_unsafe_blocks` lint.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| MinimizeUnsafeScope | CONTEXTUAL | Keep unsafe auditable; expose a safe wrapper when it can enforce the contract |
| DocumentSafetyInvariants | CONTEXTUAL | SAFETY comment on every unsafe block; doc preconditions on unsafe fn |
| ModuleBoundarySafety | HIGH | Module privacy protects invariants that unsafe code relies on |
| FFIBoundaryTypes | CRITICAL | Match ABI/layout and ownership; use C-string pointers only for NUL-terminated contracts |
| PreferBindgen | MEDIUM | Auto-generate FFI bindings from C headers instead of hand-writing extern blocks |
| NoUBEvenInUnsafe | CRITICAL | No data races, invalid refs, or aliasing violations; validate with cargo miri test |


---

### RS6.1 MinimizeUnsafeScope

**Impact: Context-dependent (Review the actual unsafe invariant and consequence; scope size alone is not critical harm)**

Unsafe blocks should be as small as possible, wrapping only the single operation that actually requires unsafe. A safe public API that internally uses a minimal unsafe block lets callers rely on the type system while concentrating the proof obligation in one auditable location.

**Incomplete contract: unsafe function lacks documented caller obligations**

```rust
// unsafe fn is appropriate for unchecked raw-pointer input,
// but the required validity/alignment/range contract is missing.
unsafe fn get_value(ptr: *const u32, offset: usize) -> u32 {
    let base = ptr.add(offset);
    let value = *base;
    // 20 more lines of safe arithmetic and formatting...
    let scaled = value * 100;
    let clamped = scaled.min(10_000);
    clamped
}

// Every caller is forced into an unsafe block
let result = unsafe { get_value(ptr, 5) };
```

**Correct: Safe API stores a borrow that enforces validity and lifetime**

```rust
pub struct SafeBuffer<'a> {
    data: &'a [u32],
}

impl<'a> SafeBuffer<'a> {
    pub fn new(data: &'a [u32]) -> Self { Self { data } }

    pub fn get(&self, offset: usize) -> Option<u32> {
        self.data.get(offset).map(|value| value.saturating_mul(100).min(10_000))
    }
}
// No unsafe is needed here. A raw-pointer constructor would need
// ownership/lifetime invariants, not merely a bounds check.
```

**When acceptable:**
- Implementing a low-level primitive where the entire function body is inherently unsafe (e.g., a custom allocator's `alloc` method)
- Marking a function `unsafe` because callers must uphold invariants that cannot be checked at runtime (e.g., `from_raw_parts`)

---

### RS6.2 DocumentSafetyInvariants

**Impact: Context-dependent (Missing safety documentation hinders review; it does not itself prove UB)**

Every `unsafe` block must have a `// SAFETY:` comment explaining why the operation is sound at that exact call site. Every `unsafe fn` must document the preconditions callers must uphold in a `# Safety` doc section. Without these comments, future maintainers cannot verify correctness during refactors.

**Incorrect: Bare unsafe with no justification**

```rust
pub unsafe fn transmute_slice(data: &[u8]) -> &[u32] {
    // No documentation of alignment, length, or lifetime requirements
    unsafe {
        std::slice::from_raw_parts(
            data.as_ptr() as *const u32,
            data.len() / std::mem::size_of::<u32>(),
        )
    }
}

fn process(buffer: &[u8]) {
    // Why is this safe? Nobody knows.
    let values = unsafe { transmute_slice(buffer) };
    println!("{:?}", values);
}
```

**Correct: Thorough SAFETY comments and doc preconditions**

```rust
/// Reinterprets a byte slice as a slice of `u32` values.
///
/// # Safety
/// - `data.as_ptr()` must be aligned to `align_of::<u32>()`, including for an empty slice.
/// - `data.len()` must be a multiple of `size_of::<u32>()` (4 bytes).
/// All u32 bit patterns are valid; interpretation uses native endianness.
/// The input slice already guarantees initialized bytes in one allocation.
pub unsafe fn transmute_slice(data: &[u8]) -> &[u32] {
    // SAFETY: caller guarantees alignment and length divisibility.
    // Lifetime of returned slice is tied to `data` by the borrow.
    unsafe {
        std::slice::from_raw_parts(
            data.as_ptr() as *const u32,
            data.len() / std::mem::size_of::<u32>(),
        )
    }
}

fn process(buffer: &AlignedBuffer) {
    assert!(buffer.as_bytes().len() % 4 == 0);
    // SAFETY: AlignedBuffer must guarantee align_of::<u32>() alignment
    // even for empty slices; length divisibility was checked above.
    let values = unsafe { transmute_slice(buffer.as_bytes()) };
    println!("{:?}", values);
}
```

**When acceptable:**
- Trivially obvious operations where the safety comment would be pure tautology (extremely rare; when in doubt, write the comment)
- Generated code from trusted tools like `bindgen` where the safety contract is documented at the generation layer

---

### RS6.3 ModuleBoundarySafety

**Impact: HIGH (Module privacy is the mechanism that makes unsafe abstractions sound)**

When unsafe code relies on invariants (e.g., a pointer always being valid, an index always being in bounds), those invariants must be protected by module privacy. A public field is a soundness problem when safe writes can violate an invariant later assumed by unchecked operations. Visibility alone does not prove such a violation.

**Incorrect: Public field exposes invariant unsafe depends on**

```rust
pub struct RingBuffer {
    pub buf: *mut u8,
    pub cap: usize,
    pub head: usize,  // must always be < cap
}

impl RingBuffer {
    pub fn peek(&self) -> u8 {
        // SAFETY: head < cap is required... but any caller can
        // set self.head = 9999 without unsafe.
        unsafe { *self.buf.add(self.head) }
    }
}

// Soundness broken from safe code:
let mut rb = RingBuffer { buf: ptr, cap: 16, head: 0 };
rb.head = 1000; // No unsafe needed, instant UB on next peek()
```

**Correct: Private fields protect the invariant**

```rust
pub struct RingBuffer {
    buf: Box<[u8]>,
    head: usize, // invariant: head < buf.len(), and buf is nonempty
}

impl RingBuffer {
    pub fn new(cap: usize) -> Self {
        assert!(cap > 0, "capacity must be nonzero");
        Self { buf: vec![0; cap].into_boxed_slice(), head: 0 }
    }

    pub fn advance(&mut self) {
        self.head = if self.head + 1 == self.buf.len() { 0 } else { self.head + 1 };
    }

    pub fn peek(&self) -> u8 {
        // SAFETY: construction initializes every byte; private methods
        // preserve head < len, and Box owns storage until this borrow ends.
        unsafe { *self.buf.get_unchecked(self.head) }
    }
}
// Box handles allocation failure and deallocation; ordinary indexing
// is preferable unless unchecked access has a demonstrated need.
```

**When acceptable:**
- The struct contains no unsafe code and the public fields carry no invariants
- The type is a plain data transfer object with no methods that depend on field relationships

---

### RS6.4 FFIBoundaryTypes

**Impact: CRITICAL (Incorrect FFI types cause memory corruption, ABI mismatches, and segfaults)**

By-value types must match the foreign ABI and validity/ownership contract. Copy alone does not establish compatibility and is not required. Use repr(C) for matching C structs or an appropriate transparent wrapper. Pass CString/CStr as pointers for NUL-terminated APIs, not as Rust wrapper values by value; byte-plus-length APIs can accept pointers into borrowed bytes.

**Incorrect: Rust-repr struct and raw string pointer across FFI**

```rust
// No repr(C) -- Rust compiler may reorder fields arbitrarily.
pub struct SensorReading {
    pub timestamp: u64,
    pub value: f64,
    pub flags: u8,
}

unsafe extern "C" {
    fn submit_reading(reading: SensorReading);
    fn set_label(label: *const u8); // expects C string
}

fn send(reading: SensorReading, label: &str) {
    unsafe {
        submit_reading(reading); // ABI mismatch: field order unknown
        set_label(label.as_ptr()); // NOT null-terminated!
    }
}
```

**Correct: repr(C), CString, and proper FFI types**

These extern blocks use Rust 1.82+ syntax, required in edition 2024. Earlier editions on older compilers use extern blocks without the unsafe keyword.

```rust
#[repr(C)]
pub struct SensorReading {
    pub timestamp: u64,
    pub value: f64,
    pub flags: u8,
}

unsafe extern "C" {
    fn submit_reading(reading: SensorReading);
    fn set_label(label: *const std::ffi::c_char);
}

fn send(reading: SensorReading, label: &str) {
    let c_label = std::ffi::CString::new(label)
        .expect("label contained interior null byte");
    unsafe {
        // SAFETY: SensorReading layout and field types match the C ABI,
        // matching the C struct definition in sensor.h.
        submit_reading(reading);
        // SAFETY: c_label is a valid, null-terminated C string
        // that lives for this call; set_label must not retain the pointer.
        set_label(c_label.as_ptr());
    }
}
```

**When acceptable:**
- Opaque pointer handles (`*mut c_void`) where the C side never inspects the Rust layout
- Callbacks using `extern "C" fn` signatures where only primitive types cross the boundary

---

### RS6.5 PreferBindgen

**Impact: MEDIUM (Manual FFI declarations drift from C headers and introduce silent ABI bugs)**

Use `bindgen` to auto-generate FFI bindings from C headers instead of writing `extern "C"` blocks by hand. Manual declarations are error-prone: a changed parameter type, a new field in a struct, or a different calling convention in the C library will silently produce undefined behavior. Bindgen reduces transcription errors when configured for matching headers and target ABI. Generated bindings still require version, build-configuration, and ownership-contract review.

**Incorrect: Hand-written extern block that can drift**

```rust
// Manually transcribed from mylib.h -- version 2.1
// But mylib was updated to 2.3 and changed result_t to i64...
unsafe extern "C" {
    fn mylib_init(flags: u32) -> i32;
    fn mylib_process(data: *const u8, len: usize) -> i32; // was i64!
    fn mylib_shutdown();
}

fn run() {
    unsafe {
        mylib_init(0);
        // Return value truncated from i64 to i32 -- silent data loss
        let result = mylib_process(b"hello".as_ptr(), 5);
        mylib_shutdown();
    }
}
```

**Correct: Bindgen-generated bindings via build.rs**

```rust
// build.rs
fn main() {
    println!("cargo:rerun-if-changed=vendor/mylib.h");
    let bindings = bindgen::Builder::default()
        .header("vendor/mylib.h")
        .allowlist_function("mylib_.*")
        .allowlist_type("mylib_.*")
        .generate()
        .expect("Unable to generate bindings");
    let out_path = std::path::PathBuf::from(
        std::env::var("OUT_DIR").unwrap(),
    );
    bindings
        .write_to_file(out_path.join("bindings.rs"))
        .expect("Couldn't write bindings");
}

// src/ffi.rs
#![allow(non_upper_case_globals, non_camel_case_types)]
include!(concat!(env!("OUT_DIR"), "/bindings.rs"));
```

**When acceptable:**
- Tiny FFI surfaces with one or two stable functions where bindgen adds unnecessary build complexity
- C libraries that do not ship headers (rare) and bindings must be written from documentation
- Projects that vendor pre-generated bindings and audit them on library updates

---

### RS6.6 NoUBEvenInUnsafe

**Impact: CRITICAL (Undefined behavior invalidates all compiler reasoning and can corrupt arbitrary memory)**

The `unsafe` keyword lifts the compiler's ability to check certain invariants -- it does not lift the requirement to uphold them. Data races, dangling references, invalid aliasing (`&mut` aliasing `&`), and uninitialized reads are UB regardless of whether the code is inside an `unsafe` block. Use `cargo miri test` to detect UB at runtime during testing.

**Incorrect: Aliased mutable references -- instant UB**

```rust
fn split_first_mut(slice: &mut [u32]) -> (&mut u32, &mut [u32]) {
    let ptr = slice.as_mut_ptr();
    unsafe {
        // BUG: first overlaps rest for every nonempty slice; empty input
        // also makes creation of first invalid.
        // Even in unsafe, &mut aliasing &mut is undefined behavior.
        let first = &mut *ptr;
        let rest = std::slice::from_raw_parts_mut(ptr, slice.len());
        (first, rest)
    }
}
// An exercised Miri test may diagnose this UB; no diagnostic was run here.
```

**Correct: Non-overlapping splits with provenance respected**

```rust
fn split_first_mut(slice: &mut [u32]) -> Option<(&mut u32, &mut [u32])> {
    if slice.is_empty() {
        return None;
    }
    let ptr = slice.as_mut_ptr();
    let len = slice.len();
    unsafe {
        // SAFETY: ptr is valid for len elements. We split into
        // [0..1) and [1..len), which never overlap.
        let first = &mut *ptr;
        let rest = std::slice::from_raw_parts_mut(
            ptr.add(1),
            len - 1,
        );
        Some((first, rest))
    }
}
// Source-reasoned non-overlap; no Miri result is claimed.
// In production, prefer slice.split_first_mut() for this operation.
```

**When acceptable:**
- There are no acceptable exceptions. Undefined behavior is never permitted, even inside `unsafe` blocks. If Miri reports a violation, the code must be fixed.


## Rule Interactions

**MinimizeUnsafeScope + DocumentSafetyInvariants**: These two rules are complementary. Minimizing the scope makes the SAFETY comment tractable -- a three-line unsafe block has a simple proof. A function-wide unsafe block requires reasoning about every line, making the SAFETY comment either impossibly long or dangerously incomplete.

**ModuleBoundarySafety + MinimizeUnsafeScope**: The module boundary is what makes the safe public API possible. Private fields protect the invariants; the safe methods enforce them; the minimal unsafe block inside those methods relies on them. Where privacy protects an unchecked invariant, removing it requires equivalent validation or type guarantees.

**FFIBoundaryTypes + PreferBindgen**: Bindgen automatically generates `repr(C)` structs and correct type mappings, eliminating the manual transcription errors that FFIBoundaryTypes guards against. Using bindgen is the mechanical enforcement of the FFI type rules.

**NoUBEvenInUnsafe + DocumentSafetyInvariants**: The SAFETY comment records the proposed justification; it neither proves soundness by itself nor makes a missing comment evidence of UB. Miri can detect UB on supported executed paths; a passing run is not a universal proof. A SAFETY comment is a claim whose premises must be verified.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Unjustified unsafe interface**: Prefer a safe wrapper when it can enforce all invariants; unsafe fn is correct when callers must satisfy unchecked safety preconditions.
- **Bare unsafe block without documented reasoning**: A documentation/review defect; assign critical severity only when a concrete soundness failure is established.
- **`&mut` aliasing through raw pointers**: Creating two `&mut` references to the same memory via pointer casts is instant UB. The optimizer assumes exclusive access and will miscompile the code.
- **Passing ordinary string bytes to a NUL-terminated C API**: Missing termination can cause out-of-bounds reads. A pointer plus length can be valid under a different C contract.
- **Incompatible layout exposed through FFI**: repr(Rust) does not promise C layout. repr(C), compatible repr(transparent) wrappers, and opaque pointers serve different valid contracts.

### HIGH

- **Unconstrained public safety-relevant fields**: Safe writes that violate assumptions of unchecked methods create a soundness hole; checked fields or unrelated public data can be valid.
- **Hand-maintained `extern "C"` blocks for large C libraries**: Every library update risks silent ABI mismatches. Bindgen reduces transcription risk but cannot validate every foreign contract or mismatched build configuration.

### MEDIUM

- **No `cargo miri test` in CI for crates with unsafe**: Miri can find aliasing/provenance violations on executed supported paths. CI use is a project policy subject to platform/FFI support, not proof that all UB is absent.
- **Overly broad `#[allow(unsafe_code)]`**: Disabling the lint at the crate level hides new unsafe additions. Allow it only on the specific modules that need it.

## Does Not Cover

- **Cryptographic safety** -- constant-time operations, side-channel resistance, and key management are security concerns beyond the scope of general unsafe hygiene.
- **`no_std` and embedded-specific patterns** -- bare-metal register access, linker scripts, and interrupt handlers have additional constraints not addressed here.
- **Formal verification tools** (Kani, Creusot) -- these are complementary to Miri and SAFETY comments but require their own methodology.
- **Async runtime internals** -- custom executors and wakers involve unsafe patterns that deserve a dedicated treatment.

## Sources

- The Rustonomicon (RBOOK), Chapter 20.1: Meet Safe and Unsafe
- Nomicon (NOM): unsafe, FFI, and soundness sections
- Effective Rust (ER), Item 16: Minimize unsafe, Item 34: FFI types, Item 35: bindgen
- Clippy lint: `undocumented_unsafe_blocks`
- Miri documentation and `cargo miri test` usage
- Rust Reference: behavior considered undefined
