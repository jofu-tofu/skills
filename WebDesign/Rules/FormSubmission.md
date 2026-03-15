# Form Submission

## Impact: HIGH (Form Usability)

Forms that lack proper submission handling frustrate users and create real problems: duplicate orders, lost data, and confusion about whether an action succeeded. When a user clicks "Submit" and nothing visibly happens, they click again -- and again. Without loading indicators, disabled states, and clear feedback, users have no way to know the current state of their request. Screen reader users are especially affected because they cannot see visual spinners or color changes; they rely entirely on programmatic status announcements. Proper form submission UX is not optional polish -- it is a core usability and accessibility requirement that directly impacts trust, task completion rates, and data integrity.

---

## Requirements Summary

| Aspect | Requirement |
|--------|-------------|
| Button state | Disable submit button once async request starts; re-enable on completion or error |
| Loading indicator | Show inline spinner within the button text area during submission |
| Double-submit guard | Prevent duplicate submissions via form state management, not just button disable |
| Success feedback | Display a visible success message and announce it to assistive technology via `role="status"` |
| Error feedback | Show actionable error message with retry option; announce via `role="alert"` |
| Focus management | Move focus to the success or error message after submission completes |

---

## Code Examples

### Button State During Submission

#### Incorrect

```html
<!-- Button stays enabled during request -- user can click multiple times -->
<form id="payment-form">
  <button type="submit">Pay Now</button>
</form>

<script>
  document.getElementById('payment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    // No loading state, no disable -- user can double-submit
    fetch('/api/pay', { method: 'POST', body: new FormData(e.target) });
  });
</script>
```

```tsx
// React form with no submission state management
const CheckoutForm = () => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // No loading state, no guard against double-submit
    await fetch('/api/checkout', { method: 'POST' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Place Order</button>
    </form>
  );
};
```

#### Correct

```html
<!-- Button disables and shows spinner during submission -->
<form id="payment-form">
  <button type="submit" id="pay-btn">
    <span class="btn-label">Pay Now</span>
    <span class="btn-spinner hidden" aria-hidden="true">
      <svg class="spinner-icon" viewBox="0 0 24 24"><!-- spinner SVG --></svg>
    </span>
  </button>
  <div id="form-status" role="status" aria-live="polite"></div>
</form>

<script>
  const form = document.getElementById('payment-form');
  const btn = document.getElementById('pay-btn');
  let isSubmitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    isSubmitting = true;
    btn.disabled = true;
    btn.querySelector('.btn-label').textContent = 'Processing...';
    btn.querySelector('.btn-spinner').classList.remove('hidden');

    try {
      await fetch('/api/pay', { method: 'POST', body: new FormData(form) });
      document.getElementById('form-status').textContent = 'Payment successful!';
    } catch {
      btn.disabled = false;
      document.getElementById('form-status').textContent = 'Payment failed. Please try again.';
    } finally {
      btn.querySelector('.btn-label').textContent = 'Pay Now';
      btn.querySelector('.btn-spinner').classList.add('hidden');
      isSubmitting = false;
    }
  });
</script>
```

```tsx
// React form with proper submission state management
const CheckoutForm = () => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');

    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      if (!res.ok) throw new Error('Request failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ...form fields... */}

      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? (
          <>
            <Spinner aria-hidden="true" className="inline-spinner" />
            Processing...
          </>
        ) : (
          'Place Order'
        )}
      </button>

      {status === 'success' && (
        <p role="status" className="success-message">
          Order placed successfully!
        </p>
      )}

      {status === 'error' && (
        <p role="alert" className="error-message">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
};
```

### Preventing Double-Submit via State Guard

#### Incorrect

```html
<!-- Only relies on button disable, no programmatic guard -->
<form>
  <button type="submit" onclick="this.disabled = true; this.form.submit();">
    Submit
  </button>
</form>
```

```tsx
// Disabling button alone is not enough -- rapid clicks before re-render can still fire
const BrokenForm = () => {
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisabled(true); // State update is async -- does not block immediate re-click
    await fetch('/api/submit', { method: 'POST' });
    setDisabled(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={disabled}>Submit</button>
    </form>
  );
};
```

#### Correct

```html
<!-- AbortController + state flag for robust double-submit prevention -->
<form id="contact-form">
  <button type="submit">Send Message</button>
  <div role="status" aria-live="polite" id="contact-status"></div>
</form>

<script>
  let controller = null;

  document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (controller) return; // Guard: ignore if already in-flight

    controller = new AbortController();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
      await fetch('/api/contact', {
        method: 'POST',
        body: new FormData(e.target),
        signal: controller.signal,
      });
      document.getElementById('contact-status').textContent = 'Message sent!';
    } catch (err) {
      if (err.name !== 'AbortError') {
        document.getElementById('contact-status').textContent = 'Failed to send. Please retry.';
      }
    } finally {
      controller = null;
      btn.disabled = false;
      btn.textContent = 'Send Message';
    }
  });
</script>
```

