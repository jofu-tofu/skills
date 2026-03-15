# Conventions — TypeScript

> Consistency in imports, naming, and file organization is not cosmetic; it is infrastructure that reduces cognitive load, prevents merge conflicts, and makes codebases navigable by any TypeScript developer without tribal knowledge.

## Mental Model

Conventions are the lowest-severity rules in the TypeScript standards, but they compound. A single misordered import is trivial. A codebase where every file orders imports differently, names booleans without predicate prefixes, scatters types into a monolithic `types.ts`, and mixes `import type` with runtime imports creates a maintenance burden that slows every developer who touches it. Conventions are not about aesthetics — they are about reducing the number of decisions a developer must make and the number of surprises they encounter when reading unfamiliar code.

The first convention is separating type imports from value imports. TypeScript's `import type` syntax tells the compiler and bundler that an import is types-only and should be completely erased in the output. Without it, the bundler may include an entire module just because a type was referenced, bloating the bundle with dead code. The `verbatimModuleSyntax` compiler flag enforces this separation: any import used only as a type must use `import type`, and the compiler errors if you forget. This creates a clean, enforceable distinction between compile-time dependencies (types) and runtime dependencies (values).

The second convention is import ordering. Imports should be grouped by origin — built-in Node.js modules first, then external packages, then internal parent modules, then internal sibling modules — with blank lines between groups and alphabetical sorting within each group. This ordering makes dependency relationships immediately visible: you can glance at the top of a file and understand whether it depends on the standard library, third-party packages, shared internal modules, or only its immediate neighbors. It also reduces merge conflicts because developers adding imports to different groups are unlikely to conflict.

The third convention is naming. TypeScript's ecosystem has established conventions that encode meaning in casing: PascalCase for types, interfaces, classes, and components; camelCase for variables, functions, methods, and properties; UPPER_SNAKE_CASE only for environment variables. Booleans use predicate prefixes (`isActive`, `hasPermission`, `shouldRetry`) that read as questions. Interfaces and types do not use I- or T- prefixes — TypeScript uses structural typing, not nominal typing, so the C# convention of `IUserService` is unnecessary noise. Acronyms in multi-word names capitalize only the first letter (`parseHtmlDocument`, not `parseHTMLDocument`) for consistent casing boundaries.

The fourth convention is file organization. Types should live close to the code that uses them, not in a monolithic `types.ts` that becomes a merge-conflict magnet. Co-locate domain types with their implementation: `users/user.ts` contains the `User` type and related types, `users/user-service.ts` imports from `./user`. Only truly cross-domain types (like `ApiResponse` or `Pagination`) belong in a shared directory. This co-location makes it possible to understand a module by reading its directory without jumping across the entire project.

These four conventions work together as a system. Type imports are separated for bundle correctness. Import ordering makes dependencies visible. Naming conventions make code self-documenting. File organization makes the codebase navigable. None of them prevent bugs on their own, but together they create an environment where bugs are easier to find because the code is easier to read.

## Consumer Guide

### When Reviewing Code

Check that type-only imports use `import type` — a regular import that is only used as a type annotation is a bundle-size leak. Verify import ordering follows the group convention: built-in, external, internal parent, internal sibling. Check that booleans use predicate prefixes (`is`, `has`, `should`, `can`) and that types use PascalCase without I- or T- prefixes. Look for a monolithic `types.ts` file that holds types for multiple unrelated domains — these should be co-located with their implementation. Check that `verbatimModuleSyntax` is enabled in `tsconfig.json` to enforce type import separation automatically.

### When Designing / Planning

Establish import ordering conventions at project setup and enforce them with ESLint (`import/order` or `@trivago/prettier-plugin-sort-imports`). Enable `verbatimModuleSyntax` in `tsconfig.json` so type import separation is a compiler error, not a code review nit. Define the file organization strategy before the first module is created: where do domain types live, where do shared types live, what constitutes a module boundary. Document naming conventions once in the project README or contributing guide, especially if the team has preferences that differ from ecosystem defaults.

### When Implementing

