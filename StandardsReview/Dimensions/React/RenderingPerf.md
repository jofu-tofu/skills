# Rendering & Performance — React

> Every unnecessary re-render is wasted CPU, and every hydration mismatch is a broken user experience — rendering performance is the tax your users pay for architectural decisions made at development time.

## Mental Model

React's rendering model is declarative: you describe the desired UI state, and React determines the minimal DOM operations needed. But "minimal" only holds when the component tree cooperates. The 21 rules in this dimension address the gap between React's theoretical efficiency and the practical reality of components that re-render too often, hydrate incorrectly, or miss opportunities to skip work entirely.

These rules form three conceptual layers. The first layer is **re-render prevention** (12 rules): avoiding renders that produce no visible change. This includes memoization (`RerenderMemo`, `RerenderMemoWithDefaultValue`), derived state elimination (`RerenderDerivedState`, `RerenderDerivedStateNoEffect`), deferred reads (`RerenderDeferReads`), and transitions (`RerenderTransitions`). The core insight is that preventing a render is always cheaper than optimizing one. Every component subscription (to context, searchParams, stores) is a re-render trigger — subscribe to less, render less.

The second layer is **rendering efficiency** (9 rules): making renders that do happen as cheap as possible. `RenderingHoistJsx` prevents re-creating JSX elements. `RenderingContentVisibility` uses CSS containment to skip off-screen layout calculations. `RenderingActivity` (React 19's experimental `<Activity>` component) preserves component state while hiding subtrees. `RenderingConditionalRender` and `RenderingAnimateSvgWrapper` avoid unnecessary DOM operations for conditional and animated content.

The third layer is **hydration correctness** (2 rules): ensuring server-rendered HTML matches client-rendered output. `RenderingHydrationNoFlicker` handles client-only data (localStorage, cookies) without visual flash. `RenderingHydrationSuppressWarning` handles intentional mismatches (timestamps, random values) cleanly. Hydration mismatches are uniquely costly because they force React to discard server-rendered DOM and re-render from scratch — negating all SSR benefits.

When applied together, these rules ensure that the component tree renders only when necessary, renders efficiently when it must, and hydrates without error or flicker.

## Consumer Guide

### When Reviewing Code

Scan for these violations in severity order:

1. **State in effects that derives from props** (HIGH) — `useEffect(() => setX(derive(props)), [props])` causes double renders. The first render uses stale state; the effect triggers a synchronous re-render with correct state. Both hit the DOM.
2. **Hydration mismatch with client-only data** (HIGH) — Components that read `localStorage`, `window.innerWidth`, or `Date.now()` during initial render without a hydration-safe pattern. These produce mismatches that force full re-render.
3. **Missing memo on expensive pure components** (MEDIUM) — Components receiving stable props that re-render because a parent re-renders. Check if React Compiler is enabled first — if it is, manual memo is unnecessary.
4. **Context subscriptions for callback-only data** (MEDIUM) — Components subscribed to `useSearchParams()` or similar dynamic state when they only read the value inside event handlers, not during render.
5. **Object/array literals in JSX** (MEDIUM) — `style={{ color: 'red' }}` or `options={[1, 2, 3]}` in render body creates new references every render, defeating memo on child components.
6. **Missing content-visibility on long lists** (LOW) — Long scrollable content without `content-visibility: auto`, forcing the browser to lay out off-screen elements.

### When Designing / Planning

Before implementing a feature with rendering concerns:

- **Map the re-render propagation path.** When state X changes, which components re-render? Trace from the state source through context providers and prop chains. Each unnecessary component in the path is a candidate for memo or restructuring.
- **Decide on derived vs. synced state.** If a value can be computed from props/state during render, it must be derived inline — never synced via useEffect. This eliminates an entire class of double-render bugs.
- **Plan hydration strategy for client-only data.** Themes, user preferences, auth state — anything from localStorage or cookies needs a hydration-safe pattern decided upfront, not patched after seeing console warnings.
- **Identify off-screen content.** Tabs, collapsed sections, below-fold content — these are candidates for `content-visibility: auto` or React 19's `<Activity>` component.

### When Implementing

Apply rules in this order of priority:

1. **Eliminate derived state in effects** — Replace all `useEffect(() => setState(derive(props)), [deps])` with inline computation or `useMemo` (RerenderDerivedState, RerenderDerivedStateNoEffect).
2. **Defer state reads** — If a state value is only used in event handlers, read it on-demand instead of subscribing (RerenderDeferReads).
3. **Use transitions for non-urgent updates** — Wrap `startTransition()` around state updates that drive expensive re-renders (RerenderTransitions).
4. **Memoize expensive pure components** — Apply `memo()` to components that receive stable props from frequently-updating parents (RerenderMemo). Provide sensible defaults to avoid breaking memo (RerenderMemoWithDefaultValue).
5. **Hoist static JSX** — Move JSX that does not depend on props/state outside the component body (RenderingHoistJsx).
6. **Handle hydration correctly** — Use synchronous scripts for client-only DOM updates (RenderingHydrationNoFlicker). Use `suppressHydrationWarning` only for intentional mismatches like timestamps (RenderingHydrationSuppressWarning).
7. **Apply CSS containment** — Add `content-visibility: auto` to off-screen sections (RenderingContentVisibility).

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| RerenderDeferReads | MEDIUM | Read dynamic state on-demand in callbacks instead of subscribing in render |
| RerenderMemo | MEDIUM | Extract expensive subtrees into memo'd components for early bailout |
| RerenderMemoWithDefaultValue | MEDIUM | Provide stable default values to prevent breaking memo comparisons |
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
| RenderingHydrationNoFlicker | MEDIUM | Use synchronous scripts for client-only DOM updates to prevent flicker |
| RenderingHydrationSuppressWarning | LOW | Use suppressHydrationWarning only for intentional mismatches (timestamps, IDs) |
| RenderingActivity | MEDIUM | Use React 19 Activity component to preserve state of hidden subtrees |
| RenderingConditionalRender | MEDIUM | Avoid mounting/unmounting components that toggle frequently — hide instead |
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

**Note:** If your project has [React Compiler](https://react.dev/learn/react-compiler) enabled, manual memoization with `memo()` and `useMemo()` is not necessary. The compiler automatically optimizes re-renders.

---

### R4.3 Extract Default Non-primitive Parameter Value from Memoized Component to Constant

**Impact: MEDIUM (restores memoization by using a constant for default value)**

When memoized component has a default value for some non-primitive optional parameter, such as an array, function, or object, calling the component without that parameter results in broken memoization. This is because new value instances are created on every rerender, and they do not pass strict equality comparison in `memo()`.

To address this issue, extract the default value into a constant.

**Incorrect: `onClick` has different values on every rerender**

```tsx
const UserAvatar = memo(function UserAvatar({ onClick = () => {} }: { onClick?: () => void }) {
  // ...
})

// Used without optional onClick
<UserAvatar />
```

**Correct: stable default value**

```tsx
const NOOP = () => {};

const UserAvatar = memo(function UserAvatar({ onClick = NOOP }: { onClick?: () => void }) {
  // ...
})

// Used without optional onClick
<UserAvatar />
```

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

When updating state based on the current state value, use the functional update form of setState instead of directly referencing the state variable. This prevents stale closures, eliminates unnecessary dependencies, and creates stable callback references.

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
  
  // Stable callback, never recreated
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

3. **Fewer dependencies** - Simplifies dependency arrays and reduces memory leaks

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

**Correct: runs only once**

```tsx
function FilteredList({ items }: { items: Item[] }) {
  // buildSearchIndex() runs ONLY on initial render
  const [searchIndex, setSearchIndex] = useState(() => buildSearchIndex(items))
  const [query, setQuery] = useState('')
  
  return <SearchResults index={searchIndex} query={query} />
}

function UserProfile() {
  // JSON.parse runs only on initial render
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem('settings')
    return stored ? JSON.parse(stored) : {}
  })
  
  return <SettingsForm settings={settings} onChange={setSettings} />
}
```

Use lazy initialization when computing initial values from localStorage/sessionStorage, building data structures (indexes, maps), reading from the DOM, or performing heavy transformations.

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

**Impact: LOW (enables hardware acceleration)**

Many browsers don't have hardware acceleration for CSS3 animations on SVG elements. Wrap SVG in a `<div>` and animate the wrapper instead.

**Incorrect: animating SVG directly - no hardware acceleration**

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

**Correct: animating wrapper div - hardware accelerated**

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

This applies to all CSS transforms and transitions (`transform`, `opacity`, `translate`, `scale`, `rotate`). The wrapper div allows browsers to use GPU acceleration for smoother animations.

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

For 1000 messages, browser skips layout/paint for ~990 off-screen items (10× faster initial render).

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

**Note:** If your project has [React Compiler](https://react.dev/learn/react-compiler) enabled, the compiler automatically hoists static JSX elements and optimizes component re-renders, making manual hoisting unnecessary.

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

### R4.19 Use Activity Component for Show/Hide

**Impact: MEDIUM (preserves state/DOM)**

Use React's `<Activity>` to preserve state/DOM for expensive components that frequently toggle visibility.

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

Avoids expensive re-renders and state loss.

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

- **RerenderDerivedState + RerenderDerivedStateNoEffect** are two sides of the same coin. DerivedState says: compute inline. DerivedStateNoEffect says: never use useEffect for this. When reviewing, finding a useEffect that calls setState with a value derived from props/state is a violation of both rules simultaneously. The fix is always the same: derive inline or use useMemo.
- **RerenderMemo + RerenderMemoWithDefaultValue + RenderingHoistJsx** form the memoization chain. Memo wraps the component; DefaultValue ensures default props do not create new references that break memo; HoistJsx ensures static children do not break the parent's memo. Applying Memo alone without the other two often produces no measurable improvement because new references from defaults or inline JSX defeat the shallow comparison.
- **RerenderDeferReads + RerenderTransitions + RerenderMoveEffectToEvent** are all strategies for reducing how often renders happen. DeferReads avoids subscribing to state that is only needed in callbacks. Transitions mark updates as non-urgent so React can batch them. MoveEffectToEvent moves logic out of the render cycle entirely. These three rules should be evaluated together when diagnosing a component that renders too often.
- **RenderingHydrationNoFlicker + RenderingHydrationSuppressWarning** handle opposite sides of the hydration problem. NoFlicker is for values that must be correct immediately (themes, auth). SuppressWarning is for values that are intentionally different between server and client (timestamps, random IDs). Using the wrong pattern causes either flicker (SuppressWarning where NoFlicker is needed) or suppressed real bugs (NoFlicker where SuppressWarning suffices).
- **RenderingActivity + RenderingConditionalRender + RenderingContentVisibility** address hidden content from different angles. Activity preserves React state of hidden subtrees (tabs). ConditionalRender avoids mount/unmount cycles for frequently toggled UI. ContentVisibility defers browser layout calculations for off-screen content. For a tabbed interface, combine Activity (state preservation) with ContentVisibility (layout optimization).

## Anti-Patterns (Severity Calibration)

### CRITICAL
- **Derived state in useEffect causing render loop**: `useEffect(() => { setFilteredItems(items.filter(predicate)) }, [items, predicate])` — every state change causes a double render. With large lists, this can cause visible jank on every keystroke. Replace with `const filteredItems = useMemo(() => items.filter(predicate), [items, predicate])`.
- **Hydration mismatch on auth state**: Reading `document.cookie` or `localStorage.getItem('token')` during initial server render, causing React to discard all server-rendered HTML and re-render the entire page client-side. This negates all SSR/streaming benefits.

### HIGH
- **Memo defeated by inline objects**: `<MemoizedList items={items} style={{ padding: 8 }} />` — the style object is a new reference every render, causing MemoizedList to re-render every time its parent renders. The `memo()` call provides zero benefit.
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

### Example 2: Hydration-Safe Theme with Transitions (HydrationNoFlicker + Transitions + DeferReads)

```tsx
// BEFORE: Theme flickers from light to dark after hydration
function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState('light')
  useEffect(() => {
    setTheme(localStorage.getItem('theme') || 'light')
  }, [])
  return <div className={theme}>{children}</div>
}

// AFTER: Synchronous script prevents flicker + transition for toggling
function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <div id="theme-root">{children}</div>
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          try {
            var theme = localStorage.getItem('theme') || 'light';
            document.getElementById('theme-root').className = theme;
          } catch(e) {}
        })();
      `}} />
    </>
  )
}

// Theme toggle uses transition — non-urgent, does not block typing
function ThemeToggle() {
  const handleToggle = () => {
    const next = document.getElementById('theme-root')?.className === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    startTransition(() => {
      document.getElementById('theme-root')!.className = next
    })
  }
  return <button onClick={handleToggle}>Toggle Theme</button>
}
```

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

// AFTER: Stable defaults + hoisted JSX + lazy init
const DEFAULT_CONFIG: DashboardConfig = {}
const chartContainerStyle = { padding: 16 }

function Dashboard({ config = DEFAULT_CONFIG }: { config?: DashboardConfig }) {
  const [data] = useState(() => parseExpensiveConfig(rawConfig)) // lazy
  return (
    <MemoizedPanel config={config}>
      <div style={chartContainerStyle}>
        <Chart data={data} />
      </div>
    </MemoizedPanel>
  )
}
```

Four rules interact: MemoWithDefaultValue provides `DEFAULT_CONFIG` so memo is not broken by `{}`. HoistJsx moves the style object outside render. LazyStateInit wraps the expensive parser in a function. Memo on the panel can now actually skip renders.

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
