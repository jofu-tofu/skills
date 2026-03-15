# Semantic HTML First

## Impact: CRITICAL

**Prevents 90% of accessibility issues by leveraging built-in browser functionality.**

Using native HTML elements before reaching for ARIA is the single most effective accessibility practice. Native elements provide keyboard support, focus management, and screen reader announcements automatically, while custom implementations require extensive manual work to achieve the same functionality.

## Why It Matters

Screen readers and assistive technologies are optimized for native HTML elements. When you use a `<button>`, users automatically get focusability, Enter/Space activation, proper role announcement, and form submission capability. A `<div>` with `role="button"` requires you to manually implement all of this, and missing even one piece breaks the experience for users.

---

## Rule: Use Native Interactive Elements

### Incorrect: Custom Button with ARIA

```html
<!-- HTML - Missing keyboard handling, focus styles -->
<div class="btn" role="button" tabindex="0" onclick="submit()">
  Submit
</div>
```

```tsx
// React - Incomplete implementation
const CustomButton = ({ onClick, children }) => (
  <div
    className="btn"
    role="button"
    tabIndex={0}
    onClick={onClick}
  >
    {children}
  </div>
);
```

**Problems:**
- No Enter/Space key activation
- No form submission capability
- No disabled state communication
- Missing focus ring in many browsers

### Correct: Native Button Element

```html
<!-- HTML - Full functionality built-in -->
<button type="submit" class="btn">
  Submit
</button>
```

```tsx
// React - Complete accessibility by default
const Button = ({ onClick, children, disabled }) => (
  <button
    className="btn"
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);
```

---

## Rule: Use Native Form Controls

### Incorrect: Custom Checkbox

```html
<!-- HTML - Broken for keyboard and screen readers -->
<div class="checkbox" onclick="toggleCheck(this)">
  <span class="checkmark"></span>
  <span>I agree to terms</span>
</div>
```

```tsx
// React - Missing all checkbox semantics
const CustomCheckbox = ({ checked, onChange, label }) => (
  <div
    className={`checkbox ${checked ? 'checked' : ''}`}
    onClick={() => onChange(!checked)}
  >
    <span className="checkmark" />
    <span>{label}</span>
  </div>
);
```

### Correct: Native Checkbox with Label

```html
<!-- HTML - Full keyboard, label association, state -->
<label class="checkbox-wrapper">
  <input type="checkbox" name="terms" required />
  <span class="checkmark"></span>
  I agree to terms
</label>
```

```tsx
// React - Proper checkbox implementation
const Checkbox = ({ id, checked, onChange, label, required }) => (
  <label className="checkbox-wrapper" htmlFor={id}>
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      required={required}
    />
    <span className="checkmark" aria-hidden="true" />
    {label}
  </label>
);
```

---

## Rule: Use Links for Navigation (Button vs Anchor Semantics)

Use `<a>` (or `<Link>`) for **navigation** and `<button>` for **actions/state changes**. This distinction is critical because links and buttons have fundamentally different behaviors that users rely on:

- **Links (`<a>`):** Navigate to a URL. Support Cmd/Ctrl+click to open in a new tab, middle-click for background tab, right-click for link context menu. Screen readers announce them as "link."
- **Buttons (`<button>`):** Trigger actions or state changes (submit form, toggle UI, delete item). Activated by Enter and Space. Screen readers announce them as "button."

### Incorrect: Div as Link or Button

```html
<!-- HTML - Not focusable, no link semantics -->
<div class="link" onclick="window.location='/about'">
  About Us
</div>

<!-- HTML - No keyboard, no role, no states -->
<div class="btn" onclick="deleteItem()">
  Delete
</div>
```

```tsx
// React - Missing link functionality
const FakeLink = ({ href, children }) => (
  <div
    className="link"
    onClick={() => window.location.href = href}
  >
    {children}
  </div>
);
```

**Problems:**
- Cannot right-click to open in new tab
- No Cmd/Ctrl+click or middle-click support (links only)
- Not announced as link or button by screen readers
- No keyboard navigation without tabindex
- Browser history may not work correctly

### Correct: Native Anchor Element

```html
<!-- HTML - Full link functionality -->
<a href="/about">About Us</a>
```

```tsx
// React - Use Link component from your router
import { Link } from 'react-router-dom';

const NavLink = ({ to, children }) => (
  <Link to={to} className="nav-link">
    {children}
  </Link>
);
```

### Choosing Between Button and Link

```tsx
// Action/state change -> <button>
<button onClick={handleDelete}>Delete Item</button>
<button onClick={toggleMenu}>Open Menu</button>
<button onClick={handleSave}>Save Changes</button>

// Navigation -> <a> or <Link>
<Link to="/settings">Settings</Link>
<a href="/docs/guide.pdf" download>Download Guide</a>
<a href="https://example.com" target="_blank" rel="noopener noreferrer">External Site</a>
```

---

## Rule: Use Native Select for Dropdowns

### Incorrect: Custom Dropdown

```html
<!-- HTML - Requires extensive ARIA and keyboard handling -->
<div class="dropdown" aria-haspopup="listbox">
  <div class="dropdown-trigger" tabindex="0">Select option</div>
  <ul class="dropdown-menu" role="listbox">
    <li role="option">Option 1</li>
    <li role="option">Option 2</li>
  </ul>
</div>
```

### Correct: Native Select

