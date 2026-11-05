# Data Fetching — React

> Every millisecond spent waiting for data that could have been fetched in parallel is a millisecond of user-visible delay that compounds across every page load.

## Mental Model

Data fetching is the primary bottleneck in most React applications. The rules in this dimension address a single core problem: the request waterfall. A waterfall occurs whenever an async operation waits for a previous one to complete before it can start, even when the two operations are independent. A blocking await delays the subtree it gates; existing layouts or Suspense fallbacks may already be visible. Measure the critical path. Independence includes authorization, ordering, rate limits and transaction semantics, not only whether one return value is used by another call.

The 11 primary rules in this dimension form three layers of defense against waterfalls. The first layer is structural: `AsyncParallel` and `AsyncDeferAwait` ensure that independent operations run concurrently and that promises are created early but awaited late. The second layer is boundary-based: `AsyncSuspenseBoundaries` and `AsyncApiRoutes` structure the component tree so that slow data does not block fast content. The third layer is client-side: `ClientSwrDedup` prevents redundant network requests, `ClientEventListeners` and `ClientPassiveEventListeners` ensure that event-driven data fetching does not create jank, and `ClientLocalstorageSchema` prevents client-side state corruption that causes unnecessary refetches.

The server-side rules (`ServerParallelFetching`, `ServerAfterNonblocking`) extend this same anti-waterfall philosophy to the server rendering pipeline. `AsyncDependencies` handles the edge case where operations genuinely depend on each other, providing patterns for minimizing the sequential portion.

These patterns can reduce avoidable waits; concurrency limits, server capacity and rendering still determine performance.

## Consumer Guide

### When Reviewing Code

Scan for these violations in priority order:

1. **Sequential awaits on independent data** (CRITICAL) — Look for consecutive `await` statements where the second call does not use the result of the first. This is the most common and highest-impact violation. `const user = await getUser(); const posts = await getPosts();` — if posts have no data, authorization, ordering or rate-limit prerequisite, this may be an avoidable waterfall.
2. **Missing Suspense boundaries** (CRITICAL) — A page component that awaits multiple data sources before rendering anything. A suitable parent boundary can already provide a fallback; choose boundaries around meaningful loading regions.
3. **Barrel fetch functions** (HIGH) — A single `getData()` function that fetches everything a page needs sequentially inside it, hiding the waterfall from the component level.
4. **SWR/React Query without dedup** (MEDIUM) — Multiple components independently fetching the same resource without a shared cache key.
5. **Cancelable touch/wheel listeners** — Use passive listeners when they do not cancel default scrolling. The scroll event itself is noncancelable; expensive handlers still need optimization.
6. **Unvalidated localStorage reads** (LOW) — Reading client-side cached data without schema validation, risking stale or corrupted state after deployments.

### When Designing / Planning

Before implementing data fetching for a page or feature:

- **Map the data dependency graph.** Draw which data depends on which. Independent branches should be `Promise.all()`'d. Dependent chains should be minimized to the true dependency (e.g., fetch user ID first, then fetch user-specific data).
- **Decide where each fetch lives.** Server Components can fetch directly. Client components can use framework data APIs, SWR/React Query, or carefully managed Effects; these libraries are choices, not React requirements. API routes consolidate multiple backend calls.
- **Plan Suspense boundaries.** Group Suspense boundaries by meaningful loading UI; several sources can deliberately reveal together.
- **Consider the API route consolidation pattern.** If a client component needs 3+ backend calls, consolidate them into a single API route that runs them in parallel server-side, eliminating client-side roundtrips.

### When Implementing

Apply rules in this sequence:

