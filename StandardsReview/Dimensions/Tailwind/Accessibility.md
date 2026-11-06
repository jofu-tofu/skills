# Accessibility — Tailwind CSS

> Tailwind handles styling, not semantics; every accessibility requirement must be explicitly implemented because no utility class can substitute for correct HTML structure and ARIA attributes.

## Mental Model

Tailwind is a visual styling framework. It makes elements look right but does nothing to make them work right for assistive technologies, keyboard users, or people with motion sensitivities. This distinction is critical because the utility-first workflow can create a false sense of completeness: an icon button that looks perfect with `p-2 rounded` may lack an accessible name unless it has suitable text content, `aria-label` or `aria-labelledby`. An unnamed button can still be exposed as a button; its purpose is unclear. Accessibility in Tailwind is a parallel concern that requires deliberate attention at every element.

The accessibility surface in Tailwind spans five areas. Screen reader support uses the `sr-only` utility to provide text that is visually hidden but announced by assistive technologies. Icon-only controls need an accessible name. Decorative images should normally be hidden from assistive technology (for example an empty alt on decorative img elements), not given redundant names; informative indicators need an appropriate text alternative. The `sr-only` class applies a clip-based hiding technique that keeps the text in the accessibility tree without affecting visual layout.

Keep a visible keyboard focus indicator. `focus-visible:` follows browser heuristics, including keyboard use and some pointer-focused text inputs; it is not keyboard-only. `focus:` is an accessible alternative that shows the indicator whenever focused. Prefer focus-visible when the design calls for that distinction, without treating focus as a defect.

Motion sensitivity affects users with vestibular disorders who enable "prefer reduced motion" in their OS settings. The `motion-reduce:` variant allows disabling or simplifying animations and transitions for these users. Every `transition-*`, `animate-*`, and `hover:scale-*` utility should have a `motion-reduce:` counterpart that removes or subdues the motion.

Touch target sizing ensures interactive elements are large enough to tap accurately on mobile devices. WCAG 2.2 SC 2.5.8 (AA) uses 24x24 CSS pixels, with spacing, equivalent-control, inline, user-agent and essential exceptions. SC 2.5.5 (AAA) uses 44x44 CSS pixels with its own exceptions. A house default of 44x44 is useful but exceeds the AA size requirement. `min-h-11 min-w-11` is 2.75rem under the default scale (44px only with a 16px root font); verify actual dimensions. Small icon buttons are the most common violators.

Contrast compliance ensures text is readable against its background. Tailwind's default palette does not guarantee WCAG AA compliance. For example, `text-gray-400` on white has approximately a 2.54:1 ratio with the v3 #9ca3af value, failing the 4.5:1 AA requirement for normal text. Developers must verify contrast ratios for every text-background combination, in both light and dark modes.

The build safety rules in this dimension protect accessibility at the toolchain level. Constructing class names from fragments prevents source detection unless the complete names are detected elsewhere or explicitly included. Complete literal classes inside conditional expressions or template literals are detectable. This affects CSS generation in development as well as production. If an absent utility is `sr-only`, the screen reader text becomes visible. If an absent utility is `focus-visible:ring-2`, the focus indicator disappears. Ensure relevant sources are scanned or their required utilities are explicitly included; otherwise unique classes may be missing. Safelisting should be minimal and targeted; over-safelisting bloats the CSS bundle. Arbitrary values (`p-[13px]`) should be limited and extracted to theme tokens when repeated, keeping the design system consistent and the CSS output manageable.

## Consumer Guide

### When Reviewing Code

Check every icon-only button and link for `sr-only` text or `aria-label`. Verify visible keyboard focus with `focus-visible:`, `focus:` or an effective browser default. Look for animations and transitions that lack `motion-reduce:` alternatives. Measure touch targets against the applicable WCAG criterion and exceptions; use `min-h-11 min-w-11` only as one way to meet the 44px house default under the stated scale assumptions. Audit text-background color combinations against WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text) in both light and dark modes. Check for class names assembled from fragments; complete literals in conditional expressions are safe for detection. Verify content configuration paths include all file types. Flag safelisted patterns that should be lookup maps instead.

