# Render Performance

## Impact: MEDIUM-HIGH (Runtime Smoothness)

Layout thrashing, unvirtualized long lists, and expensive controlled inputs cause visible jank during scrolling and interaction. Reading layout properties during render forces synchronous reflow. Rendering thousands of DOM nodes when only dozens are visible wastes memory and CPU. These patterns are framework-agnostic — they apply to React, Vue, Svelte, and vanilla JavaScript.

---

## Requirements Summary

| Requirement | Implementation | Impact |
|-------------|----------------|--------|
| Virtualize long lists | Use virtual scrolling for >50 items | DOM node reduction |
| No layout reads in render | Avoid `getBoundingClientRect`, `offsetHeight` in render path | Prevents forced reflow |
| Batch DOM operations | Group reads then writes, never interleave | Prevents layout thrashing |
| Uncontrolled inputs preferred | Use `defaultValue` over `value` for non-validating inputs | Reduces re-renders per keystroke |
| Content-visibility | `content-visibility: auto` for off-screen sections | Skip rendering off-screen |

---

## Code Examples

### Virtualizing Long Lists

#### Incorrect

```tsx
// Rendering 10,000 DOM nodes — browser struggles
function ProductList({ products }: { products: Product[] }) {
  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
// With 10,000 products: 10,000 DOM nodes, massive memory usage, slow scroll
```

#### Correct

```tsx
// Virtual scrolling — only renders visible items (~20-30 DOM nodes)
import { useVirtualizer } from '@tanstack/react-virtual';

function ProductList({ products }: { products: Product[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated row height
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualRow.start}px)`,
              width: '100%',
            }}
          >
            <ProductCard product={products[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

```css
/* CSS-only alternative for simpler cases */
.long-list-section {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px; /* Estimated height */
}
```

### No Layout Reads in Render

#### Incorrect

```tsx
// Reading layout during render — forces synchronous reflow
function PositionedTooltip({ target, children }: TooltipProps) {
  const rect = target.getBoundingClientRect(); // Forces layout calculation

  return (
    <div style={{ top: rect.bottom, left: rect.left }}>
      {children}
    </div>
  );
}
```

#### Correct

```tsx
// Read layout in effect, not render
function PositionedTooltip({ targetRef, children }: TooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom, left: rect.left });
    }
  }, [targetRef]);

  return (
    <div style={{ position: 'fixed', top: position.top, left: position.left }}>
      {children}
    </div>
  );
}
```

### Batch DOM Reads and Writes

#### Incorrect

```javascript
// Interleaving reads and writes — layout thrashing
elements.forEach(el => {
  const height = el.offsetHeight; // READ — forces layout
  el.style.height = height * 2 + 'px'; // WRITE — invalidates layout
  // Next iteration: READ forces layout again
});
```

#### Correct

```javascript
// Batch all reads, then batch all writes
const heights = elements.map(el => el.offsetHeight); // All READs first

elements.forEach((el, i) => {
  el.style.height = heights[i] * 2 + 'px'; // All WRITEs after
});

// Or use requestAnimationFrame for write batching
const heights = elements.map(el => el.offsetHeight);
requestAnimationFrame(() => {
  elements.forEach((el, i) => {
    el.style.height = heights[i] * 2 + 'px';
  });
});
```

### Uncontrolled Inputs

#### Incorrect

```tsx
// Controlled input re-renders entire form on every keystroke
function SearchForm() {
  const [query, setQuery] = useState('');

  return (
    <input
      value={query}
      onChange={e => setQuery(e.target.value)} // Re-render per keystroke
    />
  );
}
```

#### Correct

```tsx
// Uncontrolled input — no re-render on keystroke
function SearchForm() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputRef.current?.value;
    // Use query
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} defaultValue="" />
      <button type="submit">Search</button>
    </form>
  );
}

// If controlled is needed, ensure onChange handler is cheap
function CheapControlledInput() {
  const [value, setValue] = useState('');

  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
      // OK if parent component is lightweight and doesn't trigger expensive renders
    />
  );
}
```

---

## Testing Guidance

### Manual Testing

1. **Long list scroll**: Load 1000+ items — scrolling should be smooth at 60fps
2. **DevTools Performance**: Record a scroll — look for long Layout/Reflow tasks
3. **DOM node count**: Check Elements panel — visible list should have ~20-30 nodes, not thousands
4. **Input responsiveness**: Type rapidly in form fields — no visible lag

### Anti-Patterns to Flag

```
.map() on 50+ items without virtualization     → Add virtual scrolling
getBoundingClientRect in render function       → Move to useEffect
Interleaving DOM reads and writes              → Batch reads then writes
Controlled input without validation need       → Use defaultValue + ref
```

---

## References

| Topic | Source |
|-------|--------|
| Content-visibility | [MDN content-visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility) |
| Layout thrashing | [What forces layout/reflow](https://gist.github.com/paulirish/5d52fb081b3570c81e3a) |
| React Virtual | [TanStack Virtual](https://tanstack.com/virtual/latest) |
