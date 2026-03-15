# Performance & SSR -- Svelte

> The performance and SSR dimension covers bundle optimization, event handling patterns, error recovery, and server-side rendering safety -- the concerns that determine whether a Svelte application is fast, resilient, and correctly hydrated.

## Mental Model

Performance in Svelte applications operates at two levels: build-time bundle optimization and runtime rendering efficiency. Unlike framework-heavy SPAs where the runtime itself is a performance bottleneck, Svelte compiles components to minimal imperative code, so the primary performance lever is what code gets shipped to the client in the first place. Dynamic imports are the primary tool here -- components that are not needed for initial render (modals, charts, rich text editors, admin panels) should be loaded on demand rather than included in the main bundle. This is especially impactful for SvelteKit applications where the initial page load determines Core Web Vitals scores.

Event handling in Svelte 5 moved from the `on:event` directive syntax to standard HTML event attributes (`onclick`, `onsubmit`, `oninput`). This is not just a cosmetic change -- the new syntax aligns with standard HTML, enables better tree-shaking, and works naturally with Svelte 5's event delegation system. Svelte 5 automatically delegates most events to the document root rather than attaching individual listeners per element, reducing memory usage in lists and repeated components. Understanding this delegation model is important because it means event handlers are already efficient by default, and manual event delegation patterns from other frameworks are unnecessary.

Server-side rendering (SSR) introduces a class of bugs that do not exist in client-only applications: hydration mismatches. When the server renders HTML and the client hydrates it, any difference between server-rendered content and client-initialized state causes a mismatch warning (or silent UI corruption in production). The most common cause is non-deterministic values -- `Date.now()`, `Math.random()`, `window.innerWidth`, or any browser-only API that either does not exist on the server or produces a different value. The fix is to initialize such values to a deterministic placeholder during SSR and set the real value after mount.

Error handling in SvelteKit distinguishes between expected errors (404 not found, 403 forbidden) and unexpected errors (database crash, null pointer). Expected errors use SvelteKit's `error()` helper, which sets the correct HTTP status code and renders the nearest `+error.svelte` page with structured error data. Unexpected errors are caught by SvelteKit's internal error handler and displayed generically to avoid leaking stack traces. At the component level, `<svelte:boundary>` provides error boundaries that catch rendering errors in child components and display fallback UI, preventing a single broken component from crashing the entire page.

## Consumer Guide

### When Reviewing Code

Check for top-level imports of heavy components that are conditionally rendered -- these should use dynamic imports. Verify that event handlers use Svelte 5's attribute syntax (`onclick`, `onsubmit`) rather than the deprecated `on:click` directive. Look for non-deterministic values (`Date.now()`, `Math.random()`, `crypto.randomUUID()`, browser APIs like `window`, `document`, `localStorage`) initialized at the top level of a component script -- these cause hydration mismatches and must be deferred to `onMount`. Check that load functions use `error()` from `@sveltejs/kit` for expected error conditions (not found, unauthorized) rather than throwing generic `Error` objects. Look for error-prone component subtrees (user-generated content rendering, third-party widgets) that lack `<svelte:boundary>` wrappers.

### When Designing / Planning

Identify which components are heavy (large libraries, complex visualizations) and which are conditionally shown -- these are candidates for dynamic imports. Plan error handling at two levels: route-level with `error()` and `+error.svelte` pages, and component-level with `<svelte:boundary>` for isolating failures. Identify any features that need non-deterministic values (timestamps, random IDs, viewport dimensions) and plan them as client-only initializations. Consider which pages are SSR-critical (landing pages, SEO content) versus client-only (dashboards, admin panels) to determine where SSR safety is most important.

### When Implementing