Use `import type` for every import that is only used in type positions (type annotations, generic arguments, `extends` clauses). Group imports with blank line separators: built-in modules, external packages, internal parent modules, internal sibling modules. Alphabetize within each group. Name booleans with predicate prefixes that read as yes/no questions. Use PascalCase for types and interfaces without prefixes. Place types in the same directory as the code that uses them — create a `user.ts` alongside `user-service.ts` rather than adding to a global `types.ts`. Extract shared types to a `shared/` directory only when they are genuinely used across multiple unrelated domains.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| ImportTypeForTypes | MEDIUM | Use `import type` for type-only imports to eliminate unnecessary runtime module inclusion |
| ImportOrdering | MEDIUM | Group imports by origin with blank line separators and alphabetize within each group |
| NamingConventions | MEDIUM | Follow TypeScript ecosystem casing: PascalCase types, camelCase values, predicate-prefix booleans |
| FileOrganization | MEDIUM | Co-locate types with implementation; avoid monolithic types files |


---

### TS4.1 Import Type for Type-Only Imports

**Impact: MEDIUM (Type-only imports are erased at compile time — prevents importing runtime modules just for their types, reducing bundle size)**

When you import a type from a module, `import type` tells the compiler and bundler that this import is types-only and should be completely erased in the output. Without it, the bundler may include the entire module just for a type reference, bloating the bundle.

**Incorrect: Regular imports pull in runtime code for types**

```typescript
// Imports the entire module — even though we only use the type
import { UserService } from "./services/user-service";
import { DatabaseConnection } from "./database";

function createHandler(db: DatabaseConnection): void {
  // DatabaseConnection is only used as a type here
  // but the import pulls in the entire database module
}

// Mixing runtime and type imports without distinction
import { z } from "zod";
import { User, Order, ApiResponse } from "./types";
```

**Correct: Separate type imports from value imports**

```typescript
// Type-only import — erased at compile time, zero bundle impact
import type { DatabaseConnection } from "./database";
import type { UserService } from "./services/user-service";

function createHandler(db: DatabaseConnection): void {
  // Same type safety, no runtime import
}

// When you need both values and types from a module
import { z } from "zod";
import type { ZodSchema, ZodError } from "zod";

// Enable in tsconfig for enforcement
// "verbatimModuleSyntax": true
```

**When acceptable:**
- When the module is already imported for runtime values — adding a separate `import type` for its types is unnecessary noise
- Barrel files (`index.ts`) that re-export both types and values — use `export type` for type re-exports

---

### TS4.2 Import Ordering

**Impact: MEDIUM (Consistent import order reduces merge conflicts and makes dependency relationships immediately visible)**

Imports should be grouped by origin and sorted within each group. This makes it obvious where dependencies come from (built-in vs external vs internal) and reduces merge conflicts when multiple developers add imports.

**Incorrect: Random import order**

```typescript
import { render } from "./utils/render";
import type { User } from "./types";
import { z } from "zod";
import path from "node:path";
import { useState } from "react";
import { db } from "../database";
import { formatDate } from "./utils/date";
import type { ApiResponse } from "../../shared/types";
```

**Correct: Grouped by origin with blank line separators**

```typescript
// 1. Built-in Node.js modules
import path from "node:path";

// 2. External packages
import { useState } from "react";
import { z } from "zod";

// 3. Internal — parent/shared modules
import type { ApiResponse } from "../../shared/types";
import { db } from "../database";

// 4. Internal — sibling/local modules
import type { User } from "./types";
import { formatDate } from "./utils/date";
import { render } from "./utils/render";
```

**Group order:** `built-in` → `external` → `internal (parent)` → `internal (sibling)` → `type-only`

Alphabetize within each group. Enforce with ESLint `import/order` or `@trivago/prettier-plugin-sort-imports`.

**When acceptable:**
- Side-effect imports (`import "./polyfills"`) go at the top regardless of origin
- CSS/asset imports follow framework conventions (e.g., CSS modules at the bottom in React components)

---

### TS4.3 Naming Conventions

**Impact: MEDIUM (Consistent naming communicates intent — readers know what something is before reading its definition)**

TypeScript has ecosystem conventions that encode meaning in casing. Following them makes code readable to any TypeScript developer without needing to look up definitions.

**Incorrect: Inconsistent or misleading naming**