### When Designing / Planning

Specify accessible labels for every icon-only control in the design. Define the focus indicator style as part of the design system (ring color, width, offset). Plan `motion-reduce` behavior for every animation: does it stop entirely, reduce to a simple fade, or just shorten duration? Set minimum touch target sizes in the component specification (44x44px recommended). Verify contrast ratios during the design phase using tools like the WebAIM contrast checker. Document which colors pass WCAG AA and which do not. Plan the content configuration to cover all template file locations. Establish a policy for arbitrary values: when are they acceptable, and when must they become theme tokens?

### When Implementing

Add `sr-only` spans or `aria-label` to every icon-only interactive element. Mark decorative icons with `aria-hidden="true"`. Use `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none` as the default focus indicator pattern. Add `motion-reduce:transition-none` or `motion-reduce:animate-none` to every element with transitions or animations. Set `min-h-11 min-w-11` on icon buttons and other small interactive targets. Use `text-gray-600` or darker on white backgrounds for body text (gray-400 fails WCAG AA). Never construct class names dynamically; use complete strings in lookup maps. In v3 configure content paths for the project's actual template files; in v4 verify automatic detection and add @source where needed. Safelist only truly external dynamic classes (CMS content, user-selected themes). Consider shared tokens for repeated design values (v4 @theme; v3 theme.extend); repetition alone does not increase generated rules.

## Applicability

Assess actual accessibility impact and the applicable WCAG level. Focus-variant choice, a 44px house default and token extraction are not automatically critical defects. Examples use default scales unless stated; measure rendered output under the real theme.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| ScreenReaderOnlyUsage | CRITICAL | Give icon-only controls an accessible name (text or ARIA) |
| FocusVisibleOverFocus | LOW | Keep visible keyboard focus; focus-visible: is a design preference |
| ReducedMotionRespect | HIGH | Provide motion-reduce: alternatives for all animations |
| MinimumTouchTargetSize | CRITICAL | Meet applicable 24px AA/44px AAA criteria and exceptions; prefer 44px by policy |
| ContrastRatioCompliance | CRITICAL | Verify WCAG AA contrast ratios for all text colors |
| NoDynamicClassConstruction | CRITICAL | Keep complete detectable class names; avoid fragments |
| SafelistSparingly | HIGH | Only safelist genuinely dynamic external-source classes |
| LimitArbitraryValues | LOW | Extract repeated arbitrary values into theme tokens |
| ContentConfigurationPaths | CRITICAL | Include all file types that reference Tailwind classes |


---

### TW5.1 Give Icon-Only Controls an Accessible Name

**Impact: CRITICAL (unnamed controls do not communicate their purpose)**

Icon-only buttons and links need an accessible name from text content (including `sr-only` text), `aria-label` or `aria-labelledby`. One suitable naming method is sufficient; `sr-only` is not mandatory. Tailwind handles styling, not semantics — you are responsible for semantic HTML and ARIA attributes.

**Incorrect: no accessible label**

```html
<button class="p-2">
  <svg><!-- close icon --></svg>
</button>
```

**Correct: sr-only text provides accessible label**

```html
<button class="p-2">
  <svg aria-hidden="true"><!-- close icon --></svg>
  <span class="sr-only">Close dialog</span>
</button>
```

---

### TW5.2 Preserve Visible Focus; Prefer focus-visible: Where Appropriate

**Impact: LOW (choice of focus variant is policy; missing keyboard focus can be serious)**

Use a visible keyboard focus style. `focus-visible:` follows browser heuristics and may match pointer-focused text inputs or scripted focus; it is not restricted to keyboard events. `focus:` is also accessible. Select between them according to the design, and never remove the browser outline without an effective replacement.

**Valid alternative: ring for every focused state**

```html
<button class="focus:ring-2 focus:ring-blue-500">Click</button>
```

