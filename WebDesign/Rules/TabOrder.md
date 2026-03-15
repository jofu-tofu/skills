# Tab Order

## Impact: HIGH

**Tab order must follow visual and logical reading order.**

When users press Tab, focus should move in a predictable sequence that matches the visual layout of the page. Unexpected focus jumps disorient users and make forms unusable for keyboard navigators.

## Why It Matters

Keyboard users build a mental model of the page based on where focus moves. When tab order doesn't match visual order, users lose context. A form where focus jumps from first name to submit button to last name is essentially broken for keyboard users.

---

## Rule: Follow Visual Order

### Incorrect: Tab Order Doesn't Match Layout

```html
<!-- HTML - Tab order: 3, 1, 2 (set by tabindex) -->
<div class="form-row">
  <input tabindex="3" placeholder="First Name">
  <input tabindex="1" placeholder="Last Name">
  <input tabindex="2" placeholder="Email">
</div>
```

```css
/* CSS - Visual order changed but DOM order unchanged */
.form-row {
  display: flex;
  flex-direction: row-reverse;
}
```

### Correct: DOM Order Matches Visual Order

```html
<!-- HTML - Natural tab order matches visual layout -->
<div class="form-row">
  <input placeholder="First Name">
  <input placeholder="Last Name">
  <input placeholder="Email">
</div>
```

```tsx
// React - Component order matches visual presentation
const ContactForm = () => (
  <form>
    <div className="form-row">
      <TextField label="First Name" name="firstName" />
      <TextField label="Last Name" name="lastName" />
    </div>
    <TextField label="Email" name="email" type="email" />
    <Button type="submit">Send</Button>
  </form>
);
```

---

## Rule: Avoid Positive tabindex Values

### Incorrect: Using Positive tabindex

```html
<!-- HTML - Custom tab order is confusing and brittle -->
<button tabindex="3">Third</button>
<button tabindex="1">First</button>
<button tabindex="2">Second</button>
<button>Fourth (no tabindex)</button>
```

**Tab order becomes:** First > Second > Third > Fourth

**Problems:**
- Hard to maintain as content changes
- Overrides natural document flow
- Confuses users expecting visual order

### Correct: Rely on DOM Order

```html
<!-- HTML - Natural order, easy to maintain -->
<button>First</button>
<button>Second</button>
<button>Third</button>
<button>Fourth</button>
```

---

## Rule: Use tabindex="0" for Custom Focusables

### Incorrect: Non-Focusable Interactive Element

```html
<!-- HTML - Cannot receive keyboard focus -->
<div class="card" onclick="selectCard(1)">
  Card content
</div>
```

### Correct: tabindex="0" Adds to Tab Order

```html
<!-- HTML - Part of natural tab order -->
<div
  class="card"
  role="button"
  tabindex="0"
  onclick="selectCard(1)"
  onkeydown="handleKeyDown(event, 1)"
>
  Card content
</div>
```

```tsx
// React - Custom focusable component
const SelectableCard = ({ id, onSelect, children }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(id)}
      onKeyDown={handleKeyDown}
      className="card"
    >
      {children}
    </div>
  );
};
```

---

## Rule: Use tabindex="-1" for Programmatic Focus

### Incorrect: Cannot Focus Programmatically

```html
<!-- HTML - Can't focus non-interactive elements -->
<div class="error-message" id="error">
  Please fix the errors above.
</div>

<script>
  // This won't work - div isn't focusable
  document.getElementById('error').focus();
</script>
```

### Correct: tabindex="-1" Enables .focus()

```html
<!-- HTML - Focusable but not in tab order -->
<div
  class="error-message"
  id="error"
  tabindex="-1"
  role="alert"
>
  Please fix the errors above.
</div>

<script>
  // Now this works
  document.getElementById('error').focus();
</script>
```

```tsx
// React - Focus management with tabindex="-1"
const FormWithErrors = () => {
  const errorRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      // Focus error summary for screen reader announcement
      errorRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="error-summary"
        >
          <h2>Please correct the following errors:</h2>
          <ul>
            {errors.map((error, i) => <li key={i}>{error}</li>)}
          </ul>
        </div>
      )}
      {/* form fields */}
    </form>
  );
};
```

---

## Rule: Use Roving Tabindex for Composite Widgets

In composite widgets (toolbars, tab lists, menu bars, tree views, radio groups), individual items should NOT each be in the tab order. Use the roving tabindex pattern: only the active item has `tabindex="0"`, all others have `tabindex="-1"`. Arrow keys move focus between items.

A toolbar with 10 buttons that all receive Tab focus forces keyboard users to press Tab 10 times to pass through. With roving tabindex, Tab enters the widget (1 press), arrows navigate within, and Tab exits (1 press).

| Widget | Tab Behavior | Arrow Behavior |
|--------|-------------|----------------|
| Toolbar | Enter/exit widget | Move between tools |
| Tab list | Enter/exit tab strip | Switch tabs |
| Menu bar | Enter/exit menu | Navigate items |
| Radio group | Enter/exit group | Select option |

### Correct: Roving Tabindex in a Toolbar

