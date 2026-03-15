# Color Independence

## Impact: HIGH (Color Blindness)

Approximately 8% of men and 0.5% of women have some form of color vision deficiency. When information is conveyed only through color, these users cannot perceive critical differences like error states, required fields, or status changes. Color should enhance meaning but never be the sole indicator.

---

## Requirements Summary

| Principle | Implementation |
|-----------|----------------|
| Never color alone | Always pair with text, icons, or patterns |
| Status indicators | Use icons + text + color |
| Form validation | Icon + message + color change |
| Charts/graphs | Patterns + labels + color |
| Links in text | Underline + color (or 3:1 contrast) |
| SVG icons | Use SVG icons (not emoji) for status indicators, consistent 24x24 sizing |

---

## Code Examples

### Form Validation

#### Incorrect - Color-Only Error Indication

```html
<!-- Color is the ONLY indicator of error state -->
<form>
  <label for="email">Email</label>
  <input
    type="email"
    id="email"
    style="border-color: red;"
    value="invalid-email"
  />
  <!-- No error message, just red border -->
</form>
```

```tsx
// React form with color-only validation - INACCESSIBLE
const FormField = ({ error, ...props }: FieldProps) => (
  <input
    {...props}
    style={{
      borderColor: error ? 'red' : 'gray'
    }}
  />
);
```

#### Correct - Multi-Modal Error Indication

```html
<form>
  <label for="email">
    Email
    <span class="required" aria-hidden="true">*</span>
    <span class="sr-only">(required)</span>
  </label>
  <input
    type="email"
    id="email"
    aria-invalid="true"
    aria-describedby="email-error"
    class="input-error"
    value="invalid-email"
  />
  <div id="email-error" class="error-message" role="alert">
    <svg aria-hidden="true" class="error-icon"><!-- error icon --></svg>
    Please enter a valid email address
  </div>
</form>

<style>
.input-error {
  border: 2px solid #d32f2f;
  background-color: #ffebee;
}

.error-message {
  color: #d32f2f;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.error-icon {
  width: 1rem;
  height: 1rem;
  fill: currentColor;
}
</style>
```

```tsx
// Accessible form field with icon, text, and color
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
}

const FormField = ({ label, error, required, ...props }: FormFieldProps) => (
  <div className="form-field">
    <label htmlFor={props.id}>
      {label}
      {required && (
        <>
          <span aria-hidden="true" className="required-marker">*</span>
          <span className="sr-only">(required)</span>
        </>
      )}
    </label>

    <input
      {...props}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={error ? `${props.id}-error` : undefined}
      className={error ? 'input-error' : ''}
    />

    {error && (
      <div id={`${props.id}-error`} className="error-message" role="alert">
        <ErrorIcon aria-hidden="true" />
        <span>{error}</span>
      </div>
    )}
  </div>
);
```

### Status Indicators

#### Incorrect - Color-Only Status

```html
<!-- Status conveyed only by color -->
<ul class="task-list">
  <li style="color: green;">Task completed</li>
  <li style="color: yellow;">Task in progress</li>
  <li style="color: red;">Task failed</li>
</ul>
```

#### Correct - Status with Icons and Text

<!-- Use SVG icons (not emojis) for production UIs — consistent sizing, theme-able colors, and accessible. -->

```html
<ul class="task-list">
  <li class="status-success">
    <svg aria-hidden="true" class="status-icon">
      <use href="#check-icon" />
    </svg>
    <span class="status-text">Completed</span>
    <span class="task-name">Upload document</span>
  </li>
  <li class="status-pending">
    <svg aria-hidden="true" class="status-icon">
      <use href="#clock-icon" />
    </svg>
    <span class="status-text">In Progress</span>
    <span class="task-name">Process data</span>
  </li>
  <li class="status-error">
    <svg aria-hidden="true" class="status-icon">
      <use href="#x-icon" />
    </svg>
    <span class="status-text">Failed</span>
    <span class="task-name">Send notification</span>
  </li>
</ul>
```

```tsx
// React status badge with icon and text
type StatusType = 'success' | 'warning' | 'error' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
}

const statusConfig = {
  success: { icon: CheckIcon, text: 'Success' },
  warning: { icon: AlertIcon, text: 'Warning' },
  error: { icon: XIcon, text: 'Error' },
  info: { icon: InfoIcon, text: 'Information' }
};

const StatusBadge = ({ status, label }: StatusBadgeProps) => {
  const { icon: Icon, text } = statusConfig[status];

  return (
    <span className={`badge badge-${status}`}>
      <Icon aria-hidden="true" className="badge-icon" />
      <span className="badge-text">{text}: {label}</span>
    </span>
  );
};
```

