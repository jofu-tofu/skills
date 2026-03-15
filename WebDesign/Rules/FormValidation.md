# FormValidation

## Impact: HIGH (Form Usability)

Form validation is one of the most critical touchpoints in any web application. When validation feedback is unclear, delayed, or disconnected from the fields it describes, users abandon forms at significantly higher rates. Inline error messages that appear next to the relevant field, automatic focus management on submission errors, and descriptive fix suggestions all reduce friction and prevent user frustration. Placeholder text misused as labels creates an additional barrier: once a user begins typing, the "label" vanishes, leaving them unable to verify what the field expects. Proper validation patterns benefit all users, including those relying on assistive technology, those with cognitive disabilities, and those on mobile devices with limited screen space.

---

## Requirements Summary

| Element | Requirement |
|---------|-------------|
| Error placement | Display errors inline, adjacent to the field they describe |
| Focus on submit | On failed submission, move focus to the first field with an error |
| Placeholder text | Never use placeholders as labels; placeholders demonstrate format and end with an ellipsis |
| Error content | Error messages must describe what is wrong AND suggest how to fix it |
| Error association | Errors must be programmatically linked to inputs via `aria-describedby` |
| Live announcements | Error messages should use `role="alert"` so screen readers announce them |

---

## Code Examples

### Inline Error Placement

#### Incorrect

```html
<!-- All errors dumped in a summary banner, far from the fields -->
<div class="error-banner" role="alert">
  <p>Please fix the following errors:</p>
  <ul>
    <li>Email is invalid</li>
    <li>Password is too short</li>
  </ul>
</div>

<label for="email">Email</label>
<input type="email" id="email" />

<label for="password">Password</label>
<input type="password" id="password" />
```

```tsx
// React: errors shown only in a top-level banner
const SignupForm = ({ errors }: { errors: string[] }) => (
  <form>
    {errors.length > 0 && (
      <div className="error-banner">
        {errors.map((e) => (
          <p key={e}>{e}</p>
        ))}
      </div>
    )}

    <label htmlFor="email">Email</label>
    <input type="email" id="email" />

    <label htmlFor="password">Password</label>
    <input type="password" id="password" />

    <button type="submit">Sign Up</button>
  </form>
);
```

#### Correct

```html
<!-- Errors displayed inline, adjacent to the field they describe -->
<div class="form-field">
  <label for="email">Email</label>
  <input
    type="email"
    id="email"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <p id="email-error" class="field-error" role="alert">
    Please enter a valid email address (e.g., name@example.com)
  </p>
</div>

<div class="form-field">
  <label for="password">Password</label>
  <input
    type="password"
    id="password"
    aria-invalid="true"
    aria-describedby="password-error"
  />
  <p id="password-error" class="field-error" role="alert">
    Password must be at least 8 characters. Try adding a number or symbol.
  </p>
</div>
```

```tsx
// React: inline errors next to each field with aria association
interface FieldError {
  field: string;
  message: string;
}

const InlineErrorField = ({
  id,
  label,
  type = 'text',
  error,
}: {
  id: string;
  label: string;
  type?: string;
  error?: string;
}) => (
  <div className="form-field">
    <label htmlFor={id}>{label}</label>
    <input
      type={type}
      id={id}
      name={id}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={error ? `${id}-error` : undefined}
    />
    {error && (
      <p id={`${id}-error`} className="field-error" role="alert">
        {error}
      </p>
    )}
  </div>
);
```

### Focus First Error on Submit

#### Incorrect

```html
<!-- Form submission scrolls to top with a generic message, no focus management -->
<form onsubmit="showBanner(); return false;">
  <div id="banner" class="hidden">Something went wrong. Check the form.</div>

  <label for="name">Name</label>
  <input type="text" id="name" required />

  <label for="email">Email</label>
  <input type="email" id="email" required />

  <button type="submit">Submit</button>
</form>
```

```tsx
// React: no focus management on submission errors
const ContactForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    // No focus management — user must scroll and hunt for errors
  };

  return (
    <form onSubmit={handleSubmit}>
      <InlineErrorField id="name" label="Name" error={errors.name} />
      <InlineErrorField id="email" label="Email" error={errors.email} />
      <button type="submit">Submit</button>
    </form>
  );
};
```

