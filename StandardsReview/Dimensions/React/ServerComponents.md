# Server Components — React

> React Server Components shift computation to the server, but only deliver their promise when authentication, caching, and serialization boundaries are handled with deliberate care.

## Mental Model

React Server Components (RSC) represent a fundamental architectural shift: components that execute exclusively on the server, sending only their rendered output to the client. This eliminates client-side JavaScript for those components entirely — no hydration, no bundle cost, direct database access. But this power comes with a sharp boundary: the server/client divide is a serialization wall. Every prop passed from a Server Component to a Client Component must be serializable to JSON and embedded in the HTML response.

The 5 primary rules in this dimension address the three failure modes of RSC adoption. The first failure mode is security: Server Actions (functions with `"use server"`) are exposed as public HTTP endpoints, yet developers often treat them like private functions. `ServerAuthActions` exists because a single unauthenticated Server Action can expose the entire database. The second failure mode is performance: without request-scoped caching (`ServerCacheReact`) or cross-request caching (`ServerCacheLru`), server components re-execute expensive queries on every render, negating the performance benefits of server-side execution. The third failure mode is data bloat: `ServerSerialization` and `ServerDedupProps` prevent the common mistake of passing entire database objects across the boundary when only a few fields are needed, inflating page weight and breaking the streaming model.

The two cross-referenced rules from DataFetching (`ServerParallelFetching`, `ServerAfterNonblocking`) extend the server-side story by ensuring that multiple server components fetch data concurrently and that non-critical work (analytics, logging) does not block the response stream.

When these rules work together, RSC delivers on its architectural promise: zero-bundle server logic, minimal serialization overhead, secure mutations, and efficient caching.

## Consumer Guide

### When Reviewing Code

Scan for these violations in priority order:

1. **Unauthenticated Server Actions** (CRITICAL) — Any function with `"use server"` that does not call `verifySession()` or equivalent auth check inside the function body. Middleware-only auth is insufficient because Server Actions are directly callable endpoints.
2. **Over-serialization at RSC boundaries** (HIGH) — A Server Component passing a full database entity (e.g., `user` with 50 fields) to a Client Component that uses 3 fields. Look for `<ClientComponent user={user} />` patterns.
3. **Missing React.cache() on repeated server queries** (HIGH) — The same database query or auth check called from multiple server components in one request without `React.cache()` wrapping. Each call hits the database independently.
4. **Duplicate props across sibling Client Components** (MEDIUM) — Two Client Components receiving the same large object. The data is serialized twice in the RSC payload.
5. **Non-serializable props at the boundary** (MEDIUM) — Attempting to pass functions, Dates, Maps, Sets, or class instances from Server to Client Components. These fail silently or cause hydration mismatches.

### When Designing / Planning

Before adding Server Components to a feature:

- **Draw the server/client boundary explicitly.** List which components are Server Components and which are Client Components. Every prop crossing the boundary will be serialized — design the interface to be minimal.
- **Identify all mutations.** Each Server Action needs its own auth + authz + validation chain. Plan these before implementation, not after.
- **Map data access patterns.** If multiple components need the same data, wrap the fetcher in `React.cache()` for request-scoped dedup, or use an LRU cache for data that is stable across requests (configuration, feature flags).
- **Decide what stays on the server.** Sensitive logic (pricing calculations, authorization checks, API keys) should never reach Client Components. RSC makes this natural — but only if the boundary is correctly placed.

### When Implementing

Apply rules in this sequence:

1. **Secure all Server Actions first** — Before any other work, add authentication and authorization checks to every `"use server"` function (ServerAuthActions). Add input validation with Zod or similar. This is a security requirement, not an optimization.
2. **Wrap shared queries in React.cache()** — Any async function called from multiple server components should be wrapped in `React.cache()` (ServerCacheReact). Pay attention to argument types — only primitive args or same-reference objects produce cache hits.
3. **Add LRU caching for stable data** — Configuration, feature flags, and other cross-request stable data should use an LRU cache (ServerCacheLru) rather than re-fetching on every request.
4. **Minimize serialization** — At every Server-to-Client boundary, pass only the fields the Client Component actually uses (ServerSerialization). Destructure on the server side.
5. **Deduplicate shared props** — When sibling Client Components need the same data, extract it into a shared Server Component parent or use context (ServerDedupProps).

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| ServerAuthActions | CRITICAL | Authenticate and authorize inside every Server Action — they are public endpoints |
| ServerCacheReact | MEDIUM | Wrap server queries in React.cache() for per-request deduplication |
| ServerCacheLru | MEDIUM | Use LRU cache for cross-request stable data (config, feature flags) |
| ServerDedupProps | MEDIUM | Avoid serializing the same data to multiple Client Components |
| ServerSerialization | HIGH | Pass only needed fields across the RSC boundary to minimize payload |

