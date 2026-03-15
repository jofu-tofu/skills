# Heading Hierarchy

## Impact: CRITICAL

**Headings are the primary navigation mechanism for screen reader users.**

A proper heading hierarchy creates a document outline that allows screen reader users to understand page structure and navigate efficiently. Studies show 67% of screen reader users navigate by headings first when encountering a new page.

## Why It Matters

Screen reader users can press a single key to jump between headings, view a list of all headings, or navigate to headings of a specific level. When heading levels are skipped or misused for styling, this navigation breaks down and users lose their mental model of the page structure.

---

## Rule: Single H1 Per Page

### Incorrect: Multiple H1 Elements

```html
<!-- HTML - Confusing document structure -->
<h1>Company Name</h1>
<h1>Welcome to Our Site</h1>
<h1>Featured Products</h1>
```

### Correct: One H1 Describing Page Purpose

```html
<!-- HTML - Clear page identity -->
<header>
  <p class="logo">Company Name</p>
</header>
<main>
  <h1>Welcome to Our Site</h1>
  <section>
    <h2>Featured Products</h2>
  </section>
</main>
```

```tsx
// React - Page component with single h1
const HomePage = () => (
  <>
    <header>
      <Logo /> {/* Not an h1 */}
    </header>
    <main>
      <h1>Welcome to Our Site</h1>
      <FeaturedProducts />
    </main>
  </>
);
```

---

## Rule: Sequential Heading Levels

### Incorrect: Skipped Heading Levels

```html
<!-- HTML - Jumping from h1 to h4 breaks outline -->
<h1>Product Catalog</h1>
<h4>Electronics</h4>     <!-- Skips h2, h3 -->
<h4>Clothing</h4>
<h6>Summer Collection</h6> <!-- Skips h5 -->
```

**Screen reader experience:** Users navigating by heading level will miss content. The document outline becomes:
- Product Catalog
  - (missing h2)
    - (missing h3)
      - Electronics
      - Clothing

### Correct: Sequential Hierarchy

```html
<!-- HTML - Proper nesting creates logical outline -->
<h1>Product Catalog</h1>
<h2>Electronics</h2>
<h3>Smartphones</h3>
<h3>Laptops</h3>
<h2>Clothing</h2>
<h3>Summer Collection</h3>
<h4>Men's Wear</h4>
<h4>Women's Wear</h4>
```

```tsx
// React - Component with proper heading structure
const ProductCatalog = () => (
  <main>
    <h1>Product Catalog</h1>

    <section>
      <h2>Electronics</h2>
      <article>
        <h3>Smartphones</h3>
        <p>Latest smartphone models...</p>
      </article>
      <article>
        <h3>Laptops</h3>
        <p>Professional laptops...</p>
      </article>
    </section>

    <section>
      <h2>Clothing</h2>
      <article>
        <h3>Summer Collection</h3>
        <section>
          <h4>Men's Wear</h4>
        </section>
        <section>
          <h4>Women's Wear</h4>
        </section>
      </article>
    </section>
  </main>
);
```

---

## Rule: Don't Use Headings for Styling

### Incorrect: Heading for Visual Style

```html
<!-- HTML - Using h3 just because it looks right -->
<div class="card">
  <h3>This text should be bold and large</h3>  <!-- Not actually a heading -->
  <p>Card content here</p>
</div>
```

### Correct: CSS for Styling, Headings for Structure

```html
<!-- HTML - Semantic heading with CSS styling -->
<div class="card">
  <p class="card-title">This text should be bold and large</p>
  <p>Card content here</p>
</div>

<!-- Or if it IS a heading in context -->
<article class="card">
  <h2 class="card-title">Article Title</h2>
  <p>Card content here</p>
</article>
```

```css
/* CSS - Style classes, not heading levels */
.card-title {
  font-size: 1.25rem;
  font-weight: bold;
}

/* If you need heading styles reusable */
.heading-style-3 {
  font-size: 1.17em;
  font-weight: bold;
}
```

---

## Rule: Headings Should Be Descriptive

### Incorrect: Vague Headings

```html
<!-- HTML - Non-descriptive headings -->
<h1>Welcome</h1>
<h2>More</h2>
<h2>Info</h2>
<h2>Click Here</h2>
```

### Correct: Descriptive, Actionable Headings

```html
<!-- HTML - Clear, informative headings -->
<h1>Welcome to TechCorp Support Center</h1>
<h2>Browse Help Topics</h2>
<h2>Contact Information</h2>
<h2>Submit a Support Request</h2>
```

---

## Rule: Use scroll-margin-top on Heading Anchors

When a page has a fixed or sticky header, heading anchors used for in-page navigation (skip links, table of contents, URL fragments) land behind the header. Apply `scroll-margin-top` to offset the scroll position by the header height.

### Incorrect: Heading Hidden Behind Sticky Header

```css
/* CSS - No scroll offset; heading hides behind 80px sticky header */
header {
  position: sticky;
  top: 0;
  height: 80px;
}
```