#### Correct

```html
<!-- On submit, focus is moved to the first errored field -->
<form id="contact-form" novalidate>
  <div class="form-field">
    <label for="name">Name</label>
    <input type="text" id="name" required aria-invalid="true" aria-describedby="name-error" />
    <p id="name-error" class="field-error" role="alert">
      Please enter your full name (e.g., Jane Smith)
    </p>
  </div>

  <div class="form-field">
    <label for="email">Email</label>
    <input type="email" id="email" required />
  </div>

  <button type="submit">Submit</button>
</form>

<script>
  document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const firstInvalid = e.target.querySelector('[aria-invalid="true"]');
    if (firstInvalid) {
      firstInvalid.focus();
    }
  });
</script>
```

```tsx
// React: focus the first errored field after failed submission
import { useRef } from 'react';

const ContactForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const validate = (data: FormData): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!data.get('name')) {
      errs.name = 'Please enter your full name (e.g., Jane Smith)';
    }
    if (!data.get('email') || !String(data.get('email')).includes('@')) {
      errs.email =
        'Please enter a valid email address (e.g., name@example.com)';
    }
    return errs;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const newErrors = validate(data);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Focus the first field that has an error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = formRef.current?.querySelector<HTMLInputElement>(
        `#${firstErrorField}`
      );
      element?.focus();
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <InlineErrorField id="name" label="Name" error={errors.name} />
      <InlineErrorField
        id="email"
        label="Email"
        type="email"
        error={errors.email}
      />
      <button type="submit">Submit</button>
    </form>
  );
};
```

### Placeholder Text Usage

#### Incorrect

```html
<!-- Placeholders used as labels — labels disappear when user types -->
<input type="text" placeholder="Full Name" />
<input type="email" placeholder="Email Address" />
<input type="tel" placeholder="Phone Number" />
```

```tsx
// React: placeholders replacing labels entirely
const PaymentForm = () => (
  <form>
    <input type="text" placeholder="Cardholder Name" />
    <input type="text" placeholder="Card Number" />
    <input type="text" placeholder="MM/YY" />
    <input type="text" placeholder="CVC" />
    <button type="submit">Pay</button>
  </form>
);
```

#### Correct

```html
<!-- Visible labels with placeholders that demonstrate format -->
<div class="form-field">
  <label for="fullname">Full Name</label>
  <input type="text" id="fullname" placeholder="e.g., Jane Smith..." />
</div>

<div class="form-field">
  <label for="email">Email Address</label>
  <input type="email" id="email" placeholder="e.g., name@example.com..." />
</div>

<div class="form-field">
  <label for="phone">Phone Number</label>
  <input type="tel" id="phone" placeholder="e.g., (555) 123-4567..." />
</div>
```

```tsx
// React: visible labels + format-hint placeholders
const PaymentForm = () => (
  <form>
    <div className="form-field">
      <label htmlFor="cardholder">Cardholder Name</label>
      <input
        type="text"
        id="cardholder"
        name="cardholder"
        placeholder="e.g., Jane Smith..."
        autoComplete="cc-name"
      />
    </div>

    <div className="form-field">
      <label htmlFor="cardnumber">Card Number</label>
      <input
        type="text"
        id="cardnumber"
        name="cardnumber"
        placeholder="e.g., 4242 4242 4242 4242..."
        autoComplete="cc-number"
        inputMode="numeric"
      />
    </div>

    <div className="form-field">
      <label htmlFor="expiry">Expiration Date</label>
      <input
        type="text"
        id="expiry"
        name="expiry"
        placeholder="MM/YY..."
        autoComplete="cc-exp"
      />
    </div>

    <div className="form-field">
      <label htmlFor="cvc">Security Code</label>
      <input
        type="text"
        id="cvc"
        name="cvc"
        placeholder="e.g., 123..."
        autoComplete="cc-csc"
        inputMode="numeric"
      />
    </div>

    <button type="submit">Pay</button>
  </form>
);
```

### Error Messages That Include a Fix

#### Incorrect

```html
<!-- Vague error messages that do not help the user -->
<p class="field-error">Invalid input</p>
<p class="field-error">Error</p>
<p class="field-error">This field is required</p>
```

```tsx
// React: generic errors with no guidance
const errors: Record<string, string> = {
  email: 'Invalid',
  password: 'Too short',
  phone: 'Wrong format',
};
```

#### Correct

```html
<!-- Descriptive errors that state the problem AND suggest a fix -->
<p id="email-error" class="field-error" role="alert">
  That email address is not valid. Please use the format name@example.com
