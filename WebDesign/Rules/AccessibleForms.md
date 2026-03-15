# Accessible Forms

## Impact: CRITICAL (Form Usability)

Forms are the primary way users interact with web applications. Inaccessible forms prevent users from completing essential tasks like signing up, making purchases, or submitting information. Screen reader users, keyboard-only users, and those with cognitive disabilities all depend on properly structured forms. Poor form accessibility directly impacts conversion rates and legal compliance.

---

## Requirements Summary

| Element | Requirement |
|---------|-------------|
| Labels | Every input needs a visible, associated label |
| Association | Use `for`/`id` or wrap input in label |
| Errors | Programmatically associated with `aria-describedby` |
| Required | Indicate visually and programmatically |
| Groups | Use `fieldset`/`legend` for related inputs |
| Instructions | Associated with inputs via `aria-describedby` |
| Position | Labels above inputs (except checkbox/radio beside) |

---

## Code Examples

### Label Association

#### Incorrect - Missing or Disconnected Labels

```html
<!-- No label at all -->
<input type="text" placeholder="Enter your name" />

<!-- Label not associated -->
<label>Email Address</label>
<input type="email" name="email" />

<!-- Placeholder as label (disappears on input) -->
<input type="text" placeholder="Username" />
```

```tsx
// React form with missing labels - INACCESSIBLE
const LoginForm = () => (
  <form>
    <input type="email" placeholder="Email" />
    <input type="password" placeholder="Password" />
    <button>Login</button>
  </form>
);
```

#### Correct - Properly Associated Labels

```html
<!-- Explicit association with for/id -->
<label for="name">Full Name</label>
<input type="text" id="name" name="name" />

<!-- Implicit association by wrapping -->
<label>
  Email Address
  <input type="email" name="email" />
</label>

<!-- Visually hidden label when design requires it -->
<label for="search" class="sr-only">Search</label>
<input type="search" id="search" placeholder="Search..." />
```

```tsx
// React form with proper labels
const LoginForm = () => (
  <form>
    <div className="form-group">
      <label htmlFor="email">Email Address</label>
      <input
        type="email"
        id="email"
        name="email"
        autoComplete="email"
      />
    </div>

    <div className="form-group">
      <label htmlFor="password">Password</label>
      <input
        type="password"
        id="password"
        name="password"
        autoComplete="current-password"
      />
    </div>

    <button type="submit">Login</button>
  </form>
);
```

### Label Positioning

Labels should be positioned **above** the input field, not to the side. Above-placement provides:
- Consistent reading order (top-to-bottom)
- Better support for long labels and translations
- Clearer association on mobile (side labels crowd narrow viewports)
- Easier scanning of form fields

#### Incorrect - Side Labels

```html
<!-- Side labels cause alignment issues and crowd mobile viewports -->
<div style="display: flex; align-items: center; gap: 1rem;">
  <label for="name" style="width: 120px;">Full Name</label>
  <input type="text" id="name" />
</div>
```

#### Correct - Labels Above Input

```html
<!-- Labels above inputs: clear, scannable, mobile-friendly -->
<div class="form-group">
  <label for="name">Full Name</label>
  <input type="text" id="name" />
</div>

<style>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
```

```tsx
// React - labels above inputs by default
const FormField = ({ label, id, ...props }: FormFieldProps) => (
  <div className="form-group">
    <label htmlFor={id}>{label}</label>
    <input id={id} {...props} />
  </div>
);
```

**Exception:** Checkbox and radio labels should be positioned **beside** (after) the control, since the control is small and the label serves as the click target.

---

### Required Field Indication

#### Incorrect - Asterisk Only

```html
<!-- Asterisk without explanation -->
<label for="email">Email *</label>
<input type="email" id="email" />
```

#### Correct - Multiple Indicators for Required Fields

```html
<form>
  <p class="required-note">
    <span aria-hidden="true">*</span> indicates required field
  </p>

  <div class="form-group">
    <label for="email">
      Email Address
      <span class="required" aria-hidden="true">*</span>
      <span class="sr-only">(required)</span>
    </label>
    <input
      type="email"
      id="email"
      name="email"
      required
      aria-required="true"
    />
  </div>
</form>
```

```tsx
// React required field component
interface FormFieldProps {
  label: string;
  required?: boolean;
  id: string;
  type?: string;
  error?: string;
  hint?: string;
}

const FormField = ({
  label,
  required,
  id,
  type = 'text',
  error,
  hint
}: FormFieldProps) => {
  const describedBy = [
    hint && `${id}-hint`,
    error && `${id}-error`
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="required-marker">*</span>
            <span className="sr-only">(required)</span>
          </>
        )}
      </label>

      {hint && (
        <p id={`${id}-hint`} className="hint">
          {hint}
        </p>
      )}

      <input
        type={type}
        id={id}
        name={id}
        required={required}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
      />

      {error && (
        <p id={`${id}-error`} className="error" role="alert">
          <ErrorIcon aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
};
```

### Error Messages

#### Incorrect - Generic or Disconnected Errors

