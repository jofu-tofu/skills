# JavaScript Performance — React

> Framework-level optimization means nothing if the raw JavaScript underneath is doing O(n^2) work, thrashing the DOM, or recomputing values that could be cached — JavaScript performance is the foundation that all other optimizations rest on.

## Mental Model

The 15 rules in this dimension operate below the React abstraction layer. While React manages the virtual DOM, component lifecycle, and rendering pipeline, the actual work inside components — iterating arrays, looking up data, manipulating the DOM, computing derived values — runs as plain JavaScript. Inefficient JavaScript inside a perfectly optimized React component still produces a slow application.

These rules cluster into four concern areas. The first is **data structure selection** (3 rules): choosing the right data structure eliminates algorithmic complexity. `JsIndexMaps` replaces O(n) repeated `.find()` calls with typically efficient Map lookups (not guaranteed constant time). `JsSetMapLookups` uses Set for membership tests instead of Array.includes(). `JsTosortedImmutable` uses immutable sort to avoid mutating shared arrays in a framework built on immutability.

The second concern is **iteration efficiency** (4 rules): reducing the number of passes over data and short-circuiting early. `JsCombineIterations` merges multiple `.filter().map().reduce()` chains into a single pass. `JsLengthCheckFirst` adds a length guard before expensive array operations. `JsEarlyExit` returns from functions as soon as the result is known. `JsMinMaxLoop` avoids spreading large arrays into `Math.max()` which can overflow the call stack.

The third concern is **caching and memoization** (3 rules): avoiding redundant computation. `JsCachePropertyAccess` caches deeply nested property lookups. `JsCacheFunctionResults` caches expensive function results across calls. `JsCacheStorage` caches repeated localStorage/sessionStorage access to avoid synchronous I/O in hot paths.

The fourth concern is **DOM and event patterns** (2 rules + 3 advanced): `JsBatchDomCss` batches DOM reads and writes to prevent layout thrashing. `JsHoistRegexp` moves regular expression compilation outside hot loops. The advanced rules (`AdvancedEventHandlerRefs`, `AdvancedInitOnce`, `AdvancedUseLatest`) address React-specific JavaScript patterns: subscription ownership, per-module initialization guards, and latest-value reads in Effect callbacks.

These are optimization candidates, not guaranteed speedups. Profile realistic inputs, preserve observable semantics and include allocation, construction and invalidation costs.

## Consumer Guide

### When Reviewing Code

Scan for these patterns in descending impact order:

1. **Repeated .find() in loops** (HIGH) — Any pattern where `.find()` is called inside `.map()` or `.forEach()` on a second array. This is O(n*m) where an index Map makes it O(n+m). Common in data joining operations.
2. **Layout thrashing** (HIGH) — Interleaved DOM reads and writes: `el.offsetHeight; el.style.height = '100px'; el2.offsetHeight; el2.style.height = '200px';`. A read after invalidation can require layout work. Batch all reads, then all writes.
3. **Multiple array passes** (MEDIUM) — `.filter().map()` or `.filter().reduce()` chains that could be a single `.reduce()`. Each pass allocates an intermediate array and iterates the full collection.
4. **Spread into Math.max/min** (MEDIUM) — `Math.max(...largeArray)` can exceed an implementation-dependent argument limit because each element becomes a function argument.
5. **RegExp inside loops** (MEDIUM) — `new RegExp(pattern)` or regex literal inside a hot loop, creating a new RegExp object each iteration; compilation may be cached.
6. **Deep property access in tight loops** (LOW) — `items[i].user.profile.settings.theme` accessed repeatedly without caching the intermediate reference.

### When Designing / Planning

Before implementing data-heavy features:

- **Estimate the data size.** For collections under 100 items, naive patterns are fine. For 1,000+, data structure choice matters. For 10,000+, algorithmic complexity dominates.
- **Identify join operations.** Any place where two data sources are correlated by ID is a candidate for index Maps. Plan the Map construction upfront rather than retrofitting.
- **Plan DOM interaction batching.** If a feature reads measurements (dimensions, scroll position) and writes styles, ensure all reads happen before all writes within each frame.
- **Decide on caching strategy.** For expensive computations called with the same arguments (formatters, validators, parsers), plan a caching layer (memoization, LRU, or simple Map cache).

### When Implementing

Apply rules based on the code pattern you encounter:

