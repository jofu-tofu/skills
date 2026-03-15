# Unsafe Code -- Rust

> Treat `unsafe` as an escape hatch with a proof obligation, not a free-for-all that disables the borrow checker.

## Mental Model

Rust's safety guarantees rest on a contract: the compiler statically proves that your code cannot cause undefined behavior. The `unsafe` keyword does not break this contract -- it transfers the proof obligation from the compiler to the programmer. Every `unsafe` block is a claim: "I, the author, have manually verified that this code upholds all of Rust's safety invariants." If that claim is wrong, the entire program's safety collapses, because the optimizer assumes UB cannot happen and will transform code accordingly.

This means `unsafe` is not a permission to "do whatever C can do." It is a scoped assertion that you have completed a soundness proof for a specific operation. The proof has four components: (1) the operation itself is correct (no aliasing violations, no dangling pointers, no data races), (2) the invariants it depends on are documented, (3) those invariants are protected by module privacy so that safe code cannot violate them, and (4) the unsafe surface is as small as possible so the proof is auditable.

The module boundary is the critical architectural concept. A sound unsafe abstraction exposes a safe public API and uses `pub(crate)` or private fields to prevent external code from breaking internal invariants. If a field that unsafe code depends on is `pub`, any consumer can introduce undefined behavior without ever writing `unsafe` themselves. This is called a "soundness hole" and it is the most common structural error in unsafe Rust.

FFI (Foreign Function Interface) is where unsafe is most frequently required and most frequently wrong. C has no concept of Rust's ownership, borrowing, or `repr(Rust)` layout. Every value crossing the FFI boundary must use `repr(C)` for structs, `CString`/`CStr` for strings, and `Copy` types for by-value arguments. Bindgen eliminates the largest class of FFI bugs -- manual transcription errors -- by generating bindings directly from C headers.

Finally, undefined behavior is never acceptable, even inside `unsafe`. The `unsafe` keyword lifts compile-time checks, not the rules themselves. Data races, invalid references, aliasing violations, and reads of uninitialized memory are UB regardless of context. `cargo miri test` is the primary tool for detecting UB at runtime and should be part of every project's CI that uses unsafe code.

## Consumer Guide

### When Reviewing Code

Look for these signals: `unsafe` blocks without `// SAFETY:` comments, `unsafe fn` without a `# Safety` doc section, public fields on types whose methods contain unsafe operations, `extern "C"` blocks without `repr(C)` on shared structs, `String` or `&str` passed across FFI boundaries instead of `CString`/`CStr`, and hand-written FFI declarations for libraries that ship headers. Flag any `unsafe` block that spans more than the minimum necessary operation. Check that `cargo miri test` is in the CI pipeline for any crate that contains `unsafe`.

### When Designing / Planning

Identify which operations truly require unsafe: raw pointer manipulation, FFI calls, inline assembly, and certain concurrency primitives. Design the module structure so that unsafe operations live behind safe public APIs. Plan the invariant documentation strategy alongside the implementation -- the `// SAFETY:` comments are not afterthoughts, they are part of the design. For FFI-heavy projects, set up bindgen in `build.rs` before writing any Rust wrappers. Decide whether to use `cargo miri test` in CI or as a periodic audit tool.

### When Implementing

Write the safe API first, then introduce the minimal unsafe block inside it. Write the `// SAFETY:` comment before writing the unsafe code -- if you cannot articulate why the operation is sound, you are not ready to write it. Keep fields that unsafe depends on private. Use `repr(C)` on every struct that crosses FFI. Use `CString::new()` for owned strings going to C and `CStr::from_ptr()` for borrowed strings coming from C. Run `cargo miri test` after every change to unsafe code. Enable Clippy's `undocumented_unsafe_blocks` lint.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| MinimizeUnsafeScope | CRITICAL | Smallest possible unsafe blocks; safe public API wrapper |
| DocumentSafetyInvariants | CRITICAL | SAFETY comment on every unsafe block; doc preconditions on unsafe fn |
| ModuleBoundarySafety | HIGH | Module privacy protects invariants that unsafe code relies on |
| FFIBoundaryTypes | CRITICAL | Only Copy types by value across FFI; CString/CStr for strings; repr(C) |
| PreferBindgen | MEDIUM | Auto-generate FFI bindings from C headers instead of hand-writing extern blocks |
| NoUBEvenInUnsafe | CRITICAL | No data races, invalid refs, or aliasing violations; validate with cargo miri test |


---

### RS6.1 MinimizeUnsafeScope

**Impact: CRITICAL (Limits the surface area where undefined behavior can hide)**

