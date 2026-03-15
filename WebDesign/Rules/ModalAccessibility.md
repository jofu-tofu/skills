# Modal Accessibility

## Impact: HIGH (Complex Widget)

Modals (dialogs) are among the most challenging patterns to implement accessibly. Keyboard users can become trapped outside the modal or unable to close it. Screen reader users may not know a modal has opened or may navigate outside it to inaccessible content. Proper modal accessibility requires focus management, ARIA attributes, and escape mechanisms.

---

## Requirements Summary

| Requirement | Implementation |
|-------------|----------------|
| Focus trap | Tab cycles within modal only |
| Initial focus | Move to first focusable element or modal itself |
| Escape to close | Escape key dismisses modal |
| Return focus | Focus returns to trigger element on close |
| Backdrop click | Clicking outside closes modal (optional but expected) |
| ARIA attributes | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Background inert | Content behind modal not accessible |

---

## Code Examples

### Inaccessible Modal

#### Incorrect - Missing Accessibility Features

```html
<!-- Modal without accessibility - BROKEN -->
<div class="modal" style="display: block;">
  <div class="modal-content">
    <span class="close" onclick="closeModal()">&times;</span>
    <h2>Settings</h2>
    <p>Modal content here</p>
    <button onclick="saveSettings()">Save</button>
  </div>
</div>
```

```tsx
// React modal missing accessibility - INACCESSIBLE
const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button onClick={onClose}>X</button>
        {children}
      </div>
    </div>
  );
};
```

### Accessible Modal

#### Correct - Full Implementation

```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  class="modal"
>
  <div class="modal-content">
    <header class="modal-header">
      <h2 id="modal-title">Confirm Deletion</h2>
      <button
        type="button"
        aria-label="Close dialog"
        class="modal-close"
        onclick="closeModal()"
      >
        <svg aria-hidden="true"><!-- X icon --></svg>
      </button>
    </header>

    <div class="modal-body">
      <p id="modal-description">
        Are you sure you want to delete this item? This action cannot be undone.
      </p>
    </div>

    <footer class="modal-footer">
      <button type="button" onclick="closeModal()">Cancel</button>
      <button type="button" class="btn-danger" onclick="confirmDelete()">
        Delete
      </button>
    </footer>
  </div>
</div>

<!-- Backdrop with inert background -->
<div class="modal-backdrop" onclick="closeModal()" aria-hidden="true"></div>
<main inert><!-- Page content made inert --></main>
```

```tsx
// React accessible modal component
import { useEffect, useRef, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, description, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  // Store trigger element on open
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus first focusable element or modal itself
      const firstFocusable = modalRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (firstFocusable || modalRef.current).focus();
    }
  }, [isOpen]);

  // Return focus on close
  useEffect(() => {
    if (!isOpen && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }, []);

  // Backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className="modal"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <header className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="modal-close"
          >
            <CloseIcon aria-hidden="true" />
          </button>
        </header>

        {description && (
          <p id={descId} className="modal-description">
            {description}
          </p>
        )}

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};
```

### Using the HTML `<dialog>` Element

```tsx
// Native dialog element (modern browsers)
const NativeModal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal(); // Opens as modal with backdrop
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Native dialog handles:
  // - Focus trap automatically
  // - Escape to close (with cancel event)
  // - Backdrop click (with light dismiss in some browsers)
  // - aria-modal automatically

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="dialog-title"
      onCancel={onClose} // Escape key fires cancel event
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <header>
        <h2 id="dialog-title">{title}</h2>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
        >
          <CloseIcon aria-hidden="true" />
        </button>
      </header>
      {children}
    </dialog>
  );
};
```

### Making Background Inert

```tsx
// Hook to make background content inert
const useInertBackground = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) return;

    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.setAttribute('inert', '');
      mainContent.setAttribute('aria-hidden', 'true');
    }

    return () => {
      if (mainContent) {
        mainContent.removeAttribute('inert');
        mainContent.removeAttribute('aria-hidden');
      }
    };
  }, [isOpen]);
};

// Usage in modal
const Modal = ({ isOpen, ...props }: ModalProps) => {
  useInertBackground(isOpen);
  // ... rest of modal
};
```

