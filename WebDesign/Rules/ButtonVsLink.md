# Button vs Link

## Impact: HIGH (Semantic Correctness)

Using the wrong element for interactive controls confuses screen reader users and breaks expected keyboard behavior. Screen readers announce "link" or "button" to set user expectations: links navigate to new pages, buttons perform actions. Misusing these elements creates a cognitive disconnect and may break assistive technology functionality.

---

## Requirements Summary

| Element | Purpose | Keyboard | Screen Reader |
|---------|---------|----------|---------------|
| `<button>` | Actions (submit, toggle, open modal) | Enter or Space | "Button" |
| `<a href>` | Navigation (new page, same-page anchor) | Enter only | "Link" |
| `<input type="submit">` | Form submission | Enter | "Submit button" |

---

## When to Use Each

### Use `<button>` for:
- Submitting forms
- Opening/closing modals, menus, accordions
- Toggling states (expand/collapse, show/hide)
- Triggering actions (delete, save, copy)
- Playing/pausing media
- Any action that doesn't navigate away

### Use `<a href>` for:
- Navigating to another page
- Navigating to a section on the same page (anchor links)
- Downloading files (with `download` attribute)
- Links to external resources

---

## Code Examples

### Links Incorrectly Used as Buttons

#### Incorrect - Link Performing Action

```html
<!-- Link used for action - WRONG -->
<a href="#" onclick="deleteItem()">Delete</a>
<a href="javascript:void(0)" onclick="openModal()">Open Settings</a>
<a href="#" class="btn">Submit Form</a>

<!-- Link with role="button" - avoid if possible -->
<a href="#" role="button" onclick="doSomething()">Click me</a>
```

```tsx
// React component misusing links - INACCESSIBLE
const ActionLink = ({ onClick, children }: ActionProps) => (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
  >
    {children}
  </a>
);

// Usage
<ActionLink onClick={handleDelete}>Delete Item</ActionLink>
```

#### Correct - Button for Actions

```html
<!-- Button for actions -->
<button type="button" onclick="deleteItem()">Delete</button>
<button type="button" onclick="openModal()">Open Settings</button>
<button type="submit">Submit Form</button>
```

```tsx
// React component using proper button
interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

const ActionButton = ({ onClick, children, variant = 'primary' }: ActionButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`btn btn-${variant}`}
  >
    {children}
  </button>
);

// Usage
<ActionButton onClick={handleDelete} variant="danger">
  Delete Item
</ActionButton>
```

### Buttons Incorrectly Used as Links

#### Incorrect - Button for Navigation

```html
<!-- Button used for navigation - WRONG -->
<button onclick="window.location.href='/about'">About Us</button>
<button onclick="navigateTo('/contact')">Contact</button>
```

```tsx
// React button for navigation - WRONG
const NavButton = ({ href, children }: NavProps) => (
  <button onClick={() => router.push(href)}>
    {children}
  </button>
);
```

#### Correct - Link for Navigation

```html
<!-- Link for navigation -->
<a href="/about">About Us</a>
<a href="/contact">Contact</a>

<!-- Link styled as button (visual only) -->
<a href="/signup" class="btn btn-primary">Sign Up</a>
```

```tsx
// React link for navigation
import Link from 'next/link';

const NavLink = ({ href, children, className }: NavLinkProps) => (
  <Link href={href} className={className}>
    {children}
  </Link>
);

// Styled as button but semantically a link
<NavLink href="/signup" className="btn btn-primary">
  Sign Up
</NavLink>
```

### Button Type Attribute

#### Incorrect - Missing Type

```html
<!-- Without type, defaults to "submit" - may accidentally submit forms -->
<button onclick="doSomething()">Click</button>

<form>
  <button>Cancel</button> <!-- This will submit the form! -->
</form>
```

#### Correct - Explicit Type

```html
<!-- Explicit button type prevents accidental form submission -->
<button type="button" onclick="doSomething()">Click</button>

<form>
  <button type="button">Cancel</button>
  <button type="submit">Submit</button>
  <button type="reset">Reset</button>
</form>
```

