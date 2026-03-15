# Form Safety

## Impact: HIGH (Data Protection)

Forms are the gateway between users and their data. When forms block paste, fail to warn about unsaved changes, or allow destructive actions without confirmation, users lose data, lose trust, and lose time. Password managers depend on paste to fill credentials securely. Users drafting long responses expect protection from accidental navigation. And irreversible deletions without confirmation violate the principle of user control. These are not edge cases -- they affect every user on every form interaction.

---

## Requirements Summary

| Requirement | Description |
|-------------|-------------|
| Never block paste | Do not use `onPaste` + `preventDefault` on any input field |
| Warn on unsaved changes | Use `beforeunload` or a router guard to prompt before navigating away |
| Confirm destructive actions | Require explicit confirmation before delete, remove, or irreversible operations |

---

## Code Examples

### Never Block Paste

#### Incorrect

```html
<!-- Blocking paste on a password confirmation field -->
<label for="confirm-email">Confirm Email</label>
<input
  type="email"
  id="confirm-email"
  onpaste="return false;"
/>

<label for="confirm-password">Confirm Password</label>
<input
  type="password"
  id="confirm-password"
  onpaste="event.preventDefault();"
/>
```

```tsx
// React: blocking paste forces manual typing, which is LESS secure
const ConfirmEmailField = () => {
  return (
    <div>
      <label htmlFor="confirm-email">Confirm Email</label>
      <input
        type="email"
        id="confirm-email"
        onPaste={(e) => {
          e.preventDefault(); // BAD: blocks password managers and assistive tools
          alert("Please type your email manually.");
        }}
      />
    </div>
  );
};
```

#### Correct

```html
<!-- Allow paste on all inputs without restriction -->
<label for="confirm-email">Confirm Email</label>
<input
  type="email"
  id="confirm-email"
  autocomplete="email"
/>

<label for="confirm-password">Confirm Password</label>
<input
  type="password"
  id="confirm-password"
  autocomplete="new-password"
/>
```

```tsx
// React: never intercept paste -- validate on submit instead
const ConfirmEmailField = () => {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (email !== confirmEmail) {
      setError("Email addresses do not match.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="confirm-email">Confirm Email</label>
        <input
          type="email"
          id="confirm-email"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          autoComplete="email"
          aria-describedby={error ? "email-match-error" : undefined}
          aria-invalid={error ? "true" : undefined}
        />
        {error && (
          <p id="email-match-error" role="alert">
            {error}
          </p>
        )}
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};
```

### Warn on Unsaved Changes

#### Incorrect

```html
<!-- No protection: navigating away silently discards draft data -->
<form id="profile-form">
  <label for="bio">Bio</label>
  <textarea id="bio" name="bio" rows="6"></textarea>
  <button type="submit">Save</button>
</form>
<!-- User closes tab or clicks a link and loses everything -->
```

```tsx
// React: no guard against accidental navigation
const ProfileForm = () => {
  const [bio, setBio] = useState("");

  return (
    <form>
      <label htmlFor="bio">Bio</label>
      <textarea
        id="bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={6}
      />
      <button type="submit">Save</button>
      {/* No unsaved changes warning */}
    </form>
  );
};
```

#### Correct

```html
<!-- Warn before unload when form has unsaved data -->
<form id="profile-form">
  <label for="bio">Bio</label>
  <textarea id="bio" name="bio" rows="6"></textarea>
  <button type="submit">Save</button>
</form>

<script>
  const form = document.getElementById("profile-form");
  let isDirty = false;

  form.addEventListener("input", () => {
    isDirty = true;
  });

  form.addEventListener("submit", () => {
    isDirty = false;
  });

  window.addEventListener("beforeunload", (e) => {
    if (isDirty) {
      e.preventDefault();
      // Modern browsers display a generic message; setting returnValue is required
      e.returnValue = "";
    }
  });
</script>
```

```tsx
// React: useEffect hook to guard unsaved changes + router guard
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

function useUnsavedChangesWarning(isDirty: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);
}

const ProfileForm = () => {
  const [bio, setBio] = useState("");
  const [savedBio, setSavedBio] = useState("");
  const isDirty = bio !== savedBio;

  useUnsavedChangesWarning(isDirty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveBio(bio);
    setSavedBio(bio);
  };

  return (
    <form onSubmit={handleSubmit}>
      {isDirty && (
        <p role="status" aria-live="polite" className="unsaved-notice">
          You have unsaved changes.
        </p>
      )}

      <label htmlFor="bio">Bio</label>
      <textarea
        id="bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={6}
      />

      <button type="submit" disabled={!isDirty}>
        Save
      </button>
    </form>
  );
};
```

### Confirm Destructive Actions

#### Incorrect

```html
<!-- Immediate deletion with no confirmation -->
<ul id="item-list">
  <li>
    Project Alpha
    <button onclick="deleteItem('alpha')">Delete</button>
  </li>
  <li>
    Project Beta
    <button onclick="deleteItem('beta')">Delete</button>
  </li>
</ul>

<script>
  async function deleteItem(id) {
    // Deletes immediately with no way to undo or cancel
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    location.reload();
  }
</script>
```

```tsx
// React: one-click permanent deletion with no confirmation
const ProjectList = ({ projects }: { projects: Project[] }) => {
  const handleDelete = async (id: string) => {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    // Gone forever, no confirmation, no undo
    window.location.reload();
  };

  return (
    <ul>
      {projects.map((p) => (
        <li key={p.id}>
          {p.name}
          <button onClick={() => handleDelete(p.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
};
```

