# Skip Links

## Impact: HIGH

**Skip links allow keyboard users to bypass repetitive content and navigate directly to main content.**

Without skip links, keyboard users must tab through every navigation link, header element, and sidebar item on every page load before reaching the main content. On a site with 50 navigation links, that's 50 Tab presses just to start reading.

## Why It Matters

Screen reader users and keyboard navigators encounter your header and navigation on every page. While sighted mouse users can simply scroll past this content, keyboard users must traverse it sequentially. Skip links provide an "express lane" to the main content, dramatically improving navigation efficiency.

---

## Rule: Skip Link as First Focusable Element

### Incorrect: No Skip Link

```html
<!-- HTML - User must tab through all navigation -->
<header>
  <nav>
    <a href="/">Home</a>
    <a href="/products">Products</a>
    <a href="/services">Services</a>
    <!-- 20 more links... -->
  </nav>
</header>
<main>
  <h1>Welcome</h1>
  <!-- Content user actually wants -->
</main>
```

### Correct: Skip Link First

```html
<!-- HTML - Skip link before any other content -->
<body>
  <a href="#main-content" class="skip-link">
    Skip to main content
  </a>
  <header>
    <nav>
      <a href="/">Home</a>
      <a href="/products">Products</a>
      <!-- navigation links... -->
    </nav>
  </header>
  <main id="main-content" tabindex="-1">
    <h1>Welcome</h1>
    <!-- Content -->
  </main>
</body>
```

```tsx
// React - Skip link component
const SkipLink = () => (
  <a href="#main-content" className="skip-link">
    Skip to main content
  </a>
);

const Layout = ({ children }) => (
  <>
    <SkipLink />
    <Header />
    <Navigation />
    <main id="main-content" tabIndex={-1}>
      {children}
    </main>
    <Footer />
  </>
);
```

---

## Rule: Visible on Focus

### Incorrect: Always Visible Skip Link

```css
/* CSS - Takes up space, confuses sighted users */
.skip-link {
  display: block;
  padding: 1rem;
  background: #000;
  color: #fff;
}
```

### Incorrect: Permanently Hidden

```css
/* CSS - Hidden from everyone including keyboard users */
.skip-link {
  display: none;
}
```

### Correct: Visible Only on Focus

```css
/* CSS - Hidden until focused */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  z-index: 100;
  text-decoration: none;
}

.skip-link:focus {
  top: 0;
}

/* Modern: Use :focus-visible for keyboard-only appearance */
.skip-link:focus-visible {
  top: 0;
  outline: 3px solid #ffcc00;
  outline-offset: 2px;
}
```

```css
/* Alternative: Off-screen until focused */
.skip-link {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.skip-link:focus {
  position: fixed;
  top: 10px;
  left: 10px;
  width: auto;
  height: auto;
  padding: 16px 24px;
  background: #1a1a1a;
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  z-index: 9999;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.skip-link:focus:hover {
  background: #333;
}
```

---

## Rule: Target Must Be Focusable

### Incorrect: Target Without tabindex

```html
<!-- HTML - Focus may not move in some browsers -->
<a href="#main">Skip to main content</a>
<!-- ... -->
<main id="main">
  <h1>Page Title</h1>
</main>
```

### Correct: Target Has tabindex="-1"

```html
<!-- HTML - Ensures focus moves to target -->
<a href="#main-content">Skip to main content</a>
<!-- ... -->
<main id="main-content" tabindex="-1">
  <h1>Page Title</h1>
</main>
```

```tsx
// React - Main content component
const MainContent = ({ children }) => (
  <main id="main-content" tabIndex={-1}>
    {children}
  </main>
);
```

---

## Rule: Apply scroll-margin-top to Skip Link Targets

When a page has a fixed or sticky header, the skip link target can end up behind the header after activation. Apply `scroll-margin-top` to offset the scroll position.

### Incorrect: Target Hidden Behind Sticky Header

```html
<!-- Skip link lands behind 80px sticky header -->
<main id="main-content" tabindex="-1">
  <h1>Page Title</h1> <!-- Obscured by sticky header -->
</main>
```

### Correct: scroll-margin-top Offsets Sticky Header

```css
/* CSS - Offset matches sticky header height */
#main-content {
  scroll-margin-top: 80px;
}
```

```tsx
// React - Skip link target with scroll margin
const MainContent = ({ children }: { children: React.ReactNode }) => (
  <main
    id="main-content"
    tabIndex={-1}
    style={{ scrollMarginTop: '80px' }}
  >
    {children}
  </main>
);
```

Without `scroll-margin-top`, the browser scrolls to the element but a sticky header covers the first 60-80px of content. With it, content begins visibly below the header.

---

## Rule: Multiple Skip Links for Complex Pages

### Complex Page Layout

```html
<!-- HTML - Multiple navigation targets -->
<body>
  <nav class="skip-links" aria-label="Skip links">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <a href="#search" class="skip-link">Skip to search</a>
    <a href="#footer-nav" class="skip-link">Skip to footer navigation</a>
  </nav>

  <header>
    <form id="search" tabindex="-1">
      <input type="search" placeholder="Search...">
    </form>
    <nav aria-label="Main">
      <!-- extensive navigation -->
    </nav>
  </header>

  <main id="main-content" tabindex="-1">
    <h1>Dashboard</h1>
    <!-- main content -->
  </main>

  <aside>
    <!-- sidebar content -->
  </aside>

  <footer>
    <nav id="footer-nav" aria-label="Footer" tabindex="-1">
      <!-- footer navigation -->
    </nav>
  </footer>
</body>
```

