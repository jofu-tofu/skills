# Touch Targets

## Impact: MEDIUM-HIGH (Mobile Accessibility)

Small touch targets cause frustration and errors for all mobile users, but especially impact users with motor impairments, tremors, or limited dexterity. Approximately 7% of adults have motor difficulties that affect their ability to precisely tap small areas. Properly sized touch targets reduce accidental taps, improve task completion rates, and make interfaces usable for everyone.

---

## Requirements Summary

| Standard | Minimum Size | Spacing | Notes |
|----------|--------------|---------|-------|
| WCAG 2.2 AA | 24x24 CSS px | - | Target Size (Minimum) |
| WCAG 2.2 AAA | 44x44 CSS px | - | Target Size (Enhanced) |
| Apple HIG | 44x44 pt | - | Recommended |
| Google Material | 48x48 dp | 8dp | Recommended |
| Microsoft Fluent | 40x40 px | 8px | Minimum |

---

## Code Examples

### Small Touch Targets

#### Incorrect - Targets Too Small

```html
<!-- Tiny icon buttons -->
<button class="icon-btn" style="width: 20px; height: 20px;">
  <svg width="16" height="16"><!-- icon --></svg>
</button>

<!-- Small text links -->
<a href="/help" style="font-size: 12px; padding: 2px;">Help</a>

<!-- Checkbox with no padding -->
<label style="display: inline;">
  <input type="checkbox" /> Agree to terms
</label>
```

```tsx
// React component with insufficient touch target - INACCESSIBLE
const SmallButton = ({ icon, onClick }: IconButtonProps) => (
  <button
    onClick={onClick}
    style={{
      width: '24px',
      height: '24px',
      padding: '2px'
    }}
  >
    {icon}
  </button>
);
```

#### Correct - Properly Sized Touch Targets

```html
<!-- Minimum 44x44 touch target -->
<button class="icon-btn">
  <svg width="24" height="24" aria-hidden="true"><!-- icon --></svg>
</button>

<style>
.icon-btn {
  min-width: 44px;
  min-height: 44px;
  padding: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>

<!-- Link with adequate padding -->
<a href="/help" class="touch-link">Help</a>

<style>
.touch-link {
  display: inline-block;
  min-height: 44px;
  padding: 12px 16px;
  line-height: 20px;
}
</style>

<!-- Checkbox with clickable label area -->
<label class="checkbox-label">
  <input type="checkbox" />
  <span class="checkbox-text">Agree to terms</span>
</label>

<style>
.checkbox-label {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 8px;
  cursor: pointer;
}

.checkbox-text {
  padding-left: 8px;
}
</style>
```

```tsx
// React component with proper touch target
interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const IconButton = ({ icon, label, onClick }: IconButtonProps) => (
  <>
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="icon-button"
    >
      <span className="icon" aria-hidden="true">{icon}</span>
    </button>
    <style jsx>{`
      .icon-button {
        min-width: 44px;
        min-height: 44px;
        padding: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 4px;
      }

      .icon-button:hover {
        background: rgba(0, 0, 0, 0.05);
      }

      .icon-button:focus-visible {
        outline: 2px solid #0056b3;
        outline-offset: 2px;
      }

      .icon {
        width: 24px;
        height: 24px;
      }
    `}</style>
  </>
);
```

### Touch Target Spacing

#### Incorrect - Crowded Targets

```html
<!-- Buttons too close together -->
<div class="button-group">
  <button>Edit</button>
  <button>Delete</button>
  <button>Share</button>
</div>

<style>
.button-group button {
  padding: 8px 12px;
  margin: 0 2px; /* Too close! */
}
</style>
```

#### Correct - Adequate Spacing

```html
<div class="button-group">
  <button>Edit</button>
  <button>Delete</button>
  <button>Share</button>
</div>

<style>
.button-group {
  display: flex;
  gap: 8px; /* Minimum 8px spacing */
}

.button-group button {
  min-height: 44px;
  padding: 10px 16px;
}
</style>
```

```tsx
// Button group with proper spacing
const ButtonGroup = ({ children }: { children: React.ReactNode }) => (
  <>
    <div className="button-group">{children}</div>
    <style jsx>{`
      .button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .button-group :global(button) {
        min-height: 44px;
        min-width: 44px;
        padding: 10px 16px;
      }
    `}</style>
  </>
);
```

### Expanding Touch Targets Without Changing Visual Size

```tsx
// Icon that looks small but has large touch target
const TouchableIcon = ({ icon, label, onClick }: TouchableIconProps) => (
  <>
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="touchable-icon"
    >
      <span className="icon-visual">{icon}</span>
    </button>
    <style jsx>{`
      .touchable-icon {
        /* Visual appearance */
        background: none;
        border: none;
        cursor: pointer;

        /* Large touch target */
        position: relative;
        padding: 0;

        /* Touch target extends beyond visual */
        min-width: 44px;
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .icon-visual {
        /* Visual size can be smaller */
        width: 24px;
        height: 24px;
      }
    `}</style>
  </>
);

// Alternative: Use pseudo-element for larger hit area
const PseudoTouchTarget = () => (
  <style jsx global>{`
    .small-visual-large-target {
      position: relative;
      width: 24px;
      height: 24px;
    }

    .small-visual-large-target::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 44px;
      height: 44px;
      /* Invisible but clickable */
    }
  `}</style>
);
```