For dynamic imports, store the dynamically loaded component in a `$state` variable typed as `typeof import('./Component.svelte').default | null`, load it in an async function, and conditionally render it when non-null. Use `onclick`, `onsubmit`, and other lowercase event attributes everywhere -- do not use `on:click` or `on:submit`. For event modifiers that existed in Svelte 4 (`|preventDefault`, `|stopPropagation`), call the methods directly in the handler function. Initialize non-deterministic values to safe defaults (`0`, `''`, `null`) and set real values in `onMount`. Use `error(404, 'Not found')` for expected failures in load functions and actions. Wrap error-prone subtrees with `<svelte:boundary>` and provide a `{#snippet failed(error)}` block for fallback UI.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| DynamicImports | HIGH | Lazy-load heavy components with dynamic import() for smaller initial bundles |
| OnclickOverOnClick | MEDIUM | Use Svelte 5 event attributes (onclick) instead of deprecated on:click directives |
| EventDelegation | MEDIUM | Leverage Svelte 5's automatic event delegation; avoid manual delegation patterns |
| ExpectedVsUnexpected | HIGH | Use error() for expected errors; let unexpected errors propagate to global handler |
| NoDeterministicSSR | HIGH | Avoid non-deterministic values during SSR; initialize them after mount |
| ErrorBoundaries | MEDIUM | Use svelte:boundary to isolate component errors and show fallback UI |


---

### SV5.1 Lazy-Load Heavy Components with Dynamic Imports

**Impact: HIGH (reduces initial bundle size for rarely-shown UI)**

Use dynamic imports to lazy-load heavy components (modals, charts, rich text editors) that aren't needed for initial render.

**Incorrect: top-level import — loaded even if never shown**

```svelte
<script lang="ts">
  import Chart from './Chart.svelte';

  let showChart = $state(false);
</script>

<button onclick={() => showChart = true}>Show Chart</button>
{#if showChart}
  <Chart data={chartData} />
{/if}
```

**Correct: dynamic import on demand**

```svelte
<script lang="ts">
  let showChart = $state(false);
  let Chart: typeof import('./Chart.svelte').default | null = $state(null);

  async function loadChart() {
    Chart = (await import('./Chart.svelte')).default;
    showChart = true;
  }
</script>

<button onclick={loadChart}>Show Chart</button>
{#if showChart && Chart}
  <Chart data={chartData} />
{/if}
```

---

### SV5.2 Use Svelte 5 Event Attribute Syntax

**Impact: MEDIUM (Svelte 5 standard — on:event directive is deprecated)**

Use lowercase event attributes (`onclick`, `onsubmit`) instead of Svelte 4's `on:click` directive syntax. The new syntax is standard HTML and aligns with Svelte 5's move toward HTML-native patterns.

**Incorrect: Svelte 4 directive syntax — deprecated**

```svelte
<button on:click={handleClick}>Click me</button>
<form on:submit|preventDefault={handleSubmit}>
  <input on:input={handleInput} />
</form>
```

**Correct: Svelte 5 event attribute syntax**

```svelte
<button onclick={handleClick}>Click me</button>
<form onsubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
  <input oninput={handleInput} />
</form>
```

---

### SV5.3 Use Event Delegation for Large Lists

**Impact: HIGH (reduces memory usage from N listeners to 1)**

For large lists, use a single event listener on the parent element instead of attaching listeners to each item. Read the target item from data attributes.

**Incorrect: one listener per item — N listeners**

```svelte
<ul>
  {#each items as item}
    <li onclick={() => selectItem(item.id)}>
      {item.name}
    </li>
  {/each}
</ul>
```

**Correct: single delegated listener — 1 listener**

```svelte
<script lang="ts">
  function handleListClick(event: MouseEvent) {
    const target = (event.target as HTMLElement).closest('[data-item-id]');
    if (target) {
      const id = target.getAttribute('data-item-id')!;
      selectItem(id);
    }
  }
</script>

<ul onclick={handleListClick}>
  {#each items as item}
    <li data-item-id={item.id}>
      {item.name}
    </li>
  {/each}
</ul>
```

---

### SV5.4 Use error() for Expected Errors

**Impact: HIGH (provides proper HTTP status codes and error page rendering)**

Use SvelteKit's `error()` helper for expected errors (404, 403, etc.) — it sets the correct HTTP status and renders the nearest `+error.svelte`. Throw regular errors only for unexpected failures.

**Incorrect: generic throw — no status code control**