</p>

<p id="password-error" class="field-error" role="alert">
  Password must be at least 8 characters. Try adding numbers or symbols to make it longer.
</p>

<p id="phone-error" class="field-error" role="alert">
  Phone number must be 10 digits. Please use the format (555) 123-4567
</p>
```

```tsx
// React: validation messages that describe the problem and the fix
const validate = (values: FormValues): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!values.email) {
    errors.email = 'Email is required. Please enter your email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email =
      'That email address is not valid. Please use the format name@example.com';
  }

  if (!values.password) {
    errors.password = 'Password is required. Please create a password.';
  } else if (values.password.length < 8) {
    errors.password =
      'Password must be at least 8 characters. Try adding numbers or symbols.';
  }

  if (values.phone && !/^\(\d{3}\) \d{3}-\d{4}$/.test(values.phone)) {
    errors.phone =
      'Phone number format is not recognized. Please use (555) 123-4567';
  }

  return errors;
};
```

---

## Testing Guidance

### Manual Testing

1. **Inline placement**: Submit a form with invalid fields and verify each error message appears directly next to the field it describes, not in a remote summary
2. **Focus on submit**: Submit a form with multiple errors and verify that keyboard focus moves to the first errored field automatically
3. **Placeholder vs label**: Begin typing in each field and confirm that a visible label remains; the placeholder should disappear but the label must persist
4. **Error message clarity**: Read each error message and confirm it states both what is wrong and how to fix it
5. **Screen reader flow**: Navigate the form with NVDA or VoiceOver after triggering errors; verify error messages are announced when the associated field receives focus

### Automated Testing

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

test('displays inline error next to the field, not in a summary', async () => {
  const user = userEvent.setup();
  render(<ContactForm />);

  await user.click(screen.getByRole('button', { name: /submit/i }));

  // Error should be associated with the email input via aria-describedby
  const emailInput = screen.getByLabelText(/email/i);
  expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  expect(emailInput).toHaveAccessibleDescription(/valid email/i);
});

test('focuses the first errored field on submit', async () => {
  const user = userEvent.setup();
  render(<ContactForm />);

  await user.click(screen.getByRole('button', { name: /submit/i }));

  // The first field with an error should receive focus
  const firstField = screen.getByLabelText(/name/i);
  expect(firstField).toHaveFocus();
});

test('error messages include fix suggestions', async () => {
  const user = userEvent.setup();
  render(<ContactForm />);

  const emailInput = screen.getByLabelText(/email/i);
  await user.type(emailInput, 'notanemail');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  // Error message must suggest the correct format
  expect(
    screen.getByText(/please use the format name@example\.com/i)
  ).toBeInTheDocument();
});

test('visible labels are not replaced by placeholders', () => {
  render(<ContactForm />);

  // Each field must have a visible label element
  expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

  // Placeholders should demonstrate format, not repeat the label
  const emailInput = screen.getByLabelText(/email/i);
  expect(emailInput).toHaveAttribute(
    'placeholder',
    expect.stringContaining('...')
  );
});

test('form has no accessibility violations', async () => {
  const { container } = render(<ContactForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## WCAG Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG21/Understanding/error-identification) | A | Errors are automatically detected and described to the user in text |
| [3.3.3 Error Suggestion](https://www.w3.org/WAI/WCAG21/Understanding/error-suggestion) | AA | When an error is detected, suggestions for fixing it are provided (unless it would compromise security) |
| [3.3.4 Error Prevention](https://www.w3.org/WAI/WCAG21/Understanding/error-prevention) | AA | For forms that cause legal, financial, or data consequences, submissions are reversible, verified, or confirmed |
