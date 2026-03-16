---
name: Browser
description: Debug-first browser automation for Playwright page verification and frontend troubleshooting. Console logs, network failures, screenshots, and accessibility snapshots are part of the primary workflow. USE WHEN verify UI, debug web, inspect rendered page, troubleshoot frontend, take browser screenshot, or reproduce a browser issue.
compatibility: Designed for Claude Code and Devin (or similar agent products). Requires Playwright.
metadata:
  author: pai
  version: "2.0.0"
---

# Browser

Debug-first Playwright automation for seeing the rendered page, collecting diagnostics, and verifying browser behavior before you claim a web change works.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **VerifyPage** | "verify page", "check page", "debug page load" | `Workflows/VerifyPage.md` |
| **Screenshot** | "take screenshot", "capture page", "browser screenshot" | `Workflows/Screenshot.md` |
| **Interact** | "reproduce browser flow", "fill form", "click through page" | `Workflows/Interact.md` |

## Examples

**Example 1: Verify a frontend change**
```
User: "Verify the settings page loads without browser errors"
-> Invokes VerifyPage workflow
-> Runs the diagnostic-first Browser flow against the page
-> Returns screenshot-backed verification plus any console/network issues
```

**Example 2: Debug a broken page**
```
User: "Debug why the users page is blank"
-> Invokes VerifyPage workflow
-> Loads the page with diagnostics enabled
-> Uses console and failed request output to identify the breakage
```

**Example 3: Reproduce a form flow before verifying**
```
User: "Fill the login form and verify the dashboard loads"
-> Invokes Interact workflow
-> Uses minimal browser interactions to reach the target state
-> Finishes with verification evidence from the rendered dashboard
```

## Execution Notes

- Start with `bun run Tools/Browse.ts <url>` whenever you need the clearest diagnostic picture.
- Use `a11y` when text structure is enough; use screenshots when visual proof matters.
- Use `click`, `fill`, and `type` only to reach the state you need to inspect or verify.
- If the page shows console errors or failed requests, report them instead of claiming success.

## Public Command Surface

```bash
bun run Tools/Browse.ts <url>
bun run Tools/Browse.ts a11y
bun run Tools/Browse.ts errors
bun run Tools/Browse.ts console
bun run Tools/Browse.ts network
bun run Tools/Browse.ts failed
bun run Tools/Browse.ts screenshot [path]
bun run Tools/Browse.ts click <selector>
bun run Tools/Browse.ts fill <selector> <value>
bun run Tools/Browse.ts type <selector> <text>
bun run Tools/Browse.ts status
bun run Tools/Browse.ts restart
bun run Tools/Browse.ts stop
```

## Verification Standard

Run the Browser skill against the rendered page before you call a web change verified. Screenshot evidence and diagnostics are the default proof, not optional extras.
