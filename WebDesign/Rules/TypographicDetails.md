# Typographic Details

## Impact: MEDIUM (Polish and Professionalism)

Typographic details separate professional UIs from amateur ones. Correct punctuation, spacing, and text rendering create trust and readability. These micro-details compound across an interface.

## Why It Matters

Users subconsciously judge quality by typographic details. Straight quotes, three-dot ellipses, and inconsistent number formatting signal carelessness. Professional typography uses proper Unicode characters, appropriate spacing, and consistent text patterns.

---

## Requirements Summary

| Detail | Incorrect | Correct | Why |
|--------|-----------|---------|-----|
| Ellipsis | ... (three dots) | … (U+2026) | Single character, consistent width |
| Quotes | "straight" | \u201Ccurly\u201D (U+201C U+201D) | Typographically correct |
| Apostrophe | it's (straight) | it\u2019s (U+2019) | Matches curly quotes |
| Number+unit | 10 MB (breaking) | 10\u00A0MB | Prevents orphaned units |
| Keyboard shortcuts | Ctrl K | Ctrl\u00A0K | Keeps shortcut together |
| Loading text | Loading... | Loading\u2026 | Proper ellipsis character |

---

## Code Examples

### Incorrect - Amateur Typography

```tsx
const StatusMessage = () => (
  <div>
    <p>"Loading..." please wait</p>
    <p>File size: 10 MB</p>
    <p>Press Ctrl K to search</p>
  </div>
);
```

### Correct - Professional Typography

```tsx
const StatusMessage = () => (
  <div>
    <p>{'\u201CLoading\u2026\u201D'} please wait</p>
    <p>File size: 10{'\u00A0'}MB</p>
    <p>Press Ctrl{'\u00A0'}K to search</p>
  </div>
);
```

In HTML:
```html
<p>&ldquo;Loading&hellip;&rdquo; please wait</p>
<p>File size: 10&nbsp;MB</p>
<p>Press Ctrl&nbsp;K to search</p>
```

### Loading State Text Patterns

```tsx
// Consistent loading text patterns
<span>Loading{'\u2026'}</span>
<span>Saving{'\u2026'}</span>
<span>Uploading{'\u2026'}</span>

// For skeleton/shimmer loading, use visual indicators
<div className="skeleton-line" aria-hidden="true" />
<span className="sr-only">Loading content{'\u2026'}</span>
```

---

## Testing Guidance

### Manual Testing
1. Search codebase for three consecutive dots in UI strings - replace with ellipsis character
2. Check for straight quotes in user-facing text
3. Verify number+unit pairs use non-breaking spaces

### Automated Testing
```tsx
const TRIPLE_DOT = /(?<!\.)\.{3}(?!\.)/;

test('UI copy uses proper ellipsis character', () => {
  const text = screen.getByText(/loading/i);
  expect(text.textContent).not.toMatch(TRIPLE_DOT);
  expect(text.textContent).toContain('\u2026');
});
```

---

## References

- Unicode ellipsis: U+2026 HORIZONTAL ELLIPSIS
- Non-breaking space: U+00A0 or &nbsp;
- Left/right double quotes: U+201C / U+201D
- Left/right single quotes: U+2018 / U+2019
