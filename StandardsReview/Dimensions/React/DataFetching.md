# Data Fetching — React

> Every millisecond spent waiting for data that could have been fetched in parallel is a millisecond of user-visible delay that compounds across every page load.

## Mental Model

Data fetching is the primary bottleneck in most React applications. The rules in this dimension address a single core problem: the request waterfall. A waterfall occurs whenever an async operation waits for a previous one to complete before it can start, even when the two operations are independent. In server-rendered Next.js applications, waterfalls are doubly expensive because they block the response stream — the user sees nothing until the slowest sequential chain completes.

The 11 primary rules in this dimension form three layers of defense against waterfalls. The first layer is structural: `AsyncParallel` and `AsyncDeferAwait` ensure that independent operations run concurrently and that promises are created early but awaited late. The second layer is boundary-based: `AsyncSuspenseBoundaries` and `AsyncApiRoutes` structure the component tree so that slow data does not block fast content. The third layer is client-side: `ClientSwrDedup` prevents redundant network requests, `ClientEventListeners` and `ClientPassiveEventListeners` ensure that event-driven data fetching does not create jank, and `ClientLocalstorageSchema` prevents client-side state corruption that causes unnecessary refetches.

The server-side rules (`ServerParallelFetching`, `ServerAfterNonblocking`) extend this same anti-waterfall philosophy to the server rendering pipeline. `AsyncDependencies` handles the edge case where operations genuinely depend on each other, providing patterns for minimizing the sequential portion.

Together, these rules ensure that data reaches the user as fast as the network allows — no faster, but critically, no slower.

## Consumer Guide

### When Reviewing Code

Scan for these violations in priority order:

1. **Sequential awaits on independent data** (CRITICAL) — Look for consecutive `await` statements where the second call does not use the result of the first. This is the most common and highest-impact violation. `const user = await getUser(); const posts = await getPosts();` — if posts do not need the user, this is a waterfall.
2. **Missing Suspense boundaries** (CRITICAL) — A page component that awaits multiple data sources before rendering anything. Without Suspense, the entire page blocks on the slowest query.
3. **Barrel fetch functions** (HIGH) — A single `getData()` function that fetches everything a page needs sequentially inside it, hiding the waterfall from the component level.
4. **SWR/React Query without dedup** (MEDIUM) — Multiple components independently fetching the same resource without a shared cache key.
5. **Non-passive event listeners** (MEDIUM) — Scroll or touch listeners without `{ passive: true }`, which block the browser's compositor thread.
6. **Unvalidated localStorage reads** (LOW) — Reading client-side cached data without schema validation, risking stale or corrupted state after deployments.

### When Designing / Planning

Before implementing data fetching for a page or feature:

- **Map the data dependency graph.** Draw which data depends on which. Independent branches should be `Promise.all()`'d. Dependent chains should be minimized to the true dependency (e.g., fetch user ID first, then fetch user-specific data).
- **Decide where each fetch lives.** Server Components can fetch directly. Client components need SWR/React Query with deduplication. API routes consolidate multiple backend calls.
- **Plan Suspense boundaries.** Each independent data source should have its own Suspense boundary so fast content streams immediately while slow content loads.
- **Consider the API route consolidation pattern.** If a client component needs 3+ backend calls, consolidate them into a single API route that runs them in parallel server-side, eliminating client-side roundtrips.

### When Implementing

Apply rules in this sequence:

1. **Identify independence** — For every pair of async calls, ask: "Does the second need the result of the first?" If no, parallelize with `Promise.all()` (AsyncParallel).
2. **Defer awaits** — Create promises early, await them at the point of use (AsyncDeferAwait). This naturally enables parallelism even when the code reads sequentially.
3. **Wrap with Suspense** — Each independent data source gets its own Suspense boundary (AsyncSuspenseBoundaries). Place boundaries as close to the data source as possible.
4. **Deduplicate client fetches** — Use SWR or React Query with stable cache keys (ClientSwrDedup). Never fetch the same resource from two components independently.
5. **Optimize event handlers** — Add `{ passive: true }` to scroll/touch listeners (ClientPassiveEventListeners). Use proper cleanup in event subscriptions (ClientEventListeners).
6. **Validate client storage** — Schema-validate localStorage reads (ClientLocalstorageSchema) to handle format changes across deployments.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| AsyncDeferAwait | CRITICAL | Move await to usage point; create promise early to enable parallelism |
| AsyncParallel | CRITICAL | Promise.all() for independent operations — 2-10x improvement |
| AsyncDependencies | HIGH | Minimize sequential chains to true data dependencies only |
| AsyncApiRoutes | HIGH | Consolidate multiple backend calls into a single API route |
| AsyncSuspenseBoundaries | CRITICAL | Stream content with Suspense boundaries around independent data |
| ClientSwrDedup | MEDIUM-HIGH | Deduplicate client-side fetches with SWR/React Query cache keys |
| ClientEventListeners | MEDIUM | Proper setup/teardown for event-driven data subscriptions |
| ClientPassiveEventListeners | MEDIUM | Use passive: true on scroll/touch listeners to prevent jank |
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

This optimization is especially valuable when the skipped branch is frequently taken, or when the deferred operation is expensive.

---

### R2.2 Promise.all() for Independent Operations

**Impact: CRITICAL (2-10× improvement)**

When async operations have no interdependencies, execute them concurrently using `Promise.all()`.

**Incorrect: sequential execution, 3 round trips**

```typescript
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()
```

**Correct: parallel execution, 1 round trip**

```typescript
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
])
```

---

### R2.3 Dependency-Based Parallelization

**Impact: CRITICAL (2-10× improvement)**

For operations with partial dependencies, use `better-all` to maximize parallelism. It automatically starts each task at the earliest possible moment.

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

**Impact: CRITICAL (2-10× improvement)**

In API routes and Server Actions, start independent operations immediately, even if you don't await them yet.

**Incorrect: config waits for auth, data waits for both**

```typescript
export async function GET(request: Request) {
  const session = await auth()
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
  const session = await sessionPromise
  const [config, data] = await Promise.all([
    configPromise,
    fetchData(session.user.id)
  ])
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

SWR enables request deduplication, caching, and revalidation across component instances.

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
import { useSWRMutation } from 'swr/mutation'

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

**Impact: MEDIUM (eliminates scroll delay caused by event listeners)**

Add `{ passive: true }` to touch and wheel event listeners to enable immediate scrolling. Browsers normally wait for listeners to finish to check if `preventDefault()` is called, causing scroll delay.

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
  } catch {
    // Throws in incognito/private browsing, quota exceeded, or disabled
  }
}

function loadConfig() {
  try {
    const data = localStorage.getItem(`userConfig:${VERSION}`)
    return data ? JSON.parse(data) : null
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
      saveConfig({ theme: old.darkMode ? 'dark' : 'light', language: old.lang })
      localStorage.removeItem('userConfig:v1')
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

**Always wrap in try-catch:** `getItem()` and `setItem()` throw in incognito/private browsing (Safari, Firefox), when quota exceeded, or when disabled.

**Benefits:** Schema evolution via versioning, reduced storage size, prevents storing tokens/PII/internal flags.

---

### R2.10 Parallel Data Fetching with Component Composition

**Impact: CRITICAL (eliminates server-side waterfalls)**

React Server Components execute sequentially within a tree. Restructure with composition to parallelize data fetching.

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

**Correct: both fetch simultaneously**

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

Use Next.js's `after()` to schedule work that should execute after a response is sent. This prevents logging, analytics, and other side effects from blocking the response.

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
import { headers, cookies } from 'next/headers'
import { logUserAction } from '@/app/utils'

export async function POST(request: Request) {
  // Perform mutation
  await updateDatabase(request)
  
  // Log after response is sent
  after(async () => {
    const userAgent = (await headers()).get('user-agent') || 'unknown'
    const sessionCookie = (await cookies()).get('session-id')?.value || 'anonymous'
    
    logUserAction({ sessionCookie, userAgent })
  })
  
  return new Response(JSON.stringify({ status: 'success' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
```

The response is sent immediately while logging happens in the background.

**Common use cases:**

- Analytics tracking

- Audit logging

- Sending notifications

- Cache invalidation