```typescript
// +page.server.ts
export async function load({ params }) {
  const post = await db.post.findUnique({ where: { slug: params.slug } });
  if (!post) {
    throw new Error('Not found'); // 500 status, generic error page
  }
  return { post };
}
```

**Correct: error() with status code**

```typescript
// +page.server.ts
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const post = await db.post.findUnique({ where: { slug: params.slug } });
  if (!post) {
    throw error(404, 'Post not found'); // 404 status, +error.svelte
  }
  return { post };
}
```

---

### SV5.5 Avoid Non-Deterministic Values During SSR

**Impact: HIGH (prevents hydration mismatch between server and client)**

Non-deterministic values (`Date.now()`, `Math.random()`, browser APIs) produce different results on server vs client, causing hydration mismatches. Initialize them only after mount.

**Incorrect: Date.now() during SSR — different on server and client**

```svelte
<script lang="ts">
  // Runs on server AND client — produces different values
  let timestamp = $state(Date.now());
  let randomId = $state(Math.random().toString(36));
</script>

<span>{timestamp}</span>
```

**Correct: set non-deterministic values after mount**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let timestamp = $state(0);
  let randomId = $state('');

  onMount(() => {
    timestamp = Date.now();
    randomId = Math.random().toString(36);
  });
</script>

{#if timestamp}
  <span>{timestamp}</span>
{/if}
```

---

### SV5.6 Use svelte:boundary for Error Recovery

**Impact: MEDIUM (prevents child errors from crashing entire page)**

Wrap error-prone components with `<svelte:boundary>` to catch errors locally and show a fallback UI instead of crashing the entire page.

**Incorrect: unhandled error crashes page**

```svelte
<!-- If UserProfile throws, the entire page crashes -->
<main>
  <UserProfile userId={id} />
  <RecentActivity />
</main>
```

**Correct: boundary catches error with fallback**

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  function handleError(error: Error) {
    console.error('Component error:', error);
  }
</script>

<main>
  <svelte:boundary onerror={handleError}>
    <UserProfile userId={id} />
    {#snippet failed(error)}
      <div class="error-card">
        <p>Failed to load profile</p>
        <button onclick={() => location.reload()}>Retry</button>
      </div>
    {/snippet}
  </svelte:boundary>
  <RecentActivity />
</main>
```


## Rule Interactions

- **DynamicImports + NoDeterministicSSR**: Dynamically imported components naturally avoid SSR issues because they load only on the client. However, the parent must handle the loading state to avoid a hydration mismatch from content appearing asynchronously.
- **ExpectedVsUnexpected + ErrorBoundaries**: These form a two-tier error strategy. Expected errors in load functions use `error()` and render `+error.svelte`. Unexpected errors in component rendering are caught by `<svelte:boundary>` for graceful degradation without full-page crashes.
- **OnclickOverOnClick + EventDelegation**: The new event attribute syntax enables Svelte 5's delegation system. Using the deprecated `on:click` syntax may bypass delegation, attaching individual listeners.
- **NoDeterministicSSR + SeparateServerClientState (SV4)**: Non-deterministic values are inherently client-only state. The DataForms dimension's rule about separating server and client state provides the structural pattern; this dimension's rule ensures the values themselves are SSR-safe.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Browser API at top-level scope**: Accessing `window`, `document`, `localStorage`, `navigator`, or `IntersectionObserver` at the top level of a component script. This crashes SSR because these APIs do not exist in Node.js. Guard with `import { browser } from '$app/environment'` or defer to `onMount`.
- **Swallowing unexpected errors**: Catching all errors in a load function with a generic try/catch and returning fallback data instead of letting unexpected errors propagate. This hides bugs and makes debugging impossible. Only catch expected error conditions.

### HIGH

- **Hydration mismatch from non-deterministic values**: Using `Date.now()`, `Math.random()`, or `crypto.randomUUID()` to initialize `$state` at the top level. The server renders one value, the client initializes a different one, causing visible UI flicker or silent content replacement.
- **Eager import of heavy libraries**: Importing a charting library, rich text editor, or PDF renderer at the top level when the component using it is conditionally shown (behind a modal, tab, or feature flag). The entire library ships in the initial bundle regardless of usage.
- **Generic Error for expected conditions**: Throwing `new Error('Not found')` in a load function instead of `error(404, 'Not found')`. The result is a 500 status code, a generic error page, and incorrect error semantics for the client.

### MEDIUM

- **Deprecated event directive syntax**: Using `on:click`, `on:submit`, `on:input` in Svelte 5 code. While still functional during the transition period, this is deprecated and may bypass event delegation optimizations.
- **Missing error boundary on third-party content**: Rendering user-generated content or third-party widget output without a `<svelte:boundary>` wrapper. A rendering error in this content crashes the entire page instead of showing a contained fallback.
- **Manual event delegation in lists**: Implementing custom event delegation on a parent element to handle clicks on list items, when Svelte 5 already delegates events automatically. This adds unnecessary complexity.

## Examples

**Dynamic import with loading state:**

```svelte
<script lang="ts">
  let showEditor = $state(false);
  let Editor: typeof import('./RichEditor.svelte').default | null = $state(null);
  let loading = $state(false);

  async function openEditor() {
    loading = true;
    Editor = (await import('./RichEditor.svelte')).default;
    loading = false;
    showEditor = true;
  }
</script>

<button onclick={openEditor} disabled={loading}>
  {loading ? 'Loading...' : 'Open Editor'}
</button>

{#if showEditor && Editor}
  <Editor content={initialContent} onsave={handleSave} />
{/if}
```

**SSR-safe non-deterministic initialization:**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let timestamp = $state(0);
  let viewportWidth = $state(0);

  onMount(() => {
    timestamp = Date.now();
    viewportWidth = window.innerWidth;

    const handleResize = () => { viewportWidth = window.innerWidth; };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });
</script>

{#if timestamp > 0}
  <span>Loaded at {new Date(timestamp).toLocaleTimeString()}</span>
{/if}
```

**Two-tier error handling (route + component level):**

```typescript
// +page.server.ts
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const post = await db.post.findUnique({ where: { slug: params.slug } });
  if (!post) {
    throw error(404, 'Post not found');  // Expected: renders +error.svelte
  }
  // Unexpected errors (db crash) propagate naturally to global handler
  return { post };
}
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  let { data } = $props();
</script>

<article>
  <h1>{data.post.title}</h1>

  <!-- Error boundary for user-generated content -->
  <svelte:boundary>
    <MarkdownRenderer content={data.post.body} />
    {#snippet failed(error)}
      <div class="error-card">
        <p>Failed to render content</p>
        <details><summary>Error</summary>{error.message}</details>
      </div>
    {/snippet}
  </svelte:boundary>

  <CommentSection postId={data.post.id} />
</article>
```

**Svelte 5 event attribute syntax:**

```svelte
<script lang="ts">
  let count = $state(0);

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    // handle form
  }
</script>

<!-- Svelte 5: lowercase event attributes -->
<button onclick={() => count++}>Count: {count}</button>
<form onsubmit={handleSubmit}>
  <input type="text" oninput={(e) => console.log(e.currentTarget.value)} />
  <button type="submit">Submit</button>
</form>
```

## Does Not Cover

- **Reactive state primitives** ($state, $derived, $effect) -- see Reactivity dimension (SV1).
- **Component architecture** (props, snippets, context, route groups) -- see Architecture dimension (SV2).
- **TypeScript integration** (generics, HTML attributes) -- see TypeSystem dimension (SV3).
- **Data loading and form actions** (server load, parallel fetching, validation) -- see DataForms dimension (SV4).
- **State management patterns** (classes, shared state, stores migration) -- see Reactivity dimension (SV1).

## Sources

- Svelte 5 documentation: Events, svelte:boundary
- SvelteKit documentation: Errors, SSR
- Svelte 5 migration guide: Event handling changes
- Joy of Code: Svelte 5 performance patterns
- Captain Codeman: SSR-safe patterns in SvelteKit
