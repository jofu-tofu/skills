# User Control

## Impact: MEDIUM

AI and agent interfaces that act autonomously without user control create anxiety, unpredictability, and potential for unintended consequences. Users must be able to pause, stop, undo, and customize agent behavior.

## Why It Matters

Autonomous agents can perform actions faster than users can process, especially users with cognitive disabilities. Without proper controls, users may feel helpless as the system makes changes they did not intend or cannot understand. User control is fundamental to accessible design because it ensures users remain in charge of their experience, can work at their own pace, and can recover from mistakes.

---

## Rule 1: Allow Pause and Stop of AI Actions

### Incorrect - Unstoppable Agent Actions

```tsx
// Agent runs to completion with no way to stop
function AutomatedTask() {
  const [isRunning, setIsRunning] = useState(false);

  const startTask = async () => {
    setIsRunning(true);
    // No way to stop once started
    await performAllSteps();
    setIsRunning(false);
  };

  return (
    <div>
      <button onClick={startTask} disabled={isRunning}>
        Start Task
      </button>
      {isRunning && <p>Running... please wait</p>}
      {/* No stop button */}
    </div>
  );
}
```

### Correct - Controllable Agent with Pause/Stop

```tsx
// Agent with full user control
function ControllableAgent() {
  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const start = async () => {
    abortControllerRef.current = new AbortController();
    setStatus('running');

    try {
      for (let i = currentStep; i < steps.length; i++) {
        // Check for abort signal
        if (abortControllerRef.current.signal.aborted) {
          break;
        }

        // Wait if paused
        while (status === 'paused') {
          await new Promise(r => setTimeout(r, 100));
        }

        await executeStep(steps[i], abortControllerRef.current.signal);
        setCurrentStep(i + 1);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        throw error;
      }
    }

    setStatus('idle');
  };

  const pause = () => setStatus('paused');
  const resume = () => setStatus('running');
  const stop = () => {
    abortControllerRef.current?.abort();
    setStatus('idle');
  };

  return (
    <div role="region" aria-label="AI Task Controller">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.name}
      </div>

      <div className="controls" role="group" aria-label="Task controls">
        {status === 'idle' && (
          <button onClick={start}>
            {currentStep > 0 ? 'Resume from step ' + (currentStep + 1) : 'Start'}
          </button>
        )}

        {status === 'running' && (
          <>
            <button onClick={pause} aria-pressed="false">
              Pause
            </button>
            <button onClick={stop}>
              Stop
            </button>
          </>
        )}

        {status === 'paused' && (
          <>
            <button onClick={resume}>
              Continue
            </button>
            <button onClick={stop}>
              Stop and Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

```html
<!-- Accessible control panel -->
<div role="region" aria-labelledby="agent-controls-heading">
  <h2 id="agent-controls-heading">AI Assistant Controls</h2>

  <div role="status" aria-live="polite">
    Currently: Analyzing document (Step 2 of 5)
  </div>

  <div role="group" aria-label="Playback controls">
    <button aria-pressed="false">
      <span aria-hidden="true">⏸</span>
      Pause
    </button>
    <button>
      <span aria-hidden="true">⏹</span>
      Stop
    </button>
  </div>

  <p class="help-text">
    Pausing will save your progress. Stopping will cancel all pending actions.
  </p>
</div>
```

---

## Rule 2: Support Undo for Agent Actions

### Incorrect - Irreversible Agent Actions

```tsx
// Agent makes permanent changes with no undo
async function autoOrganize(files: File[]) {
  for (const file of files) {
    // Permanently moves files with no record
    await moveFile(file, getNewLocation(file));
  }
  alert('Organization complete!');
}
```

### Correct - Reversible Actions with Undo

```tsx
// Action history with undo capability
interface Action {
  id: string;
  type: string;
  description: string;
  execute: () => Promise<void>;
  undo: () => Promise<void>;
  timestamp: Date;
}

