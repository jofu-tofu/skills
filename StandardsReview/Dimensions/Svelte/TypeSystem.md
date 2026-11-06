# Type System -- Svelte

> The type system dimension covers TypeScript integration patterns specific to Svelte 5 -- generic components, HTML attribute inheritance, prop typing conventions, and class method signatures.

Compatibility: Rune examples target Svelte 5; Svelte 4/legacy-mode syntax remains valid where supported. SvelteKit examples retain Kit 2 APIs unless a newer version is stated. Named interfaces, classes, callbacks, migration and layout conventions are conditional house policies, not automatic high-severity defects. Assess impact from the concrete contract. Shared mutable module examples are client-only demonstrations; create per-request/component instances for user-specific SSR state.

## Mental Model

Svelte 5 has first-class TypeScript support that goes beyond simple prop typing. The type system serves four roles in Svelte development: defining component APIs (prop interfaces), enabling generic reuse (type parameters on components), inheriting native HTML semantics (extending HTML*Attributes), and ensuring correct class-based state patterns (arrow methods for stable `this` binding).

The foundation is the `$props()` rune, whose destructured result is annotated with a TypeScript type. This interface becomes the component's public API contract -- it defines what consumers can pass and what the component expects. The convention is to define a `Props` interface (or a more descriptive name) directly in the component's script block, using destructuring with defaults for optional props. This replaces Svelte 4's scattered `export let` declarations with a single, readable interface.

Generic components take this further. The `generics` attribute on `<script lang="ts">` introduces type parameters that flow through the entire component -- from props to snippet parameters to event payloads. This is essential for reusable collection components (lists, tables, grids, select dropdowns) where the item type should be inferred from usage rather than hardcoded or cast to `any`. The generic parameter declared in the script tag is available in the Props interface, snippet types, and all TypeScript expressions within the component.

HTML attribute inheritance solves the "wrapper component" problem. When you build a `<Button>` that wraps a `<button>`, consumers expect to pass any valid button attribute (disabled, type, aria-label, etc.). Rather than manually listing every possible attribute, extending `HTMLButtonAttributes` from `svelte/elements` gives the component all native attributes automatically, with the rest-spread pattern (`...attrs`) forwarding them to the underlying element.

For class-based state (used with `$state` fields in `.svelte.ts` files), arrow fields are one way to preserve `this`. Unbound regular methods can lose their receiver when passed as callbacks (e.g., as event handlers or to `setTimeout`). Arrow methods are bound at construction time, ensuring `this` always refers to the class instance regardless of call site.

## Consumer Guide

### When Reviewing Code

Under the named-interface house policy, check that each component API has a `Props` interface annotating the `$props()` destructuring. Verify that reusable collection components use the `generics` attribute rather than `any[]` for item types. For wrapper components around HTML elements, confirm that the Props interface extends the appropriate `HTML*Attributes` type from `svelte/elements` and that remaining attributes are spread onto the element. In state classes, verify that methods passed as callbacks preserve the receiver with arrow fields, binding, or a wrapper. Check that props are destructured with defaults in a single statement, not scattered across multiple lines.

### When Designing / Planning

Identify which components will be generic early in the design phase. Any component that renders a collection of items where the item type varies by usage site should use a generic type parameter. Plan wrapper components around the native element they wrap -- the Props interface should extend the corresponding HTML*Attributes type. For state classes, decide which methods will be passed as callbacks (event handlers, timer callbacks) and preserve their receiver with arrows, explicit binding, or wrappers.

### When Implementing

Define a `Props` interface above the `$props()` call. For generic components, add `generics="T"` (or `generics="T, U"` for multiple parameters) to the script tag, then use `T` in the Props interface and snippet types. For wrapper components, import the relevant type from `svelte/elements` (`HTMLButtonAttributes`, `HTMLInputAttributes`, `HTMLAnchorAttributes`, etc.), extend it in Props, and use rest-spread: `let { myProp, children, ...attrs }: Props = $props()`. In state classes, use arrow function assignment for any method that might be detached from the class instance.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| GenericSnippets | HIGH | Use generics attribute for type-safe reusable components with typed snippets |
| HtmlAttributes | HIGH | Extend HTML*Attributes from svelte/elements for wrapper components |
| PropsDestructureType | Context-dependent | Destructure $props() with interface type and defaults in one statement |
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
  let { items, row }: Props = $props();
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
  let { items, row }: Props = $props();
