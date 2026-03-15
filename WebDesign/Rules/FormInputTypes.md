# Form Input Types

## Impact: HIGH (Mobile Usability)

Choosing the correct input types, autocomplete values, and input modes directly determines the mobile experience. When a phone number field shows a full QWERTY keyboard instead of a numeric dial pad, users slow down and make more errors. When a login form lacks autocomplete attributes, password managers cannot autofill credentials, forcing manual entry on small screens. These attributes cost nothing to add but dramatically improve form completion rates, reduce input errors, and ensure that assistive technologies can identify the purpose of each field for users with cognitive or motor disabilities.

---

## Requirements Summary

| Attribute | Values | Use Case |
|-----------|--------|----------|
| `autocomplete="name"` | `name`, `given-name`, `family-name` | Full name and name parts |
| `autocomplete="email"` | `email` | Email address fields |
| `autocomplete="tel"` | `tel`, `tel-national` | Phone number fields |
| `autocomplete="street-address"` | `street-address`, `address-line1`, `address-line2` | Mailing/billing address |
| `autocomplete="current-password"` | `current-password` | Login password fields |
| `autocomplete="new-password"` | `new-password` | Registration/change password fields |
| `autocomplete="one-time-code"` | `one-time-code` | OTP / verification codes |
| `autocomplete="off"` | `off` | Genuinely one-time fields only (e.g., CAPTCHA) |
| `inputMode="numeric"` | `numeric` | Numeric-only input (PINs, quantities) |
| `inputMode="tel"` | `tel` | Phone numbers (shows dial pad) |
| `inputMode="email"` | `email` | Email addresses (shows @ key) |
| `inputMode="url"` | `url` | URLs (shows / and .com keys) |
| `spellCheck={false}` | `false` | Emails, codes, usernames, URLs |
| `type="email"` | `email` | Email address with native validation |
| `type="tel"` | `tel` | Phone number input |
| `type="url"` | `url` | URL input with native validation |
| `type="number"` | `number` | Numeric values with stepper controls |

---

## Code Examples

### Autocomplete Attributes

#### Incorrect

```html
<!-- No autocomplete — password managers cannot autofill -->
<form>
  <label for="email">Email</label>
  <input type="text" id="email" name="email" />

  <label for="pw">Password</label>
  <input type="password" id="pw" name="pw" />
</form>
```

```tsx
// React login form without autocomplete — POOR UX
const LoginForm = () => (
  <form>
    <label htmlFor="user-email">Email</label>
    <input type="text" id="user-email" name="email" />

    <label htmlFor="user-pass">Password</label>
    <input type="password" id="user-pass" name="password" />

    <button type="submit">Sign In</button>
  </form>
);
```

#### Correct

```html
<!-- Correct autocomplete values enable browser and password manager autofill -->
<form>
  <label for="email">Email</label>
  <input
    type="email"
    id="email"
    name="email"
    autocomplete="email"
  />

  <label for="pw">Password</label>
  <input
    type="password"
    id="pw"
    name="pw"
    autocomplete="current-password"
  />
</form>
```

```tsx
// React login form with proper autocomplete
const LoginForm = () => (
  <form>
    <label htmlFor="user-email">Email</label>
    <input
      type="email"
      id="user-email"
      name="email"
      autoComplete="email"
      spellCheck={false}
    />

    <label htmlFor="user-pass">Password</label>
    <input
      type="password"
      id="user-pass"
      name="password"
      autoComplete="current-password"
    />

    <button type="submit">Sign In</button>
  </form>
);
```

### Input Mode for Mobile Keyboards

#### Incorrect

```html
<!-- Plain text input for a phone number — shows full QWERTY keyboard -->
<label for="phone">Phone Number</label>
<input type="text" id="phone" name="phone" />

<!-- type="number" for a verification code — adds unwanted stepper arrows -->
<label for="otp">Verification Code</label>
<input type="number" id="otp" name="otp" />
```

```tsx
// React OTP field with wrong type — POOR MOBILE UX
const OtpField = () => (
  <div>
    <label htmlFor="otp">Verification Code</label>
    <input type="number" id="otp" name="otp" />
  </div>
);
```

