# Animation Techniques

## Impact: MEDIUM-HIGH (Performance & Polish)

Poorly implemented animations cause jank, dropped frames, and battery drain. Animating layout-triggering properties like `width`, `height`, or `top` forces the browser to recalculate layout on every frame. Using `transition: all` animates properties unintentionally. Animations that cannot be interrupted feel unresponsive. Following compositor-friendly patterns ensures smooth 60fps animation without layout thrashing.

---

## Requirements Summary

| Requirement | Implementation | Impact |
|-------------|----------------|--------|
| Compositor-only properties | Animate only `transform` and `opacity` | 60fps, no layout recalc |
| Never transition all | List properties explicitly in `transition` | Prevents unintended animation |
| Transform origin | Set `transform-origin` explicitly | Predictable rotation/scale |
| SVG transforms | Use `<g>` wrapper with `transform-box: fill-box` | Correct SVG pivot point |
| Interruptible animations | Respond to user input mid-animation | Responsive feel |
| Timing functions | 150-300ms for micro-interactions | Natural, not sluggish |
| Will-change sparingly | Only on elements about to animate | GPU layer promotion |

---

## Code Examples

### Compositor-Friendly Animation

#### Incorrect

```css
/* Animating width/height triggers layout recalculation every frame */
.expanding-panel {
  transition: width 300ms, height 300ms;
  width: 100px;
  height: 50px;
}

.expanding-panel.open {
  width: 400px;
  height: 300px;
}

/* Animating top/left triggers layout */
.sliding-element {
  transition: top 300ms, left 300ms;
  position: absolute;
  top: 0;
}

.sliding-element.moved {
  top: 100px;
  left: 200px;
}
```

#### Correct

```css
/* Use transform for position changes — compositor-only, no layout */
.sliding-element {
  transition: transform 300ms ease-out;
}

.sliding-element.moved {
  transform: translate(200px, 100px);
}

/* Use transform: scale for size changes */
.expanding-panel {
  transition: transform 300ms ease-out, opacity 300ms ease-out;
  transform-origin: top left;
}

.expanding-panel.open {
  transform: scale(1.2);
}

/* Fade in/out with opacity */
.fade-element {
  transition: opacity 200ms ease;
}

.fade-element.hidden {
  opacity: 0;
  pointer-events: none;
}
```

### Never Transition All

#### Incorrect

```css
/* transition: all animates EVERY property change — padding, color, dimensions */
.button {
  transition: all 200ms;
  padding: 8px 16px;
  background: blue;
}

.button:hover {
  padding: 12px 20px; /* Layout shift + animation on padding */
  background: darkblue;
}
```

#### Correct

```css
/* List only the properties you intend to animate */
.button {
  transition: background-color 150ms ease, box-shadow 150ms ease;
  padding: 8px 16px;
  background: blue;
}

.button:hover {
  background: darkblue;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
```

### SVG Transform with Wrapper

#### Incorrect

```html
<!-- SVG transform rotates around (0,0) — wrong pivot -->
<svg viewBox="0 0 100 100">
  <rect x="25" y="25" width="50" height="50" class="rotating" />
</svg>

<style>
.rotating {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

#### Correct

```html
<!-- Wrap in <g> with transform-box for correct pivot -->
<svg viewBox="0 0 100 100">
  <g class="rotating" style="transform-box: fill-box; transform-origin: center;">
    <rect x="25" y="25" width="50" height="50" />
  </g>
</svg>

<style>
.rotating {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

### Interruptible Animations

#### Incorrect

```tsx
// Animation plays to completion, ignoring user input
function SlidePanel({ isOpen }: { isOpen: boolean }) {
  return (
    <div
      className={`panel ${isOpen ? 'open' : ''}`}
      style={{
        transition: 'transform 500ms',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}
    />
  );
}
// If user toggles rapidly, panel doesn't respond until animation finishes
```

#### Correct

```tsx
// Animation responds immediately to state changes
function SlidePanel({ isOpen }: { isOpen: boolean }) {
  return (
    <>
      <div className={`panel ${isOpen ? 'open' : 'closed'}`} />
      <style jsx>{`
        .panel {
          /* Short duration allows quick interruption */
          transition: transform 200ms ease-out;
          transform: translateX(-100%);
        }
        .panel.open {
          transform: translateX(0);
        }
        /* Browser interpolates between current and target position */
      `}</style>
    </>
  );
}
```

### Timing Guidelines

```css
/* Micro-interactions: 150-300ms */
.button { transition: background-color 150ms ease; }
.dropdown { transition: opacity 200ms ease, transform 200ms ease; }

/* Page transitions: 200-400ms */
.page-enter { transition: opacity 300ms ease-out; }

/* Complex animations: 300-500ms */
.modal-enter { transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1); }

/* Never exceed 500ms for UI transitions — feels sluggish */
```

---

## Testing Guidance

### Manual Testing

1. **Frame rate**: Open DevTools Performance tab, record animation — should maintain 60fps
2. **Jank check**: Animate element while scrolling — no visible stutter
3. **Interruption**: Toggle animation trigger rapidly — should respond immediately
4. **Layout paint**: Enable "Paint flashing" in DevTools — animated elements should not trigger green flashes on nearby elements

### Anti-Patterns to Flag

```
transition: all              → List properties explicitly
Animating width/height       → Use transform: scale
Animating top/left           → Use transform: translate
Animation > 500ms for UI     → Reduce to 200-300ms
SVG transform without <g>    → Wrap in <g> with transform-box
will-change on many elements → Only on elements about to animate
```

---

## References

| Topic | Source |
|-------|--------|
| Compositor layers | [Rendering Performance - Google](https://web.dev/rendering-performance/) |
| CSS triggers | [CSS Triggers](https://csstriggers.com/) — which properties trigger layout/paint/composite |
| Web animations API | [MDN Web Animations](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) |
