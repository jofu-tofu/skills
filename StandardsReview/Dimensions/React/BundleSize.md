# Bundle Size — React

> Every kilobyte of JavaScript the browser must download, parse, and execute is a direct tax on Time to Interactive — bundle discipline is the highest-leverage performance optimization because it affects every single page load.

## Mental Model

Bundle size optimization sits at the critical path of web performance. Before any React component renders, before any data fetches, before any interaction handler fires, the browser must download and parse the JavaScript bundle. A 300KB increase in bundle size adds approximately 1 second to Time to Interactive on a median mobile connection. This cost is paid on every cold visit and cannot be optimized away by better rendering or smarter data fetching.

The 5 rules in this dimension address three distinct attack vectors for bundle bloat. The first is **import granularity**: barrel file imports (`import { X } from 'library'`) force the bundler to evaluate the entire module graph of a library even when only one export is needed. `BundleBarrelImports` eliminates this by targeting direct file imports. The second is **load timing**: not all JavaScript is needed on initial render. `BundleDynamicImports` defers heavy components to on-demand loading, `BundleDeferThirdParty` delays non-critical third-party scripts, and `BundlePreload` ensures that deferred chunks are available by the time they are needed. The third is **conditional inclusion**: `BundleConditional` prevents shipping code for features that are disabled for the current user or environment.

These five rules interact as a pipeline: first reduce what is imported (BarrelImports), then defer what is not immediately needed (DynamicImports, DeferThirdParty), then preload what will be needed soon (Preload), and finally exclude what may not be needed at all (Conditional). Applied in this order, they produce the smallest possible initial bundle with the fastest perceived load time.

The impact is measurable and significant: direct imports alone provide 15-70% faster dev boot, 28% faster builds, and 40% faster production cold starts. Dynamic imports can remove 100-500KB from the initial chunk. Together, these rules routinely cut initial bundle size by 40-60%.

## Consumer Guide

### When Reviewing Code

Scan for these violations in priority order:

1. **Barrel imports from large libraries** (CRITICAL) — `import { Icon } from 'lucide-react'` or `import { Button } from '@mui/material'`. These libraries have hundreds or thousands of re-exports. Check if `optimizePackageImports` is configured in next.config.js — if not, every barrel import loads the full library.
2. **Static import of heavy components** (CRITICAL) — Large editors (Monaco, CodeMirror), chart libraries (D3, Recharts), or rich text editors (TipTap, Slate) imported at the top of a file that is in the main bundle. These should always be dynamically imported.
3. **Third-party scripts in critical path** (HIGH) — Analytics, chat widgets, or tracking scripts loaded synchronously via `<script>` or imported in the main bundle. These block rendering even though they provide no user-visible content.
4. **Feature code without conditional loading** (MEDIUM) — Admin panels, debug toolbars, or premium features imported unconditionally even when the current user will never see them.
5. **Dynamic imports without preloading** (MEDIUM) — Components loaded via `next/dynamic` or `React.lazy` without `<link rel="preload">` or `router.prefetch()`, causing a visible loading delay when the user navigates to them.

### When Designing / Planning

Before adding a new dependency or feature:

- **Check the bundle cost.** Use `bundlephobia.com` or `npx cost-of-modules` to understand the size impact before adding a dependency. A 50KB library for a single utility function is rarely justified.
- **Decide the loading strategy upfront.** For each new component/library, decide: is it needed on initial render (static import), needed on interaction (dynamic import), or needed only for some users (conditional import)?
- **Plan preload hints.** If a dynamically imported component is needed immediately after a predictable user action (clicking a tab, hovering a button), add a preload hint so the chunk is already downloading before the user acts.
- **Audit existing barrel imports.** When adding a new import from a library already in use, check if the library supports direct file imports. Switch all imports from that library at once rather than mixing barrel and direct imports.

### When Implementing

Apply rules in this order:

