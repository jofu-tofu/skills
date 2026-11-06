# Bundle Size — React

> Every kilobyte of JavaScript the browser must download, parse, and execute is a direct tax on Time to Interactive — bundle discipline is the highest-leverage performance optimization because it affects every single page load.

## Mental Model

JavaScript transfer, parsing and evaluation can delay client interactivity. SSR content and server fetching need not wait for the client bundle. Measure the actual production graph and target devices; bytes alone do not determine a fixed load-time cost.

The 5 rules address import granularity, load timing and optional features. Barrel imports can increase development or external-module evaluation cost, but bundled ESM may tree-shake effectively. Dynamic imports split code; conditional rendering controls when optional components are needed. Preloading trades earlier network work for lower interaction latency.

These five rules interact as a pipeline: first reduce what is imported (BarrelImports), then defer what is not immediately needed (DynamicImports, DeferThirdParty), then preload what will be needed soon (Preload), and finally exclude what may not be needed at all (Conditional). Choose the order from the actual critical path; these strategies trade initial work against later loading and do not guarantee a minimal bundle or fastest load.

Validate savings with the project's bundler, package versions, compressed transfer sizes and loading traces. Published benchmark percentages are not guarantees for this application.

## Consumer Guide

### When Reviewing Code

Scan for these violations in priority order:

1. **Costly imports** — Inspect the build graph before changing public imports. Current Next.js optimizes several packages, including lucide-react and MUI, by default; defaults vary by version.
2. **Static import of heavy components** (CRITICAL) — Large editors (Monaco, CodeMirror), chart libraries (D3, Recharts), or rich text editors (TipTap, Slate) imported at the top of a file that is in the main bundle. Split optional UI when it improves the measured loading path; static imports remain valid for required initial content.
3. **Third-party scripts in critical path** (HIGH) — Analytics, chat widgets, or tracking scripts loaded synchronously via `<script>` or imported in the main bundle. These block rendering even though they provide no user-visible content.
4. **Feature code without conditional loading** (MEDIUM) — Admin panels, debug toolbars, or premium features imported unconditionally even when the current user will never see them.
5. **Measured interaction delay** — Consider intent-based preload when latency justifies extra network/evaluation work. Automatic framework prefetching may already cover navigation.

### When Designing / Planning

Before adding a new dependency or feature:

- **Check the bundle cost.** Use `bundlephobia.com` or `npx cost-of-modules` to understand the size impact before adding a dependency. A 50KB library for a single utility function is rarely justified.
- **Decide the loading strategy upfront.** For each new component/library, decide: is it needed on initial render (static import), needed on interaction (dynamic import), or needed only for some users (conditional import)?
- **Plan preload hints.** If a dynamically imported component is needed immediately after a predictable user action (clicking a tab, hovering a button), add a preload hint so the chunk is already downloading before the user acts.
- **Audit existing barrel imports.** When adding a new import from a library already in use, check if the library supports direct file imports. Change only supported entry points where the measured graph or project policy warrants it; mixed public imports are not inherently wrong.

### When Implementing

Apply rules in this order:

1. **Inspect import cost** (BundleBarrelImports) — Retain valid public root imports when tree-shaking or existing optimization suffices. Consider documented subpaths or version-supported optimizePackageImports for measured overhead.
2. **Dynamic-import heavy components** (BundleDynamicImports) — Use `next/dynamic` for components over 50KB that are not visible on initial render. Use `{ ssr: false }` only from a Client Component for browser-dependent modules.
3. **Defer third-party scripts** (BundleDeferThirdParty) — Move analytics, tracking, and widget scripts to `next/script` with `strategy="lazyOnload"` or `strategy="afterInteractive"`.
4. **Choose preload scope** (BundlePreload) — router.prefetch targets a framework route, not an arbitrary dynamic component. Module chunks need module-aware hints/framework support; import-on-intent also evaluates the module. Check automatic prefetching before adding hints.
5. **Conditionally load feature code** (BundleConditional) — Wrap admin-only, premium-only, or environment-specific code in dynamic imports gated by feature flags or user roles.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| BundleBarrelImports | CRITICAL | Use supported public subpaths or import optimization when measured cost warrants it |
| BundleDynamicImports | CRITICAL | Use next/dynamic or React.lazy for heavy components not needed on initial render |
| BundleDeferThirdParty | HIGH | Defer non-critical third-party scripts to after page load |
| BundleConditional | MEDIUM | Load feature code conditionally based on user roles or feature flags |
| BundlePreload | MEDIUM | Add preload hints for dynamically imported chunks to reduce perceived load time |


