# Error Handling — TypeScript

> Errors that are invisible in function signatures are errors that callers will forget to handle; making failure explicit in the type system transforms error handling from a discipline problem into a compiler-enforced guarantee.

## Mental Model

JavaScript's error handling model is built on `throw` and `try/catch`, a mechanism inherited from Java that is fundamentally at odds with TypeScript's type system. A function that throws has an invisible failure mode: its signature says `Promise<User>`, but it can also produce an `Error` — or a `string`, or a `number`, or anything else, because JavaScript lets you throw any value. Callers have no way to know a function can fail without reading its implementation, and `catch (e)` gives you `unknown` with no type information about what was caught.

Result types fix this by encoding success and failure in the return type itself. A function returning `Result<User, NotFoundError | NetworkError>` makes its failure modes visible in the signature. The caller must handle both branches because TypeScript's type narrowing demands it — you cannot access `result.data` without first checking `result.success`. This is not a new concept; Rust's `Result<T, E>`, Haskell's `Either`, and Go's multiple return values all solve the same problem. In TypeScript, a discriminated union with a `success` boolean discriminant is the idiomatic approach.

Custom error classes complement Result types by adding structure to the error branch. When everything throws `new Error("something went wrong")`, error handling degrades to string parsing. Custom Error subclasses carry structured data (`NotFoundError` has an `entity` and `id`; `InsufficientFundsError` has `balance` and `required`) and enable `instanceof` checks that are refactor-safe and type-narrowing compatible.

At system boundaries — API responses, user input, environment variables, JSON files — data has no type at runtime. Type assertions (`as User`) are lies: they tell the compiler to trust you without performing any validation. Zod schemas close this gap by validating the actual data structure at runtime and inferring the TypeScript type from the schema. A single Zod schema replaces both the runtime validation and the TypeScript interface, eliminating the drift that occurs when you maintain both separately. The `z.infer<typeof Schema>` pattern derives the type from the schema, making the schema the single source of truth.

Together, these four practices create a coherent error handling strategy: Result types make failure visible in signatures, custom errors add structure to failure values, Zod validates external data at boundaries, and schema inference eliminates type drift. The result is a system where error handling is not optional — the compiler enforces it.

## Consumer Guide

### When Reviewing Code

Check function signatures for functions that throw but declare no error in their return type — these should return `Result<T, E>` instead. Look for `catch (e)` blocks that use string matching (`e.message.includes(...)`) to determine error type — these should use `instanceof` with custom error classes. Scan for `as` assertions on data from external sources (API responses, JSON.parse, environment variables) — these should use Zod `.parse()` or `.safeParse()`. Check whether Zod schemas have a corresponding manually-written TypeScript interface — if so, the interface should be replaced with `z.infer<typeof Schema>`.

### When Designing / Planning

Decide on a Result type definition early and use it consistently across the project. A simple discriminated union works: `type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E }`. Identify system boundaries where external data enters the application and plan Zod schemas for each boundary. Design a custom error hierarchy for the domain: group errors by category (NotFoundError, ValidationError, AuthorizationError, ConflictError) and give each structured properties that callers need. Decide whether to use `.parse()` (throws on invalid data) or `.safeParse()` (returns a Result-like object) as the project default — `.safeParse()` pairs naturally with the Result type pattern.

### When Implementing

Define the Result type once and import it everywhere. Write functions that can fail to return `Result<T, E>` instead of throwing. Use `try/catch` internally to wrap third-party code that throws, converting thrown errors into Result values at the boundary. Create custom Error subclasses with structured properties using class declarations that extend Error and set `this.name` in the constructor. Write Zod schemas for every external data source and derive TypeScript types with `z.infer`. Never maintain both a Zod schema and a separate interface for the same data shape — one will drift from the other. Use `.extend()` and `.pick()` on Zod schemas to derive related schemas (e.g., `CreateUserSchema` from `UserSchema`).

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| ResultOverTryCatch | CRITICAL | Return `Result<T, E>` instead of throwing so callers see failure in the type signature |
| CustomErrorClasses | HIGH | Use Error subclasses with structured data instead of generic `new Error(message)` strings |
| ZodForExternalData | HIGH | Validate external data with Zod schemas instead of `as` assertions at system boundaries |
| InferFromSchemas | HIGH | Derive TypeScript types from Zod schemas with `z.infer` — never maintain parallel definitions |