```html
<!-- Error not associated with input -->
<input type="email" id="email" class="error" />
<span class="error-text">Invalid input</span>

<!-- Alert without context -->
<div role="alert">Please fix the errors below</div>
```

#### Correct - Programmatically Associated Errors

```html
<div class="form-group">
  <label for="email">Email Address</label>
  <input
    type="email"
    id="email"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <p id="email-error" class="error-message" role="alert">
    <svg aria-hidden="true" class="error-icon"><!-- icon --></svg>
    Please enter a valid email address (e.g., name@example.com)
  </p>
</div>
```

```tsx
// Real-time validation with accessible announcements
const EmailField = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const validate = (value: string) => {
    if (!value) return 'Email is required';
    if (!value.includes('@')) return 'Please enter a valid email address';
    return '';
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validate(email));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (touched) {
      setError(validate(value));
    }
  };

  return (
    <div className="form-field">
      <label htmlFor="email">Email Address</label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-invalid={touched && error ? 'true' : 'false'}
        aria-describedby={error ? 'email-error' : undefined}
      />
      {touched && error && (
        <p id="email-error" className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
```

### Fieldset and Legend for Groups

#### Incorrect - Ungrouped Related Inputs

```html
<!-- Radio buttons without grouping -->
<p>Preferred contact method:</p>
<input type="radio" name="contact" id="email-opt" />
<label for="email-opt">Email</label>
<input type="radio" name="contact" id="phone-opt" />
<label for="phone-opt">Phone</label>
```

#### Correct - Fieldset with Legend

```html
<fieldset>
  <legend>Preferred contact method</legend>

  <div class="radio-group">
    <input type="radio" name="contact" id="email-opt" value="email" />
    <label for="email-opt">Email</label>
  </div>

  <div class="radio-group">
    <input type="radio" name="contact" id="phone-opt" value="phone" />
    <label for="phone-opt">Phone</label>
  </div>

  <div class="radio-group">
    <input type="radio" name="contact" id="mail-opt" value="mail" />
    <label for="mail-opt">Mail</label>
  </div>
</fieldset>
```

```tsx
// React radio group component
interface RadioGroupProps {
  legend: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const RadioGroup = ({
  legend,
  name,
  options,
  value,
  onChange,
  required
}: RadioGroupProps) => (
  <fieldset>
    <legend>
      {legend}
      {required && <span className="sr-only">(required)</span>}
    </legend>

    {options.map((option) => (
      <div key={option.value} className="radio-option">
        <input
          type="radio"
          id={`${name}-${option.value}`}
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
        <label htmlFor={`${name}-${option.value}`}>
          {option.label}
        </label>
      </div>
    ))}
  </fieldset>
);
```

### Complete Accessible Form

```tsx
const RegistrationForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <form aria-labelledby="form-title" noValidate onSubmit={handleSubmit}>
      <h1 id="form-title">Create Account</h1>

      <p className="required-note">
        Fields marked with <span aria-hidden="true">*</span> are required
      </p>

      <FormField
        label="Full Name"
        id="fullname"
        required
        error={errors.fullname}
        autoComplete="name"
      />

      <FormField
        label="Email Address"
        id="email"
        type="email"
        required
        error={errors.email}
        hint="We'll never share your email"
        autoComplete="email"
      />

      <FormField
        label="Password"
        id="password"
        type="password"
        required
        error={errors.password}
        hint="Minimum 8 characters with at least one number"
        autoComplete="new-password"
      />

      <RadioGroup
        legend="Account Type"
        name="accountType"
        required
        options={[
          { value: 'personal', label: 'Personal' },
          { value: 'business', label: 'Business' }
        ]}
      />

      <button type="submit">Create Account</button>
    </form>
  );
};
```

---

## Testing Guidance

### Manual Testing

1. **Label click**: Click labels - focus should move to associated input
2. **Screen reader**: Navigate form with NVDA/VoiceOver, verify all labels announced
3. **Error flow**: Submit invalid form, verify errors are announced
4. **Keyboard only**: Complete form using only Tab, Enter, Space

### Automated Testing

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

test('form fields have accessible labels', () => {
  render(<RegistrationForm />);

  expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});

test('error messages are associated with inputs', async () => {
  const user = userEvent.setup();
  render(<RegistrationForm />);

  await user.click(screen.getByRole('button', { name: /submit/i }));

  const emailInput = screen.getByLabelText(/email/i);
  expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  expect(emailInput).toHaveAccessibleDescription(/required/i);
});

test('form has no accessibility violations', async () => {
  const { container } = render(<RegistrationForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## WCAG Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships) | A | Form structure conveyed programmatically |
| [2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels) | AA | Labels describe topic or purpose |
| [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG21/Understanding/error-identification) | A | Errors identified and described in text |
| [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions) | A | Labels or instructions provided for input |
| [3.3.3 Error Suggestion](https://www.w3.org/WAI/WCAG21/Understanding/error-suggestion) | AA | Suggestions for fixing errors |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value) | A | All form controls have accessible names |