### Cross-Referenced Rules (from other dimensions)

| Rule | Primary Dimension | Why Relevant Here |
|------|-------------------|-------------------|
| ServerParallelFetching | DataFetching | Parallel data fetching across server components prevents RSC waterfalls |
| ServerAfterNonblocking | DataFetching | next/after defers non-critical server work to avoid blocking the response stream |


---

### R3.1 Authenticate Server Actions Like API Routes

**Impact: CRITICAL (prevents unauthorized access to server mutations)**

Server Actions (functions with `"use server"`) are exposed as public endpoints, just like API routes. Always verify authentication and authorization **inside** each Server Action—do not rely solely on middleware, layout guards, or page-level checks, as Server Actions can be invoked directly.

Next.js documentation explicitly states: "Treat Server Actions with the same security considerations as public-facing API endpoints, and verify if the user is allowed to perform a mutation."

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

Use `React.cache()` for server-side request deduplication. Authentication and database queries benefit most.

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

Within a single request, multiple calls to `getCurrentUser()` execute the query only once.

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

In Next.js, the `fetch` API is automatically extended with request memoization. Requests with the same URL and options are automatically deduplicated within a single request, so you don't need `React.cache()` for `fetch` calls. However, `React.cache()` is still essential for other async tasks:

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

`React.cache()` only works within one request. For data shared across sequential requests (user clicks button A then button B), use an LRU cache.

**Implementation:**

```typescript
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 5 * 60 * 1000  // 5 minutes
})

export async function getUser(id: string) {
  const cached = cache.get(id)
  if (cached) return cached

  const user = await db.user.findUnique({ where: { id } })
  cache.set(id, user)
  return user
}

// Request 1: DB query, result cached
// Request 2: cache hit, no DB query
```

Use when sequential user actions hit multiple endpoints needing the same data within seconds.

**With Vercel's [Fluid Compute](https://vercel.com/docs/fluid-compute):** LRU caching is especially effective because multiple concurrent requests can share the same function instance and cache. This means the cache persists across requests without needing external storage like Redis.

**In traditional serverless:** Each invocation runs in isolation, so consider Redis for cross-process caching.

