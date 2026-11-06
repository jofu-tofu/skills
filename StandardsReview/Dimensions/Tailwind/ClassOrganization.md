# Class Organization — Tailwind CSS

> Well-organized utility classes are readable, predictable, and free of conflicts; poorly organized classes create merge conflicts, specificity surprises, and visual bugs.

## Mental Model

Tailwind markup can accumulate dozens of utility classes on a single element. Without organizational discipline, class lists become unreadable walls of text where conflicting properties hide in plain sight and merge conflicts occur on every PR. The solution operates at three levels: automated sorting, conflict prevention, and modifier hygiene.

Automated sorting via `prettier-plugin-tailwindcss` eliminates all ordering debates. The plugin enforces a consistent order following the box model: layout and positioning first, then box model properties, borders, backgrounds, typography, and finally decorative utilities. The order is intentionally not customizable, applying the same "one true format" philosophy as Prettier itself. With sorting automated, developers never argue about whether `flex` comes before `p-4`, and unnecessary class reordering is reduced.

Conflict prevention addresses a subtler problem. When two utilities target the same CSS property (like `p-3 p-4` or `text-sm text-lg`), the winning value depends on CSS source order, not the order in the class attribute. The class-list order alone therefore does not tell you the winner. The `eslint-plugin-tailwindcss/no-contradicting-classname` rule catches these statically. Remove accidental same-scope conflicts; breakpoint/state overrides and deliberate shorthand-plus-longhand composition are valid.

Shorthand utilities reduce class count without losing expressiveness. When horizontal margins are equal, `mx-4` replaces `ml-4 mr-4`. The `eslint-plugin-tailwindcss/enforces-shorthand` rule automates this check. The `!important` modifier (`!`) should be treated as a last resort, normally reserved for third-party overrides under the house policy. In v4, account for cascade-layer priority as well as specificity before choosing an override.

State modifiers (`group`, `peer`) enable pure-CSS parent-child and sibling-state interactions without JavaScript. The `group` modifier on a parent lets children react to the parent's hover, focus, or other states. When groups nest, named groups (`group/card`, `group/item`) disambiguate which ancestor is being targeted. The `peer` modifier works similarly for siblings, but has a strict DOM ordering requirement: the peer element must appear before the element that reacts to it, because it relies on the CSS `~` general sibling combinator.

For layout, the choice between flexbox and grid should follow dimensionality: flex for one-dimensional flows (nav bars, button groups), grid for two-dimensional layouts (card grids, page layouts). Prefer `gap` for grid and wrapping flex layouts. Margin-based `space-x`/`space-y` remains useful for simple linear stacks; conditional rendering alone does not make it invalid.

## Consumer Guide

### When Reviewing Code

Run or verify that `prettier-plugin-tailwindcss` is configured in the project. Check for contradicting classes on the same element (two padding values, two text sizes). Look for longhand utilities that could be shorthand (`ml-4 mr-4` instead of `mx-4`). Verify that `!` modifiers are justified with a comment explaining the third-party override. Check that nested group contexts use named groups. Confirm peer elements precede their styled siblings in DOM order. Validate that `gap` is used instead of `space-x`/`space-y` on flex-wrap or grid containers.

### When Designing / Planning

Establish tooling requirements early: `prettier-plugin-tailwindcss` for sorting, `eslint-plugin-tailwindcss` for conflict and shorthand detection. When designing interactive patterns that need parent-child state propagation (dropdown menus, card hover effects), plan for `group`/`group-hover` rather than JavaScript event handlers. For complex nested interactive components, define a naming convention for groups up front. Choose flex vs grid based on the layout dimensionality of each component.

### When Implementing

Install and configure `prettier-plugin-tailwindcss` so class sorting happens on save. Use shorthand utilities wherever axes are symmetric. Avoid accidental same-scope conflicts; allow intentional variants and shorthand/longhand overrides. Use `group` on parent elements and `group-hover:`/`group-focus:` on children for state propagation. Name groups when nesting: `group/card` on the outer container, `group/item` on the inner. Place `peer` elements before their styled siblings. Use `flex` for one-dimensional layouts and `grid` for two-dimensional ones. Default to `gap-*` for spacing children in both flex and grid containers.

