# Type System -- Svelte

> The type system dimension covers TypeScript integration patterns specific to Svelte 5 -- generic components, HTML attribute inheritance, prop typing conventions, and class method signatures.

## Mental Model

Svelte 5 has first-class TypeScript support that goes beyond simple prop typing. The type system serves four roles in Svelte development: defining component APIs (prop interfaces), enabling generic reuse (type parameters on components), inheriting native HTML semantics (extending HTML*Attributes), and ensuring correct class-based state patterns (arrow methods for stable `this` binding).

The foundation is the `$props<T>()` rune, which accepts a TypeScript interface as its type parameter. This interface becomes the component's public API contract -- it defines what consumers can pass and what the component expects. The convention is to define a `Props` interface (or a more descriptive name) directly in the component's script block, using destructuring with defaults for optional props. This replaces Svelte 4's scattered `export let` declarations with a single, readable interface.

Generic components take this further. The `generics` attribute on `<script lang="ts">` introduces type parameters that flow through the entire component -- from props to snippet parameters to event payloads. This is essential for reusable collection components (lists, tables, grids, select dropdowns) where the item type should be inferred from usage rather than hardcoded or cast to `any`. The generic parameter declared in the script tag is available in the Props interface, snippet types, and all TypeScript expressions within the component.

HTML attribute inheritance solves the "wrapper component" problem. When you build a `<Button>` that wraps a `<button>`, consumers expect to pass any valid button attribute (disabled, type, aria-label, etc.). Rather than manually listing every possible attribute, extending `HTMLButtonAttributes` from `svelte/elements` gives the component all native attributes automatically, with the rest-spread pattern (`...attrs`) forwarding them to the underlying element.

For class-based state (used with `$state` fields in `.svelte.ts` files), arrow function syntax for methods is critical. Regular methods lose their `this` binding when passed as callbacks (e.g., as event handlers or to `setTimeout`). Arrow methods are bound at construction time, ensuring `this` always refers to the class instance regardless of call site.

## Consumer Guide

### When Reviewing Code

Check that every component has a `Props` interface passed to `$props<Props>()`. Verify that reusable collection components use the `generics` attribute rather than `any[]` for item types. For wrapper components around HTML elements, confirm that the Props interface extends the appropriate `HTML*Attributes` type from `svelte/elements` and that remaining attributes are spread onto the element. In state classes, verify that methods passed as callbacks use arrow syntax (`method = () => {}`) rather than regular method syntax (`method() {}`). Check that props are destructured with defaults in a single statement, not scattered across multiple lines.

### When Designing / Planning

Identify which components will be generic early in the design phase. Any component that renders a collection of items where the item type varies by usage site should use a generic type parameter. Plan wrapper components around the native element they wrap -- the Props interface should extend the corresponding HTML*Attributes type. For state classes, decide which methods will be passed as callbacks (event handlers, timer callbacks) and ensure they use arrow syntax.

### When Implementing

Define a `Props` interface above the `$props()` call. For generic components, add `generics="T"` (or `generics="T, U"` for multiple parameters) to the script tag, then use `T` in the Props interface and snippet types. For wrapper components, import the relevant type from `svelte/elements` (`HTMLButtonAttributes`, `HTMLInputAttributes`, `HTMLAnchorAttributes`, etc.), extend it in Props, and use rest-spread: `const { myProp, children, ...attrs } = $props<Props>()`. In state classes, use arrow function assignment for any method that might be detached from the class instance.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| GenericSnippets | HIGH | Use generics attribute for type-safe reusable components with typed snippets |
| HtmlAttributes | HIGH | Extend HTML*Attributes from svelte/elements for wrapper components |
| PropsDestructureType | HIGH | Destructure $props() with interface type and defaults in one statement |
| ArrowMethodsInClasses | MEDIUM | Use arrow functions for class methods that will be passed as callbacks |


---

### SV3.1 Use Generics for Type-Safe Reusable Components

**Impact: HIGH (enables full type inference for consumers)**

Use `generics` attribute on the script tag to create components that accept typed snippet parameters, preserving type safety across generic list/grid/table components.

**Incorrect: any[] loses type information**

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  interface Props {
    items: any[];
    row: Snippet<[any]>;
  }
  const { items, row } = $props<Props>();
</script>