---

### R5.1 Avoid Barrel File Imports

**Impact: workload-dependent (development graph or bundle cost)**

Barrels re-export modules. Tree shaking can remove unused bundled exports; externalized modules may still incur runtime evaluation cost. Inspect the actual graph before flagging an import.

**Valid public imports (verify the pinned library and bundler):**

```tsx
import { Check, X, Menu } from 'lucide-react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
```

Do not invent private `dist/esm/...` paths: package exports and internal layouts can change. On Next.js 13.5+ use the version's documented optimizePackageImports where appropriate; current versions optimize several popular libraries by default.

```js
module.exports = {
  experimental: { optimizePackageImports: ['package-name'] }
}
```

No fixed module count, byte saving or percentage follows from import syntax alone.

Reference: https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports

---

### R5.2 Dynamic Imports for Heavy Components

**Impact: CRITICAL (directly affects TTI and LCP)**

Use `next/dynamic` to lazy-load large components not needed on initial render.

**Potential issue: optional editor statically imported**

```tsx
import { MonacoEditor } from './monaco-editor'

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />
}
```

**Alternative: browser-only editor loads when opened (Client Component)**

```tsx
'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(
  () => import('./monaco-editor').then(m => m.MonacoEditor),
  { ssr: false }
)

function CodePanel({ code }: { code: string }) {
  const [open, setOpen] = useState(false)
  return <><button onClick={() => setOpen(true)}>Open editor</button>
    {open && <MonacoEditor value={code} />}</>
}
```

The local monaco-editor module is an application wrapper exporting MonacoEditor. Splitting a component rendered immediately still loads it immediately in a separate chunk.

---

### R5.3 Defer Non-Critical Third-Party Libraries

**Impact: workload-dependent (noncritical script loading)**

Choose a loading strategy for optional analytics/widgets. A package import alone does not prove that its script blocks rendering; inspect the SDK. Delaying error reporting can lose early events.

**Example: noncritical external script in a Next.js layout:**

```tsx
import Script from 'next/script'
export default function RootLayout({ children }) {
  return <html><body>
    {children}
    <Script src="https://analytics.example.com/tracker.js" strategy="lazyOnload" />
  </body></html>
}
```

The URL is illustrative, not a real service to invoke. lazyOnload targets idle loading; afterInteractive loads earlier after some hydration. Do not put next/dynamic with ssr:false directly in a Server Component layout: use a separate Client Component if a browser-only SDK requires it.

Reference: https://nextjs.org/docs/app/api-reference/components/script

---

### R5.4 Conditional Module Loading

**Impact: HIGH (loads large data only when needed)**

Load large data or modules only when a feature is activated.

**Example: lazy-load animation frames**

```tsx
function AnimationPlayer({ enabled, setEnabled }: { enabled: boolean; setEnabled: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [frames, setFrames] = useState<Frame[] | null>(null)

  useEffect(() => {
    if (enabled && !frames && typeof window !== 'undefined') {
      import('./animation-frames.js')
        .then(mod => setFrames(mod.frames))
        .catch(() => setEnabled(false))
    }
  }, [enabled, frames, setEnabled])

  if (!frames) return <Skeleton />
  return <Canvas frames={frames} />
}
```

