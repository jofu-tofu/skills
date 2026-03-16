# SkillIntent — Browser

> **For agents modifying this skill:** Read this before making any changes.

## Problem This Skill Solves

AI agents need to verify rendered web changes and debug frontend behavior from the browser surface, not from source code assumptions alone. Without this skill, agents either cannot see the page state at all or rely on screenshot-only workflows that miss console and network evidence.

## Explicit Out-of-Scope

- Public guidance for broad Playwright capability discovery or full API catalog coverage.
- Public workflows for MCP parity maintenance, PDF export, device emulation, codegen, or opening URLs in the user's default browser.
- Test-framework design, assertion libraries, or end-to-end suite architecture.

## Success Criteria

1. **Debug visibility by default** — Console errors, failed requests, and page state are captured from the first browser action.
2. **Rendered-state understanding** — The skill provides screenshot or accessibility-tree evidence that reflects what the page actually rendered.
3. **Verification-first flow** — Public workflows center on page verification, troubleshooting, and minimal reproduction of browser issues.
4. **Minimal interaction surface** — Interactions are documented only as needed to reach the state being inspected or verified.
5. **Actionable failures** — Common setup and runtime failures produce direct next-step guidance.
6. **Cross-platform execution** — The public workflow remains usable on Windows, macOS, and Linux.

## Constraints

- **No MCP dependency** — Uses direct Playwright APIs, not the Playwright MCP server.
- **Single active session** — Only one browser session runs at a time.
- **Accessibility tree max 200 lines** — Output is truncated to control context size.
- **Playwright installed separately** — Users install Playwright browsers independently.
- **Public docs stay narrow** — The main skill story stays focused on debugging, verification, screenshots, and minimal interaction.

## Design Decisions

1. **Client-server architecture** — `BrowserSession.ts` runs as a persistent server and `Browse.ts` is the CLI client, which preserves session state across commands.
2. **Always-on diagnostics** — Console and network listeners attach at launch so debugging evidence exists when a problem appears.
3. **Accessibility snapshots over heavy visuals** — `ariaSnapshot()` gives a compact, structured page view when a screenshot is unnecessary.
4. **Debug-first public surface** — Public skill docs emphasize verify/debug workflows even if the underlying code supports broader helper commands.
