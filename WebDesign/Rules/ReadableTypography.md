# Readable Typography

## Impact: MEDIUM-HIGH

Poor typography creates barriers for users with low vision, dyslexia, cognitive disabilities, and reading difficulties. Approximately 15-20% of the population has some form of reading difficulty that typography choices directly impact.

## Why It Matters

Typography is not just aesthetics; it is a fundamental accessibility concern. Small text forces users to zoom, causing layout issues. Tight line spacing makes tracking difficult. Poor letter spacing impacts word recognition for dyslexic users. Accessible typography benefits everyone, including users reading on mobile devices, in bright sunlight, or when fatigued. The top 10 properties to get right include line-height, line-length, font pairing, text-wrap, and tabular-nums.

---

## Rule 1: Use Adequate Base Font Size

### Incorrect - Small Base Font Size

```html
<style>
  /* 12px is too small for body text */
  body {
    font-size: 12px;
  }

  /* Small text for "less important" content */
  .fine-print {
    font-size: 10px;
  }
</style>
```

```css
/* Fixed pixel sizes don't respect user preferences */
html {
  font-size: 14px;
}
```

### Correct - Accessible Base Font Size

```html
<style>
  /* 16px minimum, using rem for scalability */
  html {
    font-size: 100%; /* Respects browser default, typically 16px */
  }

  body {
    font-size: 1rem; /* 16px base */
  }

  /* Scale relative to base */
  .small-text {
    font-size: 0.875rem; /* 14px - minimum for secondary text */
  }

  .fine-print {
    font-size: 0.875rem; /* Never smaller than 14px */
  }
</style>
```

```tsx
// React component with accessible typography
const Typography = {
  body: {
    fontSize: '1rem',      // 16px
    lineHeight: 1.5,
  },
  small: {
    fontSize: '0.875rem',  // 14px minimum
    lineHeight: 1.5,
  },
  caption: {
    fontSize: '0.875rem',  // Never below 14px
    lineHeight: 1.4,
  },
};
```

---

## Rule 2: Adequate Line Height (Line Spacing)

### Incorrect - Cramped Line Spacing

```css
/* Default line-height is too tight for readability */
p {
  line-height: 1;
}

/* Barely better, still difficult to track */
.content {
  line-height: 1.2;
}
```

### Correct - Readable Line Spacing

```css
/* 1.5 line-height for body text */
body {
  line-height: 1.5;
}

/* Slightly tighter for headings is acceptable */
h1, h2, h3 {
  line-height: 1.2;
}

/* Generous spacing for long-form content */
article p {
  line-height: 1.6;
}
```

```tsx
// Styled component with proper line height
const Paragraph = styled.p`
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1em;

  /* Even more generous for long articles */
  article & {
    line-height: 1.6;
  }
`;
```

---

## Rule: Line Length Limits

```css
/* Limit line length for comfortable reading */
article, .prose {
  max-width: 65ch;  /* 45-75 characters optimal */
}

/* Don't constrain UI text, only prose */
.sidebar, .nav { max-width: none; }
```

Note: 45-75 characters per line prevents eye strain. The `ch` unit naturally adapts to font size.

---

## Rule 3: Adequate Letter and Word Spacing

### Incorrect - Tight Letter Spacing

```css
/* Negative letter-spacing reduces readability */
h1 {
  letter-spacing: -0.05em;
}

/* Condensed fonts without spacing compensation */
.condensed-text {
  font-family: "Roboto Condensed", sans-serif;
  /* No letter-spacing adjustment */
}
```

### Correct - Readable Letter Spacing

```css
/* Neutral or slightly positive letter spacing */
body {
  letter-spacing: 0.01em;
  word-spacing: 0.05em;
}

/* Allow user customization via CSS custom properties */
:root {
  --letter-spacing: 0.01em;
  --word-spacing: 0.05em;
  --line-height: 1.5;
}

p {
  letter-spacing: var(--letter-spacing);
  word-spacing: var(--word-spacing);
  line-height: var(--line-height);
}
```

```tsx
// Typography system with configurable spacing
interface TypographyConfig {
  letterSpacing?: string;
  wordSpacing?: string;
  lineHeight?: number;
}

function ReadableText({
  children,
  config = {}
}: {
  children: React.ReactNode;
  config?: TypographyConfig;
}) {
  const style = {
    letterSpacing: config.letterSpacing ?? '0.01em',
    wordSpacing: config.wordSpacing ?? '0.05em',
    lineHeight: config.lineHeight ?? 1.5,
  };

  return <p style={style}>{children}</p>;
}
```

---

## Rule 4: Support User Text Spacing Overrides

### Incorrect - Fixed Spacing That Breaks with Overrides

```css
/* Fixed heights that break when text spacing changes */
.card {
  height: 200px;
  overflow: hidden;
}

.button {
  white-space: nowrap;
  height: 40px;
}
```

### Correct - Flexible Layout for Text Spacing

```css
/* Use min-height and allow growth */
.card {
  min-height: 200px;
  /* Content can expand if user increases spacing */
}

.button {
  min-height: 44px;
  padding: 0.5em 1em;
  /* Button grows with text */
}

/* Test with WCAG text spacing requirements */
/* Users may apply: line-height: 1.5, letter-spacing: 0.12em,
   word-spacing: 0.16em, paragraph-spacing: 2em */
```

