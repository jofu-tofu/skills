# Hover States

## Impact: HIGH (Interaction Feedback)

Hover states provide essential visual feedback that an element is interactive. Missing hover states leave users guessing what is clickable. Hover-dependent interactions break on touch devices where no hover exists. Using `cursor: pointer` inconsistently creates confusion about which elements respond to clicks.

---

## Requirements Summary

| Requirement | Implementation | Impact |
|-------------|----------------|--------|
| Cursor pointer | `cursor: pointer` on all clickable elements | Affordance signal |
| Hover visual feedback | Color, opacity, or background change on hover | Interaction confirmation |
| Touch device fallback | `@media (hover: hover)` for hover-only styles | No broken states on mobile |
| Disabled cursor | `cursor: not-allowed` on disabled elements | Disabled affordance |
| Hover contrast | Hover state meets 3:1 contrast against adjacent | WCAG compliance |
| Stable hover layout | No size/position shifts on hover | Prevents layout jank |

---

## Code Examples

### Cursor Pointer on Interactive Elements

#### Incorrect

```css
/* Clickable card with no cursor change */
.clickable-card {
  /* No cursor: pointer — user cannot tell it is clickable */
}

/* Custom checkbox with default cursor */
.custom-toggle {
  /* Looks interactive but cursor stays as arrow */
}
```

#### Correct

```css
/* All interactive elements signal clickability */
.clickable-card {
  cursor: pointer;
}

button, a, [role="button"], [role="link"],
summary, label[for], .clickable {
  cursor: pointer;
}

/* Disabled state */
button:disabled, [aria-disabled="true"] {
  cursor: not-allowed;
  opacity: 0.5;
}
```

### Hover Visual Feedback

#### Incorrect

```css
/* No visual change on hover — no feedback */
.nav-link:hover {
  /* nothing */
}

/* Scale transform on hover — causes layout shift */
.card:hover {
  transform: scale(1.05);
  /* Shifts surrounding content */
}
```

#### Correct

```css
/* Subtle background change — stable layout */
.nav-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-primary);
}

/* Box-shadow instead of scale — no layout shift */
.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

```tsx
// React component with hover state
function InteractiveCard({ title, onClick }: CardProps) {
  return (
    <>
      <button type="button" className="card" onClick={onClick}>
        <h3>{title}</h3>
      </button>
      <style jsx>{`
        .card {
          cursor: pointer;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 16px;
          background: var(--bg-surface);
          transition: box-shadow 150ms ease, border-color 150ms ease;
        }

        .card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: var(--color-primary);
        }

        .card:active {
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </>
  );
}
```

### Touch Device Hover Handling

#### Incorrect

```css
/* Hover state sticks on touch devices — "ghost hover" */
.button:hover {
  background: blue;
  color: white;
}
/* On mobile: tap triggers hover, state sticks after finger lifts */
```

#### Correct

```css
/* Hover styles only on devices that support hover */
@media (hover: hover) {
  .button:hover {
    background: blue;
    color: white;
  }
}

/* Active state works on all devices */
.button:active {
  background: darkblue;
  color: white;
}
```

```tsx
// React component with hover media query
function Button({ children, onClick }: ButtonProps) {
  return (
    <>
      <button type="button" className="btn" onClick={onClick}>
        {children}
      </button>
      <style jsx>{`
        .btn {
          cursor: pointer;
          padding: 10px 20px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-surface);
          transition: background 150ms ease;
        }

        /* Only apply hover on hover-capable devices */
        @media (hover: hover) {
          .btn:hover {
            background: var(--bg-hover);
          }
        }

        /* Active state for all devices including touch */
        .btn:active {
          background: var(--bg-active);
        }
      `}</style>
    </>
  );
}
```

### Hover Transition Timing

#### Correct

```css
/* Use 150-300ms for micro-interactions */
.interactive-element {
  transition: background-color 150ms ease,
              box-shadow 150ms ease,
              border-color 150ms ease;
}

/* Never transition: all */
.interactive-element {
  transition: all 200ms; /* BAD — animates layout properties */
}
```

---

## Testing Guidance

### Manual Testing

1. **Desktop hover**: Move cursor over all interactive elements — each should show visual change
2. **Touch device**: Tap interactive elements — no "stuck" hover state after finger lifts
3. **Cursor check**: Verify cursor changes to pointer on clickable elements
4. **Disabled state**: Hover over disabled elements — cursor shows not-allowed

### Anti-Patterns to Flag

```
No cursor: pointer on clickable elements  → Add cursor: pointer
transform: scale on hover                 → Use box-shadow instead
No @media (hover: hover) wrapper          → Hover sticks on touch
transition: all                           → List properties explicitly
```

---

## WCAG Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast) | AA | Interactive element states have 3:1 contrast |
| [1.4.13 Content on Hover or Focus](https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus) | AA | Hover-triggered content is dismissible, hoverable, persistent |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) | AA | Hover targets meet minimum size |
