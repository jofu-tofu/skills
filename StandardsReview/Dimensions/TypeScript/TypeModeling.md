# Type Modeling — TypeScript

> Types are not annotations bolted onto values after the fact; they are the design language of your system, encoding domain constraints, state transitions, and invariants that the compiler enforces for free.

## Mental Model

Type modeling is the practice of designing types that make illegal states unrepresentable. Where type safety (TS1) ensures the compiler is configured to catch errors, type modeling ensures there are fewer errors to catch in the first place — because the type system encodes business rules directly.

The foundation is discriminated unions. A union type with a literal discriminant property (like `kind` or `type`) lets TypeScript narrow the full type based on a single property check. This replaces class hierarchies, boolean flags, and optional properties with a structure the compiler can reason about exhaustively. When you add a new variant to a discriminated union, every `switch` statement that uses exhaustiveness checking (assigning the default case to `never`) becomes a compile error, turning the compiler into a changelog reviewer that tells you everywhere the new variant needs handling.

Generics are the second pillar. A well-constrained generic function communicates its contract through its type signature: "I accept any T that has these properties, and I return something derived from T." Unconstrained generics (`<T>` with no `extends`) are barely better than `any` — they accept everything and know nothing. The `extends` clause is the generic's contract. But generics should be inferred, not annotated: when you call `identity(42)`, TypeScript infers `number` for `T`. Explicit type arguments like `identity<number>(42)` add noise and can lie if the argument does not actually match.

Utility types are the third pillar. TypeScript ships with `Partial`, `Required`, `Pick`, `Omit`, `Record`, `Readonly`, `Extract`, and `Exclude` — type-level functions that derive new types from existing ones. Using them instead of manually defining partial or subset interfaces eliminates drift: when the source type changes, derived types update automatically. When built-in utilities do not fit, mapped types let you write custom transformations that iterate over keys and transform each property programmatically, the `Array.map()` of the type system.

Together, these tools let you model your domain so precisely that many categories of bugs become structurally impossible. A function that accepts `Shape` and switches on `kind` with exhaustiveness checking cannot forget to handle triangles. A generic `getProperty<T, K extends keyof T>` cannot be called with a key that does not exist on the object. A `Partial<User>` cannot drift from `User` because it is derived from it.

## Consumer Guide

### When Reviewing Code

Look for boolean flags or optional properties that represent mutually exclusive states — these should be discriminated unions. Check `switch` statements over unions for a `default` that returns a fallback value instead of calling `assertNever` — this hides missing cases. Scan for unconstrained generics (`<T>` without `extends`) in utility functions — they accept too much. Look for manually defined subset interfaces (e.g., `UserSummary` with copy-pasted fields from `User`) that should use `Pick` or `Omit`. Flag explicit type arguments at call sites when the compiler can infer them.

### When Designing / Planning

Model domain states as discriminated unions from the start. Identify the states an entity can be in and make each state a variant with its own properties. Choose the discriminant property name consistently across the codebase (`type`, `kind`, or `status` — pick one and use it everywhere). Design generic utility functions with `extends` constraints that document what the function needs from its input. Plan type derivation: define the canonical source type and derive all variants using utility types, so changes propagate automatically.

### When Implementing

Write discriminated unions with a string literal discriminant. Always add an `assertNever` helper and use it in the `default` case of every switch over a union. When writing generic functions, start with the constraint: what does the function need from `T`? Add `extends` accordingly. Let TypeScript infer generic type arguments at call sites — only add explicit type arguments when inference fails or when the result is ambiguous. Use built-in utility types (`Partial`, `Pick`, `Omit`, `Record`) before writing custom mapped types. When built-in utilities do not fit, write a named mapped type with a clear name that describes the transformation (e.g., `Promisified<T>`, `Nullable<T>`).

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| UnionsOverEnums | HIGH | Use string literal unions or `as const` objects instead of enums — zero runtime overhead, full narrowing |
| ExhaustivenessChecking | HIGH | Assign the default case to `never` so the compiler catches unhandled union variants |
| ConstrainGenerics | HIGH | Use `extends` to constrain generics to types with the properties the function needs |
| InferOverExplicit | HIGH | Let TypeScript infer generic type arguments from usage instead of annotating them explicitly |
| PreferBuiltinUtilities | MEDIUM | Use `Partial`, `Pick`, `Omit`, `Record` instead of manually defining subset interfaces |
| MappedTypes | MEDIUM | Write mapped types for custom type transformations when built-in utilities do not fit |