The window guard controls runtime execution; it does not guarantee exclusion from the server build graph. Effects already run only on the client. Inspect framework output to establish bundle inclusion.

---

### R5.5 Preload Based on User Intent

**Impact: MEDIUM (reduces perceived latency)**

Preload heavy bundles before they're needed to reduce perceived latency.

**Example: preload on hover/focus**

```tsx
function EditorButton({ onClick }: { onClick: () => void }) {
  const preload = () => {
    if (typeof window !== 'undefined') {
      void import('./monaco-editor').catch(() => {})
    }
  }

  return (
    <button
      onMouseEnter={preload}
      onFocus={preload}
      onClick={onClick}
    >
      Open Editor
    </button>
  )
}
```

**Example: preload when feature flag is enabled**

```tsx
function FlagsProvider({ children, flags }: Props) {
  useEffect(() => {
    if (flags.editorEnabled && typeof window !== 'undefined') {
      void import('./monaco-editor').then(mod => mod.init())
    }
  }, [flags.editorEnabled])

  return <FlagsContext.Provider value={flags}>
    {children}
  </FlagsContext.Provider>
}
```

This guard does not guarantee exclusion from the server bundle. import() fetches and evaluates the module; use a side-effect-safe module and handle failures. Network-only preload hints have different semantics.


## Rule Interactions

- **BundleBarrelImports + BundleDynamicImports**: import optimization can reduce graph cost, while splitting changes load timing. Neither syntax proves a particular byte saving.
- **BundleDynamicImports + BundlePreload**: splitting and preloading are separate tools. Import-on-hover also evaluates the module. Choose hints based on module versus classic-script format and actual framework prefetch behavior.
- **BundleDeferThirdParty + BundlePreload** can conflict. Deferring a script means it loads later; preloading means it loads earlier. For third-party scripts, defer is almost always correct — preload should be reserved for your own dynamically-imported code, not third-party analytics.
- **BundleConditional + BundleDynamicImports**: declare dynamic components at module scope, then conditionally render them. Framework prefetching can still download chunks. Feature flags/client code splitting are not authorization boundaries.

## Anti-Patterns (Severity Calibration)

### CRITICAL
- **Measured import overhead**: Optimize a costly package graph using public imports or supported build configuration; a root import alone is not a critical defect.
- **Optional editor on the initial path**: Consider a conditional dynamic import. Required initial editors may be static; ssr:false depends on browser-only APIs, not size.

### HIGH
- **Synchronous analytics script**: `<script src="https://analytics.example.com/tracker.js" />` in `_document.tsx` or root layout blocks the entire page render. Switch to `next/script` with `strategy="lazyOnload"`.
- **Unconditional admin panel import**: `import AdminDashboard from './AdminDashboard'` at the top of a page visible to all users, even though only admins see the component. Inspect the client graph to establish what each visitor downloads.

### MEDIUM
- **Measured delay on likely interaction**: consider prefetching a route or preloading a module after inspecting framework defaults; lack of a manual hint alone is not a defect.
- **Mixed import paths**: Check actual duplicated code/evaluation. Mixing supported entry points does not universally negate tree-shaking.

## Examples

### Example 1: Import Optimization Pipeline (BarrelImports + DynamicImports + Preload)

