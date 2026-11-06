# Server Components — React

> React Server Components shift computation to the server, but only deliver their promise when authentication, caching, and serialization boundaries are handled with deliberate care.

## Mental Model

React Server Components (RSC) represent a fundamental architectural shift: components that execute exclusively on the server, sending only their rendered output to the client. This eliminates client-side JavaScript for those components entirely — no hydration, no bundle cost, direct database access. But this power comes with a sharp boundary: the server/client divide is a serialization wall. Every prop passed from a Server Component to a Client Component must use React-supported serializable values. This is not ordinary JSON; the framework transports an RSC payload, sometimes embedded alongside initial HTML.

The 5 primary rules in this dimension address the three failure modes of RSC adoption. The first failure mode is security: Server Actions (functions with `"use server"`) are exposed as public HTTP endpoints, yet developers often treat them like private functions. `ServerAuthActions` exists because a single unauthenticated Server Action can expose the entire database. The second failure mode is performance: repeated reads can add cost when neither React nor the framework/data layer deduplicates them. Request caching and cross-request caching have distinct scope and freshness tradeoffs. The third failure mode is data bloat: `ServerSerialization` and `ServerDedupProps` prevent the common mistake of passing entire database objects across the boundary when only a few fields are needed, potentially increasing transferred data; extra props do not themselves disable streaming.

The two cross-referenced rules from DataFetching (`ServerParallelFetching`, `ServerAfterNonblocking`) extend the server-side story by ensuring that multiple server components fetch data concurrently and that non-critical work (analytics, logging) does not block the response stream.

When these rules work together, RSC delivers on its architectural promise: zero-bundle server logic, minimal serialization overhead, secure mutations, and efficient caching.

## Consumer Guide

### When Reviewing Code

Scan for these violations in priority order:

1. **Unprotected sensitive actions** (CRITICAL when exploitable) — Directly callable actions must enforce the resource policy in the action or its trusted data layer. Intentionally public actions may allow anonymous use.
2. **Over-serialization at RSC boundaries** (HIGH) — A Server Component passing a full database entity (e.g., `user` with 50 fields) to a Client Component that uses 3 fields. Look for `<ClientComponent user={user} />` patterns.
3. **Missing React.cache() on repeated server queries** (HIGH) — The same database query or auth check called from multiple server components in one request without `React.cache()` wrapping. Check whether the data layer already deduplicates before reporting repeated work.
4. **Redundant derived props** (LOW) — Check whether both original and transformed data are needed. Shared references across siblings do not by themselves prove duplicate serialization.
5. **Unsupported boundary props** — Ordinary function closures and unsupported class instances cannot cross the RSC boundary. React supports Date, Map and Set (with serializable contents); check the pinned framework integration. Do not expect silent JSON coercion.

### When Designing / Planning

Before adding Server Components to a feature:

- **Draw the server/client boundary explicitly.** List which components are Server Components and which are Client Components. Every prop crossing the boundary will be serialized — design the interface to be minimal.
- **Identify all mutations.** Each Server Action needs validation and enforcement of its resource policy; protected operations need authentication and authorization. Plan these before implementation, not after.
- **Map data access patterns.** If multiple components need the same data, wrap the fetcher in `React.cache()` for request-scoped dedup, or use an LRU cache for data that is stable across requests (configuration, feature flags).
- **Decide what stays on the server.** Sensitive logic (pricing calculations, authorization checks, API keys) should never reach Client Components. RSC makes this natural — but only if the boundary is correctly placed.

### When Implementing

Apply rules in this sequence:

