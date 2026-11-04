# MarkdownToDocx examples for review

These six one-page Word files use the same fictional library instructions. They are deliberately constructed examples for reviewing our proposed checks. They are not outputs of MarkdownToDocx and do not show whether that skill passes or fails.

Start with [the Markdown source](source.md) and [the reference document](01-reference.docx). Then compare the other documents. The reference and formatting alternative are intended acceptable examples; that judgment is still yours to review.

| Example | Intended difference | What to inspect |
|---|---|---|
| [01 Reference](01-reference.docx) | None | Content is complete, table values belong to the correct locations, and the diagram has three steps. Ordinary text and table cells are native Word content. |
| [02 Missing paragraph](02-missing-paragraph.docx) | The paragraph under Collection deadline is absent. | The user loses the 3-day deadline and the fact that a ready notice does not extend it. The file still opens normally. |
| [03 Changed table](03-changed-table.docx) | North and South book limits are swapped. | All the original words and numbers remain, but North incorrectly allows 5 books and South 2. Text presence alone would miss the wrong associations. |
| [04 Clipped diagram](04-clipped-diagram.docx) | The right side of the Ready node is cut off. | Text and table data are intact, but the diagram's last step is incomplete. |
| [05 Page image](05-page-image.docx) | The reference page content is a single image. | It looks like the reference. Try selecting a word or table cell: these are no longer editable text or cells. Rasterization also removes live hyperlink and heading semantics; those are consequences of the same defect, not independent examples. |
| [06 Valid formatting alternative](06-valid-formatting.docx) | Georgia font and different paragraph spacing. | The wording, relationships, table values, link and diagram remain. A check should accept harmless formatting changes. |

## Reference facts

- Deadline: uncollected books return to the shelf after **3 days**; a ready notice does **not** extend it.
- North desk: **2 books**, **09:00 to 12:00**.
- South desk: **5 books**, **13:00 to 17:00**.
- Mobile stop: **1 book**, **15:00 to 16:00**.
- Diagram: **Submitted → Reviewed → Ready**.
- The link label is **Pickup information** and its target is `https://example.org/pickup`. It is an intentional placeholder in fictional content; no website availability claim is made.

## Your review

1. Do the reference and formatting alternative meet the intended standard for ordinary conversion?
2. Are the four defects meaningful failures, and is each difference clear enough to judge?
3. Is anything missing from this small first set, or would any expected judgment be unfair?

If trying edits, use copies so the review fixtures remain unchanged. No need to save edits back into the supplied examples.

## What has and has not been checked

All six files opened through Microsoft Word automation and exported as single-page PDFs for visual inspection. The author inspected those renders and checked the document contents against the intended mutations. The bundled LibreOffice renderer was unavailable, so Word supplied the renders instead.

This is artifact preparation only. The proposed grading procedure has not been run or qualified, an interactive edit/save/reopen task has not been performed, and your acceptance remains pending. These examples address content, appearance and editability. They do not establish batch behavior, truthful failure reporting, output-path safety or low user effort. Those need later task-level examples.

The files were built directly with python-docx; the diagram was drawn to match the source Mermaid graph. Pandoc, Mermaid rendering and the installed MarkdownToDocx workflow were not exercised. No installed skill was changed. We stop here for your review.