#### Correct

```html
<!-- Confirmation dialog before deletion -->
<ul id="item-list">
  <li>
    Project Alpha
    <button onclick="confirmDelete('alpha', 'Project Alpha')">
      Delete
    </button>
  </li>
</ul>

<dialog id="confirm-dialog" aria-labelledby="confirm-title" aria-describedby="confirm-desc">
  <h2 id="confirm-title">Confirm Deletion</h2>
  <p id="confirm-desc"></p>
  <div>
    <button id="confirm-cancel" autofocus>Cancel</button>
    <button id="confirm-proceed" class="destructive">Delete Permanently</button>
  </div>
</dialog>

<script>
  const dialog = document.getElementById("confirm-dialog");
  let pendingDeleteId = null;

  function confirmDelete(id, name) {
    pendingDeleteId = id;
    document.getElementById("confirm-desc").textContent =
      `Are you sure you want to delete "${name}"? This action cannot be undone.`;
    dialog.showModal();
  }

  document.getElementById("confirm-cancel").addEventListener("click", () => {
    pendingDeleteId = null;
    dialog.close();
  });

  document.getElementById("confirm-proceed").addEventListener("click", async () => {
    if (pendingDeleteId) {
      await fetch(`/api/items/${pendingDeleteId}`, { method: "DELETE" });
      pendingDeleteId = null;
      dialog.close();
      location.reload();
    }
  });
</script>
```

```tsx
// React: confirmation dialog with clear action labels
import { useState, useRef, useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      <h2 id="confirm-title">{title}</h2>
      <p id="confirm-desc">{description}</p>
      <div className="dialog-actions">
        <button ref={cancelRef} onClick={onCancel}>
          Cancel
        </button>
        <button onClick={onConfirm} className="destructive">
          {confirmLabel}
        </button>
      </div>
    </div>
  );
};

const ProjectList = ({ projects }: { projects: Project[] }) => {
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/projects/${deleteTarget.id}`, { method: "DELETE" });
    setDeleteTarget(null);
  };

  return (
    <>
      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            {p.name}
            <button onClick={() => setDeleteTarget(p)}>Delete</button>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};
```

---

## Testing Guidance

### Manual Testing

1. **Paste test**: On every input field (especially password, email confirmation, and code fields), paste content from clipboard and verify it is accepted without interference.
2. **Unsaved changes test**: Modify a form field, then attempt to close the tab or navigate away. Confirm the browser displays a warning dialog.
3. **Destructive action test**: Click a delete or remove button and verify a confirmation dialog appears with clear labels describing the action and its consequences.
4. **Cancel test**: In the confirmation dialog, click Cancel and verify the destructive action was not performed and the original data is intact.

### Automated Testing

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Verify paste is never blocked
test("email input accepts pasted content", async () => {
  const user = userEvent.setup();
  render(<ConfirmEmailField />);

  const input = screen.getByLabelText(/confirm email/i);
  await user.click(input);
  await user.paste("user@example.com");

  expect(input).toHaveValue("user@example.com");
});

// Verify destructive actions require confirmation
test("delete button opens confirmation dialog before deleting", async () => {
  const user = userEvent.setup();
  render(<ProjectList projects={[{ id: "1", name: "My Project" }]} />);

  await user.click(screen.getByRole("button", { name: /delete/i }));

  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /delete permanently/i })
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
});

// Verify cancel aborts the destructive action
test("cancel button in confirmation dialog prevents deletion", async () => {
  const user = userEvent.setup();
  const fetchSpy = jest.spyOn(global, "fetch");
  render(<ProjectList projects={[{ id: "1", name: "My Project" }]} />);

  await user.click(screen.getByRole("button", { name: /delete/i }));
  await user.click(screen.getByRole("button", { name: /cancel/i }));

  expect(fetchSpy).not.toHaveBeenCalled();
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
});

// Verify beforeunload fires when form is dirty
test("warns before unload when form has unsaved changes", () => {
  render(<ProfileForm />);

  const textarea = screen.getByLabelText(/bio/i);
  fireEvent.change(textarea, { target: { value: "New bio text" } });

  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);

  expect(event.defaultPrevented).toBe(true);
});
```

---

## Common Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| `onPaste={(e) => e.preventDefault()}` | Blocks password managers, assistive tools, and users who copy-paste credentials | Remove the paste handler entirely; validate on submit instead |
| No `beforeunload` listener on forms | Users lose long-form input when accidentally closing tabs or navigating away | Add a `beforeunload` guard that fires when form state is dirty |
| Single-click delete with no confirmation | Users permanently lose data from a misclick or accidental tap | Show a confirmation dialog with descriptive action labels before executing |
| Confirmation dialog with "OK" / "Cancel" labels | Ambiguous labels force users to re-read the dialog to understand what each button does | Use specific labels like "Delete Permanently" and "Cancel" that describe the outcome |
| `window.confirm()` for destructive actions | Cannot be styled, is not accessible, and provides no contextual detail | Use a custom `<dialog>` or `role="alertdialog"` element with proper ARIA attributes |
| Disabling paste only on confirmation fields | Creates false sense of security while punishing legitimate users | Trust the user; compare field values on submission rather than restricting input |