### Alert Dialog Variant

```tsx
// Alert dialog for confirmations (cannot be dismissed by backdrop click)
const AlertDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message
}: AlertDialogProps) => {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      aria-describedby="alert-message"
      className="alert-dialog"
    >
      <h2 id="alert-title">{title}</h2>
      <p id="alert-message">{message}</p>

      <div className="alert-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className="btn-danger">
          Confirm
        </button>
      </div>
    </div>
  );
};
```

---

## Scroll Containment and Destructive Actions

### Overscroll Behavior in Modals

```css
/* Prevent scroll from chaining to parent page */
.modal-body {
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* Also applies to drawers and sheets */
.drawer-content, .bottom-sheet {
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

### Destructive Action Confirmation

Destructive actions (delete, remove, cancel subscription) must never execute immediately. Always require confirmation via modal or provide an undo window.

```tsx
// Destructive action with confirmation dialog
function DeleteButton({ itemName, onConfirm }: DeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setShowConfirm(true)} className="btn-danger">
        Delete {itemName}
      </button>

      {showConfirm && (
        <dialog open role="alertdialog" aria-labelledby="confirm-title" aria-describedby="confirm-desc">
          <h2 id="confirm-title">Delete {itemName}?</h2>
          <p id="confirm-desc">This action cannot be undone.</p>
          <div className="dialog-actions">
            <button type="button" onClick={() => setShowConfirm(false)}>Cancel</button>
            <button type="button" onClick={onConfirm} className="btn-danger">Delete</button>
          </div>
        </dialog>
      )}
    </>
  );
}
```

---

## Focus Management Patterns

| Scenario | Initial Focus |
|----------|---------------|
| Simple modal | Close button or first interactive element |
| Form modal | First form field |
| Confirmation dialog | Cancel button (safer default) |
| Read-only content | Modal container itself |
| Error/alert | Primary action button |

---

## Testing Guidance

### Manual Testing

1. **Focus on open**: Verify focus moves into modal
2. **Tab trap**: Tab should cycle within modal only
3. **Escape key**: Modal closes on Escape
4. **Return focus**: Focus returns to trigger after close
5. **Screen reader**: Announce modal opening and title
6. **Background interaction**: Cannot interact with content behind modal

### Automated Testing

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('modal traps focus', async () => {
  const user = userEvent.setup();
  render(<ModalDemo />);

  // Open modal
  await user.click(screen.getByRole('button', { name: /open modal/i }));

  // Verify focus is in modal
  const modal = screen.getByRole('dialog');
  expect(modal).toContainElement(document.activeElement);

  // Tab through all focusable elements
  await user.tab();
  expect(modal).toContainElement(document.activeElement);

  await user.tab();
  expect(modal).toContainElement(document.activeElement);
});

test('modal closes on Escape', async () => {
  const user = userEvent.setup();
  const onClose = jest.fn();
  render(<Modal isOpen onClose={onClose} title="Test" />);

  await user.keyboard('{Escape}');
  expect(onClose).toHaveBeenCalled();
});

test('focus returns to trigger on close', async () => {
  const user = userEvent.setup();
  render(<ModalDemo />);

  const openButton = screen.getByRole('button', { name: /open modal/i });
  await user.click(openButton);

  await user.click(screen.getByRole('button', { name: /close/i }));

  await waitFor(() => {
    expect(openButton).toHaveFocus();
  });
});

test('modal has correct ARIA attributes', () => {
  render(<Modal isOpen onClose={() => {}} title="Settings" />);

  const modal = screen.getByRole('dialog');
  expect(modal).toHaveAttribute('aria-modal', 'true');
  expect(modal).toHaveAttribute('aria-labelledby');
});
```

---

## WCAG Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships) | A | Dialog role and relationships conveyed |
| [2.1.2 No Keyboard Trap](https://www.w3.org/WAI/WCAG21/Understanding/no-keyboard-trap) | A | User can navigate out (via close mechanism) |
| [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG21/Understanding/focus-order) | A | Focus moves logically into and within modal |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value) | A | Dialog has accessible name and role |
