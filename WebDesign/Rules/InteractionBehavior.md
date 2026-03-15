# Interaction Behavior

## Impact: HIGH (Touch & Drag UX)

Default browser behaviors like tap highlight, overscroll bounce, text selection during drag, and aggressive autofocus create jarring experiences in app-like interfaces. Controlling these behaviors makes web applications feel polished and intentional without sacrificing accessibility.

---

## Requirements Summary

| Requirement | Implementation | Use Case |
|-------------|----------------|----------|
| Tap highlight control | `-webkit-tap-highlight-color: transparent` | Custom tap feedback |
| Overscroll containment | `overscroll-behavior: contain` | Modals, drawers, sheets |
| Drag text selection | `user-select: none` during drag | Drag-and-drop interfaces |
| AutoFocus restraint | `autoFocus` only on desktop primary input | Avoid mobile keyboard popup |
| Inert during drag | `inert` attribute on dragged elements | Prevent interaction with ghost |

---

## Code Examples

### Tap Highlight Control

#### Incorrect

```css
/* Default blue/gray flash on every tap — looks unfinished */
.app-button {
  /* No tap highlight override */
}
```

#### Correct

```css
/* Remove default tap highlight, provide custom feedback */
.app-button {
  -webkit-tap-highlight-color: transparent;
  transition: background-color 100ms ease;
}

.app-button:active {
  background-color: var(--color-active);
}
```

### Overscroll Behavior

#### Incorrect

```css
/* Modal scroll bounces and pulls down parent page */
.modal-body {
  overflow-y: auto;
  /* Parent page scrolls when modal reaches scroll boundary */
}
```

#### Correct

```css
/* Contain scroll within modal — no scroll chaining */
.modal-body {
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* Prevent pull-to-refresh on app-like pages */
.app-shell {
  overscroll-behavior-y: contain;
}
```

```tsx
// React modal with scroll containment
function ScrollableModal({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="modal-content">{children}</div>
      <style jsx>{`
        .modal-content {
          max-height: 80vh;
          overflow-y: auto;
          overscroll-behavior: contain;
        }
      `}</style>
    </>
  );
}
```

### Drag Interaction

#### Incorrect

```tsx
// Text gets selected during drag — messy UX
function DraggableItem({ children }: DraggableProps) {
  return (
    <div
      draggable
      onDragStart={handleDragStart}
    >
      {children} {/* Text selection happens during drag */}
    </div>
  );
}
```

#### Correct

```tsx
// Disable text selection during drag
function DraggableItem({ children, onDragStart, onDragEnd }: DraggableProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.currentTarget.style.userSelect = 'none';
    e.currentTarget.setAttribute('inert', '');
    onDragStart?.(e);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.style.userSelect = '';
    e.currentTarget.removeAttribute('inert');
    onDragEnd?.(e);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="draggable"
    >
      {children}
    </div>
  );
}
```

```css
/* CSS approach for drag containers */
.drag-active {
  user-select: none;
  -webkit-user-select: none;
}

.drag-active * {
  pointer-events: none;
}
```

### AutoFocus Control

#### Incorrect

```tsx
// AutoFocus on mobile opens keyboard immediately — bad UX
function SearchPage() {
  return (
    <input
      type="search"
      autoFocus  {/* Opens keyboard on mobile, hides content */}
      placeholder="Search..."
    />
  );
}
```

#### Correct

```tsx
// AutoFocus only on desktop, single primary input
function SearchPage() {
  const isDesktop = useMediaQuery('(hover: hover) and (pointer: fine)');

  return (
    <input
      type="search"
      autoFocus={isDesktop}
      placeholder="Search..."
    />
  );
}

// Hook for media query
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
```

---

## Testing Guidance

### Manual Testing

1. **Tap highlight**: Tap buttons on mobile — no default blue/gray flash
2. **Overscroll**: Scroll to bottom of modal content, continue scrolling — parent page should not move
3. **Drag selection**: Drag an item — no text selection should occur
4. **AutoFocus mobile**: Load page on mobile — keyboard should not appear unless user taps input

### Anti-Patterns to Flag

```
No -webkit-tap-highlight-color on app buttons → Set transparent + custom :active
No overscroll-behavior on modal/drawer         → Add overscroll-behavior: contain
No user-select: none during drag               → Disable selection in drag handlers
autoFocus without device check                 → Gate with hover media query
```

---

## WCAG Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard) | A | All drag interactions have keyboard alternative |
| [2.5.1 Pointer Gestures](https://www.w3.org/WAI/WCAG21/Understanding/pointer-gestures) | A | Complex gestures have single-pointer alternative |
| [2.5.7 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements) | AA | Drag operations have click/tap alternative |