---

### TS3.1 Result Types Over Try/Catch

**Impact: CRITICAL (Try/catch hides error cases from function signatures — callers don't know a function can fail until it does)**

A function that throws has an invisible failure mode. Callers must read the implementation to know what errors are possible. A `Result<T, E>` return type makes success and failure explicit in the signature — the compiler forces callers to handle both cases.

**Incorrect: Thrown errors are invisible in types**

```typescript
// Signature says it returns User — but it can throw
async function getUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Caller has no idea this can fail
const user = await getUser("123");
console.log(user.name);  // crashes if getUser threw
```

**Correct: Result type makes failure explicit**

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

async function getUser(id: string): Promise<Result<User>> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) {
      return { success: false, error: new Error(`HTTP ${res.status}`) };
    }
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

// Caller MUST handle both cases — compiler enforces it
const result = await getUser("123");
if (!result.success) {
  console.error(result.error.message);
  return;
}
console.log(result.data.name);  // TypeScript knows this is User
```

**When acceptable:**
- Truly exceptional conditions (out of memory, stack overflow) that callers can't reasonably handle
- Top-level error boundaries in frameworks (Express middleware, React error boundaries) that catch everything
- Library functions matching ecosystem conventions (e.g., `JSON.parse` throws — wrapping every stdlib call in Result is impractical)

---

### TS3.2 Custom Error Classes

**Impact: HIGH (Generic Error messages force string parsing — custom Error subclasses enable typed catch blocks and discriminated error handling)**

When everything throws `new Error("something went wrong")`, error handling becomes string matching. Custom Error subclasses carry structured data, enable `instanceof` checks, and make error handling as type-safe as the rest of your code.

**Incorrect: Generic errors with string messages**

```typescript
async function transferFunds(from: string, to: string, amount: number) {
  const account = await getAccount(from);
  if (!account) throw new Error("Account not found");
  if (account.balance < amount) throw new Error("Insufficient funds");
  if (amount <= 0) throw new Error("Invalid amount");
  // ...
}

// Caller must parse strings to determine error type
try {
  await transferFunds(from, to, amount);
} catch (e) {
  if (e.message.includes("not found")) { /* ... */ }      // fragile
  else if (e.message.includes("Insufficient")) { /* ... */ } // breaks on typo
}
```

**Correct: Typed error subclasses**

```typescript
class NotFoundError extends Error {
  constructor(public readonly entity: string, public readonly id: string) {
    super(`${entity} not found: ${id}`);
    this.name = "NotFoundError";
  }
}

class InsufficientFundsError extends Error {
  constructor(public readonly balance: number, public readonly required: number) {
    super(`Insufficient funds: have ${balance}, need ${required}`);
    this.name = "InsufficientFundsError";
  }
}

class ValidationError extends Error {
  constructor(public readonly field: string, public readonly reason: string) {
    super(`Validation failed: ${field} — ${reason}`);
    this.name = "ValidationError";
  }
}

// Caller uses instanceof — typed and refactor-safe
try {
  await transferFunds(from, to, amount);
} catch (e) {
  if (e instanceof NotFoundError) {
    console.log(`Missing ${e.entity}: ${e.id}`);  // structured access
  } else if (e instanceof InsufficientFundsError) {
    console.log(`Need ${e.required - e.balance} more`);
  }
}
```

**When acceptable:**
- Simple scripts where a plain `Error` with a descriptive message is sufficient
- When using Result types (Rule 7.1) — the error branch of a Result can be a simple type instead of an Error subclass

---

### TS3.3 Zod for External Data Validation

**Impact: HIGH (Type assertions on external data are lies — Zod validates at runtime and infers types, closing the compile-time/runtime gap)**

Data from APIs, user input, environment variables, and JSON files has no type at runtime. A type assertion (`as User`) tells the compiler "trust me" but performs zero validation. Zod schemas validate the actual data structure and infer the TypeScript type, giving you both runtime safety and compile-time types from a single source.

**Incorrect: Type assertions on unvalidated data**

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  const data = await res.json();
  return data as User;  // DANGEROUS: no runtime validation
}

// If API returns { id: 123, nm: "Alice" } — no error, silent corruption
const user = await fetchUser("1");
console.log(user.name.toUpperCase());  // runtime crash: undefined.toUpperCase()
```