### Form Controls

```tsx
// Accessible form controls with proper touch targets
const FormControls = () => (
  <>
    <div className="form-group">
      <label className="checkbox-container">
        <input type="checkbox" className="checkbox-input" />
        <span className="checkbox-custom" aria-hidden="true" />
        <span className="checkbox-label">Remember me</span>
      </label>
    </div>

    <style jsx>{`
      .checkbox-container {
        display: flex;
        align-items: center;
        min-height: 44px;
        padding: 8px;
        cursor: pointer;
        user-select: none;
      }

      .checkbox-input {
        position: absolute;
        opacity: 0;
        width: 44px;
        height: 44px;
        cursor: pointer;
      }

      .checkbox-custom {
        width: 20px;
        height: 20px;
        border: 2px solid #666;
        border-radius: 4px;
        margin-right: 12px;
        flex-shrink: 0;
      }

      .checkbox-input:checked + .checkbox-custom {
        background: #0056b3;
        border-color: #0056b3;
      }

      .checkbox-input:focus-visible + .checkbox-custom {
        outline: 2px solid #0056b3;
        outline-offset: 2px;
      }
    `}</style>
  </>
);
```

### Navigation Links

```tsx
// Mobile navigation with proper touch targets
const MobileNav = ({ items }: NavProps) => (
  <>
    <nav className="mobile-nav">
      <ul>
        {items.map((item) => (
          <li key={item.href}>
            <a href={item.href} className="nav-link">
              {item.icon && (
                <span className="nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="nav-text">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>

    <style jsx>{`
      .mobile-nav ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .nav-link {
        display: flex;
        align-items: center;
        min-height: 48px;
        padding: 12px 16px;
        text-decoration: none;
        color: inherit;
      }

      .nav-link:hover,
      .nav-link:focus {
        background: rgba(0, 0, 0, 0.05);
      }

      .nav-icon {
        width: 24px;
        height: 24px;
        margin-right: 16px;
      }
    `}</style>
  </>
);
```

---

## Touch Action Optimization

### Prevent Double-Tap Zoom Delay

```css
/* Remove 300ms tap delay on interactive elements */
.interactive-element {
  touch-action: manipulation;
}

/* Apply globally to all interactive elements */
button, a, [role="button"], input, select, textarea, summary {
  touch-action: manipulation;
}
```

Without `touch-action: manipulation`, mobile browsers add a ~300ms delay after tap to detect double-tap zoom. This makes the entire interface feel sluggish. The `manipulation` value allows panning and pinch-zoom but removes the double-tap delay.

---

## CSS Techniques

```css
/* Minimum touch target utility class */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* Touch target that extends beyond visual bounds */
.touch-target-extended {
  position: relative;
}

.touch-target-extended::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 44px;
  min-height: 44px;
}

/* Responsive touch targets (larger on touch devices) */
@media (pointer: coarse) {
  .adaptive-touch {
    min-width: 48px;
    min-height: 48px;
    padding: 12px;
  }
}

@media (pointer: fine) {
  .adaptive-touch {
    min-width: 32px;
    min-height: 32px;
    padding: 8px;
  }
}
```

---

## Testing Guidance

### Manual Testing

1. **Touch device testing**: Test on actual mobile devices
2. **Measure targets**: Use browser DevTools to measure element dimensions
3. **Thumb zone test**: Can you tap accurately with your thumb?
4. **Adjacent targets**: Can you tap one without hitting another?

### Automated Testing

```tsx
import { render, screen } from '@testing-library/react';

test('button meets minimum touch target size', () => {
  render(<IconButton icon={<TrashIcon />} label="Delete" onClick={() => {}} />);

  const button = screen.getByRole('button');
  const styles = getComputedStyle(button);

  const width = parseFloat(styles.minWidth) || button.offsetWidth;
  const height = parseFloat(styles.minHeight) || button.offsetHeight;

  expect(width).toBeGreaterThanOrEqual(44);
  expect(height).toBeGreaterThanOrEqual(44);
});

test('buttons have adequate spacing', () => {
  render(<ButtonGroup><Button>A</Button><Button>B</Button></ButtonGroup>);

  const buttons = screen.getAllByRole('button');
  const rect1 = buttons[0].getBoundingClientRect();
  const rect2 = buttons[1].getBoundingClientRect();

  const gap = rect2.left - rect1.right;
  expect(gap).toBeGreaterThanOrEqual(8);
});
```

### DevTools Inspection

```javascript
// Console snippet to check touch target sizes
document.querySelectorAll('button, a, input, [role="button"]').forEach(el => {
  const rect = el.getBoundingClientRect();
  if (rect.width < 44 || rect.height < 44) {
    console.warn('Small touch target:', el, `${rect.width}x${rect.height}`);
  }
});
```

---

## WCAG Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| [2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced) | AAA | 44x44 CSS pixels minimum |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) | AA | 24x24 CSS pixels minimum (with exceptions) |
| [2.5.1 Pointer Gestures](https://www.w3.org/WAI/WCAG21/Understanding/pointer-gestures) | A | Single pointer alternatives available |
