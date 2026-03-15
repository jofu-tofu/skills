# Anti-Patterns Quick Reference

Quick-scan checklist for code review. Each anti-pattern references the rule file with the correct implementation.

## Critical — Fix Immediately

| Anti-Pattern | Why | Rule |
|-------------|-----|------|
| `user-scalable=no` or `maximum-scale=1` | Disables zoom — WCAG 1.4.4 violation | LayoutFundamentals |
| `<div>` or `<span>` with click handlers | Not focusable, no keyboard support, wrong role | SemanticHtmlFirst |
| `outline: none` without `:focus-visible` replacement | Removes all focus indicators | FocusIndicators |
| Form inputs without `<label>` | Screen readers cannot identify field purpose | AccessibleForms |
| `<img>` without `alt` attribute | Completely inaccessible to screen readers | AlternativeText |
| Icon buttons without `aria-label` | Screen reader announces nothing or filename | ButtonVsLink |

## High — Fix in Current Sprint

| Anti-Pattern | Why | Rule |
|-------------|-----|------|
| `onPaste` with `preventDefault` | Blocks password managers, assistive tech | FormSafety |
| `transition: all` | Animates unintended properties, causes jank | AnimationTechniques |
| Inline `onClick` navigation without `<a>` | Breaks Cmd/Ctrl+click, middle-click, right-click menu | ButtonVsLink |
| `<img>` without `width` and `height` | Causes Cumulative Layout Shift (CLS) | ImageOptimization |
| Hardcoded date/number formats | Breaks for international users | IntlFormatting |
| `autoFocus` without justification | Opens keyboard on mobile, shifts focus unexpectedly | InteractionBehavior |
| Large arrays `.map()` without virtualization | Thousands of DOM nodes, slow scroll | RenderPerformance |

## Medium — Fix When Touching File

| Anti-Pattern | Why | Rule |
|-------------|-----|------|
| `z-index: 9999` | Ad-hoc layering, unpredictable stacking | LayoutFundamentals |
| No `overflow-x: hidden` on page container | Horizontal scrollbar on mobile | OverflowHandling |
| Flex children without `min-width: 0` | Text truncation breaks in flex containers | OverflowHandling |
| `cursor: default` on clickable elements | No affordance signal that element is interactive | HoverStates |
| Hover styles without `@media (hover: hover)` | Ghost hover state sticks on touch devices | HoverStates |
| No `loading="lazy"` on below-fold images | All images load immediately, blocking resources | ImageOptimization |
| `@font-face` without `font-display: swap` | Flash of invisible text during font load | ResourcePreloading |
| No `overscroll-behavior: contain` on modals | Scroll chains to parent page | InteractionBehavior |

## Style — Improve When Convenient

| Anti-Pattern | Why | Rule |
|-------------|-----|------|
| Body text in `slate-400` | Insufficient contrast — use `slate-900` (#0F172A) | ContrastRatios |
| `border-white/10` in light mode | Nearly invisible borders — use `border-gray-200` | ColorIndependence |
| Emojis instead of SVG icons | Inconsistent across platforms, not styleable | ColorIndependence |
| Three periods `...` instead of `…` (U+2026) | Typographically incorrect | TypographicDetails |
| `Loading...` without ellipsis character | Convention is `Loading…` with U+2026 | LoadingStates |

---

## How to Use This Checklist

1. **During code review**: Scan changed files against Critical and High sections
2. **During refactoring**: Check Medium section when modifying a file
3. **Each anti-pattern links to a rule**: Read the referenced rule for correct implementation and code examples
4. **Automated detection**: Many patterns are flaggable with ESLint, axe-core, or custom lint rules