```html
<!-- Clicking this link scrolls #features behind the header -->
<a href="#features">Jump to Features</a>
<!-- ... -->
<h2 id="features">Features</h2>
```

### Correct: scroll-margin-top Matches Header Height

```css
/* CSS - Offset scroll position by header height */
h2[id], h3[id], h4[id] {
  scroll-margin-top: 80px;
}

/* Or apply to all potential anchor targets */
[id] {
  scroll-margin-top: 80px;
}
```

```tsx
// React - Section component with scroll-aware heading
const Section = ({ id, title, children }: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section>
    <h2 id={id} className="section-heading">{title}</h2>
    {children}
  </section>
);

// CSS: .section-heading { scroll-margin-top: 80px; }
```

The skip link target (`<main id="main-content">`) also benefits from `scroll-margin-top` to ensure content is fully visible when navigated to via the skip link.

---

## Reusable Components with Heading Levels

### Problem: Hardcoded Heading Levels

```tsx
// React - Inflexible heading level
const Card = ({ title, children }) => (
  <article className="card">
    <h3>{title}</h3>  {/* Always h3, even if wrong level */}
    {children}
  </article>
);
```

### Solution 1: Heading Level Prop

```tsx
// React - Configurable heading level
const Card = ({ title, headingLevel = 2, children }) => {
  const Heading = `h${headingLevel}` as keyof JSX.IntrinsicElements;

  return (
    <article className="card">
      <Heading>{title}</Heading>
      {children}
    </article>
  );
};

// Usage
<section>
  <h2>Featured Articles</h2>
  <Card title="First Article" headingLevel={3}>...</Card>
  <Card title="Second Article" headingLevel={3}>...</Card>
</section>
```

### Solution 2: Heading Level Context

```tsx
// React - Automatic heading level management
import { createContext, useContext } from 'react';

const HeadingLevelContext = createContext(1);

const Section = ({ children }) => {
  const level = useContext(HeadingLevelContext);
  return (
    <HeadingLevelContext.Provider value={Math.min(level + 1, 6)}>
      <section>{children}</section>
    </HeadingLevelContext.Provider>
  );
};

const Heading = ({ children }) => {
  const level = useContext(HeadingLevelContext);
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return <Tag>{children}</Tag>;
};

// Usage - headings auto-increment
<Section>
  <Heading>Level 1</Heading>
  <Section>
    <Heading>Level 2</Heading>
    <Section>
      <Heading>Level 3</Heading>
    </Section>
  </Section>
</Section>
```

---

## Testing Guidance

### Keyboard Testing
1. Navigate headings with screen reader (NVDA: H key, numbers 1-6)
2. View heading list and verify hierarchy makes sense
3. Check that every section has an appropriate heading

### Screen Reader Testing
- List all headings - do they form a logical outline?
- Can you navigate to major content sections via headings?
- Are heading levels announced correctly?

### Automated Testing

```tsx
// Testing Library - Verify heading structure
import { render, screen } from '@testing-library/react';

test('page has single h1', () => {
  render(<ProductPage />);
  const h1s = screen.getAllByRole('heading', { level: 1 });
  expect(h1s).toHaveLength(1);
});

test('headings follow sequential order', () => {
  render(<ProductPage />);
  const headings = screen.getAllByRole('heading');

  let previousLevel = 0;
  headings.forEach(heading => {
    const level = parseInt(heading.tagName[1]);
    // Should not skip more than one level
    expect(level).toBeLessThanOrEqual(previousLevel + 1);
    previousLevel = level;
  });
});

test('headings are descriptive', () => {
  render(<ProductPage />);
  const headings = screen.getAllByRole('heading');

  headings.forEach(heading => {
    // Should not be generic
    expect(heading.textContent).not.toMatch(/^(click here|more|info|read more)$/i);
  });
});
```

```javascript
// axe-core heading rules
const results = await axe(container, {
  rules: {
    'heading-order': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'empty-heading': { enabled: true }
  }
});
```

---

## Document Outline Example

Well-structured page:
```
h1: Product Catalog
  h2: Electronics
    h3: Smartphones
    h3: Laptops
  h2: Clothing
    h3: Men's Collection
    h3: Women's Collection
  h2: Related Articles
```

Screen reader heading navigation shows this outline, allowing users to jump directly to any section.

---

## WCAG Success Criteria

- **1.3.1 Info and Relationships (Level A):** Heading structure conveys document organization
- **2.4.6 Headings and Labels (Level AA):** Headings describe topic or purpose
- **2.4.10 Section Headings (Level AAA):** Section headings organize content

---

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Multiple h1 elements | Ambiguous page topic | Single h1 for page title |
| Skipping levels (h1 to h4) | Broken outline | Use sequential levels |
| Heading for styling | Corrupted structure | Use CSS classes |
| Empty headings | Confusing navigation | Always have text content |
| Generic text ("More") | No context | Descriptive heading text |
| Missing `scroll-margin-top` | Headings hidden behind sticky header when navigated via anchor | Add `scroll-margin-top` matching header height |