## Applicability

Sorting, shorthand, flex/grid selection and override restrictions are house preferences unless a concrete layout failure is shown. Keep valid established layouts; do not infer functional severity from stylistic differences. Version-match optional lint/format plugins before relying on their diagnostics.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| AutomaticClassSorting | HIGH | Use prettier-plugin-tailwindcss for consistent class ordering |
| NoContradictingClasses | HIGH | Avoid accidental conflicting values in the same variant scope |
| UseShorthandUtilities | MEDIUM | Prefer axis/all-sides shorthands to reduce class count |
| ImportantUsageSparingly | MEDIUM | Use ! sparingly; third-party-only restriction is house policy |
| GroupModifierForParentState | HIGH | Use group/group-hover for parent-child state styling |
| NamedGroupsForNesting | HIGH | Use named groups (group/card) when nesting group contexts |
| PeerModifierOrdering | HIGH | Peer element must come before styled siblings in DOM |
| FlexVsGridSelection | MEDIUM | Flex for 1D layouts, grid for 2D layouts |
| GapOverSpaceBetween | MEDIUM | Prefer gap over space-x/space-y for flex and grid spacing |


---

### TW2.1 Use Prettier Plugin for Consistent Class Ordering

**Impact: HIGH (eliminates class ordering debates and merge conflicts)**

Install `prettier-plugin-tailwindcss` to automatically sort utility classes in a consistent order. The plugin follows the box model: layout/positioning → box model → borders → backgrounds → typography → decorative. The order is intentionally not customizable (same philosophy as Prettier itself).

**Incorrect: random/inconsistent class ordering**

```html
<div class="text-white rounded-lg flex bg-blue-500 p-4 items-center shadow-md">
```

**Correct: sorted by Prettier plugin**

```html
<div class="flex items-center rounded-lg bg-blue-500 p-4 text-white shadow-md">
```

---

### TW2.2 Never Apply Conflicting Utility Classes

**Impact: HIGH (accidental conflicts obscure the effective style)**

Avoid accidental competing utilities in the same variant scope. With equal cascade priority, CSS source order decides the winner, not class-attribute order; a fixed stylesheet is deterministic. Responsive/state overrides (`p-2 md:p-4`) and deliberate shorthand/longhand composition (`p-4 pt-2`) are valid. A compatible configured lint rule can catch some accidental conflicts.

**Incorrect: conflicting padding values**

```html
<div class="p-3 p-4 text-sm text-lg">
```

**Correct: single value per property**

```html
<div class="p-4 text-lg">
```

---

### TW2.3 Prefer Shorthand Utilities to Reduce Class Count

**Impact: MEDIUM (cleaner markup, fewer classes to read)**

Use axis-based (`mx-`, `py-`) or all-sides (`p-`, `m-`) utilities when values are symmetric. The `eslint-plugin-tailwindcss/enforces-shorthand` rule catches this automatically.

**Incorrect: redundant per-side utilities**

```html
<div class="ml-2 mr-2 pt-4 pb-4">
```

**Correct: shorthand axis utilities**

```html
<div class="mx-2 py-4">
```

---

### TW2.4 Use the Important Modifier Only as a Last Resort

**Impact: MEDIUM (overusing ! creates specificity wars)**

Tailwind's important modifier maps to CSS `!important`: v3 uses `!text-red-500`; v4 prefers `text-red-500!` (the leading spelling remains compatible but deprecated). Prefer resolving conflicts at their source. Restricting important declarations to third-party overrides is a house policy, not a CSS requirement; cascade layers do not eliminate every need for overrides.

**Incorrect: ! modifier to fix self-inflicted specificity issue**

```html
<div class="text-blue-500 !text-red-500">
```

**Correct: remove the conflicting class instead**

```html
<div class="text-red-500">
```

---

### TW2.5 Use group/group-hover: for Styling Children Based on Parent State

**Impact: HIGH (eliminates JavaScript class toggling for parent-child interactions)**

Use `group` on a parent and `group-hover:`, `group-focus:`, etc. on children to style child elements based on parent state. This is pure CSS — no JavaScript needed for hover/focus propagation.

