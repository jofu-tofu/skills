# JavaScript Performance — React

> Framework-level optimization means nothing if the raw JavaScript underneath is doing O(n^2) work, thrashing the DOM, or recomputing values that could be cached — JavaScript performance is the foundation that all other optimizations rest on.

## Mental Model

The 15 rules in this dimension operate below the React abstraction layer. While React manages the virtual DOM, component lifecycle, and rendering pipeline, the actual work inside components — iterating arrays, looking up data, manipulating the DOM, computing derived values — runs as plain JavaScript. Inefficient JavaScript inside a perfectly optimized React component still produces a slow application.

These rules cluster into four concern areas. The first is **data structure selection** (3 rules): choosing the right data structure eliminates algorithmic complexity. `JsIndexMaps` replaces O(n) repeated `.find()` calls with O(1) Map lookups. `JsSetMapLookups` uses Set for membership tests instead of Array.includes(). `JsTosortedImmutable` uses immutable sort to avoid mutating shared arrays in a framework built on immutability.

The second concern is **iteration efficiency** (4 rules): reducing the number of passes over data and short-circuiting early. `JsCombineIterations` merges multiple `.filter().map().reduce()` chains into a single pass. `JsLengthCheckFirst` adds a length guard before expensive array operations. `JsEarlyExit` returns from functions as soon as the result is known. `JsMinMaxLoop` avoids spreading large arrays into `Math.max()` which can overflow the call stack.

The third concern is **caching and memoization** (3 rules): avoiding redundant computation. `JsCachePropertyAccess` caches deeply nested property lookups. `JsCacheFunctionResults` caches expensive function results across calls. `JsCacheStorage` caches repeated localStorage/sessionStorage access to avoid synchronous I/O in hot paths.

The fourth concern is **DOM and event patterns** (2 rules + 3 advanced): `JsBatchDomCss` batches DOM reads and writes to prevent layout thrashing. `JsHoistRegexp` moves regular expression compilation outside hot loops. The advanced rules (`AdvancedEventHandlerRefs`, `AdvancedInitOnce`, `AdvancedUseLatest`) address React-specific JavaScript patterns: stable callback references, one-time initialization without effects, and always-current values without re-renders.

Individually, each rule provides a modest improvement. Together, they compound — a component that uses Map lookups, combines iterations, caches property access, and batches DOM operations can be 5-10x faster than one that uses naive patterns throughout.

## Consumer Guide

### When Reviewing Code

Scan for these patterns in descending impact order:

1. **Repeated .find() in loops** (HIGH) — Any pattern where `.find()` is called inside `.map()` or `.forEach()` on a second array. This is O(n*m) where an index Map makes it O(n+m). Common in data joining operations.
2. **Layout thrashing** (HIGH) — Interleaved DOM reads and writes: `el.offsetHeight; el.style.height = '100px'; el2.offsetHeight; el2.style.height = '200px';`. Each read forces the browser to recalculate layout. Batch all reads, then all writes.
3. **Multiple array passes** (MEDIUM) — `.filter().map()` or `.filter().reduce()` chains that could be a single `.reduce()`. Each pass allocates an intermediate array and iterates the full collection.
4. **Spread into Math.max/min** (MEDIUM) — `Math.max(...largeArray)` throws a stack overflow for arrays over ~100K elements because each element becomes a function argument.
5. **RegExp inside loops** (MEDIUM) — `new RegExp(pattern)` or regex literal inside a hot loop, recompiling the regex on every iteration.
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
5. **React-specific patterns?** Stable event handlers via refs or useEffectEvent (AdvancedEventHandlerRefs). One-time initialization without useEffect (AdvancedInitOnce). Always-current value without re-render (AdvancedUseLatest).

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
| JsSetMapLookups | MEDIUM | Use Set for O(1) membership tests instead of Array.includes() |
| JsTosortedImmutable | LOW | Use toSorted() for immutable sort — avoids mutating shared arrays in React |
| AdvancedEventHandlerRefs | LOW | Store event handlers in refs or useEffectEvent for stable subscriptions |
| AdvancedInitOnce | LOW | Initialize values once without useEffect using ref or module-level patterns |
| AdvancedUseLatest | LOW | Keep a ref to the latest value to read in callbacks without re-render deps |