{#each items as item}
  {@render row(item)}
{/each}
```

**Correct: generics preserve type inference**

```svelte
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  interface Props {
    items: T[];
    row: Snippet<[T]>;
  }
  const { items, row } = $props<Props>();
</script>

{#each items as item}
  {@render row(item)}
{/each}
```

---

### SV3.2 Extend HTMLAttributes for Wrapper Components

**Impact: HIGH (inherits all native element attributes automatically)**

When building wrapper components around HTML elements, extend the appropriate `HTML*Attributes` type from `svelte/elements` to accept all native attributes.

**Incorrect: manually listing native attributes**

```svelte
<script lang="ts">
  interface Props {
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
    type?: string;
    // Missing dozens of valid button attributes...
  }
  const { variant = 'primary', ...rest } = $props<Props>();
</script>

<button class={variant} {...rest}>
  <slot />
</button>
```

**Correct: extend HTMLButtonAttributes**

```svelte
<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary';
    children: Snippet;
  }
  const { variant = 'primary', children, ...attrs } = $props<Props>();
</script>

<button class={variant} {...attrs}>
  {@render children()}
</button>
```

---

### SV3.3 Destructure $props() with Named Interface

**Impact: MEDIUM (provides clear prop contracts and reusable types)**

Always define a named `Props` interface and use it with `$props<Props>()`. This creates a clear contract and makes the type reusable for parent components.

**Incorrect: inline or ad-hoc prop typing**

```svelte
<script lang="ts">
  const { title, count = 0 } = $props<{ title: string; count?: number }>();
</script>
```

**Correct: named Props interface**

```svelte
<script lang="ts">
  interface Props {
    title: string;
    count?: number;
  }

  const { title, count = 0 } = $props<Props>();
</script>
```

---

### SV3.4 Use Arrow Functions for Class Methods in $state

**Impact: MEDIUM (prevents this-binding bugs when passing methods as callbacks)**

When using classes with `$state` fields, use arrow functions for methods to ensure `this` is preserved when methods are passed as callbacks.

**Incorrect: regular method loses `this` as callback**

```typescript
// state.svelte.ts
class TodoState {
  todos = $state<string[]>([]);

  add(text: string) {
    this.todos.push(text); // `this` is undefined when called as callback
  }
}
```

**Correct: arrow function preserves `this`**

```typescript
// state.svelte.ts
class TodoState {
  todos = $state<string[]>([]);

  add = (text: string) => {
    this.todos.push(text); // Arrow function captures `this`
  };
}
```


## Rule Interactions

- **GenericSnippets + PropsDestructureType**: Generic type parameters declared in the script tag are used within the Props interface. Both rules apply simultaneously when building typed reusable components.
- **HtmlAttributes + PropsDestructureType**: Extending HTML*Attributes in the Props interface requires careful destructuring -- custom props are named explicitly, and native attributes use rest-spread.
- **ArrowMethodsInClasses + StateClasses (SV1)**: ArrowMethodsInClasses is a TypeScript concern that directly supports the StateClasses pattern from the Reactivity dimension. Class methods used as event handlers must be arrows.
- **GenericSnippets + SnippetsOverSlots (SV2)**: Generic snippets are the type-safe evolution of typed slots. The Architecture dimension establishes snippets as the pattern; this dimension ensures they carry generic type information.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **`any` in collection components**: Using `any[]` for items and `Snippet<[any]>` for row renderers in reusable list/table components. This silently discards all type information for every consumer, making type errors invisible until runtime. Use the `generics` attribute instead.

### HIGH

- **Manual attribute listing**: Manually declaring `disabled?: boolean; type?: string; class?: string` on a wrapper component instead of extending `HTML*Attributes`. This creates an incomplete API surface -- consumers cannot pass standard HTML attributes the author forgot to list, leading to frustration and workarounds.
- **Regular methods as callbacks in state classes**: Using `method() {}` syntax in a class with `$state` fields, then passing `instance.method` as an event handler. The method loses its `this` binding and either throws or silently operates on the wrong context.
- **Untyped $props()**: Calling `$props()` without a type parameter, resulting in `Record<string, any>` props. Every prop access is untyped, eliminating compile-time error detection.

### MEDIUM

- **Scattered prop declarations**: Defining props across multiple statements instead of a single interface + destructure. This reduces readability and makes the component's API harder to scan at a glance.
- **Overly complex generic constraints**: Using multiple generic parameters with complex `extends` constraints when a simpler type would suffice. Generics should make the component more usable, not less readable.

## Examples

**Generic data table with typed snippets:**

```svelte
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';

  interface Props {
    items: T[];
    columns: { key: keyof T; label: string }[];
    row: Snippet<[T]>;
    empty?: Snippet;
  }

  const { items, columns, row, empty } = $props<Props>();
</script>

<table>
  <thead>
    <tr>
      {#each columns as col}
        <th>{col.label}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each items as item}
      {@render row(item)}
    {:else}
      {#if empty}{@render empty()}{/if}
    {/each}
  </tbody>
</table>
```

**Wrapper component extending HTML attributes:**

```svelte
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  interface Props extends HTMLInputAttributes {
    label: string;
    error?: string;
  }

  const { label, error, ...attrs } = $props<Props>();
</script>

<label>
  <span>{label}</span>
  <input {...attrs} class:error={!!error} />
  {#if error}<span class="error-text">{error}</span>{/if}
</label>
```

**Arrow methods in a state class:**

```typescript
// counter.svelte.ts
class Counter {
  count = $state(0);
  doubled = $derived(this.count * 2);

  // Arrow: safe to pass as onclick handler
  increment = () => { this.count++; };
  decrement = () => { this.count--; };
  reset = () => { this.count = 0; };
}

export const counter = new Counter();
```

```svelte
<!-- Consumer: passing method directly as handler is safe -->
<button onclick={counter.increment}>+1</button>
<button onclick={counter.decrement}>-1</button>
<span>{counter.count} (doubled: {counter.doubled})</span>
```

## Does Not Cover

- **Reactive state primitives** ($state, $derived, $effect) -- see Reactivity dimension (SV1).
- **Component communication patterns** (snippets vs slots, context, callbacks) -- see Architecture dimension (SV2).
- **Server-side TypeScript** (load function types, form action types) -- see DataForms dimension (SV4).
- **Performance implications** of type choices -- see PerformanceSSR dimension (SV5).

## Sources

- Svelte 5 documentation: TypeScript, Generics, $props
- svelte/elements type definitions
- Svelte 5 migration guide: TypeScript changes
- Mainmatter: TypeScript patterns for Svelte 5