```html
<!-- HTML - Complete functionality automatically -->
<label for="options">Choose an option:</label>
<select id="options" name="options">
  <option value="">Select option</option>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>
```

```tsx
// React - Native select with proper labeling
const Select = ({ id, label, options, value, onChange }) => (
  <>
    <label htmlFor={id}>{label}</label>
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select option</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </>
);
```

---

## Rule: Use `aria-hidden="true"` on Decorative Content

Decorative icons and SVGs that do not convey meaningful information should be hidden from assistive technologies. Without `aria-hidden="true"`, screen readers may attempt to read SVG markup or icon font Unicode values, creating a confusing experience.

### Incorrect: Decorative Icon Exposed to Screen Readers

```tsx
// Screen reader may read SVG paths or meaningless text
<button>
  <svg viewBox="0 0 24 24">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
  Menu
</button>
```

### Correct: Decorative Icon Hidden from Screen Readers

```tsx
// SVG is decorative — the button text "Menu" provides the label
<button>
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
  Menu
</button>

// Icon-only button — use aria-label for the accessible name
<button aria-label="Close dialog">
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
</button>
```

**Key principle:** If the icon is next to visible text, hide the icon. If the icon is the only content, add `aria-label` to the parent and hide the icon.

---

## Rule: Use `aria-live` for Dynamic Updates

When content updates asynchronously (toast notifications, form validation messages, status changes), screen readers will not announce the change unless the container has an `aria-live` region. Use `aria-live="polite"` so announcements wait until the user is idle, and `aria-atomic="true"` when the entire region should be re-read on any change.

### Incorrect: Status Message Without aria-live

```tsx
// Screen reader misses this entirely when it appears dynamically
const SaveStatus = ({ saved }) => (
  saved ? <div className="status">Operation saved successfully</div> : null
);
```

### Correct: Status Message With aria-live

```tsx
// Screen reader announces "Operation saved successfully" when content changes
const SaveStatus = ({ saved }) => (
  <div aria-live="polite" aria-atomic="true" className="status">
    {saved ? 'Operation saved successfully' : ''}
  </div>
);
```

**Important:** The `aria-live` container must be present in the DOM *before* the content changes. Do not conditionally render the container itself; instead, conditionally render the content *inside* the container.

### More Examples

```tsx
// Toast notification region
<div aria-live="polite" aria-atomic="true" className="toast-container">
  {toast && <div className="toast">{toast.message}</div>}
</div>

// Form validation errors
<div aria-live="polite" className="error-messages">
  {errors.map(err => <p key={err.field}>{err.message}</p>)}
</div>

// Loading status
<div aria-live="polite" aria-atomic="true">
  {isLoading ? 'Loading results...' : `${count} results found`}
</div>
```

---

## Common Anti-Patterns

| Anti-Pattern | Why It Fails | Fix |
|---|---|---|
| `<div onClick>` for buttons | No keyboard, no role, no states | Use `<button>` |
| `<div onClick>` for navigation | No middle-click, no link semantics | Use `<a>` or `<Link>` |
| Missing `aria-hidden` on icons | Screen reader reads SVG markup | Add `aria-hidden="true"` |
| No `aria-live` on status messages | Screen reader misses updates | Add `aria-live="polite"` |
| Conditional render of `aria-live` container | Announcements missed on first insert | Keep container in DOM, change content inside |
| Icon-only button without label | Screen reader announces nothing useful | Add `aria-label` to button |

---

## Testing Guidance

### Keyboard Testing
1. Tab to each interactive element - native elements receive focus automatically
2. Press Enter/Space on buttons - should activate without custom handlers
3. Navigate form controls - labels should be clickable, states should change

### Screen Reader Testing
- **Buttons:** Should announce "Submit, button" not just "Submit"
- **Checkboxes:** Should announce "I agree to terms, checkbox, not checked"
- **Links:** Should announce "About Us, link"
- **Selects:** Should announce options and selection state
- **Decorative icons:** Should not be announced at all
- **Status messages:** Should be announced when content changes

### Automated Testing

```tsx
// Testing Library - Button
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('button is keyboard accessible', async () => {
  const onClick = jest.fn();
  render(<button onClick={onClick}>Submit</button>);

  const button = screen.getByRole('button', { name: /submit/i });
  await userEvent.tab();
  expect(button).toHaveFocus();

  await userEvent.keyboard('{Enter}');
  expect(onClick).toHaveBeenCalled();
});
```

```javascript
// axe-core integration
import { axe, toHaveNoViolations } from 'jest-axe';

test('form has no accessibility violations', async () => {
  const { container } = render(<MyForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## WCAG Success Criteria

- **4.1.2 Name, Role, Value (Level A):** Native elements automatically expose correct name, role, and value to assistive technologies. Also requires that decorative elements with `aria-hidden="true"` do not interfere with accessible names.
- **4.1.3 Status Messages (Level AA):** Status messages (toasts, validation, progress) must be programmatically determinable through role or properties (e.g., `aria-live`) so they can be presented to the user without receiving focus.
- **2.1.1 Keyboard (Level A):** Native elements are keyboard operable by default
- **1.3.1 Info and Relationships (Level A):** Native elements convey structural relationships programmatically

---

## The First Rule of ARIA

> "If you can use a native HTML element with the semantics and behavior you require already built in, instead of re-purposing an element and adding an ARIA role, state or property to make it accessible, then do so."
> — W3C WAI-ARIA Authoring Practices
