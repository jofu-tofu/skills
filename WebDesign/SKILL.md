---
name: WebDesign
description: Web design, accessibility, and UI quality guidelines for building production interfaces. USE WHEN writing UI components OR reviewing UI code OR building forms OR fixing accessibility OR implementing WCAG OR keyboard navigation OR color contrast OR focus management OR responsive layout OR animation OR touch targets OR dark mode OR i18n OR reviewing design quality. Contains 41 rules across 10 priority categories.
compatibility: Designed for Claude Code and Devin (or similar agent products)
metadata:
  author: pai
  version: "1.0.0"
---

# WebDesign

Web design, accessibility, and UI quality guide for production interfaces. **41 rules across 10 categories, prioritized by impact.** Framework-agnostic patterns — WCAG 2.2 AA baseline. Works with React, Vue, Angular, or vanilla HTML/CSS/JS.

## When to Apply This Skill

**Automatic triggers:**
- Writing UI components (forms, modals, navigation, layouts)
- Code review for accessibility or UI quality
- Fixing accessibility issues or audit findings
- Implementing ARIA patterns or keyboard navigation
- Color contrast, focus indicators, or dark mode work
- Responsive layout, touch targets, or animation
- Building forms with validation and error handling
- Reviewing design quality or UI anti-patterns
- i18n formatting or platform-specific rendering

## Quick Decision Tree

**Start here — what are you doing?**

1. **Choosing HTML elements? Divs for buttons?** → Category 1: Semantic Structure & HTML (CRITICAL)
2. **Focus not working? Tab order wrong?** → Category 2: Keyboard & Focus (CRITICAL)
3. **Building a form? Input validation?** → Category 3: Forms & Inputs (HIGH)
4. **Color, contrast, typography, dark mode?** → Category 4: Visual Design & Contrast (HIGH)
5. **Responsive layout? Overflow? Safe areas?** → Category 5: Layout & Responsive (HIGH)
6. **Touch targets? Hover? Drag? Click feedback?** → Category 6: Touch & Interaction (HIGH)
7. **Images? Alt text? Copy guidelines?** → Category 7: Content & Media (MEDIUM)
8. **Animations? Transitions? Loading states?** → Category 8: Animation & Motion (MEDIUM)
9. **Slow rendering? Large lists? Lazy loading?** → Category 9: Performance & Loading (MEDIUM)
10. **i18n? Dates? Hydration? AI UI?** → Category 10: Internationalization & Platform (LOW-MEDIUM)

**For code review:** Read `AntiPatterns.md` for a quick-scan checklist.
**For data visualization:** Read `ChartsDataViz.md` for chart accessibility.
**For detailed implementation:** Read the specific rule file from `Rules/` folder.

## Priority Hierarchy

| Priority | Category | Impact | Key Pattern | Rules |
|----------|----------|--------|-------------|-------|
| 1 | Semantic Structure & HTML | CRITICAL | Native HTML > ARIA | 4 |
| 2 | Keyboard & Focus | CRITICAL | Focus management, Tab/Arrow | 5 |
| 3 | Forms & Inputs | HIGH | Labels, validation, input types | 5 |
| 4 | Visual Design & Contrast | HIGH | 4.5:1 contrast, readable type | 5 |
| 5 | Layout & Responsive | HIGH | Safe areas, overflow, reflow | 3 |
| 6 | Touch & Interaction | HIGH | 44px targets, hover states | 3 |
| 7 | Content & Media | MEDIUM | Alt text, plain language, modals | 5 |
| 8 | Animation & Motion | MEDIUM | Reduced motion, loading states | 3 |
| 9 | Performance & Loading | MEDIUM | Virtualization, preloading | 4 |
| 10 | Internationalization & Platform | LOW-MEDIUM | Intl API, hydration, AI transparency | 4 |

## Top 10 High-Impact Rules

These prevent the most common UI quality failures:

1. **SemanticHtmlFirst** - Use `<button>` not `<div role="button">` (prevents 90% of ARIA issues)
2. **FocusManagement** - Move focus to new content; restore on close
3. **ContrastRatios** - 4.5:1 for text, 3:1 for UI components
4. **AccessibleForms** - Labels, error messages via aria-describedby
5. **FocusIndicators** - Visible focus with 3:1 contrast, focus-visible
6. **TouchTargets** - Minimum 44x44px, adequate spacing
7. **ReadableTypography** - Line height, line length, font pairing, tabular-nums
8. **ReducedMotion** - prefers-reduced-motion for all animations
9. **ImageOptimization** - Width/height, lazy loading, fetchpriority, WebP
10. **AlternativeText** - Meaningful alt text; empty for decorative

## Examples

**Example 1: Building a Component**
```
User: "Build a dropdown menu"
→ Decision tree: Category 2 (Keyboard & Focus) + Category 1 (Semantic)
→ Read Rules/KeyboardPatterns.md + Rules/SemanticHtmlFirst.md
→ Apply: Arrow keys for options, Escape to close, native <button> trigger
```

**Example 2: Building a Form**
```
User: "Add a registration form"
→ Decision tree: Category 3 (Forms & Inputs)
→ Read Rules/AccessibleForms.md + Rules/FormInputTypes.md + Rules/FormValidation.md
→ Apply: Labels, autocomplete, inputmode, inline error messages
```

**Example 3: Code Review**
```
User: "Review this component for quality"
→ Read AntiPatterns.md for quick-scan checklist
→ Flag: outline:none without replacement, color-only errors, div buttons
→ Deep dive: Read specific rule files for flagged issues
```

## Reference Documentation

**All 41 rules are sharded into individual files in `Rules/` folder for efficient loading.**

### How to Use Rules

**Pattern:** When applying a rule, read its specific file from Rules/ folder.

```
Decision tree identifies: Category 3 (Forms & Inputs)
Quick ref shows: AccessibleForms rule
Action: Read Rules/AccessibleForms.md
Result: Complete code examples and WCAG references
```

### What's in Each Rule File

Each rule file (`Rules/RuleName.md`) includes:
- Why it matters (explanation + impact level)
- Multiple code examples (Incorrect/Correct patterns)
- Testing guidance (keyboard, screen reader, automated)
- WCAG success criteria references (where applicable)

### Rule File Naming Convention

Rules use TitleCase naming for PAI compliance:
- `semantic-html-first` → `Rules/SemanticHtmlFirst.md`
- `focus-management` → `Rules/FocusManagement.md`
- `form-validation` → `Rules/FormValidation.md`

## Complete Rule Index

### 1. Semantic Structure & HTML (CRITICAL)
- SemanticHtmlFirst
- LandmarkRegions
- HeadingHierarchy
- ListStructure

### 2. Keyboard & Focus (CRITICAL)
- FocusManagement
- KeyboardPatterns
- TabOrder
- SkipLinks
- FocusIndicators

### 3. Forms & Inputs (HIGH)
- AccessibleForms
- FormInputTypes
- FormValidation
- FormSubmission
- FormSafety

### 4. Visual Design & Contrast (HIGH)
- ContrastRatios
- ColorIndependence
- ReadableTypography
- TypographicDetails
- DarkModeTheming

### 5. Layout & Responsive (HIGH)
- LayoutFundamentals
- OverflowHandling
- ResponsiveText

### 6. Touch & Interaction (HIGH)
- TouchTargets
- HoverStates
- InteractionBehavior

### 7. Content & Media (MEDIUM)
- AlternativeText
- ImageOptimization
- PlainLanguageCopy
- ModalAccessibility
- ButtonVsLink

### 8. Animation & Motion (MEDIUM)
- ReducedMotion
- AnimationTechniques
- LoadingStates

### 9. Performance & Loading (MEDIUM)
- RenderPerformance
- ResourcePreloading
- UrlStateSync
- TimeoutAccessibility

### 10. Internationalization & Platform (LOW-MEDIUM)
- IntlFormatting
- HydrationSafety
- AgentTransparency
- UserControl

## Integration

This skill replaces the former AccessibleUI skill. All 23 original accessibility rules are preserved and enriched with web design best practices from Vercel Web Interface Guidelines and UI/UX Pro Max.

**Standard:** WCAG 2.2 Level AA
**Testing Tools:** axe-core, WAVE, Lighthouse Accessibility
**Screen Readers:** NVDA, VoiceOver, JAWS
**Complements React:** React skill covers component architecture and performance. This skill covers design quality, accessibility, and UI patterns — no duplication.
