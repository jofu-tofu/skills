# Alternative Text for Images

## Impact: CRITICAL

Missing or inadequate alternative text makes visual content completely inaccessible to screen reader users. This affects approximately 2.2 billion people globally with vision impairments.

## Why It Matters

Images convey information, context, and meaning that sighted users take for granted. Without proper alt text, screen reader users encounter "image" or worse, hear long file names like "IMG_20240315_143022.jpg". Decorative images with meaningful alt text create noise, while informative images without alt text create information gaps.

---

## Rule 1: Informative Images Must Have Meaningful Alt Text

### Incorrect - Missing Alt Attribute

```html
<!-- Screen reader announces: "image" or filename -->
<img src="company-logo.png">

<!-- Empty alt on informative image -->
<img src="chart-q3-sales.png" alt="">
```

```tsx
// React component with missing alt
function ProductCard({ product }) {
  return (
    <div className="card">
      <img src={product.image} />  {/* Missing alt prop */}
      <h3>{product.name}</h3>
    </div>
  );
}
```

### Correct - Descriptive Alt Text

```html
<!-- Describes the image content and purpose -->
<img src="company-logo.png" alt="Acme Corporation logo">

<!-- Chart with meaningful description -->
<img src="chart-q3-sales.png" alt="Q3 sales chart showing 23% growth from July to September">
```

```tsx
// React component with proper alt text
function ProductCard({ product }) {
  return (
    <div className="card">
      <img src={product.image} alt={`${product.name} - ${product.color}`} />
      <h3>{product.name}</h3>
    </div>
  );
}
```

---

## Rule 2: Decorative Images Must Have Empty Alt

### Incorrect - Alt Text on Decorative Images

```html
<!-- Decorative divider creates noise -->
<img src="divider.svg" alt="decorative line divider">

<!-- Background pattern announced unnecessarily -->
<img src="pattern.png" alt="blue dots pattern background">
```

### Correct - Empty Alt for Decorative Images

```html
<!-- Screen reader skips decorative images -->
<img src="divider.svg" alt="">

<!-- Or use aria-hidden for CSS background alternatives -->
<div class="decorative-pattern" aria-hidden="true"></div>
```

```tsx
// Decorative icon next to text
function MenuItem({ icon, label }) {
  return (
    <button>
      <img src={icon} alt="" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
```

---

## Rule 3: Complex Images Need Extended Descriptions

### Incorrect - Insufficient Description for Complex Images

```html
<!-- Alt text too brief for complex infographic -->
<img src="infographic.png" alt="company infographic">

<!-- Chart without detailed data access -->
<img src="population-trends.png" alt="population chart">
```

### Correct - Extended Descriptions with aria-describedby

```html
<!-- Complex infographic with extended description -->
<figure>
  <img
    src="infographic.png"
    alt="Annual sustainability report infographic"
    aria-describedby="infographic-desc"
  >
  <figcaption id="infographic-desc">
    Key findings: Carbon emissions reduced 34% since 2020.
    Renewable energy now powers 67% of operations.
    Water usage decreased 12% through recycling initiatives.
    <a href="/sustainability-report-full">View full report data</a>
  </figcaption>
</figure>

<!-- Data visualization with accessible data table -->
<figure>
  <img
    src="population-trends.png"
    alt="Line chart showing population growth from 2000 to 2024"
    aria-describedby="population-data"
  >
  <details id="population-data">
    <summary>View population data table</summary>
    <table>
      <caption>Population in millions by year</caption>
      <!-- Table with actual data -->
    </table>
  </details>
</figure>
```

```tsx
// React component for complex image with description
function DataVisualization({ chartSrc, title, summary, dataTableId }) {
  return (
    <figure className="chart-container">
      <img
        src={chartSrc}
        alt={title}
        aria-describedby={dataTableId}
      />
      <figcaption>
        <p>{summary}</p>
        <details id={dataTableId}>
          <summary>View underlying data</summary>
          {/* Accessible data table */}
        </details>
      </figcaption>
    </figure>
  );
}
```

---

## Rule 4: Linked Images Describe the Destination

### Incorrect - Linked Image Without Context

```html
<!-- What does clicking this do? -->
<a href="/settings">
  <img src="gear-icon.svg" alt="gear">
</a>
```

### Correct - Alt Describes Link Purpose

```html
<!-- Alt text describes the action -->
<a href="/settings">
  <img src="gear-icon.svg" alt="Account settings">
</a>

<!-- Or use visually hidden text with decorative icon -->
<a href="/settings">
  <img src="gear-icon.svg" alt="" aria-hidden="true">
  <span class="visually-hidden">Account settings</span>
</a>
```

---

## Testing Guidance

### Keyboard Testing
- Tab through the page; images should not receive focus unless interactive
- Linked images should be focusable with clear purpose

### Screen Reader Testing
- **NVDA/JAWS**: Navigate with `G` key to jump between images
- **VoiceOver**: Use rotor (VO + U) to list all images
- Verify informative images announce meaningful descriptions
- Verify decorative images are not announced

### Automated Testing

```javascript
// axe-core test
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('images have appropriate alt text', async () => {
  const { container } = render(<ProductGallery products={mockProducts} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// Testing Library - verify alt text exists
import { screen } from '@testing-library/react';

test('product image has descriptive alt', () => {
  render(<ProductCard product={mockProduct} />);
  expect(screen.getByRole('img')).toHaveAccessibleName(/blue widget/i);
});

// Custom check for decorative images
test('decorative images have empty alt', () => {
  render(<DecorativeIcon />);
  const img = screen.getByRole('img', { hidden: true });
  expect(img).toHaveAttribute('alt', '');
});
```

---

## WCAG Success Criteria

| Criterion | Level | Description |
|-----------|-------|-------------|
| **1.1.1 Non-text Content** | A | All non-text content has text alternative |
| **1.4.5 Images of Text** | AA | Use actual text instead of images of text |
| **1.4.9 Images of Text (No Exception)** | AAA | Images of text only for decoration or essential |

---

## Rule 5: Decorative Icons Use aria-hidden

### Incorrect

```html
<!-- Decorative icon announced by screen reader -->
<button>
  <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81..." /></svg>
  Edit
</button>
```

### Correct

```html
<!-- Icon hidden, text provides meaning -->
<button>
  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81..." /></svg>
  Edit
</button>

<!-- Icon-only button needs aria-label -->
<button aria-label="Edit item">
  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="..." /></svg>
</button>

<!-- Decorative image using role=presentation -->
<img src="/decorative-wave.svg" alt="" role="presentation">
```

---

## Quick Reference

| Image Type | Alt Text Approach |
|------------|-------------------|
| Informative | Describe content and purpose |
| Decorative | `alt=""` |
| Functional (link/button) | Describe the action |
| Complex (charts, infographics) | Brief alt + extended description |
| Text in image | Full text content in alt |
| Icon with text label | `alt=""` (text provides meaning) |
| Icon without text | Describe the meaning/action |