```tsx
// React button with explicit types
interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  children: React.ReactNode;
}

const Button = ({ type = 'button', onClick, children }: ButtonProps) => (
  <button type={type} onClick={onClick}>
    {children}
  </button>
);

// Form buttons
const FormActions = ({ onCancel }: FormActionsProps) => (
  <div className="form-actions">
    <Button type="button" onClick={onCancel}>Cancel</Button>
    <Button type="submit">Save Changes</Button>
  </div>
);
```

### Navigation Links Must Support Cmd/Ctrl+Click

Links (`<a>`) support Cmd/Ctrl+click (open in new tab), middle-click, and right-click "Copy link address" natively. Using `<button>` with `onClick` navigation breaks all of these.

#### Incorrect

```tsx
// Button-based navigation — breaks Cmd+click, middle-click
<button onClick={() => router.push('/settings')}>Settings</button>
```

#### Correct

```tsx
// Link-based navigation — full browser behavior preserved
<Link href="/settings">Settings</Link>
```

---

### Icon Buttons

```tsx
// Accessible icon button
interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const IconButton = ({ icon, label, onClick }: IconButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="icon-button"
  >
    {icon}
  </button>
);

// Usage
<IconButton
  icon={<TrashIcon aria-hidden="true" />}
  label="Delete item"
  onClick={handleDelete}
/>
```

### Link with Icon

```tsx
// Accessible icon link
interface IconLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  external?: boolean;
}

const IconLink = ({ href, icon, label, external }: IconLinkProps) => (
  <a
    href={href}
    aria-label={label}
    {...(external && {
      target: "_blank",
      rel: "noopener noreferrer"
    })}
  >
    {icon}
    {external && <span className="sr-only">(opens in new tab)</span>}
  </a>
);
```

### Button-Styled Link Component

```tsx
// Polymorphic component that renders correct element
interface ButtonLinkProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const ButtonLink = ({ href, onClick, children, className }: ButtonLinkProps) => {
  const classes = `btn ${className}`;

  // If href provided, render as link
  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  // Otherwise render as button
  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
};

// Navigation - renders as <a>
<ButtonLink href="/signup" className="btn-primary">
  Sign Up
</ButtonLink>

// Action - renders as <button>
<ButtonLink onClick={handleSave} className="btn-primary">
  Save Changes
</ButtonLink>
```

---

## Keyboard Behavior Comparison

| Element | Enter Key | Space Key | Tab |
|---------|-----------|-----------|-----|
| `<button>` | Activates | Activates | Focusable |
| `<a href>` | Activates | Scrolls page | Focusable |
| `<a>` (no href) | Nothing | Nothing | Not focusable |

---

## Testing Guidance

### Manual Testing

1. **Screen reader**: Navigate to element, verify correct role announced
2. **Keyboard**: Test Enter and Space keys behave as expected
3. **Right-click test**: Links should show "Open in new tab" option
4. **Tab order**: Both buttons and links should be focusable

### Automated Testing

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('delete action uses button, not link', () => {
  render(<DeleteAction />);

  const deleteControl = screen.getByRole('button', { name: /delete/i });
  expect(deleteControl).toBeInTheDocument();
  expect(deleteControl.tagName).toBe('BUTTON');
});

test('navigation uses link, not button', () => {
  render(<Navigation />);

  const aboutLink = screen.getByRole('link', { name: /about/i });
  expect(aboutLink).toBeInTheDocument();
  expect(aboutLink).toHaveAttribute('href', '/about');
});

test('button responds to both Enter and Space', async () => {
  const onClick = jest.fn();
  render(<ActionButton onClick={onClick}>Click me</ActionButton>);

  const button = screen.getByRole('button');
  button.focus();

  await userEvent.keyboard('{Enter}');
  expect(onClick).toHaveBeenCalledTimes(1);

  await userEvent.keyboard(' ');
  expect(onClick).toHaveBeenCalledTimes(2);
});
```

---

## WCAG Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value) | A | Role correctly identifies element purpose |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard) | A | All functionality available via keyboard |
| [2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context) | A | Link purpose determinable from text |
| [2.5.2 Pointer Cancellation](https://www.w3.org/WAI/WCAG21/Understanding/pointer-cancellation) | A | Actions triggered on up-event (native buttons do this) |
