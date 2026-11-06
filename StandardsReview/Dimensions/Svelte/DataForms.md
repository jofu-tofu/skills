# Data & Forms -- Svelte

> The data and forms dimension covers SvelteKit's data loading architecture and form handling -- how data flows from server to client, how mutations are submitted, and how server and client state remain cleanly separated.

Compatibility: Rune examples target Svelte 5; Svelte 4/legacy-mode syntax remains valid where supported. SvelteKit examples retain Kit 2 APIs unless a newer version is stated. Named interfaces, classes, callbacks, migration and layout conventions are conditional house policies, not automatic high-severity defects. Assess impact from the concrete contract. Shared mutable module examples are client-only demonstrations; create per-request/component instances for user-specific SSR state.

## Mental Model

SvelteKit's data architecture is built on a fundamental separation: server-only code runs exclusively on the server (never shipped to the client), while universal code runs on both server and client. This separation is enforced by file naming conventions -- `+page.server.ts` and `+layout.server.ts` are server-only, while `+page.ts` and `+layout.ts` are universal. Understanding this boundary is the single most important concept for SvelteKit data handling, because it determines where secrets are safe, where database access is possible, and what code ends up in the client bundle.

Load functions are the primary data-fetching mechanism. They run before the page renders, providing data as props to the page component. Load functions should return authorized, necessary data. Server filtering, pagination and transformation can reduce payloads and protect privacy; choose presentation work placement by semantics and measured cost. When a page needs data from multiple independent sources, consider parallel fetches after authorization prerequisites; rate limits, dependencies or transactions may require sequencing.

Form actions are SvelteKit's answer to data mutations. Rather than building custom API endpoints and wiring up fetch calls, form actions use HTML POST forms that work without JavaScript. Optional `use:enhance` adds client updates; pending indicators need application state. CSRF enforcement depends on the request and Kit configuration, not on choosing enhance. The server-side action handler receives the form data, validates it, performs the mutation, and returns a result that the page can react to.

The final principle is server/client state separation. Data returned from load functions (server state) should not be mixed with client-only state (UI state like modal open/closed, form input values, scroll position) in the same reactive structures. Mixing them creates confusion about what is authoritative (server data) versus transient (client state), and can cause hydration issues when server-rendered HTML conflicts with client-initialized state.

## Consumer Guide

### When Reviewing Code

Check that any load function accessing secrets, databases, or private APIs lives in a `+page.server.ts` or `+layout.server.ts` file, not a universal `+page.ts` file. Look for sequential `await` calls in load functions that could be parallelized with `Promise.all`. Prefer actions for progressively enhanced page forms; plain POST forms and suitable validated API endpoints are valid. Check that server-side validation exists for all form inputs -- client-side validation is a UX convenience, not a security measure. Check whether filtering/transformation belongs on the server for privacy, payload size or performance. Look for patterns where server-loaded data is merged into `$state` objects alongside client-only UI state.

### When Designing / Planning

Map out which data each route needs and whether it requires server-only access (databases, secrets) or can be universal (public APIs). Identify data shared across multiple pages in a route group and plan to load it in `+layout.server.ts` to avoid duplication. Design form interactions around SvelteKit's action model: each mutation gets a named action, the form posts to it, and the action returns success/failure data. Plan validation as a server-side concern with client-side mirroring for UX. Establish clear boundaries between server-authoritative data (user profile, database records) and client-transient state (form drafts, UI toggles).

### When Implementing

Place all load functions that touch secrets or databases in `+page.server.ts`. Use `Promise.all` for independent data fetches within a single load function. For forms, define actions in `+page.server.ts` as an `actions` object with named handlers, and use `<form method="POST" action="?/actionName" use:enhance>` on the client. Validate all input server-side using a validation library (Zod, Valibot) or manual checks, returning `fail()` with error details for invalid input. Keep payloads lean; filter private/unneeded data server-side and derive local presentation values where appropriate. Maintain separate reactive structures for server data (`data` prop from load) and client state (local `$state` variables).

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| ServerLoadForSecrets | HIGH | Use +page.server.ts for load functions accessing secrets or databases |
| ParallelLoading | HIGH | Fetch independent data in parallel with Promise.all in load functions |
| FormActionsOverFetch | HIGH | Prefer page form actions; enhance is optional, API endpoints can be valid |
| ValidateServerSide | HIGH | Always validate form data on the server, not just the client |
| LeanLoadFunctions | MEDIUM | Return lean authorized data; place transformations where appropriate |
| SeparateServerClientState | HIGH | Keep server-loaded data and client UI state in separate reactive structures |


