# Philosophy — Tailwind CSS

> Tailwind favors utilities in markup. This dimension adopts component reuse and restrained CSS extraction as house preferences, with explicit exceptions.

## Mental Model

Tailwind inverts the traditional CSS workflow. Instead of inventing semantic class names, writing CSS in external files, and linking them to markup, you compose small single-purpose utility classes directly on elements. This co-locates style with structure, eliminates naming overhead, and makes every change locally scoped. Generated utilities follow detected source tokens, not live DOM usage. Deleting markup removes a utility only when no scanned source or explicit inclusion still requests it; shared utilities, base styles and custom CSS can remain.

The philosophy has three pillars. First, utilities are the primary API. Prefer utility classes for routine styling; custom CSS remains supported. Custom CSS is the escape hatch, not the default. Second, when utility combinations repeat, our default abstraction is a framework component (React, Vue, Svelte); CSS abstractions remain valid when they better fit the project. Components encapsulate both structure and style, whereas CSS classes only encapsulate style. A `<Card>` component captures the div structure, the padding, the shadow, and the rounded corners as a single reusable unit. An `.card` CSS class captures only the visual properties, leaving the markup to be duplicated or diverge. Third, abstraction should be deferred until genuine repetition exists. Three occurrences are a house heuristic, not a correctness threshold; a single-use component can provide meaningful structure, behavior or isolation.

`@apply` is supported in v3 and v4 for inlining utilities into custom CSS. This house policy normally reserves it for third-party overrides, while retaining documented exceptions such as legacy print styles. It is not deprecated in v4. In separately processed v4 component styles or CSS modules, use `@reference` when access to the main theme is needed.

Variant systems like Class Variance Authority (CVA) extend the philosophy to component variants. Instead of manual string concatenation or conditional class logic, CVA provides a declarative, type-safe way to define variant combinations. This keeps the utility-first approach intact while managing the complexity of multi-variant components. The key principle is that variant definitions should be declarative lookup structures, not imperative string-building code.

Where the project adopts a UI/domain boundary, UI primitives own shared visual patterns and domain components compose them. Local layout utilities in domain components are valid unless the agreed policy disallows them.

## Consumer Guide

### When Reviewing Code

Check whether new CSS files or `@apply` blocks have been introduced. If so, determine whether the styling could have been achieved with utility classes in markup or by extracting a framework component. Look for string concatenation patterns in variant logic that should be replaced with CVA or a lookup map. Verify that domain components compose UI components rather than applying Tailwind utilities directly. Review single-use extraction for a concrete purpose; one call site alone is not a defect.

### When Designing / Planning

Plan the component hierarchy with a clear boundary between UI primitives and domain composites. UI primitives own their Tailwind utilities and expose a variant API (via CVA or props). Domain components compose those primitives. When designing a new visual pattern, default to inline utilities. Use three repetitions as a reuse heuristic; extract earlier when behavior, isolation or readability justifies it. If a third-party library requires style overrides, plan for a thin CSS override layer using `@apply` and document why.

### When Implementing

Start every element with utility classes in markup. Resist the urge to create a CSS file. When meaningful repetition emerges, consider a framework component. Use CVA for components with multiple variant axes (size, color, state). Combine CVA with `clsx` and `tailwind-merge` for conditional and overridable classes. Apply the agreed `@apply` policy and preserve documented exceptions. Under the UI/domain house policy, compose UI primitives and allow documented local-layout exceptions.

## Policy Applicability

The rules below are house preferences, not Tailwind validity constraints. Apply them only where adopted; preserve intentional legacy exceptions. Policy-only differences are LOW/INFO, not functional defects. Example labels refer to that policy.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| UtilityFirstApproach | LOW | Style with utility classes in markup, not custom CSS files |
| AvoidApplyOveruse | LOW | Prefer component styling; allow documented @apply exceptions |
| ExtractComponentsNotClasses | LOW | Extract framework components, not CSS classes with @apply |
| AvoidPrematureAbstraction | LOW | Use three repetitions as a heuristic; allow purposeful earlier extraction |
| TypeSafeVariantSystem | LOW | Use CVA or typed lookup maps for component variants |
| SeparateDomainFromUI | LOW | Follow the adopted UI/domain styling boundary and exceptions |