1. **Identify independence** — For every pair of async calls, ask: "Does the second need the result of the first?" If no other authorization, ordering or capacity constraint applies, consider `Promise.all()` (AsyncParallel).
2. **Defer awaits** — Create promises early, await them at the point of use (AsyncDeferAwait). This naturally enables parallelism even when the code reads sequentially.
3. **Wrap with Suspense** — Choose a Suspense boundary for each intended loading region (AsyncSuspenseBoundaries). Place boundaries as close to the data source as possible.
4. **Deduplicate client fetches** — Use SWR or React Query with stable cache keys (ClientSwrDedup). Repeated hook consumers can share cached requests; intentionally independent reads may also be needed.
5. **Optimize event handlers** — Add `{ passive: true }` to touch/wheel listeners that do not cancel defaults (ClientPassiveEventListeners). Use proper cleanup in event subscriptions (ClientEventListeners).
6. **Validate client storage** — Schema-validate localStorage reads (ClientLocalstorageSchema) to handle format changes across deployments.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| AsyncDeferAwait | CRITICAL | Move await to usage point; create promise early to enable parallelism |
| AsyncParallel | CRITICAL | Promise.all() for independent operations when concurrency is appropriate |
| AsyncDependencies | HIGH | Minimize sequential chains to true data dependencies only |
| AsyncApiRoutes | HIGH | Consolidate multiple backend calls into a single API route |
| AsyncSuspenseBoundaries | CRITICAL | Stream content with Suspense boundaries around independent data |
| ClientSwrDedup | MEDIUM-HIGH | Deduplicate client-side fetches with SWR/React Query cache keys |
| ClientEventListeners | MEDIUM | Proper setup/teardown for event-driven data subscriptions |
| ClientPassiveEventListeners | MEDIUM | Use passive touch/wheel listeners when no cancellation is needed |
| ClientLocalstorageSchema | LOW-MEDIUM | Schema-validate localStorage reads to prevent stale state bugs |
| ServerParallelFetching | HIGH | Parallel data fetching across server components |
| ServerAfterNonblocking | HIGH | Run non-critical server work after response using next/after |

### Cross-Referenced Rules (from other dimensions)

| Rule | Primary Dimension | Why Relevant Here |
|------|-------------------|-------------------|
| RerenderDeferReads | RenderingPerf | Deferred state reads prevent unnecessary re-fetches triggered by re-renders |
| RerenderTransitions | RenderingPerf | Transitions prevent fetch-triggered re-renders from blocking UI |
| RenderingHydrationNoFlicker | RenderingPerf | Hydration strategy affects when client-side fetches initialize |
| RenderingHydrationSuppressWarning | RenderingPerf | Mismatched server/client data causes hydration warnings |
| RenderingUsetransitionLoading | RenderingPerf | Loading states during data transitions |


---

### R2.1 Defer Await Until Needed

**Impact: HIGH (avoids blocking unused code paths)**

Move `await` operations into the branches where they're actually used to avoid blocking code paths that don't need them.

**Incorrect: blocks both branches**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  const userData = await fetchUserData(userId)
  
  if (skipProcessing) {
    // Returns immediately but still waited for userData
    return { skipped: true }
  }
  
  // Only this branch uses userData
  return processUserData(userData)
}
```

**Correct: only blocks when needed**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  if (skipProcessing) {
    // Returns immediately without waiting
    return { skipped: true }
  }
  
  // Fetch only when needed
  const userData = await fetchUserData(userId)
  return processUserData(userData)
}
```

**Another example: early return optimization**

```typescript
// Incorrect: always fetches permissions
async function updateResource(resourceId: string, userId: string) {
  const permissions = await fetchPermissions(userId)
  const resource = await getResource(resourceId)
  
  if (!resource) {
    return { error: 'Not found' }
  }
  
  if (!permissions.canEdit) {
    return { error: 'Forbidden' }
  }
  
  return await updateResourceData(resource, permissions)
}

// Correct: fetches only when needed
async function updateResource(resourceId: string, userId: string) {
  const resource = await getResource(resourceId)
  
  if (!resource) {
    return { error: 'Not found' }
  }
  
  const permissions = await fetchPermissions(userId)
  
  if (!permissions.canEdit) {
    return { error: 'Forbidden' }
  }
  
  return await updateResourceData(resource, permissions)
}
```

This optimization requires a contract allowing the early return and resource-existence disclosure. Otherwise keep authorization ahead of the lookup. Do not defer required permission or audit work.

---

### R2.2 Promise.all() for Independent Operations

**Impact: CRITICAL (potential reduction in sequential latency)**

When reads have no interdependencies and capacity permits, start them concurrently and await `Promise.all()`. This does not combine network requests or cancel remaining work on rejection.

**Sequential: three requests in series**

```typescript
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()
```

**Concurrent: still three requests, with overlapping waits**

```typescript
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
])
```

---

### R2.3 Dependency-Based Parallelization