1. **Secure all Server Actions first** — Before any other work, enforce each `"use server"` function's resource policy and validate inputs (ServerAuthActions). Add input validation with Zod or similar. This is a security requirement, not an optimization.
2. **Wrap shared queries in React.cache()** — Repeated pure reads with measured cost can be wrapped in `React.cache()` (ServerCacheReact). Pay attention to argument types — only primitive args or same-reference objects produce cache hits.
3. **Consider cross-request caching** — For suitable stable shared reads, choose a cache only after defining freshness and deployment scope. An in-process LRU is one option.
4. **Minimize serialization** — At every Server-to-Client boundary, pass only the fields the Client Component actually uses (ServerSerialization). Destructure on the server side.
5. **Avoid redundant derived props** — Share references where convenient and measure payloads; a client wrapper or context is optional, not required for shared sibling props.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| ServerAuthActions | CRITICAL | Enforce the resource policy inside directly callable Server Actions |
| ServerCacheReact | MEDIUM | Wrap server queries in React.cache() for per-request deduplication |
| ServerCacheLru | MEDIUM | Use LRU cache for cross-request stable data (config, feature flags) |
| ServerDedupProps | MEDIUM | Avoid unnecessary original-plus-derived props; measure payload duplication |
| ServerSerialization | HIGH | Pass only needed fields across the RSC boundary to minimize payload |

### Cross-Referenced Rules (from other dimensions)

| Rule | Primary Dimension | Why Relevant Here |
|------|-------------------|-------------------|
| ServerParallelFetching | DataFetching | Parallel data fetching across server components prevents RSC waterfalls |
| ServerAfterNonblocking | DataFetching | next/after defers non-critical server work to avoid blocking the response stream |


---

### R3.1 Authenticate Server Actions Like API Routes

**Impact: CRITICAL (prevents unauthorized access to server mutations)**

Server Actions (functions with `"use server"`) are exposed as public endpoints, just like API routes. For protected operations, verify authentication and authorization **inside** each Server Action or its trusted data-access layer—do not rely solely on middleware, layout guards, or page-level checks, as Server Actions can be invoked directly.

Treat the action as a public entry point. Public signup or feedback actions can deliberately accept anonymous calls; validation and abuse controls still apply.

**Incorrect: no authentication check**

```typescript
'use server'

export async function deleteUser(userId: string) {
  // Anyone can call this! No auth check
  await db.user.delete({ where: { id: userId } })
  return { success: true }
}
```

**Correct: authentication inside the action**

```typescript
'use server'

import { verifySession } from '@/lib/auth'
import { unauthorized } from '@/lib/errors'

export async function deleteUser(userId: string) {
  // Always check auth inside the action
  const session = await verifySession()
  
  if (!session) {
    throw unauthorized('Must be logged in')
  }
  
  // Check authorization too
  if (session.user.role !== 'admin' && session.user.id !== userId) {
    throw unauthorized('Cannot delete other users')
  }
  
  await db.user.delete({ where: { id: userId } })
  return { success: true }
}
```

**With input validation:**

```typescript
'use server'

import { verifySession } from '@/lib/auth'
import { z } from 'zod'

const updateProfileSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email()
})

export async function updateProfile(data: unknown) {
  // Validate input first
  const validated = updateProfileSchema.parse(data)
  
  // Then authenticate
  const session = await verifySession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  
  // Then authorize
  if (session.user.id !== validated.userId) {
    throw new Error('Can only update own profile')
  }
  
  // Finally perform the mutation
  await db.user.update({
    where: { id: validated.userId },
    data: {
      name: validated.name,
      email: validated.email
    }
  })
  
  return { success: true }
}
```

