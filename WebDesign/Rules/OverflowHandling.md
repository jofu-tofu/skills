# Overflow Handling

## Impact: HIGH (Layout Stability)

Uncontrolled overflow causes horizontal scrollbars, broken layouts, and content hidden behind other elements. Long URLs, user-generated content, and dynamic data regularly exceed container boundaries. Preventing overflow issues at the CSS level eliminates an entire class of layout bugs that are expensive to debug and easy to miss in testing.

---

## Requirements Summary

| Requirement | Implementation | Use Case |
|-------------|----------------|----------|
| Prevent horizontal scroll | `overflow-x: hidden` on container | Full-page layout |
| Text truncation | `text-overflow: ellipsis` with `overflow: hidden` | Single-line labels |
| Multi-line clamp | `-webkit-line-clamp` with `display: -webkit-box` | Card descriptions |
| Word breaking | `overflow-wrap: break-word` | URLs, long strings |
| Flex min-width fix | `min-width: 0` on flex children | Flex text truncation |
| Grid min-width fix | `minmax(0, 1fr)` instead of `1fr` | Grid text truncation |
| Content-aware sizing | `min-width: 0` or `overflow: hidden` | Nested flex/grid |

---

## Code Examples

### Horizontal Scroll Prevention

#### Incorrect

```css
/* Content overflows viewport — horizontal scrollbar appears */
.page-wrapper {
  /* No overflow control */
}

.hero-image {
  width: 120vw; /* Wider than viewport */
}
```

#### Correct

```css
/* Prevent horizontal overflow at the page level */
html, body {
  overflow-x: hidden;
}

/* Or contain overflow at the component level */
.page-wrapper {
  overflow-x: hidden;
  max-width: 100vw;
}
```

### Text Truncation (Single Line)

#### Incorrect

```css
/* Text overflows its container */
.card-title {
  width: 200px;
  /* Long titles break layout */
}
```

#### Correct

```css
/* Single-line truncation with ellipsis */
.card-title {
  width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

```tsx
// Reusable truncation component
function TruncatedText({ children, maxWidth }: { children: string; maxWidth: string }) {
  return (
    <>
      <span className="truncated" title={children}>{children}</span>
      <style jsx>{`
        .truncated {
          display: block;
          max-width: ${maxWidth};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </>
  );
}
```

### Multi-Line Clamping

#### Correct

```css
/* Clamp text to N lines with ellipsis */
.card-description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

```tsx
// React component with line clamping
function ClampedText({ lines = 3, children }: { lines?: number; children: string }) {
  return (
    <>
      <p className="clamped" title={children}>{children}</p>
      <style jsx>{`
        .clamped {
          display: -webkit-box;
          -webkit-line-clamp: ${lines};
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}
```

### Flex Children Min-Width Fix

#### Incorrect

```css
/* Text truncation broken inside flex container */
.flex-row {
  display: flex;
  gap: 16px;
}

.flex-row .label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* Won't truncate — flex child has implicit min-width: auto */
}
```

#### Correct

```css
/* Fix: add min-width: 0 to flex children */
.flex-row {
  display: flex;
  gap: 16px;
}

.flex-row .label {
  min-width: 0; /* Allows flex child to shrink below content size */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### Grid Min-Width Fix

#### Incorrect

```css
/* Grid items overflow when content is wider than column */
.grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
}
```

#### Correct

```css
/* Use minmax(0, 1fr) to allow grid items to shrink */
.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
}
```

### Long URL / Word Breaking

#### Correct

```css
/* Break long words and URLs that exceed container */
.user-content {
  overflow-wrap: break-word;
  word-break: break-word; /* Legacy fallback */
  hyphens: auto;
}

/* For code blocks and URLs specifically */
.url-display {
  overflow-wrap: anywhere;
  word-break: break-all;
}
```

---

## Testing Guidance

### Manual Testing

1. **Long content**: Paste a 200-character string with no spaces into text fields
2. **Long URLs**: Enter `https://example.com/very/long/path/that/exceeds/container/width` into user-generated content areas
3. **Resize**: Shrink viewport to 320px — no horizontal scrollbar should appear
4. **Dynamic content**: Load content longer than expected in cards, tables, and lists

### Anti-Patterns to Flag

```
No overflow control on flex children   → Add min-width: 0
Using 1fr without minmax in grid       → Use minmax(0, 1fr)
No text-overflow on fixed-width labels → Add truncation styles
overflow: scroll on body/html          → Use overflow-x: hidden
```

---

## WCAG Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow) | AA | No horizontal scroll at 320px CSS width |
| [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG21/Understanding/resize-text) | AA | Content readable when text resized to 200% |