---

### SV4.1 Use +page.server.ts for Secrets and Databases

**Impact: HIGH (prevents secrets from leaking to client bundle)**

Use `+page.server.ts` (not `+page.ts`) for load functions that access secrets, databases, or private APIs. Server-only load functions never reach the browser.

**Incorrect: server database dependency in universal load — unsafe client boundary**

```typescript
// +page.ts — this code ships to the browser!
import { db } from '$lib/database';

export async function load() {
  const users = await db.query('SELECT * FROM users');
  return { users };
}
```

**Correct: server-only load function**

```typescript
// +page.server.ts — never reaches the browser
import { db } from '$lib/database';

export async function load() {
  const users = await db.query('SELECT * FROM users');
  return { users };
}
```

---

### SV4.2 Fetch Data in Parallel with Promise.all

**Impact: HIGH (reduces page load latency by eliminating waterfalls)**

Use `Promise.all` in load functions to fetch independent data sources in parallel instead of sequentially.

**Potential waterfall: independent requests serialized**

```typescript
// +page.server.ts
export async function load({ fetch }) {
  const user = await fetch('/api/user').then(r => r.json());
  const posts = await fetch('/api/posts').then(r => r.json());
  const comments = await fetch('/api/comments').then(r => r.json());
  return { user, posts, comments };
}
```

**Parallel alternative: overlaps independent work; no fixed speedup guaranteed**

```typescript
// +page.server.ts
export async function load({ fetch }) {
  const [user, posts, comments] = await Promise.all([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json()),
  ]);
  return { user, posts, comments };
}
```

---

### SV4.3 Use Form Actions Over fetch for Mutations

**Impact: HIGH (enables progressive enhancement — works without JavaScript)**

Prefer actions for page form mutations requiring a no-JavaScript path. Plain POST forms are valid; `use:enhance` is optional and only supports POST forms targeting page actions. Validated API endpoints suit other clients.

**Incorrect: fetch-based mutation — breaks without JS**

```svelte
<script lang="ts">
  async function addTodo() {
    await fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ text: newTodo }),
    });
  }
</script>

<button onclick={addTodo}>Add</button>
```

**Correct: form action with progressive enhancement**

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
</script>

<form method="POST" action="?/addTodo" use:enhance>
  <input name="text" required />
  <button type="submit">Add</button>