1. **Switch barrel imports to direct imports** (BundleBarrelImports) — For each import from a library's root entry, find the direct file path. If using Next.js 13.5+, configure `optimizePackageImports` as an alternative.
2. **Dynamic-import heavy components** (BundleDynamicImports) — Use `next/dynamic` for components over 50KB that are not visible on initial render. Add `{ ssr: false }` for browser-only components.
3. **Defer third-party scripts** (BundleDeferThirdParty) — Move analytics, tracking, and widget scripts to `next/script` with `strategy="lazyOnload"` or `strategy="afterInteractive"`.
4. **Add preload hints** (BundlePreload) — For dynamically imported chunks that follow predictable navigation patterns, add `<link rel="preload" as="script">` or use `router.prefetch()`.
5. **Conditionally load feature code** (BundleConditional) — Wrap admin-only, premium-only, or environment-specific code in dynamic imports gated by feature flags or user roles.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| BundleBarrelImports | CRITICAL | Import from specific file paths instead of barrel files to avoid loading entire libraries |
| BundleDynamicImports | CRITICAL | Use next/dynamic or React.lazy for heavy components not needed on initial render |
| BundleDeferThirdParty | HIGH | Defer non-critical third-party scripts to after page load |
| BundleConditional | MEDIUM | Load feature code conditionally based on user roles or feature flags |
| BundlePreload | MEDIUM | Add preload hints for dynamically imported chunks to reduce perceived load time |


---

### R5.1 Avoid Barrel File Imports

**Impact: CRITICAL (200-800ms import cost, slow builds)**

Import directly from source files instead of barrel files to avoid loading thousands of unused modules. **Barrel files** are entry points that re-export multiple modules (e.g., `index.js` that does `export * from './module'`).

Popular icon and component libraries can have **up to 10,000 re-exports** in their entry file. For many React packages, **it takes 200-800ms just to import them**, affecting both development speed and production cold starts.

**Why tree-shaking doesn't help:** When a library is marked as external (not bundled), the bundler can't optimize it. If you bundle it to enable tree-shaking, builds become substantially slower analyzing the entire module graph.

**Incorrect: imports entire library**

```tsx
import { Check, X, Menu } from 'lucide-react'
// Loads 1,583 modules, takes ~2.8s extra in dev
// Runtime cost: 200-800ms on every cold start

import { Button, TextField } from '@mui/material'
// Loads 2,225 modules, takes ~4.2s extra in dev
```

**Correct: imports only what you need**

```tsx
import Check from 'lucide-react/dist/esm/icons/check'
import X from 'lucide-react/dist/esm/icons/x'
import Menu from 'lucide-react/dist/esm/icons/menu'
// Loads only 3 modules (~2KB vs ~1MB)

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
// Loads only what you use
```

**Alternative: Next.js 13.5+**

```js
// next.config.js - use optimizePackageImports
module.exports = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@mui/material']
  }
}

// Then you can keep the ergonomic barrel imports:
import { Check, X, Menu } from 'lucide-react'
// Automatically transformed to direct imports at build time
```

Direct imports provide 15-70% faster dev boot, 28% faster builds, 40% faster cold starts, and significantly faster HMR.

Libraries commonly affected: `lucide-react`, `@mui/material`, `@mui/icons-material`, `@tabler/icons-react`, `react-icons`, `@headlessui/react`, `@radix-ui/react-*`, `lodash`, `ramda`, `date-fns`, `rxjs`, `react-use`.

