# Keyboard Patterns

## Impact: CRITICAL

**All interactive elements must be fully operable with keyboard alone.**

Keyboard accessibility is foundational. Users who cannot use a mouse (due to motor disabilities, vision impairment, or preference) rely entirely on keyboard navigation. This includes users of screen readers, switch devices, voice control, and those with repetitive strain injuries.

## Why It Matters

Approximately 15-20% of users navigate primarily by keyboard. Beyond accessibility, keyboard support improves power user experience and is required for compliance with ADA, Section 508, and WCAG. Every click handler needs a keyboard equivalent.

---

## Core Keyboard Patterns

| Key | Purpose |
|-----|---------|
| **Tab** | Navigate between focusable elements |
| **Shift+Tab** | Navigate backwards |
| **Enter** | Activate links and buttons |
| **Space** | Activate buttons, toggle checkboxes |
| **Arrow keys** | Navigate within components (menus, tabs, grids) |
| **Escape** | Close/dismiss overlays, cancel operations |
| **Home/End** | Jump to first/last item in lists |

---

## Rule: Use onKeyDown for Immediate Actions, onKeyUp for Completion

Interactive elements need explicit keyboard event handlers. The choice between `onKeyDown` and `onKeyUp` affects user experience:

| Event | When It Fires | Use For |
|-------|--------------|---------|
| `onKeyDown` | Key is pressed down | Immediate feedback, repeated actions (holding arrow keys), preventing default browser behavior |
| `onKeyUp` | Key is released | One-shot actions, form submission, toggling state |

Using `onKeyDown` for actions that should fire only once (like form submission) can cause duplicate submissions if the user holds the key. Using `onKeyUp` for navigation (arrow keys in a list) feels sluggish because of the delay between press and response.

### Correct: onKeyDown for Navigation, onKeyUp for Toggle

```tsx
// React - onKeyDown for arrow navigation (immediate, repeatable)
const handleArrowNav = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    focusNext(); // Fires immediately, repeats if key held
  }
};

// React - onKeyUp for toggle actions (one-shot, no repeats)
const handleToggle = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
    toggleExpanded(); // Fires once on key release
  }
};
```

### Anti-Pattern: Click-Only on Non-Semantic Elements

Click handlers do not fire on `<div>` elements when Enter or Space is pressed — that behavior only comes from native `<button>` and `<a>` elements. Custom interactive elements MUST have explicit keyboard handlers.

```tsx
// Anti-pattern: click-only on non-semantic element
<div role="button" onClick={handleAction}>Action</div>

// Correct: keyboard handler alongside click
<div
  role="button"
  tabIndex={0}
  onClick={handleAction}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAction();
    }
  }}
>
  Action
</div>
```

---

## Rule: All Interactive Elements Must Be Keyboard Accessible

### Incorrect: Click-Only Handler

```html
<!-- HTML - Keyboard users cannot activate -->
<div class="button" onclick="doAction()">
  Click me
</div>

<span onclick="toggleMenu()">Menu</span>
```

```tsx
// React - Missing keyboard support
const ClickableDiv = ({ onClick, children }) => (
  <div className="clickable" onClick={onClick}>
    {children}
  </div>
);
```

### Correct: Full Keyboard Support

```html
<!-- HTML - Use native button -->
<button type="button" onclick="doAction()">
  Click me
</button>
```

```tsx
// React - Use semantic elements OR add keyboard handling
// Option 1: Use button (preferred)
const Button = ({ onClick, children }) => (
  <button type="button" onClick={onClick}>
    {children}
  </button>
);

// Option 2: If div is absolutely necessary
const ClickableDiv = ({ onClick, children }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="clickable"
    >
      {children}
    </div>
  );
};
```

---

## Rule: Implement Arrow Key Navigation in Composite Widgets

### Pattern: Tab Navigation Component

```tsx
// React - Tabs with arrow key navigation
import { useState, useRef, useEffect } from 'react';

interface TabProps {
  tabs: { id: string; label: string; content: React.ReactNode }[];
}

const Tabs = ({ tabs }: TabProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    switch (e.key) {
      case 'ArrowRight':
        newIndex = (index + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        newIndex = (index - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    setActiveIndex(newIndex);
    tabRefs.current[newIndex]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Content tabs">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={el => tabRefs.current[index] = el}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={index === activeIndex}
            aria-controls={`panel-${tab.id}`}
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={index !== activeIndex}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};
```

