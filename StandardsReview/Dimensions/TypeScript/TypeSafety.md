# Type Safety — TypeScript

> The compiler is only as useful as its configuration allows; type safety is not a feature you get by default but a discipline you enforce through strict settings, deliberate type narrowing, and structural guarantees that prevent entire classes of runtime failures.

## Mental Model

The house default is `strict: true`. It enables a family of stronger checks; individual strict flags can also be enabled or overridden. A missing umbrella flag does not disable all type checking or prove a runtime defect. Inspect the effective inherited configuration and migration contract.

`noUncheckedIndexedAccess` is a separate check, outside `strict`. With strict null checking, it adds `undefined` to unchecked array and index-signature lookups; declared properties and known tuple indices retain their appropriate types. These checks reduce risk but do not guarantee runtime safety.

Use `unknown` at untrusted boundaries and validate before use. `any` bypasses checks on that value and can propagate through inferred expressions, but does not erase every surrounding explicit type. Assertions perform no runtime validation. Built-in guards support control-flow narrowing; explicit user-defined predicates are trusted declarations whose implementation must establish every promised property.

The final layer is branded types. TypeScript is structurally typed, so `UserId` and `OrderId` are interchangeable if both are strings. Branded types add a phantom property that makes them nominally distinct at the type level, while remaining plain strings at runtime. Combined with validation functions that brand on creation, they close the gap between "this is a string" and "this is a validated, domain-specific identifier."

Together, these layers form a defense-in-depth strategy: the compiler catches structural errors, strict flags catch null and implicit-any errors, narrowing catches unsafe access patterns, and branding catches semantic misuse of structurally identical types.

## Consumer Guide

### When Reviewing Code

Check the effective `tsconfig.json`, including inherited settings and individual strict options. Preserve the strict-by-default house policy, but assess missing flags, `any`, and assertions against actual unsafe operations and migration exceptions. Prefer `unknown` at external boundaries. A predicate must validate the full promised shape; an assertion may be justified by an independently established invariant.

### When Designing / Planning

Start every new project with `strict: true` and `noUncheckedIndexedAccess: true` in `tsconfig.json`. Design function signatures to accept `unknown` for external data and return precise types. Plan branded types early for domain identifiers (user IDs, order IDs, email addresses) — retrofitting them is harder than adding them from the start. When designing module boundaries, decide which types cross boundaries and ensure those boundary types are narrow and validated rather than wide and assumed.

### When Implementing

Enable all strict flags before writing the first line of code. Use `unknown` instead of `any` for values whose type you do not know at the point of declaration. Write type guard functions (returning `value is T`) for complex narrowing that you will reuse. Use `instanceof` for class hierarchies, `in` for discriminated objects, and `typeof` for primitives. Prefer optional chaining (`?.`) and nullish coalescing (`??`) over non-null assertions (`!`). Create branded type constructors that validate and brand in a single step, so unbranded values never enter the system.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| StrictModeAlways | LOW policy; context-dependent risk | Prefer `strict: true`; assess effective settings and migration policy |
| NoUncheckedIndexAccess | LOW policy; context-dependent risk | Enable `noUncheckedIndexedAccess` to include `undefined` in unchecked lookups |
| NeverAny | Context-dependent | Prefer `unknown` at uncertain boundaries; isolate justified `any` |
| NarrowBeforeUse | Context-dependent | Validate before use; audit predicates as well as assertions |
| BrandedForValidation | MEDIUM | Use branded types to distinguish semantically different values that share the same primitive type |


---

### TS1.1 Strict Mode Always

**Impact: LOW policy; context-dependent risk (Strict checks detect many mistakes, not every runtime failure)**

The house default is `strict: true`. It enables strict checks including nullability and implicit-any diagnostics, subject to individual overrides. Non-strict TypeScript still performs type checking; enabling strictness in an existing codebase can reveal bugs and migration work.

**Incorrect: Permissive compiler misses real bugs**

