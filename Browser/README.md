# Browser

Debug-first Playwright workflow for page verification and frontend troubleshooting.

## Quick Start

Run commands from the installed Browser skill directory (the folder containing this README). Use existing dependencies and a browser executable when available. Node24 and Bun1.3.5 on Windows, including paths with spaces, are tested. Bun uses an available TypeScript-capable Node for the persistent Windows session; older cached-tsx fallback and other hosts remain unverified; a Node invocation that needs a TypeScript loader must supply that loader before running the CLI.

```bash
# Install dependencies
bun install

# Install Chromium browser
bunx playwright install chromium

# Diagnose a page load
bun run Tools/Browse.ts https://example.com

# Verify a page with a specific selector
bun run examples/verify-page.ts https://example.com "h1"
```

With an existing Node24 setup, `node Tools/Browse.ts <url>` uses the same commands. To inspect a target after interacting, use `node Tools/Browse.ts check "<selector>"`; this keeps the current state instead of navigating again. The standalone URL example deliberately navigates.

## What This Skill Is For

Use Browser when you need to:
- inspect the rendered page
- catch console or network failures
- capture screenshot evidence
- reproduce a short browser flow before verifying the result

The main path is diagnostic-first, not general-purpose automation.

## Core Workflow

1. Run `bun run Tools/Browse.ts <url>`.
2. Review the screenshot, console output, failed requests, and page status.
3. If needed, dig deeper with `errors`, `console`, `network`, or `failed`.
4. Use `click`, `fill`, or `type` only to reach the state you need to inspect.
5. Capture final evidence with `screenshot` or `a11y` before reporting success.

## Public Commands

```bash
bun run Tools/Browse.ts <url>
bun run Tools/Browse.ts a11y
bun run Tools/Browse.ts errors
bun run Tools/Browse.ts console
bun run Tools/Browse.ts network
bun run Tools/Browse.ts failed
bun run Tools/Browse.ts screenshot [path]
bun run Tools/Browse.ts click <selector>
bun run Tools/Browse.ts check <selector> [visible|attached]
bun run Tools/Browse.ts fill <selector> <value>
bun run Tools/Browse.ts type <selector> <text>
bun run Tools/Browse.ts status
bun run Tools/Browse.ts restart
bun run Tools/Browse.ts stop
```

## Verification Checklist

Before claiming a web change works:
- load the changed page in Browser
- inspect screenshot or accessibility output
- check console errors
- check failed requests
- report issues instead of claiming success if diagnostics are not clean

## Requirements

- A working TypeScript-capable Node invocation, or Bun (Windows Bun1.3.5 with existing Node24 is tested)
- Playwright dependency installed in this skill directory
- Chromium installed, or an existing executable selected with `BROWSER_EXECUTABLE` for the session server