**Incorrect: JavaScript event handlers to toggle child classes**

```html
<div onmouseenter="..." onmouseleave="...">
  <span id="child">Show on hover</span>
</div>
```

**Correct: group modifier for CSS-only parent-child state**

```html
<div class="group cursor-pointer rounded p-4">
  <span class="text-gray-500 group-hover:text-blue-500 group-hover:underline">
    Show on hover
  </span>
</div>
```

---

### TW2.6 Use Named Groups When Nesting Multiple Group Contexts

**Impact: HIGH (unnamed nested groups cause ambiguous targeting)**

When group contexts are nested, use named groups (`group/card`, `group/item`) so inner children can target the correct ancestor. Without naming, `group-hover:` can match any hovered `group` ancestor, not only the nearest one. Named groups distinguish intended ancestors; use distinct names where that distinction matters.

**Incorrect: ambiguous unnamed nested groups**

```html
<div class="group">
  <div class="group">
    <span class="group-hover:text-red-500">
      <!-- Either matching hovered group ancestor can activate this. -->
    </span>
  </div>
</div>
```

**Correct: named groups for explicit targeting**

```html
<div class="group/card">
  <div class="group/item">
    <span class="group-hover/card:text-red-500 group-hover/item:underline">
      Explicitly targets both ancestors
    </span>
  </div>
</div>
```

---

### TW2.7 Peer Element Must Come Before Styled Siblings in DOM

**Impact: HIGH (peer modifiers silently fail if DOM order is wrong)**

The `peer` modifier only works on elements that come AFTER the peer in the DOM, because it uses the CSS `~` general sibling combinator. Place the triggering element (with `peer` class) before the element that reacts to it.

**Incorrect: styled element is BEFORE the peer — does nothing**

```html
<p class="peer-invalid:text-red-500">Error message</p>
<input class="peer" type="email" />
```

**Correct: peer comes FIRST, styled element comes AFTER**

```html
<input class="peer" type="email" />
<p class="hidden peer-invalid:block peer-invalid:text-red-500">
  Please enter a valid email
</p>
```

---

### TW2.8 Use Flex for One-Dimensional, Grid for Two-Dimensional Layouts

**Impact: MEDIUM (wrong layout model adds complexity for no benefit)**

Use flexbox (`flex`) for one-dimensional layouts: nav bars, button groups, centering. Use CSS grid (`grid`) for two-dimensional layouts: card grids, page layouts, form layouts. Do not force grid behavior with flex or vice versa.

**Valid layout; prefer grid when aligned columns/rows are the requirement**

```html
<div class="flex flex-wrap">
  <div class="w-1/3 p-2">Card</div>
  <div class="w-1/3 p-2">Card</div>
  <div class="w-1/3 p-2">Card</div>
</div>
```

**Correct: grid for actual grid layouts**

```html
<div class="grid grid-cols-3 gap-4">
  <div>Card</div>
  <div>Card</div>
  <div>Card</div>
</div>
```

---

### TW2.9 Prefer gap-* Over space-x-*/space-y-* for Flex and Grid Spacing

**Impact: MEDIUM (margin-based space-* does not model wrapped rows or grids)**

Prefer `gap-*` over `space-x-*`/`space-y-*` for spacing flex and grid children. `gap` models spacing between flex/grid tracks and wrapped lines. `space-*` uses version-specific child selectors and margins; it remains valid for suitable linear layouts.

**Incorrect: space-x breaks on wrap**

```html
<div class="flex flex-wrap space-x-4">
  <span>Tag 1</span>
  <span>Tag 2</span>
</div>
```

**Correct: gap works correctly with wrapping**

```html
<div class="flex flex-wrap gap-4">
  <span>Tag 1</span>
  <span>Tag 2</span>
</div>
```


## Rule Interactions

