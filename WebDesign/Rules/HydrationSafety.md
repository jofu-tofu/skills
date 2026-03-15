# Hydration Safety

## Impact: MEDIUM (SSR Correctness)

Hydration mismatches occur when server-rendered HTML differs from what React generates on the client. This causes React to discard and re-render DOM nodes, causing visual flicker, lost state, and console warnings. Common triggers include date/time rendering (server timezone vs client timezone), browser-only APIs in render, and controlled inputs missing their `onChange` handler.

---

## Requirements Summary

| Requirement | Implementation | Impact |
|-------------|----------------|--------|
| Date rendering guards | Render dates in useEffect or with suppressHydrationWarning | No mismatch flicker |
| Controlled input handlers | Every `value` prop needs `onChange` (or use `defaultValue`) | No console warnings |
| Browser API guards | Check `typeof window` before using browser APIs in render | SSR compatibility |
| suppressHydrationWarning | Only on intentionally dynamic elements (timestamps, random) | Targeted suppression |

---

## Code Examples

### Date/Time Rendering

#### Incorrect

```tsx
// Server renders in UTC, client renders in user's timezone — MISMATCH
function LastUpdated({ date }: { date: Date }) {
  return <span>Updated: {date.toLocaleString()}</span>;
  // Server: "2/14/2026, 12:00:00 AM" (UTC)
  // Client: "2/13/2026, 6:00:00 PM" (CST)
  // React hydration mismatch → flicker
}
```

#### Correct

```tsx
// Option 1: Render in useEffect (client-only)
function LastUpdated({ date }: { date: Date }) {
  const [formatted, setFormatted] = useState<string>();

  useEffect(() => {
    setFormatted(new Intl.DateTimeFormat(navigator.language, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date));
  }, [date]);

  if (!formatted) {
    return <span>Updated: <time dateTime={date.toISOString()}>{date.toISOString().split('T')[0]}</time></span>;
  }

  return <span>Updated: <time dateTime={date.toISOString()}>{formatted}</time></span>;
}

// Option 2: suppressHydrationWarning for known-dynamic content
function LastUpdated({ date }: { date: Date }) {
  return (
    <time dateTime={date.toISOString()} suppressHydrationWarning>
      {date.toLocaleString()}
    </time>
  );
}
```

### Controlled Inputs

#### Incorrect

```tsx
// value without onChange — React warns, input becomes read-only
function ReadOnlyBug() {
  return <input value="fixed text" />;
  // Warning: You provided a `value` prop without an `onChange` handler
}
```

#### Correct

```tsx
// Option 1: Use defaultValue for uncontrolled inputs
function UncontrolledInput() {
  return <input defaultValue="initial text" />;
}

// Option 2: Add onChange for controlled inputs
function ControlledInput() {
  const [value, setValue] = useState('initial text');
  return <input value={value} onChange={e => setValue(e.target.value)} />;
}

// Option 3: readOnly for intentionally non-editable
function DisplayInput() {
  return <input value="fixed text" readOnly />;
}
```

### Browser API Guards

#### Incorrect

```tsx
// window/document used in render — crashes during SSR
function WindowSize() {
  return <span>Width: {window.innerWidth}px</span>;
  // ReferenceError: window is not defined (server)
}

function ThemeDetector() {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return <div className={isDark ? 'dark' : 'light'} />;
  // Crashes on server
}
```

#### Correct

```tsx
// Browser APIs in useEffect only
function WindowSize() {
  const [width, setWidth] = useState<number>();

  useEffect(() => {
    setWidth(window.innerWidth);
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return <span>Width: {width ?? '...'}px</span>;
}

// Or typeof guard for simple checks
function getStoredTheme(): string {
  if (typeof window === 'undefined') return 'light'; // SSR fallback
  return localStorage.getItem('theme') ?? 'light';
}
```

### suppressHydrationWarning Usage

#### Incorrect

```tsx
// Suppress on entire component tree — hides real bugs
function App() {
  return (
    <div suppressHydrationWarning>
      {/* Everything inside suppressed — dangerous */}
      <Header />
      <Main />
      <Footer />
    </div>
  );
}
```

#### Correct

```tsx
// Suppress only on the specific element that intentionally differs
function LiveClock() {
  return (
    <time
      dateTime={new Date().toISOString()}
      suppressHydrationWarning  // Only this element, intentionally dynamic
    >
      {new Date().toLocaleTimeString()}
    </time>
  );
}
```

---

## Testing Guidance

### Manual Testing

1. **Console check**: Open browser console after page load — no hydration warnings
2. **SSR comparison**: View page source vs rendered DOM — should match
3. **Date rendering**: Load page in different timezone — no flicker on timestamps
4. **Input test**: Type in every form field — none should be stuck/read-only

### Anti-Patterns to Flag

```
date.toLocaleString() in render       → Use useEffect or suppressHydrationWarning
window/document in render function    → Guard with typeof or useEffect
<input value="x"> without onChange    → Use defaultValue or add onChange
suppressHydrationWarning on parent    → Apply only to specific dynamic element
Math.random() in render               → Move to useEffect or use deterministic seed
```

---

## References

| Topic | Source |
|-------|--------|
| React hydration | [React Docs - Hydration](https://react.dev/reference/react-dom/client/hydrateRoot) |
| suppressHydrationWarning | [React Docs - DOM Components](https://react.dev/reference/react-dom/components/common) |
