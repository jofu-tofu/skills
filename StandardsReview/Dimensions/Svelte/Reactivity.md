# Reactivity -- Svelte

> The reactivity dimension covers Svelte 5's runes system -- the foundational primitives ($state, $derived, $effect) that replace Svelte 4's compiler magic with explicit, fine-grained reactivity.

Compatibility: Rune examples target Svelte 5; Svelte 4/legacy-mode syntax remains valid where supported. SvelteKit examples retain Kit 2 APIs unless a newer version is stated. Named interfaces, classes, callbacks, migration and layout conventions are conditional house policies, not automatic high-severity defects. Assess impact from the concrete contract. Shared mutable module examples are client-only demonstrations; create per-request/component instances for user-specific SSR state.

## Mental Model

Svelte 5 introduced runes as the core reactivity mechanism, offering explicit primitives alongside supported legacy components and stores. The mental model is a directed acyclic graph (DAG) of reactive dependencies: `$state` declares mutable leaf nodes, `$derived` declares computed nodes that auto-track their dependencies, and `$effect` is the escape hatch for side effects that bridge the reactive world to the imperative one (DOM mutations, network calls, timers).

The single most important principle in Svelte 5 reactivity is the hierarchy of primitives. `$derived` sits above `$effect` for any computation that produces a value. When you use `$effect` to compute a value and write it into a `$state` variable, you create a subscription-based synchronization loop -- the runtime must track the effect's dependencies, schedule the effect, run it, then propagate the state change, whereas `$derived` expresses the dependency directly and computes lazily when read. Evaluate severity from observable stale values, scheduling or update loops.

Effects are reserved for imperative side effects: starting a timer, subscribing to an external event source, manipulating the DOM directly, or sending analytics. When you do use `$effect`, the cleanup pattern is critical -- every resource acquired in an effect must be released in the returned cleanup function, because effects re-run when dependencies change and run cleanup before each re-execution, as well as on component destruction.

Shared state in Svelte 5 lives in `.svelte.ts` files, where runes are available outside component boundaries. Stores remain supported. A directly exported state binding must not be reassigned; a stable proxy object can be exported, or accessors/classes can expose mutable state. Classes with `$state` fields are the idiomatic pattern for complex state models because they co-locate state, computed values (via getters), and mutations in a single encapsulated unit.

## Consumer Guide

### When Reviewing Code

Look for the most common anti-pattern first: `$effect` blocks that write to `$state` variables with computed values. Pure synchronous derivations should normally use `$derived`; external subscription callbacks may legitimately update state. Check that all `$effect` blocks either perform genuine side effects (DOM manipulation, network calls, timers) or have a comment explaining why `$derived` is insufficient. Verify that every `$effect` creating subscriptions, timers, or event listeners returns a cleanup function. Watch for `$state` used for values that never change after initialization -- these should be plain `const` declarations. In shared state files (`.svelte.ts`), check whether exported state bindings are reassigned. Stores remain valid, including for streams and manual subscription control.

### When Designing / Planning

Structure reactive state as a DAG: identify the leaf state (`$state`), the computed state (`$derived`), and the side effects (`$effect`). For shared state that multiple components need, plan a `.svelte.ts` module with either accessor functions (for simple state) or a class (for state with multiple fields and operations). Decide early whether state is component-local or shared -- this determines file placement. When planning complex derived computations that iterate over arrays, consider `$derived.by(() => ...)` for the multi-statement computation form.

### When Implementing

Start with `$state` for mutable values and `$derived` for anything computed. Only reach for `$effect` when you need to perform a side effect. When writing `$effect`, always consider what needs cleanup and return a cleanup function. For complex computations that cannot be expressed as a single expression, use `$derived.by(() => { ... })`. When you need to read reactive values without creating a dependency (e.g., in a logging effect that should not re-trigger when the logged value changes), use `untrack()`; `$effect.tracking()` only reports whether tracking is active. Keep reactive dependency surfaces narrow -- read the required properties inside the tracked computation; ordinary destructuring outside it can capture a stale value.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| DerivedOverEffect | CRITICAL | Use $derived for pure derivations; effects may receive external state |
| EffectCleanup | CRITICAL | Return cleanup functions from $effect for timers, listeners, subscriptions |
| DerivedByForComplex | HIGH | Use $derived.by() for multi-statement derived computations |
| UntrackExplicit | HIGH | Use untrack() to read reactive values without creating dependencies |
| NoStateInEffect | CRITICAL | Avoid effect-driven synchronization when $derived expresses the value |
| NoStateForConstants | MEDIUM | Use plain const for values that never change -- $state adds unnecessary overhead |
| NarrowReactiveDeps | HIGH | Track needed properties inside $derived/$effect |
| RunesInSvelteTs | CRITICAL | Use runes in .svelte.ts files for shared reactive state |
| NoExportRawState | CRITICAL | Do not reassign directly exported state bindings; stable proxies are valid |
| StateClasses | HIGH | Use classes with $state fields for complex state models |
| RunesOverStores | MEDIUM | Prefer runes over svelte/store for all new Svelte 5 code |