#### Correct

```html
<!-- inputmode="tel" shows dial pad without restricting input format -->
<label for="phone">Phone Number</label>
<input
  type="tel"
  id="phone"
  name="phone"
  inputmode="tel"
  autocomplete="tel"
/>

<!-- inputmode="numeric" for OTP — numeric keyboard, no stepper -->
<label for="otp">Verification Code</label>
<input
  type="text"
  id="otp"
  name="otp"
  inputmode="numeric"
  pattern="[0-9]*"
  autocomplete="one-time-code"
/>
```

```tsx
// React OTP field with correct inputMode and autocomplete
const OtpField = () => (
  <div>
    <label htmlFor="otp">Verification Code</label>
    <input
      type="text"
      id="otp"
      name="otp"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="one-time-code"
      spellCheck={false}
      maxLength={6}
    />
  </div>
);
```

### Spellcheck Control

#### Incorrect

```html
<!-- Default spellcheck on email — red squiggles on valid addresses -->
<label for="email">Email</label>
<input type="email" id="email" name="email" />

<!-- Spellcheck on a username field -->
<label for="username">Username</label>
<input type="text" id="username" name="username" />
```

```tsx
// React fields without spellCheck control
const ProfileForm = () => (
  <form>
    <label htmlFor="handle">Username</label>
    <input type="text" id="handle" name="handle" />

    <label htmlFor="website">Website</label>
    <input type="url" id="website" name="website" />
  </form>
);
```

#### Correct

```html
<!-- spellcheck="false" prevents red squiggles on valid non-dictionary input -->
<label for="email">Email</label>
<input type="email" id="email" name="email" spellcheck="false" />

<label for="username">Username</label>
<input type="text" id="username" name="username" spellcheck="false" />
```

```tsx
// React fields with explicit spellCheck={false}
const ProfileForm = () => (
  <form>
    <label htmlFor="handle">Username</label>
    <input
      type="text"
      id="handle"
      name="handle"
      spellCheck={false}
      autoComplete="username"
    />

    <label htmlFor="website">Website</label>
    <input
      type="url"
      id="website"
      name="website"
      spellCheck={false}
      inputMode="url"
      autoComplete="url"
    />
  </form>
);
```

### Checkbox and Radio Touch Targets

#### Incorrect

```html
<!-- Checkbox and label are separate — dead zone between them -->
<input type="checkbox" id="terms" />
<label for="terms">I agree to the terms</label>

<!-- Radio buttons with tiny hit areas -->
<input type="radio" name="plan" id="free" value="free" />
<label for="free">Free</label>
<input type="radio" name="plan" id="pro" value="pro" />
<label for="pro">Pro</label>
```

```tsx
// React checkbox with gap between control and label — POOR TOUCH TARGET
const TermsCheckbox = () => (
  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
    <input type="checkbox" id="terms" />
    <label htmlFor="terms">I agree to the terms</label>
  </div>
);
```

#### Correct

```html
<!-- Wrapping label creates a single unified hit target -->
<label class="checkbox-target">
  <input type="checkbox" name="terms" />
  I agree to the terms
</label>

<style>
.checkbox-target {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 8px;
  cursor: pointer;
}
</style>

<!-- Radio group with wrapping labels for full-width targets -->
<fieldset>
  <legend>Choose a plan</legend>
  <label class="radio-target">
    <input type="radio" name="plan" value="free" />
    Free
  </label>
  <label class="radio-target">
    <input type="radio" name="plan" value="pro" />
    Pro
  </label>
</fieldset>

<style>
.radio-target {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 8px 12px;
  cursor: pointer;
}
</style>
```

```tsx
// React checkbox with wrapping label — unified touch target
const TermsCheckbox = ({ checked, onChange }: TermsCheckboxProps) => (
  <label
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      minHeight: '44px',
      padding: '8px',
      cursor: 'pointer',
    }}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    I agree to the terms
  </label>
);

// React radio group with wrapping labels
interface RadioOption {
  value: string;
  label: string;
}

const RadioGroup = ({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <fieldset>
    <legend>{legend}</legend>
    {options.map((option) => (
      <label
        key={option.value}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minHeight: '44px',
          padding: '8px 12px',
          cursor: 'pointer',
        }}
      >
        <input
          type="radio"
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
        />
        {option.label}
      </label>
    ))}
  </fieldset>
);
```

