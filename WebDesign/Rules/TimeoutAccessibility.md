# Timeout Accessibility

## Impact: MEDIUM

Session timeouts without warning can cause users to lose work, especially those who need more time due to disabilities. Users with motor impairments, cognitive disabilities, or those using assistive technology often need additional time to complete tasks.

## Why It Matters

Abrupt timeouts punish users who take longer to complete tasks. Screen reader users may need more time to navigate forms. Users with motor impairments may type slowly. Users with cognitive disabilities may need breaks to process information. An unexpected timeout can mean losing significant work and having to start over, creating frustration and barriers to completion.

---

## Rule 1: Warn Users Before Timeout

### Incorrect - Abrupt Timeout Without Warning

```javascript
// Silent timeout - user loses work without notice
let sessionTimer;

function startSession() {
  sessionTimer = setTimeout(() => {
    // Immediately logs out
    window.location.href = '/login?expired=true';
  }, 15 * 60 * 1000); // 15 minutes
}
```

```tsx
// Component that silently expires
function SecureForm() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // No warning - just redirects
      router.push('/session-expired');
    }, 900000);

    return () => clearTimeout(timer);
  }, []);

  return <form>{/* Form content */}</form>;
}
```

### Correct - Timeout Warning with Extension Option

```tsx
// Accessible timeout warning component
interface TimeoutWarningProps {
  timeoutMinutes: number;
  warningMinutes: number;
  onExtend: () => void;
  onLogout: () => void;
}

function SessionManager({
  timeoutMinutes,
  warningMinutes,
  onExtend,
  onLogout
}: TimeoutWarningProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const warningRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    const timeoutTime = timeoutMinutes * 60 * 1000;

    const warningTimer = setTimeout(() => {
      setShowWarning(true);
      setSecondsRemaining(warningMinutes * 60);
      // Focus the warning for screen readers
      warningRef.current?.focus();
    }, warningTime);

    const logoutTimer = setTimeout(onLogout, timeoutTime);

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
    };
  }, [timeoutMinutes, warningMinutes, onLogout]);

  // Countdown
  useEffect(() => {
    if (!showWarning) return;

    const interval = setInterval(() => {
      setSecondsRemaining(s => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarning]);

  const handleExtend = () => {
    setShowWarning(false);
    onExtend();
  };

  if (!showWarning) return null;

  return (
    <div
      ref={warningRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="timeout-title"
      aria-describedby="timeout-desc"
      tabIndex={-1}
      className="timeout-warning"
    >
      <h2 id="timeout-title">Your session is about to expire</h2>
      <p id="timeout-desc">
        You will be logged out in {Math.ceil(secondsRemaining / 60)} minutes
        due to inactivity. Any unsaved work will be lost.
      </p>
      <div className="timeout-actions">
        <button onClick={handleExtend} autoFocus>
          Stay logged in
        </button>
        <button onClick={onLogout}>
          Log out now
        </button>
      </div>
    </div>
  );
}
```

---

## Rule 2: Allow Users to Extend or Disable Timeouts

### Incorrect - Fixed Timeout with No Extension

```html
<!-- No way for user to prevent timeout -->
<div class="session-warning">
  Your session will expire in 2 minutes.
  <!-- No extend button -->
</div>
```

### Correct - Extension and Disable Options

```html
<div
  role="alertdialog"
  aria-modal="true"
  aria-labelledby="timeout-title"
  aria-describedby="timeout-message"
>
  <h2 id="timeout-title">Session timeout warning</h2>
  <p id="timeout-message">
    Your session will expire in <span aria-live="polite">2 minutes</span>.
  </p>

  <div class="timeout-options">
    <button id="extend-session" autofocus>
      Extend session by 20 minutes
    </button>
    <button id="stay-signed-in">
      Keep me signed in (disable timeout)
    </button>
    <button id="logout-now">
      Log out now
    </button>
  </div>
</div>
```

```tsx
// Settings page with timeout preferences
function SessionSettings() {
  const [timeoutEnabled, setTimeoutEnabled] = useState(true);
  const [timeoutDuration, setTimeoutDuration] = useState(30);

  return (
    <fieldset>
      <legend>Session timeout settings</legend>

      <div>
        <input
          type="checkbox"
          id="timeout-enabled"
          checked={timeoutEnabled}
          onChange={(e) => setTimeoutEnabled(e.target.checked)}
        />
        <label htmlFor="timeout-enabled">
          Enable session timeout for security
        </label>
      </div>

      {timeoutEnabled && (
        <div>
          <label htmlFor="timeout-duration">
            Time before logout warning:
          </label>
          <select
            id="timeout-duration"
            value={timeoutDuration}
            onChange={(e) => setTimeoutDuration(Number(e.target.value))}
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
          </select>
          <p className="help-text">
            You will receive a warning 2 minutes before timeout.
          </p>
        </div>
      )}
    </fieldset>
  );
}
```

---

## Rule 3: Preserve User Data on Timeout

### Incorrect - Data Lost on Timeout

```javascript
// User loses all form data
function handleTimeout() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '/login';
}
```

### Correct - Save State Before Timeout

