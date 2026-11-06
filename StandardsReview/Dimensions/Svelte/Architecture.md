# Architecture -- Svelte

> The architecture dimension covers component design patterns and SvelteKit application structure -- how components communicate, how routes are organized, and how server-side infrastructure is configured.

Compatibility: Rune examples target Svelte 5; Svelte 4/legacy-mode syntax remains valid where supported. SvelteKit examples retain Kit 2 APIs unless a newer version is stated. Named interfaces, classes, callbacks, migration and layout conventions are conditional house policies, not automatic high-severity defects. Assess impact from the concrete contract. Shared mutable module examples are client-only demonstrations; create per-request/component instances for user-specific SSR state.

## Mental Model

Svelte 5 component architecture is built on three communication primitives: props (parent-to-child data flow via `$props()`), snippets (parent-to-child template delegation via `{#snippet}` and `{@render}`), and context (ancestor-to-descendant dependency injection via `setContext`/`getContext`). Each serves a distinct purpose, and misusing one where another belongs creates coupling, reduces type safety, or breaks composability.

Props are the primary interface. In Svelte 5, `$props()` with a TypeScript interface replaces Svelte 4's `export let` declarations, providing full type safety with default values via destructuring. Avoid mutating parent-owned objects without an agreed ownership contract. Prefer callback props for complex interfaces under this house policy; intentional bindable APIs remain supported. This makes data flow explicit and unidirectional, which is critical for debugging and testing.

Snippets are preferred for new runes-mode components; legacy slots remain supported in Svelte 5 mixed-mode applications. Where slots were template placeholders with limited type safety, snippets are first-class values -- they can be typed with `Snippet<[ParamTypes]>`, passed as props, conditionally rendered, and composed. The `children` snippet is the implicit default (equivalent to the old default slot), and named snippets replace named slots with full type inference.

Context provides dependency injection for cross-cutting concerns (themes, auth, i18n) without prop drilling. The key rule is type safety: use a typed wrapper around `setContext`/`getContext` with a unique symbol key to prevent key collisions and ensure consumers get the correct type.

At the SvelteKit level, architecture decisions center on route organization (route groups for layout segmentation), data sharing (layout load functions for shared data), server hooks (centralized middleware for auth, logging, CORS), and environment variable safety (using `$env/static/private` vs `$env/static/public` to prevent secret leakage).

## Consumer Guide

### When Reviewing Code

For new runes-mode components, prefer typed `$props()`; typed `export let` remains valid in legacy components. Check that no component directly mutates a prop value -- mutations should flow through callback props. Look for `<slot>` or `<slot name="...">` syntax, which should be migrated only when moving that component to the snippet API. For context usage, verify that `setContext`/`getContext` calls use typed wrapper functions with collision-controlled keys; symbols are the preferred house convention. In SvelteKit routes, check that data shared across sibling routes is loaded in `+layout.server.ts` rather than duplicated in each `+page.server.ts`. Verify that `hooks.server.ts` handles cross-cutting concerns (auth checks, request logging) rather than repeating them in individual load functions. Check that `$env/static/private` is never imported in client-side code.

### When Designing / Planning

Map out the component tree and identify communication patterns: which data flows down (props), which templates are delegated (snippets), which concerns are shared across deep subtrees (context). Plan route groups early -- they determine layout nesting and are expensive to restructure later. Identify shared data (user session, app config) that should live in layout load functions. Plan server hooks for middleware concerns (auth guards, rate limiting) rather than implementing them per-route.

### When Implementing

