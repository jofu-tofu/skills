# Dark Mode Theming

## Impact: HIGH (Visual Comfort)

Dark mode is expected by users across all platforms. Implementing it incorrectly causes flash-of-wrong-theme, broken native elements, and inconsistent browser chrome.

## Why It Matters

Users who prefer dark mode often have light sensitivity, work in low-light environments, or prefer reduced luminance. A broken dark mode (wrong scrollbar colors, unstyled native selects, mismatched browser chrome) degrades trust and usability.

---

## Requirements Summary

| Feature | Implementation | Why |
|---------|---------------|-----|
| System detection | `prefers-color-scheme` media query | Respect OS preference |
| CSS property | `color-scheme: dark` on `<html>` | Fixes scrollbar, inputs, form controls |
| Browser chrome | `<meta name="theme-color">` | Match page background in browser UI |
| Native elements | Explicit `background-color` and `color` on select, input | Windows dark mode renders native selects incorrectly |
| Theme toggle | Persist in localStorage, apply before render | Prevent flash of wrong theme |

---

## Code Examples

### Incorrect - Broken Dark Mode

```html
<!-- No color-scheme, no theme-color, native elements unstyled -->
<html>
<head>
  <style>
    body.dark { background: #1a1a1a; color: #e0e0e0; }
  </style>
</head>
<body class="dark">
  <!-- Scrollbars still light! Native selects have white backgrounds! -->
  <select><option>Option 1</option></select>
</body>
</html>
```

### Correct - Complete Dark Mode

```html
<html style="color-scheme: dark;">
<head>
  <meta name="theme-color" content="#1a1a1a" />
  <style>
    :root {
      color-scheme: light dark;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg-primary: #1a1a1a;
        --text-primary: #e0e0e0;
        --bg-surface: #2a2a2a;
      }
    }

    body {
      background: var(--bg-primary);
      color: var(--text-primary);
    }

    /* Fix native select in dark mode (especially Windows) */
    select {
      background-color: var(--bg-surface);
      color: var(--text-primary);
    }
  </style>
</head>
```

### Theme Toggle with Flash Prevention

```tsx
// Apply theme in blocking <script> before React hydrates
const ThemeScript = () => (
  <script dangerouslySetInnerHTML={{ __html: `
    (function() {
      var stored = localStorage.getItem('theme');
      var preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      var theme = stored || preferred;
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.style.colorScheme = theme;
    })();
  `}} />
);

// Theme toggle component
const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('theme', theme);

    // Update theme-color meta tag
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#ffffff');
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  );
};
```

### CSS Custom Properties for Theming

```css
:root {
  /* Light theme (default) */
  --bg-primary: #ffffff;
  --bg-surface: #f5f5f5;
  --text-primary: #1a1a1a;
  --text-secondary: #595959;
  --border: #d0d0d0;
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-surface: #2a2a2a;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --border: #404040;
}
```

---

## Testing Guidance

### Manual Testing
1. Toggle OS dark mode preference — page should follow
2. Check scrollbar colors match theme
3. Verify native select/input elements are styled
4. Test theme persistence across page reloads
5. Check for flash of wrong theme on initial load

### Automated Testing

```tsx
test('respects system dark mode preference', () => {
  window.matchMedia = jest.fn().mockImplementation(query => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));

  render(<App />);
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
});
```

---

## Common Anti-Patterns

| Anti-Pattern | Problem | Fix |
|---|---|---|
| No `color-scheme` CSS | Scrollbars and form controls stay light | Add `color-scheme: dark` to html |
| Missing `theme-color` meta | Browser chrome doesn't match page | Add `<meta name="theme-color">` |
| Unstyled native selects | White dropdowns on dark background | Set explicit `background-color` and `color` |
| Theme applied after render | Flash of light theme | Apply theme in blocking `<script>` in head |
| Hardcoded colors | Cannot switch themes | Use CSS custom properties |
