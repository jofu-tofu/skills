# Responsive Text

## Impact: MEDIUM-HIGH (Low Vision)

Users with low vision often zoom to 200-400% to read content. Fixed pixel typography breaks at these zoom levels, causing horizontal scrolling, overlapping text, and unreadable content. Approximately 4% of the population has visual impairments that benefit from text scaling. Using relative units ensures text remains readable across all zoom levels and device sizes.

---

## Requirements Summary

| Requirement | Specification |
|-------------|---------------|
| Text resizing | Support 200% zoom without loss of content |
| Reflow | No horizontal scroll at 320px viewport (400% zoom equivalent) |
| Units | Use rem/em for font sizes, not px |
| Line height | Use unitless values (1.5) or relative units |
| Container queries | Support text scaling within components |

---

## Code Examples

### Font Size Units

#### Incorrect - Fixed Pixel Typography

```html
<style>
/* Fixed pixels don't scale with user preferences */
body {
  font-size: 16px;
}

h1 {
  font-size: 32px;
}

p {
  font-size: 14px;
  line-height: 20px;
}

.small-text {
  font-size: 12px; /* Too small, doesn't scale */
}
</style>
```

```tsx
// React component with fixed pixels - INACCESSIBLE
const Card = ({ title, description }: CardProps) => (
  <div style={{
    fontSize: '14px',
    lineHeight: '18px',
    padding: '16px'
  }}>
    <h3 style={{ fontSize: '20px' }}>{title}</h3>
    <p>{description}</p>
  </div>
);
```

#### Correct - Relative Unit Typography

```html
<style>
/* Root font size respects user preferences */
:root {
  font-size: 100%; /* Typically 16px, but respects browser settings */
}

body {
  font-size: 1rem;
  line-height: 1.5; /* Unitless scales proportionally */
}

h1 {
  font-size: 2rem; /* 32px at default, scales with zoom */
}

p {
  font-size: 1rem;
  line-height: 1.6;
}

.small-text {
  font-size: 0.875rem; /* 14px at default */
}
</style>
```

```tsx
// React component with responsive typography
const Card = ({ title, description }: CardProps) => (
  <>
    <div className="card">
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
    </div>
    <style jsx>{`
      .card {
        font-size: 1rem;
        line-height: 1.5;
        padding: 1rem;
      }

      .card-title {
        font-size: 1.25rem;
        line-height: 1.3;
        margin-bottom: 0.5em;
      }

      .card-description {
        font-size: 1rem;
      }
    `}</style>
  </>
);
```

### Fluid Typography with clamp()

```html
<style>
/* Fluid typography that scales smoothly */
:root {
  /* Min: 16px, Preferred: 1.5vw + 12px, Max: 20px */
  --font-size-base: clamp(1rem, 0.75rem + 1.5vw, 1.25rem);

  /* Min: 24px, Preferred: 3vw + 12px, Max: 48px */
  --font-size-h1: clamp(1.5rem, 0.75rem + 3vw, 3rem);

  /* Min: 20px, Preferred: 2vw + 12px, Max: 32px */
  --font-size-h2: clamp(1.25rem, 0.75rem + 2vw, 2rem);
}

body {
  font-size: var(--font-size-base);
}

h1 {
  font-size: var(--font-size-h1);
}

h2 {
  font-size: var(--font-size-h2);
}
</style>
```

```tsx
// React design system with fluid typography
const fluidType = {
  '--font-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
  '--font-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
  '--font-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
  '--font-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
  '--font-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
  '--font-2xl': 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
  '--font-3xl': 'clamp(2rem, 1.5rem + 2.5vw, 3rem)',
} as const;

const Typography = () => (
  <style jsx global>{`
    :root {
      ${Object.entries(fluidType)
        .map(([key, value]) => `${key}: ${value};`)
        .join('\n')}
    }
  `}</style>
);
```

### Reflow at 320px

#### Incorrect - Fixed Width Layout

```html
<style>
/* Fixed width causes horizontal scroll */
.container {
  width: 1200px;
  margin: 0 auto;
}

.sidebar {
  width: 300px;
  float: left;
}

.content {
  width: 900px;
  float: left;
}
</style>
```