**Correct: Zod schema as single source of truth**

```typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive(),
});

type User = z.infer<typeof UserSchema>;  // type derived from schema

async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  const data = await res.json();
  return UserSchema.parse(data);  // throws ZodError with details on mismatch
}

// For non-throwing validation
const result = UserSchema.safeParse(data);
if (!result.success) {
  console.error(result.error.issues);  // structured error details
  return;
}
const user = result.data;  // typed as User
```

**When acceptable:**
- Internal data passed between trusted functions in the same process — validation at system boundaries is sufficient
- Performance-critical hot paths where Zod's overhead matters — but profile first, don't assume

---

### TS3.4 Infer Types From Schemas

**Impact: HIGH (Manually maintaining both a Zod schema and a TypeScript interface creates drift — derive the type from the schema)**

When you define a Zod schema AND a separate TypeScript interface, they will diverge. Someone adds a field to the interface but forgets the schema, or vice versa. Use `z.infer<typeof Schema>` to derive the type from the schema — single source of truth, zero drift.

**Incorrect: Parallel type and schema definitions**

```typescript
// These WILL drift apart over time
interface CreateOrderInput {
  productId: string;
  quantity: number;
  shippingAddress: string;
  couponCode?: string;
}

const CreateOrderSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  shippingAddress: z.string().min(10),
  // forgot couponCode — silent drift
});

function createOrder(input: CreateOrderInput) {
  const validated = CreateOrderSchema.parse(input);
  // validated is missing couponCode — type says it's there
}
```

**Correct: Schema is the source of truth**

```typescript
const CreateOrderSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  shippingAddress: z.string().min(10),
  couponCode: z.string().optional(),
});

// Type derived from schema — always in sync
type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// For output types with transforms
const OrderResponseSchema = CreateOrderSchema.extend({
  id: z.string().uuid(),
  total: z.number(),
  createdAt: z.coerce.date(),
});

type OrderResponse = z.infer<typeof OrderResponseSchema>;
```

**When acceptable:**
- Types that are never validated at runtime (internal state, UI-only types) don't need schemas
- Third-party types you can't control — wrap with Zod at the boundary but keep the original type internally


## Rule Interactions

**ResultOverTryCatch + CustomErrorClasses** define the two halves of typed error handling. Result types make the error branch visible in the signature. Custom error classes give the error branch structure and `instanceof` narrowing. A `Result<User, NotFoundError | ValidationError>` signature tells callers exactly what can go wrong and gives them typed access to error details.

**ZodForExternalData + InferFromSchemas** are always used together. ZodForExternalData says to validate external data with Zod. InferFromSchemas says to derive the TypeScript type from the schema. Using Zod without `z.infer` means you still have a parallel interface that can drift. Using `z.infer` without Zod means you have a type with no runtime validation.

**ResultOverTryCatch + ZodForExternalData** interact at API boundaries. A function that fetches and validates external data should use Zod's `.safeParse()` inside and return a `Result<T, ZodError>` to the caller, combining runtime validation with typed error handling in a single pattern.

**CustomErrorClasses connects to TypeModeling dimension**: Custom error classes are discriminated by `instanceof`, which is a form of type narrowing. The error hierarchy can also be modeled as a discriminated union (`type AppError = NotFoundError | ValidationError | AuthError`) for exhaustiveness checking.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Functions that throw with no indication in their return type** — A function typed as `Promise<User>` that throws on failure is a hidden landmine. Callers have no way to know it can fail from the signature alone. Every function that can fail should return `Result<T, E>`.
- **`as` assertions on unvalidated external data** — `const user = data as User` performs zero runtime checks. If the API returns `{ id: 123, nm: "Alice" }` instead of `{ id: "abc", name: "Alice" }`, the assertion silently passes and the code crashes later when accessing missing properties.

