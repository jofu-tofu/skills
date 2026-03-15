# Reduced Motion

## Impact: HIGH

Excessive or unexpected motion can cause physical symptoms including nausea, dizziness, and headaches for users with vestibular disorders. Approximately 35% of adults over 40 have experienced some form of vestibular dysfunction.

## Why It Matters

Motion on screen can trigger vestibular responses in sensitive users, causing symptoms ranging from mild discomfort to severe vertigo. Parallax effects, animated backgrounds, and auto-playing videos are common triggers. Users with these conditions often must stop using sites entirely if motion cannot be controlled. Respecting the `prefers-reduced-motion` media query is essential for inclusive design.

---

## Rule 1: Respect prefers-reduced-motion

### Incorrect - Animation Ignores User Preference

```css
/* Animation plays regardless of user settings */
.hero-section {
  animation: parallax 2s infinite;
}

@keyframes parallax {
  0% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0); }
}
```

```tsx
// React component ignoring motion preferences
function AnimatedCard() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      <CardContent />
    </motion.div>
  );
}
```

### Correct - Motion-Safe Implementation

```css
/* Base styles with no motion */
.hero-section {
  /* Static by default */
}

/* Animation only when motion is acceptable */
@media (prefers-reduced-motion: no-preference) {
  .hero-section {
    animation: parallax 2s infinite;
  }
}

/* Or disable animations when reduced motion is preferred */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```tsx
// React hook for motion preferences
function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

// Component respecting motion preferences
function AnimatedCard() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={reducedMotion ? {} : { y: [0, -10, 0] }}
      transition={reducedMotion ? {} : { repeat: Infinity, duration: 2 }}
    >
      <CardContent />
    </motion.div>
  );
}
```

---

### Global Animation Kill Switch

```css
/* Global reduced-motion reset — use as a baseline */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This pattern provides a safety net that catches any animation missed by component-level handling. The 0.01ms duration (not 0) ensures `animationend` events still fire, preventing JavaScript from breaking.

---

## Rule 2: Disable Autoplay for Motion Content

### Incorrect - Auto-Playing Animation

```html
<!-- Video autoplays without user consent -->
<video autoplay loop muted>
  <source src="background-animation.mp4" type="video/mp4">
</video>

<!-- GIF that animates automatically -->
<img src="loading-spinner.gif" alt="Loading">
```

```tsx
// Component with uncontrolled animation
function BackgroundVideo() {
  return (
    <video autoPlay loop muted className="bg-video">
      <source src="/hero-animation.mp4" type="video/mp4" />
    </video>
  );
}
```

### Correct - Motion-Controlled Implementation

```html
<!-- Video respects reduced motion -->
<video id="bg-video" loop muted poster="static-frame.jpg">
  <source src="background-animation.mp4" type="video/mp4">
</video>

<script>
  const video = document.getElementById('bg-video');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!prefersReducedMotion.matches) {
    video.play();
  }
</script>
```

```tsx
// Motion-aware video component
function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (videoRef.current) {
      if (reducedMotion) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [reducedMotion]);

  return (
    <video
      ref={videoRef}
      loop
      muted
      poster="/static-frame.jpg"
      className="bg-video"
    >
      <source src="/hero-animation.mp4" type="video/mp4" />
    </video>
  );
}
```

---

## Rule 3: Provide Pause Controls

### Incorrect - No Way to Stop Animation

```html
<div class="carousel" data-auto-rotate="true">
  <!-- No pause button, user cannot stop rotation -->
</div>

<div class="notification" style="animation: pulse 1s infinite;">
  New message!
</div>
```

### Correct - User-Controllable Animation

```html
<div class="carousel" data-auto-rotate="true">
  <button
    class="carousel-pause"
    aria-pressed="false"
    aria-label="Pause carousel rotation"
  >
    Pause
  </button>
</div>
```

```tsx
// Carousel with pause controls
function AutoRotatingCarousel({ slides }: { slides: Slide[] }) {
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Start paused if user prefers reduced motion
    if (reducedMotion) {
      setIsPaused(true);
      return;
    }

    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, reducedMotion, slides.length]);

  return (
    <div className="carousel" aria-roledescription="carousel">
      <button
        onClick={() => setIsPaused(!isPaused)}
        aria-pressed={isPaused}
        aria-label={isPaused ? "Resume carousel" : "Pause carousel"}
      >
        {isPaused ? "Play" : "Pause"}
      </button>

      {/* Carousel content */}
    </div>
  );
}
```