**Preferred when matching browser focus-indication heuristics**

```html
<button class="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none">
  Click
</button>
```

---

### TW5.3 Provide motion-reduce: Alternatives for All Animations

**Impact: HIGH (users with vestibular disorders experience discomfort from animations)**

Use `motion-reduce:` variant to disable or simplify animations for users who have enabled "prefer reduced motion" in OS settings. Apply to all transitions and animations.

**Incorrect: animation with no reduced-motion alternative**

```html
<div class="transition-transform duration-300 hover:scale-105">
```

**Correct: motion-reduce variant disables the animation**

```html
<div class="transition-transform duration-300 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100">
```

---

### TW5.4 Meet Applicable Target-Size Criteria; Prefer 44x44px by Policy

**Impact: CRITICAL (small touch targets cause mis-taps on mobile devices)**

WCAG 2.2 SC 2.5.8 (AA) requires 24x24 CSS pixels or an applicable exception, including sufficient spacing around undersized targets. SC 2.5.5 (AAA) specifies 44x44 CSS pixels with separate exceptions. Use 44x44 as a house default where practical, not as a universal AA minimum. Default `min-h-11 min-w-11` is 2.75rem; verify computed size when root font or spacing tokens change.

**Below the 44px house default, but not inherently an AA size failure (default 24px target)**

```html
<button class="p-1">
  <svg class="h-4 w-4"><!-- icon --></svg>
</button>
```

**Preferred house size: normally 44x44px with default scale and 16px root font**

```html
<button class="inline-flex min-h-11 min-w-11 items-center justify-center p-2">
  <svg class="h-5 w-5" aria-hidden="true"><!-- icon --></svg>
  <span class="sr-only">Delete item</span>
</button>
```

---

### TW5.5 Verify WCAG AA Contrast Ratios for Text Colors

**Impact: CRITICAL (Tailwind defaults do NOT guarantee contrast compliance)**

Ensure text meets WCAG AA contrast ratios: 4.5:1 for normal text, 3:1 for large text. Tailwind's default palette does not guarantee compliance — for example, `text-gray-400` (#9ca3af) on white has approximately 2.54:1 ratio, failing WCAG AA. Verify both light and dark mode using resolved colors: v4 uses OKLCH palette tokens and themes can override them. WCAG also has large-text, inactive-control and decorative-text distinctions.

