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

3. **Critically evaluate the visual state**
   After capturing, inspect the screenshot for layout and visual quality issues before reporting that things look correct. Check for:
   - Text or content clipped by container boundaries
   - Asymmetric spacing, padding, or alignment between elements that should match
   - Elements overlapping or overflowing their containers
   - Text that doesn't fit its bounding box (truncated, wrapped awkwardly, or too small to read)
   - Visual imbalance — one side heavier, uneven gutters, inconsistent margins
   - Misaligned rows, columns, or grid items that should line up

   If any of these are present, describe the specific problem. Do not say the page "looks fine" or "renders correctly" when visual issues are visible.

4. **Prefer evidence over decoration**
   Capture the state that matters to the task: the broken page, the loaded component, or the final verified result.

5. **Pair with diagnostics when relevant**
   If the screenshot is part of verification or debugging, also review console errors and failed requests before reporting success.