Unsafe blocks should be as small as possible, wrapping only the single operation that actually requires unsafe. A safe public API that internally uses a minimal unsafe block lets callers rely on the type system while concentrating the proof obligation in one auditable location.

**Incorrect: Entire function marked unsafe**

```rust
// The entire function is unsafe, but only one line needs it.
// Callers must now reason about safety for every call site.
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

**Correct: Minimal unsafe block behind a safe API**

```rust
/// Returns the value at `offset` elements from `ptr`.
///
/// # Safety handled internally
/// The raw pointer dereference is contained in a minimal unsafe block.
/// Public callers use the safe `SafeBuffer` API.
pub struct SafeBuffer {
    ptr: *const u32,
    len: usize,
}

impl SafeBuffer {
    pub fn get(&self, offset: usize) -> Option<u32> {
        if offset >= self.len {
            return None;
        }
        // SAFETY: bounds check above guarantees offset < len,
        // and ptr is valid for len elements (enforced by constructor).
        let value = unsafe { *self.ptr.add(offset) };
        let scaled = value * 100;
        let clamped = scaled.min(10_000);
        Some(clamped)
    }
}
```

**When acceptable:**
- Implementing a low-level primitive where the entire function body is inherently unsafe (e.g., a custom allocator's `alloc` method)
- Marking a function `unsafe` because callers must uphold invariants that cannot be checked at runtime (e.g., `from_raw_parts`)

---

### RS6.2 DocumentSafetyInvariants

**Impact: CRITICAL (Undocumented unsafe is a latent soundness hole that no reviewer can verify)**

Every `unsafe` block must have a `// SAFETY:` comment explaining why the operation is sound at that exact call site. Every `unsafe fn` must document the preconditions callers must uphold in a `# Safety` doc section. Without these comments, future maintainers cannot verify correctness during refactors.

**Incorrect: Bare unsafe with no justification**

```rust
pub unsafe fn transmute_slice(data: &[u8]) -> &[u32] {
    // No documentation of alignment, length, or lifetime requirements
    std::slice::from_raw_parts(
        data.as_ptr() as *const u32,
        data.len() / 4,
    )
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
/// - `data.as_ptr()` must be aligned to `align_of::<u32>()` (4 bytes).
/// - `data.len()` must be a multiple of `size_of::<u32>()` (4 bytes).
/// - The byte content must represent valid `u32` values for the
///   target endianness.
pub unsafe fn transmute_slice(data: &[u8]) -> &[u32] {
    // SAFETY: caller guarantees alignment and length divisibility.
    // Lifetime of returned slice is tied to `data` by the borrow.
    std::slice::from_raw_parts(
        data.as_ptr() as *const u32,
        data.len() / 4,
    )
}

fn process(buffer: &AlignedBuffer) {
    assert!(buffer.as_bytes().len() % 4 == 0);
    // SAFETY: AlignedBuffer guarantees 4-byte alignment (see its
    // constructor), and we verified length divisibility above.
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

When unsafe code relies on invariants (e.g., a pointer always being valid, an index always being in bounds), those invariants must be protected by module privacy. If a field that unsafe depends on is `pub`, any code anywhere can break the invariant and introduce undefined behavior without writing a single `unsafe` keyword.

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
    buf: *mut u8,
    cap: usize,
    head: usize, // invariant: head < cap, enforced by all methods
}

impl RingBuffer {
    pub fn new(cap: usize) -> Self {
        let layout = std::alloc::Layout::array::<u8>(cap).unwrap();
        // SAFETY: layout has non-zero size because cap > 0.
        let buf = unsafe { std::alloc::alloc(layout) };
        Self { buf, cap, head: 0 }
    }

    pub fn advance(&mut self) {
        self.head = (self.head + 1) % self.cap; // invariant preserved
    }

    pub fn peek(&self) -> u8 {
        // SAFETY: head < cap is maintained by advance() and new().
        // Fields are private, so no external code can violate this.
        unsafe { *self.buf.add(self.head) }
    }
}
```

**When acceptable:**
- The struct contains no unsafe code and the public fields carry no invariants
- The type is a plain data transfer object with no methods that depend on field relationships

---

### RS6.4 FFIBoundaryTypes

**Impact: CRITICAL (Incorrect FFI types cause memory corruption, ABI mismatches, and segfaults)**

Only `Copy` types should be passed by value across FFI boundaries. Strings must use `CString`/`CStr` (never `String` or `&str`). Structs shared with C must be `#[repr(C)]` to guarantee a stable, predictable layout. Without these rules, Rust's default `repr(Rust)` may reorder fields, and non-Copy types may be dropped or aliased incorrectly.

