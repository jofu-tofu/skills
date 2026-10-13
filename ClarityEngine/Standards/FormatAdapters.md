# Format Adapters

ClarityEngine plans the explanation for the audience. Installed format skills create the file and check how it looks. Apply PersonalStyleGuide.md to authored prose; explicit audience and template requirements still apply.

## Choose the Format

Honor a requested format. Otherwise prefer `html` for a scrollable report and `ppt` for a formal presentation. The identifiers `ppt` and `pptx` select the same PPTX adapter. Record the reason when selecting automatically. Read the applicable specialist skill before building. Do not install a new toolchain when an available supported renderer meets the need.

## HTML Adapter

- Build semantic HTML with clear headings, readable text, and sections ordered most important first, in an order the reader can follow. Use inline CSS and static content for a lightweight, self-contained report where practical.
- Target readable body text (typically at least 16px), roughly 1.5 line height, and text widths around 75ch. Adapt spacing to the actual content.
- For long documents, provide section anchors and useful navigation. Keep extra detail in expandable sections when useful. Keep essential reasoning visible.
- Choose visuals that express comparison, sequence, causality, or hierarchy. Use Mermaid when appropriate, or static SVG/images when clearer. Keep diagrams understandable without animation.
- Prefer self-contained assets when offline delivery matters. If external dependencies are needed, verify their official documentation, pin the tested version, and disclose the network requirement. An unpinned CDN is not the default.
- Open the artifact through the available app/browser tool. If using the bundled OpenInBrowser helper, resolve its path relative to this installed skill and check its exit result. An opened browser is not visual verification.
- Inspect the full rendered document at desktop and narrow widths. Check navigation, legibility, overflow, diagrams, asset loading, and console errors using available browser tools. For offline delivery, verify with network access disabled.

## PPT Adapter

Use the installed presentation skill. When a company or event template is requested or clearly required, use its matching installed template skill and renderer instructions. Discover those skills in the current session rather than assuming filesystem paths.

Before rendering, record each slide's point, evidence, necessary explanation, visual, and speaker-note needs. Preserve the requested template and editable content requirements. Product screenshots are evidence when the claim concerns visible product behavior. Essential qualifications belong where the audience will see them, not only in presenter notes.

Follow the specialist's supported generation and repair process. Inspect every rendered slide for clipping, overlap, font substitution, chart labels, contrast, and note preservation. Re-render after changes. A slide preview cannot establish that PowerPoint opens the file without repairs; report that separately.

## Other Formats

For `docx`, use the installed document skill; for `pdf`, use the installed PDF skill. Follow its rendering/inspection workflow and the verification contract below. If a requested format has no supported adapter, identify the missing capability before choosing an alternative with the user.

## What Each Check Proves

Report independent evidence for each layer:

| Layer | What it establishes |
|---|---|
| Content | Claims, numbers, causal links, caveats, sources, and actions match the brief/source |
| File | The chosen format's structural/package validation succeeded |
| Rendered | The actual pages/slides/document were inspected; record renderer and artifact version |
| Target app | Behavior was tested in the intended app, such as PowerPoint opening without a repair warning |

Use passed, failed, not run, or not applicable for each layer. Record why a layer is not applicable. Target-app verification is required when the request or delivery contract depends on that app; otherwise disclose it as not run without implying it occurred. Missing required evidence prevents Ready. Rendering checks are required for visual deliverables.

Keep independent reader judgment separate from technical checks until comparing the findings. Fix material defects within scope and recheck affected output. Unsupported tools or inaccessible apps yield an explicit verification limit, not a fabricated pass.

## Adding a Format

Add its identifier, specialist routing, rendering requirements, and evidence checks here. Workflow format inputs accept supported identifiers rather than hardcoded two-format enums. Keep the comprehension principles independent of the format.