- **AutomaticClassSorting + NoContradictingClasses** are complementary: sorting makes conflicts visually obvious because same-property utilities end up adjacent. Linting catches what the eye misses.
- **GroupModifierForParentState + NamedGroupsForNesting** form a progression: simple cases use unnamed groups, complex nested cases require named groups. Always start unnamed; add names when nesting.
- **PeerModifierOrdering** has no fallback: if the DOM order is wrong, the peer modifier silently does nothing. There is no error, no warning, just broken behavior.
- **FlexVsGridSelection + GapOverSpaceBetween** pair naturally: once you choose the correct layout model, use `gap` to space its children regardless of whether it is flex or grid.
- **ImportantUsageSparingly + NoContradictingClasses** share a root cause: reaching for `!` often indicates a contradicting class or specificity battle that should be resolved by removing the conflict.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Contradicting utilities without awareness**: Applying `p-3 p-4` and relying on one to "win." The result depends on Tailwind's internal CSS ordering, not class attribute order. Identical generated CSS has the same cascade in development and production.

### HIGH

- **Unnamed nested groups**: Using `group` inside `group` without names. `group-hover:` can match any qualifying group ancestor, which may not be the intended one. Subtle hover effects break silently.
- **Reversed peer ordering**: Placing the styled element before the `peer` in DOM. The CSS `~` combinator only selects forward siblings. The styling silently fails with no error.
- **Forced grid with flex**: Using `flex flex-wrap` with `w-1/3` to simulate a grid. Grid with `grid-cols-3 gap-4` is cleaner, more predictable, and handles content of varying height.

### MEDIUM

- **Longhand where shorthand suffices**: Writing `ml-4 mr-4` instead of `mx-4`. Not harmful, but adds visual noise and signals unfamiliarity with the framework.
- **Habitual !important**: Using `!` on your own components instead of resolving the class conflict. Creates specificity escalation where more `!` modifiers are needed over time.
- **space-x on flex-wrap**: Using `space-x-4` on a container with `flex-wrap`. The margin-based spacing breaks on wrapped rows, creating unintended gaps.

## Examples

**Sorted, conflict-free, well-structured:**

```html
<!-- Sorted by Prettier plugin, no conflicts, shorthand used -->
<div class="flex items-center gap-4 rounded-lg bg-white p-4 shadow-md">
  <span class="text-sm font-medium text-gray-700">Label</span>
</div>

<!-- Named groups for nested hover effects -->
<div class="group/card rounded-lg border p-4 hover:border-blue-300">
  <div class="group/action flex items-center gap-2">
    <span class="group-hover/card:text-blue-600">Card title</span>
    <button class="opacity-0 group-hover/action:opacity-100">Edit</button>
  </div>
</div>

<!-- Correct peer ordering: input (peer) before message -->
<input class="peer rounded border px-3 py-2" type="email" required />
<p class="mt-1 hidden text-sm text-red-500 peer-invalid:block">
  Please enter a valid email address
</p>
```

**Anti-pattern collection:**

```html
<!-- Contradicting classes: which padding wins? -->
<div class="p-3 p-4 text-sm text-lg">Content</div>

<!-- Unnamed nested groups: which group does group-hover target? -->
<div class="group">
  <div class="group">
    <span class="group-hover:text-red-500">Ambiguous target</span>
  </div>
</div>

<!-- Reversed peer: styling before peer does nothing -->
<p class="peer-invalid:text-red-500">Error</p>
<input class="peer" type="email" />

<!-- Flex simulating grid: use grid instead -->
<div class="flex flex-wrap">
  <div class="w-1/3 p-2">Card</div>
  <div class="w-1/3 p-2">Card</div>
</div>
```

## Does Not Cover

- Utility-first philosophy and @apply decisions (see Philosophy dimension)
- Responsive breakpoint strategy (see ResponsiveDesign dimension)
- Dark mode class toggling (see Theming dimension)
- Accessibility-specific class usage like sr-only (see Accessibility dimension)

## Sources

- https://tailwindcss.com/docs/hover-focus-and-other-states
- https://tailwindcss.com/docs/styling-with-utility-classes
- https://tailwindcss.com/docs/upgrade-guide
- https://tailwindcss.com/docs/margin
- https://tailwindcss.com/blog/automatic-class-sorting-with-prettier
- https://www.w3.org/TR/selectors-4/#subsequent-sibling-combinators
