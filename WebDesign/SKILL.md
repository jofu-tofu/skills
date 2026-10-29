---
name: Webdesign
description: Design and implement web interfaces with a deliberate visual system and browser verification. USE WHEN web design, landing page, dashboard design, prototype, design variants, design system, polish UI.
---

# Webdesign

Read `PORTABILITY.md` before use.

Read References/FrontendDesignPhilosophy.md and the intent that fits the task:

| Request | Intent |
|---|---|
| Implement or improve an interface in code | Intents/DirectDesign.md |
| Compare mockups or use an explicitly available design app | Intents/NativeDesign.md |

Respect the existing framework, tokens and components. Choose a visual register suited to the content. Produce usable code, accessible semantics, keyboard operation, responsive layouts and reduced-motion behavior. Render the result in the host browser and inspect a screenshot plus the relevant interactions. Critique hierarchy, spacing, fonts, contrast and task completion; fix defects or state what remains unverified. No separate critique, screenshot, publishing or design-system service is required.

Tools/VerifyDesign.ts checks a supplied PNG file's header and dimensions only; it does not capture a page or certify visual quality. Browser capture and visual inspection use the host tools. NativeDesign is optional and requires explicit access to the chosen design application; DirectDesign works without it. Read References/SiteLaunch.md when a public launch is requested, and do not publish unless authorized.

## Examples

Ask for the Webdesign workflow with the relevant task, input files and output destination. Apply the local method using available host tools, then report the result and evidence; identify any unavailable capability.
