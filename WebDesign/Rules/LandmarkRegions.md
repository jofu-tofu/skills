# Landmark Regions

## Impact: CRITICAL

**Enables screen reader users to navigate directly to major page sections.**

Landmarks create a navigational map of your page. Screen reader users can jump directly between landmarks using keyboard shortcuts, bypassing repetitive content. Without landmarks, users must navigate through every element sequentially.

## Why It Matters

A sighted user can instantly scan a page and identify the header, navigation, main content, and footer. Landmarks provide the same orientation for screen reader users. NVDA users press "D" to jump between landmarks; VoiceOver users can bring up a landmarks rotor. This transforms navigation from O(n) to O(1).

---

## HTML5 Landmark Elements

| Element | ARIA Role | Purpose |
|---------|-----------|---------|
| `<header>` | banner | Site header (when not nested) |
| `<nav>` | navigation | Navigation links |
| `<main>` | main | Primary content (only one) |
| `<aside>` | complementary | Related but separate content |
| `<footer>` | contentinfo | Site footer (when not nested) |
| `<section>` | region | Thematic grouping (needs label) |
| `<form>` | form | Form (needs accessible name) |

---

## Rule: Structure Every Page with Landmarks

### Incorrect: No Landmark Structure

```html
<!-- HTML - No navigation landmarks -->
<div class="header">
  <div class="logo">Company</div>
  <div class="nav">
    <a href="/">Home</a>
    <a href="/about">About</a>
  </div>
</div>
<div class="content">
  <h1>Welcome</h1>
  <p>Main content here...</p>
</div>
<div class="sidebar">
  <h2>Related Links</h2>
</div>
<div class="footer">
  <p>Copyright 2024</p>
</div>
```

**Problems:**
- Screen readers cannot identify page regions
- Users must traverse entire DOM to find content
- No landmark navigation available

### Correct: Proper Landmark Structure

```html
<!-- HTML - Complete landmark structure -->
<header>
  <div class="logo">Company</div>
  <nav aria-label="Main">
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</header>

<main>
  <h1>Welcome</h1>
  <p>Main content here...</p>
</main>

<aside aria-label="Related content">
  <h2>Related Links</h2>
</aside>

<footer>
  <p>Copyright 2024</p>
</footer>
```

```tsx
// React - Component structure with landmarks
const PageLayout = ({ children }) => (
  <>
    <header>
      <Logo />
      <nav aria-label="Main">
        <NavLinks />
      </nav>
    </header>

    <main>{children}</main>

    <aside aria-label="Sidebar">
      <SidebarContent />
    </aside>

    <footer>
      <FooterContent />
    </footer>
  </>
);
```

---

## Rule: Label Multiple Landmarks of Same Type

### Incorrect: Unlabeled Duplicate Landmarks

```html
<!-- HTML - Which nav is which? -->
<nav>
  <a href="/">Home</a>
  <a href="/products">Products</a>
</nav>

<!-- Later in the page -->
<nav>
  <a href="/privacy">Privacy</a>
  <a href="/terms">Terms</a>
</nav>
```

**Screen reader announcement:** "navigation" (twice, with no distinction)

### Correct: Labeled Landmarks

```html
<!-- HTML - Clear distinction between navs -->
<nav aria-label="Main">
  <a href="/">Home</a>
  <a href="/products">Products</a>
</nav>

<nav aria-label="Footer">
  <a href="/privacy">Privacy</a>
  <a href="/terms">Terms</a>
</nav>
```

```tsx
// React - Multiple nav components with labels
const MainNav = () => (
  <nav aria-label="Main">
    <Link to="/">Home</Link>
    <Link to="/products">Products</Link>
  </nav>
);

const FooterNav = () => (
  <nav aria-label="Footer">
    <Link to="/privacy">Privacy</Link>
    <Link to="/terms">Terms</Link>
  </nav>
);
```

**Screen reader announcement:** "Main navigation", "Footer navigation"

---

## Rule: Only One Main Landmark

### Incorrect: Multiple Main Elements

```html
<!-- HTML - Confusing for navigation -->
<main>
  <h1>Article Title</h1>
</main>
<main>
  <h2>Related Articles</h2>
</main>
```

