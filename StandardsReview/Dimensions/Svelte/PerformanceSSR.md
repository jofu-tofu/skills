# Performance & SSR -- Svelte

> The performance and SSR dimension covers bundle optimization, event handling patterns, error recovery, and server-side rendering safety -- the concerns that determine whether a Svelte application is fast, resilient, and correctly hydrated.

Compatibility: Rune examples target Svelte 5; Svelte 4/legacy-mode syntax remains valid where supported. SvelteKit examples retain Kit 2 APIs unless a newer version is stated. Named interfaces, classes, callbacks, migration and layout conventions are conditional house policies, not automatic high-severity defects. Assess impact from the concrete contract. Shared mutable module examples are client-only demonstrations; create per-request/component instances for user-specific SSR state.

## Mental Model

Performance in Svelte applications operates at two levels: build-time bundle optimization and runtime rendering efficiency. Svelte compiles components and includes runtime support. Measure bundle cost, rendering work and data loading rather than assuming the compiler removes runtime bottlenecks. Dynamic imports are the primary tool here -- components that are not needed for initial render (modals, charts, rich text editors, admin panels) should be loaded on demand rather than included in the main bundle. This is especially impactful for SvelteKit applications where the initial page load determines Core Web Vitals scores.

Event handling in Svelte 5 moved from the `on:event` directive syntax to standard HTML event attributes (`onclick`, `onsubmit`, `oninput`). This is not just a cosmetic change -- the attribute names resemble HTML, while values are JavaScript handlers compiled by Svelte. Svelte 5 delegates a documented set of events, including click, to an application root, reducing memory usage in lists and repeated components. Understanding this delegation model is important because it means event handlers are already efficient by default, and manual event delegation patterns from other frameworks are unnecessary.

Server-side rendering (SSR) introduces a class of bugs that do not exist in client-only applications: hydration mismatches. When the server renders HTML and the client hydrates it, inconsistent rendered initial content can cause hydration problems; diagnostics and recovery depend on what differs. The most common cause is non-deterministic values -- `Date.now()`, `Math.random()`, `window.innerWidth`, or any browser-only API that either does not exist on the server or produces a different value. Use a deterministic placeholder followed by client initialization, or serialize a server-generated value for matching initial output.

Error handling in SvelteKit distinguishes between expected errors (404 not found, 403 forbidden) and unexpected errors (database crash, null pointer). Expected errors use SvelteKit's `error()` helper, which sets the correct HTTP status code and renders the nearest `+error.svelte` page with structured error data. Unexpected errors are caught by SvelteKit's internal error handler and displayed generically to avoid leaking stack traces. At the component level, `<svelte:boundary>` provides error boundaries that catch rendering errors in child components and display fallback UI, preventing a single broken component from crashing the entire page.

## Consumer Guide

### When Reviewing Code

Check for top-level imports of heavy components that are conditionally rendered -- these should use dynamic imports. Verify that event handlers use Svelte 5's attribute syntax (`onclick`, `onsubmit`) rather than the deprecated `on:click` directive. Look for non-deterministic values (`Date.now()`, `Math.random()`, `crypto.randomUUID()`, browser APIs like `window`, `document`, `localStorage`) initialized at the top level of a component script -- check whether they affect rendered initial content or access unavailable browser APIs. `onMount` is one solution; server-created values serialized to the client are also valid. Check that load functions use `error()` from `@sveltejs/kit` for expected error conditions (not found, unauthorized) rather than throwing generic `Error` objects. Look for error-prone component subtrees (user-generated content rendering, third-party widgets) that lack `<svelte:boundary>` wrappers.

### When Designing / Planning

Identify which components are heavy (large libraries, complex visualizations) and which are conditionally shown -- these are candidates for dynamic imports. Plan error handling at two levels: route-level with `error()` and `+error.svelte` pages, and component-level with `<svelte:boundary>` for isolating failures. Identify any features that need non-deterministic values (timestamps, random IDs, viewport dimensions) and choose client initialization or shared server-serialized initial values. Consider which pages are SSR-critical (landing pages, SEO content) versus client-only (dashboards, admin panels) to determine where SSR safety is most important.

### When Implementing

For dynamic imports, store the dynamically loaded component in a `$state` variable typed as `typeof import('./Component.svelte').default | null`, load it in an async function, and conditionally render it when non-null. Prefer event attributes for new Svelte 5 components; retain valid legacy directives when compatibility requires them. For event modifiers that existed in Svelte 4 (`|preventDefault`, `|stopPropagation`), call the methods directly in the handler function. Initialize non-deterministic values to safe defaults (`0`, `''`, `null`) and set real values in `onMount`. Use `error(404, 'Not found')` for expected failures in load functions and actions. Wrap error-prone subtrees with `<svelte:boundary>` and provide a `{#snippet failed(error)}` block for fallback UI.

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

Use lowercase event attributes (`onclick`, `onsubmit`) instead of Svelte 4's `on:click` directive syntax. These are Svelte-compiled JavaScript handler expressions, not HTML string handler attributes. Legacy directives remain supported; migration is a project policy.

