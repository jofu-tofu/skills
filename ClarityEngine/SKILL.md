---
name: ClarityEngine
description: Comprehension-optimized document and presentation authoring. PAI's universal clarity layer. USE WHEN create document OR create presentation OR create HTML report OR create PowerPoint deck OR build slide deck OR make deck OR make a slideshow OR generate slides OR create html document OR build web document OR create scrollable report OR create ppt deck OR create powerpoint deck OR create professional deck OR analyze codebase visually OR architecture diagram OR visual explanation OR convert presentation OR html to ppt OR ppt to html OR html to powerpoint OR powerpoint to html OR turn into powerpoint OR change format OR review presentation OR polish slide deck OR presentation quality check OR readability check OR check readability OR run readability gate OR diagram the codebase OR show type flow OR diagram how modules connect.
compatibility: Designed for Claude Code and Devin (or similar agent products)
metadata:
  author: pai
  version: "1.0.0"
---

# ClarityEngine

Comprehension-optimized document and presentation authoring. Philosophy-first: five comprehension principles drive all output; format is a late rendering choice.

- HTML for scrollable, link-friendly, readable documents
- PPT/PPTX for enterprise and formal stakeholder settings

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

**When executing a workflow, output this notification:**

```
Running the **WorkflowName** workflow from the **ClarityEngine** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **CreateDocument** | "create presentation", "build slide deck", "make deck", "make a slideshow", "generate slides", "create html document", "build web document", "create html report", "create scrollable report", "create ppt deck", "create powerpoint deck", "create professional deck", "analyze codebase", "build deck" | `Workflows/CreateDocument.md` |
| **RepurposeDocument** | "convert presentation", "html to ppt", "ppt to html", "html to powerpoint", "powerpoint to html", "turn into powerpoint", "change format", "convert format" | `Workflows/RepurposeDocument.md` |
| **ReviewDocument** | "review presentation", "polish slide deck", "presentation quality check", "review document", "quality check" | `Workflows/ReviewDocument.md` |
| **ReadabilityGate** | "readability check", "check readability", "run readability gate" | `Workflows/ReadabilityGate.md` |

## Context Files

| File | Purpose |
|------|---------|
| `Philosophy.md` | Five comprehension principles and 15-checkpoint Readability Contract — the core of this skill |
| `FormatAdapters.md` | Format-specific rendering instructions (HTML, PPT) and selection logic |
| `ToolingLandscape.md` | Verified external tooling and CDN references with trade-offs |

## Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| `Tools/OpenInBrowser.ts` | Opens a file in the user's default browser (WSL/macOS/Linux) | `bun Tools/OpenInBrowser.ts <file-path>` |

## Known Gotchas

- Mermaid `11.12.3` parsing is sensitive to label text. In diagram labels/messages, avoid `$`, escaped `\n`, and punctuation-heavy strings when a plain-language label works. If rendering fails, simplify labels and re-open the HTML artifact.

## Examples

**Example 1: Codebase analysis document**
```
User: "Create an html document analyzing this codebase's architecture"
-> Invokes CreateDocument workflow
-> Detects content type: codebase-analysis
-> Loads Philosophy.md for comprehension principles
-> Renders as scrollable HTML with FormatAdapters
-> Auto-chains ReadabilityGate with general + codebase-analysis checkpoints
```

**Example 2: Customer-facing review deck**
```
User: "Create a customer-facing powerpoint to review this workflow change"
-> Invokes CreateDocument workflow
-> Builds Document Brief with `audience_exposure=customer` and `artifact_intent=review`
-> Applies the Audience and Review Addendum from Philosophy.md
-> Uses inverted-pyramid ordering, plain-language labels, screenshot-led evidence, and a clear confirmation ask
-> Returns customer-ready PPTX with speaker notes
```

**Example 3: Readability check**
```
User: "Run a readability check on this document"
-> Invokes ReadabilityGate workflow
-> Scores against Philosophy.md's Readability Contract checkpoints
-> Returns advisory PASS/FAIL verdict with severity-ranked findings
```