function UndoableAgent() {
  const [actionHistory, setActionHistory] = useState<Action[]>([]);
  const [canUndo, setCanUndo] = useState(false);

  const executeAction = async (action: Action) => {
    await action.execute();
    setActionHistory(prev => [...prev, action]);
    setCanUndo(true);
  };

  const undoLast = async () => {
    const lastAction = actionHistory[actionHistory.length - 1];
    if (lastAction) {
      await lastAction.undo();
      setActionHistory(prev => prev.slice(0, -1));
      setCanUndo(actionHistory.length > 1);
    }
  };

  const undoAll = async () => {
    for (let i = actionHistory.length - 1; i >= 0; i--) {
      await actionHistory[i].undo();
    }
    setActionHistory([]);
    setCanUndo(false);
  };

  return (
    <div>
      <div className="controls">
        <button
          onClick={undoLast}
          disabled={!canUndo}
          aria-describedby="undo-description"
        >
          Undo Last Action
        </button>
        <button
          onClick={undoAll}
          disabled={!canUndo}
        >
          Undo All Changes
        </button>
        <p id="undo-description" className="visually-hidden">
          Reverses the most recent action taken by the AI assistant
        </p>
      </div>

      <section aria-labelledby="history-heading">
        <h3 id="history-heading">Action History</h3>
        <ul role="log" aria-live="polite">
          {actionHistory.map((action, index) => (
            <li key={action.id}>
              <span>{action.description}</span>
              <time dateTime={action.timestamp.toISOString()}>
                {formatTime(action.timestamp)}
              </time>
              <button
                onClick={() => undoSpecific(index)}
                aria-label={`Undo: ${action.description}`}
              >
                Undo
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

---

## Rule 3: Provide Customization Options

### Incorrect - One-Size-Fits-All Agent

```tsx
// No way to customize agent behavior
function RigidAgent() {
  return (
    <div>
      <button onClick={runWithDefaults}>
        Run AI Assistant
      </button>
      {/* No settings or preferences */}
    </div>
  );
}
```

### Correct - Customizable Agent Preferences

```tsx
// Comprehensive agent preferences
interface AgentPreferences {
  autoApprove: boolean;
  stepByStep: boolean;
  verbosity: 'minimal' | 'normal' | 'detailed';
  confirmDestructive: boolean;
  notificationLevel: 'all' | 'important' | 'none';
}

function AgentSettings() {
  const [prefs, setPrefs] = useState<AgentPreferences>({
    autoApprove: false,
    stepByStep: true,
    verbosity: 'normal',
    confirmDestructive: true,
    notificationLevel: 'important',
  });

  return (
    <form aria-labelledby="settings-heading">
      <h2 id="settings-heading">AI Assistant Preferences</h2>

      <fieldset>
        <legend>Action Approval</legend>

        <div>
          <input
            type="checkbox"
            id="step-by-step"
            checked={prefs.stepByStep}
            onChange={(e) => setPrefs(p => ({ ...p, stepByStep: e.target.checked }))}
          />
          <label htmlFor="step-by-step">
            Review each step before it runs
          </label>
          <p className="help-text">
            Recommended for sensitive tasks. The assistant will pause
            and ask for approval before each action.
          </p>
        </div>

        <div>
          <input
            type="checkbox"
            id="confirm-destructive"
            checked={prefs.confirmDestructive}
            onChange={(e) => setPrefs(p => ({ ...p, confirmDestructive: e.target.checked }))}
          />
          <label htmlFor="confirm-destructive">
            Always confirm before deleting or modifying files
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Response Detail</legend>

        <div role="radiogroup" aria-labelledby="verbosity-label">
          <span id="verbosity-label">How much detail in responses?</span>

          {['minimal', 'normal', 'detailed'].map((level) => (
            <div key={level}>
              <input
                type="radio"
                id={`verbosity-${level}`}
                name="verbosity"
                value={level}
                checked={prefs.verbosity === level}
                onChange={() => setPrefs(p => ({ ...p, verbosity: level as any }))}
              />
              <label htmlFor={`verbosity-${level}`}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </label>
            </div>
          ))}
        </div>
      </fieldset>

      <button type="submit">Save Preferences</button>
    </form>
  );
}
```

---

## Rule 4: Implement Interrupt Patterns

### Incorrect - Uninterruptible Processes

```tsx
// User cannot intervene during execution
async function processQueue(items: Item[]) {
  for (const item of items) {
    await processItem(item); // No way to interrupt
  }
}
```

### Correct - Interruptible with Confirmation Points

```tsx
// Agent with interrupt and confirmation points
function InterruptibleAgent({ tasks }: { tasks: Task[] }) {
  const [currentTask, setCurrentTask] = useState(0);
  const [awaitingApproval, setAwaitingApproval] = useState(false);
  const [proposedAction, setProposedAction] = useState<Action | null>(null);

  const processNextTask = async () => {
    const task = tasks[currentTask];
    const action = await planAction(task);

    // Pause for approval on significant actions
    if (action.requiresApproval) {
      setProposedAction(action);
      setAwaitingApproval(true);
      return; // Wait for user decision
    }

    await executeAction(action);
    setCurrentTask(c => c + 1);
  };

  const approveAction = async () => {
    if (proposedAction) {
      await executeAction(proposedAction);
      setAwaitingApproval(false);
      setProposedAction(null);
      setCurrentTask(c => c + 1);
    }
  };

  const rejectAction = () => {
    setAwaitingApproval(false);
    setProposedAction(null);
    // Skip this task or offer alternatives
  };

  return (
    <div>
      {awaitingApproval && proposedAction && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="approval-title"
          aria-describedby="approval-desc"
        >
          <h2 id="approval-title">Action Requires Approval</h2>
          <p id="approval-desc">
            The AI assistant wants to: {proposedAction.description}
          </p>

          <details>
            <summary>View details</summary>
            <pre>{JSON.stringify(proposedAction.details, null, 2)}</pre>
          </details>

          <div className="actions">
            <button onClick={approveAction} autoFocus>
              Approve
            </button>
            <button onClick={rejectAction}>
              Reject
            </button>
            <button onClick={() => setAwaitingApproval(false)}>
              Skip This Task
            </button>
          </div>
        </div>
      )}

      <div role="status" aria-live="polite">
        Processing task {currentTask + 1} of {tasks.length}
      </div>
    </div>
  );
}
```

---

## Rule 5: Provide Clear Escape Routes

### Incorrect - No Way to Exit

```html
<!-- Modal with no escape -->
<div class="ai-takeover">
  <p>AI is optimizing your experience...</p>
  <!-- No close button, no escape key handler -->
</div>
```

### Correct - Multiple Escape Options

```tsx
// Always provide escape routes
function AgentModal({ onClose }: { onClose: () => void }) {
  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <header>
        <h2 id="modal-title">AI Assistant</h2>
        <button
          onClick={onClose}
          aria-label="Close AI Assistant"
          className="close-button"
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <main>
        {/* Agent content */}
      </main>

      <footer>
        <button onClick={onClose}>
          Close
        </button>
        <p className="escape-hint">
          Press <kbd>Escape</kbd> to close at any time
        </p>
      </footer>
    </div>
  );
}
```

```html
<!-- Emergency stop always visible -->
<div class="agent-interface">
  <header>
    <h1>AI Assistant</h1>
    <button
      class="emergency-stop"
      aria-label="Emergency stop - cancel all AI actions immediately"
    >
      <span aria-hidden="true">⏹</span>
      Stop All
    </button>
  </header>

  <!-- Always visible escape instructions -->
  <p class="escape-instructions" aria-live="polite">
    Press <kbd>Escape</kbd> or click "Stop All" to halt the assistant at any time.
    All actions can be undone.
  </p>
</div>
```

---

## Testing Guidance

### Manual Testing
1. Verify pause/stop buttons are always accessible
2. Test keyboard shortcuts for emergency stop (Escape)
3. Confirm undo works for all agent actions
4. Check that preferences persist and apply correctly

### Screen Reader Testing
- Verify control buttons have clear labels
- Check that state changes are announced
- Confirm approval dialogs trap focus appropriately
- Ensure action history is navigable

### Automated Testing

```javascript
// Test pause/stop controls are accessible
test('stop button is always available during agent execution', async () => {
  render(<ControllableAgent />);

  await userEvent.click(screen.getByRole('button', { name: /start/i }));

  expect(screen.getByRole('button', { name: /stop/i })).toBeEnabled();
  expect(screen.getByRole('button', { name: /pause/i })).toBeEnabled();
});

// Test undo functionality
test('user can undo agent actions', async () => {
  const { rerender } = render(<UndoableAgent />);

  // Perform an action
  await userEvent.click(screen.getByRole('button', { name: /run/i }));

  // Verify undo is available
  const undoButton = screen.getByRole('button', { name: /undo/i });
  expect(undoButton).toBeEnabled();

  await userEvent.click(undoButton);

  // Verify action was reversed
  expect(screen.getByRole('log')).not.toHaveTextContent(/completed/i);
});

// Test escape key closes modal
test('Escape key closes agent modal', async () => {
  const onClose = jest.fn();
  render(<AgentModal onClose={onClose} />);

  await userEvent.keyboard('{Escape}');

  expect(onClose).toHaveBeenCalled();
});

// Test approval required for destructive actions
test('destructive actions require approval', async () => {
  render(<InterruptibleAgent tasks={[destructiveTask]} />);

  await userEvent.click(screen.getByRole('button', { name: /start/i }));

  expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  expect(screen.getByText(/requires approval/i)).toBeInTheDocument();
});
```

---

## Modern AI UX Best Practices

| Principle | Implementation |
|-----------|----------------|
| User remains in control | Pause, stop, undo always available |
| Confirmation for impact | Approval dialogs for significant actions |
| Customizable behavior | Preferences for automation level |
| Clear escape routes | Multiple ways to exit/stop |
| Action transparency | Show what agent is doing and will do |
| Reversibility | All actions can be undone |
| Progressive autonomy | Start cautious, let user increase automation |

---

## Quick Reference

| Control | Keyboard | Accessibility |
|---------|----------|---------------|
| Stop | Escape | `aria-label="Stop all AI actions"` |
| Pause | Space | `aria-pressed` toggle state |
| Undo | Ctrl+Z | Clear action description |
| Settings | , (comma) | Labeled form controls |
| Close modal | Escape | Focus trap + close button |