```typescript
// Interface with I-prefix — C# convention, not TypeScript
interface IUserService { }

// Type with T-prefix — unnecessary in TypeScript
type TUserProps = { name: string };

// Boolean without predicate prefix
const active = true;      // active what? Is it a noun or adjective?
const loading = false;     // is this a verb or state?

// Constants in SCREAMING_CASE for non-environment values
const MAX_RETRY_COUNT = 3;
const DEFAULT_PAGE_SIZE = 20;

// Acronyms fully capitalized in multi-word names
function parseHTMLDocument() { }
type XMLHTTPRequest = {};
```

**Correct: TypeScript ecosystem conventions**

```typescript
// No I-prefix on interfaces — TypeScript uses structural typing
interface UserService { }

// No T-prefix on types
type UserProps = { name: string };

// Booleans as predicates — reads like a question
const isActive = true;
const hasPermission = false;
const shouldRetry = true;

// Prefer as const or enum-like objects for named constants
const config = {
  maxRetryCount: 3,
  defaultPageSize: 20,
} as const;

// Acronyms: only first letter capitalized in multi-word names
function parseHtmlDocument() { }
type XmlHttpRequest = {};

// General conventions:
// PascalCase: types, interfaces, classes, enums, components
// camelCase: variables, functions, methods, properties
// UPPER_SNAKE: environment variables only (process.env.DATABASE_URL)
```

**When acceptable:**
- `UPPER_SNAKE_CASE` for environment variable references and true compile-time constants
- Team conventions that differ — consistency within a project matters more than matching ecosystem conventions

---

### TS4.4 File Organization

**Impact: MEDIUM (Co-locating types with implementation reduces navigation and keeps related code together)**

Types should live close to the code that uses them. A single `types.ts` file that holds every type in the project becomes a merge-conflict magnet and forces readers to jump between files. Co-locate types with their implementation; extract shared types to domain-specific files.

**Incorrect: Monolithic types file**

```typescript
// types.ts — 500+ lines, everything dumped here
export interface User { /* ... */ }
export interface Order { /* ... */ }
export interface Product { /* ... */ }
export interface CartItem { /* ... */ }
export interface ShippingAddress { /* ... */ }
export interface PaymentMethod { /* ... */ }
// Every change touches this file — merge conflict city
```

**Correct: Co-locate types with implementation**

```
src/
├── users/
│   ├── user.ts           # User type + user-related types
│   ├── user-service.ts   # imports User from ./user
│   └── user-api.ts       # imports User from ./user
├── orders/
│   ├── order.ts          # Order, OrderItem, OrderStatus types
│   ├── order-service.ts
│   └── order-api.ts
└── shared/
    └── api-types.ts      # Only truly cross-domain types (ApiResponse, Pagination)
```

```typescript
// users/user.ts — types co-located with their domain
export interface User {
  id: string;
  name: string;
  email: string;
}

export type CreateUserInput = Omit<User, "id">;
export type UserSummary = Pick<User, "id" | "name">;

// users/user-service.ts
import type { User, CreateUserInput } from "./user";
```

**When acceptable:**
- Small projects (< 10 files) where a single `types.ts` is genuinely simpler
- Generated types (from OpenAPI, GraphQL codegen) that live in a generated output directory
- Shared DTOs for API contracts between frontend and backend in a monorepo


## Rule Interactions

**ImportTypeForTypes + ImportOrdering** govern the import section together. ImportTypeForTypes determines whether an import uses the `type` keyword. ImportOrdering determines where that import sits within the grouped structure. Type-only imports from the same group can be placed after the value imports from that group, or in a dedicated type-imports section at the end — the key is consistency within the project.

**NamingConventions + FileOrganization** reinforce each other. When files are co-located with their domain (`users/user.ts`), naming conventions keep the file contents predictable: the file exports `User` (PascalCase type), `createUser` (camelCase function), and `isActiveUser` (predicate-prefixed boolean helper). A reader can predict the contents from the file name and vice versa.

**ImportTypeForTypes connects to TypeSafety dimension**: Enabling `verbatimModuleSyntax` in `tsconfig.json` (a compiler configuration concern from TS1) enforces the `import type` convention automatically, turning it from a style guideline into a compiler error.

**FileOrganization connects to TypeModeling dimension**: When types are derived using utility types (`type UserSummary = Pick<User, "id" | "name">`), co-location means the derived type lives in the same file as the source type, making the derivation relationship obvious and preventing stale parallel definitions in a distant `types.ts`.

