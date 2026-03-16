# Interact Workflow

> **Trigger:** "reproduce browser flow", "fill form", "click through page"

## Reference Material

- **Skill file:** `../SKILL.md`
- **Skill intent:** `../SkillIntent.md`
- **Verification workflow:** `./VerifyPage.md`

## Purpose

Use minimal browser interaction to reach the page state that needs to be debugged or verified.

## Workflow Steps

1. **Load the starting page with diagnostics**
   ```bash
   bun run Tools/Browse.ts <url>
   ```

2. **Use only the interaction needed to reach the target state**
   ```bash
   bun run Tools/Browse.ts fill "<selector>" "<value>"
   bun run Tools/Browse.ts click "<selector>"
   bun run Tools/Browse.ts type "<selector>" "<text>"
   ```
   Each command prints the updated accessibility tree so you can confirm the UI changed.

3. **Pause and inspect after meaningful transitions**
   When the page changes, check the updated a11y output, then use `errors`, `console`, or `failed` if something looks wrong.

4. **Finish with verification**
   Once you reach the desired state, follow the VerifyPage workflow to confirm the final rendered result.

5. **Keep the workflow narrow**
   This workflow exists to reproduce short browser flows that support debugging or verification, not to document the entire Playwright feature surface.
