# Can these skills finish the job together?

Give the evaluator the request and inventory. Keep the checks separate until grading. Run each variation independently.

## Request and inventory

“Local only. I have scanned invoices in a PDF and need an editable workbook with the line items under their original column headings. Which installed skills can I use together? Keeping each item under the right heading matters more than speed.”

The supplied inventory is complete. Read the following four definitions as separate installed skills. Discovery does not execute them.

| Name | Documented capability |
|---|---|
| ScanRead | Scanned PDF → plain reading-order text. Discards page coordinates, rows, and column boundaries. |
| SheetBuild | Typed records with named columns → editable XLSX. Does not infer records or fields from prose. |
| InvoiceTables | Selectable-text PDF → named invoice-line records. Cannot read scanned pages. |
| ColumnScan | **Variation A** — Scanned PDF → image-only searchable PDF with a text layer; visual layout survives, but no table-structure or text-extraction compatibility is documented. **Variation B** — Scanned PDF → records conforming to SheetBuild's required field names and types, with row and column associations preserved. |

## Checks

For A, explain the missing support or unverified connection. Do not promise any pair will preserve invoice associations merely because the file types appear compatible. A conditional recommendation with a proposed sample check is valid. In B, identify ColumnScan → SheetBuild as a documented fit and distinguish that from a successfully executed conversion. Hold the task requirements and search scope constant across both runs.