---

### SV1.1 Use $derived Over $effect for Computations

**Impact: CRITICAL (prevents unnecessary subscriptions and potential infinite loops)**

Use `$derived` for pure computations instead of `$effect`. This is the most common Svelte 5 anti-pattern — using `$effect` to synchronize derived state creates extra subscriptions and risks infinite update loops.

**Incorrect: using $effect to sync derived state**

```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $state(0);

  // Anti-pattern: $effect for pure computation
  $effect(() => {
    doubled = count * 2;
  });
</script>

<p>{doubled}</p>
```

**Correct: $derived for pure computations**

```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>

<p>{doubled}</p>
```

---

### SV1.2 Return Cleanup Functions from $effect

**Impact: CRITICAL (prevents memory leaks from subscriptions, timers, event listeners)**

Always return a cleanup function from `$effect` when the effect creates subscriptions, timers, or event listeners. Without cleanup, these leak on component destroy or when dependencies change.

**Incorrect: no cleanup — timer leaks on component destroy**

```svelte
<script lang="ts">
  let elapsed = $state(0);

  $effect(() => {
    const timer = setInterval(() => {
      elapsed += 1;
    }, 1000);
    // Missing cleanup!
  });
</script>
```

**Correct: cleanup function prevents leak**

```svelte
<script lang="ts">
  let elapsed = $state(0);

  $effect(() => {
    const timer = setInterval(() => {
      elapsed += 1;
    }, 1000);
    return () => clearInterval(timer);
  });
</script>
```

---

### SV1.3 Use $derived.by for Multi-Line Derivations

**Impact: HIGH (improves readability of complex derived computations)**

Use `$derived.by(() => {...})` when derived values need intermediate variables or complex logic that doesn't fit in a single expression.

**Incorrect: long unreadable $derived expression**

```svelte
<script lang="ts">
  let items = $state<Item[]>([]);
  let search = $state('');

  // Hard to read — filter + sort + slice in one expression
  let results = $derived(items.filter(i => i.name.includes(search)).sort((a, b) => a.date - b.date).slice(0, 10));
</script>
```

**Correct: $derived.by with intermediate variables**

```svelte
<script lang="ts">
  let items = $state<Item[]>([]);
  let search = $state('');

  let results = $derived.by(() => {
    const filtered = items.filter(i => i.name.includes(search));
    const sorted = filtered.sort((a, b) => a.date - b.date);
    return sorted.slice(0, 10);
  });
</script>
```

---

### SV1.4 Use untrack() to Exclude Dependencies

**Impact: HIGH (prevents infinite loops from accidental dependency tracking)**

Use `untrack()` when you intentionally want to read a reactive variable inside `$effect` without subscribing to it. This prevents infinite loops where an effect modifies a value it also reads.

**Incorrect: infinite loop — effect tracks what it modifies**

```svelte
<script lang="ts">
  import { untrack } from 'svelte';

  let count = $state(0);
  let renderCount = $state(0);

  $effect(() => {
    console.log(count);
    renderCount++; // Tracked! Triggers re-run → infinite loop
  });
</script>
```

**Correct: untrack prevents subscription**

```svelte
<script lang="ts">
  import { untrack } from 'svelte';

  let count = $state(0);
  let renderCount = $state(0);

  $effect(() => {
    console.log(count);
    untrack(() => { renderCount++; }); // Not tracked
  });
</script>
```

---

### SV1.5 Don't Set $state in $effect When $derived Works

**Impact: HIGH (eliminates unnecessary reactive overhead)**

Effects are for side effects, including subscribing to external systems whose callbacks update state. If an `$effect` sets a `$state` variable based on other state, it should almost always be `$derived` instead.

**Incorrect: $effect setting $state — should be $derived**

```svelte
<script lang="ts">
  let items = $state<string[]>([]);
  let count = $state(0);

  $effect(() => {
    count = items.length; // Synchronizing state — use $derived
  });
</script>
```

**Correct: $derived for computed values**

```svelte
<script lang="ts">
  let items = $state<string[]>([]);
  let count = $derived(items.length);
</script>
```

---

### SV1.6 Don't Wrap Constants in $state

**Impact: MEDIUM (reduces unnecessary reactive overhead)**

Immutable values need no reactive tracking. Prefer plain constants for clarity; compiler optimization and value type determine any actual overhead.