---

### TW1.1 Style with Utility Classes, Not Custom CSS Files

**Impact: LOW (utility-first is the core Tailwind paradigm)**

Style elements directly in markup using utility classes. Do not default to writing custom CSS in external stylesheets. Utilities are the primary API of Tailwind — they co-locate style with structure, eliminate naming overhead, and make changes isolated.

**Incorrect: custom CSS class in external stylesheet**

```css
/* styles.css */
.card-header {
  padding: 1rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
}
```
```html
<div class="card-header">Title</div>
```

**Correct: utility classes directly in markup**

```html
<div class="p-4 text-xl font-bold text-gray-900">Title</div>
```

---

### TW1.2 Prefer Components; Limit @apply Under the Adopted Policy

**Impact: LOW (house preference for component-owned styling)**

`@apply` is a supported directive, including in v4. When this house policy is adopted, prefer components for reusable markup and styling, and reserve `@apply` for third-party overrides or documented exceptions (including existing legacy print styles). Measure output before making bundle-size claims.

**Incorrect: @apply for reusable button style**

```css
.btn-primary {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
}
```

**Correct: utility classes in markup, or extract a component**

```html
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Save
</button>
```

---

### TW1.3 Extract Framework Components, Not CSS Classes

**Impact: LOW (components encapsulate structure + style; CSS classes only encapsulate style)**

When utility combinations repeat, extract a reusable framework component (React, Vue, Svelte), NOT a CSS class with `@apply`. Components encapsulate both markup structure and styling, making changes safer and more maintainable.

**Incorrect: creating a CSS abstraction with @apply**

```css
.card {
  @apply rounded-lg shadow-md p-6 bg-white;
}
```

**Correct: extract a framework component**

```jsx
function Card({ children }) {
  return (
    <div className="rounded-lg shadow-md p-6 bg-white">
      {children}
    </div>
  );
}
```

---

### TW1.4 Build with Utilities First, Extract Only When Duplicated

**Impact: LOW (premature abstraction creates rigid, hard-to-change code)**

Prefer utilities first and use 3+ repetitions as a house heuristic for shared visual abstractions. Single-use components remain valid for behavior, isolation and readability. Premature abstraction creates components that are hard to modify because they serve imagined future needs rather than actual current patterns.

**Policy concern only if unjustified: extracting a single-use Badge**

```jsx
// Created before any duplication exists
function Badge({ children }) { /* ... */ }
// Used in exactly one place
```

**Correct: use utilities inline until genuine repetition emerges**

```html
<span class="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
  Active
</span>
<!-- Consider a shared Badge when reuse or another concrete purpose justifies it. -->
```

---

### TW1.5 Use a Type-Safe Variant System for Component Variants

**Impact: LOW (eliminates error-prone string concatenation for variants)**

Use a variant management library like Class Variance Authority (CVA) to define component variants declaratively. Combine with `clsx` and `tailwind-merge` for conditional and overridable classes. Alternatives include `tailwind-variants` and manual lookup maps — the key principle is type-safe, declarative variant definitions rather than string concatenation.

**Incorrect: manual string concatenation for variants**

```jsx
function Button({ variant, size }) {
  let classes = "px-4 py-2 rounded";
  if (variant === "primary") classes += " bg-blue-500 text-white";
  if (size === "sm") classes += " text-sm px-2 py-1";
  return <button className={classes}>...</button>;
}
```

**Correct: declarative variant definition with CVA**

```jsx
import { cva } from "class-variance-authority";

const button = cva("rounded font-medium", {
  variants: {
    variant: {
      primary: "bg-blue-500 text-white hover:bg-blue-600",
      secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    },
    size: {
      sm: "text-sm px-2 py-1",
      md: "text-base px-4 py-2",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

function Button({ variant, size, className }) {
  return <button className={button({ variant, size, className })}>...</button>;
}
```

---

### TW1.6 Follow the Adopted UI/Domain Styling Boundary

**Impact: LOW (prevents duplication and enforces design system consistency)**