---

## Rule 5: Dyslexia-Friendly Considerations

### Incorrect - Dyslexia-Hostile Typography

```css
/* Justified text creates uneven word spacing */
p {
  text-align: justify;
}

/* Italic for large blocks of text */
.description {
  font-style: italic;
}

/* All caps reduces word shape recognition */
.heading {
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

/* Decorative fonts for body text */
body {
  font-family: "Brush Script", cursive;
}
```

### Correct - Dyslexia-Friendly Typography

```css
/* Left-aligned text for consistent word spacing */
p {
  text-align: left;
}

/* Sans-serif fonts with distinct letter shapes */
body {
  font-family:
    "Open Sans",
    "Segoe UI",
    system-ui,
    sans-serif;
}

/* Emphasize without italics for long passages */
.emphasis {
  font-weight: 600;
  /* Or use color, background, or other methods */
}

/* Sentence case preserves word shapes */
.heading {
  text-transform: none;
}

/* Limit line length for easier tracking */
article {
  max-width: 70ch;
}
```

```tsx
// Dyslexia-friendly reading component
function ReadableArticle({ content }: { content: string }) {
  return (
    <article
      style={{
        fontFamily: '"Open Sans", system-ui, sans-serif',
        fontSize: '1.125rem',      // Slightly larger
        lineHeight: 1.8,           // Generous spacing
        letterSpacing: '0.02em',
        maxWidth: '65ch',          // Comfortable line length
        textAlign: 'left',
      }}
    >
      {content}
    </article>
  );
}
```

---

## Rule: Text Wrapping

```css
/* Balance short text blocks like headings */
h1, h2, h3 {
  text-wrap: balance;
}

/* Pretty-wrap body text to avoid orphans */
p {
  text-wrap: pretty;
}
```

Vercel guideline: Use `text-wrap: balance` on headings to prevent single-word last lines. Use `text-wrap: pretty` on body text.

---

## Rule: Numeric Typography

```css
/* Align numbers in tables and data displays */
.data-table td, .price, .metric {
  font-variant-numeric: tabular-nums;
}

/* Fractions and ordinals */
.fraction { font-variant-numeric: diagonal-fractions; }
```

Vercel guideline: Apply `font-variant-numeric: tabular-nums` for any numeric columns, prices, metrics, or countdown timers to ensure digits align vertically.

---

## Rule: Font Pairing

```css
/* Match heading and body font personalities */
:root {
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  /* Same family is safest. If pairing, match x-height and weight. */
}
```

Pro Max guideline: Select complementary typefaces that share design intent. When in doubt, use one font family at different weights rather than mixing families.

---

## Testing Guidance

### Manual Testing
1. Zoom browser to 200% - content should remain readable
2. Use browser dev tools to test with increased text spacing
3. Test with WCAG text spacing bookmarklet (line-height: 1.5x, letter-spacing: 0.12em, word-spacing: 0.16em)

### Screen Reader Testing
- Verify text is read correctly with modified spacing
- Check that semantic structure is preserved

### Automated Testing

```javascript
// axe-core configuration for typography
import { configureAxe } from 'jest-axe';

const axe = configureAxe({
  rules: [
    { id: 'meta-viewport', enabled: true }, // Ensures zoom isn't disabled
  ],
});

// Custom typography validation
function validateTypography(element) {
  const styles = getComputedStyle(element);
  const fontSize = parseFloat(styles.fontSize);
  const lineHeight = parseFloat(styles.lineHeight) / fontSize;

  return {
    fontSizeValid: fontSize >= 14,
    lineHeightValid: lineHeight >= 1.5,
    letterSpacingValid: parseFloat(styles.letterSpacing) >= 0,
  };
}

test('body text meets typography requirements', () => {
  const { container } = render(<Article />);
  const paragraph = container.querySelector('p');
  const validation = validateTypography(paragraph);

  expect(validation.fontSizeValid).toBe(true);
  expect(validation.lineHeightValid).toBe(true);
});
```

---

## WCAG Success Criteria

| Criterion | Level | Description |
|-----------|-------|-------------|
| **1.4.4 Resize Text** | AA | Text can resize to 200% without loss of content |
| **1.4.8 Visual Presentation** | AAA | Line spacing 1.5x, paragraph spacing 2x, line length 80 chars |
| **1.4.10 Reflow** | AA | Content reflows without horizontal scrolling at 400% |
| **1.4.12 Text Spacing** | AA | Content adapts to user text spacing overrides |

---

## Typography Checklist

| Property | Minimum | Recommended |
|----------|---------|-------------|
| Body font size | 16px (1rem) | 18px for long-form |
| Line height | 1.5 | 1.6-1.8 for articles |
| Letter spacing | 0 | 0.01-0.02em |
| Word spacing | normal | 0.05em |
| Line length | - | 45-75 characters (65ch) |
| Text wrap (headings) | - | text-wrap: balance |
| Text wrap (body) | - | text-wrap: pretty |
| Numeric alignment | - | font-variant-numeric: tabular-nums |
| Paragraph spacing | 1em | 1.5em |