```typescript
// tsconfig.json — "strict" not enabled
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext"
    // strict defaults to false; individual strict options can still be enabled
  }
}

// With users declared, this can compile without strict checks and fail if no match exists
function getUser(id) {           // id is implicitly 'any'
  return users.find(u => u.id === id);
}
const name = getUser(1).name;    // potential null dereference — no warning
```

**Correct: Strict mode catches bugs at compile time**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true
  }
}

// Compiler requires a parameter type here (inference handles many other sites) and null handling
function getUser(id: number): User | undefined {
  return users.find(u => u.id === id);
}
const user = getUser(1);
const name = user?.name ?? "Unknown";  // forced to handle undefined
```

**When acceptable:**
- Gradual migration: use `// @ts-expect-error` with explanatory comments on specific lines, never `// @ts-ignore`
- Third-party type conflicts: isolate in a `.d.ts` file with targeted overrides
- Never acceptable to leave `strict: false` in a new project

---

### TS1.2 No Unchecked Index Access

**Impact: LOW policy; context-dependent risk (Detects potentially missing indexed values; does not prevent runtime undefined)**

Ordinary array indexing is typed as the element type by default. With strict null checking, `noUncheckedIndexedAccess` adds `undefined` for unchecked lookups. This is separate from `strict`, and does not change runtime behavior. Declared keys and known tuple indices are treated according to their types.

**Incorrect: Array indexing assumed safe**

```typescript
// tsconfig: noUncheckedIndexedAccess is NOT enabled
const users = ["Alice", "Bob"];
const third = users[2];         // TypeScript says: string
console.log(third.toUpperCase()); // Runtime: Cannot read properties of undefined

const config: Record<string, string> = { theme: "dark" };
const lang = config["language"]; // TypeScript says: string
console.log(lang.split("-"));    // Runtime: crash
```

**Correct: Index access returns T | undefined**

```typescript
// tsconfig: "noUncheckedIndexedAccess": true
const users = ["Alice", "Bob"];
const third = users[2];          // TypeScript says: string | undefined

if (third) {
  console.log(third.toUpperCase()); // safe — narrowed to string
}

const config: Record<string, string> = { theme: "dark" };
const lang = config["language"] ?? "en-US"; // explicit fallback
```

**When acceptable:**
- A numeric index check must exclude negatives and nonintegers too; even valid bounds do not prove a sparse array has an element. Read once and check `value !== undefined`. `at()` also returns a possibly undefined value, and a length check alone need not narrow indexed access.
- Tuple types with known length already have correct types at specific indices

---

### TS1.3 Never Use Any

**Impact: Context-dependent (Unsafe uses of `any` can hide defects; deliberate isolated escape hatches are not automatically critical)**

`any` bypasses checking on that value and often propagates through expressions inferred from it. Explicitly typed surrounding values retain their declared types. Prefer `unknown` when the value is not yet known; isolate deliberate dynamic boundaries.

**Incorrect: Any disables the type system**

```typescript
function parseConfig(raw: any): any {
  return raw.settings.theme;     // no error if raw is null
}

const config = parseConfig(null); // config is any
config.nonexistent.deep.access;   // no error — crashes at runtime

// These expressions infer any from an any-valued property access
const theme = config.theme;       // theme is any
const upper = theme.toUpperCase(); // any — no safety
```

**Correct: Use unknown and narrow**

```typescript
interface AppConfig { theme: string; }

function parseConfig(raw: unknown): AppConfig {
  if (!isRecord(raw) || !isRecord(raw.settings) ||
      typeof raw.settings.theme !== "string") {
    throw new Error("Invalid config structure");
  }
  return { theme: raw.settings.theme };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
```