1. **Data joining?** Build index Maps first (JsIndexMaps), use Set for membership checks (JsSetMapLookups).
2. **Multiple array passes?** Combine into single iteration (JsCombineIterations). Add length guard for optional processing (JsLengthCheckFirst). Return early when possible (JsEarlyExit).
3. **Repeated computation?** Cache function results (JsCacheFunctionResults). Cache property access chains (JsCachePropertyAccess). Cache storage reads (JsCacheStorage).
4. **DOM manipulation?** Batch reads then writes (JsBatchDomCss). Hoist regex out of loops (JsHoistRegexp). Use immutable sort (JsTosortedImmutable).
5. **React-specific patterns?** Consider latest callback reads in Effects (React 19.2+ useEffectEvent or a synchronized ref), and define initialization scope/cleanup. EffectEvent does not guarantee a stable function identity.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| JsBatchDomCss | HIGH | Batch DOM reads before writes to prevent layout thrashing |
| JsIndexMaps | MEDIUM | Build Map index for repeated lookups instead of array .find() |
| JsCachePropertyAccess | LOW-MEDIUM | Cache deep property chains in local variables in tight loops |
| JsCacheFunctionResults | MEDIUM | Memoize expensive function calls with a cache layer |
| JsCacheStorage | LOW-MEDIUM | Cache localStorage/sessionStorage reads to avoid synchronous I/O |
| JsCombineIterations | MEDIUM | Merge chained .filter().map() into single-pass .reduce() |
| JsLengthCheckFirst | LOW | Guard expensive operations with array length check |
| JsEarlyExit | LOW-MEDIUM | Return early from functions when result is determined |
| JsHoistRegexp | LOW-MEDIUM | Compile regex outside loops to avoid recompilation per iteration |
| JsMinMaxLoop | MEDIUM | Use loop-based min/max for large arrays to avoid stack overflow |
| JsSetMapLookups | MEDIUM | Consider Set for repeated membership checks; include construction cost |
| JsTosortedImmutable | LOW | Use toSorted() for immutable sort — avoids mutating shared arrays in React |
| AdvancedEventHandlerRefs | LOW | Store event handlers in refs or useEffectEvent for stable subscriptions |
| AdvancedInitOnce | LOW | Initialize values once without useEffect using ref or module-level patterns |
| AdvancedUseLatest | LOW | Keep a ref to the latest value to read in callbacks without re-render deps |


---

### R6.1 Avoid Layout Thrashing

**Impact: MEDIUM (prevents forced synchronous layouts and reduces performance bottlenecks)**

Avoid interleaving style writes with layout reads. Reading layout after layout-affecting writes can force synchronous style/layout work when cached measurements are invalid. Not every property read or write forces a full reflow.

**This is OK: browser batches style changes**

```typescript
function updateElementStyles(element: HTMLElement) {
  // Each line invalidates style, but browser batches the recalculation
  element.style.width = '100px'
  element.style.height = '200px'
  element.style.backgroundColor = 'blue'
  element.style.border = '1px solid black'
}
```

**Incorrect: interleaved reads and writes force reflows**

```typescript
function layoutThrashing(element: HTMLElement) {
  element.style.width = '100px'
  const width = element.offsetWidth  // Forces reflow
  element.style.height = '200px'
  const height = element.offsetHeight  // Forces another reflow
}
```

**Correct: batch writes, then read once**

```typescript
function updateElementStyles(element: HTMLElement) {
  // Batch all writes together
  element.style.width = '100px'
  element.style.height = '200px'
  element.style.backgroundColor = 'blue'
  element.style.border = '1px solid black'
  
  // Read after all writes are done (single reflow)
  const { width, height } = element.getBoundingClientRect()
}
```

**Correct: batch reads, then writes**

```typescript
function updateElementStyles(element: HTMLElement) {
  const { width, height } = element.getBoundingClientRect() // old geometry
  element.classList.add('highlighted-box')
  return { width, height }
}
```

Use the reads-first version only when old geometry is intended. If new geometry is required, group writes then measure. CSS classes are an optional organization policy.

**React example:**

```tsx
// Incorrect: interleaving style changes with layout queries
function Box({ isHighlighted }: { isHighlighted: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (ref.current && isHighlighted) {
      ref.current.style.width = '100px'
      const width = ref.current.offsetWidth // Forces layout
      ref.current.style.height = '200px'
    }
  }, [isHighlighted])
  
  return <div ref={ref}>Content</div>
}

// Correct: toggle class
function Box({ isHighlighted }: { isHighlighted: boolean }) {
  return (
    <div className={isHighlighted ? 'highlighted-box' : ''}>
      Content
    </div>
  )
}
```

Prefer CSS classes over inline styles when possible. CSS files are cached by the browser, and classes provide better separation of concerns and are easier to maintain.

