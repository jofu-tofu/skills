# List Structure

## Impact: HIGH

**Proper list markup enables screen readers to announce item counts and provide list navigation.**

When content is semantically grouped as a list, screen readers announce "list of 5 items" before reading the content, giving users context about what to expect. List navigation shortcuts allow users to jump between list items efficiently.

## Why It Matters

Lists communicate relationships between items. Whether it's a navigation menu, a set of features, or search results, users benefit from knowing how many items exist and being able to navigate them as a group. CSS-styled divs lose this semantic information entirely.

---

## Rule: Use Lists for Related Items

### Incorrect: Divs with Visual Bullets

```html
<!-- HTML - No list semantics -->
<div class="features">
  <div class="feature">
    <span class="bullet">*</span> Fast performance
  </div>
  <div class="feature">
    <span class="bullet">*</span> Easy integration
  </div>
  <div class="feature">
    <span class="bullet">*</span> Great support
  </div>
</div>
```

```tsx
// React - Missing list structure
const Features = ({ items }) => (
  <div className="features">
    {items.map((item, i) => (
      <div key={i} className="feature">
        <span className="bullet">*</span> {item}
      </div>
    ))}
  </div>
);
```

**Screen reader announces:** "Fast performance" (no list context, no item count)

### Correct: Semantic List

```html
<!-- HTML - Proper unordered list -->
<ul class="features">
  <li>Fast performance</li>
  <li>Easy integration</li>
  <li>Great support</li>
</ul>
```

```tsx
// React - Semantic list structure
const Features = ({ items }) => (
  <ul className="features">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);
```

**Screen reader announces:** "list, 3 items. Fast performance, 1 of 3"

---

## Rule: Choose Correct List Type

### Unordered List (ul) - Items with No Sequence

```html
<!-- HTML - Navigation menu -->
<nav aria-label="Main">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>

<!-- Feature list -->
<ul class="features">
  <li>24/7 Support</li>
  <li>Free shipping</li>
  <li>Money-back guarantee</li>
</ul>
```

### Ordered List (ol) - Sequential Items

```html
<!-- HTML - Step-by-step instructions -->
<ol class="instructions">
  <li>Download the installer</li>
  <li>Run the setup wizard</li>
  <li>Enter your license key</li>
  <li>Restart your computer</li>
</ol>

<!-- Rankings -->
<ol class="leaderboard">
  <li>Team Alpha - 2500 points</li>
  <li>Team Beta - 2350 points</li>
  <li>Team Gamma - 2100 points</li>
</ol>
```

```tsx
// React - Ordered list component
const Steps = ({ steps }) => (
  <ol className="steps">
    {steps.map((step, i) => (
      <li key={i}>
        <span className="step-number">{i + 1}</span>
        {step}
      </li>
    ))}
  </ol>
);
```

### Description List (dl) - Key-Value Pairs

```html
<!-- HTML - Metadata or definitions -->
<dl class="product-details">
  <dt>Price</dt>
  <dd>$29.99</dd>

  <dt>Availability</dt>
  <dd>In Stock</dd>

  <dt>SKU</dt>
  <dd>PRD-12345</dd>
</dl>

<!-- Glossary -->
<dl class="glossary">
  <dt>Accessibility</dt>
  <dd>The design of products, devices, services, or environments
      for people with disabilities.</dd>

  <dt>ARIA</dt>
  <dd>Accessible Rich Internet Applications, a set of attributes
      that define ways to make web content more accessible.</dd>
</dl>
```

```tsx
// React - Description list component
const ProductDetails = ({ details }) => (
  <dl className="product-details">
    {Object.entries(details).map(([key, value]) => (
      <div key={key} className="detail-row">
        <dt>{key}</dt>
        <dd>{value}</dd>
      </div>
    ))}
  </dl>
);
```

---

## Rule: Navigation Should Be Lists

### Incorrect: Navigation Without List

```html
<!-- HTML - Links without structure -->
<nav>
  <a href="/">Home</a>
  <a href="/products">Products</a>
  <a href="/about">About</a>
</nav>
```

### Correct: Navigation as List