**Impact: CRITICAL (potential reduction in sequential latency)**

For partial dependencies, use promise chaining (shown below) or an explicitly selected task library such as better-all. The dependency graph must include authorization and side-effect ordering.

**Incorrect: profile waits for config unnecessarily**

```typescript
const [user, config] = await Promise.all([
  fetchUser(),
  fetchConfig()
])
const profile = await fetchProfile(user.id)
```

**Correct: config and profile run in parallel**

```typescript
import { all } from 'better-all'

const { user, config, profile } = await all({
  async user() { return fetchUser() },
  async config() { return fetchConfig() },
  async profile() {
    return fetchProfile((await this.$.user).id)
  }
})
```

**Alternative without extra dependencies:**

```typescript
const userPromise = fetchUser()
const profilePromise = userPromise.then(user => fetchProfile(user.id))

const [user, config, profile] = await Promise.all([
  userPromise,
  fetchConfig(),
  profilePromise
])
```

We can also create all the promises first, and do `Promise.all()` at the end.

Reference: [https://github.com/shuding/better-all](https://github.com/shuding/better-all)

---

### R2.4 Prevent Waterfall Chains in API Routes

**Impact: CRITICAL (potential reduction in sequential latency)**

In API routes and Server Actions, start only genuinely independent reads early. Authenticate before protected reads. The example assumes config is public, and data reads are scoped to the verified session.

**Incorrect: config waits for auth, data waits for both**

```typescript
export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
  const config = await fetchConfig()
  const data = await fetchData(session.user.id)
  return Response.json({ data, config })
}
```

**Correct: auth and config start immediately**

```typescript
export async function GET(request: Request) {
  const sessionPromise = auth()
  const configPromise = fetchConfig()
  // Attach rejection handling to both promises immediately.
  const [session, config] = await Promise.all([sessionPromise, configPromise])
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
  const data = await fetchData(session.user.id)
  return Response.json({ data, config })
}
```

For operations with more complex dependency chains, use `better-all` to automatically maximize parallelism (see Dependency-Based Parallelization).

---

### R2.5 Strategic Suspense Boundaries

**Impact: HIGH (faster initial paint)**

Instead of awaiting data in async components before returning JSX, use Suspense boundaries to show the wrapper UI faster while data loads.

**Incorrect: wrapper blocked by data fetching**

```tsx
async function Page() {
  const data = await fetchData() // Blocks entire page
  
  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <DataDisplay data={data} />
      </div>
      <div>Footer</div>
    </div>
  )
}
```

The entire layout waits for data even though only the middle section needs it.

**Correct: wrapper shows immediately, data streams in**

```tsx
function Page() {
  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <Suspense fallback={<Skeleton />}>
          <DataDisplay />
        </Suspense>
      </div>
      <div>Footer</div>
    </div>
  )
}

async function DataDisplay() {
  const data = await fetchData() // Only blocks this component
  return <div>{data.content}</div>
}
```

Sidebar, Header, and Footer render immediately. Only DataDisplay waits for data.

**Alternative: share promise across components**

```tsx
function Page() {
  // Start fetch immediately, but don't await
  const dataPromise = fetchData()
  
  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <Suspense fallback={<Skeleton />}>
        <DataDisplay dataPromise={dataPromise} />
        <DataSummary dataPromise={dataPromise} />
      </Suspense>
      <div>Footer</div>
    </div>
  )
}

function DataDisplay({ dataPromise }: { dataPromise: Promise<Data> }) {
  const data = use(dataPromise) // Unwraps the promise
  return <div>{data.content}</div>
}

function DataSummary({ dataPromise }: { dataPromise: Promise<Data> }) {
  const data = use(dataPromise) // Reuses the same promise
  return <div>{data.summary}</div>
}
```

Both components share the same promise, so only one fetch occurs. Layout renders immediately while both components wait together.

**When NOT to use this pattern:**

- Critical data needed for layout decisions (affects positioning)

- SEO-critical content above the fold

- Small, fast queries where suspense overhead isn't worth it

- When you want to avoid layout shift (loading → content jump)

**Trade-off:** Faster initial paint vs potential layout shift. Choose based on your UX priorities.

---

### R2.6 Use SWR for Automatic Deduplication

**Impact: MEDIUM-HIGH (automatic deduplication)**

SWR enables request deduplication, caching, and revalidation across component instances sharing a cache provider/key and deduplication window. It is one valid data-layer choice.

**Incorrect: no deduplication, each instance fetches**

```tsx
function UserList() {
  const [users, setUsers] = useState([])
  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(setUsers)
  }, [])
}
```

**Correct: multiple instances share one request**

```tsx
import useSWR from 'swr'

function UserList() {
  const { data: users } = useSWR('/api/users', fetcher)
}
```

**For immutable data:**

```tsx
import { useImmutableSWR } from '@/lib/swr'

function StaticContent() {
  const { data } = useImmutableSWR('/api/config', fetcher)
}
```

**For mutations:**

```tsx
import useSWRMutation from 'swr/mutation'

function UpdateButton() {
  const { trigger } = useSWRMutation('/api/user', updateUser)
  return <button onClick={() => trigger()}>Update</button>
}
```

Reference: [https://swr.vercel.app](https://swr.vercel.app)

---

### R2.7 Deduplicate Global Event Listeners

**Impact: LOW (single listener for N components)**

Use `useSWRSubscription()` to share global event listeners across component instances.

**Incorrect: N instances = N listeners**

```tsx
function useKeyboardShortcut(key: string, callback: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === key) {
        callback()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, callback])
}
```

When using the `useKeyboardShortcut` hook multiple times, each instance will register a new listener.

**Correct: N instances = 1 listener**

```tsx
import useSWRSubscription from 'swr/subscription'

// Module-level Map to track callbacks per key
const keyCallbacks = new Map<string, Set<() => void>>()

function useKeyboardShortcut(key: string, callback: () => void) {
  // Register this callback in the Map
  useEffect(() => {
    if (!keyCallbacks.has(key)) {
      keyCallbacks.set(key, new Set())
    }
    keyCallbacks.get(key)!.add(callback)

    return () => {
      const set = keyCallbacks.get(key)
      if (set) {
        set.delete(callback)
        if (set.size === 0) {
          keyCallbacks.delete(key)
        }
      }
    }
  }, [key, callback])

  useSWRSubscription('global-keydown', () => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && keyCallbacks.has(e.key)) {
        keyCallbacks.get(e.key)!.forEach(cb => cb())
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })
}

function Profile() {
  // Multiple shortcuts will share the same listener
  useKeyboardShortcut('p', () => { /* ... */ }) 
  useKeyboardShortcut('k', () => { /* ... */ })
  // ...
}
```

---

### R2.8 Use Passive Event Listeners for Scrolling Performance

**Impact: MEDIUM (can avoid waiting for cancellation decisions)**

Add `{ passive: true }` to touch and wheel event listeners to enable immediate scrolling. For cancelable events, browsers may wait to determine whether scrolling is prevented; some targets already default to passive. The scroll event itself is noncancelable. Passive does not reduce the callback's CPU work.

**Incorrect:**

```typescript
useEffect(() => {
  const handleTouch = (e: TouchEvent) => console.log(e.touches[0].clientX)
  const handleWheel = (e: WheelEvent) => console.log(e.deltaY)
  
  document.addEventListener('touchstart', handleTouch)
  document.addEventListener('wheel', handleWheel)
  
  return () => {
    document.removeEventListener('touchstart', handleTouch)
    document.removeEventListener('wheel', handleWheel)
  }
}, [])
```

**Correct:**

```typescript
useEffect(() => {
  const handleTouch = (e: TouchEvent) => console.log(e.touches[0].clientX)
  const handleWheel = (e: WheelEvent) => console.log(e.deltaY)
  
  document.addEventListener('touchstart', handleTouch, { passive: true })
  document.addEventListener('wheel', handleWheel, { passive: true })
  
  return () => {
    document.removeEventListener('touchstart', handleTouch)
    document.removeEventListener('wheel', handleWheel)
  }
}, [])
```

**Use passive when:** tracking/analytics, logging, any listener that doesn't call `preventDefault()`.

**Don't use passive when:** implementing custom swipe gestures, custom zoom controls, or any listener that needs `preventDefault()`.

---

### R2.9 Version and Minimize localStorage Data

**Impact: MEDIUM (prevents schema conflicts, reduces storage size)**

Add version prefix to keys and store only needed fields. Prevents schema conflicts and accidental storage of sensitive data.

**Incorrect:**

```typescript
// No version, stores everything, no error handling
localStorage.setItem('userConfig', JSON.stringify(fullUserObject))
const data = localStorage.getItem('userConfig')
```

**Correct:**

```typescript
const VERSION = 'v2'

function saveConfig(config: { theme: string; language: string }) {
  try {
    localStorage.setItem(`userConfig:${VERSION}`, JSON.stringify(config))
    return true
  } catch {
    // May fail because of storage policy or quota; private mode alone is not proof.
    return false
  }
}

function loadConfig() {
  try {
    const data = localStorage.getItem(`userConfig:${VERSION}`)
    const value: unknown = data ? JSON.parse(data) : null
    if (!value || typeof value !== 'object') return null
    if (!('theme' in value) || !('language' in value)) return null
    return typeof value.theme === 'string' && typeof value.language === 'string'
      ? { theme: value.theme, language: value.language } : null
  } catch {
    return null
  }
}

// Migration from v1 to v2
function migrate() {
  try {
    const v1 = localStorage.getItem('userConfig:v1')
    if (v1) {
      const old = JSON.parse(v1)
      if (old && typeof old.darkMode === 'boolean' && typeof old.lang === 'string' &&
          saveConfig({ theme: old.darkMode ? 'dark' : 'light', language: old.lang })) {
        localStorage.removeItem('userConfig:v1')
      }
    }
  } catch {}
}
```

**Store minimal fields from server responses:**

```typescript
// User object has 20+ fields, only store what UI needs
function cachePrefs(user: FullUser) {
  try {
    localStorage.setItem('prefs:v1', JSON.stringify({
      theme: user.preferences.theme,
      notifications: user.preferences.notifications
    }))
  } catch {}
}
```

**Handle storage failures:** policy can deny storage and writes can exceed quota. Private browsing does not universally make reads/writes throw. Versioning does not replace validating parsed values.

**Benefits:** Schema evolution via versioning, reduced storage size, prevents storing tokens/PII/internal flags.

---

### R2.10 Parallel Data Fetching with Component Composition

**Impact: CRITICAL (eliminates server-side waterfalls)**

An async parent that awaits before returning children delays starting those children. Independent sibling work can overlap; React does not universally execute the whole tree sequentially. Preserve authorization/data prerequisites.

**Incorrect: Sidebar waits for Page's fetch to complete**

```tsx
export default async function Page() {
  const header = await fetchHeader()
  return (
    <div>
      <div>{header}</div>
      <Sidebar />
    </div>
  )
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}
```

**Alternative: independent sibling fetches can overlap**

```tsx
async function Header() {
  const data = await fetchHeader()
  return <div>{data}</div>
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}

export default function Page() {
  return (
    <div>
      <Header />
      <Sidebar />
    </div>
  )
}
```

**Alternative with children prop:**

```tsx
async function Header() {
  const data = await fetchHeader()
  return <div>{data}</div>
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Header />
      {children}
    </div>
  )
}

export default function Page() {
  return (
    <Layout>
      <Sidebar />
    </Layout>
  )
}
```

---

### R2.11 Use after() for Non-Blocking Operations

**Impact: MEDIUM (faster response times)**

On Next.js 15.1+ with a supported deployment runtime, `after()` schedules work after a response or prerender finishes. Use it only when response success does not depend on that work. Keep required audits, authorization and consistency-critical invalidation awaited or durably enqueued before success. Execution is bounded by the route's runtime duration.

**Incorrect: blocks response**

```tsx
import { logUserAction } from '@/app/utils'

export async function POST(request: Request) {
  // Perform mutation
  await updateDatabase(request)
  
  // Logging blocks the response
  const userAgent = request.headers.get('user-agent') || 'unknown'
  await logUserAction({ userAgent })
  
  return new Response(JSON.stringify({ status: 'success' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
```

**Correct: non-blocking**

```tsx
import { after } from 'next/server'
import { headers } from 'next/headers'
import { logUserAction } from '@/app/utils'

export async function POST(request: Request) {
  // Perform mutation
  await updateDatabase(request)
  
  // Log after response is sent
  after(async () => {
    const userAgent = (await headers()).get('user-agent') || 'unknown'
    await logUserAction({ userAgent }) // noncritical telemetry; never log session credentials
  })
  
  return new Response(JSON.stringify({ status: 'success' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
```

The response no longer awaits this telemetry. after is not a durable queue; static prerenders can run it at build/revalidation time.

**Common use cases:**

- Analytics tracking

- Noncritical diagnostic logging (required audit persistence stays awaited or durably queued)

- Best-effort notifications (durably queue required delivery)

- Optional cache warming (keep required invalidation in the success contract)

- Cleanup tasks

**Important notes:**

- `after()` runs even if the response fails or redirects

- Works in supported Server Actions, Route Handlers and Server Components. Request APIs inside the callback are allowed in actions/handlers; capture needed values before scheduling from Server Components.

Reference: [https://nextjs.org/docs/app/api-reference/functions/after](https://nextjs.org/docs/app/api-reference/functions/after)

---

### R4.1 Defer State Reads to Usage Point

**Impact: MEDIUM (avoids unnecessary subscriptions)**

Don't subscribe to dynamic state (searchParams, localStorage) if you only read it inside callbacks.

**Incorrect: subscribes to all searchParams changes**

```tsx
function ShareButton({ chatId }: { chatId: string }) {
  const searchParams = useSearchParams()

  const handleShare = () => {
    const ref = searchParams.get('ref')
    shareChat(chatId, { ref })
  }

  return <button onClick={handleShare}>Share</button>
}
```

**Correct: reads on demand, no subscription**

```tsx
function ShareButton({ chatId }: { chatId: string }) {
  const handleShare = () => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    shareChat(chatId, { ref })
  }

  return <button onClick={handleShare}>Share</button>
}
```

---

### R4.11 Use Transitions for Non-Urgent Updates

**Impact: MEDIUM (maintains UI responsiveness)**

For React 18+, transitions mark React state updates as interruptible non-urgent rendering. The callback executes immediately; synchronous computation, DOM writes and network work are not deferred or cancelled. Do not transition controlled-input state. Measure expensive rendering before applying this optimization.

**Ordinary update (only problematic if its render work is costly):**

```tsx
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
}
```

**Alternative: lower-priority React update:**

```tsx
import { startTransition } from 'react'

function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => {
      startTransition(() => setScrollY(window.scrollY))
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
}
```

---

### R4.17 Prevent Hydration Mismatch Without Flickering

**Impact: MEDIUM (matching initial server/client markup)**

Keep the server output and first client render consistent. If the server knows a theme preference (for example from a cookie), pass that same value to the client. Reading localStorage during SSR throws; mutating React-owned markup with a script does not automatically make hydration agree.

**Incorrect: browser-only API during SSR**

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
  const theme = localStorage.getItem('theme') || 'light'
  return <div className={theme}>{children}</div>
}
```

**Correct when the server supplies the preference (separate client module):**

```tsx
'use client'
import { useState, type ReactNode } from 'react'
export function ThemeWrapper({ initialTheme, children }: {
  initialTheme: 'light' | 'dark'; children: ReactNode
}) {
  const [theme, setTheme] = useState(initialTheme)
  return <div className={theme}>
    <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>Toggle theme</button>
    {children}
  </div>
}
```

If only localStorage knows the preference, a matching default followed by an Effect is valid but may flash. A framework-supported pre-hydration theme script needs explicit DOM ownership, matching React expectations and CSP handling; it cannot promise zero flicker generically. Never derive server authorization from a client theme/auth-storage script.

Reference: https://react.dev/reference/react-dom/client/hydrateRoot

---

### R4.18 Suppress Expected Hydration Mismatches

**Impact: LOW-MEDIUM (avoids noisy hydration warnings for known differences)**

In SSR frameworks, dates or locale formatting can unavoidably differ. Keep IDs stable (for example useId or a server-provided ID), rather than generating mismatched random IDs. For these *expected* mismatches, wrap the dynamic text in an element with `suppressHydrationWarning` to prevent noisy warnings. This works one level deep; React does not patch mismatched text under suppression. It silences a warning, not the underlying difference.

**Incorrect: known mismatch warnings**

```tsx
function Timestamp() {
  return <span>{new Date().toLocaleString()}</span>
}
```

**Correct: suppress expected mismatch only**

```tsx
function Timestamp() {
  return (
    <span suppressHydrationWarning>
      {new Date().toLocaleString()}
    </span>
  )
}
```

---

### R4.21 Use useTransition Over Manual Loading States

**Impact: LOW (pending state for React transitions)**

Use `useTransition` for transition-related pending UI. Manual loading state or a data library remains valid, especially on React 18, whose transitions do not track async Actions. The example requires React 19 async Action support; post-await state is wrapped in another transition. Requests are not automatically cancelled or ordered.

**React 19 example with stale-result guard:**

```tsx
import { useRef, useState, useTransition } from 'react'
function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const latestRequest = useRef(0)
  function handleSearch(value: string) {
    setQuery(value) // Controlled input remains urgent.
    const requestId = ++latestRequest.current
    setError(null)
    startTransition(async () => {
      try {
        const data = await fetchResults(value)
        if (requestId === latestRequest.current) {
          startTransition(() => setResults(data))
        }
      } catch {
        if (requestId === latestRequest.current) {
          startTransition(() => setError('Search failed'))
        }
      }
    })
  }
  return <>
    <input value={query} onChange={e => handleSearch(e.target.value)} />
    {isPending && <Spinner />}
    {error && <p role="alert">{error}</p>}
    <ResultsList results={results} />
  </>
}
```

The guard prevents old responses replacing newer results; it does not abort requests. isPending can include older outstanding Actions. Adapt cancellation and loading semantics to the data layer.

Reference: https://react.dev/reference/react/useTransition

## Rule Interactions

- **AsyncDeferAwait + AsyncParallel** are the foundational pair. DeferAwait naturally enables parallelism: by creating promises at the top of a function and awaiting them where results are needed, independent fetches overlap automatically. When reviewing code, check for DeferAwait first — applying it often reveals AsyncParallel opportunities.
- **AsyncSuspenseBoundaries + ServerParallelFetching** work together in Next.js App Router. Independent reads can overlap; Suspense reveals the chosen loading regions as their required work resolves. Exact starts and reveal timing depend on the renderer/framework. The subtree awaiting Promise.all waits for all results, while surrounding layouts or parent fallbacks can still stream.
- **AsyncApiRoutes + ClientSwrDedup** address the same problem from opposite ends. API routes consolidate server-side; SWR deduplicates client-side. For a page with many data needs, use API routes to reduce roundtrips, then SWR to cache and deduplicate across component remounts.
- **ClientEventListeners + ClientPassiveEventListeners + RerenderTransitions** (cross-ref) form the event-driven data update chain. Passive touch/wheel listeners can avoid cancellation waits; cleanup releases subscriptions; transitions only reprioritize React rendering, not fetches or callback CPU work.
- **ServerAfterNonblocking + AsyncDependencies** interact when server actions need to perform follow-up work (analytics, cache warming) after the primary data operation. Use `after()` for truly non-blocking side effects; use AsyncDependencies patterns when the follow-up genuinely depends on the primary result.

## Anti-Patterns (Severity Calibration)

### CRITICAL
- **Hidden waterfall in utility function**: A `getPageData()` function that internally does `const user = await getUser(); const settings = await getSettings(user.id); const posts = await getPosts();` — where `getPosts` does not actually need `settings`. The waterfall is invisible at the call site, making it persist across refactors.
- **No Suspense on slow queries**: An entire page blocks rendering because one component awaits a 3-second database query without a Suspense boundary. All other content — navigation, sidebar, cached data — waits unnecessarily.

### HIGH
- **Client-side fetch cascade**: Component A fetches user, passes userId to Component B, which fetches posts, passes postIds to Component C, which fetches comments. Each component renders and fetches sequentially. Solution: consolidate into a single API route or use parallel server component fetching.
- **Redundant requests despite SWR**: Check keys, cache-provider scope and deduplication timing. Slightly different options alone do not prove three network requests.

### MEDIUM
- **Heavy scroll handler**: Optimize or throttle expensive work. Adding passive to a noncancelable scroll event does not fix callback CPU cost.
- **Unversioned localStorage cache**: Client reads `JSON.parse(localStorage.getItem('settings'))` without validating the shape, causing crashes when the settings schema changes in a deployment.

## Examples

### Example 1: Waterfall Elimination (DeferAwait + Parallel + SuspenseBoundaries)

```tsx
// BEFORE: illustrative sequential waits, no local streaming boundary
async function DashboardPage() {
  const user = await getUser()           // 200ms
  const stats = await getStats()          // 400ms (independent!)
  const notifications = await getNotifs() // 300ms (independent!)
  return <Dashboard user={user} stats={stats} notifications={notifications} />
}

// AFTER: eligible independent fetches + Suspense streaming
async function DashboardPage() {
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <UserHeader />  {/* fetches user internally */}
      </Suspense>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsPanel />  {/* fetches stats internally */}
      </Suspense>
      <Suspense fallback={<NotifSkeleton />}>
        <NotificationFeed />  {/* fetches notifications internally */}
      </Suspense>
    </>
  )
}
```

Each component fetches its own data. Suspense boundaries let fast components render immediately. With the illustrative durations and negligible overhead, overlapping waits approach the slowest query rather than their sum; this is not a measured latency guarantee.

### Example 2: API Route Consolidation + SWR Dedup (ApiRoutes + SwrDedup + PassiveEventListeners)

```tsx
// BEFORE: 3 client-side roundtrips + non-passive scroll
function ActivityFeed() {
  const { data: user } = useSWR('/api/user')
  const { data: feed } = useSWR('/api/feed')
  const { data: suggestions } = useSWR('/api/suggestions')

  useEffect(() => {
    const handler = () => loadMore()
    window.addEventListener('scroll', handler) // scroll is noncancelable; expensive work can still cause jank
    return () => window.removeEventListener('scroll', handler)
  }, [])
}