**Incorrect: Rust-repr struct and raw string pointer across FFI**

```rust
// No repr(C) -- Rust compiler may reorder fields arbitrarily.
pub struct SensorReading {
    pub timestamp: u64,
    pub value: f64,
    pub flags: u8,
}

extern "C" {
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

```rust
#[repr(C)]
pub struct SensorReading {
    pub timestamp: u64,
    pub value: f64,
    pub flags: u8,
}

extern "C" {
    fn submit_reading(reading: SensorReading);
    fn set_label(label: *const std::ffi::c_char);
}

fn send(reading: SensorReading, label: &str) {
    let c_label = std::ffi::CString::new(label)
        .expect("label contained interior null byte");
    unsafe {
        // SAFETY: SensorReading is repr(C) with all Copy fields,
        // matching the C struct definition in sensor.h.
        submit_reading(reading);
        // SAFETY: c_label is a valid, null-terminated C string
        // that lives for the duration of this call.
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

Use `bindgen` to auto-generate FFI bindings from C headers instead of writing `extern "C"` blocks by hand. Manual declarations are error-prone: a changed parameter type, a new field in a struct, or a different calling convention in the C library will silently produce undefined behavior. Bindgen reads the actual header and generates correct, up-to-date bindings.

**Incorrect: Hand-written extern block that can drift**

```rust
// Manually transcribed from mylib.h -- version 2.1
// But mylib was updated to 2.3 and changed result_t to i64...
extern "C" {
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
        // BUG: first and rest can alias the same memory if len == 1.
        // Even in unsafe, &mut aliasing &mut is undefined behavior.
        let first = &mut *ptr;
        let rest = std::slice::from_raw_parts_mut(ptr, slice.len());
        (first, rest)
    }
}
// cargo miri test catches:
// error: Undefined Behavior: not granting access to tag <1234>
//        because that would remove [SharedReadOnly] on <5678>
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
// cargo miri test passes -- no aliasing violations.
```

**When acceptable:**
- There are no acceptable exceptions. Undefined behavior is never permitted, even inside `unsafe` blocks. If Miri reports a violation, the code must be fixed.


## Rule Interactions

**MinimizeUnsafeScope + DocumentSafetyInvariants**: These two rules are complementary. Minimizing the scope makes the SAFETY comment tractable -- a three-line unsafe block has a simple proof. A function-wide unsafe block requires reasoning about every line, making the SAFETY comment either impossibly long or dangerously incomplete.

**ModuleBoundarySafety + MinimizeUnsafeScope**: The module boundary is what makes the safe public API possible. Private fields protect the invariants; the safe methods enforce them; the minimal unsafe block inside those methods relies on them. Remove privacy and the safe API is an illusion.

**FFIBoundaryTypes + PreferBindgen**: Bindgen automatically generates `repr(C)` structs and correct type mappings, eliminating the manual transcription errors that FFIBoundaryTypes guards against. Using bindgen is the mechanical enforcement of the FFI type rules.

**NoUBEvenInUnsafe + DocumentSafetyInvariants**: The SAFETY comment is the human-readable proof that UB does not occur. If the comment cannot explain why the operation is sound, the code likely contains UB. Miri is the machine-verifiable counterpart to the human-written proof.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Function-level `unsafe fn` when only one line needs it**: Forces every caller into an unsafe block, spreading the proof obligation across the entire codebase instead of containing it at the source.
- **Bare `unsafe` block with no SAFETY comment**: An unverifiable claim of soundness. During refactoring, no one can tell whether the invariants still hold because no one recorded what they were.
- **`&mut` aliasing through raw pointers**: Creating two `&mut` references to the same memory via pointer casts is instant UB. The optimizer assumes exclusive access and will miscompile the code.
- **Passing `&str` or `String` across FFI**: Rust strings are not null-terminated. C functions expecting `char*` will read past the end of the buffer.
- **Struct without `repr(C)` in FFI**: Rust's default layout may reorder fields, pad differently, or change between compiler versions. The C side will read garbage.

### HIGH

- **Public fields on types with unsafe methods**: Allows safe code to break invariants that unsafe code depends on, creating soundness holes that do not require `unsafe` to exploit.
- **Hand-maintained `extern "C"` blocks for large C libraries**: Every library update risks silent ABI mismatches. Bindgen eliminates this class of bugs entirely.

### MEDIUM

- **No `cargo miri test` in CI for crates with unsafe**: Miri catches UB that no amount of testing or review can reliably find (aliasing violations, provenance errors). Running it periodically is good; running it in CI is better.
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