```html
<!-- HTML - Structured navigation -->
<nav aria-label="Main">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

```tsx
// React - Navigation component
const MainNav = ({ links }) => (
  <nav aria-label="Main">
    <ul className="nav-list">
      {links.map(link => (
        <li key={link.href}>
          <a
            href={link.href}
            aria-current={link.current ? 'page' : undefined}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);
```

---

## Rule: Nested Lists for Hierarchical Content

### Incorrect: Flat Structure for Hierarchical Data

```html
<!-- HTML - Hierarchy lost -->
<ul>
  <li>Fruits</li>
  <li class="indent">Apples</li>
  <li class="indent">Oranges</li>
  <li>Vegetables</li>
  <li class="indent">Carrots</li>
  <li class="indent">Broccoli</li>
</ul>
```

### Correct: Nested Lists

```html
<!-- HTML - Hierarchical structure preserved -->
<ul>
  <li>
    Fruits
    <ul>
      <li>Apples</li>
      <li>Oranges</li>
    </ul>
  </li>
  <li>
    Vegetables
    <ul>
      <li>Carrots</li>
      <li>Broccoli</li>
    </ul>
  </li>
</ul>
```

```tsx
// React - Recursive list component
interface TreeNode {
  label: string;
  children?: TreeNode[];
}

const TreeList = ({ items }: { items: TreeNode[] }) => (
  <ul>
    {items.map((item, i) => (
      <li key={i}>
        {item.label}
        {item.children && <TreeList items={item.children} />}
      </li>
    ))}
  </ul>
);
```

---

## Rule: List Items Contain Complete Content

### Incorrect: Breaking Up List Items

```html
<!-- HTML - Label and content separated -->
<ul>
  <li><strong>Feature 1:</strong></li>
  <li>Fast performance for all users</li>
  <li><strong>Feature 2:</strong></li>
  <li>Easy integration with existing systems</li>
</ul>
```

### Correct: Complete Items

```html
<!-- HTML - Each item is self-contained -->
<ul>
  <li>
    <strong>Feature 1:</strong>
    Fast performance for all users
  </li>
  <li>
    <strong>Feature 2:</strong>
    Easy integration with existing systems
  </li>
</ul>
```

---

## Styling Lists Accessibly

```css
/* Remove default bullets but keep semantics */
.clean-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Custom bullet with CSS */
.custom-bullets li {
  list-style: none;
  padding-left: 1.5em;
  position: relative;
}

.custom-bullets li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: green;
}

/* Horizontal navigation list */
.nav-list {
  list-style: none;
  display: flex;
  gap: 1rem;
  padding: 0;
}

/* Grid of cards as list */
.card-list {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding: 0;
}
```

---

## Testing Guidance

### Keyboard Testing
1. Use screen reader list navigation (NVDA: L key)
2. Verify item counts are announced
3. Check nested lists announce nesting level

### Screen Reader Testing
- Does the list announce "list of X items"?
- Can you navigate between items with I key (NVDA)?
- Are nested lists properly announced?

### Automated Testing

```tsx
// Testing Library - Verify list structure
import { render, screen, within } from '@testing-library/react';

test('navigation renders as list', () => {
  render(<MainNav links={navLinks} />);

  const nav = screen.getByRole('navigation', { name: /main/i });
  const list = within(nav).getByRole('list');
  const items = within(list).getAllByRole('listitem');

  expect(items).toHaveLength(navLinks.length);
});

test('features use unordered list', () => {
  render(<Features items={['Fast', 'Easy', 'Reliable']} />);

  const list = screen.getByRole('list');
  expect(list.tagName).toBe('UL');
  expect(screen.getAllByRole('listitem')).toHaveLength(3);
});

test('steps use ordered list', () => {
  render(<Steps steps={['Step 1', 'Step 2', 'Step 3']} />);

  const list = screen.getByRole('list');
  expect(list.tagName).toBe('OL');
});
```

```javascript
// axe-core list rules
const results = await axe(container, {
  rules: {
    'list': { enabled: true },
    'listitem': { enabled: true },
    'definition-list': { enabled: true }
  }
});
```

---

## WCAG Success Criteria

- **1.3.1 Info and Relationships (Level A):** List structure communicates relationships between items programmatically

---

## Quick Reference

| Content Type | Element | Example |
|--------------|---------|---------|
| Menu/Nav items | `<ul>` | Main navigation, dropdown menus |
| Feature lists | `<ul>` | Product features, benefits |
| Steps/Instructions | `<ol>` | How-to guides, processes |
| Rankings | `<ol>` | Leaderboards, top 10 lists |
| Definitions | `<dl>` | Glossaries, FAQs |
| Key-value pairs | `<dl>` | Product specs, metadata |
| Search results | `<ul>` or `<ol>` | Depends on relevance ordering |