```tsx
// Auto-save form state
function useFormAutoSave(formId: string, formData: object) {
  useEffect(() => {
    // Save to localStorage periodically
    const interval = setInterval(() => {
      localStorage.setItem(`form-draft-${formId}`, JSON.stringify(formData));
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [formId, formData]);
}

// Timeout handler that preserves data
function handleTimeoutWithSave(formData: object) {
  // Save current state before logout
  const savedState = {
    formData,
    savedAt: new Date().toISOString(),
    returnUrl: window.location.pathname,
  };

  localStorage.setItem('session-recovery', JSON.stringify(savedState));

  // Redirect with recovery flag
  window.location.href = '/login?recovery=available';
}

// Post-login recovery
function FormWithRecovery() {
  const [formData, setFormData] = useState({});
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('session-recovery');
    if (savedState) {
      setShowRecoveryPrompt(true);
    }
  }, []);

  const recoverData = () => {
    const savedState = JSON.parse(localStorage.getItem('session-recovery')!);
    setFormData(savedState.formData);
    localStorage.removeItem('session-recovery');
    setShowRecoveryPrompt(false);
  };

  return (
    <>
      {showRecoveryPrompt && (
        <div role="alert">
          <p>You have unsaved work from your previous session.</p>
          <button onClick={recoverData}>Restore my work</button>
          <button onClick={() => setShowRecoveryPrompt(false)}>
            Start fresh
          </button>
        </div>
      )}
      <form>{/* Form fields */}</form>
    </>
  );
}
```

---

## Rule 4: Accessible Inactivity Detection

### Incorrect - Mouse-Only Activity Detection

```javascript
// Only tracks mouse movement
document.addEventListener('mousemove', resetTimer);
// Keyboard users appear inactive
```

### Correct - Comprehensive Activity Detection

```typescript
// Detect all forms of user interaction
function useInactivityTimer(
  timeoutMs: number,
  onInactive: () => void
) {
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(onInactive, timeoutMs);
    };

    // Track all interaction types
    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'focus',  // Includes screen reader focus changes
    ];

    events.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    // Initial timer
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [timeoutMs, onInactive]);
}
```

---

## Rule 5: Communicate Timeout Information Upfront

### Incorrect - Hidden Timeout Policy

```html
<!-- User only learns about timeout when it happens -->
<form>
  <!-- No indication that session will timeout -->
</form>
```

### Correct - Clear Timeout Communication

```html
<form aria-describedby="session-info">
  <p id="session-info" class="session-notice">
    <strong>Session information:</strong>
    For your security, this session will expire after 30 minutes of inactivity.
    You will receive a warning 2 minutes before expiration.
    <a href="/settings/session">Change timeout settings</a>
  </p>

  <!-- Form fields -->
</form>
```

```tsx
// Visible session indicator
function SessionIndicator() {
  const { minutesRemaining, isWarning } = useSessionTime();

  return (
    <div
      className={`session-indicator ${isWarning ? 'warning' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="visually-hidden">
        {isWarning
          ? `Warning: Session expires in ${minutesRemaining} minutes`
          : `Session time remaining: ${minutesRemaining} minutes`
        }
      </span>
      <span aria-hidden="true">
        Session: {minutesRemaining}m
      </span>
    </div>
  );
}
```

---

## Testing Guidance

### Manual Testing
1. Wait for timeout warning to appear
2. Verify warning is announced by screen reader
3. Confirm extension button is keyboard accessible and focused
4. Test that form data persists after timeout and re-login
5. Verify timeout settings can be changed

### Screen Reader Testing
- Ensure timeout warning uses `role="alertdialog"`
- Verify focus moves to warning dialog
- Check that countdown is announced via live region
- Confirm extension confirmation is announced

### Automated Testing

```javascript
// Test timeout warning appears
test('timeout warning shows before expiration', async () => {
  jest.useFakeTimers();

  render(<SessionManager
    timeoutMinutes={15}
    warningMinutes={2}
    onExtend={jest.fn()}
    onLogout={jest.fn()}
  />);

  // Advance to warning time (13 minutes)
  jest.advanceTimersByTime(13 * 60 * 1000);

  expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  expect(screen.getByText(/session is about to expire/i)).toBeInTheDocument();
});

// Test extension works
test('user can extend session', async () => {
  jest.useFakeTimers();
  const onExtend = jest.fn();

  render(<SessionManager
    timeoutMinutes={15}
    warningMinutes={2}
    onExtend={onExtend}
    onLogout={jest.fn()}
  />);

  jest.advanceTimersByTime(13 * 60 * 1000);

  await userEvent.click(screen.getByText(/stay logged in/i));

  expect(onExtend).toHaveBeenCalled();
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
});

// Test data preservation
test('form data is preserved after timeout', () => {
  const formData = { name: 'Test', email: 'test@example.com' };

  handleTimeoutWithSave(formData);

  const recovered = JSON.parse(localStorage.getItem('session-recovery')!);
  expect(recovered.formData).toEqual(formData);
});

// Test focus management
test('focus moves to warning dialog', async () => {
  jest.useFakeTimers();

  render(<SessionManager {...defaultProps} />);

  jest.advanceTimersByTime(13 * 60 * 1000);

  expect(screen.getByRole('alertdialog')).toHaveFocus();
});
```

---

## WCAG Success Criteria

| Criterion | Level | Description |
|-----------|-------|-------------|
| **2.2.1 Timing Adjustable** | A | User can turn off, adjust, or extend time limits |
| **2.2.3 No Timing** | AAA | Timing is not essential part of activity |
| **2.2.5 Re-authenticating** | AAA | Data preserved when session expires |
| **2.2.6 Timeouts** | AAA | Users warned of data loss due to inactivity |

---

## Timeout Checklist

| Requirement | Implementation |
|-------------|----------------|
| Warning before timeout | Show alert 2+ minutes before expiration |
| Extension option | Button to add time (at least 10x) |
| Disable option | Allow users to turn off timeout |
| Data preservation | Auto-save and offer recovery |
| Clear communication | Inform users of timeout policy upfront |
| Comprehensive detection | Track keyboard, mouse, touch, focus |
| Accessible warning | Use alertdialog, manage focus |
