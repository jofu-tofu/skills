# Rendering & Performance — React

> Every unnecessary re-render is wasted CPU, and every hydration mismatch is a broken user experience — rendering performance is the tax your users pay for architectural decisions made at development time.

## Mental Model

React's rendering model is declarative: you describe the desired UI state, and React determines the minimal DOM operations needed. But "minimal" only holds when the component tree cooperates. The 21 rules in this dimension address the gap between React's theoretical efficiency and the practical reality of components that re-render too often, hydrate incorrectly, or miss opportunities to skip work entirely.

These rules form three conceptual layers. The first layer is **re-render prevention** (12 rules): avoiding renders that produce no visible change. This includes memoization (`RerenderMemo`, `RerenderMemoWithDefaultValue`), derived state elimination (`RerenderDerivedState`, `RerenderDerivedStateNoEffect`), deferred reads (`RerenderDeferReads`), and transitions (`RerenderTransitions`). Avoid unnecessary work where profiling shows a benefit; memo comparisons and caches also have costs. Every component subscription (to context, searchParams, stores) is a re-render trigger — subscribe to less, render less.

The second layer is **rendering efficiency** (9 rules): making renders that do happen as cheap as possible. `RenderingHoistJsx` prevents re-creating JSX elements. `RenderingContentVisibility` uses CSS containment to skip off-screen layout calculations. `RenderingActivity` (React 19.2+'s stable `<Activity>` component) preserves component state while hiding subtrees. `RenderingConditionalRender` and `RenderingAnimateSvgWrapper` avoid unnecessary DOM operations for conditional and animated content.

The third layer is **hydration correctness** (2 rules): ensuring server-rendered HTML matches client-rendered output. `RenderingHydrationNoFlicker` handles client-only data (localStorage, cookies) without visual flash. `RenderingHydrationSuppressWarning` handles intentional mismatches (timestamps, random values) cleanly. Hydration mismatches are bugs: React may recover a subtree or root, and mismatched attributes are not guaranteed to be patched.

When applied together, these rules ensure that the component tree renders only when necessary, renders efficiently when it must, and hydrates without error or flicker.

## Consumer Guide

### When Reviewing Code

Scan for these violations in severity order:

1. **State in effects that derives from props** (HIGH) — `useEffect(() => setX(derive(props)), [props])` causes double renders. The first render may use stale state; the Effect schedules another render. A render does not necessarily change the DOM.
2. **Hydration mismatch with client-only data** (HIGH) — Components that read `localStorage`, `window.innerWidth`, or `Date.now()` during initial render without a hydration-safe pattern. These can throw during SSR or produce hydration mismatches; recovery scope varies.
3. **Missing memo on expensive pure components** (MEDIUM) — Components receiving stable props that re-render because a parent re-renders. Check if React Compiler is enabled first — if it is, manual memo is unnecessary.
4. **Context subscriptions for callback-only data** (MEDIUM) — Components subscribed to `useSearchParams()` or similar dynamic state when they only read the value inside event handlers, not during render.
5. **Object/array literals in JSX** (MEDIUM) — `style={{ color: 'red' }}` or `options={[1, 2, 3]}` in render body creates new references every render, defeating memo on child components.
6. **Missing content-visibility on long lists** (LOW) — Long scrollable content without `content-visibility: auto`, forcing the browser to lay out off-screen elements.

### When Designing / Planning

Before implementing a feature with rendering concerns:

- **Map the re-render propagation path.** When state X changes, which components re-render? Trace from the state source through context providers and prop chains. Each unnecessary component in the path is a candidate for memo or restructuring.
- **Decide on derived vs. synced state.** If a value can be computed from props/state during render, it must be derived inline — never synced via useEffect. This eliminates an entire class of double-render bugs.
- **Plan hydration strategy for client-only data.** Themes, user preferences, auth state — anything from localStorage or cookies needs a hydration-safe pattern decided upfront, not patched after seeing console warnings.
- **Identify off-screen content.** Tabs, collapsed sections, below-fold content — these are candidates for `content-visibility: auto` or React 19.2+'s `<Activity>` component.

### When Implementing

Apply rules in this order of priority:

1. **Eliminate derived state in effects** — Replace all `useEffect(() => setState(derive(props)), [deps])` with inline computation or `useMemo` (RerenderDerivedState, RerenderDerivedStateNoEffect).
2. **Defer state reads** — If a state value is only used in event handlers, read it on-demand instead of subscribing (RerenderDeferReads).
3. **Use transitions for non-urgent updates** — Wrap `startTransition()` around state updates that drive expensive re-renders (RerenderTransitions).
4. **Memoize expensive pure components** — Apply `memo()` to components that receive stable props from frequently-updating parents (RerenderMemo). Provide sensible defaults to avoid breaking memo (RerenderMemoWithDefaultValue).
5. **Hoist static JSX** — Move JSX that does not depend on props/state outside the component body (RenderingHoistJsx).
6. **Handle hydration correctly** — Match server/client initial values (RenderingHydrationNoFlicker). Use `suppressHydrationWarning` only for intentional mismatches like timestamps (RenderingHydrationSuppressWarning).
7. **Apply CSS containment** — Add `content-visibility: auto` to off-screen sections (RenderingContentVisibility).

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| RerenderDeferReads | MEDIUM | Read dynamic state on-demand in callbacks instead of subscribing in render |
| RerenderMemo | MEDIUM | Extract expensive subtrees into memo'd components for early bailout |
| RerenderMemoWithDefaultValue | MEDIUM | Use stable internal defaults when identity affects children or Effects |
| RerenderDependencies | MEDIUM | Ensure hook dependency arrays contain only values that should trigger re-execution |
| RerenderDerivedState | HIGH | Compute derived values inline during render instead of storing in state |
| RerenderDerivedStateNoEffect | HIGH | Never sync props to state via useEffect — derive inline or use useMemo |
| RerenderFunctionalSetstate | MEDIUM | Use functional setState to avoid stale closures and unnecessary deps |
| RerenderLazyStateInit | MEDIUM | Pass initializer function to useState for expensive computations |
| RerenderSimpleExpressionInMemo | LOW | Do not wrap trivial expressions in useMemo — the overhead exceeds the savings |
| RerenderMoveEffectToEvent | MEDIUM | Move side-effect logic from useEffect to event handlers when possible |
| RerenderTransitions | MEDIUM | Use startTransition for non-urgent updates to keep UI responsive |
| RerenderUseRefTransientValues | MEDIUM | Store transient values in refs to avoid triggering renders |
| RenderingAnimateSvgWrapper | LOW | Wrap animated SVGs to prevent re-rendering static parent content |
| RenderingContentVisibility | MEDIUM | Use CSS content-visibility: auto to skip layout of off-screen content |
| RenderingHoistJsx | MEDIUM | Hoist static JSX outside render to prevent recreation every render cycle |
| RenderingSvgPrecision | LOW | Reduce SVG coordinate precision to minimize DOM size |
| RenderingHydrationNoFlicker | MEDIUM | Match initial server/client values; coordinate pre-hydration scripts explicitly |
| RenderingHydrationSuppressWarning | LOW | Use suppressHydrationWarning only for unavoidable text/attribute differences |
| RenderingActivity | MEDIUM | Use React 19.2+ Activity component to preserve state of hidden subtrees |
| RenderingConditionalRender | MEDIUM | Use explicit boolean conditions to avoid rendering 0/NaN |
| RenderingUsetransitionLoading | MEDIUM | Show loading indicators during transitions using useTransition's isPending |


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

### R4.2 Extract to Memoized Components

**Impact: MEDIUM (enables early returns)**

Extract expensive work into memoized components to enable early returns before computation.

**Incorrect: computes avatar even when loading**

```tsx
function Profile({ user, loading }: Props) {
  const avatar = useMemo(() => {
    const id = computeAvatarId(user)
    return <Avatar id={id} />
  }, [user])

  if (loading) return <Skeleton />
  return <div>{avatar}</div>
}
```

**Correct: skips computation when loading**

```tsx
const UserAvatar = memo(function UserAvatar({ user }: { user: User }) {
  const id = useMemo(() => computeAvatarId(user), [user])
  return <Avatar id={id} />
})

function Profile({ user, loading }: Props) {
  if (loading) return <Skeleton />
  return (
    <div>
      <UserAvatar user={user} />
    </div>
  )
}
```

**Note:** If your project has [React Compiler](https://react.dev/learn/react-compiler) enabled, manual memoization is often unnecessary in compiled components. Verify compiler coverage and preserve correctness independently of memoization.

---

### R4.3 Extract Default Non-primitive Parameter Value from Memoized Component to Constant

**Impact: LOW-MEDIUM (stable dependencies for downstream consumers)**

An omitted prop stays omitted for the outer memo comparison. An internal default is created only when that component renders; it cannot itself defeat that comparison. A stable default helps when passed to a memoized child or used as an Effect dependency.

**Potential downstream churn:**

```tsx
const UserAvatar = memo(function UserAvatar({ label, onClick = () => {} }: Props) {
  return <><span>{label}</span><MemoizedButton onClick={onClick} /></>
})
// Changing label renders UserAvatar; its new default callback changes the button prop.
```

**Stable downstream default:**

```tsx
const NOOP = () => {}
const UserAvatar = memo(function UserAvatar({ label, onClick = NOOP }: Props) {
  return <><span>{label}</span><MemoizedButton onClick={onClick} /></>
})
```

Reference: https://react.dev/reference/react/memo

---

### R4.4 Narrow Effect Dependencies

**Impact: LOW (minimizes effect re-runs)**

Specify primitive dependencies instead of objects to minimize effect re-runs.

**Incorrect: re-runs on any user field change**

```tsx
useEffect(() => {
  console.log(user.id)
}, [user])
```

**Correct: re-runs only when id changes**

```tsx
useEffect(() => {
  console.log(user.id)
}, [user.id])
```

**For derived state, compute outside effect:**

```tsx
// Incorrect: runs on width=767, 766, 765...
useEffect(() => {
  if (width < 768) {
    enableMobileMode()
  }
}, [width])

// Correct: runs only on boolean transition
const isMobile = width < 768
useEffect(() => {
  if (isMobile) {
    enableMobileMode()
  }
}, [isMobile])
```

---

### R4.5 Subscribe to Derived State

**Impact: MEDIUM (reduces re-render frequency)**

Subscribe to derived boolean state instead of continuous values to reduce re-render frequency.

**Incorrect: re-renders on every pixel change**

```tsx
function Sidebar() {
  const width = useWindowWidth()  // updates continuously
  const isMobile = width < 768
  return <nav className={isMobile ? 'mobile' : 'desktop'} />
}
```

**Correct: re-renders only when boolean changes**

```tsx
function Sidebar() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  return <nav className={isMobile ? 'mobile' : 'desktop'} />
}
```

---

### R4.6 Calculate Derived State During Rendering

**Impact: MEDIUM (avoids redundant renders and state drift)**

If a value can be computed from current props/state, do not store it in state or update it in an effect. Derive it during render to avoid extra renders and state drift. Do not set state in effects solely in response to prop changes; prefer derived values or keyed resets instead.

**Incorrect: redundant state and effect**

```tsx
function Form() {
  const [firstName, setFirstName] = useState('First')
  const [lastName, setLastName] = useState('Last')
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    setFullName(firstName + ' ' + lastName)
  }, [firstName, lastName])

  return <p>{fullName}</p>
}
```

**Correct: derive during render**

```tsx
function Form() {
  const [firstName, setFirstName] = useState('First')
  const [lastName, setLastName] = useState('Last')
  const fullName = firstName + ' ' + lastName

  return <p>{fullName}</p>
}
```

Reference: [https://react.dev/learn/you-might-not-need-an-effect](https://react.dev/learn/you-might-not-need-an-effect)

---

### R4.7 Use Functional setState Updates

**Impact: MEDIUM (prevents stale closures and unnecessary callback recreations)**

When updating state based on the current state value, use the functional update form of setState instead of directly referencing the state variable. This composes updates against pending state and can remove that state dependency from a useCallback. Other captured values still need correct dependencies; the updater form alone does not stabilize a callback.

**Incorrect: requires state as dependency**

```tsx
function TodoList() {
  const [items, setItems] = useState(initialItems)
  
  // Callback must depend on items, recreated on every items change
  const addItems = useCallback((newItems: Item[]) => {
    setItems([...items, ...newItems])
  }, [items])  // ❌ items dependency causes recreations
  
  // Risk of stale closure if dependency is forgotten
  const removeItem = useCallback((id: string) => {
    setItems(items.filter(item => item.id !== id))
  }, [])  // ❌ Missing items dependency - will use stale items!
  
  return <ItemsEditor items={items} onAdd={addItems} onRemove={removeItem} />
}
```

The first callback is recreated every time `items` changes, which can cause child components to re-render unnecessarily. The second callback has a stale closure bug—it will always reference the initial `items` value.

**Correct: stable callbacks, no stale closures**

```tsx
function TodoList() {
  const [items, setItems] = useState(initialItems)
  
  // Callback can remain stable across ordinary updates when other dependencies stay fixed
  const addItems = useCallback((newItems: Item[]) => {
    setItems(curr => [...curr, ...newItems])
  }, [])  // ✅ No dependencies needed
  
  // Always uses latest state, no stale closure risk
  const removeItem = useCallback((id: string) => {
    setItems(curr => curr.filter(item => item.id !== id))
  }, [])  // ✅ Safe and stable
  
  return <ItemsEditor items={items} onAdd={addItems} onRemove={removeItem} />
}
```

**Benefits:**

1. **Stable callback references** - Callbacks don't need to be recreated when state changes

2. **No stale closures** - Always operates on the latest state value

3. **Fewer dependencies** - Can remove an otherwise-needed state dependency; cleanup still controls resource lifetime

4. **Prevents bugs** - Eliminates the most common source of React closure bugs

**When to use functional updates:**

- Any setState that depends on the current state value

- Inside useCallback/useMemo when state is needed

- Event handlers that reference state

- Async operations that update state

**When direct updates are fine:**

- Setting state to a static value: `setCount(0)`

- Setting state from props/arguments only: `setName(newName)`

- State doesn't depend on previous value

**Note:** If your project has [React Compiler](https://react.dev/learn/react-compiler) enabled, the compiler can automatically optimize some cases, but functional updates are still recommended for correctness and to prevent stale closure bugs.

---

### R4.8 Use Lazy State Initialization

**Impact: MEDIUM (wasted computation on every render)**

Pass a function to `useState` for expensive initial values. Without the function form, the initializer runs on every render even though the value is only used once.

**Incorrect: runs on every render**

```tsx
function FilteredList({ items }: { items: Item[] }) {
  // buildSearchIndex() runs on EVERY render, even after initialization
  const [searchIndex, setSearchIndex] = useState(buildSearchIndex(items))
  const [query, setQuery] = useState('')
  
  // When query changes, buildSearchIndex runs again unnecessarily
  return <SearchResults index={searchIndex} query={query} />
}

function UserProfile() {
  // JSON.parse runs on every render
  const [settings, setSettings] = useState(
    JSON.parse(localStorage.getItem('settings') || '{}')
  )
  
  return <SettingsForm settings={settings} onChange={setSettings} />
}
```

**Correct: avoids recomputation on ordinary updates**

```tsx
function FilteredList({ items }: { items: Item[] }) {
  // Initial-props snapshot; remount/key or recompute if items should update the index
  const [searchIndex, setSearchIndex] = useState(() => buildSearchIndex(items))
  const [query, setQuery] = useState('')
  
  return <SearchResults index={searchIndex} query={query} />
}

function UserProfile() {
  // Browser-only component; not an SSR hydration pattern
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem('settings')
    return stored ? JSON.parse(stored) : {}
  })
  
  return <SettingsForm settings={settings} onChange={setSettings} />
}
```

Keep initializers pure. React may call them twice in development Strict Mode or retry a mount. Build indexes this way only for an intentional initial snapshot. Browser storage examples require a client-only mount; SSR should use matching initial data and read storage after hydration. DOM measurements belong in Effects, not initializers.

For simple primitives (`useState(0)`), direct references (`useState(props.value)`), or cheap literals (`useState({})`), the function form is unnecessary.

---

### R4.9 Do not wrap a simple expression with a primitive result type in useMemo

**Impact: LOW-MEDIUM (wasted computation on every render)**

When an expression is simple (few logical or arithmetical operators) and has a primitive result type (boolean, number, string), do not wrap it in `useMemo`.

Calling `useMemo` and comparing hook dependencies may consume more resources than the expression itself.

**Incorrect:**

```tsx
function Header({ user, notifications }: Props) {
  const isLoading = useMemo(() => {
    return user.isLoading || notifications.isLoading
  }, [user.isLoading, notifications.isLoading])

  if (isLoading) return <Skeleton />
  // return some markup
}
```

**Correct:**

```tsx
function Header({ user, notifications }: Props) {
  const isLoading = user.isLoading || notifications.isLoading

  if (isLoading) return <Skeleton />
  // return some markup
}
```

---

### R4.10 Put Interaction Logic in Event Handlers

**Impact: MEDIUM (avoids effect re-runs and duplicate side effects)**

If a side effect is triggered by a specific user action (submit, click, drag), run it in that event handler. Do not model the action as state + effect; it makes effects re-run on unrelated changes and can duplicate the action.

**Incorrect: event modeled as state + effect**

```tsx
function Form() {
  const [submitted, setSubmitted] = useState(false)
  const theme = useContext(ThemeContext)

  useEffect(() => {
    if (submitted) {
      post('/api/register')
      showToast('Registered', theme)
    }
  }, [submitted, theme])

  return <button onClick={() => setSubmitted(true)}>Submit</button>
}
```

**Correct: do it in the handler**

```tsx
function Form() {
  const theme = useContext(ThemeContext)

  function handleSubmit() {
    post('/api/register')
    showToast('Registered', theme)
  }

  return <button onClick={handleSubmit}>Submit</button>
}
```

Reference: [https://react.dev/learn/removing-effect-dependencies#should-this-code-move-to-an-event-handler](https://react.dev/learn/removing-effect-dependencies#should-this-code-move-to-an-event-handler)

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

### R4.12 Use useRef for Transient Values

**Impact: MEDIUM (avoids unnecessary re-renders on frequent updates)**

When a value changes frequently and you don't want a re-render on every update (e.g., mouse trackers, intervals, transient flags), store it in `useRef` instead of `useState`. Keep component state for UI; use refs for temporary DOM-adjacent values. Updating a ref does not trigger a re-render.

**Incorrect: renders every update**

```tsx
function Tracker() {
  const [lastX, setLastX] = useState(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => setLastX(e.clientX)
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: lastX,
        width: 8,
        height: 8,
        background: 'black',
      }}
    />
  )
}
```

**Correct: no re-render for tracking**

```tsx
function Tracker() {
  const lastXRef = useRef(0)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      lastXRef.current = e.clientX
      const node = dotRef.current
      if (node) {
        node.style.transform = `translateX(${e.clientX}px)`
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={dotRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 8,
        height: 8,
        background: 'black',
        transform: 'translateX(0px)',
      }}
    />
  )
}
```

---

### R4.13 Animate SVG Wrapper Instead of SVG Element

**Impact: LOW (browser-dependent animation optimization)**

If profiling identifies a problem with SVG animation on target browsers, compare animating a wrapper. Compositing depends on the browser, property and layer conditions; a wrapper does not guarantee GPU acceleration.

**Valid baseline: animate the SVG directly**

```tsx
function LoadingSpinner() {
  return (
    <svg 
      className="animate-spin"
      width="24" 
      height="24" 
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" />
    </svg>
  )
}
```

**Alternative to profile: animate a wrapper**

```tsx
function LoadingSpinner() {
  return (
    <div className="animate-spin">
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" />
      </svg>
    </div>
  )
}
```

Compare visual behavior, transform origin and frame timing before choosing the wrapper. No hardware-acceleration guarantee follows from the markup.

---

### R4.14 CSS content-visibility for Long Lists

**Impact: HIGH (faster initial render)**

Apply `content-visibility: auto` to defer off-screen rendering.

**CSS:**

```css
.message-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

**Example:**

```tsx
function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="overflow-y-auto h-screen">
      {messages.map(msg => (
        <div key={msg.id} className="message-item">
          <Avatar user={msg.author} />
          <div>{msg.content}</div>
        </div>
      ))}
    </div>
  )
}
```

The browser may skip eligible off-screen layout/paint; this does not skip React rendering, data mapping or DOM creation. Measure the workload and verify intrinsic-size estimates, focus and accessibility behavior.

---

### R4.15 Hoist Static JSX Elements

**Impact: LOW (avoids re-creation)**

Extract static JSX outside components to avoid re-creation.

**Incorrect: recreates element every render**

```tsx
function LoadingSkeleton() {
  return <div className="animate-pulse h-20 bg-gray-200" />
}

function Container() {
  return (
    <div>
      {loading && <LoadingSkeleton />}
    </div>
  )
}
```

**Correct: reuses same element**

```tsx
const loadingSkeleton = (
  <div className="animate-pulse h-20 bg-gray-200" />
)

function Container() {
  return (
    <div>
      {loading && loadingSkeleton}
    </div>
  )
}
```

This is especially helpful for large and static SVG nodes, which can be expensive to recreate on every render.

**Note:** If your project has [React Compiler](https://react.dev/learn/react-compiler) enabled, the compiler can memoize eligible JSX and component work. Check its coverage; manual hoisting may be unnecessary.

---

### R4.16 Optimize SVG Precision

**Impact: LOW (reduces file size)**

Reduce SVG coordinate precision to decrease file size. The optimal precision depends on the viewBox size, but in general reducing precision should be considered.

**Incorrect: excessive precision**

```svg
<path d="M 10.293847 20.847362 L 30.938472 40.192837" />
```

**Correct: 1 decimal place**

```svg
<path d="M 10.3 20.8 L 30.9 40.2" />
```

**Automate with SVGO:**

```bash
npx svgo --precision=1 --multipass icon.svg
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

### R4.19 Use Activity Component for Show/Hide

**Impact: MEDIUM (preserves state/DOM)**

On React 19.2+, consider `<Activity>` to preserve state/DOM while hiding content. Older supported React versions need conditional rendering or CSS hiding with explicit lifecycle tradeoffs.

**Usage:**

```tsx
import { Activity } from 'react'

function Dropdown({ isOpen }: Props) {
  return (
    <Activity mode={isOpen ? 'visible' : 'hidden'}>
      <ExpensiveMenu />
    </Activity>
  )
}
```

Hidden Activity preserves state/DOM, cleans up Effects, and can still render new props at lower priority. Effects restart when shown; it is not a guarantee of no rendering.

---

### R4.20 Use Explicit Conditional Rendering

**Impact: LOW (prevents rendering 0 or NaN)**

Use explicit ternary operators (`? :`) instead of `&&` for conditional rendering when the condition can be `0`, `NaN`, or other falsy values that render.

**Incorrect: renders "0" when count is 0**

```tsx
function Badge({ count }: { count: number }) {
  return (
    <div>
      {count && <span className="badge">{count}</span>}
    </div>
  )
}

// When count = 0, renders: <div>0</div>
// When count = 5, renders: <div><span class="badge">5</span></div>
```

**Correct: renders nothing when count is 0**

```tsx
function Badge({ count }: { count: number }) {
  return (
    <div>
      {count > 0 ? <span className="badge">{count}</span> : null}
    </div>
  )
}

// When count = 0, renders: <div></div>
// When count = 5, renders: <div><span class="badge">5</span></div>
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

- **RerenderDerivedState + RerenderDerivedStateNoEffect** are two sides of the same coin. DerivedState says: compute inline. DerivedStateNoEffect says: never use useEffect for this. When reviewing, finding a useEffect that calls setState with a value derived from props/state is a violation of both rules simultaneously. For redundant derived state, derive inline or use useMemo. Effects synchronizing external systems remain appropriate.
- **RerenderMemo + RerenderMemoWithDefaultValue + RenderingHoistJsx**: compare the props actually received by each memoized boundary. Internal defaults affect downstream consumers after rendering; fresh children JSX can still defeat a parent boundary.
- **RerenderDeferReads + RerenderTransitions + RerenderMoveEffectToEvent** are all strategies for reducing how often renders happen. DeferReads avoids subscribing to state that is only needed in callbacks. Transitions mark React updates as non-urgent and interruptible; they do not move JavaScript work off the main thread. MoveEffectToEvent moves logic out of the render cycle entirely. These three rules should be evaluated together when diagnosing a component that renders too often.
- **RenderingHydrationNoFlicker + RenderingHydrationSuppressWarning**: prefer matching initial values. Suppression is a one-level escape hatch for unavoidable text/attribute differences; it does not reconcile state or validate auth.
- **RenderingActivity + RenderingConditionalRender + RenderingContentVisibility** address hidden content from different angles. Activity preserves React state of hidden subtrees (tabs). ConditionalRender avoids accidental numeric output; it does not itself preserve mounted state. ContentVisibility defers browser layout calculations for off-screen content. For a tabbed interface, combine Activity (state preservation) with ContentVisibility (layout optimization).

## Anti-Patterns (Severity Calibration)

### CRITICAL
- **Redundant derived state in an Effect**: `useEffect(() => setFilteredItems(items.filter(predicate)), [items, predicate])` adds a render when dependencies change. It loops only if its state update also causes dependencies to change again. Derive the list during render; memoize if expensive. Severity depends on observed harm.
- **Browser-only APIs during SSR**: `document.cookie` or localStorage may throw on the server. Different initial client output can cause hydration recovery, whose scope varies. Keep server authorization independent of client storage.

### HIGH
- **Memo defeated by inline objects**: `<MemoizedList items={items} style={{ padding: 8 }} />` — the style object is a new reference every render, causing MemoizedList to re-render every time its parent renders. The default memo comparison cannot skip those parent-triggered renders; Compiler/custom comparisons and other call paths can differ.
- **Entire context subscription for partial read**: A component consuming a large context object (`const { theme, user, settings, notifications } = useContext(AppContext)`) when it only uses `theme`. Any change to notifications triggers a re-render of this theme-only component.

### MEDIUM
- **Expensive initialization on every render**: `const [data] = useState(parseCSV(rawData))` — `parseCSV` runs on every render but its result is discarded after the first. Use `useState(() => parseCSV(rawData))` to initialize lazily.
- **Scroll position stored in state**: Using `useState` for scroll position or mouse coordinates, causing re-renders on every scroll frame. Use `useRef` for transient values that do not affect rendered output.
- **Missing content-visibility on large lists**: A 500-item list rendering all items in the DOM without virtualization or `content-visibility: auto`, causing the browser to calculate layout for off-screen items that the user cannot see.

## Examples

### Example 1: Derived State Elimination (DerivedState + DerivedStateNoEffect + Memo)

```tsx
// BEFORE: useEffect syncing props to state — double render on every filter change
function SearchResults({ query, items }: Props) {
  const [filtered, setFiltered] = useState(items)

  useEffect(() => {
    setFiltered(items.filter(item => item.name.includes(query)))
  }, [items, query])

  return <ResultList items={filtered} />
}

// AFTER: Inline derivation + memoized child — single render, no effect
const ResultList = memo(function ResultList({ items }: { items: Item[] }) {
  return <ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>
})

function SearchResults({ query, items }: Props) {
  const filtered = useMemo(
    () => items.filter(item => item.name.includes(query)),
    [items, query]
  )
  return <ResultList items={filtered} />
}
```

DerivedState eliminates the double render. Memo on ResultList prevents re-rendering when `filtered` produces the same array (e.g., when an unrelated parent state changes).

### Example 2: Hydration-Safe Theme (HydrationNoFlicker + Transitions)

Use the R4.17 ThemeWrapper with a server-provided initialTheme. The first client render matches SSR, and its button updates React state. A theme change may be urgent; use a Transition only for measured non-urgent React rendering. Wrapping `element.className = next` in `startTransition` still performs that write immediately.

### Example 3: Memoization Chain (Memo + MemoWithDefaultValue + HoistJsx + LazyStateInit)

```tsx
// BEFORE: Memo is defeated by default prop + inline JSX + eager init
function Dashboard({ config = {} }: { config?: DashboardConfig }) {
  const [data] = useState(parseExpensiveConfig(rawConfig)) // runs every render
  return (
    <MemoizedPanel config={config}> {/* {} is new ref every render */}
      <div style={{ padding: 16 }}> {/* inline object breaks memo */}
        <Chart data={data} />
      </div>
    </MemoizedPanel>
  )
}

// AFTER: Stable defaults + memoized children + lazy init
const DEFAULT_CONFIG: DashboardConfig = {}
const chartContainerStyle = { padding: 16 }

function Dashboard({ config = DEFAULT_CONFIG }: { config?: DashboardConfig }) {
  const [data] = useState(() => parseExpensiveConfig(rawConfig)) // lazy
  const content = useMemo(() => (
    <div style={chartContainerStyle}><Chart data={data} /></div>
  ), [data])
  return <MemoizedPanel config={config}>{content}</MemoizedPanel>
}
```

Four rules interact: MemoWithDefaultValue provides `DEFAULT_CONFIG` so memo is not broken by `{}`. The style is hoisted and children JSX is memoized by data identity. LazyStateInit wraps the expensive parser in a function. Memo on the panel can now actually skip renders.

## Does Not Cover

- **Data fetching waterfalls** — See DataFetching (R2) for async patterns, Suspense boundaries, and SWR.
- **Component architecture decisions** — See Architecture (R1) for composition patterns that reduce re-render surface area.
- **Server Component caching** — See ServerComponents (R3) for server-side caching and serialization.
- **Bundle size from rendering libraries** — See BundleSize (R5) for import optimization.
- **Raw JavaScript performance** — See JavaScriptPerf (R6) for loop optimization, data structures, and DOM batching.

## Sources

- Vercel Engineering — React Best Practices (January 2026), MIT
- React Documentation — useMemo, memo, useTransition, Suspense, Activity
- Web.dev — content-visibility, CSS Containment

## Candidate verification references

- https://react.dev/reference/react/memo
- https://react.dev/reference/react/useEffect
- https://react.dev/reference/react-dom/client/hydrateRoot
- https://react.dev/reference/react/useState
- https://react.dev/reference/react/startTransition
- https://www.w3.org/TR/css-contain-2/
- https://www.w3.org/TR/css-transforms-1/
- https://react.dev/reference/react/Activity
- https://react.dev/blog/2025/10/01/react-19-2
- https://react.dev/reference/react/useTransition