**Incorrect: constant wrapped in $state**

```svelte
<script lang="ts">
  let API_BASE = $state('https://api.example.com');
  let MAX_RETRIES = $state(3);
</script>
```

**Correct: plain const for immutable values**

```svelte
<script lang="ts">
  const API_BASE = 'https://api.example.com';
  const MAX_RETRIES = 3;
</script>
```

---

### SV1.7 Narrow Reactive Dependencies with $derived

**Impact: HIGH when unnecessary tracked work is demonstrated**

Dependencies follow synchronous reactive reads, including reads in called functions. Reading `user.email` already tracks that property; merely passing an object does not subscribe to all its properties. Helpers that traverse it may broaden tracking.

**Correct: direct property tracking**

```svelte
<script lang="ts">
  let user = $state({ name: 'Alice', email: 'a@b.com', age: 30 });
  $effect(() => {
    sendAnalytics(user.email);
  });
</script>
```

A `$derived(user.email)` intermediate is also valid, but is not required to isolate this read. Avoid ordinary one-time destructuring when later updates must be observed.


---

### SV1.8 Use Runes in .svelte.ts for Shared State

**Impact: MEDIUM (optional runes-first organization policy)**

Use runes (`$state`, `$derived`) in `.svelte.ts` files for shared reactive state. Use `.svelte.js` for JavaScript. Stores are also valid; performance depends on the workload. Do not put per-request user data in a server module singleton.

**Valid alternative: store contract**

```typescript
// stores.ts
import { writable, derived } from 'svelte/store';

export const user = writable<User | null>(null);
export const isLoggedIn = derived(user, $u => $u !== null);
```

**Correct: runes in .svelte.ts**

```typescript
// appState.svelte.ts
let user = $state<User | null>(null);

export function getUser() { return user; }
export function setUser(u: User | null) { user = u; }
export function isLoggedIn() { return user !== null; }
```

---

### SV1.9 Do Not Reassign Directly Exported $state Bindings

**Impact: HIGH (module compiler constraint)**

**Incorrect: exported binding is reassigned**

```typescript
// state.svelte.ts
export let count = $state(0);
export function increment() { count++; } // Exported state is reassigned
```

**Correct: stable exported proxy**

```typescript
// state.svelte.ts
export const counter = $state({ count: 0 });
export function increment() { counter.count++; }
```

**Also correct: accessors for reassigned state**

```typescript
let count = $state(0);
export function getCount() { return count; }
export function increment() { count++; }
```

Classes with `$state` fields are another option. Shared module instances must not hold per-user server state; use request/component-scoped instances for SSR.


---

### SV1.10 Use Classes for Complex State Models

**Impact: HIGH (encapsulates state, methods, and computed properties together)**

For state with multiple operations and computed values, use a class with `$state` fields. This keeps related logic together and provides a clean API.

**Valid alternative: accessors (class preference applies only by house policy)**

```typescript
// state.svelte.ts
let todos = $state<Todo[]>([]);
let filter = $state<'all' | 'active' | 'done'>('all');

export function getTodos() { return todos; }
export function getFilter() { return filter; }
export function addTodo(text: string) { todos.push({ text, done: false }); }
export function toggleTodo(i: number) { todos[i].done = !todos[i].done; }
export function getFiltered() {
  if (filter === 'all') return todos;
  return todos.filter(t => filter === 'done' ? t.done : !t.done);
}
```

**Correct: class encapsulates everything**

```typescript
// state.svelte.ts
class TodoState {
  todos = $state<Todo[]>([]);
  filter = $state<'all' | 'active' | 'done'>('all');

  get filtered() {
    if (this.filter === 'all') return this.todos;
    return this.todos.filter(t =>
      this.filter === 'done' ? t.done : !t.done
    );
  }

  add = (text: string) => {
    this.todos.push({ text, done: false });
  };

  toggle = (i: number) => {
    this.todos[i].done = !this.todos[i].done;
  };
}

export const todoState = new TodoState();
```

---

### SV1.11 Prefer Runes Over Stores for New Code

**Impact: MEDIUM (simplifies reactive patterns and reduces boilerplate)**

For new Svelte 5 code, prefer runes (`$state`, `$derived`) over stores (`writable`, `derived`). This is a house preference; stores also suit asynchronous streams and explicit subscription control in new code.

**Valid alternative: stores (outside the runes-first house preference)**

```typescript
// new-feature.ts
import { writable, derived } from 'svelte/store';

export const count = writable(0);
export const doubled = derived(count, $c => $c * 2);
```

**Correct: runes in .svelte.ts for new code**

```typescript
// new-feature.svelte.ts
let count = $state(0);
let doubled = $derived(count * 2);

export function getCount() { return count; }
export function increment() { count++; }
export function getDoubled() { return doubled; }
```