```tsx
// Separate before/after Client Component modules ('use client' before imports).
// BEFORE: static optional editor; sizes require a build measurement
import { Check, X, Menu, Settings, User } from 'lucide-react' // inspect actual build graph
import { MonacoEditor } from './monaco-editor'             // measured size depends on version/build
import { Chart } from './chart'                                 // app-specific chart wrapper

function CodeReviewPage({ code, metrics }: Props) {
  const [showEditor, setShowEditor] = useState(false)
  return (
    <div>
      <Menu /> <Settings /> <User />
      {showEditor && <MonacoEditor value={code} />}
      <Chart data={metrics} />
    </div>
  )
}

// Separate module: code-review-page.tsx
'use client'
import { useState } from 'react'
// AFTER: supported imports + optional editor split + intent preload
import { Check } from 'lucide-react'
import { Menu } from 'lucide-react'
import { Settings } from 'lucide-react'
import { User as UserIcon } from 'lucide-react'

import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(
  () => import('./monaco-editor').then(m => m.MonacoEditor),
  { ssr: false, loading: () => <EditorSkeleton /> }
)

const Chart = dynamic(
  () => import('./chart').then(m => m.Chart),
  { loading: () => <ChartSkeleton /> }
)

function CodeReviewPage({ code, metrics }: Props) {
  const [showEditor, setShowEditor] = useState(false)
  return (
    <div>
      <Menu /> <Settings /> <UserIcon />
      {/* Preload editor chunk on button hover */}
      <button
        onMouseEnter={() => { void import('./monaco-editor').catch(() => {}) }}
        onFocus={() => { void import('./monaco-editor').catch(() => {}) }}
        onClick={() => setShowEditor(true)}
      >
        Open Editor
      </button>
      {showEditor && <MonacoEditor value={code} />}
      <Chart data={metrics} />
    </div>
  )
}
```

Inspect the generated chunks to confirm savings. Hover preloading starts earlier work but cannot guarantee completion before the click.

### Example 2: Conditional Feature Loading (Conditional + DynamicImports + DeferThirdParty)

```tsx
// BEFORE: Admin panel + analytics loaded for every user
import AdminDashboard from './AdminDashboard'  // inspect initial graph to establish cost
import Script from 'next/script'

function AppLayout({ children, user }: Props) {
  return (
    <>
      <script src="https://analytics.example.com/track.js" /> {/* blocks render */}
      {children}
      {user.isAdmin && <AdminDashboard />}  {/* code already downloaded */}
    </>
  )
}

// AFTER: Conditional dynamic import + deferred analytics
import dynamic from 'next/dynamic'
import Script from 'next/script'

const AdminDashboard = dynamic(() => import('./AdminDashboard'))

function AppLayout({ children, user }: Props) {
  return (
    <>
      <Script
        src="https://analytics.example.com/track.js"
        strategy="lazyOnload"  // noncritical idle loading
      />
      {children}
      {user.isAdmin && <AdminDashboard />} {/* optional render; prefetch behavior depends on framework */}
    </>
  )
}
```

Measure the actual initial-byte change and analytics timing; no fixed savings are established here.

### Example 3: Next.js optimizePackageImports Alternative (BarrelImports)

```js
// next.config.js — when direct imports are too tedious to maintain
module.exports = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@mui/material',
      '@mui/icons-material',
      '@tabler/icons-react',
      'date-fns',
      'lodash',
      'rxjs',
      'react-use'
    ]
  }
}

// Now barrel imports are automatically optimized at build time:
import { Check, X, Menu } from 'lucide-react'  // transformed to direct imports
```

This approach maintains ergonomic imports while getting the bundle size benefits. Apply this when the team prefers barrel import syntax or when a large codebase has too many imports to convert manually.

## Does Not Cover

- **Component rendering performance** — See RenderingPerf (R4) for re-render optimization, memoization, and hydration.
- **Server-side code that never reaches the client** — See ServerComponents (R3) for RSC patterns where bundle size is irrelevant.
- **Data fetching overhead** — See DataFetching (R2) for network request optimization.
- **JavaScript runtime performance** — See JavaScriptPerf (R6) for loop and data structure optimization.

## Sources

- Vercel Engineering — React Best Practices (January 2026), MIT
- Vercel Blog — How We Optimized Package Imports in Next.js
- Web Almanac — JavaScript Byte Weight and Performance Correlation

## Candidate verification references

- https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports
- https://nextjs.org/docs/app/guides/lazy-loading
- https://vercel.com/blog/how-we-optimized-package-imports-in-next-js
- https://nextjs.org/docs/app/api-reference/components/script
- https://react.dev/reference/rsc/use-client