**Incorrect: gray-400 on white fails WCAG AA (approximately 2.54:1 for v3 #9ca3af)**

```html
<p class="bg-white text-gray-400">Low contrast text</p>
```

**Correct: gray-600 on white passes WCAG AA (approximately 7.56:1 for v3 #4b5563)**

```html
<p class="bg-white text-gray-600">Readable text</p>
```

---

### TW5.6 Never Construct Class Names with String Interpolation

**Impact: CRITICAL (undetected required utilities may be absent from generated CSS)**

Tailwind scans source as text without evaluating JavaScript. Class-name fragments such as `bg-${color}-500` do not supply a complete candidate. Complete literals remain detectable inside conditionals, concatenations and template literals. A constructed class may still work if its complete name appears in another scanned file or is explicitly included; prefer local complete strings for reliable detection.

**Incorrect: Tailwind cannot detect these classes**

```jsx
<div className={`bg-${color}-500 text-${size}`}>
<div className={"bg-" + color + "-500"}>
```

**Correct: complete class strings in a lookup map**

```jsx
const colorMap = {
  blue: "bg-blue-500 text-white",
  red: "bg-red-500 text-white",
  green: "bg-green-500 text-white",
};
<div className={colorMap[color]}>
```

---

### TW5.7 Only Safelist Classes That Are Genuinely Dynamic from External Sources

**Impact: HIGH (over-safelisting bloats CSS bundle and defeats tree-shaking)**

Explicit inclusion requests utilities absent from scanned source: v3 uses the config safelist; v4.1+ uses @source inline(). Do not copy v3 safelist configuration into v4; for v4.0, register a source file containing complete required classes. Use it only for truly dynamic classes from CMS content or user-selected themes. Prefer lookup maps in code over safelisting.

**Incorrect: safelisting hundreds of classes "just in case"**

```js
// tailwind.config.js (v3)
safelist: [
  { pattern: /bg-(red|blue|green|yellow)-(100|200|300|400|500|600|700|800|900)/ },
]
```

**Correct: safelist only what's genuinely dynamic**

```js
// tailwind.config.js (v3)
safelist: ['bg-brand-primary', 'bg-brand-secondary']
// And prefer lookup maps in source code over safelisting
```
```css
/* v4.1+, assuming these custom color utilities are defined */
@source inline("bg-brand-primary bg-brand-secondary");
```

---

### TW5.8 Extract Repeated Arbitrary Values into Theme Tokens

**Impact: LOW (shared tokens are a design-system policy; identical candidates share CSS)**

Arbitrary values (`p-[13px]`, `w-[237px]`) are an escape hatch, not a primary tool. Each distinct utility candidate can generate CSS; repeating the identical `p-[13px]` class does not generate another rule per occurrence. Extract shared design values into tokens when their meaning and reuse justify it; this is a consistency policy, not a guaranteed output-size saving.

**Incorrect: same arbitrary values in multiple files**

```html
<!-- ComponentA.tsx -->
<div class="w-[340px] p-[13px]">
<!-- ComponentB.tsx -->
<div class="max-w-[340px] p-[13px]">
```

**House preference: v4 theme tokens (v3 uses theme.extend configuration)**

```css
@theme {
  --container-card: 340px; /* v4 width/max-width container namespace */
  --spacing-card: 0.8125rem;
}
```
```html
<div class="w-card p-card">
```

---

### TW5.9 Include All File Types That Reference Tailwind Classes in Content Config

**Impact: CRITICAL (required utilities may be absent when no scanned or explicit source includes them)**

In v3, configure the `content` array to include all files that reference Tailwind classes — HTML, JSX, TSX, Vue, Svelte, and JS files that dynamically toggle classes. In v4, auto-detection handles most cases, but use `@source` for non-standard paths.

**Incorrect: content config misses JSX/TSX files**

```js
// tailwind.config.js (v3)
content: ['./src/**/*.html']
// Misses .jsx, .tsx, .vue, .svelte files
```

**Correct: include all file types that use Tailwind**

```js
// tailwind.config.js (v3)
content: ['./src/**/*.{html,js,jsx,ts,tsx,vue,svelte}']
```
```css
/* v4: auto-detects, but add non-standard paths if needed */
@import "tailwindcss";
@source "../content/**/*.md";
```


## Rule Interactions

- **NoDynamicClassConstruction + ContentConfigurationPaths** are the two sides of build safety: class names assembled from fragments cannot be derived by scanning, and excluded source files are not scanned. Either can leave required utilities ungenerated unless they are detected elsewhere or explicitly included. Complete literal classes in conditional expressions remain detectable.
- **ScreenReaderOnlyUsage + NoDynamicClassConstruction** have a dangerous interaction: constructing `sr-only` from fragments can omit its CSS. A complete `sr-only` literal inside a conditional is detectable.
- **FocusVisibleOverFocus + ContrastRatioCompliance** both affect visibility: focus rings must have sufficient contrast against the background, and the ring color choice intersects with the contrast compliance rules.
- **ReducedMotionRespect + MinimumTouchTargetSize** are independent accessibility axes: motion sensitivity and touch target sizing affect different user populations and do not interact technically, but both must be addressed for comprehensive accessibility.
- **SafelistSparingly + LimitArbitraryValues** both address design system hygiene: over-safelisting and arbitrary value proliferation both indicate that the design system has gaps. The fix is often the same: add proper theme tokens.
- **ContrastRatioCompliance** must be verified in both light and dark themes, connecting this dimension to the Theming dimension.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Icon button without accessible name**: A `<button class="p-2"><svg>...</svg></button>` with no text alternative, `aria-label` or `aria-labelledby`. Screen reader users cannot determine the button's purpose. This is a WCAG 4.1.2 failure.
- **Dynamic class construction**: Using `bg-${color}-500` in a template literal. Tailwind cannot derive a complete class name from those fragments. Unless detected elsewhere or explicitly included, the utility will be absent; assess the resulting visual or accessibility failure.
- **Missing content paths**: A `*.vue` or `*.svelte` file type omitted from content configuration. Utilities appearing only in excluded files may be absent; classes detected elsewhere or explicitly included still generate CSS.

### HIGH

- **Removing visible keyboard focus**: Suppressing outlines without an effective replacement harms navigation. Using `focus:ring-2` is a valid alternative to focus-visible styling, not itself an accessibility defect.
- **No motion-reduce alternative**: A hero section with `animate-bounce` and `transition-all` that continues animating regardless of OS reduced-motion preference. Users with vestibular disorders experience discomfort or nausea.
- **Low contrast text**: Using `text-gray-400` on `bg-white` for body text (approximately 2.54:1 for v3 #9ca3af). Fails WCAG AA for normal text (requires 4.5:1). Affects users with low vision and anyone in bright ambient light.
- **Over-safelisting**: Safelisting `bg-(red|blue|green|yellow)-(100|200|300|400|500|600|700|800|900)` can add unnecessary utilities (this example covers 36 base color/shade combinations before any variants). Use lookup maps in code instead.

### MEDIUM

- **Small touch targets**: An icon button at 32x32px that is usable on desktop but causes frequent mis-taps on mobile. Meets the AA size threshold but falls below the AAA threshold unless an exception applies; it may also miss the house default.
- **Repeated arbitrary values**: Using `p-[13px]` in five different components. The identical candidate generates shared CSS, not one rule per component. Extract a token for semantic consistency where useful; output savings are not guaranteed.

## Examples

**Accessible icon button with all protections:**

```html
<button
  class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg
         p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
         motion-reduce:transition-none"
>
  <svg class="h-5 w-5" aria-hidden="true"><!-- trash icon --></svg>
  <span class="sr-only">Delete item</span>
</button>
```

**Safe dynamic class selection:**

```jsx
// Complete strings in lookup map — scanner detects all classes
const statusColors = {
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
};

<span className={statusColors[status]}>{message}</span>
```

**Content configuration covering all file types:**

```js
// tailwind.config.js (v3)
content: ['./src/**/*.{html,js,jsx,ts,tsx,vue,svelte}']
```

```css
/* v4: auto-detects, but add non-standard paths */
@import "tailwindcss";
@source "../content/**/*.md";
```

**Both are detectable: complete class literals inside conditional expressions**

```jsx
// SAFE: sr-only and text-sm both occur as complete source tokens
<span className={`${isHidden ? 'sr-only' : ''} text-sm`}>
  {label}
</span>

// SAFE: complete class strings
<span className={isHidden ? 'sr-only text-sm' : 'text-sm'}>
  {label}
</span>
```

## Does Not Cover

- Semantic HTML structure and ARIA attribute correctness (framework-level concern, not Tailwind-specific)
- Utility-first philosophy and component extraction patterns (see Philosophy dimension)
- Responsive layout and breakpoint design (see ResponsiveDesign dimension)
- Dark mode strategy and token architecture (see Theming dimension)
- Class ordering and conflict resolution (see ClassOrganization dimension)

## Sources

- https://www.w3.org/WAI/ARIA/apg/patterns/button/
- https://www.w3.org/TR/selectors-4/#the-focus-visible-pseudo
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html
- https://tailwindcss.com/docs/detecting-classes-in-source-files
- https://v3.tailwindcss.com/docs/content-configuration
- https://tailwindcss.com/docs/theme
- https://tailwindcss.com/docs/width
- https://tailwindcss.com/docs/colors
- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- https://tailwindcss.com/blog/tailwindcss-v4-1
