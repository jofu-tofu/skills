# Layout and Theming — Tailwind CSS

> Responsive layouts and consistent theming are unified through Tailwind's mobile-first breakpoints and design token system.

## Mental Model

Layout and theming are the structural backbone of any Tailwind project. Responsive design starts mobile-first — base styles define the smallest screen, and breakpoint prefixes (sm:, md:, lg:) layer on complexity. This prevents the common anti-pattern of designing for desktop first and then patching for mobile. Container queries extend this further, letting components respond to their parent's size rather than the viewport. Theming completes the picture: design tokens (colors, spacing, typography) defined in the Tailwind config create a single source of truth that CSS variables can expose for runtime switching (dark mode, brand themes). The discipline is using these tokens everywhere instead of hardcoded values — when every color is a token and every spacing value comes from the scale, theme changes propagate instantly and consistently.

## Consumer Guide

### When Reviewing Code

- Verify mobile-first breakpoint ordering (no reverse breakpoints).
- Check for hardcoded pixel values that should use the spacing scale.
- Flag non-token colors and missing dark mode variants.
- Confirm container queries are used for reusable components.

### When Designing / Planning

- Define breakpoint strategy before building layouts.
- Establish design token palette in tailwind.config.
- Plan dark mode and theme switching approach upfront.

### When Implementing

- Start with base (mobile) styles, add breakpoint prefixes for larger screens.
- Use CSS custom properties for runtime theme values.
- Apply dark: variant consistently alongside default styles.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| MobileFirstBreakpoints | CRITICAL | Unprefixed = all screens; sm: = 640px+, not "small screens" |
| BreakpointConsistency | HIGH | Use standard breakpoints, not arbitrary min-[...] values |
| ContainerQueryUsage | HIGH | Use @container queries for component-level responsive design [v4] |
| ConsistentSpacingDirection | MEDIUM | Pick one margin direction or use gap/space-y on parents |
| DarkModeStrategyChoice | CRITICAL | Choose media (OS-only) vs selector (user toggle) deliberately |
| SemanticColorTokens | HIGH | Use semantic names (primary, surface) instead of raw palette colors |
| DarkModeCustomProperties | HIGH | Use CSS custom properties to reduce dark: repetition |
| ThemeOverRootForTokens | HIGH | In v4, use @theme for tokens that need utility classes |

#### ResponsiveDesign

---

### TW3.1 Understand Mobile-First Breakpoint Behavior

**Impact: CRITICAL (misunderstanding breakpoints causes broken layouts)**

Tailwind uses min-width breakpoints. Unprefixed utilities apply to ALL screen sizes. `sm:` means "640px and above," NOT "small screens." Style mobile first with unprefixed utilities, then add overrides for larger screens with `sm:`, `md:`, `lg:`.

**Incorrect: wrong mental model — trying to target "small screens" with sm:**

```html
<!-- This makes it flex on mobile, block on 640px+ (backwards!) -->
<div class="flex sm:block">
```

**Correct: mobile-first — start with mobile layout, override upward**

```html
<div class="block sm:flex sm:items-center lg:justify-between">
```

---

### TW3.2 Use Standard Breakpoints, Not Arbitrary min-[...] Values

**Impact: HIGH (ad-hoc breakpoints create visual inconsistency)**

Use Tailwind's default breakpoints consistently. Avoid `min-[840px]` or `max-[1100px]` — they create inconsistency and are harder to maintain. If your design system needs different breakpoints, redefine them in the Tailwind config globally.

**Incorrect: ad-hoc arbitrary breakpoints**

```html
<div class="min-[840px]:flex min-[1100px]:grid">
```

**Correct: standard breakpoints from config**

```html
<div class="md:flex lg:grid">
```

---

### TW3.3 Use Container Queries for Component-Level Responsive Design [v4]

**Impact: HIGH (makes components truly portable across layout contexts)**

Use `@container` queries for components that must adapt to their parent's width, not the viewport. Mark the parent with `@container` and use `@sm:`, `@md:` on children. This makes components work correctly whether placed in a full-width area or a narrow sidebar.

**Incorrect: viewport-based — breaks when component is in a sidebar**

```html
<div class="grid grid-cols-1 md:grid-cols-3">
  <div>Card</div>
```

**Correct: container-based — responds to actual available space**

```html
<div class="@container">
  <div class="grid grid-cols-1 @md:grid-cols-3">
    <div>Card</div>
```

---

### TW3.4 Pick One Spacing Direction Convention or Use Gap