---

## Rule: Menu Navigation Pattern

```tsx
// React - Dropdown menu with keyboard support
import { useState, useRef, useEffect } from 'react';

const DropdownMenu = ({ trigger, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(items.length - 1);
        break;
    }
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        items[focusedIndex]?.action();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
    }
  };

  return (
    <div className="dropdown">
      <button
        ref={triggerRef}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
      >
        {trigger}
      </button>

      {isOpen && (
        <ul
          ref={menuRef}
          role="menu"
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, index) => (
            <li
              key={item.id}
              ref={el => itemRefs.current[index] = el}
              role="menuitem"
              tabIndex={-1}
              onClick={() => {
                item.action();
                setIsOpen(false);
                triggerRef.current?.focus();
              }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

---

## Rule: Escape Key Dismisses Overlays

### Incorrect: No Escape Handler

```tsx
// React - Modal without escape key
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal">{children}</div>
    </div>
  );
};
```

### Correct: Escape Key Closes Modal

```tsx
// React - Escape key support
import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
```

---

## Rule: Space and Enter Behavior

| Element | Enter | Space |
|---------|-------|-------|
| Button | Activates | Activates |
| Link | Activates | Scrolls page |
| Checkbox | Toggles | Toggles |
| Radio | Selects | Selects |
| Select | Opens dropdown | Opens dropdown |

```tsx
// React - Prevent space scroll on custom buttons
const CustomButton = ({ onClick, children }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ') {
      e.preventDefault(); // Prevent page scroll
      onClick();
    } else if (e.key === 'Enter') {
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};
```

---

## Testing Guidance

### Keyboard Testing Checklist
1. Unplug mouse and navigate entire application
2. Tab through all interactive elements - is order logical?
3. Activate buttons with Enter and Space
4. Navigate menus with arrow keys
5. Close modals/dropdowns with Escape
6. Ensure no keyboard traps (except modals)

### Screen Reader Testing
- Verify all keyboard actions are announced
- Check focus movement is communicated
- Ensure role and state changes are announced

### Automated Testing

```tsx
// Testing Library - Keyboard interaction tests
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('button responds to Enter key', async () => {
  const onClick = jest.fn();
  render(<button onClick={onClick}>Submit</button>);

  const button = screen.getByRole('button');
  button.focus();
  await userEvent.keyboard('{Enter}');

  expect(onClick).toHaveBeenCalled();
});

test('button responds to Space key', async () => {
  const onClick = jest.fn();
  render(<button onClick={onClick}>Submit</button>);

  const button = screen.getByRole('button');
  button.focus();
  await userEvent.keyboard(' ');

  expect(onClick).toHaveBeenCalled();
});

test('tabs navigate with arrow keys', async () => {
  render(<Tabs tabs={testTabs} />);

  const firstTab = screen.getByRole('tab', { name: /first/i });
  firstTab.focus();

  await userEvent.keyboard('{ArrowRight}');
  expect(screen.getByRole('tab', { name: /second/i })).toHaveFocus();
});

test('escape closes modal', async () => {
  const onClose = jest.fn();
  render(<Modal isOpen onClose={onClose}>Content</Modal>);

  await userEvent.keyboard('{Escape}');
  expect(onClose).toHaveBeenCalled();
});
```

---

## WCAG Success Criteria

- **2.1.1 Keyboard (Level A):** All functionality available from keyboard
- **2.1.2 No Keyboard Trap (Level A):** Focus can always be moved away
- **2.1.4 Character Key Shortcuts (Level A):** Single character shortcuts can be turned off
- **2.4.1 Bypass Blocks (Level A):** Mechanism to skip repeated content
- **2.4.7 Focus Visible (Level AA):** Keyboard focus is always visible

---

## ARIA Keyboard Patterns Reference

| Component | Expected Keys |
|-----------|---------------|
| Menu | Arrow, Enter, Space, Escape, Home, End |
| Tabs | Arrow, Home, End |
| Tree | Arrow, Enter, Space, Home, End, * |
| Listbox | Arrow, Home, End, Type-ahead |
| Grid | Arrow, Home, End, Ctrl+Home, Ctrl+End |
| Slider | Arrow, Home, End, PageUp, PageDown |