```tsx
// React - Toolbar with roving tabindex
const Toolbar = ({ items }: { items: ToolItem[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = index;
    switch (e.key) {
      case 'ArrowRight':
        next = (index + 1) % items.length;
        break;
      case 'ArrowLeft':
        next = (index - 1 + items.length) % items.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    setActiveIndex(next);
    itemRefs.current[next]?.focus();
  };

  return (
    <div role="toolbar" aria-label="Formatting">
      {items.map((item, i) => (
        <button
          key={item.id}
          ref={(el) => (itemRefs.current[i] = el)}
          tabIndex={i === activeIndex ? 0 : -1}
          onClick={item.action}
          onKeyDown={(e) => handleKeyDown(e, i)}
          aria-pressed={item.active}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};
```

```html
<!-- HTML - Radio group with roving tabindex -->
<div role="radiogroup" aria-label="Color choice">
  <div role="radio" tabindex="0" aria-checked="true">Red</div>
  <div role="radio" tabindex="-1" aria-checked="false">Blue</div>
  <div role="radio" tabindex="-1" aria-checked="false">Green</div>
</div>
```

---

## Rule: Handle CSS Layout Changes

### Incorrect: Flexbox Reorder Breaks Tab Order

```html
<!-- HTML - DOM order preserved -->
<div class="layout">
  <aside>Sidebar</aside>
  <main>Main Content</main>
</div>
```

```css
/* CSS - Visual order changed, tab order not updated */
.layout {
  display: flex;
}
.layout main {
  order: -1; /* Visually first, but tabs second */
}
```

### Correct: Match DOM to Visual Order

```html
<!-- HTML - DOM matches intended visual order -->
<div class="layout">
  <main>Main Content</main>
  <aside>Sidebar</aside>
</div>
```

```css
/* CSS - No order manipulation needed */
.layout {
  display: flex;
}
```

---

## Rule: Grid Layout Tab Order

### Incorrect: Grid Items Tab in DOM Order Despite Visual Grid

```css
/* CSS - 3-column grid */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
```

```html
<!-- HTML - Items 1-9 in DOM order -->
<!-- Tab order: 1,2,3,4,5,6,7,8,9 -->
<!-- Visual order (row by row) is the same, so this is OK -->
```

**Problem arises with `grid-auto-flow: column`:**

```css
/* CSS - Column-first flow */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-auto-flow: column;
}
```

```html
<!-- Visual order: 1,4,7 | 2,5,8 | 3,6,9 -->
<!-- Tab order: 1,2,3,4,5,6,7,8,9 (mismatched!) -->
```

### Correct: Order DOM to Match Visual Grid

```html
<!-- HTML - Reordered to match visual column flow -->
<div class="grid">
  <div>1</div> <div>4</div> <div>7</div>
  <div>2</div> <div>5</div> <div>8</div>
  <div>3</div> <div>6</div> <div>9</div>
</div>
```

Or avoid column-flow when tab order matters.

---

## tabindex Reference

| Value | Behavior |
|-------|----------|
| Not present | Native focusable elements (button, input, a) in tab order |
| `tabindex="0"` | Added to tab order in DOM position |
| `tabindex="-1"` | Focusable via script, not in tab order |
| `tabindex="1+"` | **Avoid** - forced order before natural elements |

---

## Testing Guidance

### Keyboard Testing
1. Tab through entire page without mouse
2. Verify focus moves left-to-right, top-to-bottom (or per reading direction)
3. Check focus never jumps unexpectedly
4. Ensure all interactive elements are reachable

### Screen Reader Testing
- Navigate by form controls - is order logical?
- Check landmark navigation matches visual sections
- Verify focus announcements match visual position

### Automated Testing

```tsx
// Testing Library - Tab order tests
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('form fields tab in visual order', async () => {
  render(<ContactForm />);

  const firstName = screen.getByLabelText(/first name/i);
  const lastName = screen.getByLabelText(/last name/i);
  const email = screen.getByLabelText(/email/i);
  const submit = screen.getByRole('button', { name: /submit/i });

  // Start from body
  await userEvent.tab();
  expect(firstName).toHaveFocus();

  await userEvent.tab();
  expect(lastName).toHaveFocus();

  await userEvent.tab();
  expect(email).toHaveFocus();

  await userEvent.tab();
  expect(submit).toHaveFocus();
});

test('no positive tabindex values', () => {
  render(<MyPage />);

  const elementsWithTabindex = document.querySelectorAll('[tabindex]');
  elementsWithTabindex.forEach(el => {
    const tabindex = parseInt(el.getAttribute('tabindex') || '0');
    expect(tabindex).toBeLessThanOrEqual(0);
  });
});
```

```javascript
// axe-core tabindex rule
const results = await axe(container, {
  rules: {
    'tabindex': { enabled: true } // Flags tabindex > 0
  }
});
```

---

## WCAG Success Criteria

- **2.4.3 Focus Order (Level A):** Focusable components receive focus in an order that preserves meaning and operability
- **1.3.2 Meaningful Sequence (Level A):** Reading order is programmatically determinable

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using `tabindex="1"` | Remove, use DOM order |
| CSS `order` property | Reorder DOM to match |
| Flex `row-reverse` | Reverse DOM order |
| Grid `column` flow | Order DOM to match visual |
| Modal not focused | Add `tabindex="-1"` and `.focus()` |
| Skip links broken | Use `tabindex="-1"` on target |
| All widget items in tab order — Tab bloat, user presses Tab N times to pass through | Use roving tabindex pattern |