### Icon Best Practices for Status

```tsx
// Use SVG icons, not emojis, for UI status indicators
// Maintain consistent sizing with 24x24 viewBox

// Incorrect - Emoji for status
const Status = ({ ok }: { ok: boolean }) => (
  <span>{ok ? '✅' : '❌'} {ok ? 'Active' : 'Inactive'}</span>
);

// Correct - SVG icons with consistent sizing
const Status = ({ ok }: { ok: boolean }) => (
  <span className={`status-${ok ? 'active' : 'inactive'}`}>
    <svg aria-hidden="true" viewBox="0 0 24 24" className="w-6 h-6">
      {ok ? <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
           : <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />}
    </svg>
    <span>{ok ? 'Active' : 'Inactive'}</span>
  </span>
);
```

### Links in Text

#### Incorrect - Color-Only Link Distinction

```html
<p>
  For more information, visit
  <a href="/help" style="color: blue; text-decoration: none;">
    our help page
  </a>.
</p>
```

#### Correct - Underlined or High-Contrast Links

```html
<style>
/* Option 1: Underlined links (preferred) */
a {
  color: #0056b3;
  text-decoration: underline;
}

/* Option 2: High contrast (3:1) without underline */
a.high-contrast {
  color: #0056b3; /* 3:1 contrast with surrounding #333 text */
  text-decoration: none;
  font-weight: 600;
}

a.high-contrast:hover,
a.high-contrast:focus {
  text-decoration: underline;
}
</style>

<p>
  For more information, visit
  <a href="/help">our help page</a>.
</p>
```

### Charts and Data Visualization

#### Incorrect - Color-Only Legend

```tsx
// Chart with color-only differentiation - INACCESSIBLE
const PieChart = ({ data }) => (
  <div>
    <svg>{/* colored slices */}</svg>
    <div class="legend">
      <span style="color: red">Sales</span>
      <span style="color: blue">Marketing</span>
      <span style="color: green">Engineering</span>
    </div>
  </div>
);
```

#### Correct - Patterns, Labels, and Color

```tsx
// Accessible chart with multiple indicators
const AccessiblePieChart = ({ data }: ChartProps) => (
  <figure>
    <svg role="img" aria-labelledby="chart-title chart-desc">
      <title id="chart-title">Q4 Budget Allocation</title>
      <desc id="chart-desc">
        Pie chart showing Sales 40%, Marketing 35%, Engineering 25%
      </desc>

      {/* Slices with patterns */}
      <path d="..." fill="url(#pattern-diagonal)" />
      <path d="..." fill="url(#pattern-dots)" />
      <path d="..." fill="url(#pattern-crosshatch)" />

      {/* Direct labels on chart */}
      <text x="..." y="...">Sales 40%</text>
      <text x="..." y="...">Marketing 35%</text>
      <text x="..." y="...">Engineering 25%</text>
    </svg>

    {/* Accessible legend with patterns */}
    <figcaption>
      <ul class="legend">
        <li>
          <span class="swatch pattern-diagonal" aria-hidden="true" />
          Sales: $400,000 (40%)
        </li>
        <li>
          <span class="swatch pattern-dots" aria-hidden="true" />
          Marketing: $350,000 (35%)
        </li>
        <li>
          <span class="swatch pattern-crosshatch" aria-hidden="true" />
          Engineering: $250,000 (25%)
        </li>
      </ul>
    </figcaption>
  </figure>
);
```

---

## Testing Guidance

### Manual Testing

1. **Grayscale test**: Apply grayscale filter to screen, verify all information is still perceivable
2. **Color blindness simulation**: Use browser extensions (e.g., NoCoffee, Colorblindly)
3. **Content audit**: Review each color-coded element for alternative indicators

### Automated Testing

```tsx
// axe-core color contrast and use of color
import { axe } from 'jest-axe';

test('information not conveyed by color alone', async () => {
  const { container } = render(<StatusList />);
  const results = await axe(container, {
    rules: {
      'color-contrast': { enabled: true },
      'link-in-text-block': { enabled: true }
    }
  });
  expect(results).toHaveNoViolations();
});
```

### Browser Extensions

- **NoCoffee Vision Simulator**: Simulates various vision impairments
- **Colorblindly**: Chrome extension for color blindness simulation
- **Stark**: Figma/Sketch plugin for design review

---

## WCAG Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color) | A | Color not sole means of conveying information |
| [1.3.3 Sensory Characteristics](https://www.w3.org/WAI/WCAG21/Understanding/sensory-characteristics) | A | Instructions don't rely solely on sensory characteristics |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast) | AA | UI components distinguishable without color |
