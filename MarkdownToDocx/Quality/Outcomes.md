# Agreed quality outcomes

Version: MD-O v0.1. Agreed by the skill owner on 2026-11-04. Scope: single and batch Markdown-to-DOCX conversion for people who need to read, edit and share the result. Unit: one request, with separately accountable output files in a batch.

Purpose: preserve the source's content and meaning in a usable Word document with little manual repair. Rich template authoring, rewriting the source, PDF and presentation export remain outside scope.

| ID | Expected outcome | Why it matters |
|---|---|---|
| MD-O01 | Wording, heading/list relationships, table values and associations, links, images and diagram meaning survive without silent omissions or unintended rewriting. Disclose unsupported features. | A file that opens may still mislead its reader. |
| MD-O02 | Text, tables and diagrams are legible and sensibly laid out, without clipping or overlap that impedes use. | Complete content is not useful when it cannot be read. |
| MD-O03 | The result opens as valid DOCX; ordinary text and tables remain editable. Diagrams may be images. | Users need a Word artifact they can work with, not a picture of a document. |
| MD-O04 | Requested inputs map to the intended outputs and locations; batches account for each member; source and unrelated files remain intact. | Correct conversion to the wrong place or destructive handling is not reliable delivery. |
| MD-O05 | The user can distinguish completed, failed and unchecked work per file and knows what to do next. Failure to launch Word does not erase successful conversion. | Honest completion reporting allows recovery without hiding useful results. |
| MD-O06 | Routine requests use sensible defaults, little avoidable questioning and little manual repair; outputs are easy to find and inspect. | Conversion should reduce work, not move it into cleanup. |

## Sources and tradeoffs

Existing intent supplied reliable conversion, visible tables, diagrams, explicit mapping, auto-open and actionable failure reporting. The owner explicitly accepted the expanded wording above, including basic editability and low manual repair. These are requirements and preferences, not evidence that the current implementation meets them.

Keep outcomes separate: appearance cannot compensate for missing content; fast failure is not low effort. Different fonts or spacing may be valid. Exact pixel identity, agent count and folder conformity are not quality outcomes. Acceptable time/cost thresholds have not been set.

Pandoc, automatic opening by default, focused triggering and existing naming conventions remain current constraints/design choices. Questioning their usefulness does not authorize silently replacing them.

## Challenges and revision triggers

A non-empty file can omit a paragraph; all table tokens can remain while their associations change; a readable page image can be uneditable; conversion can succeed while auto-open fails. A valid font change must not be rejected merely for looking different. Use these to challenge definitions before choosing measures.

Revisit when the owner changes purpose, supported features or tradeoffs, or a useful result is wrongly rejected or a harmful result accepted. Preserve IDs, prior definitions and reasons for changes. See [measurement scope](Measurements.md).
