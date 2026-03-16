# Screenshot Workflow

> **Trigger:** "take screenshot", "capture page", "browser screenshot"

## Reference Material

- **Skill file:** `../SKILL.md`
- **Skill intent:** `../SkillIntent.md`
- **Quick usage guide:** `../README.md`

## Purpose

Capture visual evidence from the current browser state or from a freshly loaded page.

## Workflow Steps

1. **Load the page if needed**
   ```bash
   bun run Tools/Browse.ts <url>
   ```
   Use this when the screenshot also needs diagnostics from the page load.

2. **Take the screenshot**
   ```bash
   bun run Tools/Browse.ts screenshot
   bun run Tools/Browse.ts screenshot <path>
   ```

3. **Prefer evidence over decoration**
   Capture the state that matters to the task: the broken page, the loaded component, or the final verified result.

4. **Pair with diagnostics when relevant**
   If the screenshot is part of verification or debugging, also review console errors and failed requests before reporting success.