Reference: [https://github.com/isaacs/node-lru-cache](https://github.com/isaacs/node-lru-cache)

---

### R3.4 Avoid Duplicate Serialization in RSC Props

**Impact: LOW (reduces network payload by avoiding duplicate serialization)**

RSC→client serialization deduplicates by object reference, not value. Same reference = serialized once; new reference = serialized again. Do transformations (`.toSorted()`, `.filter()`, `.map()`) in client, not server.

**Incorrect: duplicates array**

```tsx
// RSC: sends 6 strings (2 arrays × 3 items)
<ClientList usernames={usernames} usernamesOrdered={usernames.toSorted()} />
```

**Correct: sends 3 strings**

```tsx
// RSC: send once
<ClientList usernames={usernames} />

// Client: transform there
'use client'
const sorted = useMemo(() => [...usernames].sort(), [usernames])
```

**Nested deduplication behavior:**

```tsx
// string[] - duplicates everything
usernames={['a','b']} sorted={usernames.toSorted()} // sends 4 strings

// object[] - duplicates array structure only
users={[{id:1},{id:2}]} sorted={users.toSorted()} // sends 2 arrays + 2 unique objects (not 4)
```

Deduplication works recursively. Impact varies by data type:

- `string[]`, `number[]`, `boolean[]`: **HIGH impact** - array + all primitives fully duplicated

- `object[]`: **LOW impact** - array duplicated, but nested objects deduplicated by reference

**Operations breaking deduplication: create new references**

- Arrays: `.toSorted()`, `.filter()`, `.map()`, `.slice()`, `[...arr]`

- Objects: `{...obj}`, `Object.assign()`, `structuredClone()`, `JSON.parse(JSON.stringify())`

**More examples:**

```tsx
// ❌ Bad
<C users={users} active={users.filter(u => u.active)} />
<C product={product} productName={product.name} />

// ✅ Good
<C users={users} />
<C product={product} />
// Do filtering/destructuring in client
```

**Exception:** Pass derived data when transformation is expensive or client doesn't need original.

---

### R3.5 Minimize Serialization at RSC Boundaries

**Impact: HIGH (reduces data transfer size)**

The React Server/Client boundary serializes all object properties into strings and embeds them in the HTML response and subsequent RSC requests. This serialized data directly impacts page weight and load time, so **size matters a lot**. Only pass fields that the client actually uses.

**Incorrect: serializes all 50 fields**

```tsx
async function Page() {
  const user = await fetchUser()  // 50 fields
  return <Profile user={user} />
}

'use client'
function Profile({ user }: { user: User }) {
  return <div>{user.name}</div>  // uses 1 field
}
```

**Correct: serializes only 1 field**

```tsx
async function Page() {
  const user = await fetchUser()
  return <Profile name={user.name} />
}

'use client'
function Profile({ name }: { name: string }) {
  return <div>{name}</div>
}
```

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


## Rule Interactions

- **ServerAuthActions + ServerCacheReact** interact directly. Auth checks (`getCurrentUser()`) are the most commonly deduplicated server-side call. Wrapping the auth check in `React.cache()` means that 5 Server Components calling `getCurrentUser()` only hit the auth system once per request. But the cache must be applied to the right function — caching the Server Action itself would cache across users, which is a security vulnerability.
- **ServerSerialization + ServerDedupProps** are complementary strategies for payload reduction. Serialization minimizes per-component data; dedup eliminates redundancy across components. Apply Serialization first (reduce what is sent), then DedupProps (eliminate duplicates of what remains).
- **ServerCacheReact + ServerCacheLru** address different cache scopes. React.cache() is request-scoped — it deduplicates within a single server render. LRU cache is process-scoped — it caches across requests. Use React.cache() for user-specific data (auth, user preferences); use LRU for shared data (site config, feature flags). Nesting them (LRU inside React.cache()) provides both layers.
- **ServerParallelFetching (cross-ref) + ServerCacheReact** work together: parallel fetching ensures multiple server components start their queries simultaneously, while React.cache() ensures that overlapping queries (e.g., two components both needing the current user) do not result in duplicate database calls.

## Anti-Patterns (Severity Calibration)

### CRITICAL
- **Unauthenticated Server Action**: A `"use server"` function that deletes, updates, or reads sensitive data without checking the session. This is a security vulnerability — Server Actions are HTTP POST endpoints that anyone can call with the right payload. Every mutation must verify identity and permissions.
- **Cached auth across users**: Wrapping a Server Action in a process-level cache (LRU) that returns the same user's data for all requests. `React.cache()` (request-scoped) is correct for auth; LRU cache is not.

### HIGH
- **Full entity serialization**: `<ClientProfile user={user} />` where `user` contains 50 database fields, timestamps, relations, and internal IDs, but the Client Component only renders `name` and `avatar`. Every extra field increases page weight and is visible in the HTML source.
- **Missing React.cache() on auth**: Five Server Components each independently calling `await auth()`, resulting in 5 authentication round-trips per request instead of 1.

### MEDIUM
- **Duplicate prop serialization**: Two sibling Client Components both receiving `comments: Comment[]` (100 items), serialized twice in the RSC payload. Solution: lift the shared data to a parent Server Component and pass it through a single Client Component wrapper or context.
- **Passing Dates across RSC boundary**: `<ClientComponent createdAt={new Date()} />` — Date objects are not serializable. The component silently receives a string or null. Pass ISO strings explicitly.

## Examples

### Example 1: Secure Server Action with Cached Auth (AuthActions + CacheReact)

```tsx
// BEFORE: No auth + redundant auth calls across components
'use server'
export async function deletePost(postId: string) {
  await db.post.delete({ where: { id: postId } })  // Anyone can delete any post!
}

// Elsewhere, 3 server components each call:
const user = await auth()  // 3 separate auth round-trips

// AFTER: Auth inside action + cached auth helper
import { cache } from 'react'
import { verifySession } from '@/lib/auth'

// Cached: called by multiple server components, runs once per request
export const getCurrentUser = cache(async () => {
  const session = await verifySession()
  if (!session?.user?.id) return null
  return db.user.findUnique({ where: { id: session.user.id } })
})

'use server'
export async function deletePost(postId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const post = await db.post.findUnique({ where: { id: postId } })
  if (post?.authorId !== user.id && user.role !== 'admin') {
    throw new Error('Forbidden')
  }

  await db.post.delete({ where: { id: postId } })
}
```

### Example 2: Minimal Serialization + Dedup (Serialization + DedupProps)

```tsx
// BEFORE: Full user object serialized twice
async function ProfilePage() {
  const user = await getUser()  // 50 fields
  return (
    <>
      <ClientHeader user={user} />    {/* uses name, avatar */}
      <ClientSidebar user={user} />   {/* uses name, role */}
    </>
  )
}

// AFTER: Minimal fields, single serialization via shared wrapper
async function ProfilePage() {
  const user = await getUser()
  const profileData = {
    name: user.name,
    avatar: user.avatar,
    role: user.role,
  }
  return <ProfileLayout profile={profileData} />
}

'use client'
function ProfileLayout({ profile }: { profile: ProfileData }) {
  return (
    <>
      <Header name={profile.name} avatar={profile.avatar} />
      <Sidebar name={profile.name} role={profile.role} />
    </>
  )
}
```

Serialized data drops from ~4KB (2 x 50 fields) to ~200 bytes (3 fields, once).

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
  // Both kick off simultaneously via parallel server component rendering
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