---

### R6.1 Avoid Layout Thrashing

**Impact: MEDIUM (prevents forced synchronous layouts and reduces performance bottlenecks)**

Avoid interleaving style writes with layout reads. When you read a layout property (like `offsetWidth`, `getBoundingClientRect()`, or `getComputedStyle()`) between style changes, the browser is forced to trigger a synchronous reflow.

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
  element.classList.add('highlighted-box')
  
  const { width, height } = element.getBoundingClientRect()
}
```

**Better: use CSS classes**

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

**Impact: LOW-MEDIUM (1M ops to 2K ops)**

Multiple `.find()` calls by the same key should use a Map.

**Incorrect (O(n) per lookup):**

```typescript
function processOrders(orders: Order[], users: User[]) {
  return orders.map(order => ({
    ...order,
    user: users.find(u => u.id === order.userId)
  }))
}
```

**Correct (O(1) per lookup):**

```typescript
function processOrders(orders: Order[], users: User[]) {
  const userById = new Map(users.map(u => [u.id, u]))

  return orders.map(order => ({
    ...order,
    user: userById.get(order.userId)
  }))
}
```

Build map once (O(n)), then all lookups are O(1).

For 1000 orders × 1000 users: 1M ops → 2K ops.

---

### R6.3 Cache Property Access in Loops

**Impact: LOW-MEDIUM (reduces lookups)**

Cache object property lookups in hot paths.

**Incorrect: 3 lookups × N iterations**

```typescript
for (let i = 0; i < arr.length; i++) {
  process(obj.config.settings.value)
}
```

**Correct: 1 lookup total**

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

Use a module-level Map to cache function results when the same function is called repeatedly with the same inputs during render.

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

**Simpler pattern for single-value functions:**

```typescript
let isLoggedInCache: boolean | null = null

function isLoggedIn(): boolean {
  if (isLoggedInCache !== null) {
    return isLoggedInCache
  }
  
  isLoggedInCache = document.cookie.includes('auth=')
  return isLoggedInCache
}

// Clear cache when auth changes
function onAuthChange() {
  isLoggedInCache = null
}
```

Use a Map (not a hook) so it works everywhere: utilities, event handlers, not just React components.

Reference: [https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast](https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast)

---

### R6.5 Cache Storage API Calls

**Impact: LOW-MEDIUM (reduces expensive I/O)**

`localStorage`, `sessionStorage`, and `document.cookie` are synchronous and expensive. Cache reads in memory.

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
    storageCache.set(key, localStorage.getItem(key))
  }
  return storageCache.get(key)
}

function setLocalStorage(key: string, value: string) {
  localStorage.setItem(key, value)
  storageCache.set(key, value)  // keep cache in sync
}
```

Use a Map (not a hook) so it works everywhere: utilities, event handlers, not just React components.

**Cookie caching:**

```typescript
let cookieCache: Record<string, string> | null = null

function getCookie(name: string) {
  if (!cookieCache) {
    cookieCache = Object.fromEntries(
      document.cookie.split('; ').map(c => c.split('='))
    )
  }
  return cookieCache[name]
}
```

**Important: invalidate on external changes**

```typescript
window.addEventListener('storage', (e) => {
  if (e.key) storageCache.delete(e.key)
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

Multiple `.filter()` or `.map()` calls iterate the array multiple times. Combine into one loop.

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

Two O(n log n) sorts run even when `current.length` is 5 and `original.length` is 100. There is also overhead of joining the arrays and comparing the strings.

**Correct (O(1) length check first):**

```typescript
function hasChanges(current: string[], original: string[]) {
  // Early return if lengths differ
  if (current.length !== original.length) {
    return true
  }
  // Only sort when lengths match
  const currentSorted = current.toSorted()
  const originalSorted = original.toSorted()
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

Return early when result is determined to skip unnecessary processing.

**Incorrect: processes all items even after finding answer**

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

**Correct: returns immediately on first error**

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

Don't create RegExp inside render. Hoist to module scope or memoize with `useMemo()`.

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

Global regex (`/g`) has mutable `lastIndex` state:

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
  if (projects.length === 0) return null
  
  let latest = projects[0]
  
  for (let i = 1; i < projects.length; i++) {
    if (projects[i].updatedAt > latest.updatedAt) {
      latest = projects[i]
    }
  }
  
  return latest
}