**Legacy alternative: deprecated but supported directive syntax**

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

### SV5.3 Use Svelte Event Delegation for Large Lists

**Impact: MEDIUM (avoid unnecessary manual dispatch)**

Svelte 5 automatically delegates `click` and other documented events. Per-item `onclick` expressions do not imply one native listener per item. Prefer clear handlers and native interactive elements:

```svelte
<ul>
  {#each items as item}
    <li><button onclick={() => selectItem(item.id)}>{item.name}</button></li>
  {/each}
</ul>
```

Manual parent dispatch is optional when measurements or integration requirements justify it. Check nested targets, item identity and keyboard behavior; do not claim an automatic N-to-1 native listener reduction over this example.


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

Do not independently generate different rendered initial values on server and client. Initialize browser-only values after mount, or generate a value once on the server and serialize it for identical initial rendering.

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

In Svelte 5.3+, boundaries can recover from rendering/effect failures. They do not catch event-handler or detached asynchronous errors. By default they do not catch SSR errors; Svelte 5.51+ requires renderer `transformError` integration for SSR recovery. Check framework support rather than assuming it.

**Unisolated subtree: rendering failure can affect surrounding UI**

```svelte
<!-- A client rendering failure here has no local recovery boundary -->
<main>
  <UserProfile userId={id} />
  <RecentActivity />
</main>
```

**Correct: boundary catches error with fallback**

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  function handleError(error: unknown) {
    console.error('Component error:', error);
  }
</script>

<main>
  <svelte:boundary onerror={handleError}>
    <UserProfile userId={id} />
    {#snippet failed(error, reset)}
      <div class="error-card">
        <p>Failed to load profile</p>
        <button onclick={reset}>Retry</button>
      </div>
    {/snippet}
  </svelte:boundary>
  <RecentActivity />
</main>
```


## Rule Interactions

- **DynamicImports + NoDeterministicSSR**: Dynamic import can execute on the server. Importing from a browser event or `onMount` makes that execution client-only; keep initial server/client output consistent.
- **ExpectedVsUnexpected + ErrorBoundaries**: These form a two-tier error strategy. Expected errors in load functions use `error()` and render `+error.svelte`. Client rendering/effect errors within a configured boundary can use fallback UI; SSR and detached errors need separate handling.
- **OnclickOverOnClick + EventDelegation**: Prefer event attributes in new Svelte 5 code and rely on documented delegated events. Do not infer listener counts or speedups solely from legacy syntax.
- **NoDeterministicSSR + SeparateServerClientState (SV4)**: Server-generated values can be serialized for consistent hydration. The DataForms dimension's rule about separating server and client state provides the structural pattern; this dimension's rule ensures the values themselves are SSR-safe.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Browser API at top-level scope**: Accessing `window`, `document`, `localStorage`, `navigator`, or `IntersectionObserver` at the top level of a component script. Browser-only APIs may be unavailable or unsuitable in the server runtime; an unguarded `window` dereference fails in ordinary Node SSR. Guard with `import { browser } from '$app/environment'` or defer to `onMount`.
- **Swallowing unexpected errors**: Catching all errors in a load function with a generic try/catch and returning fallback data instead of letting unexpected errors propagate. This hides bugs and makes debugging impossible. Only catch expected error conditions.

### HIGH

- **Hydration mismatch from non-deterministic values**: Independently generating different server/client values that affect initial rendered content can cause hydration inconsistencies. Unrendered state alone is not proof; serialized server values are valid.
- **Eager import of heavy libraries**: Importing a charting library, rich text editor, or PDF renderer at the top level when the component using it is conditionally shown (behind a modal, tab, or feature flag). This can increase initial code cost; verify the production graph and tree-shaking before claiming a byte count or whole-library inclusion.
- **Generic Error for expected conditions**: Throwing `new Error('Not found')` in a load function instead of `error(404, 'Not found')`. The result is a 500 status code, a generic error page, and incorrect error semantics for the client.

### MEDIUM

- **Deprecated event directive syntax**: Using `on:click`, `on:submit`, `on:input` in Svelte 5 code. This remains supported legacy syntax; flag it only under an applicable migration policy.
- **Missing error boundary on third-party content**: Rendering user-generated content or third-party widget output without a `<svelte:boundary>` wrapper. Consider local recovery for client rendering failures; missing a boundary is not proof of a page crash. SSR/event/async limitations remain as stated in SV5.6.
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
    try {
      Editor = (await import('./RichEditor.svelte')).default;
      showEditor = true;
    } catch (error) {
      console.error('Editor could not be loaded', error);
    } finally {
      loading = false;
    }
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
        <!-- Keep internal error details out of the user-facing fallback. -->
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

### Primary verification sources

- https://svelte.dev/docs/svelte/basic-markup#Events-Event-delegation
- https://svelte.dev/docs/kit/performance
- https://svelte.dev/docs/svelte/legacy-on
- https://svelte.dev/docs/svelte/svelte-boundary
- https://svelte.dev/docs/kit/state-management
- https://svelte.dev/docs/svelte/lifecycle-hooks