### HIGH

- **Generic `new Error(message)` with string parsing in catch blocks** — When all errors are plain `Error` with a message string, callers must parse strings to determine the error type. This is fragile (breaks on typo changes), untypeable (no structured data), and unrefactorable (find-and-replace on strings is unsafe).
- **Parallel Zod schema and TypeScript interface for the same data** — Maintaining both `const UserSchema = z.object(...)` and `interface User { ... }` means they will drift. One source of truth: define the schema, infer the type.
- **Using `.parse()` without catching `ZodError`** — `schema.parse(data)` throws on invalid data. If the caller does not catch the error, validation failures become unhandled exceptions. Prefer `.safeParse()` for controlled error handling, or wrap `.parse()` in a Result-returning function.

### MEDIUM

- **Over-applying Result types to internal code** — Not every internal helper needs a Result return type. Functions that are called within a single module and whose errors are truly exceptional (programmer errors, not domain errors) can throw. Result types are most valuable at module boundaries and public API surfaces.
- **Deeply nested Zod schemas without `.extend()` or `.pick()`** — Duplicating schema definitions for related shapes (CreateUser, UpdateUser, UserResponse) when they could be derived from a base schema with `.extend()`, `.pick()`, or `.omit()`.

## Examples

**Example 1: Result type pattern**
```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

async function getUser(id: string): Promise<Result<User, NotFoundError | NetworkError>> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (res.status === 404) {
      return { success: false, error: new NotFoundError("User", id) };
    }
    if (!res.ok) {
      return { success: false, error: new NetworkError(res.status) };
    }
    const data = UserSchema.parse(await res.json());
    return { success: true, data };
  } catch (e) {
    return { success: false, error: new NetworkError(0) };
  }
}

// Caller must handle both branches
const result = await getUser("123");
if (!result.success) {
  if (result.error instanceof NotFoundError) {
    console.log(`User ${result.error.id} not found`);
  }
  return;
}
console.log(result.data.name);  // TypeScript knows this is User
```

**Example 2: Custom error hierarchy**
```typescript
class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

class NotFoundError extends AppError {
  constructor(public readonly entity: string, public readonly id: string) {
    super(`${entity} not found: ${id}`);
  }
}

class ValidationError extends AppError {
  constructor(public readonly field: string, public readonly reason: string) {
    super(`Validation failed on ${field}: ${reason}`);
  }
}

class NetworkError extends AppError {
  constructor(public readonly statusCode: number) {
    super(`Network error: HTTP ${statusCode}`);
  }
}
```

**Example 3: Zod schema as single source of truth**
```typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "user"]),
});

// Type derived from schema — always in sync
type User = z.infer<typeof UserSchema>;

// Derived schemas for variants
const CreateUserSchema = UserSchema.omit({ id: true }).extend({
  password: z.string().min(8),
});
type CreateUserInput = z.infer<typeof CreateUserSchema>;

// Safe parsing returns a Result-like object
const result = UserSchema.safeParse(apiResponse);
if (!result.success) {
  console.error(result.error.issues);
  return;
}
const user: User = result.data;
```

## Does Not Cover

- **Type narrowing and type guards** — Covered in the TypeSafety dimension (TS1). This dimension uses narrowing (e.g., checking `result.success`) but does not teach the narrowing patterns themselves.
- **Discriminated union design** — Covered in the TypeModeling dimension (TS2). Result types are discriminated unions, but the general principles of union design and exhaustiveness checking belong to TS2.
- **Compiler configuration** — Covered in the TypeSafety dimension (TS1). Error handling patterns assume `strict: true` is already enabled.

## Sources

- Matt Pocock, *Total TypeScript* — Result type patterns, Zod integration, schema inference
- TypeScript Handbook — Discriminated Unions (as applied to Result types)
- Zod documentation — Schema definition, `z.infer`, `.safeParse()`, schema composition
- Steve Kinney, *Frontend Masters TypeScript* — error handling patterns, custom error classes