- Cleanup tasks

**Important notes:**

- `after()` runs even if the response fails or redirects

- Works in Server Actions, Route Handlers, and Server Components

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

Mark frequent, non-urgent state updates as transitions to maintain UI responsiveness.

**Incorrect: blocks UI on every scroll**

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

**Correct: non-blocking updates**

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

**Impact: MEDIUM (avoids visual flicker and hydration errors)**

When rendering content that depends on client-side storage (localStorage, cookies), avoid both SSR breakage and post-hydration flickering by injecting a synchronous script that updates the DOM before React hydrates.

**Incorrect: breaks SSR**

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
  // localStorage is not available on server - throws error
  const theme = localStorage.getItem('theme') || 'light'
  
  return (
    <div className={theme}>
      {children}
    </div>
  )
}
```

Server-side rendering will fail because `localStorage` is undefined.

**Incorrect: visual flickering**

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState('light')
  
  useEffect(() => {
    // Runs after hydration - causes visible flash
    const stored = localStorage.getItem('theme')
    if (stored) {
      setTheme(stored)
    }
  }, [])
  
  return (
    <div className={theme}>
      {children}
    </div>
  )
}
```

Component first renders with default value (`light`), then updates after hydration, causing a visible flash of incorrect content.

**Correct: no flicker, no hydration mismatch**

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <div id="theme-wrapper">
        {children}
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme') || 'light';
                var el = document.getElementById('theme-wrapper');
                if (el) el.className = theme;
              } catch (e) {}
            })();
          `,
        }}
      />
    </>
  )
}
```

The inline script executes synchronously before showing the element, ensuring the DOM already has the correct value. No flickering, no hydration mismatch.

This pattern is especially useful for theme toggles, user preferences, authentication states, and any client-only data that should render immediately without flashing default values.

---

### R4.18 Suppress Expected Hydration Mismatches

**Impact: LOW-MEDIUM (avoids noisy hydration warnings for known differences)**

In SSR frameworks (e.g., Next.js), some values are intentionally different on server vs client (random IDs, dates, locale/timezone formatting). For these *expected* mismatches, wrap the dynamic text in an element with `suppressHydrationWarning` to prevent noisy warnings. Do not use this to hide real bugs. Don’t overuse it.

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

**Impact: LOW (reduces re-renders and improves code clarity)**

Use `useTransition` instead of manual `useState` for loading states. This provides built-in `isPending` state and automatically manages transitions.

**Incorrect: manual loading state**

```tsx
function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (value: string) => {
    setIsLoading(true)
    setQuery(value)
    const data = await fetchResults(value)
    setResults(data)
    setIsLoading(false)
  }

  return (
    <>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {isLoading && <Spinner />}
      <ResultsList results={results} />
    </>
  )
}
```

**Correct: useTransition with built-in pending state**

```tsx
import { useTransition, useState } from 'react'

function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()

  const handleSearch = (value: string) => {
    setQuery(value) // Update input immediately
    
    startTransition(async () => {
      // Fetch and update results
      const data = await fetchResults(value)
      setResults(data)
    })
  }

  return (
    <>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {isPending && <Spinner />}
      <ResultsList results={results} />
    </>
  )
}
```

**Benefits:**

- **Automatic pending state**: No need to manually manage `setIsLoading(true/false)`

- **Error resilience**: Pending state correctly resets even if the transition throws

- **Better responsiveness**: Keeps the UI responsive during updates

- **Interrupt handling**: New transitions automatically cancel pending ones