```tsx
// React - Multiple skip links component
const SkipLinks = () => (
  <nav className="skip-links" aria-label="Skip links">
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
    <a href="#search" className="skip-link">
      Skip to search
    </a>
    <a href="#footer-nav" className="skip-link">
      Skip to footer
    </a>
  </nav>
);
```

```css
/* CSS - Stack skip links vertically when focused */
.skip-links {
  position: absolute;
  top: -100%;
  left: 0;
}

.skip-links:focus-within {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skip-link {
  position: absolute;
  left: -9999px;
}

.skip-link:focus {
  position: static;
  padding: 12px 20px;
  background: #1a1a1a;
  color: #ffffff;
  text-decoration: none;
  border-radius: 4px;
}
```

---

## Rule: SPA Route Change Handling

### Incorrect: Skip Link Breaks After Navigation

```tsx
// React - Skip link target doesn't exist after route change
const Layout = ({ children }) => (
  <>
    <a href="#main-content">Skip to main content</a>
    <Header />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
    </Routes>
    <Footer />
  </>
);

// Each page doesn't have id="main-content"
const HomePage = () => <div>Home content</div>;
```

### Correct: Consistent Target Across Routes

```tsx
// React - Main wrapper always has target ID
const Layout = ({ children }) => (
  <>
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
    <Header />
    <main id="main-content" tabIndex={-1}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </main>
    <Footer />
  </>
);
```

---

## Complete Implementation

```tsx
// React - Full skip link implementation
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './SkipLink.css';

const SkipLink = () => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById('main-content');
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href="#main-content"
      className="skip-link"
      onClick={handleClick}
    >
      Skip to main content
    </a>
  );
};

const MainContent = ({ children }: { children: React.ReactNode }) => {
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    // Focus main content on route change
    mainRef.current?.focus();
  }, [location.pathname]);

  return (
    <main
      ref={mainRef}
      id="main-content"
      tabIndex={-1}
      // Remove focus outline only for programmatic focus
      style={{ outline: 'none' }}
    >
      {children}
    </main>
  );
};

export { SkipLink, MainContent };
```

```css
/* SkipLink.css */
.skip-link {
  position: absolute;
  top: -50px;
  left: 16px;
  padding: 12px 24px;
  background-color: #0066cc;
  color: #ffffff;
  font-weight: bold;
  text-decoration: none;
  border-radius: 0 0 4px 4px;
  z-index: 10000;
  transition: top 0.2s ease;
}

.skip-link:focus {
  top: 0;
  outline: 3px solid #ffcc00;
  outline-offset: 2px;
}

.skip-link:hover {
  background-color: #0052a3;
}

/* Ensure main content doesn't show focus ring from skip link */
#main-content:focus {
  outline: none;
}

/* But preserve focus ring for keyboard navigation within */
#main-content:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

---

## Testing Guidance

### Keyboard Testing
1. Load page, press Tab once - skip link should appear and have focus
2. Press Enter - focus should move to main content
3. Tab should continue from main content, not header
4. Navigate to new page, repeat test

### Screen Reader Testing
- First focusable element should be "Skip to main content, link"
- After activation, focus should be on main content region
- Page navigation should still work after skip

### Automated Testing

```tsx
// Testing Library - Skip link tests
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('skip link is first focusable element', async () => {
  render(<Layout><Content /></Layout>);

  await userEvent.tab();

  const skipLink = screen.getByRole('link', { name: /skip to main/i });
  expect(skipLink).toHaveFocus();
});

test('skip link moves focus to main content', async () => {
  render(<Layout><Content /></Layout>);

  const skipLink = screen.getByRole('link', { name: /skip to main/i });
  await userEvent.click(skipLink);

  const main = screen.getByRole('main');
  expect(main).toHaveFocus();
});

test('main content has correct id for skip link target', () => {
  render(<Layout><Content /></Layout>);

  const main = screen.getByRole('main');
  expect(main).toHaveAttribute('id', 'main-content');
});

test('main content is focusable', () => {
  render(<Layout><Content /></Layout>);

  const main = screen.getByRole('main');
  expect(main).toHaveAttribute('tabindex', '-1');
});
```

```javascript
// axe-core bypass rule
const results = await axe(container, {
  rules: {
    'bypass': { enabled: true } // Checks for skip link mechanism
  }
});
```

---

## WCAG Success Criteria

- **2.4.1 Bypass Blocks (Level A):** A mechanism is available to bypass blocks of content that are repeated on multiple pages

---

## Skip Link Checklist

| Requirement | Implementation |
|-------------|----------------|
| First focusable element | Place before header in DOM |
| Visible on focus | CSS `position: absolute` + `:focus` |
| Hidden when not focused | Off-screen or negative top position |
| Clear link text | "Skip to main content" |
| Valid target ID | `<main id="main-content">` |
| Target is focusable | `tabindex="-1"` on target |
| Works after SPA navigation | Consistent main wrapper |
| High contrast when visible | Clear background, readable text |
| Scroll-margin for sticky header | `scroll-margin-top` on target matches header height |
| Focus-visible on skip link | `:focus-visible` for keyboard-only focus ring |
