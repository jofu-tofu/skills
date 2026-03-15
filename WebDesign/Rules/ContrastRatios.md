# Contrast Ratios

## Impact: CRITICAL (Visual Accessibility)

Insufficient color contrast makes content invisible or difficult to read for users with low vision, color blindness, or those viewing screens in bright environments. Approximately 1 in 12 men and 1 in 200 women have some form of color vision deficiency.

---

## Requirements Summary

| Element Type | Minimum Contrast Ratio | Notes |
|--------------|------------------------|-------|
| Normal text (<18pt or <14pt bold) | 4.5:1 | Against background |
| Large text (>=18pt or >=14pt bold) | 3:1 | ~24px or ~19px bold |
| UI components & graphics | 3:1 | Borders, icons, focus indicators |
| Incidental/decorative | None | Logos, disabled elements |
| Hover/active states | 3:1 minimum | Against adjacent colors |

---

## Code Examples

### Text Contrast

#### Incorrect - Low Contrast Text

```html
<!-- 2.5:1 ratio - FAILS WCAG AA -->
<p style="color: #999999; background-color: #ffffff;">
  This light gray text on white is hard to read.
</p>

<p style="color: #767676; background-color: #f0f0f0;">
  Gray on light gray fails contrast requirements.
</p>
```

```tsx
// React component with insufficient contrast
const WarningMessage = () => (
  <div style={{
    color: '#ffa500',      // Orange on white: ~2.1:1
    backgroundColor: '#ffffff'
  }}>
    Warning: Your session will expire soon
  </div>
);
```

#### Correct - Sufficient Contrast

```html
<!-- 7:1 ratio - Exceeds WCAG AAA -->
<p style="color: #333333; background-color: #ffffff;">
  Dark gray text on white provides excellent readability.
</p>

<!-- 4.5:1 ratio - Meets WCAG AA -->
<p style="color: #767676; background-color: #ffffff;">
  This medium gray meets minimum requirements for normal text.
</p>
```

```tsx
// React component with sufficient contrast
const WarningMessage = () => (
  <div style={{
    color: '#9a6700',      // Dark orange on white: ~4.5:1
    backgroundColor: '#ffffff'
  }}>
    Warning: Your session will expire soon
  </div>
);

// Using CSS custom properties for maintainable contrast
const AccessibleCard = ({ children }: { children: React.ReactNode }) => (
  <div className="card">
    {children}
    <style jsx>{`
      .card {
        --text-primary: #1a1a1a;    /* 12.6:1 on white */
        --text-secondary: #595959;  /* 7:1 on white */
        --bg-surface: #ffffff;

        color: var(--text-primary);
        background-color: var(--bg-surface);
      }
    `}</style>
  </div>
);
```

### UI Component Contrast

#### Incorrect - Low Contrast UI Elements

```html
<!-- Input border with insufficient contrast -->
<input
  type="text"
  style="border: 1px solid #e0e0e0; background: #ffffff;"
  placeholder="Enter name"
/>

<!-- Icon with poor contrast -->
<button style="background: #f5f5f5;">
  <svg fill="#c0c0c0" viewBox="0 0 24 24"><!-- icon --></svg>
</button>
```

#### Correct - Sufficient UI Contrast

```html
<!-- Input border with 3:1 contrast -->
<input
  type="text"
  style="border: 1px solid #767676; background: #ffffff;"
  placeholder="Enter name"
/>

<!-- Icon with sufficient contrast -->
<button style="background: #f5f5f5;">
  <svg fill="#595959" viewBox="0 0 24 24"><!-- icon --></svg>
</button>
```

```tsx
// Accessible form input component
const TextInput = ({ label, ...props }: InputProps) => (
  <div className="input-group">
    <label className="input-label">{label}</label>
    <input className="input-field" {...props} />
    <style jsx>{`
      .input-label {
        color: #1a1a1a;           /* 12.6:1 contrast */
      }
      .input-field {
        border: 2px solid #595959; /* 7:1 contrast */
        color: #1a1a1a;
      }
      .input-field::placeholder {
        color: #767676;            /* 4.5:1 contrast */
      }
    `}</style>
  </div>
);
```

### Hover State Contrast

Interactive elements (buttons, links) must maintain sufficient contrast in ALL states: default, hover, active, and focus. Hover states that reduce contrast below 3:1 against adjacent colors fail WCAG 1.4.11.

#### Incorrect - Low Contrast Hover State

```css
/* Hover reduces contrast below threshold */
.button {
  background: #0056b3;  /* Good: 7.1:1 on white */
  color: #ffffff;
}
.button:hover {
  background: #cce5ff;  /* Bad: 1.3:1 on white */
  color: #ffffff;       /* Nearly invisible */
}
```

#### Correct - Accessible Hover State

```css
/* Hover maintains or increases contrast */
.button {
  background: #0056b3;
  color: #ffffff;
}
.button:hover {
  background: #004494;  /* Darker: 9.4:1 on white */
  color: #ffffff;
}

/* Interactive states should be MORE prominent, not less */
.link {
  color: #0056b3;       /* 7.1:1 on white */
}
.link:hover {
  color: #003d82;       /* Darker on hover: 10.1:1 */
  text-decoration: underline;
}
```

---

## Common Color Combinations

### Safe Combinations (Meet AA)

| Foreground | Background | Ratio | Use Case |
|------------|------------|-------|----------|
| `#1a1a1a` | `#ffffff` | 12.6:1 | Primary text |
| `#595959` | `#ffffff` | 7:1 | Secondary text |
| `#0056b3` | `#ffffff` | 7.1:1 | Links |
| `#ffffff` | `#0056b3` | 7.1:1 | Primary buttons |
| `#d32f2f` | `#ffffff` | 5.9:1 | Error text |

### Failing Combinations (Avoid)

| Foreground | Background | Ratio | Problem |
|------------|------------|-------|---------|
| `#999999` | `#ffffff` | 2.8:1 | Fails all text |
| `#ff6600` | `#ffffff` | 3.0:1 | Fails normal text |
| `#00ff00` | `#ffffff` | 1.4:1 | Fails everything |

---

## Testing Guidance

### Manual Testing

1. **Browser DevTools**: Chrome/Edge DevTools show contrast ratios in the color picker
2. **Grayscale test**: View page in grayscale to identify low-contrast elements
3. **Zoom test**: Ensure contrast remains at 200% zoom

### Automated Testing

```tsx
// axe-core integration
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('page has no contrast violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container, {
    rules: {
      'color-contrast': { enabled: true }
    }
  });
  expect(results).toHaveNoViolations();
});
```

### Tools

- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Colour Contrast Analyser (CCA)**: Desktop application for picking colors
- **Chrome DevTools**: Built-in contrast ratio display
- **axe DevTools**: Browser extension for automated testing

---

## WCAG Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum) | AA | 4.5:1 for normal text, 3:1 for large text |
| [1.4.6 Contrast (Enhanced)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced) | AAA | 7:1 for normal text, 4.5:1 for large text |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast) | AA | 3:1 for UI components and graphical objects |