### Complete Registration Form

```tsx
// Comprehensive form using all input type best practices
const RegistrationForm = () => (
  <form aria-labelledby="reg-title" noValidate>
    <h2 id="reg-title">Create Account</h2>

    <div className="form-field">
      <label htmlFor="reg-name">Full Name</label>
      <input
        type="text"
        id="reg-name"
        name="name"
        autoComplete="name"
        required
      />
    </div>

    <div className="form-field">
      <label htmlFor="reg-email">Email Address</label>
      <input
        type="email"
        id="reg-email"
        name="email"
        autoComplete="email"
        inputMode="email"
        spellCheck={false}
        required
      />
    </div>

    <div className="form-field">
      <label htmlFor="reg-tel">Phone Number</label>
      <input
        type="tel"
        id="reg-tel"
        name="phone"
        autoComplete="tel"
        inputMode="tel"
        spellCheck={false}
      />
    </div>

    <div className="form-field">
      <label htmlFor="reg-pw">Password</label>
      <input
        type="password"
        id="reg-pw"
        name="password"
        autoComplete="new-password"
        required
      />
    </div>

    <div className="form-field">
      <label htmlFor="reg-url">Website (optional)</label>
      <input
        type="url"
        id="reg-url"
        name="website"
        autoComplete="url"
        inputMode="url"
        spellCheck={false}
      />
    </div>

    <label className="checkbox-target">
      <input type="checkbox" name="terms" required />
      I agree to the Terms of Service
    </label>

    <button type="submit">Create Account</button>
  </form>
);
```

---

## Testing Guidance

### Manual Testing

1. **Mobile keyboard check**: Open each input on an iOS and Android device. Verify the correct keyboard layout appears (numeric pad for phone, @ key for email, .com key for URL).
2. **Password manager autofill**: Load the form in a browser with a password manager active. Confirm that login fields auto-populate and registration fields prompt to save.
3. **Spellcheck inspection**: Type a valid email address or username into the field and confirm no red squiggly underlines appear.
4. **Touch target verification**: Tap the label text next to checkboxes and radio buttons. The control should toggle. Tap the space between label and control to confirm there is no dead zone.
5. **OTP autofill**: On iOS/Android, trigger an SMS code. Confirm the one-time-code field offers to autofill from the SMS.

### Automated Testing

```tsx
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

test('email input has correct type and autocomplete', () => {
  render(<RegistrationForm />);

  const emailInput = screen.getByLabelText(/email address/i);
  expect(emailInput).toHaveAttribute('type', 'email');
  expect(emailInput).toHaveAttribute('autocomplete', 'email');
  expect(emailInput).toHaveAttribute('spellcheck', 'false');
});

test('password input uses new-password autocomplete for registration', () => {
  render(<RegistrationForm />);

  const pwInput = screen.getByLabelText(/password/i);
  expect(pwInput).toHaveAttribute('type', 'password');
  expect(pwInput).toHaveAttribute('autocomplete', 'new-password');
});

test('phone input has tel type and inputmode', () => {
  render(<RegistrationForm />);

  const phoneInput = screen.getByLabelText(/phone/i);
  expect(phoneInput).toHaveAttribute('type', 'tel');
  expect(phoneInput).toHaveAttribute('inputmode', 'tel');
});

test('checkbox label wraps input for unified touch target', () => {
  render(<TermsCheckbox checked={false} onChange={() => {}} />);

  const checkbox = screen.getByRole('checkbox');
  // The label element should be an ancestor of the checkbox
  expect(checkbox.closest('label')).not.toBeNull();
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
| [1.3.5 Identify Input Purpose](https://www.w3.org/WAI/WCAG21/Understanding/identify-input-purpose) | AA | Use `autocomplete` attributes so user agents can determine the purpose of each input |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value) | A | All form controls have accessible names; correct `type` ensures proper role communication |
