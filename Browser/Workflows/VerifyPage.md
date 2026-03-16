# VerifyPage Workflow

> **Trigger:** "verify page", "check page", "debug page load"

## Reference Material

- **Skill file:** `../SKILL.md`
- **Skill intent:** `../SkillIntent.md`
- **Quick usage guide:** `../README.md`

## Purpose

Verify that a page renders correctly and surface browser-side failures with evidence from the actual rendered page.

## Workflow Steps

1. **Start with the diagnostic command**
   ```bash
   bun run Tools/Browse.ts <url>
   ```
   Use this first unless the user already has an active browser session on the target page.

2. **Inspect the default evidence**
   Review the screenshot path, console errors, failed requests, network summary, page title, and final status.

3. **Check a target selector when the task names one**
   ```bash
   bun run examples/verify-page.ts <url> "<selector>"
   ```
   Use this when the user cares about a specific heading, button, form, or region.

4. **Drill deeper only where needed**
   ```bash
   bun run Tools/Browse.ts errors
   bun run Tools/Browse.ts console
   bun run Tools/Browse.ts network
   bun run Tools/Browse.ts failed
   ```

5. **Capture final proof**
   Use `screenshot` for visual proof or `a11y` for a lighter-weight structural snapshot.

6. **Report what the browser proved**
   If there are console errors or failed requests, report them plainly instead of claiming the page works.