## Anti-Patterns (Severity Calibration)

### CRITICAL

None. Convention violations do not cause runtime bugs on their own. However, a codebase with pervasive convention violations accumulates cognitive overhead that indirectly increases bug rates by making code harder to review and understand.

### HIGH

- **Missing `verbatimModuleSyntax` with type imports used as regular imports** — When a regular `import` pulls in a module only for its types, the bundler includes the entire module at runtime. In large projects, this can meaningfully increase bundle size. The fix is mechanical: enable `verbatimModuleSyntax` and let the compiler flag every violation.

### MEDIUM

- **Random import ordering across files** — When every file orders imports differently, developers waste time finding dependencies and merge conflicts increase because unrelated import additions touch the same lines. Enforce with an ESLint rule.
- **Booleans without predicate prefixes** — `const active = true` is ambiguous: is it a noun (the active item) or an adjective (is it active)? `const isActive = true` reads as a yes/no question, removing ambiguity.
- **I-prefix or T-prefix on interfaces and types** — `IUserService` and `TUserProps` are C# and Java conventions that add noise in TypeScript. TypeScript uses structural typing; the prefix adds no information and clutters every usage.
- **Monolithic `types.ts` holding types for unrelated domains** — A single file exporting User, Order, Product, and CartItem types becomes a merge-conflict magnet and forces readers to navigate by search rather than by directory structure. Co-locate types with their domain.
- **All types extracted to a `shared/` directory prematurely** — The opposite extreme: moving every type to a shared directory "just in case" destroys locality. Only types genuinely used across multiple unrelated modules belong in shared.

## Examples

**Example 1: Properly separated and ordered imports**
```typescript
// 1. Built-in Node.js modules
import path from "node:path";
import { readFile } from "node:fs/promises";

// 2. External packages (values)
import { useState, useEffect } from "react";
import { z } from "zod";

// 3. External packages (types)
import type { ZodSchema } from "zod";

// 4. Internal parent/shared modules
import { db } from "../database";
import type { ApiResponse } from "../../shared/api-types";

// 5. Internal sibling/local modules
import { formatDate } from "./utils/date";
import type { User } from "./user";
```

**Example 2: Naming conventions applied consistently**
```typescript
// PascalCase: types, interfaces, classes
interface UserProfile { /* ... */ }
type CreateUserInput = Omit<UserProfile, "id">;
class UserService { /* ... */ }

// camelCase: variables, functions, methods
const currentUser = getAuthenticatedUser();
function validateEmail(email: string): boolean { /* ... */ }

// Predicate-prefixed booleans
const isAuthenticated = true;
const hasPermission = checkPermission(user, "admin");
const shouldRedirect = !isAuthenticated && protectedRoute;

// Acronyms: first letter only capitalized in multi-word names
function parseHtmlDocument(raw: string): Document { /* ... */ }
type HttpStatusCode = 200 | 201 | 400 | 401 | 404 | 500;
```

**Example 3: Co-located file organization**
```
src/
  users/
    user.ts              # User type, CreateUserInput, UserSummary
    user-service.ts      # Business logic, imports from ./user
    user-api.ts          # API handlers, imports from ./user
    user-schema.ts       # Zod schemas, exports z.infer types
  orders/
    order.ts             # Order type, OrderStatus, OrderItem
    order-service.ts
    order-api.ts
  shared/
    api-types.ts         # Only cross-domain types: ApiResponse, Pagination
    result.ts            # Result<T, E> type used everywhere
```

## Does Not Cover

- **Compiler configuration** — Covered in the TypeSafety dimension (TS1). This dimension references `verbatimModuleSyntax` but does not cover `strict`, `noUncheckedIndexedAccess`, or other compiler flags.
- **Type design patterns** — Covered in the TypeModeling dimension (TS2). This dimension covers where types live (file organization) and how they are named, not how they are designed.
- **Zod schema organization** — Covered in the ErrorHandling dimension (TS3). Schema file placement is a file organization concern, but schema design and inference patterns belong to TS3.

## Sources

- TypeScript Handbook — `import type`, `verbatimModuleSyntax` documentation
- ESLint `import/order` plugin — import grouping and sorting rules
- TypeScript community conventions — naming patterns, file organization practices
- Steve Kinney, *Frontend Masters TypeScript* — project structure and naming guidance
