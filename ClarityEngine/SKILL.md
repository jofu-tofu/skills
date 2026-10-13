---
name: ClarityEngine
description: Comprehension-first document and presentation authoring in a plain, direct, connected style. USE WHEN create document OR create presentation OR create HTML report OR create PowerPoint deck OR build slide deck OR make deck OR make a slideshow OR generate slides OR create html document OR build web document OR create scrollable report OR create ppt deck OR create powerpoint deck OR create professional deck OR analyze codebase visually OR architecture diagram OR visual explanation OR convert presentation OR html to ppt OR ppt to html OR html to powerpoint OR powerpoint to html OR turn into powerpoint OR change format OR review presentation OR polish slide deck OR presentation quality check OR readability check OR check readability OR run readability gate OR diagram the codebase OR show type flow OR diagram how modules connect.
compatibility: Designed for Codex and Devin (or similar agent products)
metadata:
  author: pai
  version: "1.1.2"
---

# ClarityEngine

Create documents and presentations that help readers understand the subject, follow the reasoning, and know what to do next. Start with the audience and main point. Gather the evidence, write the explanation, then build and inspect the file.

Use PersonalStyleGuide.md for these instructions and the documents they produce. It covers writing, organization, formatting, and copying.

- HTML for reports readers scroll through and follow links from
- PPT/PPTX for presentations and corporate templates

## Workflow Routing

Choose the matching workflow below, read its file, and follow its steps.

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
| `Philosophy.md` | Four core principles and 23-checkpoint Readability Contract |
| `PersonalStyleGuide.md` | Writing, organization, formatting, and copying preferences |
| `ReaderCheck.md` | Check what a fresh reader understands without showing the expected answers |
| `RegressionCases.md` | Four sample tasks for comparing skill versions; load when testing updates |
| `FormatAdapters.md` | Choose the format skill, build the file, and check its appearance |
| `ToolingLandscape.md` | Optional tool and design references; check availability before use |

## Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| `Tools/OpenInBrowser.ts` | Opens a file in the user's default browser (Windows/WSL/macOS/Linux) | `bun Tools/OpenInBrowser.ts <file-path>` |

## Known Gotchas

- Mermaid `11.12.3` parsing is sensitive to label text. In diagram labels/messages, avoid `$`, escaped `\n`, and punctuation-heavy strings when a plain-language label works. If rendering fails, simplify labels and re-open the HTML artifact.

## Examples

**Example 1: Codebase analysis document**
```
User: "Create an html document analyzing this codebase's architecture"
-> Invokes CreateDocument workflow
-> Detects content type: codebase-analysis
-> Loads Philosophy.md and PersonalStyleGuide.md
-> Renders as scrollable HTML with FormatAdapters
-> Runs ReadabilityGate with the general and codebase checks
```

**Example 2: Customer-facing review deck**
```
User: "Create a customer-facing powerpoint to review this workflow change"
-> Invokes CreateDocument workflow
-> Builds Document Brief with `audience_exposure=customer` and `artifact_intent=review`
-> Applies Philosophy.md's guidance for customers and decisions
-> Leads with the change, shows supporting screenshots, and states the feedback needed
-> Returns PPTX with speaker notes and a status based on the checks actually completed
```

**Example 3: Readability check**
```
User: "Run a readability check on this document"
-> Invokes ReadabilityGate workflow
-> Checks the document against the relevant items in Philosophy.md
-> Reports what the reader understood, what was verified, and which problems need attention first
```