Reference: [https://react.dev/reference/react/useTransition](https://react.dev/reference/react/useTransition)


## Rule Interactions

- **AsyncDeferAwait + AsyncParallel** are the foundational pair. DeferAwait naturally enables parallelism: by creating promises at the top of a function and awaiting them where results are needed, independent fetches overlap automatically. When reviewing code, check for DeferAwait first — applying it often reveals AsyncParallel opportunities.
- **AsyncSuspenseBoundaries + ServerParallelFetching** work together in Next.js App Router. Parallel fetching ensures the server starts all data requests simultaneously; Suspense boundaries ensure the response streams as each resolves independently. Without Suspense, parallel fetching still blocks on the slowest query before sending any HTML.
- **AsyncApiRoutes + ClientSwrDedup** address the same problem from opposite ends. API routes consolidate server-side; SWR deduplicates client-side. For a page with many data needs, use API routes to reduce roundtrips, then SWR to cache and deduplicate across component remounts.
- **ClientEventListeners + ClientPassiveEventListeners + RerenderTransitions** (cross-ref) form the event-driven data update chain. Passive listeners prevent scroll jank; proper cleanup prevents memory leaks; transitions prevent re-renders from blocking the main thread during data updates.
- **ServerAfterNonblocking + AsyncDependencies** interact when server actions need to perform follow-up work (analytics, cache warming) after the primary data operation. Use `after()` for truly non-blocking side effects; use AsyncDependencies patterns when the follow-up genuinely depends on the primary result.

## Anti-Patterns (Severity Calibration)

### CRITICAL
- **Hidden waterfall in utility function**: A `getPageData()` function that internally does `const user = await getUser(); const settings = await getSettings(user.id); const posts = await getPosts();` — where `getPosts` does not actually need `settings`. The waterfall is invisible at the call site, making it persist across refactors.
- **No Suspense on slow queries**: An entire page blocks rendering because one component awaits a 3-second database query without a Suspense boundary. All other content — navigation, sidebar, cached data — waits unnecessarily.

### HIGH
- **Client-side fetch cascade**: Component A fetches user, passes userId to Component B, which fetches posts, passes postIds to Component C, which fetches comments. Each component renders and fetches sequentially. Solution: consolidate into a single API route or use parallel server component fetching.
- **Redundant SWR calls**: Three components on the same page each call `useSWR('/api/user')` with slightly different options, causing three network requests instead of one. Missing shared configuration or inconsistent cache keys.

### MEDIUM
- **Non-passive scroll listener causing fetch jank**: A scroll-based infinite loader using `addEventListener('scroll', handler)` without `{ passive: true }`, causing frame drops during rapid scrolling because the browser cannot optimize scroll handling.
- **Unversioned localStorage cache**: Client reads `JSON.parse(localStorage.getItem('settings'))` without validating the shape, causing crashes when the settings schema changes in a deployment.

## Examples

### Example 1: Waterfall Elimination (DeferAwait + Parallel + SuspenseBoundaries)

```tsx
// BEFORE: 3 sequential awaits, no streaming — total: 900ms
async function DashboardPage() {
  const user = await getUser()           // 200ms
  const stats = await getStats()          // 400ms (independent!)
  const notifications = await getNotifs() // 300ms (independent!)
  return <Dashboard user={user} stats={stats} notifications={notifications} />
}

// AFTER: parallel fetches + Suspense streaming — total: 400ms
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

Each component fetches its own data. Suspense boundaries let fast components render immediately. Total time = slowest single query (400ms), not the sum (900ms).

### Example 2: API Route Consolidation + SWR Dedup (ApiRoutes + SwrDedup + PassiveEventListeners)

```tsx
// BEFORE: 3 client-side roundtrips + non-passive scroll
function ActivityFeed() {
  const { data: user } = useSWR('/api/user')
  const { data: feed } = useSWR('/api/feed')
  const { data: suggestions } = useSWR('/api/suggestions')

  useEffect(() => {
    const handler = () => loadMore()
    window.addEventListener('scroll', handler) // blocks compositor
    return () => window.removeEventListener('scroll', handler)
  }, [])
}

// AFTER: single API route + passive scroll + transition
function ActivityFeed() {
  const { data } = useSWR('/api/activity-bundle')
  // Server-side: API route runs all 3 fetches in Promise.all()

  useEffect(() => {
    const handler = () => {
      startTransition(() => loadMore())
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
async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  await trackPageView(params.id)        // 150ms wasted — user waits for analytics
  const related = await getRelated(product.categoryId) // genuine dependency
  return <ProductDetail product={product} related={related} />
}

// AFTER: parallel where possible, after() for non-blocking, chain only true deps
import { after } from 'next/server'

async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  // Non-blocking: analytics after response
  after(() => trackPageView(params.id))

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