```tsx
// useRef guard prevents race conditions that useState alone cannot
const ContactForm = () => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const submittingRef = useRef(false);
  const statusRef = useRef<HTMLParagraphElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return; // Synchronous guard
    submittingRef.current = true;
    setStatus('submitting');

    try {
      const res = await fetch('/api/contact', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      submittingRef.current = false;
    }
  };

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      statusRef.current?.focus();
    }
  }, [status]);

  return (
    <form onSubmit={handleSubmit}>
      {/* ...form fields... */}

      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? (
          <>
            <Spinner aria-hidden="true" className="inline-spinner" />
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </button>

      {status === 'success' && (
        <p ref={statusRef} role="status" tabIndex={-1} className="success-message">
          Message sent successfully!
        </p>
      )}

      {status === 'error' && (
        <p ref={statusRef} role="alert" tabIndex={-1} className="error-message">
          Failed to send message.
          <button type="button" onClick={() => setStatus('idle')}>
            Try Again
          </button>
        </p>
      )}
    </form>
  );
};
```

---

## Testing Guidance

### Manual Testing

1. **Double-click test**: Rapidly click the submit button multiple times -- only one request should fire (verify in browser DevTools Network tab)
2. **Loading state**: Confirm the button text changes and a spinner appears immediately after clicking submit
3. **Button disable**: Verify the button is not clickable during submission
4. **Success announcement**: With a screen reader active (NVDA, VoiceOver), submit a valid form and confirm the success message is announced
5. **Error announcement**: Force a server error and confirm the error message is announced and actionable
6. **Focus management**: After submission completes, verify focus moves to the status message

### Automated Testing

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('disables submit button during submission', async () => {
  const user = userEvent.setup();
  render(<ContactForm />);

  const submitBtn = screen.getByRole('button', { name: /send message/i });
  await user.click(submitBtn);

  expect(submitBtn).toBeDisabled();
  expect(submitBtn).toHaveTextContent(/sending/i);
});

test('shows inline spinner during submission', async () => {
  const user = userEvent.setup();
  render(<ContactForm />);

  await user.click(screen.getByRole('button', { name: /send message/i }));

  const spinner = document.querySelector('.inline-spinner');
  expect(spinner).toBeInTheDocument();
  expect(spinner).toHaveAttribute('aria-hidden', 'true');
});

test('prevents duplicate submissions on rapid clicks', async () => {
  const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(new Response());
  const user = userEvent.setup();
  render(<ContactForm />);

  const submitBtn = screen.getByRole('button', { name: /send message/i });
  await user.click(submitBtn);
  await user.click(submitBtn);
  await user.click(submitBtn);

  expect(fetchSpy).toHaveBeenCalledTimes(1);
  fetchSpy.mockRestore();
});

test('displays accessible success message after submission', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue(new Response(null, { status: 200 }));
  const user = userEvent.setup();
  render(<ContactForm />);

  await user.click(screen.getByRole('button', { name: /send message/i }));

  const successMsg = await screen.findByRole('status');
  expect(successMsg).toHaveTextContent(/sent successfully/i);
  expect(successMsg).toHaveFocus();
});

test('displays accessible error message with retry on failure', async () => {
  jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
  const user = userEvent.setup();
  render(<ContactForm />);

  await user.click(screen.getByRole('button', { name: /send message/i }));

  const errorMsg = await screen.findByRole('alert');
  expect(errorMsg).toHaveTextContent(/failed/i);
  expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
});

test('re-enables submit button after error', async () => {
  jest.spyOn(global, 'fetch').mockRejectedValue(new Error('fail'));
  const user = userEvent.setup();
  render(<ContactForm />);

  const submitBtn = screen.getByRole('button', { name: /send message/i });
  await user.click(submitBtn);

  await waitFor(() => {
    expect(submitBtn).not.toBeDisabled();
  });
});
```

---

## WCAG Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages) | AA | Success and error messages conveyed to assistive technology without receiving focus (use `role="status"` or `role="alert"`) |
| [3.3.4 Error Prevention (Legal, Financial, Data)](https://www.w3.org/WAI/WCAG21/Understanding/error-prevention-legal-financial-data) | AA | Submissions are reversible, checked, or confirmed before processing |
| [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG21/Understanding/error-identification) | A | Errors are automatically detected and described to the user in text |
| [3.3.3 Error Suggestion](https://www.w3.org/WAI/WCAG21/Understanding/error-suggestion) | AA | Suggestions for correcting input errors are provided when known |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard) | A | All form submission functionality is operable via keyboard |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value) | A | Button states (disabled, loading) are programmatically determinable |
