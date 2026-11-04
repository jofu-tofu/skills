# Check trial results

The combined checks identified all four deliberately defective examples and accepted both intended good examples. This supports the checks on this small, known development set. It does not establish general reliability or say whether MarkdownToDocx itself works well.

| Example | Native text coverage | Table associations | Live link | Visual check | Word edit save reopen | Diagnostic result |
|---|---|---|---|---|---|---|
| Reference | Pass | Pass | Pass | Pass | Pass | Accepted |
| Missing paragraph | Fail | Pass | Pass | Pass | Pass | Missing deadline paragraph detected |
| Changed table | Pass | Fail | Pass | Pass | Pass | North and South limits swapped |
| Clipped diagram | Pass | Pass | Pass | Fail | Pass | Truncated Ready node detected visually |
| Page image | Fail | Fail | Fail | Pass | Fail | Looks right but lacks editable content and a live link |
| Valid formatting alternative | Pass | Pass | Pass | Pass | Pass | Different font and spacing accepted |

“Fail” in this table describes a requirement the example violates. Detecting that violation is the intended success of the checker. The image example's native-content failures do not mean its visible words are missing. Its extra failures are consequences of one rasterization defect, not several independent fault examples.

## What was executed

The content checker derived expectations from source.md, independently of the fixture-building code. It inspected native paragraph text, heading order, table rows and hyperlink destinations in each original DOCX. It did not choose verdicts by filename or demand identical formatting.

Microsoft Word opened each disposable copy. For the five editable examples, automation changed a word in the introduction and the North desk limit cell, saved, closed and reopened the document; both edits persisted. The page-image document opened but supplied neither an editable paragraph nor a table cell, so the editing task correctly failed. There were six completed attempts, no execution errors and no reruns. This was actual Word editing through automation, not a human UI usability test.

Visual assessment used the Word-rendered pages from preparation, with all six inspected and full-size inspection of the reference, clipping and alternative typography. The clipped diagram passed the mechanical text/table checks. Visual inspection caught it. Conversely, the page image looked acceptable but failed the editing check. These observations support retaining complementary checks rather than relying on file existence, extracted text or appearance alone.

Across the 30 C1–C5 artifact checks: 23 passed and 7 failed as expected. The six final diagnostic decisions matched the previously reviewed expectations. No percentage is presented as a deployment success rate.

## Remaining limits

- The author knew the defects. The user approved the examples and expectations, but this was not a blinded or independently repeated evaluation. The visual check remains model-assisted judgment, not a validated autonomous visual detector.
- Native text coverage checks expected text presence and heading order. It does not yet establish detection of arbitrary added material, every list-order change, semantic heading styles or all document structures. The table check covers one simple table, not merged or nested tables.
- Delivery/batch behavior, truthful conversion reporting and low user effort remain unverified: MD-O04–MD-O06 produce 18 unverified entries across six files. Testing our own file isolation does not qualify the conversion skill's delivery safety.
- The recorded Word task time was about 1.90 seconds total, excluding application startup and visual review. This is execution metadata, not evidence of low human effort. Token usage and total end-to-end time were not measured.

## Decision for review

The check set passed its narrow six-example discrimination exercise. Broader measurement qualification and all claims about MarkdownToDocx remain unverified. There is no retain/change decision for the skill. A useful next step, after user review, is a small run of the unchanged skill to reveal actual gaps, with further checker coverage where that run needs it. Fresh examples are needed before claiming transfer beyond the exposed cases.

All original examples and all six installed MarkdownToDocx files retain their starting hashes. Only disposable copies were edited. No installed skill was changed.

Evidence: [frozen plan](Plan.md), [source expectations](source-expectations.json), [content observations](content-observations.json), [Word observations](word-observations.json), [visual observations](visual-observations.json), [file isolation](isolation.json), and [canonical results](results.json).