---

### TS2.1 Unions Over Enums

**Impact: HIGH (Enums generate runtime code, can't be tree-shaken, and have surprising numeric behavior)**

TypeScript enums are not erasable syntax — they emit JavaScript objects at runtime that increase bundle size and can't be tree-shaken. String literal unions with `as const` provide the same developer experience with zero runtime overhead, full type narrowing, and better composability.

**Incorrect: Enums generate runtime artifacts**

```typescript
// Emits a JavaScript object — can't be tree-shaken
enum Status {
  Pending = "PENDING",
  Active = "ACTIVE",
  Inactive = "INACTIVE",
}

// Numeric enums are worse — surprising bidirectional mapping
enum Direction {
  Up,    // 0
  Down,  // 1
}
const d: Direction = 99;  // no error — any number assignable
```

**Correct: String literal unions with as const**

```typescript
const STATUS = {
  Pending: "PENDING",
  Active: "ACTIVE",
  Inactive: "INACTIVE",
} as const;

type Status = (typeof STATUS)[keyof typeof STATUS];
// type Status = "PENDING" | "ACTIVE" | "INACTIVE"

// Or simpler — direct union type
type Direction = "up" | "down" | "left" | "right";

// Both provide full autocomplete, narrowing, and zero runtime cost
function handleStatus(status: Status) {
  if (status === "PENDING") { /* narrowed */ }
}
```

**When acceptable:**
- `const enum` in projects that don't use `--isolatedModules` (rare — most modern setups use isolated modules)
- Interop with APIs that expect numeric enum values — but consider a mapping object instead

---

### TS2.2 Exhaustiveness Checking

**Impact: HIGH (Compiler catches unhandled union cases — adding a new variant immediately shows every switch/if that needs updating)**

When you switch over a discriminated union, assign the default case to `never`. If a new variant is added to the union, every switch statement that doesn't handle it becomes a compile error. This turns the compiler into your changelog reviewer.

**Incorrect: Default case silently swallows new variants**

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side ** 2;
    default:
      return 0;  // if "triangle" is added, silently returns 0
  }
}
```

**Correct: Never type catches missing cases**

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "triangle"; base: number; height: number };

function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side ** 2;
    case "triangle":
      return 0.5 * shape.base * shape.height;
    default:
      return assertNever(shape);  // compile error if any case is missed
  }
}
```

