# Type Safety — TypeScript

> The compiler is only as useful as its configuration allows; type safety is not a feature you get by default but a discipline you enforce through strict settings, deliberate type narrowing, and structural guarantees that prevent entire classes of runtime failures.

## Mental Model

TypeScript's type system is opt-in at every level. Without `strict: true`, the compiler permits implicit `any`, unchecked null access, and unsafe function binds — all of which compile cleanly and crash at runtime. Strict mode is not a preference; it is the minimum configuration that makes TypeScript meaningfully different from JavaScript.

Beyond the compiler, type safety is a layered defense. The first layer is the `tsconfig.json` flags: `strict: true` enables `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, and `strictBindCallApply`. The second layer is `noUncheckedIndexedAccess`, which closes the gap where TypeScript lies about array and record indexing — treating `array[n]` as `T` when it should be `T | undefined`. These two layers eliminate the most common source of production null-reference errors.

The third layer is discipline in how you handle types at runtime. `any` is not a flexible type — it is the absence of type checking, and it spreads virally. Every value that touches `any` loses its type information, and every function that returns `any` infects its callers. The antidote is `unknown`, which forces you to prove what a value is before using it. Type assertions (`as`) are the opposite: they tell the compiler to trust you without evidence. Type guards (`typeof`, `instanceof`, `in`, custom predicates) prove the type through runtime checks that the compiler can verify. Assertions hide bugs; narrowing catches them.

The final layer is branded types. TypeScript is structurally typed, so `UserId` and `OrderId` are interchangeable if both are strings. Branded types add a phantom property that makes them nominally distinct at the type level, while remaining plain strings at runtime. Combined with validation functions that brand on creation, they close the gap between "this is a string" and "this is a validated, domain-specific identifier."

Together, these layers form a defense-in-depth strategy: the compiler catches structural errors, strict flags catch null and implicit-any errors, narrowing catches unsafe access patterns, and branding catches semantic misuse of structurally identical types.

## Consumer Guide

### When Reviewing Code

Check `tsconfig.json` first. If `strict` is not `true`, flag it as CRITICAL regardless of what the rest of the code looks like — the compiler is not doing its job. Next, search for `noUncheckedIndexedAccess` — its absence means every array and record access is silently unsafe. Then scan for `any` in type annotations, function parameters, and return types. Each instance is a hole in the type system. Finally, look for `as` assertions that are not preceded by a runtime check — these are assertions without evidence. Legitimate uses of `as` include `as const` (safe) and post-Zod-parse casting (validated).

### When Designing / Planning

Start every new project with `strict: true` and `noUncheckedIndexedAccess: true` in `tsconfig.json`. Design function signatures to accept `unknown` for external data and return precise types. Plan branded types early for domain identifiers (user IDs, order IDs, email addresses) — retrofitting them is harder than adding them from the start. When designing module boundaries, decide which types cross boundaries and ensure those boundary types are narrow and validated rather than wide and assumed.

### When Implementing

Enable all strict flags before writing the first line of code. Use `unknown` instead of `any` for values whose type you do not know at the point of declaration. Write type guard functions (returning `value is T`) for complex narrowing that you will reuse. Use `instanceof` for class hierarchies, `in` for discriminated objects, and `typeof` for primitives. Prefer optional chaining (`?.`) and nullish coalescing (`??`) over non-null assertions (`!`). Create branded type constructors that validate and brand in a single step, so unbranded values never enter the system.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| StrictModeAlways | CRITICAL | Enable `strict: true` in every tsconfig — without it, TypeScript is JavaScript with extra syntax |
| NoUncheckedIndexAccess | CRITICAL | Enable `noUncheckedIndexedAccess` so array and record indexing returns `T \| undefined` |
| NeverAny | CRITICAL | Replace `any` with `unknown` and narrow — `any` disables type checking and spreads virally |
| NarrowBeforeUse | CRITICAL | Use type guards to prove types at runtime instead of `as` assertions that bypass safety |
| BrandedForValidation | MEDIUM | Use branded types to distinguish semantically different values that share the same primitive type |


---

### TS1.1 Strict Mode Always

**Impact: CRITICAL (Catches entire classes of bugs — null errors, implicit any, unsafe binds — at compile time instead of production)**

TypeScript without `strict: true` is JavaScript with extra syntax. Strict mode enables `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, and other flags that make the type system actually useful. Enabling it on an existing codebase surfaces real bugs.