See [this gist](https://gist.github.com/paulirish/5d52fb081b3570c81e3a) and [CSS Triggers](https://csstriggers.com/) for more information on layout-forcing operations.

---

### R6.2 Build Index Maps for Repeated Lookups

**Impact: workload-dependent (repeated lookups)**

Consider a Map for repeated key lookups. Preserve duplicate-key behavior: find returns the first match, while repeated Map.set would keep the last. The indexing examples, including the combined example, assume validated string or non-NaN identifiers. `find` with strict equality never matches NaN, whereas Map uses SameValueZero and can match it. If NaN is permitted, retain the scan or exclude NaN keys to preserve its behavior. Include index construction and memory in the comparison.

**Incorrect (O(n) per lookup):**

```typescript
function processOrders(orders: Order[], users: User[]) {
  return orders.map(order => ({
    ...order,
    user: users.find(u => u.id === order.userId)
  }))
}
```

**Alternative: indexed lookup (average sublinear access required by ECMAScript)**

```typescript
function processOrders(orders: Order[], users: User[]) {
  const userById = new Map<User['id'], User>()
  for (const user of users) {
    if (!userById.has(user.id)) userById.set(user.id, user) // preserve first match
  }

  return orders.map(order => ({
    ...order,
    user: userById.get(order.userId)
  }))
}
```

With a hash-table implementation, construction and repeated lookup often give an expected O(n+m) join. ECMAScript requires average sublinear access, not worst-case O(1).

The scan can make up to orders.length × users.length comparisons; index construction and lookups are different operations, not an exact 1M-to-2K benchmark.

---

### R6.3 Cache Property Access in Loops

**Impact: LOW-MEDIUM (reduces lookups)**

Cache repeated property access only when values and array length stay invariant throughout the loop. Getters, proxies or process() mutations can make hoisting change behavior; engines may already optimize ordinary property access.

**Incorrect: 3 lookups × N iterations**

```typescript
for (let i = 0; i < arr.length; i++) {
  process(obj.config.settings.value)
}
```

**Alternative under the invariant-value contract: one chain evaluation before the loop**

```typescript
const value = obj.config.settings.value
const len = arr.length
for (let i = 0; i < len; i++) {
  process(value)
}
```

---

### R6.4 Cache Repeated Function Calls

**Impact: MEDIUM (avoid redundant computation)**

Cache pure deterministic computation only when repeated cost warrants it. Bound memory and define invalidation. Module state can be shared across server requests; do not cache user authorization or secrets without an explicit isolation policy.

**Incorrect: redundant computation**

```typescript
function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div>
      {projects.map(project => {
        // slugify() called 100+ times for same project names
        const slug = slugify(project.name)
        
        return <ProjectCard key={project.id} slug={slug} />
      })}
    </div>
  )
}
```

**Correct: cached results**

```typescript
// Module-level cache
const slugifyCache = new Map<string, string>()

function cachedSlugify(text: string): string {
  if (slugifyCache.has(text)) {
    return slugifyCache.get(text)!
  }
  const result = slugify(text)
  if (slugifyCache.size >= 1000) slugifyCache.clear() // illustrative bounded policy
  slugifyCache.set(text, result)
  return result
}

function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div>
      {projects.map(project => {
        // Computed only once per unique project name
        const slug = cachedSlugify(project.name)
        
        return <ProjectCard key={project.id} slug={slug} />
      })}
    </div>
  )
}
```

A readable cookie's presence is not proof of login. Server authentication/authorization must remain authoritative. For mutable preferences, define who invalidates cached values before reuse; a hook-local memo or request-scoped cache may fit better than module state.

Reference: [https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast](https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast)

---

### R6.5 Cache Storage API Calls

**Impact: LOW-MEDIUM (reduces expensive I/O)**

These browser APIs are synchronous; cache only measured hot reads with a known invalidation contract. The example is browser-only, assumes same-document writes use its wrapper, and uses a bounded small key set. External changes can otherwise leave stale values.

**Incorrect: reads storage on every call**

```typescript
function getTheme() {
  return localStorage.getItem('theme') ?? 'light'
}
// Called 10 times = 10 storage reads
```

**Correct: Map cache**

```typescript
const storageCache = new Map<string, string | null>()

function getLocalStorage(key: string) {
  if (!storageCache.has(key)) {
    try {
      if (storageCache.size >= 100) storageCache.clear()
      storageCache.set(key, localStorage.getItem(key))
    } catch { return null }
  }
  return storageCache.get(key)
}

function setLocalStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
    storageCache.set(key, value)
    return true
  } catch { return false }
}
```

A module Map is usable outside hooks, but its browser-only storage access and invalidation contract still apply.

**Cookies need a separate freshness policy:**

```typescript
// Browser-only UI preference lookup; never proof of authorization.
function getCookie(name: string) {
  for (const part of document.cookie.split(';')) {
    const separator = part.indexOf('=')
    if (separator < 0) continue
    if (part.slice(0, separator).trim() === name) return part.slice(separator + 1)
  }
  return undefined
}
```

Server-set cookie changes do not emit storage events. Avoid indefinite cookie caching unless all writers can invalidate it.

**Invalidate storage on external changes:**

```typescript
window.addEventListener('storage', (e) => {
  if (e.storageArea !== localStorage) return
  if (e.key === null) storageCache.clear() // another document called clear()
  else storageCache.delete(e.key)
})

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    storageCache.clear()
  }
})
```

If storage can change externally (another tab, server-set cookies), invalidate cache:

---

### R6.6 Combine Multiple Array Iterations

**Impact: LOW-MEDIUM (reduces iterations)**

For dense arrays and pure callbacks, a combined loop may avoid passes/temporary arrays. Fusion changes callback order, sparse-array handling and side effects; keep the original when those semantics matter and benchmark before preferring a less readable form.

**Incorrect: 3 iterations**

```typescript
const admins = users.filter(u => u.isAdmin)
const testers = users.filter(u => u.isTester)
const inactive = users.filter(u => !u.isActive)
```

**Correct: 1 iteration**

```typescript
const admins: User[] = []
const testers: User[] = []
const inactive: User[] = []

for (const user of users) {
  if (user.isAdmin) admins.push(user)
  if (user.isTester) testers.push(user)
  if (!user.isActive) inactive.push(user)
}
```

---

### R6.7 Early Length Check for Array Comparisons

**Impact: MEDIUM-HIGH (avoids expensive operations when lengths differ)**

When comparing arrays with expensive operations (sorting, deep equality, serialization), check lengths first. If lengths differ, the arrays cannot be equal.

In real-world applications, this optimization is especially valuable when the comparison runs in hot paths (event handlers, render loops).

**Incorrect: always runs expensive comparison**

```typescript
function hasChanges(current: string[], original: string[]) {
  // Always sorts and joins, even when lengths differ
  return current.sort().join() !== original.sort().join()
}
```

Two O(n log n) sorts run even when `current.length` is 5 and `original.length` is 100. Joining also loses element boundaries (for example ['a,b', 'c'] and ['a', 'b,c'] collide), and the original sorts mutate inputs. The replacement compares elements and preserves input arrays.

**Correct (O(1) length check first):**

```typescript
function hasChanges(current: string[], original: string[]) {
  // Early return if lengths differ
  if (current.length !== original.length) {
    return true
  }
  // Only sort when lengths match
  const currentSorted = [...current].sort()
  const originalSorted = [...original].sort()
  for (let i = 0; i < currentSorted.length; i++) {
    if (currentSorted[i] !== originalSorted[i]) {
      return true
    }
  }
  return false
}
```

This new approach is more efficient because:

- It avoids the overhead of sorting and joining the arrays when lengths differ

- It avoids consuming memory for the joined strings (especially important for large arrays)

- It avoids mutating the original arrays

- It returns early when a difference is found

---

### R6.8 Early Return from Functions

**Impact: LOW-MEDIUM (avoids unnecessary computation)**

Return early only when the contract accepts the first error and no later processing is required. The examples below intentionally change last-error reporting to first-error reporting; they are not behavior-equivalent for multiple invalid fields.

**Last-error policy (valid when required):**

```typescript
function validateUsers(users: User[]) {
  let hasError = false
  let errorMessage = ''
  
  for (const user of users) {
    if (!user.email) {
      hasError = true
      errorMessage = 'Email required'
    }
    if (!user.name) {
      hasError = true
      errorMessage = 'Name required'
    }
    // Continues checking all users even after error found
  }
  
  return hasError ? { valid: false, error: errorMessage } : { valid: true }
}
```

**Alternative under a first-error policy:**

```typescript
function validateUsers(users: User[]) {
  for (const user of users) {
    if (!user.email) {
      return { valid: false, error: 'Email required' }
    }
    if (!user.name) {
      return { valid: false, error: 'Name required' }
    }
  }

  return { valid: true }
}
```

---

### R6.9 Hoist RegExp Creation

**Impact: LOW-MEDIUM (avoids recreation)**

Consider hoisting a constant RegExp or memoizing a query-dependent one only for a measured hot path. Global/sticky test/exec mutate lastIndex, so reset or isolate state. Engine compilation caching means construction is not proof of full recompilation.

**Incorrect: new RegExp every render**

```tsx
function Highlighter({ text, query }: Props) {
  const regex = new RegExp(`(${query})`, 'gi')
  const parts = text.split(regex)
  return <>{parts.map((part, i) => ...)}</>
}
```

**Correct: memoize or hoist**

```tsx
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Highlighter({ text, query }: Props) {
  const regex = useMemo(
    () => new RegExp(`(${escapeRegex(query)})`, 'gi'),
    [query]
  )
  const parts = text.split(regex)
  return <>{parts.map((part, i) => ...)}</>
}
```

**Warning: global regex has mutable state**

```typescript
const regex = /foo/g
regex.test('foo')  // true, lastIndex = 3
regex.test('foo')  // false, lastIndex = 0
```

Global (`g`) and sticky (`y`) regex state can change test/exec results. The escapeRegex helper above must escape literal query input; it is an application helper, not an assumed browser API.

---

### R6.10 Use Loop for Min/Max Instead of Sort

**Impact: LOW (O(n) instead of O(n log n))**

Finding the smallest or largest element only requires a single pass through the array. Sorting is wasteful and slower.

**Incorrect (O(n log n) - sort to find latest):**

```typescript
interface Project {
  id: string
  name: string
  updatedAt: number
}

function getLatestProject(projects: Project[]) {
  const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt)
  return sorted[0]
}
```

Sorts the entire array just to find the maximum value.

**Incorrect (O(n log n) - sort for oldest and newest):**

```typescript
function getOldestAndNewest(projects: Project[]) {
  const sorted = [...projects].sort((a, b) => a.updatedAt - b.updatedAt)
  return { oldest: sorted[0], newest: sorted[sorted.length - 1] }
}
```

Still sorts unnecessarily when only min/max are needed.

**Correct (O(n) - single loop):**

```typescript
function getLatestProject(projects: Project[]) {
  if (projects.length === 0) return undefined
  
  let latest = projects[0]
  
  for (let i = 1; i < projects.length; i++) {
    if (projects[i].updatedAt > latest.updatedAt) {
      latest = projects[i]
    }
  }
  
  return latest
}

function getOldestAndNewest(projects: Project[]) {
  if (projects.length === 0) return { oldest: undefined, newest: undefined }
  
  let oldest = projects[0]
  let newest = projects[0]
  
  for (let i = 1; i < projects.length; i++) {
    if (projects[i].updatedAt < oldest.updatedAt) oldest = projects[i]
    if (projects[i].updatedAt >= newest.updatedAt) newest = projects[i] // last tied newest, as in stable ascending sort
  }
  
  return { oldest, newest }
}
```

Single pass through the array, no copying, no sorting.

**Alternative: Math.min/Math.max for small arrays**

```typescript
const numbers = [5, 2, 8, 1, 9]
const min = Math.min(...numbers)
const max = Math.max(...numbers)
```

For very large arrays, argument-count limits can make spread calls throw. Limits depend on engine and call context; use a loop for unbounded inputs. These examples assume finite numeric timestamps and preserve stable-sort tie/empty behavior.

---

### R6.11 Use Set/Map for Repeated Lookups

**Impact: workload-dependent (average lookup improvement)**

Consider Set/Map when repeated checks amortize construction/memory costs. Do not rebuild a Set for each membership test. ECMAScript promises average sublinear access, not universal O(1).

**Incorrect (O(n) per check):**

```typescript
const allowedIds = ['a', 'b', 'c', ...]
items.filter(item => allowedIds.includes(item.id))
```

**Alternative: prebuilt Set for repeated checks:**

```typescript
const allowedIds = new Set(['a', 'b', 'c', ...])
items.filter(item => allowedIds.has(item.id))
```

---

### R6.12 Use toSorted() Instead of sort() for Immutability

**Impact: MEDIUM-HIGH (prevents mutation bugs in React state)**

`.sort()` mutates the array in place, which can cause bugs with React state and props. Use `.toSorted()` where ES2023 support is declared, or `[...array].sort(compare)` in older supported runtimes. Sorting an exclusively owned scratch array in place is valid.

**Incorrect: mutates original array**

```typescript
function UserList({ users }: { users: User[] }) {
  // Mutates the users prop array!
  const sorted = useMemo(
    () => users.sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  )
  return <div>{sorted.map(renderUser)}</div>
}
```

**Correct: creates new array**

```typescript
function UserList({ users }: { users: User[] }) {
  // Creates new sorted array, original unchanged
  const sorted = useMemo(
    () => users.toSorted((a, b) => a.name.localeCompare(b.name)),
    [users]
  )
  return <div>{sorted.map(renderUser)}</div>
}
```

**Why this matters in React:**

1. Props/state mutations break React's immutability model - React expects props and state to be treated as read-only

2. Mutating shared arrays can invalidate identity-based memoization and change previous state snapshots; stale closures are a separate issue.

**Browser support: fallback for older browsers**

```typescript
// Fallback for older browsers
const sorted = [...items].sort((a, b) => a.value - b.value)
```

Declare ES2023 array-copy method support in the runtime and type-library target. Otherwise use the copy-and-sort fallback above; no framework upgrade alone supplies this method.

**Other immutable array methods:**

- `.toSorted()` - immutable sort

- `.toReversed()` - immutable reverse

- `.toSpliced()` - immutable splice

- `.with()` - immutable element replacement

---

### R6.13 Store Event Handlers in Refs

**Impact: LOW (stable subscriptions)**

When callback changes should not reconnect an Effect subscription, React 19.2+ useEffectEvent can read the latest committed callback. React 18/19.0/19.1 can keep complete dependencies and resubscribe, or use a carefully synchronized ref pattern. Do not omit values that should reconfigure the subscription.

**Valid baseline: re-subscribes when handler identity changes**

```tsx
function useWindowEvent(event: string, handler: (e) => void) {
  useEffect(() => {
    window.addEventListener(event, handler)
    return () => window.removeEventListener(event, handler)
  }, [event, handler])
}
```

**Correct: stable subscription**

```tsx
import { useEffectEvent } from 'react'

function useWindowEvent(event: string, handler: (e) => void) {
  const onEvent = useEffectEvent(handler)

  useEffect(() => {
    window.addEventListener(event, onEvent)
    return () => window.removeEventListener(event, onEvent)
  }, [event])
}
```

**Version and scope:**

`useEffectEvent` requires React 19.2+. It reads latest values from Effect-owned callbacks; its returned function identity is not stable and must not be a dependency or general UI event handler.

---

### R6.14 Initialize App Once, Not Per Mount

**Impact: LOW-MEDIUM (avoids duplicate init in development)**

For browser-app initialization, an Effect with a module guard can avoid repeated setup on remount. Module duplication/HMR, separate roots and server request sharing change its scope. Keep initialization idempotent; subscriptions still need per-setup cleanup and must reconnect after Strict Mode cleanup.

**Incorrect: runs twice in dev, re-runs on remount**

```tsx
function Comp() {
  useEffect(() => {
    loadFromStorage()
    checkAuthToken()
  }, [])

  // ...
}
```

**Alternative: once per evaluated browser module instance**

```tsx
let didInit = false

function Comp() {
  useEffect(() => {
    if (didInit) return
    didInit = true
    loadFromStorage()
    checkAuthToken()
  }, [])

  // ...
}
```

Reference: [https://react.dev/learn/you-might-not-need-an-effect#initializing-the-application](https://react.dev/learn/you-might-not-need-an-effect#initializing-the-application)

---

### R6.15 useEffectEvent for Latest Values in Effects

**Impact: LOW (prevents effect re-runs)**

On React 19.2+, useEffectEvent reads latest values from Effect-owned callbacks without making that logic reactive. In this debounce example, the policy is that only query changes restart the timer; if onSearch changes should restart it, keep the original dependency.

**Incorrect: effect re-runs on every callback change**

```tsx
function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(query), 300)
    return () => clearTimeout(timeout)
  }, [query, onSearch])
}
```

**Correct: using React's useEffectEvent**

```tsx
import { useEffectEvent } from 'react';

function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')
  const onSearchEvent = useEffectEvent(onSearch)

  useEffect(() => {
    const timeout = setTimeout(() => onSearchEvent(query), 300)
    return () => clearTimeout(timeout)
  }, [query])
}
```


## Rule Interactions

- **JsIndexMaps + JsSetMapLookups + JsCombineIterations** form the data processing triad. When processing a list that requires joining with another list (IndexMaps), filtering by membership in a set (SetMapLookups), and transforming the result (CombineIterations), applying all three can reduce a 3-pass O(n*m) operation to a single-pass O(n+m) operation. The Map and Set should be constructed once before the main iteration.
- **JsCachePropertyAccess + JsCacheFunctionResults + JsCacheStorage** are all caching strategies at different levels. PropertyAccess caches object traversal within a single function scope. FunctionResults caches computation across multiple function calls. CacheStorage caches I/O across multiple render cycles. When a function reads from storage, traverses a deep object, and computes an expensive result, all three rules apply in sequence.
- **JsBatchDomCss + JsHoistRegexp** address hot-path optimization from different angles. BatchDomCss prevents the browser from recalculating layout between interleaved reads and writes. HoistRegexp avoids repeated object construction when reuse preserves behavior; compilation savings depend on the engine. Profile hot loops before assigning severity or predicting a speedup.
- **AdvancedEventHandlerRefs + AdvancedUseLatest** both solve the stale closure problem but for different use cases. Refs can hold a latest callback, while useEffectEvent supports nonreactive Effect logic without promising stable function identity. When building a custom hook that subscribes to events and needs the latest props, both patterns apply together.
- **AdvancedInitOnce + JsCacheStorage** interact for initialization patterns. InitOnce ensures a value is computed once (e.g., reading and parsing a config from localStorage). CacheStorage prevents repeated reads of the same key. Their scopes differ: a module guard may outlive many mounts; a storage cache needs its own invalidation. Neither ensures exactly-once external effects.

## Anti-Patterns (Severity Calibration)

### CRITICAL
- **Repeated large scans in render**: Profile repeated find operations and consider a first-match-preserving index. Do not assign critical severity or exact operation savings from syntax alone.
- **Layout thrashing in animation frame**: Reading `offsetHeight`, writing `style.height`, reading `offsetWidth`, writing `style.width` in a `requestAnimationFrame` callback. A read after a layout-affecting write can force synchronous layout. The number and cost of layouts depend on invalidation and browser behavior; confirm with a trace.

### HIGH
- **Unbounded spread into Math.max/min**: very large inputs may exceed engine argument limits. Use a loop or reduce for unbounded arrays; no fixed threshold is portable.
- **Multiple array passes for single transformation**: `items.filter(predicate).map(transform).reduce(accumulate)` creates 2 intermediate arrays and iterates 3 times. A fused loop can avoid intermediate arrays when callback ordering, side effects and sparse-array semantics permit; reducers may still allocate their output.

### MEDIUM
- **Regex compilation inside .map()**: `items.map(item => item.name.match(new RegExp(pattern)))` creates a RegExp for every item; the engine may reuse compiled code. Hoist `const re = new RegExp(pattern)` before the loop.
- **Repeated localStorage.getItem in render**: `const theme = localStorage.getItem('theme')` called on every render. This is browser-only synchronous work; measure cost and choose a cache only with a freshness and ownership contract.
- **Array.includes() for set membership**: `blockedIds.includes(id)` in a loop over 10,000 items where `blockedIds` has 500 entries: up to 5,000,000 comparisons. Build the Set once before the loop, then perform membership lookups; account for construction cost.

## Examples

### Example 1: Data Processing Pipeline (IndexMaps + SetMapLookups + CombineIterations + EarlyExit)

```tsx
// BEFORE: repeated scans and intermediate arrays
function OrderDashboard({ orders, users, blockedUserIds }: Props) {
  const activeOrders = orders.filter(o => !blockedUserIds.includes(o.userId))
  const enrichedOrders = activeOrders.map(o => ({
    ...o,
    user: users.find(u => u.id === o.userId)
  }))
  const totalRevenue = enrichedOrders.reduce((sum, o) => sum + o.amount, 0)

  return <Dashboard orders={enrichedOrders} revenue={totalRevenue} />
}

// AFTER: indexed join plus one output-building pass; measure total costs
function OrderDashboard({ orders, users, blockedUserIds }: Props) {
  const userById = useMemo(() => {
    const index = new Map<User['id'], User>()
    for (const user of users) if (!index.has(user.id)) index.set(user.id, user)
    return index
  }, [users])
  const blocked = useMemo(() => new Set(blockedUserIds), [blockedUserIds])

  const { enrichedOrders, totalRevenue } = useMemo(() => {
    if (!orders.length) return { enrichedOrders: [], totalRevenue: 0 }

    let totalRevenue = 0
    const enrichedOrders: EnrichedOrder[] = []

    for (const order of orders) {
      if (blocked.has(order.userId)) continue  // indexed lookup, early skip
      const user = userById.get(order.userId)   // indexed lookup
      enrichedOrders.push({ ...order, user })
      totalRevenue += order.amount
    }

    return { enrichedOrders, totalRevenue }
  }, [orders, userById, blocked])

  return <Dashboard orders={enrichedOrders} revenue={totalRevenue} />
}
```

Four rules interact: IndexMaps for user lookup, SetMapLookups for blocked check, CombineIterations for single-pass processing, EarlyExit via `continue` to skip blocked orders immediately.

### Example 2: DOM Batching with Cached Access (BatchDomCss + CachePropertyAccess + HoistRegexp)

```tsx
// BEFORE: Layout thrashing + recompiled regex + deep access per item
function highlightMatches(items: HTMLElement[], query: string) {
  items.forEach(item => {
    const height = item.offsetHeight                    // read (forces layout)
    item.style.height = `${height}px`                   // write
    const text = item.querySelector('.text')?.textContent
    if (text?.match(new RegExp(query, 'i'))) {          // regex recompiled
      const badge = item.querySelector<HTMLElement>('.badge')
      if (badge) badge.style.display = 'block' // write
    }
  })
}

// AFTER: Batched reads/writes + hoisted regex + cached access
function highlightMatches(items: HTMLElement[], query: string) {
  const pattern = new RegExp(query, 'i')  // compile once

  // Phase 1: batch all reads
  const measurements = items.map(item => ({
    el: item,
    height: item.offsetHeight,
    text: item.querySelector('.text')?.textContent ?? '',
    badge: item.querySelector('.badge') as HTMLElement | null,
  }))

  // Phase 2: batch all writes (no forced reflows)
  for (const { el, height, text, badge } of measurements) {
    el.style.height = `${height}px`
    if (badge && pattern.test(text)) {
      badge.style.display = 'block'
    }
  }
}
```

BatchDomCss separates reads from writes. HoistRegexp compiles the pattern once. CachePropertyAccess stores querySelector results in the measurements array.

### Example 3: Stable Callbacks with Latest Values (EventHandlerRefs + UseLatest + InitOnce)

```tsx
// BEFORE: Effect re-subscribes on every callback change + repeated init
function useWebSocket(url: string, onMessage: (msg: Message) => void) {
  const [ws, setWs] = useState<WebSocket | null>(null)

  useEffect(() => {
    const socket = new WebSocket(url)  // reconnects when onMessage changes!
    socket.addEventListener('message', (e) => onMessage(JSON.parse(e.data)))
    setWs(socket)
    return () => socket.close()
  }, [url, onMessage])  // reconnects when URL or callback identity changes

  return ws
}

// AFTER: subscription with cleanup and latest callback; reconnects on mount/URL change
function useWebSocket(url: string, onMessage: (msg: Message) => void) {
  const onMessageEvent = useEffectEvent(onMessage)  // React 19.2+, latest callback in this Effect
  const [ws, setWs] = useState<WebSocket | null>(null)

  useEffect(() => {
    const socket = new WebSocket(url)
    setWs(socket) // state informs consumers that render from this value

    socket.addEventListener('message', (e) => {
      onMessageEvent(JSON.parse(e.data))  // calls latest onMessage
    })

    return () => socket.close()
  }, [url])  // setup also runs on mount; development Strict Mode may repeat setup/cleanup

  return ws
}
```

useEffectEvent lets this Effect call the latest onMessage without reconnecting for callback changes. Its function identity is not a stable-reference contract. The effect dependency array is minimal, preventing unnecessary reconnections.

## Does Not Cover

- **React rendering optimization** — See RenderingPerf (R4) for memoization, derived state, and re-render prevention.
- **Network and data fetching performance** — See DataFetching (R2) for waterfall elimination and caching.
- **Bundle size of JavaScript** — See BundleSize (R5) for import optimization and code splitting.
- **Component architecture** — See Architecture (R1) for composition patterns that reduce overall code complexity.
- **Server-side JavaScript execution** — See ServerComponents (R3) for server-side caching and deduplication.

## Sources

- Vercel Engineering — React Best Practices (January 2026), MIT
- V8 Blog — Optimizing JavaScript Execution
- Web.dev — Avoid Layout Thrashing, Rendering Performance

## Candidate verification references

- https://www.w3.org/TR/cssom-view-1/
- https://tc39.es/ecma262/multipage/keyed-collections.html
- https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.tosorted
- https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html
- https://react.dev/reference/react/cache
- https://nextjs.org/docs/app/guides/authentication
- https://react.dev/reference/rules/components-and-hooks-must-be-pure
- https://html.spec.whatwg.org/multipage/webstorage.html
- https://html.spec.whatwg.org/multipage/dom.html#dom-document-cookie
- https://react.dev/learn/updating-arrays-in-state
- https://tc39.es/ecma262/multipage/text-processing.html#sec-regexpbuiltinexec
- https://react.dev/reference/react/useEffectEvent
- https://react.dev/blog/2025/10/01/react-19-2
- https://react.dev/reference/react/useEffect
- https://react.dev/reference/react/useRef
- https://react.dev/learn/you-might-not-need-an-effect#initializing-the-application
