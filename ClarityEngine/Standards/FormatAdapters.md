# Format Adapters

ClarityEngine plans the explanation; installed format skills build the file. This file says how to choose a format, build it, capture what the Visual lens needs, and define the verification layers the Verifier reports.

## Choose the Format

The **main path** of any artifact is everything outside collapsed sections and appendices. It is what a reader meets without choosing to expand anything, and the reading-time budget applies to it.

Honor a requested format. Otherwise prefer `html` for a scrollable report and `ppt` for a formal presentation, and record the reason. The identifiers `ppt` and `pptx` select the same PPTX adapter. Read the applicable specialist skill before building. Use an available supported renderer rather than installing a new toolchain.

## HTML Adapter

- Build semantic HTML with clear headings and readable text. Use inline CSS and static content for a self-contained report where practical.
- Target body text of at least 16px, roughly 1.5 line height, and text widths around 75ch, adapted to the content.
- Put collapsible detail in `<details>` elements, and keep essential reasoning outside them.
- Use Mermaid when it suits the diagram, or static SVG or images when clearer.
- Prefer self-contained assets when offline delivery matters. If external dependencies are needed, verify their official documentation, pin the tested version, and disclose the network requirement.
- Open the artifact with the available browser tool, or with `Tools/OpenInBrowser.ts` resolved relative to this skill, and check its exit result. An opened browser is not visual verification.

## Copied Content

When content will be copied into another editor, in any format, keep its headings, list hierarchy, and explicit blank lines between sections in both rich-text and plain-text copies, rather than relying on page margins. For mock messages or callouts in HTML, provide a rich-HTML or image copy option, keep the text available, and label what the button copies. Check the destination app's paste behavior when it is accessible; a successful copy does not prove that app keeps the styling. Report that check under Target app.

## PPT Adapter

Use the installed presentation skill. When a company or event template is requested or clearly required, use its matching template skill. Discover those skills in the current session rather than assuming file paths.

Before rendering, record each slide's point, evidence, explanation, visual, and speaker-note needs. Preserve the requested template and editability. Product screenshots are evidence when the claim concerns visible product behavior. Follow the specialist's generation and repair process, and re-render after changes.

## Other Formats

For `docx`, use the installed document skill; for `pdf`, use the installed PDF skill. If a requested format has no supported adapter, name the missing capability before choosing an alternative with the user.

## Render Evidence

Save what the Visual lens and the Reader need into `$REVIEW_DIR/render/`, named by page or slide:

- **HTML:** full-page captures at desktop and narrow widths, plus print layout when it applies. Record console errors and failed asset loads. For offline delivery, capture with network access disabled.
- **PPTX:** an image of every slide, and the presenter notes as text.
- **PDF and DOCX:** an image of every page.

Record the renderer and the artifact version. Captures from an earlier version do not count.

## Verification Layers

| Layer | What it establishes |
|---|---|
| Content | Claims, numbers, causal links, caveats, sources, and actions match the brief and sources |
| File | The format's structural or package validation succeeded |
| Rendered | The actual pages, slides, or document were captured and inspected |
| Target app | Behavior was tested in the intended app, such as PowerPoint opening without a repair warning |

Each layer is passed, failed, not run, or not applicable, with a reason for not applicable. Target-app verification is required when the request or delivery depends on that app; otherwise report it as not run. Rendering checks are required for visual deliverables. An unsupported tool or inaccessible app is a stated verification limit, never an assumed pass.

## Adding a Format

Add its identifier, specialist routing, render-evidence requirements, and file checks here. Workflows accept any identifier listed in this file.