If the project adopts the UI/domain house policy, keep shared visual patterns in UI primitives and compose them from domain components. Direct utilities are valid Tailwind and may be appropriate for local layout or documented exceptions.

**Incorrect: domain component using raw Tailwind utilities**

```jsx
function CheckoutForm() {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <input className="w-full rounded border px-3 py-2" />
      <button className="rounded bg-blue-500 px-4 py-2 text-white">Pay</button>
    </div>
  );
}
```

**Correct: domain component composes UI components**

```jsx
function CheckoutForm() {
  return (
    <Card>
      <Input placeholder="Card number" />
      <Button variant="primary">Pay</Button>
    </Card>
  );
}
```


## Rule Interactions

- **UtilityFirstApproach + AvoidApplyOveruse** reinforce each other: both favor markup utilities under the house policy. A legitimate custom-CSS exception need not violate either rule; avoid duplicate findings.
- **ExtractComponentsNotClasses + AvoidPrematureAbstraction** create a deliberate tension: extract components (not classes), when repetition or another concrete purpose justifies it. Three occurrences are a heuristic, not a requirement.
- **TypeSafeVariantSystem + SeparateDomainFromUI** work together at the component boundary: CVA defines the variant API that domain components consume without touching raw utilities.
- **AvoidApplyOveruse + ExtractComponentsNotClasses** share the same root cause: reaching for CSS abstractions instead of component abstractions. Fix one and you typically fix both.

## Anti-Patterns (Severity Calibration)

### LOW

- **CSS-first development**: Creating `.component-name` classes in external stylesheets as the default workflow. Review against the adopted policy; custom CSS is supported and bundle growth must be measured.
- **@apply as component styling**: Using `@apply` to build reusable button, card, or form styles. Prefer a framework component under the house policy; supported CSS abstractions and documented exceptions remain acceptable.

### LOW — Abstraction and boundaries

- **Premature component extraction**: Creating a `<Badge>` component when only one badge exists in the entire application. Check whether behavior, isolation or readability justifies the extraction; repetition is only one reason.
- **String concatenation variants**: Building variant logic with `if/else` chains and string concatenation instead of a declarative variant system. A typed lookup can improve consistency, but concatenating complete literal classes is detectable by Tailwind and can be type checked.
- **Domain components with raw utilities**: A `<CheckoutForm>` that directly applies `rounded-lg bg-white p-6 shadow` instead of composing a `<Card>` component. Visual duplication becomes invisible and design consistency erodes.

### LOW — Additional review considerations

- **Over-componentization**: Extracting every two-class combination into a component. The overhead of component files, imports, and props exceeds the cost of a few repeated utility strings.

## Examples

**Correct philosophy applied end-to-end:**

```jsx
// UI component: owns Tailwind utilities, exposes variant API
import { cva } from "class-variance-authority";

const button = cva("rounded font-medium transition-colors", {
  variants: {
    variant: {
      primary: "bg-blue-500 text-white hover:bg-blue-600",
      secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    },
    size: {
      sm: "text-sm px-2 py-1",
      md: "text-base px-4 py-2",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

function Button({ variant, size, className, children }) {
  return <button className={button({ variant, size, className })}>{children}</button>;
}

// Domain component: composes UI components, no raw utilities
function CheckoutForm() {
  return (
    <Card>
      <Input placeholder="Card number" />
      <Button variant="primary">Pay</Button>
    </Card>
  );
}
```

**Anti-pattern: @apply-based reuse**

```css
/* Valid CSS; outside this house default unless an exception applies. */
.btn-primary {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
}
.btn-secondary {
  @apply px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300;
}
```

## Does Not Cover

- Class ordering and sorting conventions (see ClassOrganization dimension)
- Responsive breakpoint strategy (see ResponsiveDesign dimension)
- Dark mode and theming token architecture (see Theming dimension)
- Accessibility utilities like sr-only and focus-visible (see Accessibility dimension)
- Build configuration and content paths (see Accessibility dimension, build safety rules)

## Sources

- https://tailwindcss.com/docs/adding-custom-styles
- https://tailwindcss.com/docs/functions-and-directives
- https://tailwindcss.com/docs/detecting-classes-in-source-files
- https://tailwindcss.com/docs/styling-with-utility-classes