**Incorrect: Permissive compiler misses real bugs**

```typescript
// tsconfig.json — "strict" not enabled
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext"
    // strict defaults to false — silent bugs everywhere
  }
}

// This compiles without error but crashes at runtime
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

// Compiler now requires explicit types and null handling
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

**Impact: CRITICAL (Prevents undefined-at-runtime from array/object indexing that TypeScript normally assumes safe)**

By default, TypeScript treats `array[0]` as the element type, not `T | undefined`. This is a lie — the index may not exist. `noUncheckedIndexedAccess` forces you to handle the `undefined` case, catching a class of bugs that `strict: true` alone misses.

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
- After a bounds check: `if (i < array.length)` followed by `array[i]` — but narrowing with `at()` or optional chaining is still preferred
- Tuple types with known length already have correct types at specific indices

---

### TS1.3 Never Use Any

**Impact: CRITICAL (Any disables type checking and spreads virally — one `any` infects every value it touches)**

`any` is a type-checking escape hatch that turns TypeScript back into JavaScript. It's not "flexible" — it's invisible. Values typed as `any` pass through every check silently, and `any` propagates: a function returning `any` makes its callers untyped too. Use `unknown` when you genuinely don't know the type.

**Incorrect: Any disables the type system**

```typescript
function parseConfig(raw: any): any {
  return raw.settings.theme;     // no error if raw is null
}

const config = parseConfig(null); // config is any
config.nonexistent.deep.access;   // no error — crashes at runtime

// any spreads to everything it touches
const theme = config.theme;       // theme is any
const upper = theme.toUpperCase(); // any — no safety
```

**Correct: Use unknown and narrow**

```typescript
function parseConfig(raw: unknown): AppConfig {
  if (!isRecord(raw) || !isRecord(raw.settings)) {
    throw new Error("Invalid config structure");
  }
  return raw.settings as AppConfig; // validated before assertion
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
```

**When acceptable:**
- Inside generic function implementations where the type parameter constrains the public API (Matt Pocock's "any in generics" pattern)
- Typing third-party libraries with no `@types` package — isolate in a `.d.ts` file
- `JSON.parse()` return — but immediately validate with Zod (see Rule 8.1)

---

### TS1.4 Narrow Before Use

**Impact: CRITICAL (Type assertions lie to the compiler — type guards prove correctness)**

Type assertions (`as`) tell the compiler "trust me" without evidence. Type guards (`typeof`, `in`, `instanceof`, custom predicates) prove the type through runtime checks that the compiler can verify. Assertions hide bugs; narrowing catches them.

**Incorrect: Type assertions bypass safety**

```typescript
interface AdminUser {
  role: "admin";
  permissions: string[];
}

function getPermissions(user: unknown): string[] {
  const admin = user as AdminUser;     // no runtime check
  return admin.permissions;            // crashes if user isn't AdminUser
}

// Even with known types, 'as' is dangerous
const input = document.getElementById("email") as HTMLInputElement;
input.value = "test";  // crashes if element is null or not an input
```

**Correct: Type guards prove the type**

```typescript
function isAdminUser(user: unknown): user is AdminUser {
  return (
    typeof user === "object" &&
    user !== null &&
    "role" in user &&
    (user as { role: unknown }).role === "admin"
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
- After Zod `.parse()` which performs runtime validation (see Rule 8.1)
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

**NeverAny connects to ErrorHandling dimension**: `JSON.parse()` returns `any` — the immediate fix is to validate with Zod (see ErrorHandling dimension), which eliminates the `any` at the source.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **`strict: false` or missing strict in tsconfig.json** — The compiler is not checking nulls, implicit any, or unsafe binds. Every line of code is unverified. No amount of careful coding compensates for a permissive compiler.
- **`any` in function signatures** — A function parameter or return typed as `any` infects every caller. The infection is invisible because the code compiles without error while losing all type safety.
- **`as` assertion without preceding runtime check** — Casting `user as AdminUser` without verifying the value is an admin creates a type-level lie that crashes at runtime when the assumption is wrong.

### HIGH

- **Missing `noUncheckedIndexedAccess`** — Array and record indexing silently returns `T` instead of `T | undefined`. Every `array[i]` and `record[key]` is an unguarded access that can crash.
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
    "type" in value && "payload" in value
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