</script>

{#each items as item}
  {@render row(item)}
{/each}
```

---

### SV3.2 Extend HTMLAttributes for Wrapper Components

**Impact: HIGH (inherits all native element attributes automatically)**

For wrappers promising the native element API, extend the appropriate `HTML*Attributes` type and forward accepted attributes. An intentionally narrower wrapper is valid; enforce its declared contract.

**Limited wrapper: does not promise the full native API**

```svelte
<script lang="ts">
  interface Props {
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    children?: import('svelte').Snippet;
    // This wrapper intentionally accepts only this subset.
  }
  let { variant = 'primary', children, ...rest }: Props = $props();
</script>

<button class={variant} {...rest}>
  {@render children?.()}
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
  let { variant = 'primary', children, ...attrs }: Props = $props();
</script>

<button class={variant} {...attrs}>
  {@render children()}
</button>
```

---

### SV3.3 Destructure $props() with Named Interface

**Impact: LOW policy preference (inline types and aliases remain valid)**

When the project adopts this readability policy, define a named `Props` interface and annotate the destructuring. Inline object types and type aliases are equally type-safe; naming alone does not export a type to parents.

**Valid alternative: inline typing (outside the named-interface house policy)**

```svelte
<script lang="ts">
  let { title, count = 0 }: { title: string; count?: number } = $props();
</script>
```

**Correct: named Props interface**

```svelte
<script lang="ts">
  interface Props {
    title: string;
    count?: number;
  }

  let { title, count = 0 }: Props = $props();
</script>
```

---

### SV3.4 Use Arrow Functions for Class Methods in $state

**Impact: MEDIUM (prevents this-binding bugs when passing methods as callbacks)**

When using classes with `$state` fields, use arrow functions for methods to ensure `this` is preserved when methods are passed as callbacks.

**Potential defect: regular method detached without binding**

```typescript
// state.svelte.ts
class TodoState {
  todos = $state<string[]>([]);

  add(text: string) {
    this.todos.push(text); // Needs the instance as receiver
  }
}
const state = new TodoState();
const detached = state.add;
detached('task'); // Receiver lost; state.add('task') is valid
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
- **ArrowMethodsInClasses + StateClasses (SV1)**: ArrowMethodsInClasses is a TypeScript concern that directly supports the StateClasses pattern from the Reactivity dimension. Detached methods must preserve `this`: use arrows, explicit binding, or a wrapper such as `() => instance.increment()`.
- **GenericSnippets + SnippetsOverSlots (SV2)**: Generic snippets are the type-safe evolution of typed slots. The Architecture dimension establishes snippets as the pattern; this dimension ensures they carry generic type information.

## Review prompts and severity calibration

The categories below group review prompts, not predetermined finding severities. First establish the applicable project/version contract, valid alternatives and concrete consequence. A style or design preference alone is LOW or omitted; HIGH/CRITICAL requires corresponding demonstrated harm.

### Check potentially consequential contract failures

- **`any` in collection components**: Using `any[]` for items and `Snippet<[any]>` for row renderers in reusable list/table components. This silently discards all type information for every consumer, making type errors invisible until runtime. Use the `generics` attribute instead.

### Check behavior and workload consequences

- **Manual attribute listing**: Rejecting or dropping native attributes that the wrapper promises to support. An explicit subset can be intentional; inherited attributes still need forwarding.
- **Regular methods as callbacks in state classes**: Using `method() {}` syntax in a class with `$state` fields, then passing `instance.method` as an event handler. The method loses its `this` binding and either throws or silently operates on the wrong context.
- **Untyped $props()**: Omitting a useful type annotation can leave props unchecked. Annotate the destructured result; `$props()` does not take a type argument.

### Check maintainability and explicit policy

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

  let { items, columns, row, empty }: Props = $props();
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

  let { label, error, ...attrs }: Props = $props();
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

### Primary verification sources

- https://svelte.dev/docs/svelte/typescript
- https://svelte.dev/docs/svelte/$props
- https://svelte.dev/docs/svelte/$state