Define props with an interface and `$props()`, providing defaults via destructuring. For child-to-parent communication, accept callback functions as props (`onchange`, `onselect`) as a project preference for complex interfaces; intentional `$bindable` and `bind:this` remain valid. When migrating a component API to snippets: define with `{#snippet name(params)}`, accept with `Snippet<[Types]>` in the props interface, render with `{@render name(args)}`. For context, create a typed module with `setMyContext` and `getMyContext` functions wrapping the raw API. In SvelteKit, use `(groupName)` directories to segment layouts, place shared data fetching in `+layout.server.ts`, and centralize auth/logging in `hooks.server.ts`. Use the private/public environment APIs appropriate to the pinned Kit version; choose static versus dynamic values deliberately.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| SnippetsOverSlots | HIGH | Use {#snippet} and {@render} instead of slots for type-safe template delegation |
| TypedProps | HIGH | Type props with $props() and a TypeScript interface |
| TypeSafeContext | HIGH | Wrap setContext/getContext in typed functions with symbol keys |
| NoMutateProps | HIGH | Avoid unowned prop mutation; prefer callbacks for complex APIs |
| CallbacksOverBind | HIGH | Prefer callback props over bind: for explicit data flow |
| RouteGroups | MEDIUM | Use (groupName) directories to segment layouts without affecting URLs |
| LayoutDataForShared | MEDIUM | Load shared data in +layout.server.ts, not duplicated per page |
| ServerHooks | MEDIUM | Centralize auth, logging, and middleware in hooks.server.ts |
| EnvVarSafety | HIGH | Use $env/static/private for secrets; never import in client code |


---

### SV2.1 Use Snippets Instead of Slots

**Impact: HIGH (more readable, type-safe, and composable than slots)**

Svelte 5 replaces slots with snippets (`{#snippet}` + `{@render}`). Snippets are first-class values, fully typed, and can be passed as props.

**Legacy alternative: Svelte 4 slot API, still supported in Svelte 5**

```svelte
<!-- Parent -->
<Card>
  <span slot="header">Title</span>
  <p>Body content</p>
</Card>

<!-- Card.svelte -->
<div class="card">
  <slot name="header" />
  <slot />
</div>
```

**Correct: Svelte 5 snippets — typed and composable**

```svelte
<!-- Parent -->
<Card>
  {#snippet header()}
    <span>Title</span>
  {/snippet}
  <p>Body content</p>
</Card>

<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  interface Props { header?: Snippet; children: Snippet; }
  let { header, children }: Props = $props();
</script>

<div class="card">
  {#if header}{@render header()}{/if}
  {@render children()}
</div>
```

---

### SV2.2 Type Props with $props() and Interface

**Impact: HIGH (replaces export let with type-safe prop destructuring)**

Use `$props()` with a TypeScript interface to declare component props. This replaces Svelte 4's `export let` pattern with full type safety and default values.

**Legacy alternative: typed export let, valid outside runes mode**

```svelte
<script lang="ts">
  export let title: string;
  export let count: number = 0;
  export let variant: 'primary' | 'secondary' = 'primary';
</script>
```

**Correct: Svelte 5 $props() with interface**

```svelte
<script lang="ts">
  interface Props {
    title: string;
    count?: number;
    variant?: 'primary' | 'secondary';
  }

  let { title, count = 0, variant = 'primary' }: Props = $props();
</script>
```

---

### SV2.3 Use Symbol Keys and Typed Helpers for Context

**Impact: HIGH (prevents key collisions and provides type safety)**

Prefer unique symbols and typed wrappers as a house policy. Controlled string keys with typed consumers are valid. Svelte 5.40+ also provides `createContext<T>()`; retain wrappers on older versions.

**Incorrect: string key — no type safety, collision risk**

```svelte
<script lang="ts">
  import { setContext } from 'svelte';

  setContext('modal', { open: false, toggle: () => {} });
</script>

<!-- Consumer has no type info -->
<script lang="ts">
  import { getContext } from 'svelte';

  const modal = getContext('modal'); // any
</script>
```

**Correct: Symbol key with typed helpers**

```typescript
// context.ts
  import { setContext, getContext } from 'svelte';

  interface ModalContext { open: boolean; toggle: () => void; }

  const KEY = Symbol('modal');

  export function setModalContext(ctx: ModalContext) {
    setContext(KEY, ctx);
  }

  export function getModalContext(): ModalContext {
    return getContext<ModalContext>(KEY);
  }
```

---

### SV2.4 Never Mutate Prop Objects Directly

**Impact: HIGH (prevents unexpected parent state mutations)**

Mutating a shared prop object can change parent-owned data; reactive proxies may also trigger an ownership warning. Prefer callbacks unless the interface intentionally grants mutation/binding rights. Ordinary object mutation is not automatically reactive.

**Incorrect: mutating prop object directly**

```svelte
<script lang="ts">
  interface Props { user: { name: string; age: number }; }
  let { user }: Props = $props();

  function incrementAge() {
    user.age++; // Mutates parent's data!
  }
</script>
```

**Correct: emit callback to parent**

```svelte
<script lang="ts">
  interface Props {
    user: { name: string; age: number };
    onchange?: (user: { name: string; age: number }) => void;
  }
  let { user, onchange }: Props = $props();

  function incrementAge() {
    onchange?.({ ...user, age: user.age + 1 });
  }
</script>
```

---

### SV2.5 Prefer Callbacks Over Excessive $bindable

**Impact: MEDIUM (makes data flow explicit and traceable)**

Two-way binding with `$bindable` is convenient but obscures data flow. Prefer explicit callbacks for complex components — save `bind:` for simple form inputs.

**House-policy alternative: binding is valid, callbacks may be preferred**

```svelte
<!-- Counter.svelte -->
<script lang="ts">
  interface Props { count: number; }
  let { count = $bindable(0) }: Props = $props();
</script>

<button onclick={() => count++}>{count}</button>

<!-- Parent: implicit two-way sync -->
<Counter bind:count />
```

**Correct: explicit callback — data flow is visible**

```svelte
<!-- Counter.svelte -->
<script lang="ts">
  interface Props { count: number; onchange?: (n: number) => void; }
  let { count, onchange }: Props = $props();
</script>

<button onclick={() => onchange?.(count + 1)}>{count}</button>

<!-- Parent: explicit one-way + callback -->
<Counter {count} onchange={(v) => count = v} />
```

---

### SV2.6 Use Route Groups for Layout Organization

**Impact: MEDIUM (organizes routes that share layouts without affecting URLs)**

Use route groups `(groupName)` to organize routes that share a layout or need to break out of a parent layout. Groups don't affect the URL path.

**Incorrect: duplicating layout logic across routes**

```
routes/
  login/+page.svelte     ← No shared auth layout
  register/+page.svelte  ← Duplicates auth layout
  dashboard/+page.svelte ← Different layout entirely
```

**Correct: route groups share layouts**

```
routes/
  (auth)/
    +layout.svelte       ← Shared auth layout (centered card)
    login/+page.svelte
    register/+page.svelte
  (app)/
    +layout.svelte       ← Shared app layout (sidebar + nav)
    dashboard/+page.svelte
    settings/+page.svelte
```

---

### SV2.7 Use Layout Load for Shared Data

**Impact: HIGH (eliminates duplicated data fetching across routes)**

Use `+layout.server.ts` for data shared across child routes (user session, theme, locale). Its data is inherited by child pages, but the load can rerun on dependency changes or invalidation. It is not an authorization gate for every child request.

**Incorrect: every page fetches user data**

```typescript
// routes/dashboard/+page.server.ts
export async function load({ locals }) {
  const user = await getUser(locals.userId);
  const dashData = await getDashboard();
  return { user, dashData };
}

// routes/settings/+page.server.ts
export async function load({ locals }) {
  const user = await getUser(locals.userId); // Duplicated!
  const settings = await getSettings();
  return { user, settings };
}
```

**Correct: layout owns shared data**

```typescript
// routes/(app)/+layout.server.ts
export async function load({ locals }) {
  return { user: await getUser(locals.userId) };
}

// routes/(app)/dashboard/+page.server.ts
export async function load() {
  return { dashData: await getDashboard() };
  // user is inherited from layout
}
```

---

### SV2.8 Use hooks.server.ts for Cross-Cutting Concerns

**Impact: HIGH (centralizes auth, logging, and request processing)**

Use `hooks.server.ts` for shared authentication and request context. Keep resource-specific authorization at each protected load/action/endpoint. Route groups do not add URL prefixes, so guards must match actual protected routes.

**Valid but duplicated authentication: consider a shared helper or hook**

```typescript
// routes/dashboard/+page.server.ts
export async function load({ cookies }) {
  const session = cookies.get('session');
  if (!session) throw redirect(303, '/login');
  const user = await validateSession(session);
  // ... page-specific logic
}

// routes/settings/+page.server.ts
export async function load({ cookies }) {
  const session = cookies.get('session'); // Duplicated!
  if (!session) throw redirect(303, '/login');
  const user = await validateSession(session);
  // ... page-specific logic
}
```

**Correct: centralized in hooks.server.ts**

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const session = event.cookies.get('session');

  if (session) {
    event.locals.user = await validateSession(session);
  }

  if ((event.url.pathname === '/dashboard' || event.url.pathname.startsWith('/dashboard/') || event.url.pathname === '/settings' || event.url.pathname.startsWith('/settings/')) && !event.locals.user) {
    throw redirect(303, '/login');
  }

  return resolve(event);
};
```

---

### SV2.9 Use Correct $env Module for Server vs Client

**Impact: HIGH (prevents secret leakage through incorrect env imports)**

Use `$env/static/private` for server-only secrets and `$env/static/public` for client-safe values. SvelteKit enforces this at build time — importing private env in client code is a build error.

**Incorrect: using public env for secrets**

```typescript
// +page.svelte — client code!
import { PUBLIC_DATABASE_URL } from '$env/static/public'; // Misclassified public secret (Kit 2 default prefix)
```

**Correct: private env in server files only**

```typescript
// +page.server.ts — server only
import { DATABASE_URL, API_SECRET } from '$env/static/private';

