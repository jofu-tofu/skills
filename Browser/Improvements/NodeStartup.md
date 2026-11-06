# Node startup and spaced paths

2026-11-05. B-SESSION/B-PORT scoped improvement, not whole-platform certification.

With existing Playwright and Chromium, the public Node CLI could not cold-start from a path containing spaces. It launched a separate `npx tsx` dependency even though its own Node invocation already supported TypeScript. The server path also came from URL.pathname, retaining encoded spaces. Both original and session-identity candidates timed out; a runtime-only candidate still failed until canonical fileURLToPath decoding was added.

Node callers now reuse process.execPath and their loader arguments without a shell. Bun behavior is unchanged. fileURLToPath supplies the actual filesystem path. No package installation is needed when the existing Node invocation already works.

Actual Node24/Windows/Chromium comparison: baseline and intermediate candidates fail cold start; final candidate starts, preserves clicked in-memory page state during reuse, keeps the same session identity, restarts with a new identity, and stops the service. Original diagnostic and cleared-navigation suites and both portable regression tests also pass.

Evidence: SkillForge project `20-working-T1-T3/RemainingSkills20261104/deep/engineering/cold-start-{candidate3,candidate5,candidate6,candidate7}/`; frozen final runtime `engineering/candidate7/Browser`. The harness changed only the disposable CLI's default9222 to a reserved loopback port so no existing user service was reached, and linked existing read-only dependencies. This tests cold-start behavior and path handling, not unmodified default-port integration. Failures and adaptation records remain preserved.

Open: Bun Windows fallback, older Node/tsx-loader invocation, other operating systems, startup error detail, and remaining visual/selector workflows. Do not generalize the demonstrated Node24 path to every supported host.