**When stores are still appropriate:**
- Legacy Svelte 4 components not yet migrated
- Third-party libraries requiring store contracts
- Interop with non-Svelte code expecting subscribe/set interface


## Rule Interactions

- **DerivedOverEffect + NoStateInEffect**: Both address the same anti-pattern from different angles. DerivedOverEffect catches the computed-value case; NoStateInEffect discourages redundant effect-driven synchronization, not every state write or local declaration.
- **RunesInSvelteTs + NoExportRawState + StateClasses**: These three form a progression for shared state. RunesInSvelteTs establishes the file convention, NoExportRawState enforces the export constraint, and StateClasses provides the idiomatic pattern for complex cases.
- **NarrowReactiveDeps + UntrackExplicit**: Both control dependency tracking scope. NarrowReactiveDeps limits tracked property reads; UntrackExplicit removes them entirely for specific reads.
- **RunesOverStores + RunesInSvelteTs**: RunesOverStores is an optional new-code policy; RunesInSvelteTs is the implementation pattern. Together they define the path from Svelte 4 stores to Svelte 5 shared state.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Effect-driven computation**: Using `$effect` to write computed values into `$state`. Creates unnecessary subscription overhead, risks infinite loops, and obscures the reactive dependency graph. Prefer `$derived` for pure synchronous computations; external subscription updates are legitimate.
- **Missing effect cleanup**: An `$effect` that creates a timer, event listener, or subscription without returning a cleanup function. Causes memory leaks that compound on each dependency change and component remount.
- **Raw state export**: Reassigning a directly exported `$state` binding. Stable exported proxy objects are valid.

### HIGH

- **Overly broad reactive dependencies**: Reading unnecessary reactive properties during an expensive computation. Determine actual reads; an object reference alone does not track every field.
- **Scattered accessor functions**: A `.svelte.ts` file with many individual `$state` variables and corresponding getter/setter pairs. Refactor to a class for cohesion.

### MEDIUM

- **$state for constants**: Using `$state` for a value assigned once and never mutated. Can mislead readers about mutability; primitives are not object proxies and overhead must be measured.
- **Reaching for stores in new code**: Using `writable`/`derived` from `svelte/store` when building new features in a Svelte 5 codebase. This is only a runes-first house-policy concern; stores remain valid for new asynchronous and subscription-based code.

## Examples

**Reactive state class replacing stores:**

```typescript
// Svelte 4 (stores)
import { writable, derived } from 'svelte/store';
export const count = writable(0);
export const doubled = derived(count, $c => $c * 2);

// Svelte 5 (runes in .svelte.ts)
class Counter {
  count = $state(0);
  doubled = $derived(this.count * 2);

  increment = () => { this.count++; };
  reset = () => { this.count = 0; };
}
export const counter = new Counter();
```

**Effect with proper cleanup:**

```svelte
<script lang="ts">
  let { url }: { url: string } = $props();
  let data = $state<unknown>(null);

  $effect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then(r => r.json())
      .then(d => { data = d; })
      .catch(() => {});
    return () => controller.abort();
  });
</script>
```

**Narrow dependency tracking:**

```svelte
<script lang="ts">
  let settings = $state({ theme: 'dark', fontSize: 14, locale: 'en' });

  // Correct: tracks settings.theme, not unrelated fields
  let themeClass = $derived(settings.theme === 'dark' ? 'dark-mode' : 'light-mode');

  // Also valid: reactive destructuring of a derived object
  let { theme } = $derived({ theme: settings.theme });
</script>
```

## Does Not Cover

- **Component architecture** (props, snippets, context) -- see Architecture dimension (SV2).
- **TypeScript type definitions** for props and snippets -- see TypeSystem dimension (SV3).
- **SvelteKit data loading** patterns -- see DataForms dimension (SV4).
- **SSR hydration** issues with non-deterministic values -- see PerformanceSSR dimension (SV5).
- **Event handling syntax** (onclick vs on:click) -- see PerformanceSSR dimension (SV5).

## Sources

- Svelte 5 documentation: Runes (https://svelte.dev/docs/svelte/$state, $derived, $effect)
- Svelte 5 migration guide
- Joy of Code: Svelte 5 runes deep dive
- Captain Codeman: Svelte 5 state management patterns

### Primary verification sources

- https://svelte.dev/docs/svelte/typescript
- https://svelte.dev/docs/svelte/$props
- https://svelte.dev/docs/svelte/$effect
- https://svelte.dev/docs/svelte/$derived
- https://svelte.dev/docs/svelte/$state
- https://svelte.dev/docs/svelte/stores
- https://svelte.dev/docs/kit/state-management
