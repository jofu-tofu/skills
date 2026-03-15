# Loading States

## Impact: MEDIUM-HIGH (Perceived Performance)

Loading states communicate system responsiveness to users. Without feedback, users cannot tell if their action registered, if the system is working, or if something failed. Empty screens during data fetching feel broken. Layout shift when content arrives is jarring. Skeleton screens, progress indicators, and reserved space create the perception of speed even when actual load times remain the same.

---

## Requirements Summary

| Requirement | Implementation | Impact |
|-------------|----------------|--------|
| Skeleton screens | Placeholder shapes matching content layout | Perceived speed |
| Loading text ellipsis | End loading messages with `…` (U+2026) | Consistent convention |
| Reserve space | Fixed dimensions for async content containers | Prevents CLS |
| Spinner for actions | Inline spinner for button/form submissions | Action confirmation |
| Progressive loading | Show content as it arrives, not all-or-nothing | Earlier engagement |
| Error + retry | Show error state with retry action after failure | Recovery path |

---

## Code Examples

### Skeleton Screens

#### Incorrect

```tsx
// Empty screen while loading — feels broken
function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery(['user', userId], fetchUser);

  if (isLoading) return null; // Blank screen

  return <ProfileCard user={data} />;
}
```

#### Correct

```tsx
// Skeleton matches final layout shape
function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery(['user', userId], fetchUser);

  if (isLoading) {
    return (
      <div className="profile-skeleton">
        <div className="skeleton avatar" />
        <div className="skeleton name" />
        <div className="skeleton bio" />
        <div className="skeleton bio short" />
      </div>
    );
  }

  return <ProfileCard user={data} />;
}

// Skeleton CSS
function SkeletonStyles() {
  return (
    <style jsx global>{`
      .skeleton {
        background: linear-gradient(
          90deg,
          var(--skeleton-base) 25%,
          var(--skeleton-shine) 50%,
          var(--skeleton-base) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
      }

      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      @media (prefers-reduced-motion: reduce) {
        .skeleton {
          animation: none;
          background: var(--skeleton-base);
        }
      }

      .skeleton.avatar { width: 64px; height: 64px; border-radius: 50%; }
      .skeleton.name { width: 200px; height: 24px; margin-top: 12px; }
      .skeleton.bio { width: 100%; height: 16px; margin-top: 8px; }
      .skeleton.bio.short { width: 60%; }
    `}</style>
  );
}
```

### Loading Text Convention

#### Incorrect

```tsx
// Inconsistent loading text
<span>Loading</span>    // No ellipsis
<span>Loading...</span> // Three periods instead of ellipsis character
<span>Please wait</span> // Vague
```

#### Correct

```tsx
// Use ellipsis character (U+2026), specific action
<span>Loading\u2026</span>    // Loading…
<span>Saving\u2026</span>     // Saving…
<span>Uploading\u2026</span>  // Uploading…
<span>Searching\u2026</span>  // Searching…
```

### Reserving Space for Async Content

#### Incorrect

```css
/* Container has no height until content loads — causes CLS */
.image-gallery {
  /* Height is 0 until images load */
}
```

#### Correct

```css
/* Reserve space with aspect-ratio or min-height */
.image-gallery {
  aspect-ratio: 16 / 9;
  background: var(--skeleton-base);
}

/* Or fixed height for known content dimensions */
.chart-container {
  min-height: 400px;
  background: var(--skeleton-base);
}
```

### Button Loading State

#### Incorrect

```tsx
// Button shows no feedback during submission
function SubmitButton({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick}>Submit</button>;
  // User clicks multiple times because no feedback
}
```

#### Correct

```tsx
// Button shows loading state and prevents double-submit
function SubmitButton({ onClick, children }: SubmitButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <span className="spinner" aria-hidden="true" />
          Saving\u2026
        </>
      ) : (
        children
      )}
    </button>
  );
}
```

### Error State with Retry

#### Correct

```tsx
// Show error with recovery action
function DataSection({ queryKey, fetcher, children }: DataSectionProps) {
  const { data, error, isLoading, refetch } = useQuery(queryKey, fetcher);

  if (isLoading) return <Skeleton />;

  if (error) {
    return (
      <div role="alert" className="error-state">
        <p>Something went wrong loading this content.</p>
        <button type="button" onClick={() => refetch()}>
          Try again
        </button>
      </div>
    );
  }

  return children(data);
}
```

---

## Testing Guidance

### Manual Testing

1. **Throttle network**: Set to Slow 3G — skeleton screens should appear, not blank space
2. **CLS check**: Run Lighthouse — no layout shift when async content arrives
3. **Loading text**: Verify all loading indicators use ellipsis character (…)
4. **Button states**: Click submit — button should show loading and prevent re-click

### Anti-Patterns to Flag

```
return null during loading          → Show skeleton screen
Loading... (three periods)          → Use … (U+2026 ellipsis)
No min-height on async containers   → Reserve space with aspect-ratio or min-height
Button with no loading feedback     → Add spinner + disabled state
```

---

## WCAG Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages) | AA | Loading/success/error states announced to screen readers |
| [2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide) | A | Animated loading indicators can be paused |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships) | A | aria-busy communicates loading state |
