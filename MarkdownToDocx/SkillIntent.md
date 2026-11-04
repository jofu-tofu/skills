# SkillIntent - MarkdownToDocx

> **For agents modifying this skill:** Read this before making any changes.

## First Principles

- Deterministic conversion is better than ad-hoc formatting edits.
- Explicit file mapping prevents silent output mistakes.
- Verification is required; conversion is not done until output is checked.
- Visibility in reviewer tools matters as much as conversion success.

## Problem This Skill Solves

Users often need fast, repeatable Markdown-to-Word export. Without a dedicated skill, conversions are inconsistent, path handling is error-prone, and failures are easy to miss.

Owner-agreed purpose, 2026-11-04: turn existing Markdown into a Word document the user can read, edit and share, preserving its content and meaning with little manual repair. This covers single and batch conversion.

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Conversion engine | `pandoc` CLI | Custom parser-based converter | Mature, stable, and widely installed |
| Workflow shape | Single conversion workflow with batch support | Multiple fragmented workflows | Keeps invocation simple while covering common cases |
| Validation | Require post-conversion file checks | Trust command exit code only | Prevents false success from partial failures |

## Explicit Out-of-Scope

- Rich DOCX template authoring.
- PDF or PPT export.
- Semantic document cleanup beyond conversion.

## Success Criteria

The authoritative outcome definitions and their sources are in [Quality/Outcomes.md](Quality/Outcomes.md): faithful content, readable presentation, usable Word content, predictable delivery, trustworthy status and low manual effort. These are agreed requirements, not verified performance claims.

The existing workflow retains explicit output mapping, table hardening, file checks, automatic opening and actionable failure reporting. File existence and nonzero size alone do not establish the agreed outcomes. [Quality/Measurements.md](Quality/Measurements.md) records proposed evidence and its limits; no conversion implementation change is included in this documentation revision.

## Constraints

- Keep conversion engine anchored on `pandoc`.
- Allow `python-docx` for table-visibility post-processing.
- Preserve TitleCase file naming and SkillForge structure.
- Keep triggers focused on markdown-to-docx intent.