**When acceptable:**
- Inside generic function implementations where the type parameter constrains the public API (Matt Pocock's "any in generics" pattern)
- Typing third-party libraries with no `@types` package — isolate in a `.d.ts` file
- `JSON.parse()` return — assign to `unknown` and validate with the project validator (see TS3.3)

---

### TS1.4 Narrow Before Use

**Impact: Context-dependent (Unvalidated external data can be unsafe; predicates require implementation review)**

Assertions do not validate at runtime. Built-in guards narrow through control flow. An explicit `value is T` predicate is not checked for logical correctness: verify that its true branch establishes the complete promised type. Correct assertions remain useful when an invariant is established elsewhere.

**Incorrect: Type assertions bypass safety**

```typescript
interface AdminUser {
  role: "admin";
  permissions: string[];
}

function getPermissions(user: unknown): string[] {
  const admin = user as AdminUser;     // no runtime check
  return admin.permissions;            // nullish user throws; missing permissions can return undefined
}

// Even with known types, 'as' is dangerous
const input = document.getElementById("email") as HTMLInputElement;
input.value = "test";  // null throws; a non-input does not satisfy the intended DOM contract
```

**Correct: Check the full shape before claiming the type**

```typescript
function isAdminUser(user: unknown): user is AdminUser {
  return (
    typeof user === "object" &&
    user !== null &&
    "role" in user &&
    user.role === "admin" &&
    "permissions" in user &&
    Array.isArray(user.permissions) &&
    Array.from(user.permissions).every((permission: unknown) => typeof permission === "string")
  );
}

function getPermissions(user: unknown): string[] {
  if (!isAdminUser(user)) {
    throw new Error("Expected admin user");
  }
  return user.permissions;  // TypeScript knows this is AdminUser
}

// Narrow DOM elements properly
const input = document.getElementById("email");
if (input instanceof HTMLInputElement) {
  input.value = "test";  // safe — proven to be HTMLInputElement
}
```

**When acceptable:**
- `as const` for literal type assertions — this is safe and encouraged
- After Zod `.parse()` which performs runtime validation (see TS3.3)
- Double assertion `as unknown as T` in test factories where you intentionally create partial mocks

---

### TS1.5 Branded Types for Validated Data

**Impact: MEDIUM (Prevents mixing semantically different values that share the same primitive type — UserId vs OrderId are both strings but not interchangeable)**

TypeScript is structurally typed — two `string` types are interchangeable even when they represent different domains. Branded types add a phantom property that makes them nominally distinct, so the compiler prevents you from passing a `UserId` where an `OrderId` is expected.

**Incorrect: Primitive types allow semantic misuse**

```typescript
function getUser(id: string): User { /* ... */ }
function getOrder(id: string): Order { /* ... */ }

const userId = "usr_123";
const orderId = "ord_456";

// No error — both are string, but this is a bug
getUser(orderId);
getOrder(userId);
```

**Correct: Branded types enforce domain boundaries**

```typescript
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

// Creation functions validate and brand
function UserId(id: string): UserId {
  if (!id.startsWith("usr_")) throw new Error(`Invalid user ID: ${id}`);
  return id as UserId;
}

function OrderId(id: string): OrderId {
  if (!id.startsWith("ord_")) throw new Error(`Invalid order ID: ${id}`);
  return id as OrderId;
}

function getUser(id: UserId): User { /* ... */ }
function getOrder(id: OrderId): Order { /* ... */ }

const userId = UserId("usr_123");
const orderId = OrderId("ord_456");

getUser(orderId);  // compile error — OrderId is not assignable to UserId
getUser(userId);   // works
```

**When acceptable:**
- Internal utility code where the overhead of branding isn't worth the safety
- Types already distinguished by structure (interfaces with different properties don't need branding)
- Prototyping — add brands when the domain model stabilizes


## Rule Interactions

**StrictModeAlways + NoUncheckedIndexAccess** form the compiler foundation. StrictModeAlways enables the core strict flags; NoUncheckedIndexAccess extends this to cover array and record indexing, which `strict: true` does not include. Both should be enabled together — they are not redundant.

**NeverAny + NarrowBeforeUse** are complementary. NeverAny eliminates `any` at the declaration site by replacing it with `unknown`. NarrowBeforeUse eliminates unsafe access to `unknown` values by requiring type guards before use. Together, they form a complete pattern: accept `unknown`, narrow to a specific type, use safely.

**BrandedForValidation + NarrowBeforeUse** interact at the validation boundary. Branded type constructors validate and brand in one step. The type guard pattern from NarrowBeforeUse can also be used to create brand-checking predicates (e.g., `isUserId(value): value is UserId`).

**NeverAny connects to ErrorHandling dimension**: `JSON.parse()` returns `any` — the immediate fix is to assign to `unknown` and validate with the chosen boundary validator (see ErrorHandling dimension).

## Anti-Patterns (Severity Calibration)

### Context-dependent — verify unsafe behavior

- **Missing strict policy** — Inspect inherited configuration and individual options. This is a configuration policy finding unless a concrete unsafe path establishes greater severity; non-strict code still receives type checking.
- **`any` in function signatures** — Review unchecked operations and propagation. Isolated dynamic boundaries may be intentional; assign severity from demonstrated consequences.
- **Unjustified assertion or incomplete predicate** — Both can misrepresent runtime data. Review the invariant or full validation and the consequence of a mismatch, rather than treating syntax alone as critical.

### Configuration policy and potential unsafe access

- **Missing `noUncheckedIndexedAccess`** — Retain the house default, but an absent flag does not make every lookup unsafe. Check optional results, bounds, declared keys and actual use.
- **Non-null assertion operator (`!`) used to silence the compiler** — `value!.property` tells the compiler to ignore a null check. If the value is actually null, this crashes. Use optional chaining or narrow first.

### MEDIUM

- **Primitive types used for domain identifiers without branding** — Passing a `string` where a `UserId` is expected is a semantic error the compiler cannot catch without branded types. Low risk in small codebases, increasing risk as the domain grows.
- **Overly wide type assertions in tests** — `as unknown as T` in test factories is acceptable for partial mocks but should not leak into production code.

## Examples

**Example 1: Strict configuration audit**
```typescript
// tsconfig.json — complete strict setup
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "target": "ES2022",
    "module": "ESNext"
  }
}
```

**Example 2: Unknown + narrowing replacing any**
```typescript
// Before: any spreads silently
function processEvent(event: any) {
  return event.payload.data;  // no checking
}

// After: unknown + type guard
interface AppEvent {
  type: string;
  payload: { data: unknown };
}

function isAppEvent(value: unknown): value is AppEvent {
  return (
    typeof value === "object" && value !== null &&
    "type" in value && typeof value.type === "string" &&
    "payload" in value &&
    typeof value.payload === "object" && value.payload !== null &&
    "data" in value.payload
  );
}

function processEvent(event: unknown): unknown {
  if (!isAppEvent(event)) {
    throw new Error("Invalid event structure");
  }
  return event.payload.data;  // narrowed to AppEvent
}
```

**Example 3: Branded type for domain safety**
```typescript
type Brand<T, B extends string> = T & { readonly __brand: B };
type Email = Brand<string, "Email">;

function Email(value: string): Email {
  if (!value.includes("@")) throw new Error(`Invalid email: ${value}`);
  return value as Email;
}

function sendEmail(to: Email, subject: string): void { /* ... */ }

// Compiler prevents passing raw strings
sendEmail("not-validated", "Hello");     // compile error
sendEmail(Email("user@example.com"), "Hello");  // works
```

## Does Not Cover

- **Runtime validation with Zod** — Covered in the ErrorHandling dimension (TS3). This dimension covers the type system; ErrorHandling covers runtime schema validation.
- **Generic type design** — Covered in the TypeModeling dimension (TS2). Generics are a modeling tool, not a safety mechanism.
- **Import and naming conventions** — Covered in the Conventions dimension (TS4). Type safety is about correctness, not style.

## Sources

- Matt Pocock, *Total TypeScript* — strict mode advocacy, branded types patterns, `unknown` over `any`
- TypeScript Handbook — Strict Mode, Type Narrowing, Branded Types sections
- Steve Kinney, *Frontend Masters TypeScript* — compiler configuration best practices

### Verification references

- https://www.typescriptlang.org/tsconfig/strict.html
- https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html
- https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
- https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html
- https://www.typescriptlang.org/docs/handbook/2/narrowing.html