// +page.svelte — client-safe public env only
import { PUBLIC_APP_NAME } from '$env/static/public';
```

**The rule:** Keep secrets server-only and never return them in load/action data. These examples target SvelteKit 2: `$env/static/private` is build-time, `$env/dynamic/private` is valid for runtime values. Public names use the configured prefix (default `PUBLIC_`). SvelteKit 3 deprecates these modules in favor of explicitly declared `$app/env/private` and `$app/env/public`; migrate only with the project version.


## Rule Interactions

- **TypedProps + SnippetsOverSlots**: Snippets are declared as part of the props interface using the `Snippet` type. These two rules work together to define a fully typed component API surface.
- **NoMutateProps + CallbacksOverBind**: Both express an ownership policy. Callbacks are preferred for complex APIs; intentional bindable state is an accepted alternative.
- **TypeSafeContext + TypedProps**: Context is the escape hatch when prop drilling becomes excessive. Type safety must be maintained in both paths.
- **LayoutDataForShared + ServerHooks**: Both address concerns that span multiple routes. Layout data handles shared fetching; hooks handle shared middleware. Together they prevent per-route duplication.
- **EnvVarSafety + ServerHooks**: Server hooks run exclusively on the server and are a natural place to use private env vars for auth token validation or API key checks.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Secret leakage via public env**: Marking a secret public or returning it to clients can leak it. Importing a protected private module into the client graph is normally rejected by SvelteKit; report a build-boundary violation, not inevitable leakage.
- **Mutating parent state via prop reference**: Directly modifying an object or array prop passed from a parent, creating invisible upward data flow that breaks unidirectional patterns and causes debugging nightmares.

### HIGH

- **Slot usage in Svelte 5**: Only flag legacy slots when an explicit component migration policy applies. They remain supported; existing typed legacy APIs are not inherently defective.
- **Untyped context**: Missing useful context types or colliding keys can break contracts. A typed, controlled string key is valid; symbols do not themselves guarantee a provider exists.
- **bind: for child-to-parent communication**: Excessive binding may violate a documented complex-component policy. Intentional `$bindable` APIs and `bind:this` element/component references are valid.

### MEDIUM

- **Duplicated load data across routes**: Multiple `+page.server.ts` files fetching the same user/session data instead of sharing it via `+layout.server.ts`. Increases latency and creates inconsistency risk.
- **Missing route groups**: Multiple pages needing different layouts stuffed under the same route directory, forcing conditional layout logic instead of clean group separation.
- **Per-route auth checks**: Missing required authorization on a protected operation. Centralized authentication and operation-specific checks can both be necessary; per-route checks are not themselves defects.

## Examples

**Typed snippets replacing slots:**

```svelte
<!-- DataTable.svelte -->
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';

  interface Props {
    items: T[];
    header: Snippet;
    row: Snippet<[T]>;
    empty?: Snippet;
  }

  let { items, header, row, empty }: Props = $props();
