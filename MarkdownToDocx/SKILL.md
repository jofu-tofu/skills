---
name: MarkdownToDocx
description: Convert Markdown content to DOCX with reliable defaults, Mermaid diagram rendering, table-visibility hardening, and automatic open-after-conversion behavior. USE WHEN user wants to convert markdown to docx, md to word, generate a .docx from markdown, batch-convert markdown files, fix docx table visibility, or open the generated docx automatically.
compatibility: Designed for Claude Code and Devin (or similar agent products). Requires pandoc.
metadata:
  author: pai
  version: "1.0.0"
---

# MarkdownToDocx

Convert Markdown documents into Word `.docx` output using `pandoc`, with automatic Mermaid diagram rendering to images, visible table formatting, and auto-open for immediate review.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **ConvertMarkdownToDocx** | "convert markdown to docx", "md to docx", "markdown to word", "make docx from markdown" | `Workflows/ConvertMarkdownToDocx.md` |

## Examples

**Example 1: Single file conversion**
```
User: "Convert notes.md to docx."
-> Invokes ConvertMarkdownToDocx workflow
-> Detects mermaid blocks, renders them to PNG via Playwright
-> Runs pandoc with image references for rendered diagrams
-> Applies table visibility post-processing on the generated .docx
-> Opens the generated .docx and returns verification status
```

**Example 2: Explicit output location**
```
User: "Make a Word file from docs/summary.md into exports/summary.docx."
-> Invokes ConvertMarkdownToDocx workflow
-> Converts with provided destination path
-> Hardens table visibility and auto-opens exports/summary.docx
-> Verifies output exists and is non-empty
```

**Example 3: Batch conversion**
```
User: "Convert all markdown files in reports/ to docx files."
-> Invokes ConvertMarkdownToDocx workflow
-> Iterates markdown inputs and converts each to matching .docx output
-> Applies table visibility post-processing to each output and opens the generated files
-> Returns success/failure summary per file
```