**When acceptable:**
- Intentional catch-all for extensible union types (e.g., plugin systems where you can't know all variants)
- Logging/telemetry where you want to handle unknown values gracefully at runtime

---

### TS2.3 Constrain Generics

**Impact: HIGH (Unconstrained generics accept anything — constraints make generic functions actually useful by limiting input to valid types)**

A generic function `<T>` with no constraint is barely better than `any` — it accepts everything and knows nothing. Use `extends` to constrain generics to types that have the properties your function actually needs. This gives you autocomplete inside the function and type errors at the call site.

**Incorrect: Unconstrained generic knows nothing about T**

```typescript
function getProperty<T>(obj: T, key: string): unknown {
  return (obj as any)[key];  // forced to use any — T has no known shape
}

function merge<T, U>(a: T, b: U): T & U {
  return { ...a, ...b };  // works but callers get no useful constraints
}

// Accepts nonsense
getProperty(42, "name");          // no error — T is number
getProperty(null, "anything");    // no error — T is null
```

**Correct: Constraints give the compiler useful information**

```typescript
function getProperty<T extends object, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];  // fully typed — no assertions needed
}

function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b };
}

// Now enforced at call sites
getProperty({ name: "Alice", age: 30 }, "name");  // returns string
getProperty({ name: "Alice" }, "email");           // compile error — "email" not in keyof
```

**When acceptable:**
- Identity functions: `<T>(x: T) => T` — the constraint IS the return type relationship
- Container types like `Array<T>`, `Promise<T>` — the container doesn't need to know what T is

---

### TS2.4 Infer Over Explicit Type Arguments

**Impact: HIGH (Let TypeScript infer generic arguments from usage — explicit type arguments add noise and can lie)**

TypeScript's inference engine is powerful. When you call a generic function, the compiler infers type arguments from the values you pass. Explicit type arguments (`fn<string>(...)`) add visual noise and can be wrong if the value doesn't match — they're assertions in disguise.

**Incorrect: Explicit type arguments add noise and can lie**

```typescript
const names = ["Alice", "Bob", "Charlie"];

// Unnecessary — TypeScript infers string from the callback
const upper = names.map<string>((name) => name.toUpperCase());

// Dangerous — explicit type argument doesn't match actual data
const ids = [1, 2, 3];
const result = ids.reduce<string[]>((acc, id) => {
  acc.push(id);  // pushing number into string[] — no error with explicit type arg!
  return acc;
}, []);

// Redundant type parameter on function declaration
function identity<T>(value: T): T { return value; }
const x = identity<number>(42);  // TypeScript already infers number from 42
```

**Correct: Let inference work**

```typescript
const names = ["Alice", "Bob", "Charlie"];
const upper = names.map((name) => name.toUpperCase());  // inferred: string[]

const ids = [1, 2, 3];
const result = ids.reduce((acc, id) => {
  acc.push(id);
  return acc;
}, [] as number[]);  // seed value drives inference

const x = identity(42);  // inferred: number — clean and correct
```

**When acceptable:**
- Ambiguous inference: when TypeScript can't infer correctly from arguments alone (e.g., `createContext<Theme>()` with no default)
- Readability: when the inferred type is complex and explicit annotation helps readers
- Return type annotation on exported functions — explicit return types help API consumers and catch implementation drift

---

### TS2.5 Prefer Built-in Utility Types

**Impact: MEDIUM (Reduces type duplication — built-in utilities are well-tested, well-documented, and universally understood)**

TypeScript ships with utility types (`Partial`, `Required`, `Pick`, `Omit`, `Record`, `Readonly`, `Extract`, `Exclude`) that transform existing types. Reimplementing these manually creates drift, bugs, and cognitive overhead.

**Incorrect: Manual type transformations**

```typescript
// Manually making fields optional — drifts when User changes
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface UserUpdate {
  id?: string;
  name?: string;
  email?: string;
  role?: "admin" | "user";
}

// Manual subset — must be updated when User changes
interface UserSummary {
  id: string;
  name: string;
}
```

**Correct: Derive types from the source**

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

type UserUpdate = Partial<User>;
type UserSummary = Pick<User, "id" | "name">;
type UserWithoutEmail = Omit<User, "email">;
type ReadonlyUser = Readonly<User>;
type UserLookup = Record<string, User>;

// Compose utilities for complex transformations
type CreateUserInput = Omit<User, "id"> & { password: string };
type AdminUser = Extract<User["role"], "admin">;
```

**When acceptable:**
- When you need a named type for documentation: `type UserId = string` is clearer than using `string` everywhere, even though it's not a utility
- Custom mapped types when built-in utilities don't cover the transformation (see Rule 5.2)

---

### TS2.6 Mapped Types for Custom Transformations

**Impact: MEDIUM (When built-in utilities don't fit, mapped types transform types programmatically — DRY at the type level)**

Mapped types iterate over keys and transform each property. They're the `Array.map()` of the type system. Use them when `Partial`, `Pick`, etc. don't express the transformation you need.

**Incorrect: Manual per-property transformations**

```typescript
interface ApiResponse {
  users: User[];
  posts: Post[];
  comments: Comment[];
}

// Manually wrapping each property — breaks when ApiResponse changes
interface AsyncApiResponse {
  users: Promise<User[]>;
  posts: Promise<Post[]>;
  comments: Promise<Comment[]>;
}

// Manually creating nullable versions
interface NullableApiResponse {
  users: User[] | null;
  posts: Post[] | null;
  comments: Comment[] | null;
}
```

**Correct: Mapped types derive transformations**

```typescript
interface ApiResponse {
  users: User[];
  posts: Post[];
  comments: Comment[];
}

// Generic mapped type — reusable across any interface
type Promisified<T> = {
  [K in keyof T]: Promise<T[K]>;
};

type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

type AsyncApiResponse = Promisified<ApiResponse>;
type NullableApiResponse = Nullable<ApiResponse>;

// Conditional mapped type — transform only array properties
type ArraysToSets<T> = {
  [K in keyof T]: T[K] extends Array<infer U> ? Set<U> : T[K];
};
```

**When acceptable:**
- Prefer built-in utilities (Rule 5.1) when they fit — `Partial`, `Required`, `Readonly` are mapped types already
- Avoid deeply nested conditional mapped types — if the type is harder to read than the manual version, use the manual version


## Rule Interactions

**UnionsOverEnums + ExhaustivenessChecking** are inseparable. Discriminated unions gain their real power when every switch includes exhaustiveness checking via `assertNever`. Without exhaustiveness checking, adding a new variant to a union is just as invisible as adding a new enum member. Together, they create a system where new states are impossible to forget.

**ConstrainGenerics + InferOverExplicit** govern generic function design from opposite ends. ConstrainGenerics defines what the function accepts (the `extends` clause). InferOverExplicit defines how callers use it (let the compiler figure out `T` from the argument). A well-constrained generic with good inference requires no explicit type arguments at call sites.

**PreferBuiltinUtilities + MappedTypes** form a hierarchy. Always reach for built-in utilities first. Only write a custom mapped type when `Partial`, `Pick`, `Omit`, `Record`, `Readonly`, `Extract`, and `Exclude` cannot express the transformation. Mapped types are more powerful but harder to read; built-in utilities are universally understood.

**UnionsOverEnums connects to TypeSafety dimension**: Unions paired with `as const` objects replace enums with zero runtime overhead. The `as const` assertion (from the TypeSafety dimension's NarrowBeforeUse rule) is the mechanism that makes the values literal types.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Boolean flags for mutually exclusive states** — `{ isLoading: boolean; isError: boolean; data?: T }` allows `{ isLoading: true, isError: true, data: undefined }`, which is an impossible state that the type permits. Use a discriminated union: `{ status: "loading" } | { status: "error"; error: Error } | { status: "success"; data: T }`.

### HIGH

- **Switch without exhaustiveness checking** — A `default` case that returns a fallback value instead of calling `assertNever` means adding a new union variant silently falls through to the default. Every switch on a discriminated union must use exhaustiveness checking.
- **Unconstrained generics in utility functions** — `function getProperty<T>(obj: T, key: string)` accepts anything for `T` and knows nothing about it, forcing `any` casts inside. Constrain with `<T extends object, K extends keyof T>`.
- **TypeScript enums used for new code** — Enums generate runtime JavaScript objects, cannot be tree-shaken, and numeric enums have surprising bidirectional mapping. Use string literal unions or `as const` objects.

### MEDIUM

- **Manually defined subset interfaces that duplicate fields** — `interface UserSummary { id: string; name: string }` alongside `interface User { id: string; name: string; email: string }` will drift. Use `type UserSummary = Pick<User, "id" | "name">`.
- **Explicit type arguments where inference works** — `names.map<string>(n => n.toUpperCase())` is noise. Let the compiler infer the return type from the callback.
- **Deeply nested conditional mapped types** — If a mapped type requires more than two levels of conditional inference, it is harder to read than the manual version. Prefer clarity over cleverness.

## Examples

**Example 1: Discriminated union with exhaustiveness**
```typescript
type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

function renderState<T>(state: RequestState<T>): string {
  switch (state.status) {
    case "idle":    return "Ready";
    case "loading": return "Loading...";
    case "success": return `Got: ${state.data}`;
    case "error":   return `Error: ${state.error.message}`;
    default:        return assertNever(state);
  }
}
```

**Example 2: Constrained generic with inference**
```typescript
function pluck<T extends object, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key]);
}

const users = [{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }];
const names = pluck(users, "name");  // inferred: string[]
const ages = pluck(users, "age");    // inferred: number[]
// pluck(users, "email");            // compile error: "email" not in keyof
```

**Example 3: Utility types over manual definitions**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

type CreateUserInput = Omit<User, "id">;
type UserUpdate = Partial<Pick<User, "name" | "email">>;
type UserSummary = Pick<User, "id" | "name">;
type ReadonlyUser = Readonly<User>;
// All derived — change User, and these update automatically.
```

## Does Not Cover

- **Compiler configuration and strict flags** — Covered in the TypeSafety dimension (TS1). This dimension assumes the compiler is already strict.
- **Runtime validation and Zod schemas** — Covered in the ErrorHandling dimension (TS3). Type modeling is compile-time; runtime validation is a separate concern.
- **Branded types for nominal safety** — Covered in the TypeSafety dimension (TS1). Branding is a safety mechanism, not a modeling tool.

## Sources

- Matt Pocock, *Total TypeScript* — discriminated unions, generics constraints, utility type patterns
- TypeScript Handbook — Narrowing, Generics, Mapped Types, Conditional Types
- Steve Kinney, *Frontend Masters TypeScript* — exhaustiveness checking, generic design patterns