#### Correct - Responsive Layout

```html
<style>
/* Responsive layout reflows to single column */
.container {
  width: 100%;
  max-width: 75rem; /* 1200px at default */
  margin: 0 auto;
  padding: 0 1rem;
}

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 48rem) {
  .layout {
    grid-template-columns: 20rem 1fr;
  }
}

/* No horizontal scroll at any zoom level */
* {
  max-width: 100%;
}

img, video, iframe {
  height: auto;
}
</style>
```

```tsx
// React responsive layout component
const ResponsiveLayout = ({ sidebar, content }: LayoutProps) => (
  <>
    <div className="layout">
      <aside className="sidebar">{sidebar}</aside>
      <main className="content">{content}</main>
    </div>
    <style jsx>{`
      .layout {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
      }

      @media (min-width: 48rem) {
        .layout {
          flex-direction: row;
        }

        .sidebar {
          flex: 0 0 16rem;
        }

        .content {
          flex: 1;
          min-width: 0; /* Prevent overflow */
        }
      }
    `}</style>
  </>
);
```

### Text Truncation and Overflow

```tsx
// Safe text truncation that respects zoom
const TruncatedText = ({ text, lines = 3 }: TruncatedProps) => (
  <>
    <p className="truncated">{text}</p>
    <style jsx>{`
      .truncated {
        display: -webkit-box;
        -webkit-line-clamp: ${lines};
        -webkit-box-orient: vertical;
        overflow: hidden;

        /* Ensure text remains readable */
        font-size: 1rem;
        line-height: 1.5;

        /* Allow expansion on focus for full content */
      }

      .truncated:focus {
        -webkit-line-clamp: unset;
        max-height: none;
      }
    `}</style>
  </>
);
```

---

## Typography Scale Example

```css
/* Modular scale using rem */
:root {
  --scale-ratio: 1.25; /* Major third */

  --font-size-xs: 0.64rem;   /* 10.24px */
  --font-size-sm: 0.8rem;    /* 12.8px */
  --font-size-base: 1rem;    /* 16px */
  --font-size-md: 1.25rem;   /* 20px */
  --font-size-lg: 1.563rem;  /* 25px */
  --font-size-xl: 1.953rem;  /* 31.25px */
  --font-size-2xl: 2.441rem; /* 39px */
  --font-size-3xl: 3.052rem; /* 48.83px */
}
```

---

## Testing Guidance

### Manual Testing

1. **Browser zoom**: Test at 100%, 150%, 200%, 400% zoom
2. **Text-only zoom**: Firefox > Settings > Zoom text only
3. **320px test**: Set viewport to 320px width (simulates 400% zoom on 1280px)
4. **User preferences**: Change browser default font size to 20px or 24px

### Automated Testing

```tsx
// Testing responsive behavior
import { render, screen } from '@testing-library/react';

describe('Responsive Typography', () => {
  test('text uses relative units', () => {
    const { container } = render(<Article />);
    const styles = getComputedStyle(container.querySelector('p')!);

    // Font size should scale with root
    document.documentElement.style.fontSize = '20px';
    const scaledStyles = getComputedStyle(container.querySelector('p')!);

    expect(parseFloat(scaledStyles.fontSize))
      .toBeGreaterThan(parseFloat(styles.fontSize));
  });
});

// axe-core zoom testing
test('no content loss at 200% zoom', async () => {
  // Simulate zoom by changing viewport
  Object.defineProperty(window, 'innerWidth', { value: 640 });

  const { container } = render(<Page />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### CSS Audit

```bash
# Find px font-size declarations
grep -r "font-size:.*px" src/
grep -r "fontSize:.*'.*px'" src/
```

---

## WCAG Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG21/Understanding/resize-text) | AA | Text resizable to 200% without assistive technology |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow) | AA | Content reflows at 320px width without horizontal scroll |
| [1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG21/Understanding/text-spacing) | AA | No content loss when text spacing is adjusted |