function getOldestAndNewest(projects: Project[]) {
  if (projects.length === 0) return { oldest: null, newest: null }
  
  let oldest = projects[0]
  let newest = projects[0]
  
  for (let i = 1; i < projects.length; i++) {
    if (projects[i].updatedAt < oldest.updatedAt) oldest = projects[i]
    if (projects[i].updatedAt > newest.updatedAt) newest = projects[i]
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

This works for small arrays, but can be slower or just throw an error for very large arrays due to spread operator limitations. Maximal array length is approximately 124000 in Chrome 143 and 638000 in Safari 18; exact numbers may vary - see [the fiddle](https://jsfiddle.net/qw1jabsx/4/). Use the loop approach for reliability.

---

### R6.11 Use Set/Map for O(1) Lookups

**Impact: LOW-MEDIUM (O(n) to O(1))**

Convert arrays to Set/Map for repeated membership checks.

**Incorrect (O(n) per check):**

```typescript
const allowedIds = ['a', 'b', 'c', ...]
items.filter(item => allowedIds.includes(item.id))
```

**Correct (O(1) per check):**

```typescript
const allowedIds = new Set(['a', 'b', 'c', ...])
items.filter(item => allowedIds.has(item.id))
```

---

### R6.12 Use toSorted() Instead of sort() for Immutability

**Impact: MEDIUM-HIGH (prevents mutation bugs in React state)**

`.sort()` mutates the array in place, which can cause bugs with React state and props. Use `.toSorted()` to create a new sorted array without mutation.

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

2. Causes stale closure bugs - Mutating arrays inside closures (callbacks, effects) can lead to unexpected behavior

**Browser support: fallback for older browsers**

```typescript
// Fallback for older browsers
const sorted = [...items].sort((a, b) => a.value - b.value)
```

`.toSorted()` is available in all modern browsers (Chrome 110+, Safari 16+, Firefox 115+, Node.js 20+). For older environments, use spread operator:

**Other immutable array methods:**

- `.toSorted()` - immutable sort

- `.toReversed()` - immutable reverse

- `.toSpliced()` - immutable splice

- `.with()` - immutable element replacement

---

### R6.13 Store Event Handlers in Refs

**Impact: LOW (stable subscriptions)**

Store callbacks in refs when used in effects that shouldn't re-subscribe on callback changes.

**Incorrect: re-subscribes on every render**

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

**Alternative: use `useEffectEvent` if you're on latest React:**

`useEffectEvent` provides a cleaner API for the same pattern: it creates a stable function reference that always calls the latest version of the handler.

---

### R6.14 Initialize App Once, Not Per Mount

**Impact: LOW-MEDIUM (avoids duplicate init in development)**

Do not put app-wide initialization that must run once per app load inside `useEffect([])` of a component. Components can remount and effects will re-run. Use a module-level guard or top-level init in the entry module instead.

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

**Correct: once per app load**

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

### R6.15 useEffectEvent for Stable Callback Refs

**Impact: LOW (prevents effect re-runs)**

Access latest values in callbacks without adding them to dependency arrays. Prevents effect re-runs while avoiding stale closures.

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
- **JsBatchDomCss + JsHoistRegexp** address hot-path optimization from different angles. BatchDomCss prevents the browser from recalculating layout between interleaved reads and writes. HoistRegexp prevents the engine from recompiling regex patterns. Both become critical in tight loops — a loop that reads DOM dimensions and applies regex per iteration will be dramatically slower than one that batches reads, hoists regex, and writes in a final pass.
- **AdvancedEventHandlerRefs + AdvancedUseLatest** both solve the stale closure problem but for different use cases. EventHandlerRefs creates a stable function reference for event subscriptions. UseLatest creates a stable reference to a changing value for reading in callbacks. When building a custom hook that subscribes to events and needs the latest props, both patterns apply together.
- **AdvancedInitOnce + JsCacheStorage** interact for initialization patterns. InitOnce ensures a value is computed once (e.g., reading and parsing a config from localStorage). CacheStorage prevents repeated reads of the same key. Combined, they ensure that expensive initialization from storage happens exactly once per component lifecycle.

## Anti-Patterns (Severity Calibration)

### CRITICAL
- **O(n^2) data join in render path**: `orders.map(o => ({ ...o, user: users.find(u => u.id === o.userId) }))` with 1,000 orders and 1,000 users: 1,000,000 comparisons per render. Build a Map first: 2,000 operations total. This is the single highest-impact JavaScript optimization in data-heavy React components.
- **Layout thrashing in animation frame**: Reading `offsetHeight`, writing `style.height`, reading `offsetWidth`, writing `style.width` in a `requestAnimationFrame` callback. Each read after a write forces a synchronous reflow. With 20 elements, this creates 20 forced reflows per frame — visible stuttering at 60fps.

### HIGH
- **Math.max(...hugeArray) stack overflow**: `Math.max(...array)` where array has 200,000 elements. This pushes 200K arguments onto the call stack, exceeding the maximum. Use a loop or `reduce()` instead. This is a production crash, not just a performance issue.
- **Multiple array passes for single transformation**: `items.filter(predicate).map(transform).reduce(accumulate)` creates 2 intermediate arrays and iterates 3 times. A single `reduce()` does the same work in one pass with zero intermediate allocations.

### MEDIUM
- **Regex compilation inside .map()**: `items.map(item => item.name.match(new RegExp(pattern)))` recompiles the regex for every item. Hoist `const re = new RegExp(pattern)` before the loop.
- **Repeated localStorage.getItem in render**: `const theme = localStorage.getItem('theme')` called on every render. localStorage is synchronous I/O and can take 1-5ms per call. Cache in a module-level variable or ref.
- **Array.includes() for set membership**: `blockedIds.includes(id)` in a loop over 10,000 items where `blockedIds` has 500 entries: 5,000,000 comparisons. `new Set(blockedIds).has(id)`: 10,000 lookups.

## Examples

### Example 1: Data Processing Pipeline (IndexMaps + SetMapLookups + CombineIterations + EarlyExit)

```tsx
// BEFORE: 3 passes, O(n*m) joins, no early exit — 1.2M ops for 1K items
function OrderDashboard({ orders, users, blockedUserIds }: Props) {
  const activeOrders = orders.filter(o => !blockedUserIds.includes(o.userId))
  const enrichedOrders = activeOrders.map(o => ({
    ...o,
    user: users.find(u => u.id === o.userId)
  }))
  const totalRevenue = enrichedOrders.reduce((sum, o) => sum + o.amount, 0)

  return <Dashboard orders={enrichedOrders} revenue={totalRevenue} />
}

// AFTER: 1 pass, O(n+m) with Map + Set — 3K ops for 1K items
function OrderDashboard({ orders, users, blockedUserIds }: Props) {
  const userById = useMemo(() => new Map(users.map(u => [u.id, u])), [users])
  const blocked = useMemo(() => new Set(blockedUserIds), [blockedUserIds])

  const { enrichedOrders, totalRevenue } = useMemo(() => {
    if (!orders.length) return { enrichedOrders: [], totalRevenue: 0 }

    let totalRevenue = 0
    const enrichedOrders: EnrichedOrder[] = []

    for (const order of orders) {
      if (blocked.has(order.userId)) continue  // O(1) lookup, early skip
      const user = userById.get(order.userId)   // O(1) lookup
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
      item.querySelector('.badge')?.style.display = 'block'  // write
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
  }, [url, onMessage])  // onMessage in deps = reconnect on every render

  return ws
}

// AFTER: Stable subscription + latest callback + init once
function useWebSocket(url: string, onMessage: (msg: Message) => void) {
  const onMessageEvent = useEffectEvent(onMessage)  // always latest, stable ref
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const socket = new WebSocket(url)
    wsRef.current = socket

    socket.addEventListener('message', (e) => {
      onMessageEvent(JSON.parse(e.data))  // calls latest onMessage
    })

    return () => socket.close()
  }, [url])  // only reconnects when URL changes

  return wsRef.current
}
```

EventHandlerRefs (via useEffectEvent) provides a stable reference. UseLatest ensures the callback always calls the latest version. The effect dependency array is minimal, preventing unnecessary reconnections.

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