Reference: [https://nextjs.org/docs/app/guides/authentication](https://nextjs.org/docs/app/guides/authentication)

---

### R3.2 Per-Request Deduplication with React.cache()

**Impact: MEDIUM (deduplicates within request)**

Use a shared `React.cache()` wrapper for repeated pure reads during a Server Component render. Its cache is invalidated between server requests; calls outside React's cache context may execute normally. Do not use memoization to skip mutation or authorization work.

**Usage:**

```typescript
import { cache } from 'react'

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  return await db.user.findUnique({
    where: { id: session.user.id }
  })
})
```

Within the same RSC cache context, matching calls to this shared wrapper reuse its result (including errors).

**Avoid inline objects as arguments:**

`React.cache()` uses shallow equality (`Object.is`) to determine cache hits. Inline objects create new references each call, preventing cache hits.

**Incorrect: always cache miss**

```typescript
const getUser = cache(async (params: { uid: number }) => {
  return await db.user.findUnique({ where: { id: params.uid } })
})

// Each call creates new object, never hits cache
getUser({ uid: 1 })
getUser({ uid: 1 })  // Cache miss, runs query again
```

**Correct: cache hit**

```typescript
const params = { uid: 1 }
getUser(params)  // Query runs
getUser(params)  // Cache hit (same reference)
```

If you must pass objects, pass the same reference:

**Next.js-Specific Note:**

Next.js request memoization can deduplicate eligible identical GET/HEAD fetches during a React render. It is distinct from persistent fetch caching, depends on the framework version/options, and does not cover arbitrary Route Handler or mutation work. React.cache is one option for repeated non-fetch reads:

- Database queries (Prisma, Drizzle, etc.)

- Heavy computations

- Authentication checks

- File system operations

- Any non-fetch async work

Use `React.cache()` to deduplicate these operations across your component tree.

Reference: [https://react.dev/reference/react/cache](https://react.dev/reference/react/cache)

---

### R3.3 Cross-Request LRU Caching

**Impact: HIGH (caches across requests)**

`React.cache()` only works within one request. For stable shared reads, a bounded process cache is an option. Define freshness, invalidation and tenant/access keys; authorization still runs for each protected request.

**Implementation:**

```typescript
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 5 * 60 * 1000  // 5 minutes
})

export async function getPublicConfig(key: string) {
  const cached = cache.get(key)
  if (cached) return cached

  const config = await readPublicConfig(key)
  cache.set(key, config)
  return config
}

// Request 1: DB query, result cached
// Request 2: cache hit, no DB query
```

Use when sequential user actions hit multiple endpoints needing the same data within seconds.

**Deployment scope:** A module cache is local to a warm process or function instance. Requests may reuse an instance, but eviction, restarts and multiple instances prevent a shared or durable guarantee.

Use an external store when cross-instance consistency or durability is required. Never use an unkeyed shared cache for user-specific authorization results.

Reference: [https://github.com/isaacs/node-lru-cache](https://github.com/isaacs/node-lru-cache)

---

### R3.4 Avoid Duplicate Serialization in RSC Props

**Impact: LOW (potential payload reduction; measure the RSC response)**

Avoid sending both original and derived collections when the client only needs one. React may reuse references in its RSC transport; equal values in separately created objects are not the same reference. Exact wire deduplication and byte counts are implementation details, not a public serialization-size contract.

**Potential redundancy (when the client needs the original and can cheaply sort):**

```tsx
<ClientList usernames={usernames} usernamesOrdered={[...usernames].sort()} />
```

**Alternative (separate client module):**

```tsx
'use client'
import { useMemo } from 'react'
export function ClientList({ usernames }: { usernames: string[] }) {
  const sorted = useMemo(() => [...usernames].sort(), [usernames])
  return <ul>{sorted.map((name, i) => <li key={i}>{name}</li>)}</ul>
}
```

Keep authorization filtering on the server. Prefer sending only the derived result when the original is unnecessary; expensive transformations may also belong on the server. Shared references passed to sibling clients are not automatically duplicate payloads. Measure before introducing a client wrapper merely for deduplication.

Reference: https://react.dev/reference/rsc/use-client

---

### R3.5 Minimize Serialization at RSC Boundaries

**Impact: HIGH (reduces data transfer size)**

The React Server/Client boundary encodes supported values in an RSC payload; it does not simply stringify every property as JSON. Values sent to the browser are exposed to it, even if not rendered. This serialized data directly impacts page weight and load time, so **size matters a lot**. Only pass fields that the client actually uses.

**Before: passes all 50 fields across the client boundary**

Server module `page.tsx` (with the application's existing `fetchUser` import):

```tsx
import Profile from './Profile'
export default async function Page() {
  const user = await fetchUser()
  return <Profile user={user} />
}
```

Separate client module `Profile.tsx` (using the application's `User` type):

```tsx
'use client'
export default function Profile({ user }: { user: User }) {
  return <div>{user.name}</div>
}
```

**After: passes only the field the client needs**

Server module `page.tsx`:

```tsx
import Profile from './Profile'
export default async function Page() {
  const user = await fetchUser()
  return <Profile name={user.name} />
}
```

Separate client module `Profile.tsx`:

```tsx
'use client'
export default function Profile({ name }: { name: string }) {
  return <div>{name}</div>
}
```

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


## Rule Interactions

- **ServerAuthActions + ServerCacheReact** interact directly. Auth checks (`getCurrentUser()`) are the most commonly deduplicated server-side call. Wrapping the auth check in `React.cache()` means that 5 Server Components calling `getCurrentUser()` only hit the auth system once per request. Wrapping an action with React.cache does not turn it into a cross-user cache. Keep actions callable on every invocation; separate request deduplication of reads from persistent caching.
- **ServerSerialization + ServerDedupProps** are complementary checks: send only needed fields, then inspect whether original-plus-derived values add unnecessary payload. Shared references across siblings do not alone prove duplicate wire copies or require a wrapper.
- **ServerCacheReact + ServerCacheLru** address different cache scopes. React.cache() is request-scoped — it deduplicates within a single server render. LRU cache is process-scoped — it caches across requests. Use React.cache() for user-specific data (auth, user preferences); use LRU for shared data (site config, feature flags). Nesting them (LRU inside React.cache()) provides both layers.
- **ServerParallelFetching (cross-ref) + ServerCacheReact** work together: parallel fetching ensures multiple server components can overlap their queries, while React.cache() ensures that overlapping queries (e.g., two components both needing the current user) do not result in duplicate database calls.

## Anti-Patterns (Severity Calibration)

### CRITICAL
- **Unauthenticated Server Action**: A `"use server"` function that deletes, updates, or reads sensitive data without checking the session. This is a security vulnerability — Server Actions are HTTP POST endpoints that anyone can call with the right payload. Each mutation must enforce its intended access policy; anonymous mutations may be intentional.
- **Cached auth across users**: A process-level cache (LRU) that returns the same user's data for other users violates isolation. Persistent caches need appropriate user/tenant keys, freshness and invalidation; neither an LRU nor request-scoped `React.cache()` replaces authorization of the current operation.

### HIGH
- **Full entity serialization**: `<ClientProfile user={user} />` where `user` contains 50 database fields, timestamps, relations, and internal IDs, but the Client Component only renders `name` and `avatar`. Unneeded fields may increase transfer size and expose data in the client-visible RSC payload.
- **Repeated expensive auth reads**: Report observed redundant work when neither the auth library nor the data layer deduplicates it. Missing React.cache alone is not a defect.

### MEDIUM
- **Redundant derived payloads**: Report unnecessary data actually transferred; passing the same object to two Client Components is not sufficient evidence.
- **Unsupported class instances across RSC boundary**: Project custom class instances to supported values. `createdAt={new Date()}` is supported by React RSC; ISO strings are an optional application contract, not a universal fix.

## Examples

### Example 1: Secure Server Action with Cached Auth (AuthActions + CacheReact)

```tsx
// BEFORE: No auth + redundant auth calls across components
'use server'
export async function deletePost(postId: string) {
  await db.post.delete({ where: { id: postId } })  // Anyone can delete any post!
}

// Separate Server Component call sites may repeat auth work unless already deduplicated.

// Separate module: lib/current-user.ts (no module-level 'use server')
import { cache } from 'react'
import { verifySession } from '@/lib/auth'

// Matching calls reuse results inside an RSC cache context; action calls may execute uncached.
export const getCurrentUser = cache(async () => {
  const session = await verifySession()
  if (!session?.user?.id) return null
  return db.user.findUnique({ where: { id: session.user.id } })
})

```

```tsx
// Separate module: actions.ts
'use server'
import { getCurrentUser } from './lib/current-user'

export async function deletePost(postId: string) {
  if (typeof postId !== 'string' || !postId) throw new Error('Invalid post ID')
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  // Prisma-style illustrative API: authorization predicate and delete are one operation.
  const result = await db.post.deleteMany({
    where: user.role === 'admin' ? { id: postId } : { id: postId, authorId: user.id }
  })
  if (result.count !== 1) throw new Error('Not found or forbidden')
}
```

### Example 2: Minimal Serialization + Dedup (Serialization + DedupProps)

Before, server `ProfilePage.tsx` imports the existing client components and the application's `getUser` helper:

```tsx
import ClientHeader from './ClientHeader'
import ClientSidebar from './ClientSidebar'
// BEFORE: Full user object crosses the boundary (same reference may be reused)
async function ProfilePage() {
  const user = await getUser()  // 50 fields
  return (
    <>
      <ClientHeader user={user} />    {/* uses name, avatar */}
      <ClientSidebar user={user} />   {/* uses name, role */}
    </>
  )
}
```

After, replace that server module with the following (retaining its `getUser` import):

```tsx
import ProfileLayout from './ProfileLayout'
// AFTER: Minimal fields; shared client wrapper is optional composition
async function ProfilePage() {
  const user = await getUser()
  const profileData = {
    name: user.name,
    avatar: user.avatar,
    role: user.role,
  }
  return <ProfileLayout profile={profileData} />
}
```

Separate client `ProfileLayout.tsx`, using the application's `ProfileData`, `Header` and `Sidebar` imports:

```tsx
'use client'
export default function ProfileLayout({ profile }: { profile: ProfileData }) {
  return (
    <>
      <Header name={profile.name} avatar={profile.avatar} />
      <Sidebar name={profile.name} role={profile.role} />
    </>
  )
}
```

This sends fewer fields. A shared reference does not imply two full copies; byte savings require measuring the actual RSC response.

### Example 3: Layered Caching (CacheReact + CacheLru + ParallelFetching)

```tsx
// Request-scoped cache for user-specific data
const getCurrentUser = cache(async () => {
  const session = await auth()
  return session?.user ?? null
})

// Process-scoped LRU for shared stable data
const featureFlagCache = new LRUCache<string, FeatureFlags>({ max: 100, ttl: 60_000 })

async function getFeatureFlags(): Promise<FeatureFlags> {
  const cached = featureFlagCache.get('flags')
  if (cached) return cached
  const flags = await fetchFlags()
  featureFlagCache.set('flags', flags)
  return flags
}

// Server components fetch in parallel — no waterfall
async function DashboardPage() {
  // Independent sibling rendering allows these reads to overlap
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <DashboardHeader />    {/* calls getCurrentUser() */}
      </Suspense>
      <Suspense fallback={<ContentSkeleton />}>
        <DashboardContent />   {/* calls getCurrentUser() + getFeatureFlags() */}
      </Suspense>
    </>
  )
}
// getCurrentUser() runs once (React.cache dedup)
// getFeatureFlags() may not even hit the network (LRU cache)
```

## Does Not Cover

- **Client-side data fetching patterns** — See DataFetching (R2) for SWR, event listeners, and client-side caching.
- **Component composition within Server Components** — See Architecture (R1) for compound components and context patterns.
- **Bundle size of client-side code at RSC boundaries** — See BundleSize (R5) for dynamic imports and code splitting.
- **Hydration and re-render optimization** — See RenderingPerf (R4) for hydration mismatch prevention and rendering performance.

## Sources

- Vercel Engineering — React Best Practices (January 2026), MIT
- React Documentation — Server Components, React.cache(), Server Actions Security
- Next.js Documentation — Server Actions and Mutations, Caching, Authentication

## Candidate verification references

- https://react.dev/reference/rsc/use-server
- https://nextjs.org/docs/app/guides/authentication
- https://react.dev/reference/react/cache
- https://nextjs.org/docs/app/getting-started/fetching-data
- https://vercel.com/docs/fluid-compute
- https://react.dev/reference/rsc/use-client
- https://nextjs.org/docs/app/api-reference/functions/after
- https://nextjs.org/blog/next-15-1