### Correct: Single Main with Sections

```html
<!-- HTML - One main, structured internally -->
<main>
  <article>
    <h1>Article Title</h1>
    <p>Article content...</p>
  </article>

  <section aria-labelledby="related-heading">
    <h2 id="related-heading">Related Articles</h2>
    <ul>...</ul>
  </section>
</main>
```

---

## Rule: Use Section with Accessible Name

### Incorrect: Unnamed Sections

```html
<!-- HTML - Sections without names don't become landmarks -->
<section>
  <h2>Features</h2>
</section>
<section>
  <h2>Pricing</h2>
</section>
```

### Correct: Sections with Labels

```html
<!-- HTML - aria-labelledby connects to heading -->
<section aria-labelledby="features-heading">
  <h2 id="features-heading">Features</h2>
  <p>Our product features...</p>
</section>

<section aria-labelledby="pricing-heading">
  <h2 id="pricing-heading">Pricing</h2>
  <p>Our pricing plans...</p>
</section>
```

```tsx
// React - Reusable Section component
const Section = ({ id, title, children }) => (
  <section aria-labelledby={`${id}-heading`}>
    <h2 id={`${id}-heading`}>{title}</h2>
    {children}
  </section>
);

// Usage
<Section id="features" title="Features">
  <FeatureList />
</Section>
```

---

## Complete Page Template

```tsx
// React - Full page with all landmarks
const App = () => (
  <>
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>

    <header>
      <Logo />
      <nav aria-label="Main">
        <MainNavigation />
      </nav>
      <nav aria-label="User account">
        <UserMenu />
      </nav>
    </header>

    <main id="main-content">
      <h1>Page Title</h1>

      <section aria-labelledby="intro-heading">
        <h2 id="intro-heading">Introduction</h2>
        <p>Content...</p>
      </section>

      <section aria-labelledby="details-heading">
        <h2 id="details-heading">Details</h2>
        <p>Content...</p>
      </section>
    </main>

    <aside aria-label="Related content">
      <h2>Related Articles</h2>
      <RelatedList />
    </aside>

    <footer>
      <nav aria-label="Footer">
        <FooterLinks />
      </nav>
      <p>&copy; 2024 Company</p>
    </footer>
  </>
);
```

---

## Testing Guidance

### Keyboard Testing
1. Use screen reader landmark navigation (NVDA: D key, VoiceOver: Rotor)
2. Verify you can jump to each major section
3. Check that landmark labels are descriptive

### Screen Reader Testing
- Navigate landmarks list and verify all regions appear
- Confirm each navigation landmark has a unique label
- Verify main content is within `<main>` element

### Automated Testing

```tsx
// Testing Library - Verify landmarks
import { render, screen } from '@testing-library/react';

test('page has required landmarks', () => {
  render(<PageLayout />);

  // Check for banner (header)
  expect(screen.getByRole('banner')).toBeInTheDocument();

  // Check for main
  expect(screen.getByRole('main')).toBeInTheDocument();

  // Check for navigation with label
  expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument();

  // Check for contentinfo (footer)
  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
});

test('only one main landmark exists', () => {
  render(<PageLayout />);
  const mains = screen.getAllByRole('main');
  expect(mains).toHaveLength(1);
});
```

```javascript
// axe-core rules for landmarks
const results = await axe(container, {
  rules: {
    'landmark-one-main': { enabled: true },
    'landmark-unique': { enabled: true },
    'region': { enabled: true }
  }
});
```

---

## WCAG Success Criteria

- **1.3.1 Info and Relationships (Level A):** Landmarks communicate page structure programmatically
- **2.4.1 Bypass Blocks (Level A):** Landmarks allow users to skip repetitive content
- **4.1.2 Name, Role, Value (Level A):** Landmark labels provide accessible names

---

## Screen Reader Landmark Shortcuts

| Screen Reader | Jump to Landmarks | List Landmarks |
|---------------|-------------------|----------------|
| NVDA | D / Shift+D | Insert+F7 |
| JAWS | R / Shift+R | Insert+Ctrl+R |
| VoiceOver | Rotor (VO+U) | Rotor |