**Impact: MEDIUM (mixing margin directions causes unpredictable spacing)**

Pick one margin direction convention (`mt-`/`ml-` or `mb-`/`mr-`) and stick with it. Better yet, use `space-y-*` on parent containers or `gap-*` on flex/grid parents to eliminate the problem entirely.

**Incorrect: inconsistent margin directions**

```html
<h2 class="mb-4">Title</h2>
<p class="mt-6">Content</p>
```

**Correct: consistent spacing via parent**

```html
<div class="space-y-4">
  <h2>Title</h2>
  <p>Content</p>
</div>
```

#### Theming

---

### TW4.1 Choose Media vs Selector Dark Mode Strategy Deliberately

**Impact: CRITICAL (wrong strategy prevents user-togglable dark mode)**

Choose between `media` (follows OS preference automatically) and `selector` (manual toggle via class or data attribute). Use `selector` if you need a user-controlled toggle. Use `media` only if you never need manual control. In v3.4.1+, `selector` replaces the older `class` strategy with more flexibility.

**Incorrect: using media strategy but trying to toggle with JS**

```js
// tailwind.config.js — darkMode: 'media' (default)
// This does NOTHING with media strategy:
document.documentElement.classList.add('dark');
```

**Correct: selector strategy for user-controlled toggle**

```js
// tailwind.config.js
darkMode: 'selector',
```
```js
// Toggle in JS
document.documentElement.classList.toggle('dark');
```

---

### TW4.2 Use Semantic Color Names Instead of Raw Palette Colors

**Impact: HIGH (raw palette colors allow inconsistent usage across a codebase)**

Replace Tailwind's default palette (`blue-500`, `gray-200`) with project-specific semantic names (`primary`, `surface`, `on-surface`). Semantic tokens enforce design system consistency and make theming/rebranding trivial.

**Incorrect: raw palette colors scattered throughout**

```html
<button class="bg-blue-500 hover:bg-blue-600 text-white">Save</button>
<a class="text-blue-600 hover:text-blue-700">Link</a>
```

**Correct: semantic tokens via theme config**

```css
/* Tailwind v4 */
@theme {
  --color-primary: oklch(0.55 0.24 262);
  --color-primary-hover: oklch(0.48 0.24 262);
}
```
```html
<button class="bg-primary hover:bg-primary-hover text-white">Save</button>
```

---

### TW4.3 Use CSS Custom Properties to Reduce dark: Repetition

**Impact: HIGH (reduces dark: variants from every element to a single definition)**

Define light/dark color values as CSS custom properties and reference them via Tailwind config. This avoids duplicating `dark:` on every element and enables multi-theme support beyond just light/dark.

**Incorrect: dark: prefix on every single element**

```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <p class="text-gray-600 dark:text-gray-300">Body</p>
  <span class="text-gray-500 dark:text-gray-400">Muted</span>
</div>
```

**Correct: CSS custom properties toggled once at root**

```css
:root { --color-bg: #ffffff; --color-text: #111827; --color-muted: #4b5563; }
.dark { --color-bg: #111827; --color-text: #ffffff; --color-muted: #d1d5db; }
```
```html
<div class="bg-[var(--color-bg)] text-[var(--color-text)]">
  <p class="text-[var(--color-muted)]">Body</p>
</div>
```

---

### TW4.4 In v4, Use @theme for Tokens That Need Utility Classes [v4]

**Impact: HIGH (only @theme generates corresponding utility classes)**

In Tailwind v4, `@theme` both defines CSS custom properties AND generates utility classes. Use `@theme` for design tokens that should be usable as utilities (colors, spacing, fonts). Use `:root` for values that don't need utilities (transition speeds, z-index layers).

**Incorrect: :root for values you want as utilities**

```css
:root { --brand-color: #3b82f6; }
/* No bg-brand-color or text-brand-color utility is generated */
```

**Correct: @theme for values that need utility classes**

```css
@theme {
  --color-brand: #3b82f6; /* Generates bg-brand, text-brand, border-brand, etc. */
}
:root {
  --transition-speed: 200ms; /* No utility needed */
}
```

## Does Not Cover

- Utility-first philosophy and when to extract components (see Philosophy).
- Class ordering and Tailwind Merge patterns (see ClassOrganization).
- ARIA attributes and accessible color contrast (see Accessibility).

## Sources

- Tailwind CSS official documentation — Responsive Design
- Tailwind CSS official documentation — Dark Mode and Theming
- Adam Wathan — Utility-First CSS
