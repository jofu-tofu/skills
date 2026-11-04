# Example check trial v1

Authorized 2026-11-04 after the user accepted the six examples. Test the checks and return results before any MarkdownToDocx change. This is a development qualification exercise on known examples, not an independent benchmark or skill comparison.

Freeze the six original DOCX files and source by the existing construction-checks.json hashes. Preserve them. Extract expected prose, headings, numbered steps, table relationships and hyperlink target from source.md, independently of the fixture-builder module. Do not branch checker decisions on fixture names or use a reference DOCX as the truth.

Checks and rules fixed before execution:

- C1: source prose, heading sequence and list items preserved as native Word content. Report absence of native content separately from visual content; a page image does not prove its visible words are missing.
- C2: native table headers and row-to-column associations match the source, ignoring harmless formatting. A missing native table fails the native structure check, not necessarily visible table content.
- C3: link label and live destination preserved.
- C4: rendered content is readable and the Submitted → Reviewed → Ready diagram is complete. Inspect the existing Word page renders; do not use exact image matching. Record visual assessment explicitly as unblinded author judgment on human-accepted fixtures.
- C5: Word opens a disposable copy, changes one word in the introductory paragraph and the North desk limit cell, saves it, closes it and reopens it. Both modifications must survive; no new text or table may be inserted as a substitute for editing the existing content. If no native paragraph/cell exists, record a task failure. Runtime errors are unverified, not artifact failures. This is automated Word editing, not a human UI usability test.
- P1: originals and installed MarkdownToDocx files remain unchanged, checked by hashes before and after. P1 establishes test isolation only, not delivery safety of the conversion skill.

Budget: one extraction and one Word edit attempt per fixture, six total, plus one visual assessment of all six. No automated reruns; any infrastructure/checker correction is preserved as a distinct attempt/version with its reason. No installation or network access is needed.

Expected diagnostic decisions, accepted by the user through review of the examples: reference and formatting alternative have no supported failure on C1–C5; missing paragraph, wrong table association, clipped diagram and page image each have at least one relevant failure. Do not count extra correlated failures from rasterization as extra independent defect examples. Success means these six decisions match their reviewed expectations with required observations available; missing observations prevent qualification for their scope.

Record each check pass/fail/unverified with evidence. A failing artifact can be a successful detection by the checker. Keep that distinction in the report. Outcomes MD-O04–MD-O06 about conversion delivery, truthful reporting and low user effort remain unverified because these are static files, not conversion runs. No metric here proves full content fidelity, document accessibility or broad Word compatibility. Fresh and broader cases are needed before generalizing.