</form>
```

```typescript
// +page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions = {
  addTodo: async ({ request }) => {
    const data = await request.formData();
    const value = data.get('text');
    if (typeof value !== 'string' || !value.trim() || value.trim().length > 200) {
      return fail(400, { error: 'Text must contain 1–200 characters' });
    }
    const text = value.trim();
    await db.todo.create({ data: { text } });
  },
} satisfies Actions;
```

---

### SV4.4 Validate Form Data Server-Side with fail()

**Impact: HIGH (prevents invalid data and provides structured error responses)**

Always validate form data in server actions and return structured errors via `fail()`. This ensures validation works even without client-side JavaScript.

**Incorrect: no validation or unstructured errors**

```typescript
// +page.server.ts
export const actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const text = data.get('text') as string;
    await db.todo.create({ data: { text } }); // No validation!
  },
};
```

**Correct: server-side validation with structured errors**

```typescript
// +page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const value = data.get('text');
    const text = typeof value === 'string' ? value.trim() : '';

    if (!text) {
      return fail(400, { error: 'Text is required', field: 'text' });
    }
    if (text.length > 200) {
      return fail(400, { error: 'Text must be at most 200 characters', field: 'text' });
    }

    await db.todo.create({ data: { text } });
    return { success: true };
  },
} satisfies Actions;
```

---

### SV4.5 Return Lean Data Required by the Route

**Impact: HIGH (reduces serialization cost and improves time-to-interactive)**

Return data required by the route contract. Paginate large datasets; defer content only when accessibility, SEO and navigation requirements permit. Perform privacy filtering before sending data.

**Incorrect: loading all data upfront**

```typescript
// +page.server.ts
export async function load() {
  const allPosts = await db.post.findMany(); // Could be 10,000 rows
  return { posts: allPosts };
}
```

**Correct: paginated initial load**

```typescript
// +page.server.ts
export async function load({ url }) {
  const rawPage = url.searchParams.get('page') ?? '1';
  const parsedPage = /^[1-9][0-9]*$/.test(rawPage) ? Number(rawPage) : NaN;
  const page = Number.isSafeInteger(parsedPage) && parsedPage <= 10000 ? parsedPage : 1;
  const posts = await db.post.findMany({
    take: 20,
    skip: (page - 1) * 20,
    orderBy: { createdAt: 'desc' },
  });
  const total = await db.post.count();
  return { posts, total, page };
}
```

---

### SV4.6 Separate Server Data from Client State

**Impact: HIGH when stale authoritative data violates the contract**

Read authoritative load data reactively; keep UI state separate. Intentional editable drafts may copy values with an explicit reset/save policy. A one-time copy can become stale on reused navigation; it does not inherently cause hydration mismatch.

**Incorrect when live data is required: one-time copy becomes stale**

```svelte
<script lang="ts">
  let { data } = $props();

  // Copies server data to client state — desyncs on navigation
  let items = $state(data.items);
  let filter = $state('all');
</script>
```

**Correct: $derived for server data, $state for client-only**

```svelte
<script lang="ts">
  let { data } = $props();

  // Derived read follows updated data; this does not freeze the underlying object
  let serverItems = $derived(data.items);
  // Client-only UI state
  let filter = $state('all');
  // Combine in a derived value
  let visibleItems = $derived.by(() => {
    if (filter === 'all') return serverItems;
    return serverItems.filter(i => i.status === filter);
  });
</script>
```


## Rule Interactions

- **ServerLoadForSecrets + EnvVarSafety (SV2)**: ServerLoadForSecrets ensures the load function is server-only; EnvVarSafety selects the private API for the pinned Kit version. Neither boundary prevents leaking secrets through returned data; review payloads too.
- **ParallelLoading + LeanLoadFunctions**: Both optimize load function performance. Parallel loading eliminates fetch waterfalls; lean functions reduce the work done per request. Combined, they minimize time-to-first-byte.
- **FormActionsOverFetch + ValidateServerSide**: Form actions provide the transport; server validation provides the security. Every form action handler should validate its input before performing the mutation.
- **SeparateServerClientState + Reactivity rules (SV1)**: Server data comes from the `data` prop (provided by the load function), while local UI state uses `$state` (and can also participate in SSR). Keeping them separate means the reactive graph is clean -- `$derived` computations over server data re-run when the page navigates, and local `$state` persists when components are reused; reset drafts explicitly when the contract requires it.
- **LeanLoadFunctions + DerivedOverEffect (SV1)**: Data transformations deferred from the load function should use `$derived` in the component, not `$effect` writing to `$state`.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Secrets in universal load**: Accessing database connections, API keys, or private environment variables in `+page.ts` instead of `+page.server.ts`. Universal modules enter the client graph. Protected private/server imports are normally rejected; unprotected embedded secrets or secrets returned from server loads can leak.
- **Client-only validation**: Validating form input only on the client with no server-side checks. Client validation is trivially bypassed -- any user with dev tools can submit arbitrary data directly to the action endpoint.

### HIGH

- **Sequential fetch waterfall**: Multiple independent `await fetch()` calls in sequence within a load function. Each fetch waits for the previous to complete; the cost depends on the requests and shared resources. Use `Promise.all` for independent requests.
- **Manual fetch for mutations**: A JavaScript-only submission violates a required no-JavaScript form contract. A validated endpoint is otherwise legitimate; CSRF depends on method, content type, origin and Kit configuration, not whether fetch is used.
- **Mixed server/client state**: Merging server-loaded data into a single `$state` object alongside client UI state. When the page navigates and the load function returns fresh data, the merged object creates conflicts between stale client state and fresh server data.

### MEDIUM

- **Heavy load functions**: Returning excessive or unauthorized data, or doing demonstrated unnecessary work. Server filtering and transformations can be essential and reduce client cost.
- **Missing use:enhance**: Only flag an unenhanced form when an explicit no-reload UX policy applies. Plain POST forms are supported and valid.

## Examples

**Parallel data loading with lean pattern:**

```typescript
// +page.server.ts
import { db } from '$lib/server/database';