Reference: [https://vercel.com/blog/how-we-optimized-package-imports-in-next-js](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)

---

### R5.2 Dynamic Imports for Heavy Components

**Impact: CRITICAL (directly affects TTI and LCP)**

Use `next/dynamic` to lazy-load large components not needed on initial render.

**Incorrect: Monaco bundles with main chunk ~300KB**

```tsx
import { MonacoEditor } from './monaco-editor'

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />
}
```

**Correct: Monaco loads on demand**

```tsx
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(
  () => import('./monaco-editor').then(m => m.MonacoEditor),
  { ssr: false }
)

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />
}
```

---

### R5.3 Defer Non-Critical Third-Party Libraries

**Impact: MEDIUM (loads after hydration)**

Analytics, logging, and error tracking don't block user interaction. Load them after hydration.

**Incorrect: blocks initial bundle**

```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**Correct: loads after hydration**

```tsx
import dynamic from 'next/dynamic'

const Analytics = dynamic(
  () => import('@vercel/analytics/react').then(m => m.Analytics),
  { ssr: false }
)

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

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

The `typeof window !== 'undefined'` check prevents bundling this module for SSR, optimizing server bundle size and build speed.

---

### R5.5 Preload Based on User Intent

**Impact: MEDIUM (reduces perceived latency)**

Preload heavy bundles before they're needed to reduce perceived latency.

**Example: preload on hover/focus**

```tsx
function EditorButton({ onClick }: { onClick: () => void }) {
  const preload = () => {
    if (typeof window !== 'undefined') {
      void import('./monaco-editor')
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

The `typeof window !== 'undefined'` check prevents bundling preloaded modules for SSR, optimizing server bundle size and build speed.


## Rule Interactions

- **BundleBarrelImports + BundleDynamicImports** address different bundle problems and should both be applied. BarrelImports reduces the size of each chunk by eliminating unused module evaluation. DynamicImports splits chunks so that large components are not in the initial bundle. A component that is both barrel-imported and statically imported incurs both penalties simultaneously — fixing only one still leaves significant waste.
- **BundleDynamicImports + BundlePreload** are sequential: you must dynamic-import first (creating a separate chunk), then preload that chunk. Preloading without dynamic imports has no effect because the code is already in the main bundle. The ideal pattern is: dynamic import for code splitting, preload on hover/focus for perceived performance.
- **BundleDeferThirdParty + BundlePreload** can conflict. Deferring a script means it loads later; preloading means it loads earlier. For third-party scripts, defer is almost always correct — preload should be reserved for your own dynamically-imported code, not third-party analytics.
- **BundleConditional + BundleDynamicImports** work together for feature-gated code. The pattern is: check the feature flag, then `dynamic(() => import('./AdminPanel'))` only when the flag is true. The dynamic import ensures the admin code is never even downloaded for non-admin users.

## Anti-Patterns (Severity Calibration)

### CRITICAL
- **Barrel import from icon library without optimizePackageImports**: `import { Check, X } from 'lucide-react'` loads 1,583 modules and adds ~2.8s to dev startup and 200-800ms to every production cold start. This single import pattern is the most common bundle size violation in Next.js applications.
- **Static import of code editor**: `import { MonacoEditor } from '@monaco-editor/react'` adds ~300KB to the initial bundle for a component that most users interact with after page load. Must be dynamically imported with `ssr: false`.

### HIGH
- **Synchronous analytics script**: `<script src="https://analytics.example.com/tracker.js" />` in `_document.tsx` or root layout blocks the entire page render. Switch to `next/script` with `strategy="lazyOnload"`.
- **Unconditional admin panel import**: `import AdminDashboard from './AdminDashboard'` at the top of a page visible to all users, even though only admins see the component. The 150KB admin bundle is downloaded by every visitor.

### MEDIUM
- **Dynamic import without preload on predictable navigation**: A settings page loaded via `dynamic(() => import('./Settings'))` with no preload hint on the settings navigation link. Users see a loading spinner for 200-500ms on every navigation. Add `router.prefetch('/settings')` or `<link rel="preload">` on the nav item.
- **Mixed barrel and direct imports from same library**: Half the codebase uses `import { Button } from '@mui/material'` and the other half uses `import Button from '@mui/material/Button'`. The barrel imports negate the savings from direct imports because the full module graph is still evaluated.

## Examples

### Example 1: Import Optimization Pipeline (BarrelImports + DynamicImports + Preload)

```tsx
// BEFORE: Barrel imports + static heavy component — 2.1MB initial bundle
import { Check, X, Menu, Settings, User } from 'lucide-react' // 1,583 modules
import { MonacoEditor } from '@monaco-editor/react'             // 300KB
import { Chart } from 'recharts'                                 // 200KB

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

// AFTER: Direct imports + dynamic loading + preload — 180KB initial bundle
import Check from 'lucide-react/dist/esm/icons/check'
import Menu from 'lucide-react/dist/esm/icons/menu'
import Settings from 'lucide-react/dist/esm/icons/settings'
import UserIcon from 'lucide-react/dist/esm/icons/user'

import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(m => m.MonacoEditor),
  { ssr: false, loading: () => <EditorSkeleton /> }
)

const Chart = dynamic(
  () => import('recharts').then(m => m.Chart),
  { loading: () => <ChartSkeleton /> }
)

function CodeReviewPage({ code, metrics }: Props) {
  const [showEditor, setShowEditor] = useState(false)
  return (
    <div>
      <Menu /> <Settings /> <UserIcon />
      {/* Preload editor chunk on button hover */}
      <button
        onMouseEnter={() => import('@monaco-editor/react')}
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

BarrelImports saves ~1MB of module evaluation. DynamicImports removes 500KB from initial chunk. Preload on hover ensures the editor is ready before the user clicks.

### Example 2: Conditional Feature Loading (Conditional + DynamicImports + DeferThirdParty)

```tsx
// BEFORE: Admin panel + analytics loaded for every user
import AdminDashboard from './AdminDashboard'  // 150KB — all users download it
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
        strategy="lazyOnload"  // loads after everything else
      />
      {children}
      {user.isAdmin && <AdminDashboard />} {/* chunk only downloaded for admins */}
    </>
  )
}
```

Non-admin users save 150KB of JavaScript. All users benefit from deferred analytics script (no more render-blocking).

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
