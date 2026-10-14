---
name: ClarityEngine
description: Comprehension-first document and presentation authoring in a plain, direct, connected style. USE WHEN create document OR create presentation OR create HTML report OR create PowerPoint deck OR build slide deck OR make deck OR make a slideshow OR generate slides OR create html document OR build web document OR create scrollable report OR create ppt deck OR create powerpoint deck OR create professional deck OR analyze codebase visually OR architecture diagram OR visual explanation OR convert presentation OR html to ppt OR ppt to html OR html to powerpoint OR powerpoint to html OR turn into powerpoint OR change format OR review presentation OR polish slide deck OR presentation quality check OR readability check OR check readability OR run readability gate OR diagram the codebase OR show type flow OR diagram how modules connect.
compatibility: Designed for Claude Code, Codex, and Devin (or similar agent products)
metadata:
  author: pai
  version: "1.3.0"
---

# ClarityEngine

Create documents and presentations that help readers understand the subject, follow the reasoning, and know what to do next. Start with the audience and main point, gather the evidence, write the explanation, and build the file. Then a panel of independent reviewers checks it, a Verifier decides which findings stand, and the author applies the verified fixes.

- HTML for reports readers scroll through and follow links from
- PPT/PPTX for presentations and corporate templates

## Workflow Routing

When a workflow is matched, read its file and follow the steps within it.

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
| **Verify** | Internal — started by ReadabilityGate | `Workflows/Verify.md` |

## How Review Works

ReadabilityGate starts each lens as a separate agent that reads only its own lens file, the shared contract, and the inputs its lens names. No reviewer sees another's rules or findings. The Verifier filters and merges the findings, settles conflicts between lenses, and sets the statuses. The author applies only verified fixes.

| Lens | Asks |
|---|---|
| `Lenses/Reader.md` | Can I answer the questions using only this document? |
| `Lenses/Cutter.md` | What can go without the reader losing anything? |
| `Lenses/Logician.md` | Can I follow why each claim holds? |
| `Lenses/Navigator.md` | Does a skimmer get the ask, the decision, and the risk? |
| `Lenses/AudienceFit.md` | Is it written for this reader, at the right depth? |
| `Lenses/Visual.md` | Can I read the rendered output, and do the visuals match the text? |

The Readability Contract in `Standards/Philosophy.md` maps each RC to its lens.

## Context Files

| File | Purpose |
|------|---------|
| `Standards/Philosophy.md` | Four core principles and the RC index; usable by other skills on its own |
| `Standards/PersonalStyleGuide.md` | The plain, direct, connected voice, and which lenses enforce it |
| `Standards/ReviewContract.md` | Evidence standard, severity, and output format shared by every reviewer |
| `Standards/FormatAdapters.md` | Choosing and building the format, capturing render evidence, verification layers |
| `Standards/ToolingLandscape.md` | Optional tool and design references; check availability before use |
| `Standards/DocumentContract.md` | Shared contract format: section contracts, author locks, and checks that a review must keep passing |
| `Testing/RegressionCases.md` | Sample tasks for comparing skill versions; load when testing updates |
| `Testing/RuleTraceability.md` | Historical record of the pre-1.1.0 rules; not current instructions |

## Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| `Tools/MeasureDraft.ts` | Reading time against a budget, headings and openings, emphasis and bold density, first half of the main path, the skim layer of headings and bold text, and connectives lost between drafts | `bun Tools/MeasureDraft.ts <draft> --budget <minutes> [--before <old draft>] --out <dir>` |
| `Tools/OpenInBrowser.ts` | Opens a file in the user's default browser (Windows/WSL/macOS/Linux) | `bun Tools/OpenInBrowser.ts <file-path>` |

## Known Gotchas

- Mermaid `11.12.3` parsing is sensitive to label text. In diagram labels and messages, avoid `$`, escaped `\n`, and punctuation-heavy strings when a plain-language label works. If rendering fails, simplify the labels and re-open the HTML artifact.
- MeasureDraft reads Markdown, HTML, and plain text. Extract PPTX or PDF text to Markdown first.

## Examples

**Example 1: Codebase analysis document**
```
User: "Create an html document analyzing this codebase's architecture"
-> Invokes CreateDocument workflow
-> Writes a brief with content_type codebase-analysis and a 10-minute deep-dive budget
-> Drafts against the lens files, builds scrollable HTML, captures desktop and narrow renders
-> ReadabilityGate runs Reader, Cutter, Logician, Navigator, AudienceFit, and Visual in parallel
-> Verify merges the findings; the author applies verified fixes and reruns the Reader
```

**Example 2: Customer-facing review deck**
```
User: "Create a customer-facing powerpoint to review this workflow change"
-> Invokes CreateDocument workflow
-> Builds a brief with audience_exposure customer and artifact_intent review
-> Opens with a labeled decision block, then the change, its evidence, and the feedback needed
-> Returns PPTX with speaker notes and the Verifier's readiness, comprehension, and verification statuses
```

**Example 3: Readability check**
```
User: "Run a readability check on this document"
-> Invokes ReadabilityGate workflow with edit_scope none
-> Measures the draft and runs the lens panel
-> Returns the Verifier's report: what the reader understood, which findings stand, and the top fixes
```