export async function load({ params }) {
  const [post, comments, relatedPosts] = await Promise.all([
    db.post.findUnique({ where: { slug: params.slug } }),
    db.comment.findMany({ where: { postSlug: params.slug } }),
    db.post.findMany({ where: { category: params.category }, take: 5 }),
  ]);

  return { post, comments, relatedPosts };
}
```

```svelte
<!-- +page.svelte: derivations run during SSR and client rendering -->
<script lang="ts">
  let { data } = $props();
  let sortOrder = $state<'newest' | 'oldest'>('newest');

  // Assumes server-loaded createdAt values are Date objects.
  let sortedComments = $derived(
    [...data.comments].sort((a, b) =>
      sortOrder === 'newest'
        ? b.createdAt.getTime() - a.createdAt.getTime()
        : a.createdAt.getTime() - b.createdAt.getTime()
    )
  );
</script>
```

**Form action with server validation:**

```typescript
// +page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const rawTitle = formData.get('title');
    const rawBody = formData.get('body');
    const title = typeof rawTitle === 'string' ? rawTitle.trim() : '';
    const body = typeof rawBody === 'string' ? rawBody.trim() : '';

    const errors: Record<string, string> = {};
    if (!title || title.length < 3) errors.title = 'Title must be at least 3 characters';
    if (!body || body.length < 10) errors.body = 'Body must be at least 10 characters';

    if (Object.keys(errors).length > 0) {
      return fail(400, { errors, title, body });
    }

    await db.post.create({ data: { title, body } });
    return { success: true };
  },
} satisfies Actions;
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  let { form } = $props();
</script>

<form method="POST" action="?/create" use:enhance>
  <input name="title" value={form?.title ?? ''} />
  {#if form?.errors?.title}<span class="error">{form.errors.title}</span>{/if}

  <textarea name="body">{form?.body ?? ''}</textarea>
  {#if form?.errors?.body}<span class="error">{form.errors.body}</span>{/if}

  <button type="submit">Create Post</button>
</form>
```

**Separated server and client state:**

```svelte
<script lang="ts">
  // Server state: from load function, authoritative
  let { data } = $props();

  // Client state: UI-only, transient
  let isEditing = $state(false);
  let draftTitle = $state('');

  function startEdit() {
    draftTitle = data.post.title;  // Copy server value into client draft
    isEditing = true;
  }
</script>
```

## Does Not Cover

- **Reactive state management** ($state, $derived, $effect) -- see Reactivity dimension (SV1).
- **Component architecture** (props, snippets, context) -- see Architecture dimension (SV2).
- **TypeScript typing** for load functions and actions -- see TypeSystem dimension (SV3).
- **SSR safety** and hydration concerns -- see PerformanceSSR dimension (SV5).
- **Error handling** in load functions (error() helper) -- see PerformanceSSR dimension (SV5).

## Sources

- SvelteKit documentation: Loading Data, Form Actions, Modules
- SvelteKit documentation: $env modules
- Svelte 5 migration guide: data loading changes
- Joy of Code: SvelteKit form actions deep dive
- Cursor Directory: SvelteKit best practices

### Primary verification sources

- https://svelte.dev/docs/kit/server-only-modules
- https://svelte.dev/docs/kit/load
- https://svelte.dev/docs/kit/form-actions
- https://svelte.dev/docs/kit/@sveltejs-kit-vite#csrf
- https://svelte.dev/docs/kit/state-management
- https://svelte.dev/docs/kit/migrating-to-sveltekit-3
