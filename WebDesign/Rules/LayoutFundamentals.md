# Layout Fundamentals

## Impact: HIGH (Visual Stability)

Safe areas, viewport configuration, and layout architecture prevent content from being obscured by device notches, overlapping elements, or broken layouts. Incorrect viewport meta tags break accessibility zoom. Missing safe-area insets hide content behind notches on modern phones. Unmanaged z-index creates layering chaos that makes modals appear behind toolbars.

---

## Requirements Summary

| Requirement | Implementation | Impact |
|-------------|----------------|--------|
| Viewport meta tag | `width=device-width, initial-scale=1` | Responsive baseline |
| Never disable zoom | Do not use `user-scalable=no` or `maximum-scale=1` | WCAG 1.4.4 violation |
| Safe area insets | `env(safe-area-inset-*)` for full-bleed layouts | Notch/island coverage |
| Viewport-fit cover | `viewport-fit=cover` when using safe-area insets | Required for env() to work |
| Z-index scale | Define scale (10, 20, 30, 50) in design tokens | Predictable layering |
| Flex/grid over JS | Use CSS layout over JavaScript measurement | Performance + SSR safety |
| Floating elements | Add spacing from edges (`top-4 left-4 right-4`) | Avoids edge collision |

---

## Code Examples

### Viewport Meta Tag

#### Incorrect

```html
<!-- Disables user zoom — WCAG violation -->
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, maximum-scale=1">
```

#### Correct

```html
<!-- Allows user zoom, enables responsive layout -->
<meta name="viewport" content="width=device-width, initial-scale=1">

<!-- When using safe-area insets -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

### Safe Area Insets

#### Incorrect

```css
/* Content hidden behind notch on iPhone */
.full-bleed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px;
}
```

#### Correct

```css
/* Content respects device safe areas */
.full-bleed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px;
  padding-top: calc(16px + env(safe-area-inset-top));
  padding-left: calc(16px + env(safe-area-inset-left));
  padding-right: calc(16px + env(safe-area-inset-right));
}

/* Bottom navigation respects home indicator */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-bottom: env(safe-area-inset-bottom);
}
```

```tsx
// React component with safe area support
function FullBleedHeader({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="full-bleed-header">{children}</header>
      <style jsx>{`
        .full-bleed-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          padding: 16px;
          padding-top: calc(16px + env(safe-area-inset-top));
          padding-left: calc(16px + env(safe-area-inset-left));
          padding-right: calc(16px + env(safe-area-inset-right));
        }
      `}</style>
    </>
  );
}
```

### Z-Index Scale

#### Incorrect

```css
/* Ad-hoc z-index values — layering chaos */
.dropdown { z-index: 999; }
.modal { z-index: 9999; }
.tooltip { z-index: 99999; }
.header { z-index: 100; }
```

#### Correct

```css
/* Design token z-index scale */
:root {
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-overlay: 30;
  --z-modal: 40;
  --z-toast: 50;
}

.dropdown { z-index: var(--z-dropdown); }
.sticky-header { z-index: var(--z-sticky); }
.modal-backdrop { z-index: var(--z-overlay); }
.modal { z-index: var(--z-modal); }
.toast { z-index: var(--z-toast); }
```

### Layout with CSS Grid/Flex Over JavaScript

#### Incorrect

```tsx
// Measuring layout with JavaScript — causes layout thrashing
function ResponsiveGrid({ items }: { items: Item[] }) {
  const [cols, setCols] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setCols(width > 1024 ? 4 : width > 768 ? 3 : width > 480 ? 2 : 1);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {items.map(item => <Card key={item.id} {...item} />)}
    </div>
  );
}
```

#### Correct

```tsx
// CSS handles responsive layout — no JavaScript needed
function ResponsiveGrid({ items }: { items: Item[] }) {
  return (
    <>
      <div className="grid">
        {items.map(item => <Card key={item.id} {...item} />)}
      </div>
      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
      `}</style>
    </>
  );
}
```

---

## Testing Guidance

### Manual Testing

1. **Viewport zoom**: Pinch-zoom to 200% — content must remain readable and not overflow
2. **Notch devices**: Test on iPhone with notch/Dynamic Island in landscape orientation
3. **Z-index layers**: Open a modal while a dropdown is visible — modal must appear above
4. **Responsive breakpoints**: Resize browser from 320px to 1920px — no layout breaks

### Anti-Patterns to Flag

```
user-scalable=no          → WCAG 1.4.4 violation
maximum-scale=1           → WCAG 1.4.4 violation
z-index: 9999             → Missing z-index scale
window.innerWidth in render → Use CSS media queries instead
```

---

## WCAG Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG21/Understanding/resize-text) | AA | Content readable at 200% zoom |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow) | AA | No horizontal scroll at 320px width |
| [1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG21/Understanding/text-spacing) | AA | Content adapts to text spacing changes |