</script>

<table>
  <thead>{@render header()}</thead>
  <tbody>
    {#each items as item}
      {@render row(item)}
    {:else}
      {#if empty}{@render empty()}{/if}
    {/each}
  </tbody>
</table>
```

**Type-safe context pattern:**

```typescript
// context.ts
import { setContext, getContext } from 'svelte';

interface ThemeContext {
  mode: 'light' | 'dark';
  primary: string;
}

const THEME_KEY = Symbol('theme');

export function setThemeContext(theme: ThemeContext) {
  setContext(THEME_KEY, theme);
}

export function getThemeContext(): ThemeContext {
  return getContext<ThemeContext>(THEME_KEY);
}
```

**Callback props for upward communication:**

```svelte
<!-- Parent -->
<ColorPicker color={selectedColor} onchange={(c) => selectedColor = c} />

<!-- ColorPicker.svelte -->
<script lang="ts">
  interface Props {
    color: string;
    onchange: (color: string) => void;
  }
  let { color, onchange }: Props = $props();
</script>

<input type="color" value={color} oninput={(e) => onchange(e.currentTarget.value)} />
```

## Does Not Cover

- **Reactive state management** ($state, $derived, $effect, shared state) -- see Reactivity dimension (SV1).
- **TypeScript generics** for reusable components -- see TypeSystem dimension (SV3).
- **Data loading patterns** (server load, parallel fetching, form actions) -- see DataForms dimension (SV4).
- **Performance optimization** (dynamic imports, event delegation) -- see PerformanceSSR dimension (SV5).
- **Error handling** ($error pages, error boundaries) -- see PerformanceSSR dimension (SV5).

## Sources

- Svelte 5 documentation: Components, Snippets, Context API
- SvelteKit documentation: Routing, Hooks, Modules
- Svelte 5 migration guide: Slots to Snippets, export let to $props
- Frontend Masters: Svelte 5 component patterns

### Primary verification sources

- https://svelte.dev/docs/svelte/typescript
- https://svelte.dev/docs/svelte/$props
- https://svelte.dev/docs/svelte/context
- https://svelte.dev/docs/svelte/legacy-export-let
- https://svelte.dev/docs/svelte/legacy-slots
- https://svelte.dev/docs/svelte/$bindable
- https://svelte.dev/docs/kit/load#Implications-for-authentication
- https://svelte.dev/docs/kit/advanced-routing#Advanced-layouts
- https://svelte.dev/docs/kit/server-only-modules
- https://svelte.dev/docs/kit/migrating-to-sveltekit-3
- https://svelte.dev/tutorial/kit/env-private
