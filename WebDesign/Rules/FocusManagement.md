# Focus Management

## Impact: CRITICAL

**Proper focus management keeps users oriented when content changes dynamically.**

When new content appears (modals, route changes, dynamic updates), keyboard and screen reader users need focus moved appropriately. Without focus management, users may not know new content exists or may be trapped in now-irrelevant parts of the page.

## Why It Matters

Sighted users can see when a modal opens or new content loads. Screen reader users cannot. Moving focus to new content announces it and puts the user's keyboard in the right location. Restoring focus after dismissal returns users to their previous context. This is essential for single-page applications and dynamic interfaces.

---

## Rule: Move Focus to New Content

### Incorrect: Modal Opens Without Focus

```html
<!-- HTML - Focus stays on trigger button -->
<button onclick="openModal()">Open Settings</button>

<div id="modal" class="modal hidden">
  <h2>Settings</h2>
  <button onclick="closeModal()">Close</button>
</div>
```

```tsx
// React - Modal without focus management
const BadModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
```

**Problem:** User opens modal but focus stays on trigger. Screen reader doesn't announce modal. User may not know it opened.

### Correct: Focus Moves to Modal

```tsx
// React - Proper modal focus management
import { useEffect, useRef } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the element that triggered the modal
      triggerRef.current = document.activeElement as HTMLElement;
      // Move focus to modal
      modalRef.current?.focus();
    } else if (triggerRef.current) {
      // Restore focus when modal closes
      triggerRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="modal"
      >
        <h2 id="modal-title">{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
```

---

## Rule: Trap Focus in Modals

### Incorrect: Focus Escapes Modal

```tsx
// React - User can tab out of modal to page behind
const LeakyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <h2>Confirm Action</h2>
      <button>Cancel</button>
      <button>Confirm</button>
    </div>
  );
};
```

### Correct: Focus Trapped Within Modal

```tsx
// React - Complete focus trap implementation
import { useEffect, useRef, useCallback } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    return modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key !== 'Tab') return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, [onClose, getFocusableElements]);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (!isOpen && triggerRef.current) {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </div>
  );
};
```

---

## Rule: Focus on Route Changes (SPA)

### Incorrect: Route Changes Without Focus

```tsx
// React Router - Focus stays at previous location
const App = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/about" element={<AboutPage />} />
  </Routes>
);
```

### Correct: Focus Moves to New Content

```tsx
// React - Focus management for route changes
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const FocusOnRouteChange = ({ children }) => {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Move focus to main content on route change
    mainRef.current?.focus();

    // Announce page change to screen readers
    document.title = getPageTitle(location.pathname);
  }, [location.pathname]);

  return (
    <main ref={mainRef} tabIndex={-1} id="main-content">
      {children}
    </main>
  );
};

// Alternative: Focus the h1
const PageWrapper = ({ title, children }) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <>
      <h1 ref={headingRef} tabIndex={-1}>{title}</h1>
      {children}
    </>
  );
};
```

---

## Rule: Restore Focus on Dismissal

### Incorrect: Focus Lost After Close

```tsx
// React - Focus goes to body after modal closes
const BadModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <button onClick={onClose}>Close</button>
    </div>
  );
};
// User clicks Close, focus goes... somewhere
```

### Correct: Focus Returns to Trigger

```tsx
// React - Focus restoration pattern
const useModalFocus = (isOpen: boolean) => {
  const triggerRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  return modalRef;
};
```

---

## Rule: Focus Dynamic Content Updates

### Incorrect: New Content Not Announced

```tsx
// React - Search results appear silently
const SearchResults = ({ results }) => (
  <div className="results">
    {results.map(r => <ResultItem key={r.id} {...r} />)}
  </div>
);
```

### Correct: Announce Dynamic Updates

```tsx
// React - Focus or announce new content
import { useEffect, useRef } from 'react';

const SearchResults = ({ results, searchTerm }) => {
  const resultsRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (results.length > 0) {
      // Option 1: Move focus to results
      resultsRef.current?.focus();
    }
  }, [results]);

  return (
    <>
      {/* Live region announces results count */}
      <div
        ref={statusRef}
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {results.length} results found for "{searchTerm}"
      </div>

      <div
        ref={resultsRef}
        tabIndex={-1}
        aria-label={`Search results for ${searchTerm}`}
      >
        {results.map(r => <ResultItem key={r.id} {...r} />)}
      </div>
    </>
  );
};
```

---

## Focus Management Utilities

```tsx
// useFocusTrap hook
import { useEffect, useCallback } from 'react';

export const useFocusTrap = (containerRef: React.RefObject<HTMLElement>, isActive: boolean) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive || e.key !== 'Tab') return;

    const container = containerRef.current;
    if (!container) return;

    const focusable = container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, [containerRef, isActive]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
```

---

## Testing Guidance

### Keyboard Testing
1. Open modal - does focus move inside?
2. Tab through modal - does focus stay trapped?
3. Press Escape - does modal close and focus return?
4. Navigate routes - does focus move to new content?

### Screen Reader Testing
- When modal opens, is title announced?
- After closing, are you back where you started?
- On route change, is new page title announced?

### Automated Testing

```tsx
// Testing Library - Modal focus tests
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('modal receives focus when opened', async () => {
  render(<ModalExample />);

  const trigger = screen.getByRole('button', { name: /open/i });
  await userEvent.click(trigger);

  const modal = screen.getByRole('dialog');
  await waitFor(() => expect(modal).toHaveFocus());
});

test('focus returns to trigger on close', async () => {
  render(<ModalExample />);

  const trigger = screen.getByRole('button', { name: /open/i });
  await userEvent.click(trigger);

  const closeButton = screen.getByRole('button', { name: /close/i });
  await userEvent.click(closeButton);

  expect(trigger).toHaveFocus();
});

test('focus is trapped in modal', async () => {
  render(<ModalWithTwoButtons />);
  await userEvent.click(screen.getByRole('button', { name: /open/i }));

  // Tab through modal
  await userEvent.tab(); // First button
  await userEvent.tab(); // Second button
  await userEvent.tab(); // Should wrap to first

  expect(screen.getByRole('button', { name: /first/i })).toHaveFocus();
});
```

---

## WCAG Success Criteria

- **2.4.3 Focus Order (Level A):** Focus sequence preserves meaning and operability
- **2.4.7 Focus Visible (Level AA):** Focus indicator is always visible
- **3.2.1 On Focus (Level A):** Focus changes don't cause unexpected context changes

---

## Focus Management Checklist

| Scenario | Action |
|----------|--------|
| Modal opens | Focus to modal (heading or first interactive) |
| Modal closes | Focus to trigger element |
| Route changes | Focus to main content or h1 |
| Dropdown opens | Focus to first option |
| Dropdown closes | Focus to trigger |
| Toast appears | Use live region (don't move focus) |
| Form error | Focus to first error field |
| Delete action | Focus to next logical item |