// AFTER: single API route + passive scroll + transition
function ActivityFeed() {
  const { data } = useSWR('/api/activity-bundle')
  // Server-side: API route runs all 3 fetches in Promise.all()

  useEffect(() => {
    const handler = () => {
      void loadMore() // The data layer owns loading/races; transition its React result update if needed
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
}

// API route consolidates server-side
export async function GET() {
  const [user, feed, suggestions] = await Promise.all([
    getUser(), getFeed(), getSuggestions()
  ])
  return Response.json({ user, feed, suggestions })
}
```

### Example 3: Server Parallel Fetching + After (ServerParallelFetching + ServerAfterNonblocking + AsyncDependencies)

```tsx
// BEFORE: sequential server work blocks response
async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)
  await trackPageView(id)        // 150ms wasted — user waits for analytics
  const related = await getRelated(product.categoryId) // genuine dependency
  return <ProductDetail product={product} related={related} />
}

// AFTER: parallel where possible, after() for non-blocking, chain only true deps
import { after } from 'next/server'

async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)

  // Non-blocking: analytics after response
  after(() => trackPageView(id))

  // True dependency: related needs categoryId from product
  const related = await getRelated(product.categoryId)

  return <ProductDetail product={product} related={related} />
}
```

## Does Not Cover

- **Component architecture decisions** — See Architecture (R1) for composition patterns, prop design, and context interfaces.
- **Server Component boundaries** — See ServerComponents (R3) for RSC-specific caching, serialization, and auth patterns.
- **Re-render optimization** — See RenderingPerf (R4) for memoization, derived state, and hydration.
- **Bundle size of data-fetching libraries** — See BundleSize (R5) for import optimization.

## Sources

- Vercel Engineering — React Best Practices (January 2026), MIT
- React Documentation — Suspense, use(), Server Components
- Next.js Documentation — Data Fetching, API Routes, next/after

## Candidate verification references

- https://nextjs.org/docs/app/getting-started/fetching-data
- https://nextjs.org/docs/app/guides/authentication
- https://react.dev/reference/react/Suspense
- https://swr.vercel.app/docs/mutation
- https://swr.vercel.app/docs/advanced/performance
- https://www.w3.org/TR/cssom-view-1/#scrolling
- https://developer.chrome.com/blog/scrolling-intervention
- https://html.spec.whatwg.org/multipage/webstorage.html
- https://nextjs.org/docs/app/api-reference/functions/after
- https://nextjs.org/blog/next-15-1
- https://react.dev/reference/react/useTransition
- https://react.dev/reference/react-dom/client/hydrateRoot
