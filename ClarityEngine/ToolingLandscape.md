# Tooling Landscape (Verified 2026-02-19)

This document captures verified references for document and presentation generation workflows.

## Scrollable HTML Document Tooling

| Tool | CDN | Purpose | Notes |
|------|-----|---------|-------|
| [Tailwind CSS](https://tailwindcss.com/) | `https://cdn.tailwindcss.com` | Professional styling without build step | Responsive layout, typography, spacing utilities |
| [Mermaid.js](https://mermaid.js.org/) | `https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js` | Diagram rendering (flowcharts, sequence, C4) | Renders from markdown-like syntax in `<pre class="mermaid">` blocks |
| [Prism.js](https://prismjs.com/) | `https://cdn.jsdelivr.net/npm/prismjs/` | Syntax highlighting for code blocks | Language-aware, themeable, lightweight |
| [highlight.js](https://highlightjs.org/) | `https://cdn.jsdelivr.net/gh/highlightjs/cdn-release/build/` | Alternative syntax highlighting | Auto-detection, 190+ languages |

> **CDN limitation:** All tooling loads via CDN and requires internet access. Offline or air-gapped environments are not supported. Address self-contained fallback if requested.

## Verified Core Tooling (Slides and PPT)

| Tool | Primary Output | Strengths | Trade-offs | Best Fit |
|---|---|---|---|---|
| [Slidev](https://github.com/slidevjs/slidev) | HTML, PDF, PNG, PPTX export | Markdown-first, interactive components, strong theme ecosystem | Node/Vite toolchain; PPTX path is less template-controlled than native PPT automation | PPT conversion via PPTX export |
| [Marp CLI](https://github.com/marp-team/marp-cli) | HTML, PDF, PPTX, images | Fast markdown conversion, simple CLI, watch mode | Editable PPT mode has fidelity limits and extra dependencies | Cross-format draft and PPT conversion workflows |
| [reveal.js](https://github.com/hakimel/reveal.js) | HTML (+ PDF export) | Rich web presentation framework, strong API, speaker notes | More front-end customization effort | PPT conversion reference only |
| [PptxGenJS](https://github.com/gitbrent/PptxGenJS) | PPTX | Programmatic control, TypeScript support, HTML table to slides | Requires explicit layout logic | Professional PPT generation from structured data |
| [python-pptx](https://python-pptx.readthedocs.io/en/latest/) | PPTX | Mature PPT automation, placeholders, charts, template-safe editing | Python implementation effort for complex visuals | Enterprise template-driven PPT workflows |
| [claude-office-skills](https://github.com/tfriedel/claude-office-skills) | PPTX, DOCX, XLSX, PDF workflows | End-to-end office workflow patterns, includes HTML-to-PPTX path and validation scripts | Larger dependency footprint | Reference implementation for robust office pipelines |

> **Note:** Slide engines (Slidev, Marp, reveal.js) are used for PPT conversion workflows only. HTML output uses direct semantic HTML generation with CDN tooling above.

## Repository Health Snapshot

| Repository | Exists | Stars | Last Push (UTC) |
|---|---|---|---|
| `slidevjs/slidev` | Yes | 44k+ | 2026-02-12 |
| `marp-team/marp-cli` | Yes | 3k+ | 2025-11-03 |
| `hakimel/reveal.js` | Yes | 70k+ | 2026-02-16 |
| `gitbrent/PptxGenJS` | Yes | 4k+ | 2025-11-28 |
| `scanny/python-pptx` | Yes | 3k+ | 2024-08-07 |
| `tfriedel/claude-office-skills` | Yes | 200+ | 2025-10-04 |

## Notes on Prior Community Links

These earlier references were not resolvable on 2026-02-19 and should be treated as stale until re-verified:
- `goetzpa/claude-powerpoint` (GitHub returned 404)
- Multiple `skills.sh` presentation URLs returned 404 during direct checks

## Recommended Baseline Stack

1. HTML document workflow: Semantic HTML with Tailwind CSS, Mermaid.js, and Prism.js via CDN.
2. PPT professional workflow: PptxGenJS for new generation, python-pptx for template-preserving edits.
3. Conversion workflow: Marp CLI for markdown-based PPT conversion plus a review pass.
4. Enterprise pipeline reference: patterns from tfriedel/claude-office-skills.