---

## Rule 4: Avoid Flashing Content

### Incorrect - Potentially Seizure-Inducing Content

```css
/* Rapid flashing is dangerous */
.alert {
  animation: flash 0.1s infinite alternate;
}

@keyframes flash {
  from { background: red; }
  to { background: white; }
}
```

### Correct - Safe Attention-Getting Animation

```css
/* Gentle pulse that respects reduced motion */
@media (prefers-reduced-motion: no-preference) {
  .alert {
    animation: gentle-pulse 2s ease-in-out 3; /* Limited iterations */
  }
}

@keyframes gentle-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
}

/* Static alternative for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .alert {
    border: 3px solid red;
    /* No animation, uses static styling */
  }
}
```

---

## Rule 5: Provide Alternative Transitions

### Incorrect - Motion-Only Transitions

```css
/* Page transition with heavy motion */
.page-enter {
  transform: translateX(100%);
  opacity: 0;
}

.page-enter-active {
  transform: translateX(0);
  opacity: 1;
  transition: transform 500ms, opacity 500ms;
}
```

### Correct - Reduced Motion Alternatives

```css
/* Default: subtle fade only */
.page-enter {
  opacity: 0;
}

.page-enter-active {
  opacity: 1;
  transition: opacity 200ms ease-out;
}

/* Full animation for users who haven't opted out */
@media (prefers-reduced-motion: no-preference) {
  .page-enter {
    transform: translateX(100%);
    opacity: 0;
  }

  .page-enter-active {
    transform: translateX(0);
    opacity: 1;
    transition: transform 500ms ease-out, opacity 500ms ease-out;
  }
}
```

```tsx
// React transition with motion awareness
function PageTransition({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();

  const variants = reducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { x: '100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '-100%', opacity: 0 },
        transition: { duration: 0.3, ease: 'easeOut' },
      };

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={variants.transition}
    >
      {children}
    </motion.div>
  );
}
```

---

## Testing Guidance

### Manual Testing
1. Enable "Reduce motion" in OS settings
   - **macOS**: System Preferences > Accessibility > Display > Reduce motion
   - **Windows**: Settings > Ease of Access > Display > Show animations
   - **iOS**: Settings > Accessibility > Motion > Reduce Motion
   - **Android**: Settings > Accessibility > Remove animations
2. Verify all animations are disabled or reduced
3. Check that pause controls work
4. Verify no content flashes more than 3 times per second

### Screen Reader Testing
- Verify animated content has static alternative
- Check that live regions update appropriately

### Automated Testing

```javascript
// Test for respecting prefers-reduced-motion
import { render, screen } from '@testing-library/react';

// Mock reduced motion preference
function mockReducedMotion(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  });
}

test('animations disabled with reduced motion preference', () => {
  mockReducedMotion(true);
  const { container } = render(<AnimatedComponent />);

  const animatedElement = container.querySelector('.animated');
  const styles = getComputedStyle(animatedElement);

  expect(styles.animation).toBe('none');
});

test('carousel starts paused with reduced motion', () => {
  mockReducedMotion(true);
  render(<AutoRotatingCarousel slides={mockSlides} />);

  const pauseButton = screen.getByRole('button', { name: /pause/i });
  expect(pauseButton).toHaveAttribute('aria-pressed', 'true');
});

test('video does not autoplay with reduced motion', () => {
  mockReducedMotion(true);
  const { container } = render(<BackgroundVideo />);

  const video = container.querySelector('video');
  expect(video.paused).toBe(true);
});
```

---

## WCAG Success Criteria

| Criterion | Level | Description |
|-----------|-------|-------------|
| **2.2.2 Pause, Stop, Hide** | A | Moving content can be paused, stopped, or hidden |
| **2.3.1 Three Flashes or Below** | A | No content flashes more than 3 times/second |
| **2.3.2 Three Flashes** | AAA | No content flashes at all |
| **2.3.3 Animation from Interactions** | AAA | Motion can be disabled |

---

## Quick Reference

| Content Type | Reduced Motion Approach |
|--------------|------------------------|
| Background video | Show static poster image |
| Parallax scrolling | Disable entirely |
| Page transitions | Use fade instead of slide |
| Loading spinners | Use static indicator or subtle pulse |
| Hover animations | Instant state change |
| Auto-rotating carousels | Start paused, provide controls |
| Animated illustrations | Show static version |
